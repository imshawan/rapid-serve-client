/**
 * @file renderers.ts
 * @description Defines a mapping of media types to their respective rendering components.
 * @author Shawan Mandal <github@imshawan.dev>
 */

import Image from "./image";
import Text from "./text";
import Unknown from "./unknown";
import Video from "./video";
import Audio from "./audio";
import PdfViewer from "./pdf";

/**
 * A mapping of supported media types to their respective renderer components.
 * This allows dynamic rendering based on file type.
 */
export const renderers = {
  image: Image,   // Component for rendering image previews
  text: Text,     // Component for rendering text-based previews
  video: Video,   // Component for rendering video previews
  audio: Audio,   // Component for rendering audio previews
  pdf: PdfViewer, // Component for rendering pdf documents
  unknown: Unknown, // Fallback component for unsupported file types
};
