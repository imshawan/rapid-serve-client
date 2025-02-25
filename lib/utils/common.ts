import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function getJsonFromLocalstorage(key: string) {
  try {
    return JSON.parse(localStorage.getItem(key) || '');
  } catch (error) {
    return null;
  }
}

export function updateJsonFromLocalStorage(key: string, value: Object) {
  try {
    let existing = getJsonFromLocalstorage(key);
    if (!existing) {
      existing = {};
    }
    const updated = { ...existing, ...value };
    localStorage.setItem(key, JSON.stringify(updated));
  } catch (error) {
    return null;
  }
}

export const parseRouteParams = (endpoint: string, params: { [key: string]: any }): string => {
  if (!endpoint || !params) {
    return endpoint;
  }
  if (typeof params !== "object") {
    params = {};
  }
  if (!Object.keys(params).length) {
    return endpoint;
  }

  return endpoint.replace(/{{(.*?)}}/g, (match, paramName) => {
    if (!params[paramName]) {
      return "";
    }
    return params[paramName];
  });
}

export const isJson = (str: string) => {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}