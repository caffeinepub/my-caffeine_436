import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, LogIn, UserPlus } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { loginUser, registerUser } from "../lib/auth";

interface Props {
  onLogin: (identifier: string) => void;
}

export default function LoginScreen({ onLogin }: Props) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const switchMode = (m: "login" | "register") => {
    setMode(m);
    setError("");
    setPassword("");
    setConfirmPassword("");
  };

  const handleSubmit = () => {
    setError("");
    if (!identifier.trim() || !password.trim()) {
      setError("ইমেইল/ফোন ও পাসওয়ার্ড দিন");
      return;
    }

    setLoading(true);
    try {
      if (mode === "register") {
        if (password !== confirmPassword) {
          setError("পাসওয়ার্ড মিলছে না");
          setLoading(false);
          return;
        }
        const result = registerUser(identifier.trim(), password);
        if (result === "ok") {
          onLogin(identifier.trim());
        } else if (result === "usernameExists") {
          setError("এই ইমেইল/ফোন নম্বর ইতিমধ্যে ব্যবহৃত");
        } else {
          setError("ইমেইল/ফোন কমপক্ষে ৫ অক্ষর ও পাসওয়ার্ড ৪ অক্ষর হতে হবে");
        }
      } else {
        const ok = loginUser(identifier.trim(), password);
        if (ok) {
          onLogin(identifier.trim());
        } else {
          setError("ভুল ইমেইল/ফোন বা পাসওয়ার্ড");
        }
      }
    } catch {
      setError("ত্রুটি হয়েছে, আবার চেষ্টা করুন");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen flex flex-col items-center justify-center p-6"
      data-ocid="login.page"
    >
      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-[-5%] left-[-10%] w-96 h-96 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute bottom-[-5%] right-[-10%] w-96 h-96 rounded-full bg-accent/15 blur-3xl" />
      </div>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="w-full max-w-sm relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="text-7xl mb-4"
          >
            🧠
          </motion.div>
          <h1 className="font-display text-4xl font-extrabold bg-gradient-to-r from-primary via-accent to-neon-pink bg-clip-text text-transparent">
            কুইজ গেম
          </h1>
          <p className="text-muted-foreground mt-2 font-body">
            জ্ঞান পরীক্ষা করুন — স্কোর করুন — জিতুন!
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { icon: "🏆", label: "লিডারবোর্ড" },
            { icon: "💰", label: "ওয়ালেট" },
            { icon: "🎯", label: "১০০+ প্রশ্ন" },
          ].map((f) => (
            <div
              key={f.label}
              className="bg-card border border-border rounded-xl p-3 text-center"
            >
              <div className="text-2xl mb-1">{f.icon}</div>
              <p className="text-xs text-muted-foreground font-display">
                {f.label}
              </p>
            </div>
          ))}
        </div>

        {/* Login/Register card */}
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          {/* Mode toggle */}
          <div className="flex bg-secondary rounded-lg p-1 gap-1">
            <button
              type="button"
              onClick={() => switchMode("login")}
              className={`flex-1 py-2 rounded-md text-sm font-display font-bold transition-all ${
                mode === "login"
                  ? "bg-primary text-primary-foreground shadow neon-glow-purple"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              data-ocid="login.tab"
            >
              লগইন
            </button>
            <button
              type="button"
              onClick={() => switchMode("register")}
              className={`flex-1 py-2 rounded-md text-sm font-display font-bold transition-all ${
                mode === "register"
                  ? "bg-primary text-primary-foreground shadow neon-glow-purple"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              data-ocid="login.tab"
            >
              নতুন একাউন্ট
            </button>
          </div>

          {/* Fields */}
          <div className="space-y-3">
            <Input
              placeholder="ইমেইল বা ফোন নম্বর"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="bg-secondary border-border text-foreground h-11"
              data-ocid="login.input"
              disabled={loading}
              autoComplete="username"
            />
            <div className="relative">
              <Input
                placeholder="পাসওয়ার্ড"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-secondary border-border text-foreground h-11 pr-10"
                data-ocid="login.input"
                disabled={loading}
                autoComplete={
                  mode === "login" ? "current-password" : "new-password"
                }
                onKeyDown={(e) =>
                  mode === "login" && e.key === "Enter" && handleSubmit()
                }
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {mode === "register" && (
              <Input
                placeholder="পাসওয়ার্ড নিশ্চিত করুন"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-secondary border-border text-foreground h-11"
                data-ocid="login.input"
                disabled={loading}
                autoComplete="new-password"
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
            )}
          </div>

          {error && (
            <p
              className="text-destructive text-sm text-center"
              data-ocid="login.error_state"
            >
              {error}
            </p>
          )}

          <Button
            onClick={handleSubmit}
            disabled={loading || !identifier.trim() || !password.trim()}
            className="w-full h-12 font-display font-bold bg-primary neon-glow-purple text-base"
            data-ocid="login.primary_button"
          >
            {loading ? (
              <span>অপেক্ষা করুন...</span>
            ) : mode === "login" ? (
              <>
                <LogIn size={20} className="mr-2" />
                লগইন
              </>
            ) : (
              <>
                <UserPlus size={20} className="mr-2" />
                রেজিস্ট্রেশন করুন
              </>
            )}
          </Button>

          {mode === "login" && (
            <p className="text-center text-xs text-muted-foreground">
              একাউন্ট নেই?{" "}
              <button
                type="button"
                onClick={() => switchMode("register")}
                className="text-primary font-bold hover:underline"
              >
                নতুন একাউন্ট তৈরি করুন
              </button>
            </p>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          © {new Date().getFullYear()}{" "}
          <a
            href="https://kananbala.com"
            target="_blank"
            rel="noreferrer"
            className="text-primary hover:text-accent transition-colors font-bold"
          >
            kananbala.com
          </a>
        </p>
      </motion.div>
    </motion.div>
  );
}
