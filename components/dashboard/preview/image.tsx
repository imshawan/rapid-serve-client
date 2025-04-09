import { File } from "@/lib/models/upload";
import { cn } from "@/lib/utils/common";

interface ImageProps {
  file: File
  data: string
  outerClassname?: string
  className?: string
}

export default function Image({ file, data, outerClassname, className }: ImageProps) {
  return (
    <div className={cn("w-full h-full flex items-center justify-center p-4", outerClassname)}>
      {data ? <img
        src={data}
        alt={file.fileName}
        className={cn("h-full object-contain p-0 h-screen sm:h-[calc(100vh-100px)]", className)}
      /> : ""}
    </div>
  )
}