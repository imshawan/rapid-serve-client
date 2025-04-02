"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useApp } from "@/hooks/use-app";
import { formatBytes, parseSizeToBytes } from "@/lib/utils/common";
import { Globe, HardDrive, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { plans } from "@/common/plans";
import { Skeleton as SkeletonPrimitive } from "@/components/ui/skeleton";

export function BillingSummary() {
  const { settings } = useApp()
  const [plan, setPlan] = useState<(typeof plans)[number] | null>(null)

  const percentage = useMemo(() => ((settings.storage.used || 0) / (settings.storage.limit || 0) * 100), [settings])
  const available = useMemo(() => formatBytes((settings.storage.limit || 0) - (settings.storage.used || 0)), [settings])
  const trashUsage = useMemo(() => {
    if (!settings.storage.limit || !settings.storage.trash?.items) return 0;
    let percent = (settings.storage.trash?.size / (settings.storage.limit || 0)) * 100
    return parseFloat(percent.toFixed(2))
  }, [settings.storage])
  const resetsIn = useMemo(() => {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const diff = nextMonth.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }, [])
  const bandwidthUsed = useMemo(() => {
    if (!settings.storage.bandwidth || !plan?.bandwidth) return {
      label: "0 B",
      percent: 0
    }
    let percent = (settings.storage.bandwidth.total || 0) / (parseSizeToBytes(plan?.bandwidth) || 0) * 100
    return {
      label: formatBytes(settings.storage.bandwidth.total || 0),
      percent: parseFloat(percent.toFixed(2))
    }
  }, [settings.storage, plan])

  useEffect(() => {
    if (settings.loading) return

    const selectedPlan = plans.find((p) => p.name.toLowerCase() === settings.storage.plan);
    if (!selectedPlan) return;
    setPlan(selectedPlan);

  }, []);

  const Skeleton = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <SkeletonPrimitive className="animate-pulse h-5 w-5 rounded"></SkeletonPrimitive>
          <SkeletonPrimitive className="animate-pulse h-5 w-32 rounded"></SkeletonPrimitive>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <SkeletonPrimitive className="animate-pulse h-4 w-20 rounded"></SkeletonPrimitive>
            <SkeletonPrimitive className="animate-pulse h-4 w-20 rounded"></SkeletonPrimitive>
          </div>

          <SkeletonPrimitive className="animate-pulse h-3 w-full rounded"></SkeletonPrimitive>
        </div>

        <SkeletonPrimitive className="animate-pulse h-4 w-32 rounded"></SkeletonPrimitive>
      </CardContent>
    </Card>

  )

  if (settings.loading || !plan) {
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
              <span>{bandwidthUsed.label} used</span>
              <span>{plan?.bandwidth.toUpperCase()} total</span>
            </div>
            <Progress value={bandwidthUsed.percent} />
          </div>
          <p className="text-sm text-muted-foreground">
            Resets in {resetsIn} days
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
              <span>{formatBytes(settings.storage.limit || 0)} total</span>
            </div>
            <Progress value={trashUsage} />
          </div>
          <p className="text-sm text-muted-foreground">
            Auto deletes in 30 days
          </p>
        </CardContent>
      </Card>
    </div>
  )
}