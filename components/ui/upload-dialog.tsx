
import { useState, useEffect, useRef, SetStateAction, Dispatch } from "react"
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

interface UploadDialogProps {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  onUploadComplete?: (file: File) => void
}

export function UploadDialog({open, setOpen}: UploadDialogProps) {
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadModal, setUploadModal] = useState(false)
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setUploadProgress(0)

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
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