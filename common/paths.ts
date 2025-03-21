import {
  Files,
  Share2,
  Clock,
  Star,
  Trash2,
  CreditCard,
  Settings,
  User,
} from "lucide-react"

export const navigation = [
  { name: "My Drive", href: "/dashboard", icon: Files },
  { name: "Shared", href: "/dashboard/shared", icon: Share2 },
  { name: "Recent", href: "/dashboard/recent", icon: Clock },
  { name: "Starred", href: "/dashboard/starred", icon: Star },
  { name: "Trash", href: "/dashboard/trash", icon: Trash2 },
]

export const userNavigation = [
  { name: "Profile", href: "/dashboard/profile", icon: User },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
  { name: "Billing", href: "/dashboard/billing", icon: CreditCard },
]