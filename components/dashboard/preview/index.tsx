"use client"

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { File } from "@/lib/models/upload"
import { renderers } from "./renderers"
import { getMimeType } from "@/lib/utils/mimetype";
import { MAX_PREVIEW_FILE_SIZE } from "@/common/constants";
import { toast } from "@/hooks/use-toast";
import { downloader } from "@/services/api/chunk-download";
import { FilePreviewLoading } from "./preview-loading";
import { PreviewError } from "./preview-error";
import { Download as DownloadDialog } from "@/components/download"
import { ShareDialog } from "@/components/ui/share-dialog";
import { useFiles } from "@/hooks/use-files";

interface PreviewProps {
  file: File;
  outerClassname?: string
  className?: string
}

export function Preview({ file, className, outerClassname }: PreviewProps) {
  const [loading, setLoading] = useState(false)
  const [previewData, setPreviewData] = useState<string>("")
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState("")

  const { setShareDialog, shareOpen, setFileLoadingState, loadFileMeta, setDownloadOpen } = useFiles()

  const mimeType = useMemo(() => getMimeType(file?.fileName || ""), [file?.fileName])
  const fileType = useMemo(() => {
    if (!mimeType.length) return "unknown";
    let type = mimeType.split("/")[0].toLowerCase()
    if (type === "application") type = mimeType.split("/")[1].toLowerCase();

    return type
  }, [mimeType])

  const currentFile = useRef("")

  const onDownload = (fileId: string) => {
    setFileLoadingState(fileId)
    loadFileMeta(fileId, () => {
      setDownloadOpen(true)
      setFileLoadingState("")
    }, () => {
      setFileLoadingState("")
    })
  }

  const onShare = (fileName: string, fileId: string) => {
    setShareDialog({ isOpen: true, fileName, fileId })
  }

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
  const props = { className, outerClassname, onDownload, onShare, mimeType }
  return (
    <Fragment>
      <Renderer file={file} data={previewData} {...props} />
      <DownloadDialog />
      <ShareDialog
        isOpen={shareOpen.isOpen}
        onClose={() => setShareDialog({ isOpen: false, fileName: "", fileId: "" })}
        fileName={shareOpen.fileName}
        fileId={shareOpen.fileId}
      />
    </Fragment>
  )
}
