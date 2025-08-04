using SigVerSdk;
using SignatureDetectionSdk;
using SignatureVerification.Api.Models;
using SkiaSharp;

namespace SignatureVerification.Api.Services;

public class SignatureVerificationService : IDisposable
{
    private readonly SignatureDetectionService _detector;
    private readonly SigVerifier _signet;
    private readonly SigVerifier _signetF;

    public SignatureVerificationService(SignatureDetectionService detector, string signetPath, string signetFPath)
    {
        _detector = detector;
        _signet = new SigVerifier(signetPath);
        _signetF = new SigVerifier(signetFPath);
    }

    private static string Crop(string imagePath, float[] bbox)
    {
        using var bmp = SKBitmap.Decode(imagePath);
        var rect = SKRectI.Create(
            (int)MathF.Max(0, bbox[0]),
            (int)MathF.Max(0, bbox[1]),
            (int)MathF.Max(0, bbox[2] - bbox[0]),
            (int)MathF.Max(0, bbox[3] - bbox[1]));
        using var subset = new SKBitmap(rect.Width, rect.Height);
        bmp.ExtractSubset(subset, rect);
        using var data = subset.Encode(SKEncodedImageFormat.Png, 100);
        var temp = Path.GetTempFileName();
        System.IO.File.WriteAllBytes(temp, data.ToArray());
        return temp;
    }

    public VerifyResponseDto Verify(string referencePath, string candidatePath, bool detection,
        float temperature, float threshold, bool includePreprocessed, PipelineConfig? config = null)
    {
        string refImg = referencePath;
        string candImg = candidatePath;
        string? tmp1 = null;
        string? tmp2 = null;
        string? pre1 = null;
        string? pre2 = null;
        try
        {
            if (detection)
            {
                var cfg = config ?? new PipelineConfig();
                var refDets = _detector.Predict(referencePath, cfg);
                var candDets = _detector.Predict(candidatePath, cfg);

                if (refDets.Count == 0 || candDets.Count == 0)
                {
                    return new VerifyResponseDto
                    {
                        Forged = false,
                        Similarity = 0,
                        ReferenceImage = null,
                        CandidateImage = null
                    };
                }

                var refDet = refDets.OrderByDescending(d => d[4]).First();
                tmp1 = Crop(referencePath, refDet);
                refImg = tmp1;
                var candDet = candDets.OrderByDescending(d => d[4]).First();
                tmp2 = Crop(candidatePath, candDet);
                candImg = tmp2;
            }

            byte[]? refPre = null;
            byte[]? candPre = null;
            string refForFeatures = refImg;
            string candForFeatures = candImg;
            if (includePreprocessed)
            {
                pre1 = Path.ChangeExtension(Path.GetTempFileName(), ".png");
                pre2 = Path.ChangeExtension(Path.GetTempFileName(), ".png");
                _signet.SavePreprocessed(refImg, pre1);
                _signet.SavePreprocessed(candImg, pre2);
                refPre = System.IO.File.ReadAllBytes(pre1);
                candPre = System.IO.File.ReadAllBytes(pre2);
                refForFeatures = pre1;
                candForFeatures = pre2;
            }

            var refFeat1 = _signet.ExtractFeatures(refForFeatures);
            var candFeat1 = _signet.ExtractFeatures(candForFeatures);
            SigVerifier.Normalize(refFeat1);
            SigVerifier.Normalize(candFeat1);
            var d1 = (float)SigVerifier.CosineDistance(refFeat1, candFeat1);

            var refFeat2 = _signetF.ExtractFeatures(refForFeatures);
            var candFeat2 = _signetF.ExtractFeatures(candForFeatures);
            SigVerifier.Normalize(refFeat2);
            SigVerifier.Normalize(candFeat2);
            var d2 = (float)SigVerifier.CosineDistance(refFeat2, candFeat2);

            var sMin = MathF.Min(d1, d2);
            var sCal = sMin / temperature;

            return new VerifyResponseDto
            {
                Forged = sCal > threshold,
                Similarity = 1 - sCal,
                ReferenceImage = refPre,
                CandidateImage = candPre
            };
        }
        finally
        {
            if (tmp1 != null) System.IO.File.Delete(tmp1);
            if (tmp2 != null) System.IO.File.Delete(tmp2);
            if (pre1 != null) System.IO.File.Delete(pre1);
            if (pre2 != null) System.IO.File.Delete(pre2);
        }
    }

    public void Dispose()
    {
        _signet.Dispose();
        _signetF.Dispose();
    }
}
