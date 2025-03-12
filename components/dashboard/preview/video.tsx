import { File } from "@/lib/models/upload"

interface VideoProps {
  file: File
  data: string
  mimeType: string
}

export default function Video({ file, data, mimeType }: VideoProps) {
  return (
    <div className="h-full flex items-center justify-center p-4 ">
      <video className="h-full" controls>
        <source src={data} type={mimeType} />
      </video>
    </div>
  )
}
