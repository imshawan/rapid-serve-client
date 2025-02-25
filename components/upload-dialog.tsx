
import { useState, useRef, SetStateAction, Dispatch, useCallback } from "react"
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
import { AlertCircle, CheckCircle, FileText } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { splitFileIntoChunks, calculateSHA256 } from "@/lib/utils/chunk"
import { uploader } from "@/services/api/chunk-upload"

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
      const { fileId, uploadChunks, missingChunks } = registerResponse.data as FileUploadStatus
      if (!missingChunks.length) {
        toast({
          title: "Duplication Warning",
          description: `${file.name} already exists in your drive`,
          variant: "warning",
        })
        setStatus('success')
        return
      }

      // Step 3: Upload missing chunks
      const totalChunks = uploadChunks.length
      let completedChunks = 0

      for (const uploadChunk of uploadChunks) {
        const {hash, token} = uploadChunk
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

      setStatus('success')
    } catch (error: any) {
      console.error('Upload failed:', error)
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      })
      setStatus('error')
    }
  }, [file]);

  return (
    <Dialog modal={true} open={open} onOpenChange={setOpen}>
      <DialogContent className="h-full sm:h-auto sm:min-w-[60%] lg:min-w-[40%]" onPointerDownOutside={(event) => event.preventDefault()}>
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

              {status === 'success' && (
                <div className="flex items-center justify-center text-green-400">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  <span>Upload complete!</span>
                </div>
              )}

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
    </Dialog>
  )
}