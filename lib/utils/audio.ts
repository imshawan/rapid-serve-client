/**
 * @file audio.ts
 * @description Utility functions for extracting metadata from media files and formatting playback time.
 * @author Shawan Mandal <github@imshawan.dev>
 */

import { parseBlob } from "music-metadata"

/**
 * Extracts cover art from a media file blob.
 *
 * @param {Blob} blob - The media file as a Blob.
 * @returns {Promise<{ picture?: string } & import("music-metadata").ICommonTagsResult | null>} 
 *          An object containing metadata and the extracted cover art as a blob URL, or null on failure.
 */
export async function getMediaCoverArt(blob: Blob) {
  try {
    const metadata = await parseBlob(blob)
    const picture = metadata.common.picture?.[0]
    let pictureBlob = ""

    if (picture) {
      const imageBlob = new Blob([new Uint8Array(picture.data)], {
        type: picture.format,
      })
      pictureBlob = URL.createObjectURL(imageBlob)
    }

    return {
      ...metadata.common,
      picture: pictureBlob,
    }
  } catch (error) {
    console.error("Error extracting cover art:", error)
    return null
  }
}

/**
 * Formats playback time from seconds into a human-readable format.
 *
 * @param {number} seconds - Time in seconds.
 * @returns {string} Formatted time string (hh:mm:ss or mm:ss).
 */
export function formatPlaybackTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = Math.floor(seconds % 60)

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}
