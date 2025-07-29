# Signature Verification System

This repository contains a minimal ASP.NET Core 9 Web API that exposes endpoints for detecting and verifying handwritten signatures. The API relies on the `SignatureDetectionSdk` and `SigVerSdk` submodules. A small integration test project is provided.

## Requirements
* .NET SDK 9.0.303
* The `conditional_detr_signature.onnx` model (recombined from the split parts) and the `yolov8s.onnx` model contained in `signature-detection`
* The `signet.onnx` verification model available in `sigver/models`

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

The service exposes a `POST /signature/detect` endpoint accepting an image file as form data. Two query parameters control the response:

* `includeImages` - when `true`, each detection includes the cropped signature image
* `model` - choose `detr` (default) or `yolo` to select the detection model

The endpoint returns the detected signatures with confidence and bounding box coordinates.
If no signatures are detected the service responds with the message `"Nessuna signature identificata"`.

### Example request

```bash
curl -X POST \
     "http://localhost:5000/signature/detect?model=detr&includeImages=true" \
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
  both images using the DETR model (default is `false`)
* `threshold` – similarity threshold (default `0.35`)
* `model` – detection model used when `detection=true` (`detr` or `yolo`)
* `preprocessed` – include the preprocessed signatures returned by `SigVerSdk`

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
is the cosine similarity between the signatures (1 means identical). When
`preprocessed=true` the response also includes the PNG bytes of the signatures
after preprocessing.

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
