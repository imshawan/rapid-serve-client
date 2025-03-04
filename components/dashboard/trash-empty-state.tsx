"use client";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { toast } from "@/hooks/use-toast";
import { Trash2, FileQuestion, ArrowLeft, Database } from "lucide-react";
import { useRouter } from "next/navigation";

export function TrashEmptyState() {
  const router = useRouter();

  const handleHelp = () => {
    toast({
      title: "Trash policies",
      description: "Information about trash retention policies is coming soon.",
    });
  };

  const handleGoToFiles = () => {
    router.push("/dashboard");
  };

  const handleDbPlans = () => {
    toast({
      title: "Database plans",
      description: "Information about database storage plans is coming soon.",
    })
  }

  return (
    <EmptyState
      icon={<Trash2 className="h-10 w-10 text-muted-foreground" />}
      title="Trash is empty"
      description="Items that you delete will appear here for 30 days before being permanently removed."
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
                Return to Files
              </span>
            </Button>
            <Button
              variant="outline"
              onClick={handleDbPlans}
              className="border-dashed"
            >
              <Database className="mr-2 h-4 w-4" />
              View Storage Plans
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
              Learn about trash policies
            </Button>
          </div>
        </div>
      }
      className="bg-background/50 backdrop-blur-sm p-0 h-[calc(100vh-300px)]"
    />
  );
}