
import { useState, useEffect, useRef, SetStateAction, Dispatch, useCallback } from "react"
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
import { FileText } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { splitFileIntoChunks, calculateSHA256 } from "@/lib/utils/chunk"

interface UploadDialogProps {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  onUploadComplete?: (file: File) => void
}

export function UploadDialog({ open, setOpen }: UploadDialogProps) {
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setUploadProgress(0);
      setStatus('idle');
    }
  };

  const uploadFile = useCallback(async () => {
    if (!file) return;

    try {
      setStatus('uploading');
      const chunks = splitFileIntoChunks(file);
      const chunkHashes = await Promise.all(chunks.map(calculateSHA256));

      // Step 1: Register upload and get pre-signed URLs
      const registerResponse = await fetch('/api/upload/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          fileSize: file.size,
          chunkHashes,
        }),
      });

      if (!registerResponse.ok) throw new Error('Registration failed');
      const { fileId, uploadUrls } = await registerResponse.json();

      // Step 2: Upload chunks using pre-signed URLs
      let completedChunks = 0;
      await Promise.all(
        uploadUrls.map(async ({ hash, url }: {hash: string; url: string}, index: number) => {
          const chunk = chunks[chunkHashes.indexOf(hash)];
          const response = await fetch(url, {
            method: 'POST',
            body: chunk,
          });

          if (!response.ok) throw new Error(`Chunk upload failed: ${hash}`);
          completedChunks++;
          setUploadProgress((completedChunks / chunks.length) * 100);
        })
      );

      // Step 3: Confirm upload completion
      const completeResponse = await fetch('/api/upload/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileId }),
      });

      if (!completeResponse.ok) throw new Error('Completion failed');
      setStatus('success');
    } catch (error) {
      console.error('Upload error:', error);
      setStatus('error');
    }
  }, [file]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setUploadProgress(0)

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev: any) => {
        if (prev === null || prev >= 100) {
          clearInterval(interval)
          setIsUploading(false)
          setOpen(false)
          toast({
            title: "Upload complete",
            description: `${file.name} has been uploaded successfully.`
          })
          return null
        }
        return prev + 10
      })
    }, 500)
  }


  return (
    <Dialog modal={true} open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]" onPointerDownOutside={(event) => event.preventDefault()}>
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
                onChange={handleFileUpload}
                disabled={isUploading}
                ref={fileInputRef}
              />
              <Label htmlFor="file-upload">
                <div className="space-y-2 cursor-pointer">
                  <p className="text-sm text-muted-foreground">
                    Drag and drop your files here, or click to select files
                  </p>
                  <Button variant="secondary" onClick={() => fileInputRef.current ? fileInputRef.current.click() : null} disabled={isUploading}>
                    Choose File
                  </Button>
                </div>
              </Label>
            </div>
          </div>
          {uploadProgress !== null && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}