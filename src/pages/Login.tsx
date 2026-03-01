import { useState, useEffect } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useFirebase } from "@/lib/firebase-context";
import { userProfile } from "@/lib/user-profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Loader2, Lock, Monitor, Smartphone, User, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const { auth } = useFirebase();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ phone: "", password: "", username: "" });
  
  // Only allow this specific phone number to access the system
  const AUTHORIZED_PHONE = "7600572772";
  const AUTHORIZED_PHONE_NORMALIZED = AUTHORIZED_PHONE.replace(/\D/g, "");
  // Use fixed account email for Firebase auth behind the scenes
  const AUTHORIZED_EMAIL = "lifestylebeautysalon7777@gmail.com";
  const [deviceMode, setDeviceMode] = useState<"desktop" | "mobile">(() => {
    const saved = localStorage.getItem("ls-device-mode");
    return saved === "mobile" || saved === "desktop" ? saved : "desktop";
  });

  useEffect(() => {
    // Check if username is already set
    const existingUsername = userProfile.getUsername();
    if (existingUsername && existingUsername !== 'Salon') {
      setForm(prev => ({ ...prev, username: existingUsername }));
    }
  }, []);

  const selectDeviceMode = (mode: "desktop" | "mobile") => {
    setDeviceMode(mode);
    localStorage.setItem("ls-device-mode", mode);
    toast.success(mode === "mobile" ? "Mobile mode enabled" : "Desktop mode enabled");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const normalizedPhone = form.phone.replace(/\D/g, "");

    if (normalizedPhone.length !== 10) {
      toast.error("Phone number must be exactly 10 digits");
      setLoading(false);
      return;
    }
    
    if (normalizedPhone !== AUTHORIZED_PHONE_NORMALIZED) {
      toast.error("Access denied. Unauthorized phone number.");
      setLoading(false);
      return;
    }
    
    try {
      await signInWithEmailAndPassword(auth, AUTHORIZED_EMAIL, form.password);
      
      // Store email for username extraction
      localStorage.setItem('ls-user-email', AUTHORIZED_EMAIL);
      
      // Check if username is set, if not prompt for it
      const username = form.username || userProfile.getUsername();
      if (!form.username || form.username === 'Salon') {
        toast.error("Please enter your name");
        setLoading(false);
        return;
      }
      
      // Save username
      userProfile.setUsername(username);
      
      toast.success("Welcome to Life Style Studio!");
      navigate("/");
    } catch (error: any) {
      const errorMessage = error.code === "auth/invalid-credential" 
        ? "Invalid phone number or password" 
        : error.code === "auth/user-not-found"
        ? "Account not found. Please contact administrator."
        : "Authentication failed. Please try again.";
      toast.error(errorMessage);
      setLoading(false);
    }
  };

  const saveUsernameAndProceed = () => {
    if (!form.username || form.username.trim() === '') {
      toast.error("Please enter your name");
      return;
    }
    userProfile.setUsername(form.username);
    toast.success("Welcome to Life Style Studio!");
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-accent/5 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="glass-card p-8">
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
              className="h-16 w-16 rounded-2xl gold-gradient flex items-center justify-center mx-auto mb-4 shadow-lg shadow-accent/30"
            >
              <Lock className="h-8 w-8 text-accent-foreground" />
            </motion.div>
            <h1 className="page-title text-3xl mb-2">Life Style Studio</h1>
            <p className="page-subtitle">
              Sign in to access your salon management system
            </p>
          </div>

          <div className="mb-6">
            <p className="form-label">Choose your device</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => selectDeviceMode("mobile")}
                className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-xs font-body tracking-wider transition-all ${
                  deviceMode === "mobile"
                    ? "gold-gradient text-accent-foreground shadow-lg shadow-accent/20"
                    : "bg-card text-muted-foreground hover:bg-muted/60"
                }`}
              >
                <Smartphone className="h-4 w-4" /> Mobile
              </button>
              <button
                type="button"
                onClick={() => selectDeviceMode("desktop")}
                className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-xs font-body tracking-wider transition-all ${
                  deviceMode === "desktop"
                    ? "gold-gradient text-accent-foreground shadow-lg shadow-accent/20"
                    : "bg-card text-muted-foreground hover:bg-muted/60"
                }`}
              >
                <Monitor className="h-4 w-4" /> Desktop
              </button>
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground font-body">
              Mobile mode turns on a touch-first layout with a bottom navigation bar.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="form-label">Your Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  placeholder="Your name (e.g., Hiren)"
                  className="pl-10 h-12"
                  required
                />
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground font-body">
                This name will appear in SMS messages sent to clients
              </p>
            </div>

            <div>
              <label className="form-label">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                  placeholder="Enter 10 digit phone number"
                  className="pl-10 h-12"
                  required
                />
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground font-body">
                Only authorized number can login: {AUTHORIZED_PHONE}
              </p>
            </div>

            <div>
              <label className="form-label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="pl-10 h-12"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 gold-gradient text-accent-foreground hover:opacity-90 font-body tracking-wider text-sm shadow-lg shadow-accent/20"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>Sign In</>
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6 font-body">
          Secure access • Enterprise-grade security powered by Firebase
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
