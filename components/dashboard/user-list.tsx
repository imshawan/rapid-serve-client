"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/hooks/use-auth"

export function UserList({ users, title }: { users: SharedWithUser[] | undefined, title: string }) {
  if (!users || users.length === 0) {
    return null
  }

  const {user: authUser} = useAuth()

  return (
    <div className="w-64 p-2">
      <h4 className="text-sm font-medium mb-3">{title}</h4>
      <div className="space-y-2">
        {users.map((user, index) => (
          <div key={index} className="flex items-center gap-2">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.profilePicture} />
              <AvatarFallback>{user.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{user.name + (authUser && authUser.id === user.userId ? " (me)" : "")}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}