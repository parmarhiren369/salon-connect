import { useState } from "react";
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { useFirebase } from "@/lib/firebase-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Loader2, KeyRound, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AUTHORIZED_EMAIL = "lifestylebeautysalon7777@gmail.com";

const ChangePassword = () => {
  const { auth } = useFirebase();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.currentPassword) {
      toast.error("Please enter your current password");
      return;
    }
    if (form.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (form.newPassword === form.currentPassword) {
      toast.error("New password must be different from current password");
      return;
    }

    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        toast.error("No user is logged in. Please sign in first.");
        setLoading(false);
        navigate("/login");
        return;
      }

      // Reauthenticate with current password before changing
      const credential = EmailAuthProvider.credential(AUTHORIZED_EMAIL, form.currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, form.newPassword);

      toast.success("Password changed successfully! Please log in with your new password.");
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });

      // Sign out and redirect to login so user can test new password
      await auth.signOut();
      navigate("/login");
    } catch (error: any) {
      let message = "Failed to change password. Please try again.";
      if (
        error.code === "auth/wrong-password" ||
        error.code === "auth/invalid-credential"
      ) {
        message = "Current password is incorrect.";
      } else if (error.code === "auth/weak-password") {
        message = "New password is too weak. Use at least 6 characters.";
      } else if (error.code === "auth/requires-recent-login") {
        message = "Session expired. Please log out and log in again before changing your password.";
      }
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto pt-4">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="page-header mb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl gold-gradient flex items-center justify-center shadow-md shadow-accent/30">
              <ShieldCheck className="h-5 w-5 text-accent-foreground" />
            </div>
            <div>
              <h1 className="page-title">Change Password</h1>
              <p className="page-subtitle">Update your login password</p>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Current Password */}
          <div>
            <label className="form-label">Current Password *</label>
            <div className="relative">
              <Input
                type={showCurrent ? "text" : "password"}
                placeholder="Enter current password"
                value={form.currentPassword}
                onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
                required
                className="pr-10"
              />
              <button
                type="button"
                tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setShowCurrent((v) => !v)}
              >
                {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="form-label">New Password *</label>
            <div className="relative">
              <Input
                type={showNew ? "text" : "password"}
                placeholder="Enter new password (min. 6 characters)"
                value={form.newPassword}
                onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                required
                className="pr-10"
              />
              <button
                type="button"
                tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setShowNew((v) => !v)}
              >
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="form-label">Confirm New Password *</label>
            <div className="relative">
              <Input
                type={showConfirm ? "text" : "password"}
                placeholder="Re-enter new password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                required
                className="pr-10"
              />
              <button
                type="button"
                tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setShowConfirm((v) => !v)}
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {form.confirmPassword && form.newPassword !== form.confirmPassword && (
              <p className="text-xs text-destructive mt-1">Passwords do not match</p>
            )}
            {form.confirmPassword && form.newPassword === form.confirmPassword && form.confirmPassword.length > 0 && (
              <p className="text-xs text-green-500 mt-1">Passwords match ✓</p>
            )}
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              disabled={loading}
              className="w-full gold-gradient text-accent-foreground hover:opacity-90 font-body tracking-wider text-sm shadow-lg shadow-accent/20"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Changing Password…
                </>
              ) : (
                <>
                  <KeyRound className="h-4 w-4 mr-2" /> Change Password
                </>
              )}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            After changing your password, you will be signed out and redirected to the login page.
          </p>
        </form>
      </motion.div>
    </div>
  );
};

export default ChangePassword;
