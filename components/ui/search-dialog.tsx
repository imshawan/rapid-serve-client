"use client"

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { useFiles } from "@/hooks/use-files"
import { Fragment, useEffect, useState } from "react"
import FileIcon from "../dashboard/file-icon"
import type { File } from "@/lib/models/upload"
import { Loader, Search } from "lucide-react"
import _ from "lodash"
import { ResourceContextMenu } from "../dashboard/resource-context-menu"
import { FilePreview } from "../dashboard/file-preview"
import { DeleteConfirmationDialog } from "./delete-confirmation"
import { TFile } from "@/store/slices/files"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface SearchDialogProps {
  isOpen: boolean
  setIsOpen: () => void
}

export function SearchDialog({ isOpen, setIsOpen }: SearchDialogProps) {
  const {
    searchFiles,
    searchedFiles,
    loading,
    loadFileMeta,
    setDownloadOpen,
    deleteFile,
    appendUpdatedFile,
    setFileInfoDialog,
    setRenameDialog,
    setShareDialog,
    renameFile,
  } = useFiles();
  const [page, setPage] = useState(1)
  const [loadingMore, setLoadingMore] = useState(false)
  const [results, setResults] = useState<{ [key: string]: File[] | null }>({
    file: null,
    folder: null
  })

  const [metaLoading, setMetaLoading] = useState("")
  const [deleting, setDeleting] = useState("")
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean; fileId: string | null, fileName: string | null }>({
    isOpen: false,
    fileId: null,
    fileName: null
  })
  const { toast } = useToast()
  const router = useRouter()

  const handleShare = (fileName: string, fileId: string) => {
    setShareDialog({ isOpen: true, fileName, fileId })
  }

  const handleFileInfo = (file: TFile) => {
    setFileInfoDialog({ isOpen: true, file })
  }

  const handleRename = (file: TFile) => {
    setRenameDialog({ isOpen: true, file })
  }

  const handlePreview = (file: TFile) => {
    router.push(["/", file.type, "/", file.fileId].join(""))
  }

  const handleDownload = (fileId: string) => {
    setMetaLoading(fileId)
    loadFileMeta(fileId, () => {
      setDownloadOpen(true)
      setMetaLoading("")
    }, () => {
      setMetaLoading("")
    })
  }

  const handleDelete = (fileId: string, fileName: string) => {
    setDeleteConfirmation({ isOpen: true, fileId, fileName })
  }

  const confirmDelete = () => {
    if (deleteConfirmation.fileId) {
      setDeleting(deleteConfirmation.fileId)
      deleteFile(deleteConfirmation.fileId, () => {
        toast({
          title: "File moved to trash",
          description: deleteConfirmation.fileName + " has been moved to the trash bin."
        })
        setDeleteConfirmation({ isOpen: false, fileId: null, fileName: null })
      },
        () => setDeleting("")
      )
    }
  }

  const confirmRename = (fileId: string, newName: string) => {
    renameFile(fileId, newName, () => {
      toast({
        title: "File renamed",
        description: `File has been renamed to "${newName}".`
      })
    },
    () => { })
  }

  const handleSearchChange = _.debounce((e: React.ChangeEvent<HTMLInputElement>) => {
    let query = String(e.target.value).trim()
    if (query) {
      setPage(1) // Reset to first page on new search
      searchFiles(query, 1, 10)
    }
  }, 400)

  const handleLoadMore = () => {
    setLoadingMore(true)
    setPage((prev) => prev + 1)
    searchFiles(searchedFiles.search, page + 1, 10)
  }

  useEffect(() => {
    if (page === 1) {
      setResults({
        file: searchedFiles.files.filter((file: File) => file.type === "file"),
        folder: searchedFiles.files.filter((file: File) => file.type === "folder")
      })
    } else {
      setResults((prev) => ({
        file: [...(prev.file || []), ...searchedFiles.files.filter((file: File) => file.type === "file")],
        folder: [...(prev.folder || []), ...searchedFiles.files.filter((file: File) => file.type === "folder")]
      }))
    }
    setLoadingMore(false)
  }, [searchedFiles.files])

  return (
    <Fragment>
      <CommandDialog open={isOpen} onOpenChange={setIsOpen} className="sm:w-[70%] lg:w-[50%] max-w-none">
        {/* <CommandInput placeholder="Type to search..." onChangeCapture={handleSearchChange} /> */}
        <div className="flex items-center border-b border-primary/10 px-3">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <input
            onChange={handleSearchChange}
            placeholder="Type to search..."
            className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-defaultText font-medium disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {Object.entries(results).map(([type, items]) =>
            items && items.length > 0 ? (
              <Fragment key={type}>
                <CommandGroup heading={type === "file" ? "Files" : "Folders"}>
                  {items.map((item: File) => (
                    <ResourceContextMenu
                      key={item.fileId}
                      file={item as any}
                      onToggleStar={() => null}
                      onPreview={handlePreview}
                      onShare={handleShare}
                      onRename={handleRename}
                      onDelete={handleDelete}
                      onDownload={handleDownload}
                      onFileInfo={handleFileInfo}
                    >
                      <CommandItem className="cursor-pointer" key={item.fileId}>
                        {
                          (metaLoading === item.fileId || deleting === item.fileId) ? (
                            <Loader className="animate-spin h-4 w-4 mr-2" />
                          ) : <FileIcon fileName={item.fileName} fileType={item.type} className="h-4 w-4" outerClassName="p-0 mr-2" />
                        }
                        <span>{item.fileName}</span>
                      </CommandItem>
                    </ResourceContextMenu>
                  ))}
                </CommandGroup>
                <CommandSeparator />
              </Fragment>
            ) : null
          )}
          {/* Load More Button */}
          {searchedFiles.hasMore && (
            <div className="flex justify-center py-3">
              <button
                className="text-primary text-xs hover:underline flex items-center gap-2"
                onClick={handleLoadMore}
                disabled={loadingMore}
              >
                {loadingMore ? <Loader className="animate-spin h-4 w-4" /> : "Load More"}
              </button>
            </div>
          )}
        </CommandList>
      </CommandDialog>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog confirmation={deleteConfirmation} setConfirmation={setDeleteConfirmation} onDeleteConfirm={confirmDelete} />
    </Fragment>
  )
}