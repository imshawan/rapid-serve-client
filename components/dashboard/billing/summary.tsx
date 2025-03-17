"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useApp } from "@/hooks/use-app";
import { formatBytes } from "@/lib/utils/common";
import { Globe, HardDrive, Trash2, Users } from "lucide-react";
import { useMemo } from "react";

export function BillingSummary() {
  const { settings } = useApp()
  const storageUsed = 23.4
  const storageLimit = 100
  const storagePercentage = (storageUsed / storageLimit) * 100

  const percentage = useMemo(() => ((settings.storage.used || 0) / (settings.storage.limit || 0) * 100), [settings])
  const available = useMemo(() => formatBytes((settings.storage.limit || 0) - (settings.storage.used || 0)), [settings])

  const Skeleton = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="h-5 w-5 bg-gray-300 dark:bg-gray-700 rounded"></div>
          <div className="h-5 w-32 bg-gray-300 dark:bg-gray-700 rounded"></div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <div className="h-4 w-20 bg-gray-200 dark:bg-gray-600 rounded"></div>
            <div className="h-4 w-20 bg-gray-200 dark:bg-gray-600 rounded"></div>
          </div>

          <div className="h-3 w-full bg-gray-300 dark:bg-gray-700 rounded"></div>
        </div>

        <div className="h-4 w-32 bg-gray-200 dark:bg-gray-600 rounded"></div>
      </CardContent>
    </Card>

  )

  if (settings.loading) {
    return (
      <div className="grid gap-6 md:grid-cols-3">
        {Array(3)
          .fill(null)
          .map((e, index) => <Skeleton key={index} />)}
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Storage Usage
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{formatBytes(settings.storage.used || 0)} used</span>
              <span>{formatBytes(settings.storage.limit || 0)} total</span>
            </div>
            <Progress value={percentage} />
          </div>
          <p className="text-sm text-muted-foreground">
            {available} available
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Bandwidth Usage
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>756.2 GB used</span>
              <span>1 TB total</span>
            </div>
            <Progress value={75.62} />
          </div>
          <p className="text-sm text-muted-foreground">
            Resets in 8 days
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            Trash Usage
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{settings.storage.trash?.items} items in trash</span>
              <span>{formatBytes(settings.storage.trash?.size || 0, 1)} total</span>
            </div>
            <Progress value={50} />
          </div>
          <p className="text-sm text-muted-foreground">
            Auto deletes in 30 days
          </p>
        </CardContent>
      </Card>
    </div>
  )
}