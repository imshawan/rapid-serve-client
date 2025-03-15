import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { cn } from "@/lib/utils/common"
import { Home } from "lucide-react"
import { useRouter } from "next/navigation"
import { Fragment } from "react"

interface BreadcrumbsProps {
  breadcrumbs: Breadcrumb[]
}

export function Breadcrumbs({ breadcrumbs }: BreadcrumbsProps) {
  const router = useRouter()

  return (
    <Breadcrumb className="mt-2">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink className="cursor-pointer" onClick={() => router.push("/dashboard")}>
            {breadcrumbs.length === 0 ? (
              <div className="flex items-center gap-2 animate-in fade-in duration-300">
                <div className="h-3 w-3 animate-spin rounded-full border border-primary border-t-transparent" />
                My Drive
              </div>
            ) : (
              <span className="animate-in fade-in duration-300 gap-2 flex">
                <Home className="w-[14px] h-[14px] text-gray-500 m-auto" />
                My Drive
                </span>
            )}
          </BreadcrumbLink>
        </BreadcrumbItem>
        {breadcrumbs.map((folder, index) => (
          <Fragment key={index}>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink
                onClick={() => {
                  if (index !== breadcrumbs.length - 1) {
                    router.push(`/folder/${folder.fileId}`)
                  }
                }}
                className={cn("animate-in fade-in duration-300", index === breadcrumbs.length - 1 ? "font-medium" : "cursor-pointer hover:text-primary")}
              >
                {folder.fileName}
              </BreadcrumbLink>
            </BreadcrumbItem>
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}