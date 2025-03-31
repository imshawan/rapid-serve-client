"use client";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { toast } from "@/hooks/use-toast";
import { Star, FileQuestion, ArrowLeft, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export function StarredEmptyState() {
  const router = useRouter();

  const handleHelp = () => {
    toast({
      title: "Starred files",
      description: "Learn how to organize and use your starred files more effectively.",
    });
  };

  const handleGoToFiles = () => {
    router.push("/dashboard");
  };

  const handleCreateCollection = () => {
    toast({
      title: "Collections",
      description: "Create collections to organize your starred files coming soon.",
    })
  }

  return (
    <EmptyState
      icon={<Star className="h-10 w-10 text-muted-foreground" />}
      title="No starred files yet"
      description="Star your important files to access them quickly. Starred files appear here for easy access."
      action={
        <div className="space-y-4">
          <div className="flex flex-col space-y-3 sm:flex-row sm:space-x-3 sm:space-y-0">
            <Button
              onClick={handleGoToFiles}
              className="group relative"
            >
              <span className="absolute inset-0 translate-x-1.5 translate-y-1.5 rounded-md bg-primary/10 transition-transform group-hover:translate-x-0 group-hover:translate-y-0" />
              <span className="relative flex items-center justify-center">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Browse Files
              </span>
            </Button>
            <Button
              variant="outline"
              onClick={handleCreateCollection}
              className="border-dashed"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Collection
            </Button>
          </div>
          <div className="text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleHelp}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              <FileQuestion className="mr-1 h-3 w-3" />
              Learn about starring files
            </Button>
          </div>
        </div>
      }
      className="bg-background/50 backdrop-blur-sm p-0 h-[calc(100vh-300px)]"
    />
  );
}