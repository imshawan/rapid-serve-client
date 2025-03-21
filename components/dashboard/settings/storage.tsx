"use client"

import { storageOptions } from "@/common/plans";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useApp } from "@/hooks/use-app";
import { Database } from "lucide-react";

export function StorageSettings() {
  const { settings, updateStorage } = useApp()

  const handleStorageSettingsChange = (key: string, value: any) => {
    updateStorage({ [key]: value })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-primary" />
          <CardTitle>Storage Management</CardTitle>
        </div>
        <CardDescription>Configure storage settings</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Smart Sync</Label>
            <p className="text-sm text-muted-foreground">
              Optimize local storage usage
            </p>
          </div>
          <Switch
            checked={false}
            onCheckedChange={(checked) => { }
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Storage Plan</Label>
            <p className="text-sm text-muted-foreground">
              Manage your storage quota
            </p>
          </div>
          <Select
            value={String(settings.storage.limit)}
            disabled
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select plan" />
            </SelectTrigger>
            <SelectContent>
              {storageOptions.map(opt => <SelectItem key={opt.storageBytes} value={String(opt.storageBytes)}>{opt.storage}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}