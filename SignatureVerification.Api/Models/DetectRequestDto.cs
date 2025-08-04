using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SignatureDetectionSdk;
using SignatureVerification.Api.ModelBinders;

namespace SignatureVerification.Api.Models;

public class DetectRequestDto
{
    public IFormFile File { get; set; } = default!;
    public bool IncludeImages { get; set; }
    [ModelBinder(BinderType = typeof(JsonModelBinder))]
    public PipelineConfig? Config { get; set; }
}

