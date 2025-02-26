
import { useState, useRef, SetStateAction, Dispatch, useCallback, Fragment } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AlertCircle, CheckCircle, FileText, Maximize2, Minus, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { splitFileIntoChunks, calculateSHA256 } from "@/lib/utils/chunk"
import { uploader } from "@/services/api/chunk-upload"
import { useFiles } from "@/hooks/use-files"

interface UploadDialogProps {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  onUploadComplete?: (file: File) => void
}

export function UploadDialog({ open, setOpen }: UploadDialogProps) {
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
  const [isMinimized, setIsMinimized] = useState<boolean>(false)
  const { appendUpdatedFile } = useFiles()

  const reset = () => {
    setFile(null)
    setUploadProgress(0)
    setStatus('idle')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    setOpen(false)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setUploadProgress(0)
      setStatus('idle')
    }
  }

  const uploadFile = useCallback(async () => {
    if (!file) return

    try {
      setStatus('uploading')
      setUploadProgress(0)

      const chunks = splitFileIntoChunks(file)
      const chunkHashes = await Promise.all(chunks.map(calculateSHA256))

      // Step 1: Register upload and get pre-signed URLs
      const registerResponse = await uploader.register({
        fileName: file.name,
        fileSize: file.size,
        chunkHashes,
      })

      if (!registerResponse.success) throw new Error('File Registration failed')
      const { fileId, uploadChunks, missingChunks, file: registeredFile } = registerResponse.data as FileUploadStatus
      if (!missingChunks.length) {
        toast({
          title: "Duplication Warning",
          description: `${file.name} already exists in your drive`,
          variant: "warning",
        })
        setStatus('success')
        return
      }

      // Add the file to store
      appendUpdatedFile({ ...registeredFile, isUploading: true })

      // Step 3: Upload missing chunks
      const totalChunks = uploadChunks.length
      let completedChunks = 0

      for (const uploadChunk of uploadChunks) {
        const { hash, token } = uploadChunk
        const chunkIndex = chunkHashes.indexOf(hash)
        const chunk = chunks[chunkIndex]

        const formData = new FormData()
        formData.append('chunk', chunk)

        await uploader.upload({ params: { token, fileId, hash }, chunk: formData })

        completedChunks++
        setUploadProgress((completedChunks / totalChunks) * 100)
      }

      // // Step 3: Confirm upload completion
      await uploader.markComplete(fileId)

      appendUpdatedFile(registeredFile)

      // setStatus('success')
      toast({
        title: "Upload successful",
        description: `${file.name} has been uploaded successfully`,
        variant: "success",
      })
    } catch (error: any) {
      console.error('Upload failed:', error)
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      })
      setStatus('error')
    } finally {
      reset()
    }
  }, [file]);

  return (
    <Fragment>
      {isMinimized && file && (
        <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-3 w-80 sm:w-[380px]">
          <FileText className="h-5 w-5 sm:w-6 sm:h-6 text-xl text-gray-300" />
          <div className="flex-1 w-3">
            <p className="text-xs sm:text-sm truncate">{file.name}</p>
            <p className="text-xxs sm:text-xs text-gray-400">{uploadProgress.toFixed(0)}% uploaded</p>
            <div className="w-full bg-gray-600 h-1 rounded-full overflow-hidden mt-1">
              <div
                className="bg-blue-500 h-1 transition-all"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="text-white h-6 w-6 sm:w-7 sm:h-7"
            onClick={() => setIsMinimized(false)}
          >
            <Maximize2 className="h-5 w-5" />
          </Button>
        </div>
      )}

      {!isMinimized && <Dialog modal={true} open={open} onOpenChange={setOpen}>
        <DialogContent className="h-full sm:h-auto sm:min-w-[60%] lg:min-w-[40%]" onPointerDownOutside={(event) => event.preventDefault()}
          actionButtons={
            <>
              {status === "uploading" ? <button
                className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
                onClick={() => setIsMinimized(true)}>
                <Minus className="h-5 w-5" />
              </button> : null}
              <button
                className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
                onClick={() => status === "uploading" ? setIsMinimized(true) : setOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </>
          }
        >
          <DialogHeader>
            <DialogTitle>Upload File</DialogTitle>
            <DialogDescription>
              Choose a file to upload to your cloud storage.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="border-2 border-dashed rounded-lg p-8 text-center space-y-4">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
              <div>
                <Input
                  type="file"
                  className="hidden"
                  id="file-upload"
                  onChange={handleFileChange}
                  disabled={status === "uploading"}
                  ref={fileInputRef}
                />
                <Label htmlFor="file-upload">
                  <div className="space-y-2 cursor-pointer">
                    <p className="text-sm text-muted-foreground">
                      Drag and drop your files here, or click to select files
                    </p>
                    <Button variant="secondary" onClick={() => fileInputRef.current ? fileInputRef.current.click() : null} disabled={status === "uploading"}>
                      Choose File
                    </Button>
                  </div>
                </Label>
              </div>
            </div>
            {file && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{file.name}</span>
                  <span className="text-sm">
                    {(Number(file.size) / (1024 * 1024)).toFixed(2)} MB
                  </span>
                </div>
                <Progress value={uploadProgress} className="w-full" />
                {status === 'idle' && (
                  <Button
                    onClick={uploadFile}
                    className="w-full py-2 px-4 transition-colors"
                  >
                    Start Upload
                  </Button>
                )}
                {status === 'uploading' && (
                  <div className="flex items-center justify-center text-blue-400">
                    <span className="animate-pulse">Uploading...</span>
                  </div>
                )}
                {/* {status === 'success' && (
                  <div className="flex items-center justify-center text-green-400">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    <span>Upload complete!</span>
                  </div>
                )} */}
                {status === 'error' && (
                  <div className="flex items-center justify-center text-red-400">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    <span>Upload failed. Please try again.</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>}
    </Fragment>
  )
} 