import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { formatDistanceToNowStrict, format } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c === "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export function getJsonFromLocalstorage(key: string) {
  try {
    return JSON.parse(localStorage.getItem(key) || "")
  } catch (error) {
    return null
  }
}

export function updateJsonFromLocalStorage(key: string, value: Object) {
  try {
    let existing = getJsonFromLocalstorage(key)
    if (!existing) {
      existing = {}
    }
    const updated = { ...existing, ...value }
    localStorage.setItem(key, JSON.stringify(updated))
  } catch (error) {
    return null
  }
}

export const parseRouteParams = (endpoint: string, params: { [key: string]: any }): string => {
  if (!endpoint || !params) {
    return endpoint
  }
  if (typeof params !== "object") {
    params = {}
  }
  if (!Object.keys(params).length) {
    return endpoint
  }

  return endpoint.replace(/{{(.*?)}}/g, (match, paramName) => {
    if (!params[paramName]) {
      return ""
    }
    return params[paramName]
  })
}

export const isJson = (str: string) => {
  try {
    JSON.parse(str)
  } catch (e) {
    return false
  }
  return true
}

/**
 * Converts bytes into a human-readable format (B, KB, MB, GB, etc.).
 * @param bytes - The number of bytes to convert.
 * @param decimals - The number of decimal places (default is 2).
 * @returns A formatted string representing the size.
 */
export const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return "0 B"

  const k = 1024
  const sizes = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${(bytes / Math.pow(k, i)).toFixed(decimals)} ${sizes[i]}`
}

/**
 * Returns a human-readable time difference between a given date and now.
 * - Uses shortened units (e.g., "2 hrs ago", "5 days ago").
 * - If shortened=false (default), adds "ago" (e.g., "2 days ago").
 * - If the date exceeds 11 months, returns a formatted date like "12 March, 2023".
 *
 * @param {Date | string} date - The date to compare with the current time.
 * @param {boolean} [shortened=false] - Whether to return a shortened version (without "ago").
 * @returns {string} - A formatted string representing the time difference.
 */
export function timeAgo(date: Date | string, shortened: boolean = false): string {
  const now = new Date()
  const dateObj = typeof date === "string" ? new Date(date) : date

  const diffInMonths = (now.getFullYear() - dateObj.getFullYear()) * 12 + now.getMonth() - dateObj.getMonth()

  // If the difference is more than 11 months, return a formatted date
  if (diffInMonths > 11) {
    return format(dateObj, "d MMMM, yyyy") // Example: "12 March, 2023"
  }

  // Get a strict time difference like "2 hours", "5 days", etc.
  const distance = formatDistanceToNowStrict(dateObj, { roundingMethod: "round", addSuffix: false })

  // Extract numeric value and unit using standard regex capturing groups
  const match = distance.match(/(\d+)\s(\w+)/)
  if (!match) return "Just now" // Fallback for unexpected cases

  const value = match[1]
  const unit = match[2]

  const shortUnit: Record<string, string> = {
    second: "sec",
    seconds: "secs",
    minute: "min",
    minutes: "mins",
    hour: "hr",
    hours: "hrs",
    day: "day",
    days: "days",
    month: "mo",
    months: "mo",
    year: "yr",
    years: "yr"
  }

  const formattedUnit = shortUnit[unit] || unit

  return shortened ? `${value} ${formattedUnit}` : `${value} ${formattedUnit} ago` // Example: "2 hrs ago"
}

/**
 * Converts a human-readable storage size string (e.g., "100MB", "1KB", "2MB", "11GB") to bytes.
 * @param {string} sizeStr - The size string (case-insensitive, e.g., "100MB", "2GB").
 * @returns {number} - The equivalent size in bytes.
 * @throws {Error} - If the input format is invalid.
 */
export function parseSizeToBytes(sizeStr: string): number {
  const units: { [key: string]: number } = {
    b: 1,
    kb: 1024,
    mb: 1024 ** 2,
    gb: 1024 ** 3,
    tb: 1024 ** 4,
  };

  // Extract the numeric value and unit from the string (e.g., "100MB" -> ["100", "MB"])
  const match = sizeStr.toLowerCase().match(/^(\d+(?:\.\d+)?)\s*(b|kb|mb|gb|tb)$/);

  if (!match) {
    throw new Error(`Invalid size format: ${sizeStr}`);
  }

  const value = parseFloat(match[1]); // Extract number (e.g., 100)
  const unit = match[2]; // Extract unit (e.g., "MB")

  return value * units[unit]; // Convert to bytes
}


/**
 * Convert an object URL to a Blob.
 * 
 * This function fetches the content of an object URL and returns it as a Blob.
 * 
 * @param objectUrl - The object URL pointing to a file or resource.
 * @returns A Promise resolving to a Blob containing the file data.
 * @throws Error if the fetch operation fails.
 */
export async function objectUrlToBlob(objectUrl: string): Promise<Blob> {
  const response = await fetch(objectUrl);
  if (!response.ok) throw new Error("Failed to fetch the object URL");
  return await response.blob();
}

/**
 * Convert an object URL to a text string.
 * 
 * This function fetches the content of an object URL and returns it as a text string.
 * Useful for reading text-based files such as .txt, .csv, .json, or .md.
 * 
 * @param objectUrl - The object URL pointing to a text-based file.
 * @returns A Promise resolving to a string containing the text content.
 * @throws Error if the fetch operation fails.
 */
export async function objectUrlToText(objectUrl: string): Promise<string> {
  const response = await fetch(objectUrl);
  if (!response.ok) throw new Error("Failed to fetch the object URL");
  return await response.text();
}

/**
 * Converts an HTML string into plain text by removing HTML tags and decoding common HTML entities.
 * 
 * The function performs the following transformations:
 * - Replaces `<br>` and `<p>` tags with newlines.
 * - Converts anchor (`<a>`) tags into the format "text (link)".
 * - Removes all other HTML tags.
 * - Decodes common HTML entities such as `&nbsp;`, `&amp;`, `&lt;`, `&gt;`, `&quot;`, and `&#39;`.
 * - Collapses multiple spaces into a single space and multiple newlines into a single newline.
 * - Trims leading and trailing whitespace.
 * 
 * @param html - The HTML string to be converted into plain text.
 * @returns The plain text representation of the input HTML.
 */
export function htmlToText(html: string): string {
  // Replace <br> and <p> with newlines
  let text = html
    .replace(/<\s*br\s*\/?>/gi, '\n')
    .replace(/<\s*p[^>]*>/gi, '\n')
    .replace(/<\/p>/gi, '\n');

  // Replace anchor tags with "text (link)"
  text = text.replace(
    /<a [^>]*href="([^"]+)"[^>]*>(.*?)<\/a>/gi,
    (_match, href, linkText) => `${linkText} (${href})`
  );

  // Remove all other HTML tags
  text = text.replace(/<[^>]+>/g, '');

  // Decode common HTML entities
  text = text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  // Collapse multiple spaces/newlines
  text = text.replace(/\s{2,}/g, ' ').replace(/\n{2,}/g, '\n').trim();

  return text;
}
