import { NextApiResponse } from 'next';
import { NextResponse } from 'next/server';

export const HttpStatus = {
    OK: 200,
    CREATED: 201,
    ACCEPTED: 202,
    NO_CONTENT: 204,
    
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    PAYMENT_REQUIRED: 402,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    METHOD_NOT_ALLOWED: 405,
    NOT_ACCEPTABLE: 406,
    PROXY_AUTH_REQUIRED: 407,
    REQUEST_TIMEOUT: 408,
    CONFLICT: 409,
    GONE: 410,
    LENGTH_REQUIRED: 411,
    PRECONDITION_FAILED: 412,
    PAYLOAD_TOO_LARGE: 413,
    URI_TOO_LONG: 414,
    UNSUPPORTED_MEDIA_TYPE: 415,
    RANGE_NOT_SATISFIABLE: 416,
    EXPECTATION_FAILED: 417,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,
    
    INTERNAL_SERVER_ERROR: 500,
    NOT_IMPLEMENTED: 501,
    BAD_GATEWAY: 502,
    SERVICE_UNAVAILABLE: 503,
    GATEWAY_TIMEOUT: 504,
    HTTP_VERSION_NOT_SUPPORTED: 505,
} as const;

export const ErrorCode = {
    VALIDATION_ERROR: "Validation Error",
    UNAUTHORIZED: "Unauthorized",
    PAYMENT_REQUIRED: "Payment Required",
    FORBIDDEN: "Forbidden",
    NOT_FOUND: "Not Found",
    METHOD_NOT_ALLOWED: "Method Not Allowed",
    NOT_ACCEPTABLE: "Not Acceptable",
    PROXY_AUTH_REQUIRED: "Proxy Authentication Required",
    REQUEST_TIMEOUT: "Request Timeout",
    CONFLICT: "Conflict",
    GONE: "Gone",
    LENGTH_REQUIRED: "Length Required",
    PRECONDITION_FAILED: "Precondition Failed",
    PAYLOAD_TOO_LARGE: "Payload Too Large",
    URI_TOO_LONG: "URI Too Long",
    UNSUPPORTED_MEDIA_TYPE: "Unsupported Media Type",
    RANGE_NOT_SATISFIABLE: "Range Not Satisfiable",
    EXPECTATION_FAILED: "Expectation Failed",
    UNPROCESSABLE_ENTITY: "Unprocessable Entity",
    RATE_LIMIT: "Too Many Requests",
    
    INTERNAL_ERROR: "Internal Server Error",
    NOT_IMPLEMENTED: "Not Implemented",
    BAD_GATEWAY: "Bad Gateway",
    SERVICE_UNAVAILABLE: "Service Unavailable",
    GATEWAY_TIMEOUT: "Gateway Timeout",
    HTTP_VERSION_NOT_SUPPORTED: "HTTP Version Not Supported",
    BAD_REQUEST: "Bad Request",
} as const;


export class ApiError extends Error {
    constructor(
        public code: string,
        message: string,
        public status: number = HttpStatus.BAD_REQUEST,
        public details?: any
    ) {
        super(message);
        this.name = 'ApiError';

        Object.setPrototypeOf(this, ApiError.prototype);
    }
}

export class ApiFailureError extends Error {
    constructor(
        public code: string,
        message: string,
        public details?: any
        
    ) {
        super(message);
        this.name = 'ApiFailureError';

        Object.setPrototypeOf(this, ApiFailureError.prototype);
    }
}

export function formatApiResponse<T>(
    resp: NextApiResponse,
    input: T | Error,
    path?: string,
    startTime?: number,
    status?: number
): void {
    const timestamp = new Date().toISOString();
    const duration = startTime ? Date.now() - startTime : undefined;
    const url = String(resp.req.url);

    path = path || url;

    // Handle errors
    if (input instanceof Error) {
        const isApiError = input instanceof ApiError;
        const errorStatus = isApiError ? input.status : HttpStatus.INTERNAL_SERVER_ERROR;
        const errorCode = isApiError ? input.code : ErrorCode.INTERNAL_ERROR;
        const errorMessage = input.message || 'An unexpected error occurred';
        const errorDetails = isApiError ? input.details : undefined;

        const response: ApiResponse = {
            success: false,
            error: {
                code: errorCode,
                message: errorMessage,
                ...(errorDetails && { details: errorDetails }),
            },
            meta: {
                timestamp,
                path,
                status: errorStatus,
                ...(duration && { duration }),
            },
        };

        resp.status(errorStatus).json(response);
    }

    // Handle success
    const response: ApiResponse<T> = {
        success: true,
        data: input,
        meta: {
            timestamp,
            path,
            status: status || HttpStatus.OK,
            ...(duration && { duration }),
        },
    };

    resp.status(status || HttpStatus.OK).json(response);
}