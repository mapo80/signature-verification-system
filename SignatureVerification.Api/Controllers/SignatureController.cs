using Microsoft.AspNetCore.Mvc;
using System.Linq;
using SkiaSharp;
using SignatureDetectionSdk;
using SignatureVerification.Api.Models;
using SignatureVerification.Api.Services;

namespace SignatureVerification.Api.Controllers;

[ApiController]
[Route("[controller]")]
public class SignatureController : ControllerBase
{
    private readonly SignatureDetectionService _detector;
    private readonly SignatureVerificationService _verifier;

    public SignatureController(SignatureDetectionService detector, SignatureVerificationService verifier)
    {
        _detector = detector;
        _verifier = verifier;
    }

    [HttpPost("detect")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<DetectResponseDto>> Detect(
        IFormFile file,
        [FromQuery] bool includeImages = false,
        [FromQuery] PipelineConfig? config = null)
    {
        var tempFile = Path.GetTempFileName();
        await using (var stream = System.IO.File.Create(tempFile))
        {
            await file.CopyToAsync(stream);
        }

        try
        {
            var predictions = _detector.Predict(tempFile, config);
            using var image = SKBitmap.Decode(tempFile);
            var response = new DetectResponseDto
            {
                Signatures = predictions.Select(p =>
                {
                    var dto = new SignatureDto
                    {
                        Confidence = p[4],
                        BoundingBox = new BoundingBoxDto
                        {
                            X1 = p[0],
                            Y1 = p[1],
                            X2 = p[2],
                            Y2 = p[3]
                        }
                    };
                    if (includeImages)
                    {
                        var rect = SKRectI.Create(
                            (int)MathF.Max(0, p[0]),
                            (int)MathF.Max(0, p[1]),
                            (int)MathF.Max(0, p[2] - p[0]),
                            (int)MathF.Max(0, p[3] - p[1]));
                        using var subset = new SKBitmap(rect.Width, rect.Height);
                        image.ExtractSubset(subset, rect);
                        using var data = subset.Encode(SKEncodedImageFormat.Png, 100);
                        dto.ImageData = data.ToArray();
                    }
                    return dto;
                }).ToList()
            };
            return Ok(response);
        }
        catch (Exception ex)
        {
            return Problem(ex.Message);
        }
        finally
        {
            System.IO.File.Delete(tempFile);
        }
    }

    [HttpPost("verify")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<VerifyResponseDto>> Verify(
        IFormFile reference,
        IFormFile candidate,
        [FromQuery] bool detection = false,
        [FromQuery] float temperature = 1.008f,
        [FromQuery] float threshold = 0.0010f,
        [FromQuery] bool preprocessed = false,
        [FromQuery] PipelineConfig? config = null)
    {
        var refFile = Path.GetTempFileName();
        var candFile = Path.GetTempFileName();
        await using (var stream = System.IO.File.Create(refFile))
        {
            await reference.CopyToAsync(stream);
        }
        await using (var stream = System.IO.File.Create(candFile))
        {
            await candidate.CopyToAsync(stream);
        }

        try
        {
            var result = _verifier.Verify(refFile, candFile, detection, temperature, threshold, preprocessed, config);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return Problem(ex.Message);
        }
        finally
        {
            System.IO.File.Delete(refFile);
            System.IO.File.Delete(candFile);
        }
    }
}
