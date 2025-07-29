/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DetectionModel } from '../models/DetectionModel';
import type { DetectResponseDto } from '../models/DetectResponseDto';
import type { VerifyResponseDto } from '../models/VerifyResponseDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class DefaultService {
    /**
     * @param formData
     * @param includeImages
     * @param model
     * @returns DetectResponseDto Success
     * @throws ApiError
     */
    public static detectSignature(
        formData: {
            file?: Blob;
        },
        includeImages?: boolean,
        model?: DetectionModel,
    ): CancelablePromise<DetectResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/signature/detect',
            query: {
                'includeImages': includeImages,
                'model': model,
            },
            formData: formData,
            mediaType: 'multipart/form-data',
        });
    }
    /**
     * @param formData
     * @param detection
     * @param threshold
     * @param model
     * @param preprocessed
     * @returns VerifyResponseDto Success
     * @throws ApiError
     */
    public static verifySignature(
        formData: {
            reference?: Blob;
            candidate?: Blob;
        },
        detection?: boolean,
        threshold?: number,
        model?: DetectionModel,
        preprocessed?: boolean,
    ): CancelablePromise<VerifyResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/signature/verify',
            query: {
                'detection': detection,
                'threshold': threshold,
                'model': model,
                'preprocessed': preprocessed,
            },
            formData: formData,
            mediaType: 'multipart/form-data',
        });
    }
}
