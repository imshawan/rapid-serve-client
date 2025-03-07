"use client";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { useAuth } from "@/hooks/use-auth";
import { FileQuestion, History, FolderOpen, FolderPlus } from "lucide-react";
import { useRouter } from "next/navigation";

interface RecentEmptyStateProps {
  onUpload?: () => void;
  onCreateFolder?: () => void;
  onHelp?: () => void;
}

export function RecentEmptyState({ onUpload, onCreateFolder, onHelp }: RecentEmptyStateProps) {
  const { user } = useAuth()
  const router = useRouter();

  const handleBrowseFiles = () => {
    router.push('/dashboard');
  };

  return (
    <EmptyState
      icon={<History className="h-10 w-10 text-muted-foreground" />}
      title={user?.name ? `No recent activity, ${String(user?.name).split(" ").at(0)}` : "No recent files"}
      description="Files and folders you've recently worked with will appear here. Browse your files or start organizing your workspace."
      action={
        <div className="space-y-4">
          <div className="flex flex-col space-y-3 sm:flex-row sm:space-x-3 sm:space-y-0">
            <Button
              onClick={handleBrowseFiles}
              className="group relative"
            >
              <span className="absolute inset-0 translate-x-1.5 translate-y-1.5 rounded-md bg-primary/10 transition-transform group-hover:translate-x-0 group-hover:translate-y-0" />
              <span className="relative flex items-center justify-center">
                <FolderOpen className="mr-2 h-4 w-4" />
                Browse Files
              </span>
            </Button>
            <Button
              variant="outline"
              onClick={onCreateFolder}
              className="border-dashed"
            >
              <FolderPlus className="mr-2 h-4 w-4" />
              Start Organizing
            </Button>
          </div>
          <div className="text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={onHelp}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              <FileQuestion className="mr-1 h-3 w-3" />
              Learn about recent files
            </Button>
          </div>
        </div>
      }
      className="bg-background/50 backdrop-blur-sm p-0 h-[calc(100vh-300px)]"
    />
  );
}