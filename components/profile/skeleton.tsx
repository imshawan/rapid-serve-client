import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
} from "@/components/ui/tabs";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";

const ProfileSkeleton = () => {
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
              <div className="flex items-center space-x-4 mb-6">
                {/* Avatar Skeleton */}
                <Skeleton className="h-20 w-20 rounded-full animate-pulse" />
                <Skeleton className="h-10 w-32 animate-pulse" />
              </div>

              <div className="space-y-4">
                {/* Full Name Field */}
                <div className="space-y-2">
                  <Label>
                    <Skeleton className="w-20 h-4" />
                  </Label>
                  <Skeleton className="h-10 w-full" />
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <Label>
                    <Skeleton className="w-12 h-4" />
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                </div>

                {/* Submit Button */}
                <CardFooter className="flex justify-end px-0">
                  <Skeleton className="h-10 w-32" />
                </CardFooter>
              </div>
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
                <Label>
                  <Skeleton className="w-24 h-4" />
                </Label>
                <div className="flex items-center">
                  <Skeleton className="h-6 w-24" />
                </div>
              </div>

              {/* Auth Provider */}
              <div className="space-y-2">
                <Label>
                  <Skeleton className="w-36 h-4" />
                </Label>
                <div className="flex items-center">
                  <Skeleton className="h-6 w-32" />
                </div>
              </div>

              {/* Last Login */}
              <div className="space-y-2">
                <Label>
                  <Skeleton className="w-20 h-4" />
                </Label>
                <Skeleton className="h-6 w-48" />
              </div>

              {/* Storage Usage */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>
                    <Skeleton className="w-24 h-4" />
                  </Label>
                  <Skeleton className="h-4 w-36" />
                </div>
                <Skeleton className="h-2 w-full" />
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
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5 w-3/4">
                      <Label>
                        <Skeleton className="h-5 w-36" />
                      </Label>
                      <Skeleton className="h-4 w-64" />
                    </div>
                    <Skeleton className="h-6 w-12 rounded-full" />
                  </div>
                ))}

                {/* Submit Button */}
                <CardFooter className="flex justify-end px-0">
                  <Skeleton className="h-10 w-36" />
                </CardFooter>
              </div>
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
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5 w-3/4">
                      <Label>
                        <Skeleton className="h-5 w-36" />
                      </Label>
                      <Skeleton className="h-4 w-64" />
                    </div>
                    <Skeleton className="h-6 w-12 rounded-full" />
                  </div>
                ))}

                {/* Submit Button */}
                <CardFooter className="flex justify-end px-0">
                  <Skeleton className="h-10 w-48" />
                </CardFooter>
              </div>
            </CardContent>
          </Card>

          {/* Password Change Card */}
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your account password
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Password Fields */}
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-2">
                    <Label>
                      <Skeleton className="h-4 w-32" />
                    </Label>
                    <Skeleton className="h-10 w-full" />
                    {i === 2 && <Skeleton className="h-4 w-64 mt-1" />}
                  </div>
                ))}

                <div className="flex justify-end">
                  <Skeleton className="h-10 w-36" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Connected Devices Card */}
          <Card>
            <CardHeader>
              <CardTitle>Connected Devices</CardTitle>
              <CardDescription>
                Devices that have accessed your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="flex justify-between items-center p-3 border rounded-md">
                    <div className="space-y-1">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                    <Skeleton className="h-8 w-16" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfileSkeleton;