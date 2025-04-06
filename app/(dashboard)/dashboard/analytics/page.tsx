"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  FileText,
  Image as ImageIcon,
  Video,
  File,
  Download,
} from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, LineChart, Line } from 'recharts'
import { KeyMetrics } from "@/components/dashboard/analytics/key-metrics"
import { filterDurations } from "@/common/analytics"

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("week")
  
  const storageData = [
    { name: "Mon", value: 23 },
    { name: "Tue", value: 25 },
    { name: "Wed", value: 28 },
    { name: "Thu", value: 30 },
    { name: "Fri", value: 35 },
    { name: "Sat", value: 32 },
    { name: "Sun", value: 30 },
  ]

  const bandwidthData = [
    { name: "Mon", value: 120 },
    { name: "Tue", value: 150 },
    { name: "Wed", value: 180 },
    { name: "Thu", value: 190 },
    { name: "Fri", value: 250 },
    { name: "Sat", value: 200 },
    { name: "Sun", value: 180 },
  ]

  const userActivityData = [
    { name: "Mon", downloads: 45, uploads: 30, shares: 15 },
    { name: "Tue", downloads: 50, uploads: 35, shares: 20 },
    { name: "Wed", downloads: 60, uploads: 45, shares: 25 },
    { name: "Thu", downloads: 55, uploads: 40, shares: 30 },
    { name: "Fri", downloads: 70, uploads: 50, shares: 35 },
    { name: "Sat", downloads: 65, uploads: 45, shares: 25 },
    { name: "Sun", downloads: 55, uploads: 35, shares: 20 },
  ]

  const fileTypeDistribution = [
    { type: "Documents", size: "12.5 GB", count: 1250, icon: FileText },
    { type: "Images", size: "8.2 GB", count: 3420, icon: ImageIcon },
    { type: "Videos", size: "15.4 GB", count: 164, icon: Video },
    { type: "Others", size: "2.7 GB", count: 521, icon: File },
  ]

  const topFiles = [
    {
      name: "presentation.pdf",
      type: "PDF",
      size: "5.2 MB",
      downloads: 145,
      bandwidth: "754 MB"
    },
    {
      name: "video-final.mp4",
      type: "Video",
      size: "52.1 MB",
      downloads: 89,
      bandwidth: "4.6 GB"
    },
    {
      name: "report-2024.xlsx",
      type: "Spreadsheet",
      size: "1.8 MB",
      downloads: 78,
      bandwidth: "140 MB"
    }
  ]

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Analytics & Insights</h1>
          <p className="text-muted-foreground mt-1">Monitor your storage and usage patterns</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            {filterDurations.map((e) => <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <KeyMetrics />

      {/* Storage Trends */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Storage Usage Trend</CardTitle>
            <CardDescription>Storage consumption over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={storageData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bandwidth Usage Trend</CardTitle>
            <CardDescription>Network bandwidth consumption</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={bandwidthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Activity */}
      <Card>
        <CardHeader>
          <CardTitle>User Activity</CardTitle>
          <CardDescription>Downloads, uploads, and sharing activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={userActivityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="downloads" fill="hsl(var(--primary))" />
                <Bar dataKey="uploads" fill="hsl(var(--primary))" fillOpacity={0.7} />
                <Bar dataKey="shares" fill="hsl(var(--primary))" fillOpacity={0.4} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* File Type Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Storage Distribution by File Type</CardTitle>
          <CardDescription>Breakdown of storage usage by file type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {fileTypeDistribution.map((item) => (
              <div key={item.type} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <item.icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{item.type}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">{item.count} files</span>
                    <span className="text-sm text-muted-foreground">{item.size}</span>
                  </div>
                </div>
                <Progress value={Math.random() * 100} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Files */}
      <Card>
  <CardHeader>
    <CardTitle>Most Accessed Files</CardTitle>
    <CardDescription>Files with highest bandwidth consumption</CardDescription>
  </CardHeader>
  <CardContent>
    <div className="overflow-x-auto">
      <Table className="min-w-full">
        <TableHeader>
          <TableRow className="hidden md:table-row">
            <TableHead>File Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Downloads</TableHead>
            <TableHead>Bandwidth Used</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
          <TableRow className="table-row md:hidden">
            <TableHead>File Name</TableHead>
            <TableHead>Details</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {topFiles.map((file) => (
            <TableRow key={file.name} className="block md:table-row">
              <TableCell className="font-medium">{file.name}</TableCell>
              <TableCell className="hidden md:table-cell">{file.type}</TableCell>
              <TableCell className="hidden md:table-cell">{file.size}</TableCell>
              <TableCell className="hidden md:table-cell">{file.downloads}</TableCell>
              <TableCell className="hidden md:table-cell">{file.bandwidth}</TableCell>
              {/* Mobile View - Stack rows */}
              <TableCell className="md:hidden">
                <div className="flex flex-col gap-1 text-sm">
                  <span>Type: {file.type}</span>
                  <span>Size: {file.size}</span>
                  <span>Downloads: {file.downloads}</span>
                  <span>Bandwidth: {file.bandwidth}</span>
                </div>
              </TableCell>
              <TableCell className="text-right ">
                <Download className="h-4 w-4 inline-block" />
              </TableCell>

              
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  </CardContent>
</Card>

    </div>
  )}