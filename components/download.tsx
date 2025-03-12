"use client";

import { useState } from "react";
import {
  Download as DownloadIcon,
  CheckCircle,
  AlertCircle,
  FileIcon,
  Calendar,
  HardDrive,
  Star,
  StarOff,
  RefreshCw,
  Shield,
  Zap,
  Puzzle
} from "lucide-react";
import { calculateSHA256 } from "@/lib/utils/chunk";
import { Progress } from "@/components/ui/progress";
import { downloader } from "@/services/api/chunk-download";
import { useFiles } from "@/hooks/use-files";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { formatBytes, timeAgo } from "@/lib/utils/common";
import { toast } from "@/hooks/use-toast";

interface DownloadStats {
  speed: number;
  timeRemaining: number;
  downloaded: number;
}

export function Download() {
  const { downloadOpen, fileMeta: fileData, setDownloadOpen } = useFiles()
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"idle" | "downloading" | "success" | "error">("idle");
  const [error, setError] = useState<string>("");
  const [stats, setStats] = useState<DownloadStats>({
    speed: 0,
    timeRemaining: 0,
    downloaded: 0
  });
  const [isStarred, setIsStarred] = useState(false);

  const formatSpeed = (bytesPerSecond: number): string => {
    return `${formatBytes(bytesPerSecond)}/s`;
  };

  const formatTimeRemaining = (seconds: number): string => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}m ${Math.round(seconds % 60)}s`;
    return `${Math.round(seconds / 3600)}h ${Math.round((seconds % 3600) / 60)}m`;
  };

  const toggleStar = async () => {
    // try {
    //   const response = await fetch(`/api/files/${fileId}/star`, {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify({ isStarred: !isStarred }),
    //   });

    //   if (response.ok) {
    //     setIsStarred(!isStarred);
    //   }
    // } catch (error) {
    //   console.error("Error toggling star:", error);
    // }
  };

  const downloadFile = async () => {
    try {
      if (!fileData) return;
      if (error) {
        retry()
      }

      setStatus("downloading");
      setProgress(0);

      const { chunks, file, mimeType } = fileData

      const startTime = Date.now();
      const chunkBuffers: ArrayBuffer[] = new Array(chunks.length);
      let completedChunks = 0;
      let totalBytesDownloaded = 0;

      // Download progress update interval
      const progressInterval = setInterval(() => {
        const elapsedSeconds = (Date.now() - startTime) / 1000;
        const bytesPerSecond = totalBytesDownloaded / elapsedSeconds;
        const remaining = file.fileSize - totalBytesDownloaded;
        const timeRemaining = remaining / bytesPerSecond;

        setStats({
          speed: bytesPerSecond,
          timeRemaining,
          downloaded: totalBytesDownloaded
        });
      }, 1000);

      // Download and verify chunks
      for (let index = 0; index < chunks.length; index++) {
        const { hash, token, size: chunkSize } = chunks[index]
      
        const response = await downloader.getChunk({
          params: { token, fileId: fileData.file.fileId, hash }
        })
      
        if (response && !(response instanceof Response) && response.error) {
          throw new Error(response.error.message)
        }
      
        if (response instanceof Response && response.body) {
          const reader = response.body.getReader()
          if (!reader) throw new Error("Failed to read response body")
      
          let receivedLength = 0
          const chunkParts: Uint8Array[] = []
      
          while (receivedLength <= chunkSize) {
            const { done, value, } = await reader.read()
            if (done) break
      
            receivedLength += value.byteLength
            totalBytesDownloaded += value.byteLength
            chunkParts.push(value)
      
            // Progress Update Based on Actual Downloaded Size
            setProgress((totalBytesDownloaded / fileData.file.fileSize) * 100)
          }
      
          // Merge streamed parts correctly
          const buffer = new Uint8Array(receivedLength)
          let position = 0
          for (const part of chunkParts) {
            buffer.set(part, position)
            position += part.byteLength
          }
      
          // Store chunk in correct order using `index`
          chunkBuffers[index] = buffer.buffer // Store as ArrayBuffer
          completedChunks++
        }
      }

      clearInterval(progressInterval)

      // Combine chunks and trigger download
      const blob = new Blob(chunkBuffers, { type: mimeType || "application/octet-stream" })
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = file.fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // setStatus("success")
      reset()
      setDownloadOpen(false)

      toast({
        title: "Download complete",
        description: `${file.fileName} has been downloaded successfully.`,
      })
    } catch (error: any) {
      console.error("Download error:", error);
      toast({
        title: "Download error",
        description: error.message,
        variant: "destructive"
      })
      setStatus("error");
    }
  };

  const reset = () => {
    setStatus("idle");
    setError("");
    setProgress(0);
    setStats({
      speed: 0,
      timeRemaining: 0,
      downloaded: 0
    });
  }

  const retry = () => {
    reset()
    downloadFile()
  };

  return (
    <Dialog modal={true} open={downloadOpen} onOpenChange={(value: boolean) => setDownloadOpen(value)}>
      <DialogContent className="h-auto w-[90%] sm:min-w-[60%] lg:min-w-[40%]" onPointerDownOutside={(event) => event.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-sm sm:text-lg">Download File</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Your file is ready for download. Click the button below to start the download.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-8 mt-2 transition-all duration-200">
          {/* File Information */}
          {fileData && fileData.file && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                    <FileIcon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs sm:text-sm text-gray-900 dark:text-gray-100">
                      {fileData.file.fileName}
                    </h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-400">
                        {formatBytes(fileData.file.fileSize)}
                      </span>
                      <span className="text-gray-400">•</span>
                      <Badge
                        variant={fileData.file.status === "complete" ? "success" : "warning"}
                        className="sm:text-xs text-xxs"
                        style={{color: "hsl(var(--destructive-foreground))"}}
                      >
                        {fileData.file.status === "complete" ? "Healthy" : "Incomplete"}
                      </Badge>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleStar}
                  className="relative group"
                >
                  <div className="absolute inset-0 bg-gray-100 dark:bg-gray-900/30 rounded-full scale-0 group-hover:scale-100 transition-transform duration-200" />
                  {isStarred ? (
                    <Star className="w-4 sm:w-5 h-4 sm:h-5 text-yellow-500 relative z-10" />
                  ) : (
                    <Star className="w-4 sm:w-5 h-4 sm:h-5 text-gray-400 relative z-10" />
                  )}
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <Calendar className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Created</p>
                    <p className="text-xxs sm:text-sm font-medium text-gray-900 dark:text-gray-100">
                      {timeAgo(new Date(fileData.file.createdAt))}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <Puzzle className="w-5 h-5 text-green-500 dark:text-green-400" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Total Part(s)</p>
                    <p className="text-xxs sm:text-sm font-medium text-gray-900 dark:text-gray-100">
                      {fileData.file.chunkHashes.length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Download Progress */}
          {status !== "idle" && (
            <div className="space-y-6 transition-all duration-200">
              {status !== "success"  && status === "downloading" && <div className="">
                <div className="flex justify-end mb-1">
                  <span className="text-xs sm:text-sm font-medium">
                    {Math.round(progress)}%
                  </span>
                </div>
                <Progress
                  value={progress}
                  className="h-3 bg-gray-100 dark:bg-gray-700"
                // indicatorClassName="bg-gradient-to-r from-blue-500 to-indigo-500"
                />

              </div>}

              {status === "downloading" && stats.speed > 0 && (
                <div className="grid grid-cols-3 gap-0 sm:gap-6">
                  {[
                    { label: "Transfer Speed", value: formatSpeed(stats.speed), icon: Zap },
                    { label: "ETA", value: formatTimeRemaining(stats.timeRemaining), icon: Calendar },
                    { label: "Downloaded", value: formatBytes(stats.downloaded), icon: HardDrive }
                  ].map((stat, index) => (
                    <div key={index} className="p-3 sm:p-4 bg-white dark:bg-gray-700 rounded-xl shadow-sm">
                      <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 mb-1">
                        <stat.icon className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="text-xxxs sm:text-xs uppercase">{stat.label}</span>
                      </div>
                      <p className="text-xxs sm:text-xs text-gray-900 dark:text-gray-100">{stat.value}</p>
                    </div>
                  ))}
                </div>
              )}

              {status === "downloading" && (
                <div className="flex items-center justify-center p-3 md:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <RefreshCw className="w-5 h-5 mr-3 text-blue-500 animate-spin" />
                  <span className="text-blue-600 dark:text-blue-400 font-medium text-xs md:text-base">Processing your download...</span>
                </div>
              )}

              {/* {status === "success" && (
                <div className="flex items-center justify-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                  <CheckCircle className="w-5 h-5 mr-3 text-green-500" />
                  <span className="text-green-600 dark:text-green-400 font-medium">Download complete!</span>
                </div>
              )} */}

              {/* {status === "error" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-center p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
                    <AlertCircle className="w-5 h-5 mr-3 text-red-500" />
                    <span className="text-red-600 dark:text-red-400 font-medium">{error || "Download failed"}</span>
                  </div>
                  <Button
                    variant="outline"
                    onClick={retry}
                    className="w-full border-2 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Try Again
                  </Button>
                </div>
              )} */}
            </div>
          )}

          {/* Download Button */}
          {status !== "downloading" && status !== "success" && <div className="flex items-center gap-2">
            <Button
              onClick={downloadFile}
              className="w-full h-10 sm:h-12 px-6 sm:px-4 xs:px-3 
                text-base text-xs sm:text-sm 
                bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 
                dark:from-gray-200 dark:to-gray-300 dark:hover:from-gray-300 dark:hover:to-gray-400 dark:text-gray-900 
                text-white font-medium rounded-xl shadow-lg transform transition-all duration-200 hover:scale-[1.02] 
                disabled:opacity-50 disabled:hover:scale-100"

            >
              {status === "error" ? (
                <>
                  <RefreshCw className="w-4 sm:w-5 h-4 sm:h-5 mr-2" />
                  Retry
                </>
              ) : (
                <>
                  <DownloadIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2" />
                  Download
                </>
              )}
              
            </Button>
          </div>}
        </div>

      </DialogContent>
    </Dialog>
  );
}