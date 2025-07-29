using System.Collections.Generic;

namespace SignatureVerification.Api.Models;

public class DetectResponseDto
{
    public List<SignatureDto> Signatures { get; set; } = new();
}
