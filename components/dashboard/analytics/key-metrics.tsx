import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Users,
  Globe,
  HardDrive,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { user } from "@/services/api"
import { toast } from "@/hooks/use-toast"
import { cn, formatBytes } from "@/lib/utils/common"

export function KeyMetrics() {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null)

  const averageResponseTimeMs = useMemo((): string => {
    const ms = overview?.averageResponseTimeMs || 0
    if (ms < 1000) return `${ms}ms`;

    const seconds = ms / 1000;
    if (seconds < 60) return `${seconds.toFixed(2)}s`;

    const minutes = seconds / 60;
    if (minutes < 60) return `${minutes.toFixed(2)}m`;

    const hours = minutes / 60;
    return `${hours.toFixed(2)}h`;
  }, [overview])

  useEffect(() => {
    const fetchOverview = async () => {
      const response = await user.getAnalyticsOverview()
      if (response && response.data && !(response.data instanceof Error)) {
        return setOverview(response.data)
      }

      toast({
        title: "Error",
        description: response.error?.message ?? "Something went wrong",
        variant: "destructive"
      })
    }

    fetchOverview()
  }, [])

  const LoaderSkeleton = () => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <Skeleton className="h-5 w-full rounded" />
      </CardHeader>
      <CardContent className="space-y-2">
        <Skeleton className="h-8 w-24 rounded" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-16 rounded" />
        </div>
      </CardContent>
    </Card>
  );

  if (!overview || !Object.keys(overview).length) {
    return (
      <div className="grid gap-6 md:grid-cols-4">
        {Array(4)
          .fill(null)
          .map((e, index) => <LoaderSkeleton key={index} />)}
      </div>
    )
  }

  return (
    <div className="grid gap-6 grid-cols-1 md:grid-cols-4">
      <Card className="flex-col justify-between flex">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Storage Used</CardTitle>
          <HardDrive className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatBytes(Number(overview.used))}</div>
          <p className="text-xs text-muted-foreground">
            <span className={cn(
              "inline-flex items-center",
              overview.comparisons.storageUsed.type === "inc" ? "text-green-500" : "text-red-500"
              )}>
              <ArrowUpRight className="h-4 w-4 mr-1" />
              {overview.comparisons.storageUsed.type === "inc" ? "+" : "-"}{overview.comparisons.storageUsed.value}%
            </span>{" "}
            vs last week
          </p>
        </CardContent>
      </Card>

      <Card className="flex-col justify-between flex">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Bandwidth Usage</CardTitle>
          <Globe className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatBytes(overview.bandwidth.total)}</div>
          <p className="text-xs text-muted-foreground">
          <span className={cn(
              "inline-flex items-center",
              overview.comparisons.bandwidth.type === "inc" ? "text-green-500" : "text-red-500"
              )}>
              <ArrowDownRight className="h-4 w-4 mr-1" />
              {overview.comparisons.bandwidth.type === "inc" ? "+" : "-"}{overview.comparisons.bandwidth.value}%
            </span>{" "}
            vs last week
          </p>
        </CardContent>
      </Card>

      <Card className="flex-col justify-between flex">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Users Engaged</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{overview.userEngagement.total}</div>
          <p className="text-xs text-muted-foreground">
          <span className={cn(
              "inline-flex items-center",
              overview.comparisons.userEngagement.type === "inc" ? "text-green-500" : "text-red-500"
              )}>
              <ArrowUpRight className="h-4 w-4 mr-1" />
              {overview.comparisons.userEngagement.type === "inc" ? "+" : "-"}{overview.comparisons.userEngagement.value}%
            </span>{" "}
            vs last week
          </p>
        </CardContent>
      </Card>

      <Card className="flex-col justify-between flex">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg. Response Time</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{averageResponseTimeMs}</div>
          <p className="text-xs text-muted-foreground">
          <span className={cn(
              "inline-flex items-center",
              overview.comparisons.averageResponseTimeMs.type === "inc" ? "text-green-500" : "text-red-500"
              )}>
              <ArrowUpRight className="h-4 w-4 mr-1" />
              {overview.comparisons.averageResponseTimeMs.type === "inc" ? "+" : "-"}{overview.comparisons.averageResponseTimeMs.value}%
            </span>{" "}
            vs last week
          </p>
        </CardContent>
      </Card>
    </div>
  )
}