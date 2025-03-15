import { NextApiResponse } from 'next'
import { urlQueryBuilder } from "@/lib/utils/url"

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
  NO_CONTENT: "No Content",
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

/**
 * 
 * @author Shawan Mandal <github@imshawan.dev>
 * @date 25-02-2025
 * 
 * @function paginate
 * @param items 
 * @param limit 
 * @param page 
 * @param baseUrl 
 * @description facilitates pagination for a given array of items, allowing users to navigate through the data in smaller, manageable chunks. 
 * It takes an array of items, the number of items to display per page (limit), the current page number (page), and a base URL (baseUrl) as inputs.
 */
export function paginate(items: Array<any>, total: number, limit: number, page: number, baseUrl: string = ''): Pagination {
  if (!items) {
    items = [];
  }
  if (!Array.isArray(items)) {
    throw new Error('Invalid input. Items should be an array');
  }
  if (typeof limit !== 'number') {
    throw new Error('Invalid input. limit should be number');
  }
  if (typeof page !== 'number') {
    throw new Error('Invalid input. page should be number');
  }
  if (page == 0) {
    throw new Error('page must be non zero (0) number');
  }
  if (!baseUrl) {
    throw new Error('baseUrl is a required parameter');
  }
  if (typeof baseUrl != 'string') {
    throw new Error('baseUrl must be a string, found ' + typeof baseUrl);
  }
  if (!total) {
    total = items.length;
  }

  limit = Number(limit);
  page = Number(page);

  const startIndex = (page - 1) * limit;
  const endIndex = Math.min(startIndex + limit, total);

  // Calculate the total number of pages
  const totalPages = Math.ceil(total / limit);

  // Generate URLs for the current, next, and previous pages
  const currentPageUrl = urlQueryBuilder(baseUrl, { page });
  const nextPageUrl = page < totalPages ? urlQueryBuilder(baseUrl, { page: page + 1 }) : null;
  const prevPageUrl = page > 1 ? urlQueryBuilder(baseUrl, { page: page - 1 }) : null;

  const navigation = { current: currentPageUrl, next: nextPageUrl, previous: prevPageUrl };

  return {
    data: items,
    currentPage: page,
    limit: limit,
    totalPages: totalPages,
    totalItems: total,
    navigation,
    start: startIndex,
    end: endIndex
  };
}