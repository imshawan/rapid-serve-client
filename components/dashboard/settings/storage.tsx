"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useApp } from "@/hooks/use-app";
import { Database } from "lucide-react";

export function StorageSettings() {
  const { settings, updateStorage } = useApp()

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
            value={settings.storage.limit}
            onValueChange={(value) =>
              updateStorage({ limit: value })
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select plan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0.050">50 MB</SelectItem>
              <SelectItem value="0.50">500 MB</SelectItem>
              <SelectItem value="1">1 GB</SelectItem>
              <SelectItem value="5">5 GB</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}