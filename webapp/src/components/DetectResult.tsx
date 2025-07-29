import { useRef, useState, useEffect } from 'react';
import { Image } from 'antd';
import type { DetectResponseDto, SignatureDto } from '../api';

export interface DetectResultProps {
  result: DetectResponseDto;
  imageSrc: string;
}

export default function DetectResult({ result, imageSrc }: DetectResultProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [naturalSize, setNaturalSize] = useState<{w:number;h:number}>({w:0,h:0});

  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete) {
      setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
    }
  }, [imageSrc]);

  const handleLoad = () => {
    const img = imgRef.current;
    if (img) {
      setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
    }
  };

  const renderBoxes = () => {
    if (!naturalSize.w || !naturalSize.h) return null;
    return (
      <svg
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
        viewBox={`0 0 ${naturalSize.w} ${naturalSize.h}`}
      >
        {result.signatures?.map((sig: SignatureDto, idx: number) => {
          const box = sig.boundingBox!;
          return (
            <g key={idx}>
              <rect
                x={box.x1}
                y={box.y1}
                width={box.x2 - box.x1}
                height={box.y2 - box.y1}
                stroke="red"
                strokeWidth={2}
                fill="none"
              />
              <text x={box.x1 + 4} y={box.y1 + 16} fill="red" fontSize="16">
                {sig.confidence?.toFixed(2)}
              </text>
            </g>
          );
        })}
      </svg>
    );
  };

  return (
    <div style={{ marginTop: 24 }}>
      <pre>{JSON.stringify(result, null, 2)}</pre>
      <div style={{ position: 'relative', display: 'inline-block', maxWidth: '100%' }}>
        <img
          ref={imgRef}
          src={imageSrc}
          alt="document"
          onLoad={handleLoad}
          style={{ width: '100%', height: 'auto', display: 'block' }}
        />
        {renderBoxes()}
      </div>
      {result.signatures?.map((sig, idx) =>
        sig.imageData ? (
          <div key={idx} style={{ marginTop: 16 }}>
            <Image src={`data:image/png;base64,${sig.imageData}`} alt="signature" />
            <div>Confidence: {sig.confidence?.toFixed(2)}</div>
          </div>
        ) : null
      )}
    </div>
  );
}
