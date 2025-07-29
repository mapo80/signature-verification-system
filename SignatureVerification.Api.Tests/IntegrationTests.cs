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
}
