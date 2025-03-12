import { useEffect, useMemo, useRef, useState } from "react";
import { File } from "@/lib/models/upload"
import { renderers } from "./renderers"
import { getMimeType } from "@/lib/utils/mimetype";
import { MAX_PREVIEW_FILE_SIZE } from "@/common/constants";
import { toast } from "@/hooks/use-toast";
import { downloader } from "@/services/api/chunk-download";
import { FilePreviewLoading } from "./preview-loading";
import {PreviewError} from "./preview-error";

interface PreviewProps {
  file: File;
  onDownload: (fileId: string) => void
}

export function Preview({ file, onDownload }: PreviewProps) {
  const [loading, setLoading] = useState(false)
  const [previewData, setPreviewData] = useState<string>("")
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState("")

  const mimeType = useMemo(() => getMimeType(file?.fileName || ""), [file?.fileName])
  const fileType = useMemo(() => {
    if (!mimeType.length) return "unknown";
    let type = mimeType.split("/")[0].toLowerCase()
    if (type === "application") type = mimeType.split("/")[1].toLowerCase();

    return type
  }, [mimeType])

  const currentFile = useRef("")

  useEffect(() => {
    if (!file || file.fileSize > MAX_PREVIEW_FILE_SIZE || file.fileId === currentFile.current) return;

    currentFile.current = file.fileId

    async function fetchPreview(file: File) {
      setLoading(true)
      const response = await downloader.getPreview(file.fileId)
      if (response && !(response instanceof Response) && response.error) {
        throw new Error(response.error.message)
      }

      let totalBytesDownloaded = 0;

      if (response instanceof Response && response.body) {
        const reader = response.body.getReader()
        if (!reader) throw new Error("Failed to read response body")

        let receivedLength = 0
        const chunkParts: Uint8Array[] = []

        while (receivedLength <= file.fileSize) {
          const { done, value, } = await reader.read()
          if (done) break

          receivedLength += value.byteLength
          totalBytesDownloaded += value.byteLength
          chunkParts.push(value)

          // Progress Update Based on Actual Downloaded Size
          setProgress(parseInt(String((totalBytesDownloaded / file.fileSize) * 100)))
        }

        // Merge streamed parts correctly
        const buffer = new Uint8Array(receivedLength)
        let position = 0
        for (const part of chunkParts) {
          buffer.set(part, position)
          position += part.byteLength
        }

        return URL.createObjectURL(new Blob([buffer], { type: mimeType }))
      }
    }

    fetchPreview(file).then((url) => {
      if (!url) {
        setError("Failed to fetch preview")
        return toast({
          title: "Error",
          description: "Failed to load preview",
          variant: "destructive"
        })
      }
      setPreviewData(url)
    }).catch((error) => {
      setError(error.message)
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
    }).finally(() => {
      setLoading(false)
    })
  }, [file])

  if (loading) {
    return (
      <FilePreviewLoading
        file={file}
        progress={progress}
        message={`Buffering ${progress}%`}
      />
    )
  }
  if (error) {
    return (
      <PreviewError
        file={file}
        errorMessage={error}
        onDownload={onDownload}
      />
    )
  }

  const Renderer = renderers[fileType as keyof typeof renderers] || renderers.unknown
  return <Renderer file={file} data={previewData} onDownload={onDownload} mimeType={mimeType} />
}
