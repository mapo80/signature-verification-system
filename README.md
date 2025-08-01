# Signature Verification System

This repository contains a minimal ASP.NET Core 9 Web API that exposes endpoints for detecting and verifying handwritten signatures. The API relies on the `SignatureDetectionSdk` and `SigVerSdk` submodules. A small integration test project is provided.

Clone the repository including the submodules so the SDK projects and sample
datasets are available:

```bash
git clone --recurse-submodules <repository-url>
# or, if you already cloned it
git submodule update --init --recursive
```

## Requirements
* .NET SDK 9.0.303
* The `conditional_detr_signature.onnx` model (recombined from the split parts) and the `yolov8s.onnx` model contained in `signature-detection`
* The `signet.onnx` verification model available in `sigver/models`
* On Ubuntu you also need the native dependencies required by `libOpenCvSharpExtern.so`:
  `libgtk2.0-0 libgdk-pixbuf2.0-0 libtesseract5 libdc1394-25 libavcodec60 \
  libavformat60 libswscale7 libsm6 libxext6 libxrender1 libgomp1`

Install the correct .NET SDK locally with the included script and add it to the `PATH`:

```bash
./dotnet-install.sh --version 9.0.303 --install-dir "$HOME/.dotnet"
export PATH="$HOME/.dotnet:$PATH"
```

Recombine the DETR model before building or testing:

```bash
cd signature-detection
cat conditional_detr_signature.onnx_parte_{1,2} > conditional_detr_signature.onnx
```

## Building and Testing

Make sure the git submodules are present so the SDK projects and datasets can be referenced:

```bash
git submodule update --init --recursive
```

Restore packages, build the solution and run the integration tests:

```bash
dotnet build SignatureVerification.sln -c Release
dotnet test SignatureVerification.sln -c Release
```

## Running the API

Execute the API project from the repository root:

```bash
dotnet run --project SignatureVerification.Api
```

The service exposes a `POST /signature/detect` endpoint accepting an image file as form data. Query parameters map directly to the fields of the `PipelineConfig` record so all detection options can be tuned. The optional `includeImages` flag controls whether each detection also contains the cropped signature image.

The endpoint returns the detected signatures with confidence and bounding box coordinates.
If no signatures are detected the service responds with the message `"Nessuna signature identificata"`.

### Example request

```bash
curl -X POST \
     "http://localhost:5000/signature/detect?EnableYoloV8=false&EnableDetr=true&includeImages=true" \
     -F "file=@path/to/document.jpg"
```

### Response DTO

```json
{
  "signatures": [
    {
      "confidence": 0.92,
      "boundingBox": {
        "x1": 10.5,
        "y1": 20.1,
        "x2": 100.2,
        "y2": 80.0
      },
      "imageData": "iVBORw0KGgo..."
    }
  ]
}
```
The `imageData` field is included only when `includeImages=true`.
Each signature object has:

* `confidence` - detection probability
* `boundingBox` - the float coordinates `{x1,y1,x2,y2}` in pixels
* `imageData` - PNG bytes of the cropped signature when requested

When running in development a Swagger UI is available at `/swagger`.

## Verification endpoint

The API also exposes a `POST /signature/verify` endpoint that compares two images
containing signatures. It uses the `SigVerSdk` to compute the similarity between
the reference signature and the candidate one.

The request accepts two files as form data:

* `reference` – image of the known signature
* `candidate` – image to compare

Query parameters:

* `detection` – when `true` the service first detects and crops the signature in
  both images (default is `false`)
* `temperature` – temperature scaling factor (default `1.008`)
* `threshold` – similarity threshold after calibration (default `0.0010`)
* `preprocessed` – include the preprocessed signatures returned by `SigVerSdk`
* any `PipelineConfig` field – optional parameters used during detection when
  `detection=true`

The response contains:

```json
{
  "forged": false,
  "similarity": 0.92,
  "referenceImage": "iVBORw0KGgo...", // optional when preprocessed=true
  "candidateImage": "iVBORw0KGgo..."  // optional when preprocessed=true
}
```

`forged` indicates whether the candidate is considered a forgery. `similarity`
is `1 – s_cal`, i.e. one minus the calibrated distance between the signatures
(1 means identical). When `preprocessed=true` the response also includes the
PNG bytes of the signatures after preprocessing.

### Integration test results

The integration test suite exercises the API using a few sample pairs from the
`sigver` dataset. The tests confirm that forged signatures are detected and that
genuine pairs are accepted.

| Pair type | Reference | Candidate | Forged |
|-----------|-----------|-----------|-------|
| Genuine vs forged | `001_01.PNG` | `0119001_01.png` | ✅ |
| Genuine vs forged | `002_09.PNG` | `0108002_03.png` | ✅ |
| Genuine vs genuine | `002_01.PNG` | `002_13.PNG` | ✅ |
| Genuine vs genuine | `001_19.PNG` | `001_09.PNG` | ✅ |

The [sigver README](sigver/README.md) reports the same outcome when verifying a
larger random sample (30 forged and 30 genuine pairs) with an average time of
about 19 ms for forgeries and 22 ms for genuine signatures.

### Web UI test

The `webapp` folder contains an end-to-end Playwright test that exercises the full detection flow. It uploads a sample image, waits for the loading spinner and finally verifies the mocked response.

![Detection screenshot](webapp/docs/detect_full.png)

<video src="webapp/docs/detect_demo.mp4" controls></video>

The web UI also includes a **Verify** tab where you can compare two signatures. Provide a reference and a candidate image, optionally enable detection, adjust the similarity threshold and decide whether to return the preprocessed signatures. The result shows a green check or red cross according to the `forged` field, the similarity value and, when requested, the processed images.

![Verify screenshot](webapp/docs/verify_full.png)

<video src="webapp/docs/verify_demo.mp4" controls></video>
