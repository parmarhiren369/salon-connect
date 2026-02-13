import { Users, LayoutDashboard, MessageSquare, FileText, Receipt, Scissors, Cake, Crown } from "lucide-react";

export const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/customers", icon: Users, label: "Clients" },
  { to: "/services", icon: Scissors, label: "Services" },
  { to: "/billings", icon: Receipt, label: "Billings" },
  { to: "/memberships", icon: Crown, label: "Memberships" },
  { to: "/birthdays", icon: Cake, label: "Birthdays" },
  { to: "/templates", icon: FileText, label: "Templates" },
  { to: "/messaging", icon: MessageSquare, label: "Messaging" },
] as const;
