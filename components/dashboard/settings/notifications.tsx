"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useApp } from "@/hooks/use-app";
import { Bell } from "lucide-react";

export function NotificationSettings() {
  const { settings, updateNotifications } = useApp()
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          <CardTitle>Notification Preferences</CardTitle>
        </div>
        <CardDescription>Manage your notification settings</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Email Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Receive notifications via email
            </p>
          </div>
          <Switch
            checked={settings.notifications.email}
            onCheckedChange={(checked) =>
              updateNotifications({ email: checked })
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Desktop Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Show desktop notifications
            </p>
          </div>
          <Switch
            checked={settings.notifications.push}
            onCheckedChange={(checked) =>
              updateNotifications({ push: checked })
            }
          />
        </div>
      </CardContent>
    </Card>
  )
}