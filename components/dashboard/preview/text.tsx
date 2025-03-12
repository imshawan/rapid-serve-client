import { File } from "@/lib/models/upload"
import { objectUrlToText } from "@/lib/utils/common"
import { useEffect, useState } from "react"

interface TextProps {
  file: File
  data: string
}

export default function Text({ file, data }: TextProps) {
  const [text, setText] = useState("")

  useEffect(() => {
    objectUrlToText(data)
      .then((text) => setText(text))
      .catch((error) => {
        console.error("Error fetching file:", error)
      })
  }, [data])

  return (
    <div className="w-full h-full p-4 overflow-auto">
      <pre className="text-sm whitespace-pre-wrap font-mono">
        {text}
      </pre>
    </div>
  )
}
