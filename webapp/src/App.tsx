import { useState, useEffect } from 'react';
import { Tabs, Upload, Button, Switch, Spin, Slider, Layout, Typography, message, InputNumber } from 'antd';
import type { UploadProps } from 'antd';
import type { DetectResponseDto, VerifyResponseDto, PipelineConfig } from './api';
import { DefaultService, DEFAULT_PIPELINE_CONFIG } from './api';
import 'antd/dist/reset.css';
import DetectResult from './components/DetectResult';
import VerifyResult from './components/VerifyResult';
import PipelineConfigForm from './components/PipelineConfigForm';

const { Dragger } = Upload;
const { Header, Content } = Layout;
const { Title } = Typography;

function DetectTab() {
  const [file, setFile] = useState<File | null>(null);
  const [includeImages, setIncludeImages] = useState(false);
  const [result, setResult] = useState<DetectResponseDto | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState<PipelineConfig>(DEFAULT_PIPELINE_CONFIG);


  const handleChange: UploadProps['onChange'] = info => {
    const f = info.fileList[0]?.originFileObj as File | undefined;
    setResult(null);
    if (preview) URL.revokeObjectURL(preview);
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
    } else {
      setFile(null);
      setPreview(null);
    }
  };

  const handleSubmit = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const {
        enableYoloV8,
        enableDetr,
        strategy,
        yoloConfidenceThreshold,
        yoloNmsIoU,
        detrConfidenceThreshold,
        fallbackFp,
        fallbackFn,
        eceDetr,
        eceYolo,
        ensembleThreshold,
        enableShapeRoiV2,
        shapeMinAspect,
        shapeMaxAspect,
        lowConfidence,
        highConfidence,
        cropMarginPerc,
        roiConfirmIoU,
        uncertainQuantile,
      } = config;

      const res = await DefaultService.detectSignature(
        { file },
        includeImages,
        enableYoloV8,
        enableDetr,
        strategy,
        yoloConfidenceThreshold,
        yoloNmsIoU,
        detrConfidenceThreshold,
        fallbackFp,
        fallbackFn,
        eceDetr,
        eceYolo,
        ensembleThreshold,
        enableShapeRoiV2,
        shapeMinAspect,
        shapeMaxAspect,
        lowConfidence,
        highConfidence,
        cropMarginPerc,
        roiConfirmIoU,
        uncertainQuantile
      );
      setResult(res);
    } catch (e) {
      console.error(e);
      message.error(`Errore: ${(e as Error).message}`);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  // cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  return (
    <Spin spinning={loading} tip="Caricamento">
      <div style={{ maxWidth: 600 }}>
        <Dragger beforeUpload={() => false} maxCount={1} onChange={handleChange}>
          <p className="ant-upload-text">Trascina l'immagine qui o clicca per selezionarla</p>
        </Dragger>
        <div style={{ marginTop: 16 }}>
          Includi immagini <Switch checked={includeImages} onChange={setIncludeImages} />
        </div>
        <div style={{ marginTop: 16 }}>
          <PipelineConfigForm value={config} onChange={setConfig} />
        </div>
        <Button type="primary" style={{ marginTop: 16 }} onClick={handleSubmit} disabled={!file || loading} loading={loading}>Rileva</Button>
        {result && preview && <DetectResult result={result} imageSrc={preview} />}
      </div>
    </Spin>
  );
}

function VerifyTab() {
  const [refFile, setRefFile] = useState<File | null>(null);
  const [candFile, setCandFile] = useState<File | null>(null);
  const [detection, setDetection] = useState(false);
  const [temperature, setTemperature] = useState(1.008);
  const [threshold, setThreshold] = useState(0.001);
  const [preprocessed, setPreprocessed] = useState(false);
  const [result, setResult] = useState<VerifyResponseDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState<PipelineConfig>(DEFAULT_PIPELINE_CONFIG);

  // expose setters for testing
  useEffect(() => {
    (window as any).__setRefFile = setRefFile;
    (window as any).__setCandFile = setCandFile;
  }, []);

  const handleRefChange: UploadProps['onChange'] = info => {
    const f = info.fileList[0]?.originFileObj as File | undefined;
    setRefFile(f ?? null);
    setResult(null);
  };
  const handleCandChange: UploadProps['onChange'] = info => {
    const f = info.fileList[0]?.originFileObj as File | undefined;
    setCandFile(f ?? null);
    setResult(null);
  };

  const handleSubmit = async () => {
    if (!refFile || !candFile) return;
    setLoading(true);
    try {
      const {
        enableYoloV8,
        enableDetr,
        strategy,
        yoloConfidenceThreshold,
        yoloNmsIoU,
        detrConfidenceThreshold,
        fallbackFp,
        fallbackFn,
        eceDetr,
        eceYolo,
        ensembleThreshold,
        enableShapeRoiV2,
        shapeMinAspect,
        shapeMaxAspect,
        lowConfidence,
        highConfidence,
        cropMarginPerc,
        roiConfirmIoU,
        uncertainQuantile,
      } = config;

      const res = await DefaultService.verifySignature(
        { reference: refFile, candidate: candFile },
        detection,
        temperature,
        threshold,
        preprocessed,
        enableYoloV8,
        enableDetr,
        strategy,
        yoloConfidenceThreshold,
        yoloNmsIoU,
        detrConfidenceThreshold,
        fallbackFp,
        fallbackFn,
        eceDetr,
        eceYolo,
        ensembleThreshold,
        enableShapeRoiV2,
        shapeMinAspect,
        shapeMaxAspect,
        lowConfidence,
        highConfidence,
        cropMarginPerc,
        roiConfirmIoU,
        uncertainQuantile
      );
      setResult(res);
    } catch (e) {
      console.error(e);
      message.error(`Errore: ${(e as Error).message}`);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Spin spinning={loading} tip="Caricamento">
      <div style={{ maxWidth: 600 }}>
        <Dragger beforeUpload={() => false} maxCount={1} onChange={handleRefChange}>
          <p className="ant-upload-text">Trascina la firma di riferimento</p>
        </Dragger>
        <Dragger
          style={{ marginTop: 16 }}
          beforeUpload={() => false}
          maxCount={1}
          onChange={handleCandChange}
        >
          <p className="ant-upload-text">Trascina la firma candidata</p>
        </Dragger>
        <div style={{ marginTop: 16 }}>
          Rilevamento <Switch checked={detection} onChange={setDetection} />
        </div>
        <div style={{ marginTop: 16 }}>
          Temperatura
          <InputNumber
            min={0}
            step={0.001}
            value={temperature}
            onChange={v => setTemperature(v ?? 0)}
            data-testid="temperature-input"
          />
        </div>
        <div style={{ marginTop: 16 }}>
          Soglia
          <Slider
            min={0}
            max={1}
            step={0.001}
            value={threshold}
            onChange={value => setThreshold(value as number)}
            style={{ width: 200 }}
          />
        </div>
        <div style={{ marginTop: 16 }}>
          Preprocessato <Switch checked={preprocessed} onChange={setPreprocessed} />
        </div>
        <div style={{ marginTop: 16 }}>
          <PipelineConfigForm value={config} onChange={setConfig} />
        </div>
        <Button
          type="primary"
          style={{ marginTop: 16 }}
          onClick={handleSubmit}
          disabled={!refFile || !candFile || loading}
          loading={loading}
        >
          Verifica
        </Button>
        {result && <VerifyResult result={result} threshold={threshold} />}
      </div>
    </Spin>
  );
}

export default function App() {
  return (
    <Layout style={{ background: 'transparent' }}>
      <Header style={{ background: '#1677ff' }}>
        <Title style={{ color: '#fff', margin: '14px 0' }} level={3}>
          Demo Firma
        </Title>
      </Header>
      <Content style={{ paddingTop: 24 }}>
        <Tabs
          defaultActiveKey="detect"
          items={[
            { key: 'detect', label: 'Rileva', children: <DetectTab /> },
            { key: 'verify', label: 'Verifica', children: <VerifyTab /> }
          ]}
        />
      </Content>
    </Layout>
  );
}
