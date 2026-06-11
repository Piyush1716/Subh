import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Eye, EyeOff, Gem, ArrowRight, Loader2 } from "lucide-react";

export const Route = createFileRoute("/auth/register")({
  head: () => ({
    meta: [
      { title: "Create Account — GajananGems" },
      { name: "description", content: "Join GajananGems to discover healing crystals and gemstone jewellery." },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<Partial<typeof form>>({});

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const validate = () => {
    const errs: Partial<typeof form> = {};
    if (!form.fullName.trim()) errs.fullName = "Full name is required";
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email))
      errs.email = "Valid email is required";
    if (!form.phone.trim() || !/^\+?[1-9]\d{9,14}$/.test(form.phone.replace(/\s|-/g, "")))
      errs.phone = "Valid phone number is required";
    if (form.password.length < 8)
      errs.password = "Password must be at least 8 characters";
    if (form.password !== form.confirmPassword)
      errs.confirmPassword = "Passwords do not match";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await register({
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        password: form.password,
      });
      toast.success("OTPs sent! Please verify your email and phone.");
      navigate({ to: "/auth/verify" });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* ── Left panel: brand art ── */}
      <aside className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-end p-16"
        style={{ background: "linear-gradient(135deg, #2C3E28 0%, #3F5C45 40%, #6B8F5E 100%)" }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle at 20% 80%, rgba(255,255,255,0.04) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.06) 0%, transparent 40%)",
          }} />
        {/* Decorative crystals */}
        <div className="absolute top-20 right-16 opacity-15">
          <svg width="180" height="240" viewBox="0 0 180 240" fill="none">
            <polygon points="90,0 180,60 160,180 90,240 20,180 0,60" fill="white" />
            <polygon points="90,20 160,70 145,170 90,220 35,170 20,70" fill="none" stroke="white" strokeWidth="1" />
            <line x1="90" y1="0" x2="90" y2="240" stroke="white" strokeWidth="0.5" opacity="0.5" />
            <line x1="0" y1="60" x2="180" y2="60" stroke="white" strokeWidth="0.5" opacity="0.5" />
            <line x1="20" y1="180" x2="160" y2="180" stroke="white" strokeWidth="0.5" opacity="0.5" />
          </svg>
        </div>
        <div className="absolute top-40 left-10 opacity-10">
          <svg width="100" height="140" viewBox="0 0 100 140" fill="none">
            <polygon points="50,0 100,35 85,105 50,140 15,105 0,35" fill="white" />
          </svg>
        </div>

        <div className="relative z-10 text-white max-w-xs">
          <div className="flex items-center gap-2 mb-8">
            <Gem className="h-6 w-6" style={{ color: "#C8A96E" }} />
            <span className="text-xl font-semibold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
              Gajanan<span style={{ color: "#C8A96E" }}>gems</span>
            </span>
          </div>
          <h2 className="text-4xl font-bold leading-tight mb-4" style={{ fontFamily: "var(--font-display)" }}>
            Begin your<br />crystal journey
          </h2>
          <p className="text-white/60 text-sm leading-relaxed">
            Join thousands who have found healing, clarity, and balance through our curated collection of authentic gemstones.
          </p>
          <div className="mt-10 flex gap-4">
            {["✦ Authentic Crystals", "✦ Expert Curation", "✦ Energy Certified"].map((t) => (
              <div key={t} className="text-xs text-white/50">{t}</div>
            ))}
          </div>
        </div>
      </aside>

      {/* ── Right panel: form ── */}
      <main className="flex-1 flex items-center justify-center p-6 lg:p-16">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <Link to="/" className="flex items-center gap-2">
              <Gem className="h-5 w-5 text-primary" />
              <span className="text-xl font-semibold" style={{ fontFamily: "var(--font-display)" }}>
                Gajanan<span className="text-primary">gems</span>
              </span>
            </Link>
          </div>

          <h1 className="text-3xl font-bold text-foreground mb-1" style={{ fontFamily: "var(--font-display)" }}>
            Create account
          </h1>
          <p className="text-sm text-muted-foreground mb-8">
            Already have an account?{" "}
            <Link to="/auth/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>

          <form onSubmit={onSubmit} className="space-y-4">
            <Field
              label="Full Name"
              type="text"
              value={form.fullName}
              onChange={set("fullName")}
              error={errors.fullName}
              placeholder="Priya Sharma"
              autoComplete="name"
            />
            <Field
              label="Email Address"
              type="email"
              value={form.email}
              onChange={set("email")}
              error={errors.email}
              placeholder="priya@example.com"
              autoComplete="email"
            />
            <Field
              label="Phone Number"
              type="tel"
              value={form.phone}
              onChange={set("phone")}
              error={errors.phone}
              placeholder="+91 98765 43210"
              autoComplete="tel"
            />
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={set("password")}
                  placeholder="Min. 8 characters"
                  autoComplete="new-password"
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
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={set("confirmPassword")}
                  placeholder="Repeat password"
                  autoComplete="new-password"
                  className={`w-full border rounded-lg px-3 py-2.5 bg-background text-sm pr-10 outline-none transition-colors focus:ring-2 focus:ring-primary/20 focus:border-primary ${
                    errors.confirmPassword ? "border-destructive" : "border-input"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-destructive mt-1">{errors.confirmPassword}</p>
              )}
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
                  Create account <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

            <p className="text-xs text-muted-foreground text-center pt-2">
              By registering, you'll receive OTPs on both your email and phone to verify your account.
            </p>
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

function Field({
  label,
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-1.5">{label}</label>
      <input
        {...props}
        className={`w-full border rounded-lg px-3 py-2.5 bg-background text-sm outline-none transition-colors focus:ring-2 focus:ring-primary/20 focus:border-primary ${
          error ? "border-destructive" : "border-input"
        }`}
      />
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  );
}
