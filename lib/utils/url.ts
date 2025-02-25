
/**
 * 
 * @author Shawan Mandal <github@imshawan.dev>
 * @date 25-02-2025
 * 
 * @function urlQueryBuilder
 * @param baseURL
 * @param params 
 * @description function takes a base URL with an existing query string and additional query parameters as input. 
 * It combines the base URL and the new parameters, ensuring proper formatting with encoded query parameters.
 */
export const urlQueryBuilder = function (baseURL: string, params: {[key: string]: any} = {}): string {
    if (!baseURL) {
        throw new Error('baseUrl is a required parameter');
    }
    if (typeof baseURL != 'string') {
        throw new TypeError('baseUrl must be a string, found ' + typeof baseURL);
    }
    if (!Object.keys(params)) {
        return baseURL;
    }

    baseURL = String(baseURL).trim();

    const urlParts = baseURL.split('?');
    const baseUrl = urlParts[0];
    let queryString = urlParts[1] || '';

    const queryParams = new URLSearchParams(queryString);

    for (const [key, value] of Object.entries(params)) {
        queryParams.set(key, value);
    }

    queryString = queryParams.toString();

    const updatedUrl = queryString ? `${baseUrl}?${queryString}` : baseUrl;
    return updatedUrl;
}