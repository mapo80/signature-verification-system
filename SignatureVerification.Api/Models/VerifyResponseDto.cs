namespace SignatureVerification.Api.Models;

public class VerifyResponseDto
{
    public bool Forged { get; set; }
    public float Similarity { get; set; }
    public byte[]? ReferenceImage { get; set; }
    public byte[]? CandidateImage { get; set; }
}
