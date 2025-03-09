"use client"

import { ArrowLeft, Eye, FileQuestion, FolderPlus, Share2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "../ui/button"
import { EmptyState } from "../ui/empty-state"

interface EmptySharedStateProps {
  setActiveTab: (tab: "shared-by-me" | "shared-with-me") => void
  type: "shared-with-me" | "shared-by-me"
}

export function EmptySharedState({ type, setActiveTab }: EmptySharedStateProps) {
  const router = useRouter()
  const isSharedWithMe = type === "shared-with-me"

  const handlePrimaryCta = () => {
    if (isSharedWithMe) {
      setActiveTab("shared-by-me")
    } else {
      setActiveTab("shared-with-me")
    }
  }

  const handleSecondaryCta = () => {
    router.push("/dashboard")
  }

  return (
    <EmptyState
      icon={isSharedWithMe ? (
        <Share2 className="h-8 w-8 text-muted-foreground" />
      ) : (
        <FolderPlus className="h-8 w-8 text-muted-foreground" />
      )}
      title={isSharedWithMe ? "No files shared with you" : "Start sharing your files"}
      description={isSharedWithMe ?
        `Check the "Shared by me" tab to see files you've shared with others, or ask your teammates to share files with you.`
        :
        `Share your files and folders with others to collaborate. They'll appear here once shared.`}
      action={
        <div className="space-y-4">
          <div className="flex flex-col space-y-3 sm:flex-row sm:space-x-3 sm:space-y-0">
            <Button
              onClick={handlePrimaryCta}
              className="group relative"
            >
              <span className="absolute inset-0 translate-x-1.5 translate-y-1.5 rounded-md bg-primary/10 transition-transform group-hover:translate-x-0 group-hover:translate-y-0" />
              <span className="relative flex items-center justify-center">
                <Eye className="mr-2 h-4 w-4" />
                {isSharedWithMe ? "View shared by me" : "View shared with me"}
              </span>
            </Button>
            <Button
              variant="outline"
              onClick={handleSecondaryCta}
              className="border-dashed"
            >
              {isSharedWithMe ? (
                <>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to files
                </>
              ) : (
                <>
                  <Share2 className="mr-2 h-4 w-4" />
                  Share files
                </>
              )}
            </Button>
          </div>
          <div className="text-center">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              <FileQuestion className="mr-1 h-3 w-3" />
              Learn about shared files
            </Button>
          </div>
        </div>
      }
    />
  )
}
