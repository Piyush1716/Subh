import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { User, Phone, Mail, LogOut, Loader2, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "My Account — GajananGems" },
    ],
  }),
  component: AccountPageWrapper,
});

function AccountPageWrapper() {
  return (
    <ProtectedRoute>
      <AccountPage />
    </ProtectedRoute>
  );
}

function AccountPage() {
  const { user, profile, logout, refreshProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: profile?.full_name || "",
    phone: profile?.phone || "",
  });

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("profiles").update({
        full_name: form.full_name,
        phone: form.phone,
        updated_at: new Date().toISOString(),
      }).eq("id", user.id);
      if (error) throw error;
      await refreshProfile();
      toast.success("Profile updated");
      setEditing(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 lg:px-6 py-8 lg:py-12">
        <nav className="text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-primary">Home</Link>
          <span className="mx-1">/</span>
          <span>My Account</span>
        </nav>

        <h1 className="text-3xl font-semibold mb-8" style={{ fontFamily: "var(--font-display)" }}>
          My Account
        </h1>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Sidebar */}
          <aside className="space-y-2">
            {[
              { label: "Profile", icon: User, active: true },
            ].map(({ label, icon: Icon, active }) => (
              <button key={label} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                active ? "bg-primary/10 text-primary" : "hover:bg-secondary text-muted-foreground"
              }`}>
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </aside>

          {/* Main content */}
          <div className="md:col-span-2 space-y-6">
            {/* Profile card */}
            <div className="border border-border rounded-xl p-6 bg-card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Profile Details</h2>
                {!editing ? (
                  <button onClick={() => { setEditing(true); setForm({ full_name: profile?.full_name || "", phone: profile?.phone || "" }); }}
                    className="text-xs text-primary hover:underline font-medium">
                    Edit
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={() => setEditing(false)} className="text-xs text-muted-foreground hover:text-foreground">Cancel</button>
                    <button onClick={handleSave} disabled={saving}
                      className="flex items-center gap-1.5 text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-full hover:bg-primary/90 disabled:opacity-60">
                      {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : "Save"}
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <ProfileField
                  label="Full Name"
                  icon={<User className="h-4 w-4" />}
                  value={editing ? form.full_name : profile?.full_name || "—"}
                  editing={editing}
                  onChange={(v) => setForm((p) => ({ ...p, full_name: v }))}
                />
                <ProfileField
                  label="Email"
                  icon={<Mail className="h-4 w-4" />}
                  value={user?.email || profile?.email || "—"}
                  editing={false}
                  badge={profile?.email_verified ? "Verified" : "Unverified"}
                  badgeType={profile?.email_verified ? "success" : "warning"}
                />
                <ProfileField
                  label="Phone"
                  icon={<Phone className="h-4 w-4" />}
                  value={editing ? form.phone : profile?.phone || "—"}
                  editing={editing}
                  onChange={(v) => setForm((p) => ({ ...p, phone: v }))}
                  badge={profile?.phone_verified ? "Verified" : "Unverified"}
                  badgeType={profile?.phone_verified ? "success" : "warning"}
                />
              </div>
            </div>

            {/* Verification status */}
            {(!profile?.email_verified || !profile?.phone_verified) && (
              <div className="border border-amber-200 bg-amber-50 rounded-xl p-4 text-sm text-amber-800">
                <div className="flex items-center gap-2 font-medium mb-1">
                  <CheckCircle2 className="h-4 w-4" />
                  Complete your verification
                </div>
                <p className="text-amber-700 text-xs">
                  Verify your email and phone to unlock full account features and faster checkout.
                </p>
                <Link to="/auth/verify" className="inline-block mt-2 text-xs font-medium text-amber-800 underline">
                  Verify now →
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function ProfileField({
  label, icon, value, editing, onChange, badge, badgeType,
}: {
  label: string;
  icon: React.ReactNode;
  value: string;
  editing: boolean;
  onChange?: (v: string) => void;
  badge?: string;
  badgeType?: "success" | "warning";
}) {
  return (
    <div className="flex items-center gap-4 py-3 border-b border-border last:border-0">
      <div className="text-muted-foreground w-5">{icon}</div>
      <div className="flex-1">
        <div className="text-xs text-muted-foreground mb-0.5">{label}</div>
        {editing && onChange ? (
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full border border-input rounded-md px-2 py-1 text-sm bg-background outline-none focus:border-primary"
          />
        ) : (
          <div className="text-sm text-foreground">{value}</div>
        )}
      </div>
      {badge && (
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
          badgeType === "success" ? "bg-primary/10 text-primary" : "bg-amber-100 text-amber-700"
        }`}>
          {badge}
        </span>
      )}
    </div>
  );
}
