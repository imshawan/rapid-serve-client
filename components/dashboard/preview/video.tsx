import { File } from "@/lib/models/upload"
import { cn } from "@/lib/utils/common"

interface VideoProps {
  file: File
  data: string
  mimeType: string
  outerClassname?: string
  className?: string
}

export default function Video({ file, data, mimeType, className, outerClassname }: VideoProps) {
  return (
    <div className={cn("h-full flex items-center justify-center p-4 ", outerClassname)}>
      <video className={cn("h-full h-screen sm:h-[calc(100vh-100px)]", className)} controls>
        <source src={data} type={mimeType} />
      </video>
    </div>
  )
}
