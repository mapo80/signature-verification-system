# Stage 1: Build React app
FROM node:20-alpine AS web-build
WORKDIR /src/webapp

# Install dependencies and build
COPY webapp/package*.json ./
RUN npm ci --legacy-peer-deps
COPY webapp/ .
RUN npm run build

# Stage 2: Build .NET API
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy source (including submodules)
COPY . ./

# Debug: list copied files
RUN echo "Contents of /src after COPY:" && ls -R /src

# Merge ONNX model parts
RUN cd signature-detection && \
    echo "Files in signature-detection:" && ls && \
    cat conditional_detr_signature.onnx_parte_* > conditional_detr_signature.onnx

# Restore, build, and publish API
RUN dotnet restore SignatureVerification.Api/SignatureVerification.Api.csproj
RUN dotnet build SignatureVerification.Api/SignatureVerification.Api.csproj -c Release --no-restore
RUN dotnet publish SignatureVerification.Api/SignatureVerification.Api.csproj -c Release -o /out --no-build

# Stage 3: Runtime image with .NET ASP.NET runtime (non-distroless)
FROM mcr.microsoft.com/dotnet/aspnet:9.0-noble AS runtime
WORKDIR /app

# Install native dependencies (shell available)
# - libuuid1: provides uuid_generate_random required by SkiaSharp
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      libgtk2.0-0 libgdk-pixbuf2.0-0 libtesseract5 \
      libdc1394-25 libavcodec60 libavformat60 libswscale7 \
      libsm6 libxext6 libxrender1 libgomp1 libuuid1 && \
    rm -rf /var/lib/apt/lists/*

# Copy published API
COPY --from=build /out ./

# Serve React build from wwwroot
COPY --from=web-build /src/webapp/dist ./wwwroot

# Copy models and native libs
COPY --from=build /src/sigver/models ./sigver/models
COPY --from=build /src/sigver/so ./sigver/so
COPY --from=build /src/signature-detection/conditional_detr_signature.onnx \
      ./signature-detection/conditional_detr_signature.onnx
COPY --from=build /src/signature-detection/yolov8s.onnx \
      ./signature-detection/yolov8s.onnx

# Configure native library path
ENV LD_LIBRARY_PATH=/app/sigver/so

# Expose HTTP port
EXPOSE 8080

ENTRYPOINT ["dotnet", "SignatureVerification.Api.dll"]
