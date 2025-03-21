"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useApp } from "@/hooks/use-app";
import { Globe, Laptop, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect } from "react";


export function GeneralSettings() {
  const { theme, setTheme } = useTheme()
  const { settings, updateAppearance } = useApp()

  const handleThemeChange = (value: string) => {
    setTheme(value)
    handleSettingsChange("theme", value)
  }

  const handleSettingsChange = (key: string, value: any) => {
    updateAppearance({ [key]: value })
  }

  useEffect(() => {
    if (!settings.appearance || !settings.appearance.theme) return
    if (settings.appearance.theme != theme) {
      setTheme(settings.appearance.theme)
    }
  }, [settings.appearance])

  const SkeletonCard = () => (
    <CardContent className="space-y-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>
              <Skeleton className="w-16 h-4" />
            </Label>
            <Skeleton className="w-40 h-3" />
          </div>
          <Skeleton className="w-[180px] h-10" />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>
              <Skeleton className="w-20 h-4" />
            </Label>
            <Skeleton className="w-40 h-3" />
          </div>
          <Skeleton className="w-[180px] h-10" />
        </div>
      </div>
    </CardContent>
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" />
          <CardTitle>General Settings</CardTitle>
        </div>
        <CardDescription>Customize your experience</CardDescription>
      </CardHeader>
      {settings.loading ? <SkeletonCard /> : <CardContent className="space-y-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Theme</Label>
              <p className="text-sm text-muted-foreground">
                Choose your preferred theme
              </p>
            </div>
            <Select
              value={theme}
              onValueChange={handleThemeChange}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">
                  <div className="flex items-center gap-2">
                    <Sun className="h-4 w-4" />
                    Light
                  </div>
                </SelectItem>
                <SelectItem value="dark">
                  <div className="flex items-center gap-2">
                    <Moon className="h-4 w-4" />
                    Dark
                  </div>
                </SelectItem>
                <SelectItem value="system">
                  <div className="flex items-center gap-2">
                    <Laptop className="h-4 w-4" />
                    System
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Language</Label>
              <p className="text-sm text-muted-foreground">
                Select your preferred language
              </p>
            </div>
            <Select
              value={settings.appearance.language}
              onValueChange={(v)  => handleSettingsChange("language", v)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="de">Deutsch</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>}
    </Card>
  )
}