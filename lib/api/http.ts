/**
 * @file http.ts
 * @description A generic HTTP handler module for making API requests with various methods (GET, POST, PUT, DELETE).
 * @author Shawan Mandal <github@imshawan.dev>
 */

type Config = {
  headers?: Record<string, string>;
};

/**
 * @function getHeaders
 * @description Generates headers for the API requests.
 * If `isFormData` is false, it ensures "Content-Type" is set to "application/json".
 * @param {Config} config - Optional configuration object containing headers.
 * @param {boolean} [isFormData=false] - Flag to determine if the request contains form data.
 * @returns {Record<string, string>} - The final headers object.
 */
function getHeaders(config: Config = {}, isFormData: boolean = false): Record<string, string> {
  if (!config || Object.keys(config).length === 0) {
    config = { headers: {} };
  }
  let headers = config.headers || {};

  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  return headers;
}

/**
 * @function createHttpHandler
 * @description Creates an HTTP handler with predefined methods for API requests.
 * Supports GET, POST, PUT, DELETE, and file upload requests.
 * @param {string} [baseURL=""] - Base URL for API requests.
 * @returns {object} - API methods for making HTTP requests.
 */
export default function createHttpHandler(baseURL: string = "") {
  const api = {
    /**
     * @function get
     * @description Makes a GET request to the specified URL.
     * @param {string} url - The endpoint URL.
     * @param {Config} [config={}] - Optional request configuration.
     * @returns {Promise<ApiResponse<T>>} - The JSON response.
     */
    async get<T>(url: string, config: Config = {}): Promise<ApiResponse<T>> {
      const response = await fetch(baseURL + url, {
        method: "GET",
        ...config,
        headers: getHeaders(config),
      });

      return await response.json();
    },

    /**
     * @function getText
     * @description Fetches a text response from the specified URL.
     * @param {string} url - The endpoint URL.
     * @param {Config} [config={}] - Optional request configuration.
     * @returns {Promise<string>} - The response as a text string.
     */
    async getText(url: string, config: Config = {}): Promise<string> {
      const response = await fetch(baseURL + url, {
        method: "GET",
        ...config,
        headers: getHeaders(config),
      });

      return await response.text();
    },

    /**
     * @function post
     * @description Makes a POST request with JSON or form data.
     * @param {string} url - The endpoint URL.
     * @param {any} data - The request payload.
     * @param {Config} [config={}] - Optional request configuration.
     * @param {boolean} [isFormData=false] - Indicates if the data is FormData.
     * @returns {Promise<ApiResponse<T>>} - The JSON response.
     */
    async post<T>(url: string, data: any, config: Config = {}, isFormData: boolean = false): Promise<ApiResponse<T>> {
      const response = await fetch(baseURL + url, {
        method: "POST",
        ...config,
        headers: getHeaders(config, isFormData),
        body: isFormData ? data : JSON.stringify(data),
      });

      return await response.json();
    },

    /**
     * @function postFile
     * @description Uploads a file using a POST request with FormData.
     * @param {string} url - The endpoint URL.
     * @param {FormData} data - The FormData object containing the file.
     * @param {Config} [config={}] - Optional request configuration.
     * @returns {Promise<ApiResponse<T>>} - The JSON response.
     */
    async postFile<T>(url: string, data: FormData, config: Config = {}): Promise<ApiResponse<T>> {
      const response = await fetch(baseURL + url, {
        method: "POST",
        ...config,
        headers: {
          ...config.headers,
        },
        body: data,
      });

      return await response.json();
    },

    /**
     * @function put
     * @description Makes a PUT request with JSON or form data.
     * @param {string} url - The endpoint URL.
     * @param {any} data - The request payload.
     * @param {Config} [config={}] - Optional request configuration.
     * @param {boolean} [isFormData=false] - Indicates if the data is FormData.
     * @returns {Promise<ApiResponse<T>>} - The JSON response.
     */
    async put<T>(url: string, data: any, config: Config = {}, isFormData: boolean = false): Promise<ApiResponse<T>> {
      const response = await fetch(baseURL + url, {
        method: "PUT",
        ...config,
        headers: getHeaders(config, isFormData),
        body: isFormData ? data : JSON.stringify(data),
      });

      return await response.json();
    },

    /**
     * @function delete
     * @description Makes a DELETE request to the specified URL.
     * @param {string} url - The endpoint URL.
     * @param {Config} [config={}] - Optional request configuration.
     * @returns {Promise<ApiResponse<T>>} - The JSON response.
     */
    async delete<T>(url: string, config: Config = {}): Promise<ApiResponse<T>> {
      const response = await fetch(baseURL + url, {
        method: "DELETE",
        ...config,
        headers: getHeaders(config),
      });

      return await response.json();
    },

    /**
     * @function asyncFetchContent
     * @description Fetches content from the specified endpoint in either JSON or text format.
     * @param {string} endpoint - The API endpoint.
     * @param {'text' | 'json'} [type='json'] - The expected response type.
     * @returns {Promise<any>} - The fetched content.
     */
    async asyncFetchContent(endpoint: string, type: "text" | "json" = "json"): Promise<any> {
      const validResponseTypes = ["text", "json"];
      const response = await fetch(endpoint);

      if (validResponseTypes.includes(type)) {
        return await response[type]();
      }

      return response;
    },
  };

  return api;
}

// Create an instance of the HTTP handler with an optional base URL.
export const http = createHttpHandler();