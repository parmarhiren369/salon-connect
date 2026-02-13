import { useState } from "react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { useFirebase } from "@/lib/firebase-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Loader2, Lock, Mail, Monitor, Smartphone, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const { auth } = useFirebase();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", name: "" });
  const [deviceMode, setDeviceMode] = useState<"desktop" | "mobile">(() => {
    const saved = localStorage.getItem("ls-device-mode");
    return saved === "mobile" || saved === "desktop" ? saved : "desktop";
  });

  const selectDeviceMode = (mode: "desktop" | "mobile") => {
    setDeviceMode(mode);
    localStorage.setItem("ls-device-mode", mode);
    toast.success(mode === "mobile" ? "Mobile mode enabled" : "Desktop mode enabled");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, form.email, form.password);
        toast.success("Welcome back!");
        navigate("/");
      } else {
        if (!form.name) {
          toast.error("Name is required");
          setLoading(false);
          return;
        }
        await createUserWithEmailAndPassword(auth, form.email, form.password);
        toast.success("Account created successfully!");
        navigate("/");
      }
    } catch (error: any) {
      const errorMessage = error.code === "auth/invalid-credential" 
        ? "Invalid email or password" 
        : error.code === "auth/email-already-in-use"
        ? "Email already in use"
        : error.code === "auth/weak-password"
        ? "Password should be at least 6 characters"
        : "Authentication failed. Please try again.";
      toast.error(errorMessage);
      setLoading(false);
    }
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
              {isLogin ? "Welcome back! Sign in to continue" : "Create your account"}
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
            {!isLogin && (
              <div>
                <label className="form-label">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Your name"
                    className="pl-10 h-12"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="form-label">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  className="pl-10 h-12"
                  required
                />
              </div>
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
                  {isLogin ? "Signing in..." : "Creating account..."}
                </>
              ) : (
                <>{isLogin ? "Sign In" : "Create Account"}</>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setForm({ email: "", password: "", name: "" });
              }}
              className="text-sm text-muted-foreground hover:text-accent transition-colors font-body"
            >
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <span className="text-accent font-semibold">
                {isLogin ? "Sign Up" : "Sign In"}
              </span>
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6 font-body">
          Enterprise-grade security powered by Firebase
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
