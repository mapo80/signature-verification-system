using Microsoft.AspNetCore.Http;
using SignatureDetectionSdk;

namespace SignatureVerification.Api.Models;

public class DetectRequestDto
{
    public IFormFile File { get; set; } = default!;
    public bool IncludeImages { get; set; }
    public PipelineConfig? Config { get; set; }
}

