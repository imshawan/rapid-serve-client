"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useApp } from "@/hooks/use-app";
import { Shield } from "lucide-react";

export function PrivacySettings() {
  const { settings, updatePrivacy } = useApp()

  const handleOnSettingsChange = (key: string, value: boolean) => {
    updatePrivacy({ [key]: value })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <CardTitle>Privacy & Security</CardTitle>
        </div>
        <CardDescription>Manage security settings</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Two-Factor Authentication</Label>
            <p className="text-sm text-muted-foreground">
              Add an extra layer of security
            </p>
          </div>
          <Switch
            checked={settings.privacy.twoFactorEnabled}
            onCheckedChange={(checked) =>
              handleOnSettingsChange("twoFactorEnabled", checked)
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Public Link Sharing</Label>
            <p className="text-sm text-muted-foreground">
              Allow creating public share links
            </p>
          </div>
          <Switch
            checked={settings.privacy.publicLinks}
            onCheckedChange={(checked) =>
              handleOnSettingsChange("publicLinks", checked)
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Maintain Device History</Label>
            <p className="text-sm text-muted-foreground">
              Keep record of devices used to access your account
            </p>
          </div>
          <Switch
            checked={settings.privacy.deviceHistory}
            onCheckedChange={(checked) =>
              handleOnSettingsChange("deviceHistory", checked)
            }
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Activity Logging</Label>
            <p className="text-sm text-muted-foreground">
              Keep record of account activity and login attempts
            </p>
          </div>
          <Switch
            checked={settings.privacy.activityLog}
            onCheckedChange={(checked) =>
              handleOnSettingsChange("activityLog", checked)
            }
          />
        </div>
      </CardContent>
    </Card>
  )
}