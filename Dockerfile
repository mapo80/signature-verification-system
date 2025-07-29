# Build React app
FROM node:20 AS web-build
WORKDIR /src/webapp
COPY webapp/package*.json ./
RUN npm ci
COPY webapp .
RUN npm run build

# Build .NET API
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY . .
RUN cd signature-detection && cat conditional_detr_signature.onnx_parte_{1,2} > conditional_detr_signature.onnx
RUN dotnet publish SignatureVerification.Api/SignatureVerification.Api.csproj -c Release -o /out

# Final runtime image
FROM ubuntu:24.04
WORKDIR /app/SignatureVerification.Api
RUN apt-get update && apt-get install -y \
    libgtk2.0-0 libgdk-pixbuf2.0-0 libtesseract5 libdc1394-25 \
    libavcodec60 libavformat60 libswscale7 libsm6 libxext6 libxrender1 libgomp1 \
    && rm -rf /var/lib/apt/lists/*
# copy dotnet runtime from build stage
COPY --from=build /usr/share/dotnet /usr/share/dotnet
ENV DOTNET_ROOT=/usr/share/dotnet
ENV PATH=$PATH:/usr/share/dotnet
# copy published API
COPY --from=build /out .
# copy react build
COPY --from=web-build /src/webapp/dist ../wwwroot
# copy models and native library directories
COPY --from=build /src/sigver/models ../sigver/models
COPY --from=build /src/sigver/so ../sigver/so
COPY --from=build /src/signature-detection/conditional_detr_signature.onnx ../signature-detection/conditional_detr_signature.onnx
COPY --from=build /src/signature-detection/yolov8s.onnx ../signature-detection/yolov8s.onnx
ENV LD_LIBRARY_PATH=/app/sigver/so
ENTRYPOINT ["dotnet", "SignatureVerification.Api.dll"]
