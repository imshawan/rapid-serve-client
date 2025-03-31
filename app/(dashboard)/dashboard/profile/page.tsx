"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useUser } from "@/hooks/use-user"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Form,
  FormDescription
} from "@/components/ui/form"
import { useEffect, useMemo, useRef, useState } from "react"
import { toast } from "@/hooks/use-toast"
import { Switch } from "@/components/ui/switch"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  Badge
} from "@/components/ui/badge"
import { formatBytes, timeAgo } from "@/lib/utils/common"
import ProfileSkeleton from "@/components/profile/skeleton"

// Define schemas for different sections
const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
});

const notificationSchema = z.object({
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  storageWarning: z.boolean(),
  sharing: z.boolean(),
  comments: z.boolean(),
})

const securitySchema = z.object({
  twoFactorEnabled: z.boolean(),
  deviceHistory: z.boolean(),
  publicLinks: z.boolean(),
  activityLog: z.boolean(),
})

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
})

// Infer types from schemas
type ProfileFormData = z.infer<typeof profileSchema>;
type NotificationFormData = z.infer<typeof notificationSchema>;
type SecurityFormData = z.infer<typeof securitySchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

// Main component
export default function ProfilePage() {
  const { updateUserData, updateProfilePicture } = useUser()
  const { loadUserProfile, user: profile, loading: profileLoading } = useUser()

  const [avatar, setAvatar] = useState(profile?.profilePicture || "")
  const [loading, setLoading] = useState<boolean>(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const storagePercentage = useMemo(() => profile?.storageUsed && profile?.storageLimit
    ? Math.min(100, (profile.storageUsed / profile.storageLimit) * 100)
    : 0, [profile])

  // Form setup for different sections
  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile?.name || "",
    },
  })

  const notificationForm = useForm<NotificationFormData>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      emailNotifications: profile?.preferences?.notifications?.email,
      pushNotifications: profile?.preferences?.notifications?.push,
      storageWarning: profile?.preferences?.notifications?.storageWarning,
      sharing: profile?.preferences?.notifications?.sharing,
      comments: profile?.preferences?.notifications?.comments,
    },
  })

  const securityForm = useForm<SecurityFormData>({
    resolver: zodResolver(securitySchema),
    defaultValues: {
      twoFactorEnabled: profile?.security?.twoFactorEnabled,
      deviceHistory: profile?.security?.deviceHistory,
      publicLinks: profile?.security?.publicLinks,
      activityLog: profile?.security?.activityLog,
    },
  })

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  // Avatar handling functions
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] as unknown as Blob
    if (!file) return;

    // Validate file type and size (must be image, max 5MB)
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Only image files are allowed!",
        description: "Please upload an image file.",
        variant: "destructive",
      })
      return
    }
    if (Number(file.size) > (5 * 1024 * 1024)) {
      toast({
        title: "File size exceeds 5MB limit.",
        description: "Please upload a smaller file.",
        variant: "destructive",
      })
      return
    }

    // Show preview before uploading
    const imageUrl = URL.createObjectURL(file)
    setAvatar(imageUrl)

    // Upload to API
    await uploadAvatar(file)
  }

  const handleChangeAvatar = () => {
    fileInputRef.current?.click()
  }

  const uploadAvatar = async (file: Blob) => {
    setLoading(true)
    const formData = new FormData()
    formData.append("picture", file)

    await new Promise((resolve) => {
      updateProfilePicture({ data: formData }, resolve, resolve)
    })

    setLoading(false)
  };

  // Data update functions
  const updateData = (data: Partial<IUser>) => {
    return new Promise<void>((resolve, reject) => {
      updateUserData(data, (success: boolean) => {
        success ? resolve() : reject();
      })
    })
  }

  // Form handlers
  const handleUpdateProfile = async (data: ProfileFormData) => {
    try {
      await updateData({
        name: data.name,
      })
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Failed to update profile",
        description: "An error occurred while updating your profile.",
        variant: "destructive",
      })
    }
  }

  const handleUpdateNotifications = async (data: NotificationFormData) => {
    try {
      await updateData({
        preferences: {
          notifications: {
            email: data.emailNotifications,
            push: data.pushNotifications,
            storageWarning: data.storageWarning,
            sharing: data.sharing,
            comments: data.comments,
          },
        }
      } as any)
      toast({
        title: "Notification preferences updated",
        description: "Your notification preferences have been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Failed to update notification preferences",
        description: "An error occurred while updating your notification preferences.",
        variant: "destructive",
      })
    }
  }

  const handleUpdateSecurity = async (data: SecurityFormData) => {
    try {
      await updateData({
        security: {
          twoFactorEnabled: data.twoFactorEnabled,
          deviceHistory: data.deviceHistory,
          publicLinks: data.publicLinks,
          activityLog: data.activityLog,
        }
      } as any)
      toast({
        title: "Security settings updated",
        description: "Your security settings have been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Failed to update security settings",
        description: "An error occurred while updating your security settings.",
        variant: "destructive",
      })
    }
  }

  const handleChangePassword = async (data: PasswordFormData) => {
    try {
      // In a real implementation, I'd call an API to change the password
      // For now, we'll just simulate success because I have not yet done that API
      await new Promise(resolve => setTimeout(resolve, 1000))

      toast({
        title: "Password changed",
        description: "Your password has been changed successfully.",
      })

      passwordForm.reset({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    } catch (error) {
      toast({
        title: "Failed to change password",
        description: "An error occurred while changing your password.",
        variant: "destructive",
      })
    }
  }

  const handleRemoveAvatar = async () => {
    setLoading(true)

    try {
      await updateData({ profilePicture: "" })

      // Clear the avatar
      setAvatar("")

      toast({
        title: "Avatar removed",
        description: "Your profile picture has been removed successfully.",
      })
    } catch (error) {
      toast({
        title: "Failed to remove avatar",
        description: "An error occurred while removing your profile picture.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (profile) {
      profileForm.reset({
        name: profile.name || "",
      })

      notificationForm.reset({
        emailNotifications: profile.preferences?.notifications?.email,
        pushNotifications: profile.preferences?.notifications?.push,
        storageWarning: profile.preferences?.notifications?.storageWarning,
        sharing: profile.preferences?.notifications?.sharing,
        comments: profile.preferences?.notifications?.comments,
      })

      securityForm.reset({
        twoFactorEnabled: profile.security?.twoFactorEnabled,
        deviceHistory: profile.security?.deviceHistory,
        publicLinks: profile.security?.publicLinks,
        activityLog: profile.security?.activityLog,
      })

      setAvatar(profile.profilePicture || "")
    }
  }, [profile])

  useEffect(() => {
    loadUserProfile()
  }, [])

  if (profileLoading || !profile) {
    return <ProfileSkeleton />
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-10">
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Manage your personal information and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4 mb-2">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={avatar} alt={profile?.name} className="object-cover" />
                  <AvatarFallback>{profile?.name?.charAt(0)}</AvatarFallback>
                  {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                      <div className="h-6 w-6 border-2 border-gray-300 border-t-white rounded-full animate-spin"></div>
                    </div>
                  )}
                </Avatar>

                {/* Hidden File Input */}
                <Input
                  type="file"
                  ref={fileInputRef}
                  accept="image/jpeg, image/png, image/gif"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <Button variant="outline" onClick={handleChangeAvatar} disabled={loading}>
                  {loading ? "Uploading..." : "Change Avatar"}
                </Button>
                {/* Only show remove button if there's an avatar */}
                {avatar && (
                  <Button
                    variant="outline"
                    onClick={handleRemoveAvatar}
                    disabled={loading}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    size="sm"
                  >
                    Remove Avatar
                  </Button>
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                You can upload a profile picture of max 5MB
              </p>

              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(handleUpdateProfile)} className="space-y-4">
                  {/* Full Name */}
                  <FormField
                    control={profileForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="email"
                        type="email"
                        value={profile?.email}
                        disabled
                      />
                      {profile?.isEmailVerified ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Verified</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Unverified</Badge>
                      )}
                    </div>
                    {!profile?.isEmailVerified && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Please verify your email address to access all features.
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <CardFooter className="flex justify-end px-0">
                    <Button type="submit" disabled={profileForm.formState.isSubmitting}>
                      {profileForm.formState.isSubmitting ? "Updating..." : "Update Profile"}
                    </Button>
                  </CardFooter>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Account Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>
                Details about your account and storage usage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Role */}
              <div className="space-y-2">
                <Label>Account Role</Label>
                <div className="flex items-center">
                  <Badge variant="outline" className="text-sm">
                    {profile?.role === "admin" ? "Administrator" : "Standard User"}
                  </Badge>
                </div>
              </div>

              {/* Auth Provider */}
              <div className="space-y-2">
                <Label>Authentication Type</Label>
                <div className="flex items-center">
                  <Badge variant="outline" className="text-sm">
                    {profile?.authProvider ? `${profile.authProvider} (OAuth)` : "Password"}
                  </Badge>
                </div>
              </div>

              {/* Last Login */}
              <div className="space-y-2">
                <Label>Last Login</Label>
                <div className="text-sm">
                  {profile?.lastLogin ? new Date(profile.lastLogin).toLocaleString() : "Unknown"}
                </div>
              </div>

              {/* Storage Usage */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Storage Usage</Label>
                  <span className="text-sm text-muted-foreground">
                    {profile?.storageLimit
                      ? `${formatBytes(profile.storageUsed)} of ${formatBytes(profile.storageLimit)}`
                      : "0 B of 0 B"}
                  </span>
                </div>
                <Progress value={storagePercentage} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Manage how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...notificationForm}>
                <form onSubmit={notificationForm.handleSubmit(handleUpdateNotifications)} className="space-y-4">
                  {/* Email Notifications */}
                  <FormField
                    control={notificationForm.control}
                    name="emailNotifications"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Email Notifications</FormLabel>
                          <FormDescription>
                            Receive updates and notifications via email
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* Push Notifications */}
                  <FormField
                    control={notificationForm.control}
                    name="pushNotifications"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Push Notifications</FormLabel>
                          <FormDescription>
                            Receive real-time push notifications on your devices
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* Storage Warning */}
                  <FormField
                    control={notificationForm.control}
                    name="storageWarning"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Storage Warnings</FormLabel>
                          <FormDescription>
                            Get notified when you're approaching your storage limit
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* Sharing Notifications */}
                  <FormField
                    control={notificationForm.control}
                    name="sharing"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Sharing Notifications</FormLabel>
                          <FormDescription>
                            Get notified when someone shares content with you
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* Comments Notifications */}
                  <FormField
                    control={notificationForm.control}
                    name="comments"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Comment Notifications</FormLabel>
                          <FormDescription>
                            Get notified when someone comments on your content
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* Submit Button */}
                  <CardFooter className="flex justify-end px-0">
                    <Button type="submit" disabled={notificationForm.formState.isSubmitting}>
                      {notificationForm.formState.isSubmitting ? "Saving..." : "Save Preferences"}
                    </Button>
                  </CardFooter>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          {/* Security Settings Card */}
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage your account security settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...securityForm}>
                <form onSubmit={securityForm.handleSubmit(handleUpdateSecurity)} className="space-y-4">
                  {/* Two-Factor Auth */}
                  <FormField
                    control={securityForm.control}
                    name="twoFactorEnabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Two-Factor Authentication</FormLabel>
                          <FormDescription>
                            Add an extra layer of security to your account
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* Device History */}
                  <FormField
                    control={securityForm.control}
                    name="deviceHistory"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Device History</FormLabel>
                          <FormDescription>
                            Track devices that have accessed your account
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* Public Links */}
                  <FormField
                    control={securityForm.control}
                    name="publicLinks"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Public Links</FormLabel>
                          <FormDescription>
                            Allow creation of public shareable links
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* Activity Log */}
                  <FormField
                    control={securityForm.control}
                    name="activityLog"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Activity Log</FormLabel>
                          <FormDescription>
                            Keep a detailed log of all account activities
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* Submit Button */}
                  <CardFooter className="flex justify-end px-0">
                    <Button type="submit" disabled={securityForm.formState.isSubmitting}>
                      {securityForm.formState.isSubmitting ? "Saving..." : "Save Security Settings"}
                    </Button>
                  </CardFooter>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Password Change Card */}
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your account password. (Last changed: {profile?.security?.lastPasswordChange ? timeAgo(profile.security.lastPasswordChange) : "Never"})
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(handleChangePassword)} className="space-y-4">
                  <FormField
                    control={passwordForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Enter your current password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Enter your new password" {...field} />
                        </FormControl>
                        <FormDescription>
                          Password must be at least 8 characters long
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={passwordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm New Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Confirm your new password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={passwordForm.formState.isSubmitting || profile?.authType === "oauth"}
                    >
                      {passwordForm.formState.isSubmitting ? "Changing..." : "Change Password"}
                    </Button>
                  </div>
                </form>
              </Form>

              {profile?.authType === "oauth" && (
                <div className="mt-4 p-4 bg-yellow-50 text-yellow-800 rounded-md">
                  <p className="text-sm">Password change is not available for accounts using OAuth authentication.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Connected Devices Card */}
          {profile?.devices && profile.devices.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Connected Devices</CardTitle>
                <CardDescription>
                  Devices that have accessed your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {profile.devices.map((device, index) => (
                    <div key={device.id} className="flex justify-between items-center p-3 border rounded-md">
                      <div className="space-y-1">
                        <p className="font-medium">{device.name || "Unknown Device"}</p>
                        <p className="text-sm text-muted-foreground">{device.type || "Unknown"}</p>
                        <p className="text-xs text-muted-foreground">Last active: {new Date(device.lastActive).toLocaleString()}</p>
                      </div>
                      <Button variant="outline" size="sm">Revoke</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

      </Tabs>
    </div>)
}