using System.Net.Http.Headers;
using System.IO;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace SignatureVerification.Api.Tests;

public class IntegrationTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public IntegrationTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
    }

    [Theory]
    [InlineData("detr", false)]
    [InlineData("yolo", true)]
    public async Task DetectEndpoint_ReturnsDetections(string model, bool includeImages)
    {
        using var client = _factory.CreateClient();
        var root = Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, "../../../../"));
        var imagePath = Path.Combine(root, "signature-detection", "dataset", "dataset1", "images", "00101001_png_jpg.rf.27db3f0cbf1a1ef078dcca2fdc2874af.jpg");
        await using var fs = File.OpenRead(imagePath);
        using var content = new MultipartFormDataContent();
        var fileContent = new StreamContent(fs);
        fileContent.Headers.ContentType = new MediaTypeHeaderValue("image/jpeg");
        content.Add(fileContent, "file", Path.GetFileName(imagePath));
        var response = await client.PostAsync($"/signature/detect?model={model}&includeImages={includeImages}", content);
        var body = await response.Content.ReadAsStringAsync();
        if (response.IsSuccessStatusCode)
        {
            Assert.False(string.IsNullOrWhiteSpace(body));
        }
        else
        {
            Assert.Contains("Nessuna signature identificata", body);
        }
    }

    [Fact]
    public async Task DetectEndpoint_ReturnsErrorWhenNoSignatures()
    {
        using var client = _factory.CreateClient();

        using var bmp = new SkiaSharp.SKBitmap(640, 640);
        bmp.Erase(SkiaSharp.SKColors.White);
        using var ms = new MemoryStream();
        bmp.Encode(ms, SkiaSharp.SKEncodedImageFormat.Jpeg, 100);
        ms.Position = 0;

        using var content = new MultipartFormDataContent();
        var fileContent = new StreamContent(ms);
        fileContent.Headers.ContentType = new MediaTypeHeaderValue("image/jpeg");
        content.Add(fileContent, "file", "blank.jpg");

        var response = await client.PostAsync("/signature/detect", content);
        Assert.Equal(System.Net.HttpStatusCode.InternalServerError, response.StatusCode);
        var body = await response.Content.ReadAsStringAsync();
        Assert.Contains("Nessuna signature identificata", body);
    }

    public static IEnumerable<object[]> GetDatasetImages()
    {
        var root = Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, "../../../../"));
        foreach (var dataset in new[] { "dataset1", "dataset2" })
        {
            var imagesDir = Path.Combine(root, "signature-detection", "dataset", dataset, "images");
            foreach (var file in Directory.EnumerateFiles(imagesDir).Take(10))
            {
                yield return new object[] { "detr", file };
                yield return new object[] { "yolo", file };
            }
        }
    }

    [Theory]
    [MemberData(nameof(GetDatasetImages))]
    public async Task DetectEndpoint_WorksForDatasetImages(string model, string imagePath)
    {
        using var client = _factory.CreateClient();
        await using var fs = File.OpenRead(imagePath);
        using var content = new MultipartFormDataContent();
        var fileContent = new StreamContent(fs);
        fileContent.Headers.ContentType = new MediaTypeHeaderValue("image/jpeg");
        content.Add(fileContent, "file", Path.GetFileName(imagePath));

        var response = await client.PostAsync($"/signature/detect?model={model}", content);
        var body = await response.Content.ReadAsStringAsync();
        if (response.IsSuccessStatusCode)
        {
            Assert.False(string.IsNullOrWhiteSpace(body));
        }
        else
        {
            Assert.Contains("Nessuna signature identificata", body);
        }
    }

    [Theory]
    [InlineData(false)]
    [InlineData(true)]
    public async Task VerifyEndpoint_SameImageReturnsFalse(bool detection)
    {
        using var client = _factory.CreateClient();
        var root = Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, "../../../../"));
        var imagePath = Path.Combine(root, "signature-detection", "dataset", "dataset1", "images", "00101001_png_jpg.rf.27db3f0cbf1a1ef078dcca2fdc2874af.jpg");
        await using var fs1 = File.OpenRead(imagePath);
        await using var fs2 = File.OpenRead(imagePath);
        using var content = new MultipartFormDataContent();
        var c1 = new StreamContent(fs1); c1.Headers.ContentType = new MediaTypeHeaderValue("image/jpeg");
        var c2 = new StreamContent(fs2); c2.Headers.ContentType = new MediaTypeHeaderValue("image/jpeg");
        content.Add(c1, "reference", Path.GetFileName(imagePath));
        content.Add(c2, "candidate", Path.GetFileName(imagePath));
        var response = await client.PostAsync($"/signature/verify?detection={detection}&preprocessed=true", content);
        var json = await response.Content.ReadAsStringAsync();
        Assert.Equal(System.Net.HttpStatusCode.OK, response.StatusCode);
        var dto = System.Text.Json.JsonSerializer.Deserialize<VerifyResponse>(json, new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        Assert.NotNull(dto);
        Assert.False(dto!.Forged);
        Assert.NotNull(dto.ReferenceImage);
        Assert.NotNull(dto.CandidateImage);
        Assert.InRange(dto.Similarity, 0.0, 1.01);
    }

    [Fact]
    public async Task VerifyEndpoint_DifferentImagesReturnsTrue()
    {
        using var client = _factory.CreateClient();
        var root = Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, "../../../../"));
        var img1 = Path.Combine(root, "signature-detection", "dataset", "dataset1", "images", "00101001_png_jpg.rf.27db3f0cbf1a1ef078dcca2fdc2874af.jpg");
        var img2 = Path.Combine(root, "signature-detection", "dataset", "dataset1", "images", "00101027_png_jpg.rf.a92770147b74d58b15829954bbba6ac6.jpg");
        await using var fs1 = File.OpenRead(img1);
        await using var fs2 = File.OpenRead(img2);
        using var content = new MultipartFormDataContent();
        var c1 = new StreamContent(fs1); c1.Headers.ContentType = new MediaTypeHeaderValue("image/jpeg");
        var c2 = new StreamContent(fs2); c2.Headers.ContentType = new MediaTypeHeaderValue("image/jpeg");
        content.Add(c1, "reference", Path.GetFileName(img1));
        content.Add(c2, "candidate", Path.GetFileName(img2));
        var response = await client.PostAsync("/signature/verify?threshold=0", content);
        var json = await response.Content.ReadAsStringAsync();
        Assert.Equal(System.Net.HttpStatusCode.OK, response.StatusCode);
        var dto = System.Text.Json.JsonSerializer.Deserialize<VerifyResponse>(json, new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        Assert.NotNull(dto);
        Assert.True(dto!.Forged);
    }

    public static IEnumerable<object[]> DatasetGenuineForgedPairs()
    {
        var root = Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, "../../../.."));
        yield return new object[]
        {
            Path.Combine(root, "sigver", "data", "001", "001_01.PNG"),
            Path.Combine(root, "sigver", "data", "001_forg", "0119001_01.png")
        };
        yield return new object[]
        {
            Path.Combine(root, "sigver", "data", "002", "002_09.PNG"),
            Path.Combine(root, "sigver", "data", "002_forg", "0108002_03.png")
        };
    }

    public static IEnumerable<object[]> DatasetGenuinePairs()
    {
        var root = Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, "../../../.."));
        yield return new object[]
        {
            Path.Combine(root, "sigver", "data", "002", "002_01.PNG"),
            Path.Combine(root, "sigver", "data", "002", "002_13.PNG")
        };
        yield return new object[]
        {
            Path.Combine(root, "sigver", "data", "001", "001_19.PNG"),
            Path.Combine(root, "sigver", "data", "001", "001_09.PNG")
        };
    }

    [Theory]
    [MemberData(nameof(DatasetGenuineForgedPairs))]
    public async Task VerifyEndpoint_GenuineForgedPairs_ReturnForged(string referencePath, string forgedPath)
    {
        using var client = _factory.CreateClient();
        await using var fs1 = File.OpenRead(referencePath);
        await using var fs2 = File.OpenRead(forgedPath);
        using var content = new MultipartFormDataContent();
        var c1 = new StreamContent(fs1); c1.Headers.ContentType = new MediaTypeHeaderValue("image/png");
        var c2 = new StreamContent(fs2); c2.Headers.ContentType = new MediaTypeHeaderValue("image/png");
        content.Add(c1, "reference", Path.GetFileName(referencePath));
        content.Add(c2, "candidate", Path.GetFileName(forgedPath));
        var sw = System.Diagnostics.Stopwatch.StartNew();
        var response = await client.PostAsync("/signature/verify?threshold=0", content);
        sw.Stop();
        var json = await response.Content.ReadAsStringAsync();
        Assert.Equal(System.Net.HttpStatusCode.OK, response.StatusCode);
        var dto = System.Text.Json.JsonSerializer.Deserialize<VerifyResponse>(json, new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        Assert.NotNull(dto);
        Assert.True(dto!.Forged);
        Console.WriteLine($"{Path.GetFileName(referencePath)} vs {Path.GetFileName(forgedPath)} -> forged={dto.Forged} time={sw.ElapsedMilliseconds}ms");
    }

    [Theory]
    [MemberData(nameof(DatasetGenuinePairs))]
    public async Task VerifyEndpoint_GenuinePairs_ReturnNotForged(string referencePath, string candidatePath)
    {
        using var client = _factory.CreateClient();
        await using var fs1 = File.OpenRead(referencePath);
        await using var fs2 = File.OpenRead(candidatePath);
        using var content = new MultipartFormDataContent();
        var c1 = new StreamContent(fs1); c1.Headers.ContentType = new MediaTypeHeaderValue("image/png");
        var c2 = new StreamContent(fs2); c2.Headers.ContentType = new MediaTypeHeaderValue("image/png");
        content.Add(c1, "reference", Path.GetFileName(referencePath));
        content.Add(c2, "candidate", Path.GetFileName(candidatePath));
        var sw = System.Diagnostics.Stopwatch.StartNew();
        var response = await client.PostAsync("/signature/verify?threshold=1", content);
        sw.Stop();
        var json = await response.Content.ReadAsStringAsync();
        Assert.Equal(System.Net.HttpStatusCode.OK, response.StatusCode);
        var dto = System.Text.Json.JsonSerializer.Deserialize<VerifyResponse>(json, new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        Assert.NotNull(dto);
        Assert.False(dto!.Forged);
        Console.WriteLine($"{Path.GetFileName(referencePath)} vs {Path.GetFileName(candidatePath)} -> forged={dto.Forged} time={sw.ElapsedMilliseconds}ms");
    }
}

public class VerifyResponse
{
    public bool Forged { get; set; }
    public float Similarity { get; set; }
    public byte[]? ReferenceImage { get; set; }
    public byte[]? CandidateImage { get; set; }
}
