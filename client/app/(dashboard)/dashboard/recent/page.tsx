"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Download, MoreVertical, Share2, Trash2, Grid, List } from "lucide-react"

interface RecentFile {
  id: string
  name: string
  type: string
  size: string
  modified: string
  icon: string
  lastAccessed: string
}

export default function RecentPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')

  const recentFiles: RecentFile[] = [
    {
      id: "1",
      name: "Project Presentation.pptx",
      type: "PowerPoint",
      size: "5.2 MB",
      modified: "2024-03-21",
      icon: "📊",
      lastAccessed: "2 hours ago"
    },
    {
      id: "2",
      name: "Budget Report.xlsx",
      type: "Excel",
      size: "1.8 MB",
      modified: "2024-03-20",
      icon: "📈",
      lastAccessed: "Yesterday"
    }
  ]

  const GridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {recentFiles.map((file) => (
        <Card key={file.id} className="p-4 hover:shadow-lg transition-shadow">
          <div className="flex flex-col items-center space-y-2">
            <div className="text-4xl">{file.icon}</div>
            <div className="text-sm font-medium truncate w-full text-center">{file.name}</div>
            <div className="text-xs text-muted-foreground">Accessed {file.lastAccessed}</div>
            <div className="flex space-x-2">
              <Button size="icon" variant="ghost">
                <Download className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost">
                <Share2 className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" className="text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )

  const ListView = () => (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Last Accessed</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {recentFiles.map((file) => (
            <TableRow key={file.id}>
              <TableCell className="font-medium">{file.name}</TableCell>
              <TableCell>{file.lastAccessed}</TableCell>
              <TableCell>{file.size}</TableCell>
              <TableCell>{file.type}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Recent Files</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center border rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {viewMode === 'grid' ? <GridView /> : <ListView />}
    </div>
  )
}