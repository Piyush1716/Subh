import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Mail, Phone, CheckCircle2, Loader2, RefreshCw, Gem } from "lucide-react";

export const Route = createFileRoute("/auth/verify")({
  head: () => ({
    meta: [{ title: "Verify Account — GajananGems" }],
  }),
  component: VerifyPage,
});

const OTP_RESEND_SECONDS = 60;

function VerifyPage() {
  const { verifyEmailOtp, verifyPhoneOtp, resendEmailOtp, resendPhoneOtp } = useAuth();
  const navigate = useNavigate();

  const [pending, setPending] = useState<{
    email: string;
    phone: string;
    fullName: string;
  } | null>(null);

  const [emailOtp, setEmailOtp] = useState(["", "", "", "", "", ""]);
  const [phoneOtp, setPhoneOtp] = useState(["", "", "", "", "", ""]);

  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);

  const [loadingEmail, setLoadingEmail] = useState(false);
  const [loadingPhone, setLoadingPhone] = useState(false);

  const [emailCountdown, setEmailCountdown] = useState(OTP_RESEND_SECONDS);
  const [phoneCountdown, setPhoneCountdown] = useState(OTP_RESEND_SECONDS);

  const emailRefs = useRef<(HTMLInputElement | null)[]>([]);
  const phoneRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Load pending registration from sessionStorage
  useEffect(() => {
    const raw = sessionStorage.getItem("pending_registration");
    if (!raw) {
      navigate({ to: "/auth/register" });
      return;
    }
    try {
      setPending(JSON.parse(raw));
    } catch {
      navigate({ to: "/auth/register" });
    }
  }, [navigate]);

  // Countdown timers
  useEffect(() => {
    if (emailCountdown <= 0) return;
    const t = setTimeout(() => setEmailCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [emailCountdown]);

  useEffect(() => {
    if (phoneCountdown <= 0) return;
    const t = setTimeout(() => setPhoneCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [phoneCountdown]);

  // Redirect once both are verified
  useEffect(() => {
    if (emailVerified && phoneVerified) {
      toast.success("Account verified! Welcome to GajananGems.");
      setTimeout(() => navigate({ to: "/" }), 1500);
    }
  }, [emailVerified, phoneVerified, navigate]);

  const handleOtpInput = (
    index: number,
    value: string,
    setOtp: React.Dispatch<React.SetStateAction<string[]>>,
    refs: React.MutableRefObject<(HTMLInputElement | null)[]>
  ) => {
    if (!/^\d*$/.test(value)) return;
    setOtp((prev) => {
      const next = [...prev];
      next[index] = value.slice(-1);
      return next;
    });
    if (value && index < 5) refs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent,
    otp: string[],
    setOtp: React.Dispatch<React.SetStateAction<string[]>>,
    refs: React.MutableRefObject<(HTMLInputElement | null)[]>
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) refs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < 5) refs.current[index + 1]?.focus();
  };

  const handlePaste = (
    e: React.ClipboardEvent,
    setOtp: React.Dispatch<React.SetStateAction<string[]>>,
    refs: React.MutableRefObject<(HTMLInputElement | null)[]>
  ) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (text.length === 6) {
      setOtp(text.split(""));
      refs.current[5]?.focus();
    }
  };

  const verifyEmail = useCallback(async () => {
    if (!pending) return;
    const token = emailOtp.join("");
    if (token.length !== 6) { toast.error("Enter the 6-digit email OTP"); return; }
    setLoadingEmail(true);
    try {
      await verifyEmailOtp(pending.email, token);
      setEmailVerified(true);
      toast.success("Email verified!");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Invalid email OTP");
    } finally {
      setLoadingEmail(false);
    }
  }, [pending, emailOtp, verifyEmailOtp]);

  const verifyPhone = useCallback(async () => {
    if (!pending) return;
    const token = phoneOtp.join("");
    if (token.length !== 6) { toast.error("Enter the 6-digit phone OTP"); return; }
    setLoadingPhone(true);
    try {
      await verifyPhoneOtp(pending.phone, token);
      setPhoneVerified(true);
      toast.success("Phone verified!");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Invalid phone OTP");
    } finally {
      setLoadingPhone(false);
    }
  }, [pending, phoneOtp, verifyPhoneOtp]);

  const handleResendEmail = async () => {
    if (!pending || emailCountdown > 0) return;
    try {
      await resendEmailOtp(pending.email);
      setEmailCountdown(OTP_RESEND_SECONDS);
      setEmailOtp(["", "", "", "", "", ""]);
      toast.success("Email OTP resent");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to resend");
    }
  };

  const handleResendPhone = async () => {
    if (!pending || phoneCountdown > 0) return;
    try {
      await resendPhoneOtp(pending.phone);
      setPhoneCountdown(OTP_RESEND_SECONDS);
      setPhoneOtp(["", "", "", "", "", ""]);
      toast.success("Phone OTP resent");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to resend");
    }
  };

  if (!pending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const bothVerified = emailVerified && phoneVerified;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <Gem className="h-5 w-5 text-primary" />
            <span className="text-xl font-semibold" style={{ fontFamily: "var(--font-display)" }}>
              Gajanan<span className="text-primary">gems</span>
            </span>
          </Link>
        </div>

        {bothVerified ? (
          <div className="text-center py-10">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
              <CheckCircle2 className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2" style={{ fontFamily: "var(--font-display)" }}>
              You're all set!
            </h1>
            <p className="text-muted-foreground text-sm">Redirecting you to the shop…</p>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-foreground mb-2" style={{ fontFamily: "var(--font-display)" }}>
                Verify your account
              </h1>
              <p className="text-sm text-muted-foreground">
                Hi <strong>{pending.fullName.split(" ")[0]}</strong>! We've sent OTPs to verify both your email and phone.
              </p>
            </div>

            {/* Progress */}
            <div className="flex items-center gap-4 mb-8">
              <Step icon={<Mail className="h-4 w-4" />} label="Email" done={emailVerified} active={!emailVerified} />
              <div className="flex-1 h-px bg-border" />
              <Step icon={<Phone className="h-4 w-4" />} label="Phone" done={phoneVerified} active={emailVerified && !phoneVerified} />
            </div>

            <div className="space-y-6">
              {/* Email OTP */}
              <OtpCard
                icon={<Mail className="h-5 w-5" />}
                title="Email verification"
                subtitle={`OTP sent to ${pending.email}`}
                otp={emailOtp}
                setOtp={setEmailOtp}
                refs={emailRefs}
                verified={emailVerified}
                loading={loadingEmail}
                countdown={emailCountdown}
                onVerify={verifyEmail}
                onResend={handleResendEmail}
                onPaste={(e) => handlePaste(e, setEmailOtp, emailRefs)}
                onInput={(i, v) => handleOtpInput(i, v, setEmailOtp, emailRefs)}
                onKeyDown={(i, e) => handleOtpKeyDown(i, e, emailOtp, setEmailOtp, emailRefs)}
              />

              {/* Phone OTP */}
              <OtpCard
                icon={<Phone className="h-5 w-5" />}
                title="Phone verification"
                subtitle={`OTP sent to ${pending.phone}`}
                otp={phoneOtp}
                setOtp={setPhoneOtp}
                refs={phoneRefs}
                verified={phoneVerified}
                loading={loadingPhone}
                countdown={phoneCountdown}
                onVerify={verifyPhone}
                onResend={handleResendPhone}
                onPaste={(e) => handlePaste(e, setPhoneOtp, phoneRefs)}
                onInput={(i, v) => handleOtpInput(i, v, setPhoneOtp, phoneRefs)}
                onKeyDown={(i, e) => handleOtpKeyDown(i, e, phoneOtp, setPhoneOtp, phoneRefs)}
              />
            </div>

            <p className="text-xs text-muted-foreground text-center mt-6">
              Wrong account?{" "}
              <Link to="/auth/register" className="text-primary hover:underline">
                Start over
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function Step({ icon, label, done, active }: { icon: React.ReactNode; label: string; done: boolean; active: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
        done ? "bg-primary text-primary-foreground" :
        active ? "bg-primary/10 text-primary border-2 border-primary" :
        "bg-secondary text-muted-foreground"
      }`}>
        {done ? <CheckCircle2 className="h-5 w-5" /> : icon}
      </div>
      <span className={`text-xs font-medium ${done || active ? "text-foreground" : "text-muted-foreground"}`}>
        {label}
      </span>
    </div>
  );
}

type OtpCardProps = {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  otp: string[];
  setOtp: React.Dispatch<React.SetStateAction<string[]>>;
  refs: React.MutableRefObject<(HTMLInputElement | null)[]>;
  verified: boolean;
  loading: boolean;
  countdown: number;
  onVerify: () => void;
  onResend: () => void;
  onPaste: (e: React.ClipboardEvent) => void;
  onInput: (i: number, v: string) => void;
  onKeyDown: (i: number, e: React.KeyboardEvent) => void;
};

function OtpCard({ icon, title, subtitle, otp, refs, verified, loading, countdown, onVerify, onResend, onPaste, onInput, onKeyDown }: OtpCardProps) {
  return (
    <div className={`border rounded-xl p-5 transition-colors ${verified ? "border-primary/30 bg-primary/5" : "border-border bg-card"}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-9 h-9 rounded-full flex items-center justify-center ${verified ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"}`}>
          {verified ? <CheckCircle2 className="h-4 w-4" /> : icon}
        </div>
        <div>
          <div className="text-sm font-semibold text-foreground">{title}</div>
          <div className="text-xs text-muted-foreground">{subtitle}</div>
        </div>
        {verified && (
          <span className="ml-auto text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">Verified</span>
        )}
      </div>

      {!verified && (
        <>
          <div className="flex gap-2 justify-center mb-4" onPaste={onPaste}>
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { refs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => onInput(i, e.target.value)}
                onKeyDown={(e) => onKeyDown(i, e)}
                className="w-10 h-12 text-center text-lg font-bold border border-input rounded-lg bg-background outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
              />
            ))}
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={onResend}
              disabled={countdown > 0}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw className="h-3 w-3" />
              {countdown > 0 ? `Resend in ${countdown}s` : "Resend OTP"}
            </button>

            <button
              type="button"
              onClick={onVerify}
              disabled={loading || otp.join("").length !== 6}
              className="flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-semibold px-4 py-2 rounded-full hover:bg-primary/90 disabled:opacity-50 transition-all"
            >
              {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Verify"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
