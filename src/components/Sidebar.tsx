import { NavLink, useLocation } from "react-router-dom";
import { Users, LayoutDashboard, MessageSquare, FileText } from "lucide-react";
import logo from "@/assets/logo.png";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/customers", icon: Users, label: "Customers" },
  { to: "/templates", icon: FileText, label: "Templates" },
  { to: "/messaging", icon: MessageSquare, label: "Messaging" },
];

const Sidebar = () => {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      <div className="p-6 flex items-center justify-center border-b border-sidebar-border">
        <img src={logo} alt="Life Style Studio" className="h-20 w-auto invert" />
      </div>

      <nav className="flex-1 px-3 py-6 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => {
          const active = location.pathname === to;
          return (
            <NavLink
              key={to}
              to={to}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-body tracking-wide transition-all duration-200 ${
                active
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
            >
              <Icon className="h-5 w-5" />
              {label}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <p className="text-xs text-muted-foreground text-center font-body tracking-widest uppercase">
          Life Style Studio
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
