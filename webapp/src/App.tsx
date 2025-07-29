import { useState, useEffect } from 'react';
import { Tabs, Upload, Button, Select, Switch, Spin } from 'antd';
import type { UploadProps } from 'antd';
import type { DetectResponseDto } from './api';
import { DetectionModel, DefaultService } from './api';
import 'antd/dist/reset.css';
import DetectResult from './components/DetectResult';

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

export default function App() {
  return (
    <Tabs
      defaultActiveKey="detect"
      items={[
        { key: 'detect', label: 'Detect', children: <DetectTab /> },
        { key: 'verify', label: 'Verify', children: <p>Coming soon...</p> }
      ]}
    />
  );
}
