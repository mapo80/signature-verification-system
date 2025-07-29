namespace SignatureVerification.Api.Models;

public class SignatureDto
{
    public float Confidence { get; set; }
    public BoundingBoxDto BoundingBox { get; set; } = new();
    public byte[]? ImageData { get; set; }
}
