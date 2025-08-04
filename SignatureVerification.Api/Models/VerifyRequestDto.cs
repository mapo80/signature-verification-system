using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SignatureDetectionSdk;
using SignatureVerification.Api.ModelBinders;

namespace SignatureVerification.Api.Models;

public class VerifyRequestDto
{
    public IFormFile Reference { get; set; } = default!;
    public IFormFile Candidate { get; set; } = default!;
    public bool Detection { get; set; }
    public float Temperature { get; set; } = 1.008f;
    public float Threshold { get; set; } = 0.0010f;
    public bool Preprocessed { get; set; }
    [ModelBinder(BinderType = typeof(JsonModelBinder))]
    public PipelineConfig? Config { get; set; }
}

