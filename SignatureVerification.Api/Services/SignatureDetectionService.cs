using Microsoft.Extensions.Logging;
using SignatureDetectionSdk;

namespace SignatureVerification.Api.Services;

public class SignatureDetectionService
{
    private readonly string _detrModelPath;
    private readonly string _yoloModelPath;
    private readonly string? _datasetDir;
    private readonly ILogger<SignatureDetectionService> _logger;

    public SignatureDetectionService(string detrModelPath, string yoloModelPath, ILogger<SignatureDetectionService> logger, string? datasetDir = null)
    {
        _detrModelPath = detrModelPath;
        _yoloModelPath = yoloModelPath;
        _datasetDir = datasetDir;
        _logger = logger;
    }

    public virtual IReadOnlyList<float[]> Predict(string imagePath, PipelineConfig? config = null)
    {
        using var pipeline = new DetectionPipeline(_detrModelPath, _yoloModelPath, config, _datasetDir);
        var dets = pipeline.Detect(imagePath);

        if (dets.Length == 0)
        {
            _logger.LogWarning("No signatures detected in {ImagePath}", imagePath);
            return Array.Empty<float[]>();
        }

        _logger.LogInformation("Detected {Count} signatures in {ImagePath}", dets.Length, imagePath);
        return dets;
    }
}
