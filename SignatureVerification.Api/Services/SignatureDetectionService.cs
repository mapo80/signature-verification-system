using SignatureDetectionSdk;
using SignatureVerification.Api.Exceptions;

namespace SignatureVerification.Api.Services;

public class SignatureDetectionService
{
    private readonly string _detrModelPath;
    private readonly string _yoloModelPath;
    private readonly string? _datasetDir;

    public SignatureDetectionService(string detrModelPath, string yoloModelPath, string? datasetDir = null)
    {
        _detrModelPath = detrModelPath;
        _yoloModelPath = yoloModelPath;
        _datasetDir = datasetDir;
    }

    public IReadOnlyList<float[]> Predict(string imagePath, PipelineConfig? config = null)
    {
        using var pipeline = new DetectionPipeline(_detrModelPath, _yoloModelPath, config, _datasetDir);
        var dets = pipeline.Detect(imagePath);

        if (dets.Length == 0)
            throw new SignatureNotFoundException();

        return dets;
    }
}
