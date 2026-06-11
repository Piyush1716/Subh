import { Link } from "@tanstack/react-router";
import { Search, ShoppingBag, User, Menu, Heart, LogOut, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/context/AuthContext";

const nav = [
  { label: "Shop", to: "/" },
  { label: "By Category", to: "/" },
  { label: "Home Decor", to: "/" },
  { label: "Palm Analysis", to: "/hand-analysis" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { count } = useCart();
  const { isAuthenticated, profile, user, logout } = useAuth();
  const menuRef = useRef<HTMLDivElement>(null);

  // Close user menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const displayName = profile?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "Account";

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
      <div className="text-center text-xs sm:text-sm py-2 px-4" style={{ backgroundColor: "#3F5C45", color: "#FFFFFF" }}>
        Free Shipping on Purchase of over ₹2000 (Prepaid Orders)
      </div>
      <div className="max-w-7xl mx-auto px-4 lg:px-6 flex items-center gap-4 h-20">
        <button onClick={() => setOpen(!open)} className="lg:hidden p-2" aria-label="Menu">
          <Menu className="h-5 w-5" />
        </button>
        <Link to="/" className="flex items-center">
          <span className="text-3xl font-display font-semibold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
            Gajanan<span className="text-primary">gems</span>
          </span>
        </Link>
        <nav className="hidden lg:flex items-center gap-6 ml-8 text-sm font-medium uppercase tracking-wide">
          {nav.map((n) => (
            <Link key={n.label} to={n.to} className="hover:text-primary transition-colors">
              {n.label}
            </Link>
          ))}
          <span className="text-xs font-bold text-primary animate-pulse">LIVE</span>
        </nav>
        <div className="ml-auto flex items-center gap-2 sm:gap-4">
          <div className="hidden md:flex items-center bg-secondary rounded-full px-4 py-2 w-64 border border-border">
            <input className="bg-transparent outline-none flex-1 text-sm" placeholder="Search crystals, bracelets..." />
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
          <button className="md:hidden p-2"><Search className="h-5 w-5" /></button>
          <button className="p-2 hidden sm:block"><Heart className="h-5 w-5" /></button>

          {/* User menu */}
          <div className="relative" ref={menuRef}>
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-1.5 p-2 hover:text-primary transition-colors"
                  aria-label="Account"
                >
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-semibold">
                    {displayName[0].toUpperCase()}
                  </div>
                  <ChevronDown className="h-3 w-3 hidden sm:block text-muted-foreground" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-border">
                      <div className="text-sm font-medium text-foreground">{displayName}</div>
                      <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
                    </div>
                    <Link
                      to="/account"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-secondary transition-colors"
                    >
                      <User className="h-4 w-4" />
                      My Account
                    </Link>
                    <button
                      onClick={() => { logout(); setUserMenuOpen(false); }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                )}
              </>
            ) : (
              <Link to="/auth/login" className="p-2 hover:text-primary transition-colors" aria-label="Sign in">
                <User className="h-5 w-5" />
              </Link>
            )}
          </div>

          <Link to="/cart" className="relative p-2">
            <ShoppingBag className="h-5 w-5" />
            <span className="absolute -top-0.5 -right-0.5 text-[10px] rounded-full h-4 w-4 flex items-center justify-center" style={{ backgroundColor: "#3F5C45", color: "#FFFFFF" }}>{count}</span>
          </Link>
        </div>
      </div>
      {open && (
        <nav className="lg:hidden border-t border-border px-4 py-3 flex flex-col gap-3 text-sm uppercase">
          {nav.map((n) => (
            <Link key={n.label} to={n.to} onClick={() => setOpen(false)}>{n.label}</Link>
          ))}
          {isAuthenticated ? (
            <>
              <Link to="/account" onClick={() => setOpen(false)}>My Account</Link>
              <button onClick={() => { logout(); setOpen(false); }} className="text-left text-destructive">Sign out</button>
            </>
          ) : (
            <Link to="/auth/login" onClick={() => setOpen(false)}>Sign in</Link>
          )}
        </nav>
      )}
    </header>
  );
}
