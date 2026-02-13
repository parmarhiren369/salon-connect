import { NavLink, useLocation } from "react-router-dom";
import { navItems } from "./navigation";
import { cn } from "@/lib/utils";

const MobileNav = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 backdrop-blur-xl">
      <div className="grid grid-cols-4 gap-2 px-3 py-2">
        {navItems.map(({ to, icon: Icon, label }) => {
          const active = location.pathname === to;
          return (
            <NavLink
              key={to}
              to={to}
              className={cn(
                "flex flex-col items-center justify-center gap-1 rounded-xl py-2 text-[10px] font-body tracking-wider transition-all",
                active
                  ? "gold-gradient text-accent-foreground shadow-lg shadow-accent/20"
                  : "text-muted-foreground hover:bg-muted/60"
              )}
            >
              <Icon className={cn("h-4 w-4", active ? "text-accent-foreground" : "text-muted-foreground")} />
              <span className={cn("font-semibold", active ? "text-accent-foreground" : "text-muted-foreground")}>{label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNav;
