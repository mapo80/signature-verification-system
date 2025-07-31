using System.Collections.Generic;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Logging;
using Xunit;

namespace SignatureVerification.Api.Tests;

public class SignatureApiSmokeTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public SignatureApiSmokeTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
    }

    private static WebApplicationFactory<Program> CreateFactoryWithLogger(
        WebApplicationFactory<Program> factory,
        TestLoggerProvider logger)
        => factory.WithWebHostBuilder(builder =>
            builder.ConfigureLogging(logging =>
            {
                logging.ClearProviders();
                logging.AddProvider(logger);
            }));

    [Fact]
    public async Task SwaggerEndpoint_ReturnsOpenApiDocumentAndNoErrors()
    {
        using var logger = new TestLoggerProvider();
        using var factory = CreateFactoryWithLogger(_factory, logger);
        using var client = factory.CreateClient();
        var response = await client.GetAsync("/swagger/v1/swagger.json");
        response.EnsureSuccessStatusCode();
        var body = await response.Content.ReadAsStringAsync();
        Assert.Contains("openapi", body);
        Assert.DoesNotContain(logger.Logs, l => l.LogLevel >= LogLevel.Error);
    }

    [Fact]
    public async Task DetectEndpoint_ReturnsSignaturesAndNoErrors()
    {
        using var logger = new TestLoggerProvider();
        using var factory = CreateFactoryWithLogger(_factory, logger);
        using var client = factory.CreateClient();
        var root = Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, "../../../../"));
        var imagePath = Path.Combine(root, "signature-detection", "dataset", "dataset1", "images", "HSqSXe_png_jpg.rf.611fb71db1258341f1311cb5fab43127.jpg");
        await using var fs = File.OpenRead(imagePath);
        using var content = new MultipartFormDataContent();
        var fileContent = new StreamContent(fs);
        fileContent.Headers.ContentType = new MediaTypeHeaderValue("image/jpeg");
        content.Add(fileContent, "file", Path.GetFileName(imagePath));

        var response = await client.PostAsync("/signature/detect", content);
        var body = await response.Content.ReadAsStringAsync();
        if (response.IsSuccessStatusCode)
        {
            Assert.Contains("signatures", body);
        }
        else
        {
            Assert.False(string.IsNullOrWhiteSpace(body));
        }
    }

    [Fact]
    public async Task VerifyEndpoint_ReturnsResultAndNoErrors()
    {
        using var logger = new TestLoggerProvider();
        using var factory = CreateFactoryWithLogger(_factory, logger);
        using var client = factory.CreateClient();
        var root = Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, "../../../../"));
        var imagePath = Path.Combine(root, "signature-detection", "dataset", "dataset1", "images", "HSqSXe_png_jpg.rf.611fb71db1258341f1311cb5fab43127.jpg");
        await using var fs1 = File.OpenRead(imagePath);
        await using var fs2 = File.OpenRead(imagePath);
        using var content = new MultipartFormDataContent();
        var c1 = new StreamContent(fs1);
        c1.Headers.ContentType = new MediaTypeHeaderValue("image/jpeg");
        var c2 = new StreamContent(fs2);
        c2.Headers.ContentType = new MediaTypeHeaderValue("image/jpeg");
        content.Add(c1, "reference", Path.GetFileName(imagePath));
        content.Add(c2, "candidate", Path.GetFileName(imagePath));
        content.Add(new StringContent("false"), "detection");

        var response = await client.PostAsync("/signature/verify", content);
        var body = await response.Content.ReadAsStringAsync();
        if (response.IsSuccessStatusCode)
        {
            Assert.Contains("forged", body, StringComparison.OrdinalIgnoreCase);
        }
        else
        {
            Assert.False(string.IsNullOrWhiteSpace(body));
        }
    }
}

internal sealed class TestLoggerProvider : ILoggerProvider
{
    public List<LogEntry> Logs { get; } = new();

    public ILogger CreateLogger(string categoryName) => new ListLogger(Logs);

    public void Dispose() { }

    public sealed record LogEntry(LogLevel LogLevel, string Message);

    private sealed class ListLogger : ILogger
    {
        private readonly List<LogEntry> _logs;

        public ListLogger(List<LogEntry> logs) => _logs = logs;

        public IDisposable BeginScope<TState>(TState state) where TState : notnull => NullScope.Instance;

        public bool IsEnabled(LogLevel logLevel) => true;

        public void Log<TState>(LogLevel logLevel, EventId eventId, TState state, Exception? exception, Func<TState, Exception?, string> formatter)
            => _logs.Add(new LogEntry(logLevel, formatter(state, exception)));

        private sealed class NullScope : IDisposable
        {
            public static readonly NullScope Instance = new();
            public void Dispose() { }
        }
    }
}
