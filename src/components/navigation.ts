import { Users, LayoutDashboard, MessageSquare, FileText, Receipt, CalendarDays, Cake, Crown } from "lucide-react";

export const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/customers", icon: Users, label: "Clients" },
  { to: "/billings", icon: Receipt, label: "Billings" },
  { to: "/appointments", icon: CalendarDays, label: "Appointments" },
  { to: "/messaging", icon: MessageSquare, label: "Messaging" },
  { to: "/birthdays", icon: Cake, label: "Birthdays" },
  { to: "/memberships", icon: Crown, label: "Memberships" },
  { to: "/templates", icon: FileText, label: "Templates" },
] as const;
