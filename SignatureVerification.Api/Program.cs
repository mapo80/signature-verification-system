using SignatureDetectionSdk;
using SignatureVerification.Api.Services;

var builder = WebApplication.CreateBuilder(args);

var soDir = Path.GetFullPath(Path.Combine(builder.Environment.ContentRootPath, "..", "sigver", "so"));
var ld = Environment.GetEnvironmentVariable("LD_LIBRARY_PATH");
Environment.SetEnvironmentVariable("LD_LIBRARY_PATH", string.IsNullOrEmpty(ld) ? soDir : $"{soDir}:{ld}");

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddSingleton<SignatureDetectionService>(sp =>
{
    var env = sp.GetRequiredService<IHostEnvironment>();
    var basePath = Path.Combine(env.ContentRootPath, "..", "signature-detection");
    var detrPath = Path.GetFullPath(Path.Combine(basePath, "conditional_detr_signature.onnx"));
    var yoloPath = Path.GetFullPath(Path.Combine(basePath, "yolov8s.onnx"));
    return new SignatureDetectionService(detrPath, yoloPath);
});

builder.Services.AddSingleton<SignatureVerificationService>(sp =>
{
    var env = sp.GetRequiredService<IHostEnvironment>();
    var detector = sp.GetRequiredService<SignatureDetectionService>();
    var modelPath = Path.GetFullPath(Path.Combine(env.ContentRootPath, "..", "sigver", "models", "signet.onnx"));
    return new SignatureVerificationService(detector, modelPath);
});


var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.MapControllers();

app.Run();

public partial class Program;
