import { File } from "@/lib/models/upload";

interface ImageProps {
  file: File
  data: string
}

export default function Image({ file, data }: ImageProps) {
  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <img
        src={data}
        alt={file.fileName}
        className="h-full object-contain"
      />
    </div>
  )
}