"use client"

import { File } from "@/lib/models/upload"
import { ChevronRight, Home } from "lucide-react"
import { useRouter } from "next/navigation"

interface BreadCrumbProps {
  file: File
}

export function Breadcrumb({ file }: BreadCrumbProps) {
  const router = useRouter()
  if (!file) {
    return null
  }

  return (
    <nav className="items-center text-sm text-gray-600 dark:text-gray-400 mb-4 hidden sm:flex">
      <Home className="w-4 h-4 text-gray-500 dark:text-gray-300 cursor-pointer" onClick={() => router.push("/dashboard")} />
      <ChevronRight className="w-4 h-4 mx-1" />
      <span className="font-medium text-gray-800 dark:text-gray-200 cursor-pointer" onClick={() => router.push("/dashboard")}>Files</span>
      <ChevronRight className="w-4 h-4 mx-1" />
      <span className="font-medium text-gray-800 dark:text-gray-200 truncate max-w-[50%] sm:max-w-full">{file.fileName}</span>
    </nav>
  )
}