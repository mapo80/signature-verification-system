using SignatureDetectionSdk;
using SignatureVerification.Api.Services;

var builder = WebApplication.CreateBuilder(args);

var soDir = Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, "..", "sigver", "so"));
var ld = Environment.GetEnvironmentVariable("LD_LIBRARY_PATH");
Environment.SetEnvironmentVariable("LD_LIBRARY_PATH", string.IsNullOrEmpty(ld) ? soDir : $"{soDir}:{ld}");

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddSingleton<SignatureDetectionService>(_ =>
{
    var basePath = Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, "..", "signature-detection"));
    var detrPath = Path.Combine(basePath, "conditional_detr_signature.onnx");
    var yoloPath = Path.Combine(basePath, "yolov8s.onnx");
    return new SignatureDetectionService(detrPath, yoloPath);
});

builder.Services.AddSingleton<SignatureVerificationService>(sp =>
{
    var detector = sp.GetRequiredService<SignatureDetectionService>();
    var modelPath = Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, "..", "sigver", "models", "signet.onnx"));
    return new SignatureVerificationService(detector, modelPath);
});


var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseDefaultFiles();
app.UseStaticFiles();

app.MapControllers();

app.Run();

public partial class Program;
