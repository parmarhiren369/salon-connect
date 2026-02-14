import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Sparkles, LogOut } from "lucide-react";
import { useFirebase } from "@/lib/firebase-context";
import { signOut } from "firebase/auth";
import { toast } from "sonner";
import { userProfile } from "@/lib/user-profile";
import logo from "@/assets/logo.png";
import { navItems } from "./navigation";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { auth } = useFirebase();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      userProfile.clear(); // Clear stored username
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      toast.error("Failed to logout");
    }
  };

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-72 bg-sidebar flex flex-col">
      {/* Logo area with gold accent line */}
      <div className="p-8 flex flex-col items-center border-b border-sidebar-border relative">
        <img src={logo} alt="Life Style Studio" className="h-16 w-auto invert opacity-90" />
        <div className="flex items-center gap-2 mt-3">
          <Sparkles className="h-3 w-3 text-sidebar-primary" />
          <span className="text-[10px] font-body tracking-[0.3em] uppercase text-sidebar-foreground/50">
            Salon Management
          </span>
          <Sparkles className="h-3 w-3 text-sidebar-primary" />
        </div>
        <div className="absolute bottom-0 left-6 right-6 h-px gold-gradient opacity-30" />
      </div>

      <nav className="flex-1 px-4 py-8 space-y-2">
        {navItems.map(({ to, icon: Icon, label }) => {
          const active = location.pathname === to;
          return (
            <NavLink
              key={to}
              to={to}
              className={`group flex items-center gap-4 px-5 py-3.5 rounded-xl text-sm font-body tracking-wider transition-all duration-300 relative overflow-hidden ${
                active
                  ? "text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
              }`}
            >
              {active && (
                <div className="absolute inset-0 gold-gradient opacity-90 rounded-xl" />
              )}
              <Icon className={`h-5 w-5 relative z-10 transition-transform duration-300 group-hover:scale-110 ${active ? "text-sidebar-primary-foreground" : ""}`} />
              <span className="relative z-10 font-medium">{label}</span>
              {active && (
                <div className="absolute right-3 h-2 w-2 rounded-full bg-sidebar-primary-foreground/50 z-10" />
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-6 border-t border-sidebar-border space-y-4">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-3 px-5 py-3 rounded-xl text-sm font-body tracking-wider transition-all duration-300 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 group"
        >
          <LogOut className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
          <span className="font-medium">Logout</span>
        </button>
        <div className="text-center">
          <p className="text-[10px] text-sidebar-foreground/30 font-body tracking-[0.4em] uppercase">
            Life Style Studio
          </p>
          <div className="mt-2 h-px gold-gradient opacity-20 mx-8" />
          <p className="text-[9px] text-sidebar-foreground/20 font-body mt-2 tracking-wider">
            v2.0 Premium
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
