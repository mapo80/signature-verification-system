import { useState, useEffect } from 'react';
import { Tabs, Upload, Button, Select, Switch, Spin, Slider } from 'antd';
import type { UploadProps } from 'antd';
import type { DetectResponseDto, VerifyResponseDto } from './api';
import { DetectionModel, DefaultService } from './api';
import 'antd/dist/reset.css';
import DetectResult from './components/DetectResult';
import VerifyResult from './components/VerifyResult';

const { Dragger } = Upload;

function DetectTab() {
  const [file, setFile] = useState<File | null>(null);
  const [includeImages, setIncludeImages] = useState(false);
  const [model, setModel] = useState<DetectionModel>(DetectionModel.Detr);
  const [result, setResult] = useState<DetectResponseDto | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);


  const beforeUpload: UploadProps['beforeUpload'] = (f) => {
    setFile(f as File);
    setResult(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(f as File));
    return false;
  };

  const handleSubmit = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const res = await DefaultService.detectSignature({ file }, includeImages, model);
      setResult(res);
    } catch (e) {
      console.error(e);
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
    <Spin spinning={loading} tip="Loading">
      <div style={{ maxWidth: 600 }}>
        <Dragger beforeUpload={beforeUpload} maxCount={1} showUploadList={false}>
          <p className="ant-upload-text">Drop image here or click to select</p>
        </Dragger>
        <div style={{ marginTop: 16 }}>
          <span style={{ marginRight: 8 }}>Model:</span>
          <Select value={model} onChange={setModel} style={{ width: 120 }}>
            <Select.Option value={DetectionModel.Detr}>Detr</Select.Option>
            <Select.Option value={DetectionModel.Yolo}>Yolo</Select.Option>
          </Select>
        </div>
        <div style={{ marginTop: 16 }}>
          Include Images <Switch checked={includeImages} onChange={setIncludeImages} />
        </div>
        <Button type="primary" style={{ marginTop: 16 }} onClick={handleSubmit} disabled={!file || loading} loading={loading}>Detect</Button>
        {result && preview && <DetectResult result={result} imageSrc={preview} />}
      </div>
    </Spin>
  );
}

function VerifyTab() {
  const [refFile, setRefFile] = useState<File | null>(null);
  const [candFile, setCandFile] = useState<File | null>(null);
  const [detection, setDetection] = useState(false);
  const [model, setModel] = useState<DetectionModel>(DetectionModel.Detr);
  const [threshold, setThreshold] = useState(0.35);
  const [preprocessed, setPreprocessed] = useState(false);
  const [result, setResult] = useState<VerifyResponseDto | null>(null);
  const [loading, setLoading] = useState(false);

  // expose setters for testing
  useEffect(() => {
    (window as any).__setRefFile = setRefFile;
    (window as any).__setCandFile = setCandFile;
  }, []);

  const beforeRef: UploadProps['beforeUpload'] = f => {
    setRefFile(f as File);
    setResult(null);
    return false;
  };
  const beforeCand: UploadProps['beforeUpload'] = f => {
    setCandFile(f as File);
    setResult(null);
    return false;
  };

  const handleSubmit = async () => {
    if (!refFile || !candFile) return;
    setLoading(true);
    try {
      const res = await DefaultService.verifySignature(
        { reference: refFile, candidate: candFile },
        detection,
        threshold,
        detection ? model : undefined,
        preprocessed
      );
      setResult(res);
    } catch (e) {
      console.error(e);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Spin spinning={loading} tip="Loading">
      <div style={{ maxWidth: 600 }}>
        <Dragger beforeUpload={beforeRef} maxCount={1} showUploadList={false}>
          <p className="ant-upload-text">Drop reference signature</p>
        </Dragger>
        <Dragger
          style={{ marginTop: 16 }}
          beforeUpload={beforeCand}
          maxCount={1}
          showUploadList={false}
        >
          <p className="ant-upload-text">Drop candidate signature</p>
        </Dragger>
        <div style={{ marginTop: 16 }}>
          Detection <Switch checked={detection} onChange={setDetection} />
        </div>
        <div style={{ marginTop: 16 }}>
          <span style={{ marginRight: 8 }}>Model:</span>
          <Select
            value={model}
            onChange={setModel}
            style={{ width: 120 }}
            disabled={!detection}
          >
            <Select.Option value={DetectionModel.Detr}>Detr</Select.Option>
            <Select.Option value={DetectionModel.Yolo}>Yolo</Select.Option>
          </Select>
        </div>
        <div style={{ marginTop: 16 }}>
          Threshold
          <Slider
            min={0}
            max={1}
            step={0.01}
            value={threshold}
            onChange={value => setThreshold(value as number)}
            style={{ width: 200 }}
          />
        </div>
        <div style={{ marginTop: 16 }}>
          Preprocessed <Switch checked={preprocessed} onChange={setPreprocessed} />
        </div>
        <Button
          type="primary"
          style={{ marginTop: 16 }}
          onClick={handleSubmit}
          disabled={!refFile || !candFile || loading}
          loading={loading}
        >
          Verify
        </Button>
        {result && <VerifyResult result={result} threshold={threshold} />}
      </div>
    </Spin>
  );
}

export default function App() {
  return (
    <Tabs
      defaultActiveKey="detect"
      items={[
        { key: 'detect', label: 'Detect', children: <DetectTab /> },
        { key: 'verify', label: 'Verify', children: <VerifyTab /> }
      ]}
    />
  );
}
