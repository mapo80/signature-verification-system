import { Image } from 'antd';
import { CheckCircleTwoTone, CloseCircleTwoTone } from '@ant-design/icons';
import type { VerifyResponseDto } from '../api';

export interface VerifyResultProps {
  result: VerifyResponseDto;
  threshold: number;
}

export default function VerifyResult({ result, threshold }: VerifyResultProps) {
  return (
    <div style={{ marginTop: 24 }}>
      <pre>{JSON.stringify(result, null, 2)}</pre>
      <div style={{ marginTop: 8, fontSize: 18 }}>
        Contraffatta:{' '}
        {result.forged ? (
          <CloseCircleTwoTone twoToneColor="red" />
        ) : (
          <CheckCircleTwoTone twoToneColor="green" />
        )}
      </div>
      <div style={{ marginTop: 8 }}>
        Somiglianza: {result.similarity?.toFixed(2)} (soglia {threshold.toFixed(2)})
      </div>
      {result.referenceImage && (
        <div style={{ marginTop: 16 }}>
          <Image
            src={`data:image/png;base64,${result.referenceImage}`}
            alt="riferimento"
          />
        </div>
      )}
      {result.candidateImage && (
        <div style={{ marginTop: 16 }}>
          <Image
            src={`data:image/png;base64,${result.candidateImage}`}
            alt="candidata"
          />
        </div>
      )}
    </div>
  );
}
