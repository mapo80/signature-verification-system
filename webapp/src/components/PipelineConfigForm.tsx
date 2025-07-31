import { Row, Col, Form, Switch, InputNumber, Select, Button, Tooltip } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import type { PipelineConfig } from '../api';
import { DEFAULT_PIPELINE_CONFIG } from '../api';

interface Props {
  value: PipelineConfig;
  onChange: (cfg: PipelineConfig) => void;
}

const { Option } = Select;

const label = (text: string, hint: string) => (
  <span>
    {text}
    <Tooltip title={hint}>
      <InfoCircleOutlined style={{ marginLeft: 4 }} />
    </Tooltip>
  </span>
);

export default function PipelineConfigForm({ value, onChange }: Props) {
  const update = (patch: Partial<PipelineConfig>) => {
    onChange({ ...value, ...patch });
  };

  return (
    <Form layout="vertical">
      <Row gutter={16}>
        <Col span={8}>
          <Form.Item label={label('YOLOv8', 'Abilita il rilevatore YOLOv8')}>
            <Switch checked={value.enableYoloV8} onChange={v => update({ enableYoloV8: v })} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label={label('DETR', 'Abilita il rilevatore DETR')}>
            <Switch checked={value.enableDetr} onChange={v => update({ enableDetr: v })} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label={label('Strategy', 'Come combinare i rilevatori (ensemble o sequenziale)')}>
            <Select value={value.strategy} onChange={v => update({ strategy: v })}>
              <Option value="Ensemble">Ensemble</Option>
              <Option value="Sequential">Sequential</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={8}>
          <Form.Item label={label('YOLO conf.', 'Soglia di confidenza minima per YOLOv8')}>
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
          <Form.Item label={label('YOLO NMS IoU', 'Soglia IoU per il Non‑Max Suppression di YOLOv8')}>
            <InputNumber min={0} max={1} step={0.01} value={value.yoloNmsIoU} onChange={v => update({ yoloNmsIoU: v ?? 0 })} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label={label('DETR conf.', 'Soglia di confidenza minima per DETR')}>
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
          <Form.Item label={label('Fallback FP', 'Numero massimo di falsi positivi consentiti in fallback')}>
            <InputNumber min={0} value={value.fallbackFp} onChange={v => update({ fallbackFp: v ?? 0 })} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label={label('Fallback FN', 'Numero massimo di falsi negativi consentiti in fallback')}>
            <InputNumber min={0} value={value.fallbackFn} onChange={v => update({ fallbackFn: v ?? 0 })} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label={label('Ensemble th.', 'Soglia per considerare valide le detections nell\'ensemble')}>
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
          <Form.Item label={label('ECE DETR', 'Temperatura di calibrazione ECE per DETR')}>
            <InputNumber min={0} max={10} step={0.1} value={value.eceDetr} onChange={v => update({ eceDetr: v ?? 0 })} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label={label('ECE YOLO', 'Temperatura di calibrazione ECE per YOLOv8')}>
            <InputNumber min={0} max={10} step={0.1} value={value.eceYolo} onChange={v => update({ eceYolo: v ?? 0 })} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label={label('Shape ROI v2', 'Abilita la generazione avanzata della ROI basata sulla forma')}>
            <Switch checked={value.enableShapeRoiV2} onChange={v => update({ enableShapeRoiV2: v })} />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={8}>
          <Form.Item label={label('Shape min aspect', 'Rapporto d\'aspetto minimo consentito per la ROI')}>
            <InputNumber min={0} step={0.01} value={value.shapeMinAspect} onChange={v => update({ shapeMinAspect: v ?? 0 })} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label={label('Shape max aspect', 'Rapporto d\'aspetto massimo consentito per la ROI')}>
            <InputNumber min={0} step={0.01} value={value.shapeMaxAspect} onChange={v => update({ shapeMaxAspect: v ?? 0 })} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label={label('Low conf.', 'Soglia inferiore di confidenza per classificare un match')}>
            <InputNumber min={0} max={1} step={0.01} value={value.lowConfidence} onChange={v => update({ lowConfidence: v ?? 0 })} />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={8}>
          <Form.Item label={label('High conf.', 'Soglia superiore di confidenza per classificare un match')}>
            <InputNumber min={0} max={1} step={0.01} value={value.highConfidence} onChange={v => update({ highConfidence: v ?? 0 })} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label={label('Crop margin %', 'Percentuale di margine aggiunto al ritaglio della ROI')}>
            <InputNumber min={0} max={1} step={0.01} value={value.cropMarginPerc} onChange={v => update({ cropMarginPerc: v ?? 0 })} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label={label('ROI confirm IoU', 'Soglia IoU per confermare la ROI tra i rilevatori')}>
            <InputNumber min={0} max={1} step={0.01} value={value.roiConfirmIoU} onChange={v => update({ roiConfirmIoU: v ?? 0 })} />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={8}>
          <Form.Item label={label('Uncertain quantile', 'Quantile per definire l\'incertezza nella classificazione')}>
            <InputNumber min={0} max={1} step={0.01} value={value.uncertainQuantile} onChange={v => update({ uncertainQuantile: v ?? 0 })} />
          </Form.Item>
        </Col>
      </Row>
      <Button onClick={() => onChange(DEFAULT_PIPELINE_CONFIG)}>Reset</Button>
    </Form>
  );
}

