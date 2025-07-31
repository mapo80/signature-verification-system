import { Row, Col, Form, Switch, InputNumber, Select, Button } from 'antd';
import type { PipelineConfig } from '../api';
import { DEFAULT_PIPELINE_CONFIG } from '../api';

interface Props {
  value: PipelineConfig;
  onChange: (cfg: PipelineConfig) => void;
}

const { Option } = Select;

export default function PipelineConfigForm({ value, onChange }: Props) {
  const update = (patch: Partial<PipelineConfig>) => {
    onChange({ ...value, ...patch });
  };

  return (
    <Form layout="vertical">
      <Row gutter={16}>
        <Col span={8}>
          <Form.Item label="YOLOv8">
            <Switch checked={value.enableYoloV8} onChange={v => update({ enableYoloV8: v })} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="DETR">
            <Switch checked={value.enableDetr} onChange={v => update({ enableDetr: v })} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="Strategy">
            <Select value={value.strategy} onChange={v => update({ strategy: v })}>
              <Option value="Ensemble">Ensemble</Option>
              <Option value="Sequential">Sequential</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={8}>
          <Form.Item label="YOLO conf.">
            <InputNumber
              min={0}
              max={1}
              step={0.01}
              value={value.yoloConfidenceThreshold}
              onChange={v => update({ yoloConfidenceThreshold: v ?? 0 })}
            />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="YOLO NMS IoU">
            <InputNumber min={0} max={1} step={0.01} value={value.yoloNmsIoU} onChange={v => update({ yoloNmsIoU: v ?? 0 })} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="DETR conf.">
            <InputNumber
              min={0}
              max={1}
              step={0.01}
              value={value.detrConfidenceThreshold}
              onChange={v => update({ detrConfidenceThreshold: v ?? 0 })}
            />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={8}>
          <Form.Item label="Fallback FP">
            <InputNumber min={0} value={value.fallbackFp} onChange={v => update({ fallbackFp: v ?? 0 })} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="Fallback FN">
            <InputNumber min={0} value={value.fallbackFn} onChange={v => update({ fallbackFn: v ?? 0 })} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="Ensemble th.">
            <InputNumber
              min={0}
              max={1}
              step={0.01}
              value={value.ensembleThreshold}
              onChange={v => update({ ensembleThreshold: v ?? 0 })}
            />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={8}>
          <Form.Item label="ECE DETR">
            <InputNumber min={0} max={10} step={0.1} value={value.eceDetr} onChange={v => update({ eceDetr: v ?? 0 })} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="ECE YOLO">
            <InputNumber min={0} max={10} step={0.1} value={value.eceYolo} onChange={v => update({ eceYolo: v ?? 0 })} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="Shape ROI v2">
            <Switch checked={value.enableShapeRoiV2} onChange={v => update({ enableShapeRoiV2: v })} />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={8}>
          <Form.Item label="Shape min aspect">
            <InputNumber min={0} step={0.01} value={value.shapeMinAspect} onChange={v => update({ shapeMinAspect: v ?? 0 })} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="Shape max aspect">
            <InputNumber min={0} step={0.01} value={value.shapeMaxAspect} onChange={v => update({ shapeMaxAspect: v ?? 0 })} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="Low conf.">
            <InputNumber min={0} max={1} step={0.01} value={value.lowConfidence} onChange={v => update({ lowConfidence: v ?? 0 })} />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={8}>
          <Form.Item label="High conf.">
            <InputNumber min={0} max={1} step={0.01} value={value.highConfidence} onChange={v => update({ highConfidence: v ?? 0 })} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="Crop margin %">
            <InputNumber min={0} max={1} step={0.01} value={value.cropMarginPerc} onChange={v => update({ cropMarginPerc: v ?? 0 })} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="ROI confirm IoU">
            <InputNumber min={0} max={1} step={0.01} value={value.roiConfirmIoU} onChange={v => update({ roiConfirmIoU: v ?? 0 })} />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={8}>
          <Form.Item label="Uncertain quantile">
            <InputNumber min={0} max={1} step={0.01} value={value.uncertainQuantile} onChange={v => update({ uncertainQuantile: v ?? 0 })} />
          </Form.Item>
        </Col>
      </Row>
      <Button onClick={() => onChange(DEFAULT_PIPELINE_CONFIG)}>Reset</Button>
    </Form>
  );
}

