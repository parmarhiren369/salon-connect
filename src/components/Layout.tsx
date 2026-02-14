import { ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Sparkles } from "lucide-react";
import { signOut } from "firebase/auth";
import { toast } from "sonner";
import { userProfile } from "@/lib/user-profile";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";
import { useFirebase } from "@/lib/firebase-context";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo.png";

const Layout = ({ children }: { children: ReactNode }) => {
  const [deviceMode, setDeviceMode] = useState<"desktop" | "mobile">("desktop");
  const { auth } = useFirebase();
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem("ls-device-mode");
    if (saved === "mobile" || saved === "desktop") {
      setDeviceMode(saved);
    }
  }, []);

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

  const isMobileMode = deviceMode === "mobile";

  return (
    <div className={cn("min-h-screen bg-background", isMobileMode && "pb-24")}>
      {isMobileMode ? (
        <header className="sticky top-0 z-30 border-b border-border bg-card/90 backdrop-blur-xl">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl gold-gradient flex items-center justify-center shadow-lg shadow-accent/20">
                <img src={logo} alt="Life Style Studio" className="h-6 w-6 object-contain invert" />
              </div>
              <div>
                <p className="font-display text-lg leading-tight">Life Style Studio</p>
                <div className="flex items-center gap-1 text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
                  <Sparkles className="h-3 w-3 text-accent" />
                  Mobile Mode
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="h-10 w-10 rounded-xl border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all"
              aria-label="Logout"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </header>
      ) : (
        <Sidebar />
      )}
      <main className={cn("min-h-screen", isMobileMode ? "ml-0" : "ml-72")}>
        <div className={cn(isMobileMode ? "px-5 pb-6 pt-6 max-w-4xl mx-auto" : "p-10 max-w-7xl")}>{children}</div>
      </main>
      {isMobileMode && <MobileNav />}
    </div>
  );
};

export default Layout;
