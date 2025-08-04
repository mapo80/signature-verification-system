using System.Globalization;
using System.IO;
using System.Text;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.AspNetCore.Mvc.ModelBinding.Binders;
using Microsoft.Extensions.Logging.Abstractions;
using SignatureDetectionSdk;
using SignatureVerification.Api.Controllers;
using SignatureVerification.Api.ModelBinders;
using SignatureVerification.Api.Models;
using SignatureVerification.Api.Services;
using Xunit;

namespace SignatureVerification.Api.Tests;

public class ConfigBindingTests
{
    [Fact]
    public async Task JsonModelBinder_BindsFromJsonFile()
    {
        var binder = new JsonModelBinder();
        var json = "{\"enableYoloV8\":true,\"enableDetr\":false}";
        await using var stream = new MemoryStream(Encoding.UTF8.GetBytes(json));
        var formFile = new FormFile(stream, 0, stream.Length, "config", "blob")
        {
            Headers = new HeaderDictionary(),
            ContentType = "application/json"
        };
        var form = new FormCollection(new Dictionary<string, Microsoft.Extensions.Primitives.StringValues>(), new FormFileCollection { formFile });
        var httpContext = new DefaultHttpContext();
        httpContext.Features.Set<IFormFeature>(new FormFeature(form));
        var modelMetadata = new EmptyModelMetadataProvider().GetMetadataForType(typeof(PipelineConfig));
        var bindingContext = new DefaultModelBindingContext
        {
            ModelMetadata = modelMetadata,
            ModelName = "config",
            ValueProvider = new FormValueProvider(BindingSource.Form, form, CultureInfo.InvariantCulture),
            ActionContext = new Microsoft.AspNetCore.Mvc.ActionContext { HttpContext = httpContext }
        };

        await binder.BindModelAsync(bindingContext);
        var result = Assert.IsType<PipelineConfig>(bindingContext.Result.Model);
        Assert.True(result.EnableYoloV8);
        Assert.False(result.EnableDetr);
    }

    [Fact]
    public async Task Detect_UsesProvidedConfig()
    {
        var spy = new SpySignatureDetectionService();
        var root = Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, "../../../../"));
        var signet = Path.Combine(root, "sigver", "models", "signet.onnx");
        var signetF = Path.Combine(root, "sigver", "models", "signet_f_lambda_0.95.onnx");
        using var verifier = new SignatureVerificationService(spy, signet, signetF);
        var controller = new SignatureController(spy, verifier, NullLogger<SignatureController>.Instance);

        using var bmp = new SkiaSharp.SKBitmap(10, 10);
        bmp.Erase(SkiaSharp.SKColors.White);
        await using var ms = new MemoryStream();
        bmp.Encode(ms, SkiaSharp.SKEncodedImageFormat.Png, 100);
        ms.Position = 0;
        var file = new FormFile(ms, 0, ms.Length, "file", "test.png")
        {
            Headers = new HeaderDictionary(),
            ContentType = "image/png"
        };
        var config = new PipelineConfig { EnableYoloV8 = true, EnableDetr = true };
        var request = new DetectRequestDto { File = file, IncludeImages = false, Config = config };

        var response = await controller.Detect(request);
        Assert.NotNull(spy.LastConfig);
        Assert.True(spy.LastConfig!.EnableYoloV8);
        Assert.True(spy.LastConfig.EnableDetr);
    }

    private class SpySignatureDetectionService : SignatureDetectionService
    {
        public SpySignatureDetectionService() : base(string.Empty, string.Empty, NullLogger<SignatureDetectionService>.Instance) { }
        public PipelineConfig? LastConfig { get; private set; }
        public override IReadOnlyList<float[]> Predict(string imagePath, PipelineConfig? config = null)
        {
            LastConfig = config;
            return Array.Empty<float[]>();
        }
    }
}
