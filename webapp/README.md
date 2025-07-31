# Signature Web Test App

Simple React + Vite frontend built with Ant Design to interact with the signature detection and verification API.

## Features

- **Detect tab**
  - Upload a single image via drag & drop
  - Choose the detection model (`Detr` or `Yolo`) from a dropdown
  - Optionally request cropped signature images
  - Display the JSON response
  - Show the uploaded image with bounding boxes and confidence values
  - When `includeImages=true` the cropped signatures are shown below with their confidence
- **Verify tab**
  - Two drop areas for reference and candidate signatures
  - Optional detection step with selectable model (`Detr` or `Yolo`)
  - Temperature input and threshold slider to tune verification
  - Checkbox to include preprocessed images
  - Display JSON response with a green check or red cross for `forged`
  - Show similarity value and the returned preprocessed images when requested

  **Inputs**
  - `detection` – enable signature detection before verification
  - `temperature` – scaling factor applied to distances
  - `threshold` – similarity value after calibration (default 0.001)
  - `preprocessed` – return the processed reference and candidate images

  **Output**
  - JSON response from `POST /signature/verify`
  - Tick icon when `forged` is false, cross when true
  - Displayed similarity value compared with the chosen threshold
  - When `preprocessed=true` the processed images are shown

The REST client under `src/api` is generated from `openapi.yaml` using `openapi-typescript-codegen`.

## Detection API parameters

`POST /signature/detect`

| Name | In | Type | Description |
|------|----|------|-------------|
| `file` | formData | image | Document containing one or more signatures |
| `includeImages` | query | boolean | Include cropped signatures in the response |
| `model` | query | `Detr` or `Yolo` | Detection model |

### Response

```json
{
  "signatures": [
    {
      "confidence": 0.92,
      "boundingBox": { "x1": 10, "y1": 20, "x2": 100, "y2": 80 },
      "imageData": "..." // present when includeImages=true
    }
  ]
}
```

## Development

Install dependencies and regenerate the API client:

```bash
npm install
npm run generate
```

Run the development server:

```bash
npm run dev
```

### Configuring the API base URL

The generated REST client uses the `VITE_API_BASE_URL` environment variable.
If not set, requests use a relative path, so the API must be hosted on the same
origin. When deploying the webapp separately, provide the URL before building:

```bash
VITE_API_BASE_URL="https://myserver.example" npm run build
```


## Testing

Install dependencies and Playwright browsers:

```bash
npm install --legacy-peer-deps
npx playwright install --with-deps
```

Run unit tests:

```bash
npm run test
```

Run end-to-end tests:

```bash
npm run test:e2e
```
