"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useUser } from "@/hooks/use-user"
import { useForm } from "react-hook-form"
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, Form } from "@/components/ui/form"
import { useAuth } from "@/hooks/use-auth"
import { useRef, useState } from "react"
import { toast } from "@/hooks/use-toast"

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { updateUserData, updateProfilePicture } = useUser()
  const { user: profile } = useAuth()

  const [avatar, setAvatar] = useState(profile?.profilePicture || "");
  const [loading, setLoading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
      return;
    }
    if (Number(file.size) > (5 * 1024 * 1024)) {
      toast({
        title: "File size exceeds 5MB limit.",
        description: "Please upload a smaller file.",
        variant: "destructive",
      })
      return;
    }

    // Show preview before uploading
    const imageUrl = URL.createObjectURL(file);
    setAvatar(imageUrl);

    // Upload to API
    await uploadAvatar(file);
  };

  // Open file browser when button is clicked
  const handleChangeAvatar = () => {
    fileInputRef.current?.click();
  };

  // Upload image to API
  const uploadAvatar = async (file: Blob) => {
    setLoading(true);
    const formData = new FormData();
    formData.append("picture", file);

    await new Promise((resolve) => {
      updateProfilePicture({ data: formData }, resolve, resolve)
    })

    setLoading(false);
  };

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile?.name || "",
    },
  });

  const updateData = (data: Partial<IUser>) => {
    return new Promise<void>((resolve, reject) => {
      updateUserData(data, (success: boolean) => {
        success ? resolve() : reject();
      });
    });
  }

  const handleUpdateProfile = async (data: Partial<IUser>) => {
    await updateData(data);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            Manage your profile information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={avatar} alt={profile?.name} />
              <AvatarFallback>{profile?.name?.charAt(0)}</AvatarFallback>
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                  <div className="h-6 w-6 border-2 border-gray-300 border-t-white rounded-full animate-spin"></div>
                </div>
              )}
            </Avatar>
            {/* Loading Overlay */}

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
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleUpdateProfile)} className="space-y-4">
              <CardContent className="space-y-4">
                {/* Full Name */}
                <FormField
                  control={form.control}
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
                  <Input
                    id="email"
                    type="email"
                    value={profile?.email}
                    disabled
                  />
                </div>
              </CardContent>

              {/* Submit Button */}
              <CardFooter className="flex justify-end">
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "Updating..." : "Update Profile"}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Password</CardTitle>
          <CardDescription>
            Change your password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input id="current-password" type="password" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input id="new-password" type="password" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input id="confirm-password" type="password" />
            </div>

            <Button type="submit">Change Password</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}