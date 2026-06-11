import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";
import type { User, Session } from "@supabase/supabase-js";

// ─── Types ────────────────────────────────────────────────────────────────────

export type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  email_verified: boolean;
  phone_verified: boolean;
  created_at: string;
  updated_at: string;
};

type RegisterPayload = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
};

type AuthCtx = {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (emailOrPhone: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  getCurrentUser: () => User | null;
  refreshProfile: () => Promise<void>;
  verifyEmailOtp: (email: string, token: string) => Promise<void>;
  verifyPhoneOtp: (phone: string, token: string) => Promise<void>;
  resendEmailOtp: (email: string) => Promise<void>;
  resendPhoneOtp: (phone: string) => Promise<void>;
};

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthCtx | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    if (!error && data) setProfile(data as Profile);
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = async (emailOrPhone: string, password: string) => {
    const isPhone = /^\+?\d[\d\s\-]{7,}$/.test(emailOrPhone.trim());

    if (isPhone) {
      // Supabase phone+password login
      const phone = emailOrPhone.trim().startsWith("+")
        ? emailOrPhone.trim()
        : `+91${emailOrPhone.trim()}`;

      const { error } = await supabase.auth.signInWithPassword({
        phone,
        password,
      });
      if (error) throw error;
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email: emailOrPhone.trim(),
        password,
      });
      if (error) throw error;
    }
  };

  const register = async ({ fullName, email, phone, password }: RegisterPayload) => {
    const normalizedPhone = phone.trim().startsWith("+")
      ? phone.trim()
      : `+91${phone.trim()}`;

    // Step 1: Sign up with email+password — Supabase sends email OTP
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: fullName.trim(),
          phone: normalizedPhone,
        },
      },
    });

    if (error) throw error;
    if (!data.user) throw new Error("Registration failed. Please try again.");

    // Step 2: Store pending registration data in sessionStorage for verify page
    sessionStorage.setItem(
      "pending_registration",
      JSON.stringify({
        userId: data.user.id,
        email: email.trim(),
        phone: normalizedPhone,
        fullName: fullName.trim(),
      })
    );

    // Step 3: Send phone OTP via Supabase
    const { error: phoneError } = await supabase.auth.signInWithOtp({
      phone: normalizedPhone,
    });
    if (phoneError) throw phoneError;
  };

  const verifyEmailOtp = async (email: string, token: string) => {
    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "email",
    });
    if (error) throw error;

    // Mark email_verified in profiles
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (currentUser) {
      await supabase.from("profiles").upsert({
        id: currentUser.id,
        email_verified: true,
        updated_at: new Date().toISOString(),
      }, { onConflict: "id" });
    }
  };

  const verifyPhoneOtp = async (phone: string, token: string) => {
    const { error } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: "sms",
    });
    if (error) throw error;

    // Get current user and create/update profile
    const pending = sessionStorage.getItem("pending_registration");
    const { data: { user: currentUser } } = await supabase.auth.getUser();

    if (currentUser && pending) {
      const { fullName, email, phone: storedPhone } = JSON.parse(pending);
      await supabase.from("profiles").upsert({
        id: currentUser.id,
        full_name: fullName,
        email: email,
        phone: storedPhone,
        email_verified: true,
        phone_verified: true,
        updated_at: new Date().toISOString(),
      }, { onConflict: "id" });

      sessionStorage.removeItem("pending_registration");
      await fetchProfile(currentUser.id);
    }
  };

  const resendEmailOtp = async (email: string) => {
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
    });
    if (error) throw error;
  };

  const resendPhoneOtp = async (phone: string) => {
    const { error } = await supabase.auth.signInWithOtp({ phone });
    if (error) throw error;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  const getCurrentUser = () => user;

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        getCurrentUser,
        refreshProfile,
        verifyEmailOtp,
        verifyPhoneOtp,
        resendEmailOtp,
        resendPhoneOtp,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
