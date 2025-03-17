"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GeneralSettings } from "@/components/dashboard/settings/general"
import { NotificationSettings } from "@/components/dashboard/settings/notifications"
import { PrivacySettings } from "@/components/dashboard/settings/privacy-and-security"
import { StorageSettings } from "@/components/dashboard/settings/storage"
import { useApp } from "@/hooks/use-app"
import { useEffect } from "react"

export default function SettingsPage() {
  const { loadSettingsFromUserProfile } = useApp()

  useEffect(() => {
    loadSettingsFromUserProfile()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Customize your personal preferences and account options</p>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Privacy & Security</TabsTrigger>
          <TabsTrigger value="storage">Storage</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <GeneralSettings />
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationSettings />
        </TabsContent>

        <TabsContent value="privacy">
          <PrivacySettings />
        </TabsContent>

        <TabsContent value="storage">
          <StorageSettings />
        </TabsContent>
      </Tabs>
    </div>
  )
}