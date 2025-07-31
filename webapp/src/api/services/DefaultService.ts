/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DetectResponseDto } from '../models/DetectResponseDto';
import type { VerifyResponseDto } from '../models/VerifyResponseDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class DefaultService {
    /**
     * @param formData
     * @param includeImages
     * @param enableYoloV8
     * @param enableDetr
     * @param strategy
     * @param yoloConfidenceThreshold
     * @param yoloNmsIoU
     * @param detrConfidenceThreshold
     * @param fallbackFp
     * @param fallbackFn
     * @param eceDetr
     * @param eceYolo
     * @param ensembleThreshold
     * @param enableShapeRoiV2
     * @param shapeMinAspect
     * @param shapeMaxAspect
     * @param lowConfidence
     * @param highConfidence
     * @param cropMarginPerc
     * @param roiConfirmIoU
     * @param uncertainQuantile
     * @returns DetectResponseDto Success
     * @throws ApiError
     */
    public static detectSignature(
        formData: {
            file?: Blob;
        },
        includeImages?: boolean,
        enableYoloV8?: boolean,
        enableDetr?: boolean,
        strategy?: string,
        yoloConfidenceThreshold?: number,
        yoloNmsIoU?: number,
        detrConfidenceThreshold?: number,
        fallbackFp?: number,
        fallbackFn?: number,
        eceDetr?: number,
        eceYolo?: number,
        ensembleThreshold?: number,
        enableShapeRoiV2?: boolean,
        shapeMinAspect?: number,
        shapeMaxAspect?: number,
        lowConfidence?: number,
        highConfidence?: number,
        cropMarginPerc?: number,
        roiConfirmIoU?: number,
        uncertainQuantile?: number,
    ): CancelablePromise<DetectResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/signature/detect',
            query: {
                'includeImages': includeImages,
                'enableYoloV8': enableYoloV8,
                'enableDetr': enableDetr,
                'strategy': strategy,
                'yoloConfidenceThreshold': yoloConfidenceThreshold,
                'yoloNmsIoU': yoloNmsIoU,
                'detrConfidenceThreshold': detrConfidenceThreshold,
                'fallbackFp': fallbackFp,
                'fallbackFn': fallbackFn,
                'eceDetr': eceDetr,
                'eceYolo': eceYolo,
                'ensembleThreshold': ensembleThreshold,
                'enableShapeRoiV2': enableShapeRoiV2,
                'shapeMinAspect': shapeMinAspect,
                'shapeMaxAspect': shapeMaxAspect,
                'lowConfidence': lowConfidence,
                'highConfidence': highConfidence,
                'cropMarginPerc': cropMarginPerc,
                'roiConfirmIoU': roiConfirmIoU,
                'uncertainQuantile': uncertainQuantile,
            },
            formData: formData,
            mediaType: 'multipart/form-data',
        });
    }
    /**
     * @param formData
     * @param detection
     * @param temperature
     * @param threshold
     * @param preprocessed
     * @param enableYoloV8
     * @param enableDetr
     * @param strategy
     * @param yoloConfidenceThreshold
     * @param yoloNmsIoU
     * @param detrConfidenceThreshold
     * @param fallbackFp
     * @param fallbackFn
     * @param eceDetr
     * @param eceYolo
     * @param ensembleThreshold
     * @param enableShapeRoiV2
     * @param shapeMinAspect
     * @param shapeMaxAspect
     * @param lowConfidence
     * @param highConfidence
     * @param cropMarginPerc
     * @param roiConfirmIoU
     * @param uncertainQuantile
     * @returns VerifyResponseDto Success
     * @throws ApiError
     */
    public static verifySignature(
        formData: {
            reference?: Blob;
            candidate?: Blob;
        },
        detection?: boolean,
        temperature?: number,
        threshold: number = 0.001,
        preprocessed?: boolean,
        enableYoloV8?: boolean,
        enableDetr?: boolean,
        strategy?: string,
        yoloConfidenceThreshold?: number,
        yoloNmsIoU?: number,
        detrConfidenceThreshold?: number,
        fallbackFp?: number,
        fallbackFn?: number,
        eceDetr?: number,
        eceYolo?: number,
        ensembleThreshold?: number,
        enableShapeRoiV2?: boolean,
        shapeMinAspect?: number,
        shapeMaxAspect?: number,
        lowConfidence?: number,
        highConfidence?: number,
        cropMarginPerc?: number,
        roiConfirmIoU?: number,
        uncertainQuantile?: number,
    ): CancelablePromise<VerifyResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/signature/verify',
            query: {
                'detection': detection,
                'temperature': temperature,
                'threshold': threshold,
                'preprocessed': preprocessed,
                'enableYoloV8': enableYoloV8,
                'enableDetr': enableDetr,
                'strategy': strategy,
                'yoloConfidenceThreshold': yoloConfidenceThreshold,
                'yoloNmsIoU': yoloNmsIoU,
                'detrConfidenceThreshold': detrConfidenceThreshold,
                'fallbackFp': fallbackFp,
                'fallbackFn': fallbackFn,
                'eceDetr': eceDetr,
                'eceYolo': eceYolo,
                'ensembleThreshold': ensembleThreshold,
                'enableShapeRoiV2': enableShapeRoiV2,
                'shapeMinAspect': shapeMinAspect,
                'shapeMaxAspect': shapeMaxAspect,
                'lowConfidence': lowConfidence,
                'highConfidence': highConfidence,
                'cropMarginPerc': cropMarginPerc,
                'roiConfirmIoU': roiConfirmIoU,
                'uncertainQuantile': uncertainQuantile,
            },
            formData: formData,
            mediaType: 'multipart/form-data',
        });
    }
}
