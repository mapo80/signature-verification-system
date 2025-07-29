using SignatureDetectionSdk;
using SignatureVerification.Api.Services;

var builder = WebApplication.CreateBuilder(args);

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


var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.MapControllers();

app.Run();

public partial class Program;
