using Microsoft.AspNetCore.Mvc;
using SkiaSharp;
using SignatureVerification.Api.Models;
using SignatureVerification.Api.Services;

namespace SignatureVerification.Api.Controllers;

[ApiController]
[Route("[controller]")]
public class SignatureController : ControllerBase
{
    private readonly SignatureDetectionService _service;

    public SignatureController(SignatureDetectionService service)
    {
        _service = service;
    }

    [HttpPost("detect")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<DetectResponseDto>> Detect(
        IFormFile file,
        [FromQuery] bool includeImages = false,
        [FromQuery] DetectionModel model = DetectionModel.Detr)
    {
        var tempFile = Path.GetTempFileName();
        await using (var stream = System.IO.File.Create(tempFile))
        {
            await file.CopyToAsync(stream);
        }

        try
        {
            var predictions = _service.Predict(tempFile, model);
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
}
