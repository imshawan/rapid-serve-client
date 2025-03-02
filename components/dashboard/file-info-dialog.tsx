"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatBytes } from "@/lib/utils/common"
import { Calendar, Clock, FileText, HardDrive, Share2, User, Info, Lock, Users, Activity, Download, Eye } from "lucide-react"
import FileIcon from "@/components/dashboard/file-icon"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TFile } from "@/store/slices/files"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDate } from "date-fns"

interface FileInfoModalProps {
    file: TFile | null
    isOpen: boolean
    onClose: () => void
}

export function FileInfoModal({ file, isOpen, onClose }: FileInfoModalProps) {
    const [activeTab, setActiveTab] = useState("details")

    if (!file) return null

    const dummyFileData = {
        ...file,
        downloadCount: 15,
        viewCount: 42,
        shares: 5,
        lastOpenedBy: "Alice Johnson",
        comments: [
            { userName: "Bob Smith", userAvatar: "https://randomuser.me/api/portraits/men/3.jpg", userInitials: "BS", text: "Updated this file to include more details.", timestamp: new Date().toISOString() },
        ],
        activityLog: [
            {
              userName: "Alice Johnson",
              userAvatar: "https://randomuser.me/api/portraits/women/2.jpg",
              userInitials: "AJ",
              action: "renamed this file",
              timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
            },
            {
              userName: "Bob Smith",
              userAvatar: "https://randomuser.me/api/portraits/men/3.jpg",
              userInitials: "BS",
              action: "shared this file with David",
              timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
            },
          ]
    };


    const fileExtension = file.fileName.split(".").pop()?.toLowerCase() || ""

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[60%] h-[85vh] overflow-y-auto">
                <DialogHeader className="block">
                    <DialogTitle className="flex items-center gap-2">
                        <FileIcon fileName={file.fileName} fileType={file.type} className="w-5 h-5" outerClassName="p-1" />
                        <span className="truncate">{file.fileName}</span>
                    </DialogTitle>
                    <DialogDescription>
                        File information and properties
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="details" className="flex items-center gap-1">
                            <Info className="h-3.5 w-3.5" />
                            <span>Details</span>
                        </TabsTrigger>
                        <TabsTrigger value="insights" className="flex items-center gap-1">
                            <Activity className="h-3.5 w-3.5" />
                            <span>History & Insights</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="details" className="space-y-4 mt-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col items-center justify-center p-6 border rounded-lg bg-muted/30">
                                <FileIcon fileName={file.fileName} fileType={file.type} className="w-12 h-12" outerClassName="p-3 mb-3" />
                                <span className="text-sm font-medium truncate max-w-full">{file.fileName}</span>
                                <span className="text-xs text-muted-foreground">{formatBytes(file.fileSize)}</span>
                            </div>

                            <div className="space-y-3">
                                <div className="space-y-1">
                                    <h4 className="text-sm font-medium flex items-center">
                                        <HardDrive className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
                                        Size
                                    </h4>
                                    <p className="text-sm">{formatBytes(file.fileSize)}</p>
                                </div>

                                <div className="space-y-1">
                                    <h4 className="text-sm font-medium flex items-center">
                                        <FileText className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
                                        Type
                                    </h4>
                                    <p className="text-sm capitalize">{file.type === "folder" ? "Folder" : fileExtension.toUpperCase() + " File"}</p>
                                </div>

                                <div className="space-y-1">
                                    <h4 className="text-sm font-medium flex items-center">
                                        <Calendar className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
                                        Created
                                    </h4>
                                    <p className="text-sm">{formatDate(file.createdAt, "MMM dd, yyyy")}</p>
                                </div>

                                <div className="space-y-1">
                                    <h4 className="text-sm font-medium flex items-center">
                                        <Clock className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
                                        Modified
                                    </h4>
                                    <p className="text-sm">{formatDate(file.updatedAt, "MMM dd, yyyy")}</p>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        <div className="space-y-3">
                            <h3 className="text-sm font-medium flex items-center">
                                <Share2 className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
                                Sharing
                            </h3>
                            <div className="space-y-2 border rounded-md p-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Lock className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm font-medium">Access</span>
                                    </div>
                                    <Badge variant="outline" className="text-xs">Restricted</Badge>
                                </div>

                                <p className="text-xs text-muted-foreground">Only people with access can open this file</p>

                                <Separator className="my-2" />

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">People with access</span>
                                        <Button variant="ghost" size="sm" className="h-7 text-xs">
                                            <Users className="h-3.5 w-3.5 mr-1" />
                                            Manage access
                                        </Button>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-7 w-7">
                                                <AvatarImage src="https://github.com/shadcn.png" />
                                                <AvatarFallback>CN</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="text-sm font-medium">You</p>
                                                <p className="text-xs text-muted-foreground">Owner</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h3 className="text-sm font-medium">Storage Used</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs">
                                    <span>Used: {formatBytes(file.fileSize)}</span>
                                    <span>Total: 15 GB</span>
                                </div>
                                <Progress value={file.fileSize / (15 * 1024 * 1024 * 1024) * 100} className="h-2" />
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="insights" className="space-y-4 mt-4">
                        <div className="space-y-3">
                            <h3 className="text-sm font-medium">File Statistics</h3>
                            <div className="space-y-2 border rounded-md p-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Download className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm font-medium">Downloads</span>
                                    </div>
                                    <p className="text-sm font-medium">{dummyFileData.downloadCount ?? 0} times</p>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Eye className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm font-medium">Views</span>
                                    </div>
                                    <p className="text-sm font-medium">{dummyFileData.viewCount ?? 0} times</p>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Share2 className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm font-medium">Shares</span>
                                    </div>
                                    <p className="text-sm font-medium">{dummyFileData.shares ?? 0} times</p>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm font-medium">Last Opened By</span>
                                    </div>
                                    <p className="text-sm">{dummyFileData.lastOpenedBy ?? "N/A"}</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h3 className="text-sm font-medium">Recent Activity</h3>
                            <div className="space-y-4 border rounded-md p-3">
                                {dummyFileData.activityLog?.length > 0 ? (
                                    dummyFileData.activityLog.map((activity, index) => (
                                        <div key={index} className="flex gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={activity.userAvatar || "https://github.com/shadcn.png"} />
                                                <AvatarFallback>{activity.userInitials}</AvatarFallback>
                                            </Avatar>
                                            <div className="space-y-1">
                                                <p className="text-sm">
                                                    <span className="font-medium">{activity.userName}</span> {activity.action}
                                                </p>
                                                <p className="text-xs text-muted-foreground">{formatDate(activity.timestamp, "MMM dd, yyyy")}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground">No recent activity</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h3 className="text-sm font-medium">Comments & Notes</h3>
                            <div className="space-y-2 border rounded-md p-3">
                                {dummyFileData.comments?.length > 0 ? (
                                    dummyFileData.comments.map((comment, index) => (
                                        <div key={index} className="flex gap-3">
                                            <Avatar className="h-7 w-7">
                                                <AvatarImage src={comment.userAvatar} />
                                                <AvatarFallback>{comment.userInitials}</AvatarFallback>
                                            </Avatar>
                                            <div className="space-y-1">
                                                <p className="text-sm">
                                                    <span className="font-medium">{comment.userName}</span>: {comment.text}
                                                </p>
                                                <p className="text-xs text-muted-foreground">{formatDate(comment.timestamp, "MMM dd, yyyy")}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground">No comments</p>
                                )}
                            </div>
                        </div>
                    </TabsContent>


                </Tabs>
            </DialogContent>
        </Dialog>
    )
}