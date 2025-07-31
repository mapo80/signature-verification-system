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
       * @returns DetectResponseDto Success
       * @throws ApiError
       */
    public static detectSignature(
        formData: {
            file?: Blob;
            includeImages?: boolean;
            config?: Blob;
        },
    ): CancelablePromise<DetectResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/signature/detect',
            formData: formData,
            mediaType: 'multipart/form-data',
        });
    }
     /**
       * @param formData
       * @returns VerifyResponseDto Success
       * @throws ApiError
       */
    public static verifySignature(
        formData: {
            reference?: Blob;
            candidate?: Blob;
            detection?: boolean;
            temperature?: number;
            threshold?: number;
            preprocessed?: boolean;
            config?: Blob;
        },
    ): CancelablePromise<VerifyResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/signature/verify',
            formData: formData,
            mediaType: 'multipart/form-data',
        });
    }
}
