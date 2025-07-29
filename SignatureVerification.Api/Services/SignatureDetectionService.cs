using SignatureDetectionSdk;
using SignatureVerification.Api.Models;
using SignatureVerification.Api.Exceptions;

namespace SignatureVerification.Api.Services;

public class SignatureDetectionService
{
    private readonly SignatureDetector _detr;
    private readonly YoloV8Detector _yolo;

    public SignatureDetectionService(string detrModelPath, string yoloModelPath)
    {
        _detr = new SignatureDetector(detrModelPath);
        _yolo = new YoloV8Detector(yoloModelPath);
    }

    public IReadOnlyList<float[]> Predict(string imagePath, DetectionModel model)
    {
        var dets = model == DetectionModel.Yolo ?
            _yolo.Predict(imagePath) :
            _detr.Predict(imagePath);

        if (dets.Length == 0)
            throw new SignatureNotFoundException();

        return dets;
    }
}
