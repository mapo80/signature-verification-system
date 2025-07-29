# Signature Verification System

This repository contains a minimal ASP.NET Core 9 Web API that exposes a signature detection endpoint. The API relies on the `SignatureDetectionSdk` contained in the `signature-detection` submodule. A small integration test project is provided.

## Requirements
* .NET SDK 9.0.303
* The `conditional_detr_signature.onnx` model (recombined from the split parts) and the `yolov8s.onnx` model contained in `signature-detection`

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
