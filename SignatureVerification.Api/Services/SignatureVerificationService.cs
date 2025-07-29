using SigVerSdk;
using SignatureVerification.Api.Models;
using SkiaSharp;

namespace SignatureVerification.Api.Services;

public class SignatureVerificationService : IDisposable
{
    private readonly SignatureDetectionService _detector;
    private readonly SigVerifier _verifier;

    public SignatureVerificationService(SignatureDetectionService detector, string modelPath)
    {
        _detector = detector;
        _verifier = new SigVerifier(modelPath);
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
        float threshold, DetectionModel model, bool includePreprocessed)
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
                var refDet = _detector.Predict(referencePath, model).OrderByDescending(d => d[4]).First();
                tmp1 = Crop(referencePath, refDet);
                refImg = tmp1;
                var candDet = _detector.Predict(candidatePath, model).OrderByDescending(d => d[4]).First();
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
                _verifier.SavePreprocessed(refImg, pre1);
                _verifier.SavePreprocessed(candImg, pre2);
                refPre = System.IO.File.ReadAllBytes(pre1);
                candPre = System.IO.File.ReadAllBytes(pre2);
                refForFeatures = pre1;
                candForFeatures = pre2;
            }

            var refFeat = _verifier.ExtractFeatures(refForFeatures);
            var candFeat = _verifier.ExtractFeatures(candForFeatures);
            SigVerifier.Normalize(refFeat);
            SigVerifier.Normalize(candFeat);
            var dist = SigVerifier.CosineDistance(refFeat, candFeat);
            return new VerifyResponseDto
            {
                Forged = dist > threshold,
                Similarity = 1 - (float)dist,
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
        _verifier.Dispose();
    }
}
