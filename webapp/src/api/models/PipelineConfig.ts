export interface PipelineConfig {
  enableYoloV8?: boolean;
  enableDetr?: boolean;
  strategy?: string;
  yoloConfidenceThreshold?: number;
  yoloNmsIoU?: number;
  detrConfidenceThreshold?: number;
  fallbackFp?: number;
  fallbackFn?: number;
  eceDetr?: number;
  eceYolo?: number;
  ensembleThreshold?: number;
  enableShapeRoiV2?: boolean;
  shapeMinAspect?: number;
  shapeMaxAspect?: number;
  lowConfidence?: number;
  highConfidence?: number;
  cropMarginPerc?: number;
  roiConfirmIoU?: number;
  uncertainQuantile?: number;
}

export const DEFAULT_PIPELINE_CONFIG: PipelineConfig = {
  enableYoloV8: true,
  enableDetr: true,
  strategy: 'Ensemble',
  yoloConfidenceThreshold: 0.60,
  yoloNmsIoU: 0.30,
  detrConfidenceThreshold: 0.30,
  fallbackFp: 2,
  fallbackFn: 0,
  eceDetr: 1.0,
  eceYolo: 1.0,
  ensembleThreshold: 0.50,
  enableShapeRoiV2: false,
  shapeMinAspect: 0.30,
  shapeMaxAspect: 6.00,
  lowConfidence: 0.40,
  highConfidence: 0.85,
  cropMarginPerc: 0.20,
  roiConfirmIoU: 0.40,
  uncertainQuantile: 0.05,
};
