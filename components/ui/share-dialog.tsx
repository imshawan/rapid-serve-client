"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Link2, Mail, Lock, Copy, Check } from "lucide-react"
import { share } from "@/services/api"

interface ShareDialogProps {
  isOpen: boolean
  onClose: () => void
  fileName: string
  fileId: string
}

export function ShareDialog({ isOpen, onClose, fileName, fileId }: ShareDialogProps) {
  const [shareType, setShareType] = useState<"link" | "email">("link")
  const [isPasswordProtected, setIsPasswordProtected] = useState(false)
  const [password, setPassword] = useState("")
  const [email, setEmail] = useState("")
  const [permission, setPermission] = useState("viewer")
  const [isCopied, setIsCopied] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [busy, setBusy] = useState(false)
  const [sharableLink, setSharableLink] = useState("")
  const { toast } = useToast()

  const handleCopyLink = () => {
    navigator.clipboard.writeText(sharableLink)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
    toast({
      title: "Link copied",
      description: "Share link has been copied to clipboard"
    })
  }

  const handleSwitchChange = (checked: boolean) => {
    if (permission && (permission === "full" || permission === "editor")) {
      return toast({
        description: "You can't remove password protection when permission is " + permission,
      })
    }
    setIsPasswordProtected(checked)
  }

  const handlePermissonChange = (value: string) => {
    if (["editor", "full"].includes(String(value)) && !isPasswordProtected) {
      setIsPasswordProtected(true)
    }
    setPermission(value)
  }

  const handleShare = async () => {
    if (shareType === "email" && !email) {
      return toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive"
      })
    }
    if (!permission) {
      return toast({
        title: "Error",
        description: "Please select a permission",
        variant: "destructive"
      })
    }
    setIsLoading(true)

    try {
      const payload: any = {
        fileId,
        accessLevel: permission,
      }
      if (!email) {
        payload.password = isPasswordProtected ? password : undefined
      } else {
        payload.email = email
      }

      const response = await share.new(payload)
      if (!response.success) {
        if (response.error?.details?.length) {
          let messages: string[] = []
          response.error?.details.forEach((error: any) => {
            messages.push(error.message)
          })
          toast({
            title: response.error.code || "Error",
            description: messages.join(", "),
            variant: "destructive"
          })
          return
        } else {
          throw new Error(response.error?.message)
        }
      }

      if (!(response.data instanceof Error)) {
        setSharableLink(location.origin + String(response?.data?.shareableLink))
      }

      if (shareType === "email") {
        toast({
          title: "Shared successfully",
          description: `${fileName} has been shared with ${email}`,
          variant: "success",
          duration: 5000
        })
      } else {
        handleCopyLink()
      }

      onClose()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to share file. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (permission && (permission === "full" || permission === "edit")) {
      setIsPasswordProtected(true)
    }
  }, [permission])

  useEffect(() => {
    if (!isOpen) return;
    setSharableLink("")
    setPermission("")
    async function loadSharedDetails() {
      let response = await share.fetchFile(fileId)
      if (response.success && !(response.data instanceof Error)) {
        setSharableLink(location.origin + String(response?.data?.sharableLink))
        setPermission(String(response.data?.linkAccessLevel))
      }
    }

    setBusy(true)
    loadSharedDetails().finally(() => {
      setBusy(false)
    })
  }, [isOpen])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Share {fileName}</DialogTitle>
          <DialogDescription>
            Choose how you want to share this file
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="link" className="w-full" onValueChange={(v) => setShareType(v as "link" | "email")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="link">
              <Link2 className="h-4 w-4 mr-2" />
              Share Link
            </TabsTrigger>
            <TabsTrigger value="email">
              <Mail className="h-4 w-4 mr-2" />
              Email
            </TabsTrigger>
          </TabsList>

          <TabsContent value="link" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Password Protection</Label>
                  <p className="text-sm text-muted-foreground">
                    Require a password to access the file
                  </p>
                </div>
                <Switch
                  checked={isPasswordProtected}
                  onCheckedChange={handleSwitchChange}
                />
              </div>

              {isPasswordProtected && (
                <div className="space-y-2">
                  <Label>Password</Label>
                  <div className="flex space-x-2">
                    <Input
                      type="password"
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button variant="outline" size="icon">
                      <Lock className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>Permission</Label>
                <Select value={permission} onValueChange={handlePermissonChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select permission" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="viewer">View only</SelectItem>
                    <SelectItem value="editor">Can edit</SelectItem>
                    <SelectItem value="full">Full access</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Share Link</Label>
                <div className="flex space-x-2">
                  <Input value={sharableLink} readOnly />
                  <Button variant="outline" size="icon" onClick={handleCopyLink}>
                    {isCopied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="email" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Email Address</Label>
                <Input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Permission</Label>
                <Select value={permission} onValueChange={setPermission}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select permission" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="viewer">View only</SelectItem>
                    <SelectItem value="editor">Can edit</SelectItem>
                    <SelectItem value="full">Full access</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleShare} disabled={isLoading || busy}>
            {isLoading ? "Sharing..." : "Share"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}