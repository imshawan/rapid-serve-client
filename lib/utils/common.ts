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
 * - If the date exceeds 11 months, returns a formatted date like "12 March, 2023".
 *
 * @param {Date} date - The date to compare with the current time.
 * @returns {string} - A formatted string representing the time difference.
 */
export function timeAgo(date: Date): string {
  const now = new Date()

  const diffInMonths = (now.getFullYear() - date.getFullYear()) * 12 + now.getMonth() - date.getMonth()

  // If the difference is more than 11 months, return a formatted date
  if (diffInMonths > 11) {
    return format(date, "d MMMM, yyyy") // Example: "12 March, 2023"
  }

  // Get a strict time difference like "2 hours", "5 days", etc.
  const distance = formatDistanceToNowStrict(date, { roundingMethod: "round", addSuffix: false })

  // Extract numeric value and unit using standard regex capturing groups
  const match = distance.match(/(\d+)\s(\w+)/)
  if (!match) return "Just now" // Fallback for unexpected cases

  const value = match[1]
  const unit = match[2]

  const shortUnit =
    unit.startsWith("hour") ? "hr" :
      unit.startsWith("minute") ? "min" :
        unit.startsWith("second") ? "sec" :
          unit.startsWith("day") ? "day" :
            unit.startsWith("month") ? "mo" : unit

  return `${value} ${shortUnit} ago` // Example: "2 hrs ago"
}
