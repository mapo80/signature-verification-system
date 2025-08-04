using Microsoft.AspNetCore.Mvc.ModelBinding;
using System.Text.Json;
using System.IO;

namespace SignatureVerification.Api.ModelBinders;

public class JsonModelBinder : IModelBinder
{
    public async Task BindModelAsync(ModelBindingContext bindingContext)
    {
        if (bindingContext == null) throw new ArgumentNullException(nameof(bindingContext));

        var valueProviderResult = bindingContext.ValueProvider.GetValue(bindingContext.ModelName);
        if (valueProviderResult != ValueProviderResult.None)
        {
            var value = valueProviderResult.FirstValue;
            if (!string.IsNullOrEmpty(value))
            {
                try
                {
                    var result = JsonSerializer.Deserialize(value, bindingContext.ModelType, new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    });
                    bindingContext.Result = ModelBindingResult.Success(result);
                    return;
                }
                catch (JsonException)
                {
                }
            }
        }

        if (bindingContext.HttpContext.Request.Form.Files.Count > 0)
        {
            var file = bindingContext.HttpContext.Request.Form.Files[bindingContext.ModelName];
            if (file != null)
            {
                using var stream = file.OpenReadStream();
                using var reader = new StreamReader(stream);
                var json = await reader.ReadToEndAsync();
                try
                {
                    var result = JsonSerializer.Deserialize(json, bindingContext.ModelType, new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    });
                    bindingContext.Result = ModelBindingResult.Success(result);
                    return;
                }
                catch (JsonException)
                {
                }
            }
        }

        bindingContext.Result = ModelBindingResult.Failed();
    }
}
