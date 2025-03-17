import {
  HardDrive,
  Globe,
  Users,
  Shield,
  Clock,
  Zap,
  CheckCircle2,
  File,
  PhoneCall,
  Settings,
  Briefcase,
  Star,
  Server,
  UserCheck,
  Network
} from "lucide-react";

export const plans = [
  {
    name: "Free",
    price: "$0",
    storage: "50 MB",
    bandwidth: "500 MB",
    features: [
      { icon: HardDrive, text: "50 MB of storage" },
      { icon: Globe, text: "500 MB monthly bandwidth" },
      { icon: Users, text: "Basic file sharing" },
      { icon: File, text: "Access on one device" },
      { icon: PhoneCall, text: "Community support" },
    ],
  },
  {
    name: "Basic",
    price: "$8",
    storage: "100 GB",
    bandwidth: "1 TB",
    features: [
      { icon: HardDrive, text: "100 GB of storage" },
      { icon: Globe, text: "1 TB monthly bandwidth" },
      { icon: Users, text: "File sharing & collaboration" },
      { icon: File, text: "Access on all devices" },
      { icon: PhoneCall, text: "Basic support (Email)" },
      { icon: Clock, text: "30-day version history" },
    ],
  },
  {
    name: "Professional",
    price: "$24",
    storage: "500 GB",
    bandwidth: "5 TB",
    features: [
      { icon: HardDrive, text: "500 GB of storage" },
      { icon: Globe, text: "5 TB monthly bandwidth" },
      { icon: Users, text: "Advanced sharing controls" },
      { icon: PhoneCall, text: "Priority support (24/7)" },
      { icon: Clock, text: "90-day version history" },
      { icon: Star, text: "Custom branding" },
      { icon: Shield, text: "Advanced security features" },
      { icon: UserCheck, text: "Team management" },
    ],
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    storage: "Custom",
    bandwidth: "Custom",
    features: [
      { icon: Server, text: "Custom storage limit" },
      { icon: Globe, text: "Unlimited bandwidth" },
      { icon: PhoneCall, text: "24/7 dedicated support" },
      { icon: Settings, text: "Advanced admin controls" },
      { icon: Clock, text: "Unlimited version history" },
      { icon: Zap, text: "Custom integration" },
      { icon: CheckCircle2, text: "SLA guarantee" },
      { icon: Briefcase, text: "Dedicated account manager" },
    ],
  },
];

export type PlanName = Lowercase<typeof plans[number]["name"]>;