using SignatureDetectionSdk;
using SignatureVerification.Api.Services;

var builder = WebApplication.CreateBuilder(args);

var root = "/app";//Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, "..", "..", "..", ".."));
var soDir = Path.Combine(root, "sigver", "so");
var ld = Environment.GetEnvironmentVariable("LD_LIBRARY_PATH");
Environment.SetEnvironmentVariable("LD_LIBRARY_PATH", string.IsNullOrEmpty(ld) ? soDir : $"{soDir}:{ld}");

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddSingleton<SignatureDetectionService>(_ =>
{
    var basePath = Path.Combine(root, "signature-detection");
    var detrPath = Path.Combine(basePath, "conditional_detr_signature.onnx");
    var yoloPath = Path.Combine(basePath, "yolov8s.onnx");
    return new SignatureDetectionService(detrPath, yoloPath);
});

builder.Services.AddSingleton<SignatureVerificationService>(sp =>
{
    var detector = sp.GetRequiredService<SignatureDetectionService>();
    var basePath = Path.Combine(root, "sigver", "models");
    var signetPath = Path.Combine(basePath, "signet.onnx");
    var signetFPath = Path.Combine(basePath, "signet_f_lambda_0.95.onnx");
    return new SignatureVerificationService(detector, signetPath, signetFPath);
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
