import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Eye, EyeOff, Gem, ArrowRight, Loader2, Mail, Phone } from "lucide-react";
import { z } from "zod";

const loginSearchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/auth/login")({
  validateSearch: loginSearchSchema,
  head: () => ({
    meta: [
      { title: "Sign In — GajananGems" },
      { name: "description", content: "Sign in to your GajananGems account." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const search = useSearch({ from: "/auth/login" });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [loginMode, setLoginMode] = useState<"email" | "phone">("email");

  const [form, setForm] = useState({ identifier: "", password: "" });
  const [errors, setErrors] = useState<Partial<typeof form>>({});

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const validate = () => {
    const errs: Partial<typeof form> = {};
    if (!form.identifier.trim()) {
      errs.identifier = loginMode === "email" ? "Email is required" : "Phone number is required";
    }
    if (!form.password) errs.password = "Password is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await login(form.identifier, form.password);
      toast.success("Welcome back!");
      navigate({ to: (search.redirect as string) || "/" });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* ── Left panel ── */}
      <aside className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center p-16"
        style={{ background: "linear-gradient(135deg, #1a2e1c 0%, #2C3E28 50%, #3F5C45 100%)" }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(ellipse at 60% 40%, rgba(200,169,110,0.08) 0%, transparent 60%)",
          }} />

        {/* Geometric crystal decoration */}
        <div className="absolute bottom-20 left-10 opacity-10">
          <svg width="200" height="280" viewBox="0 0 200 280" fill="none">
            <polygon points="100,0 200,70 180,210 100,280 20,210 0,70" stroke="white" strokeWidth="1.5" fill="white" fillOpacity="0.05" />
            <polygon points="100,30 170,85 155,195 100,250 45,195 30,85" stroke="white" strokeWidth="1" fill="none" strokeOpacity="0.3" />
            <line x1="100" y1="0" x2="100" y2="280" stroke="white" strokeWidth="0.5" strokeOpacity="0.2" />
          </svg>
        </div>
        <div className="absolute top-16 right-20 opacity-8">
          <svg width="80" height="110" viewBox="0 0 80 110" fill="none">
            <polygon points="40,0 80,28 70,82 40,110 10,82 0,28" stroke="white" strokeWidth="1" fill="white" fillOpacity="0.04" />
          </svg>
        </div>

        <div className="relative z-10 text-white max-w-sm text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-8"
            style={{ background: "rgba(200,169,110,0.15)", border: "1px solid rgba(200,169,110,0.3)" }}>
            <Gem className="h-9 w-9" style={{ color: "#C8A96E" }} />
          </div>
          <h2 className="text-4xl font-bold leading-tight mb-4" style={{ fontFamily: "var(--font-display)" }}>
            Welcome back
          </h2>
          <p className="text-white/55 text-sm leading-relaxed">
            Your crystal journey continues. Sign in to access your account, track orders, and explore our latest arrivals.
          </p>
          <div className="mt-12 grid grid-cols-3 gap-6 text-center">
            {[["150+", "Crystal types"], ["10K+", "Happy clients"], ["100%", "Authentic"]].map(([num, lbl]) => (
              <div key={lbl}>
                <div className="text-xl font-bold" style={{ color: "#C8A96E" }}>{num}</div>
                <div className="text-xs text-white/40 mt-0.5">{lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* ── Right panel: form ── */}
      <main className="flex-1 flex items-center justify-center p-6 lg:p-16">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <Link to="/">
              <span className="text-xl font-semibold" style={{ fontFamily: "var(--font-display)" }}>
                Gajanan<span className="text-primary">gems</span>
              </span>
            </Link>
          </div>

          <h1 className="text-3xl font-bold text-foreground mb-1" style={{ fontFamily: "var(--font-display)" }}>
            Sign in
          </h1>
          <p className="text-sm text-muted-foreground mb-8">
            New to GajananGems?{" "}
            <Link to="/auth/register" className="text-primary hover:underline font-medium">
              Create account
            </Link>
          </p>

          {/* Login mode toggle */}
          <div className="flex rounded-lg border border-border p-1 mb-6 bg-secondary/30">
            {(["email", "phone"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => { setLoginMode(mode); setForm({ identifier: "", password: "" }); setErrors({}); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm rounded-md transition-all font-medium ${
                  loginMode === mode
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {mode === "email" ? <Mail className="h-4 w-4" /> : <Phone className="h-4 w-4" />}
                {mode === "email" ? "Email" : "Phone"}
              </button>
            ))}
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                {loginMode === "email" ? "Email Address" : "Phone Number"}
              </label>
              <input
                type={loginMode === "email" ? "email" : "tel"}
                value={form.identifier}
                onChange={set("identifier")}
                placeholder={loginMode === "email" ? "priya@example.com" : "+91 98765 43210"}
                autoComplete={loginMode === "email" ? "email" : "tel"}
                className={`w-full border rounded-lg px-3 py-2.5 bg-background text-sm outline-none transition-colors focus:ring-2 focus:ring-primary/20 focus:border-primary ${
                  errors.identifier ? "border-destructive" : "border-input"
                }`}
              />
              {errors.identifier && <p className="text-xs text-destructive mt-1">{errors.identifier}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-foreground">Password</label>
                <button type="button" className="text-xs text-primary hover:underline">
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={set("password")}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className={`w-full border rounded-lg px-3 py-2.5 bg-background text-sm pr-10 outline-none transition-colors focus:ring-2 focus:ring-primary/20 focus:border-primary ${
                    errors.password ? "border-destructive" : "border-input"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-destructive mt-1">{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-full py-3 text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 transition-all mt-2"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Sign in <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <Link to="/" className="text-xs text-muted-foreground hover:text-primary">
              ← Back to shop
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
