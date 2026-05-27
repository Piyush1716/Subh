import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { fetchProducts, type Product } from "./products";
import { supabase } from "./supabase";

export type CartItem = { slug: string; qty: number; size?: string };

type CartCtx = {
  items: CartItem[];
  add: (slug: string, qty?: number, size?: string) => void;
  remove: (slug: string, size?: string) => void;
  setQty: (slug: string, qty: number, size?: string) => void;
  clear: () => void;
  count: number;
  subtotal: number;
  getProduct: (slug: string) => Product | undefined;
};

const Ctx = createContext<CartCtx | null>(null);

const LS_CART_KEY    = "shubh_cart_v1";
const LS_SESSION_KEY = "shubh_cart_session_v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems]               = useState<CartItem[]>([]);
  const [productCache, setProductCache] = useState<Product[]>([]);
  const [cartSessionId, setCartSessionId] = useState<string | null>(null);
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── 1. Hydrate items from localStorage (fast, synchronous path) ────────────
  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(LS_CART_KEY) : null;
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);

  // ── 2. Init / restore cart session from Supabase ───────────────────────────
  useEffect(() => {
    async function initSession() {
      if (typeof window === "undefined") return;
      let sid = localStorage.getItem(LS_SESSION_KEY);

      if (!sid) {
        // Create a new cart row in DB; the UUID becomes the session token
        try {
          const { data, error } = await supabase
            .from("carts")
            .insert({})
            .select("id")
            .single();
          if (!error && data) {
            sid = data.id as string;
            localStorage.setItem(LS_SESSION_KEY, sid);
          }
        } catch (e) {
          console.error("CartProvider: failed to create cart session", e);
        }
      }

      if (sid) setCartSessionId(sid);
    }

    initSession();
  }, []);

  // ── 3. Persist items to localStorage ──────────────────────────────────────
  useEffect(() => {
    try {
      if (typeof window !== "undefined") localStorage.setItem(LS_CART_KEY, JSON.stringify(items));
    } catch {}
  }, [items]);

  // ── 4. Sync items to Supabase (debounced 800 ms) ──────────────────────────
  //    Strategy: replace-all (delete existing rows, then insert current state).
  //    This keeps the logic simple and avoids per-item upsert complexity.
  useEffect(() => {
    if (!cartSessionId) return; // wait until session is ready

    if (syncTimer.current) clearTimeout(syncTimer.current);

    syncTimer.current = setTimeout(async () => {
      try {
        // Always delete first so an empty cart clears the DB rows too
        await supabase.from("cart_items").delete().eq("cart_id", cartSessionId);

        if (items.length > 0) {
          await supabase.from("cart_items").insert(
            items.map((item) => ({
              cart_id: cartSessionId,
              slug:    item.slug,
              qty:     item.qty,
              size:    item.size ?? null,
            })),
          );
        }

        // Bump updated_at on the cart row
        await supabase.from("carts").update({ updated_at: new Date().toISOString() }).eq("id", cartSessionId);
      } catch (e) {
        console.error("CartProvider: failed to sync cart to DB", e);
      }
    }, 800);

    return () => {
      if (syncTimer.current) clearTimeout(syncTimer.current);
    };
  }, [items, cartSessionId]);

  // ── 5. Pre-fetch all products so slugs can be resolved ────────────────────
  useEffect(() => {
    fetchProducts()
      .then(setProductCache)
      .catch((e) => console.error("CartProvider: failed to fetch products", e));
  }, []);

  // ── Helpers ────────────────────────────────────────────────────────────────

  const getProduct = (slug: string): Product | undefined =>
    productCache.find((p) => p.slug === slug);

  const add: CartCtx["add"] = (slug, qty = 1, size) => {
    setItems((prev) => {
      const i = prev.findIndex((x) => x.slug === slug && x.size === size);
      if (i >= 0) {
        const next = [...prev];
        next[i] = { ...next[i], qty: next[i].qty + qty };
        return next;
      }
      return [...prev, { slug, qty, size }];
    });
    const p = productCache.find((x) => x.slug === slug);
    toast.success(p ? `${p.name} added to cart` : "Item added to cart");
  };

  const remove: CartCtx["remove"] = (slug, size) =>
    setItems((prev) => prev.filter((x) => !(x.slug === slug && x.size === size)));

  const setQty: CartCtx["setQty"] = (slug, qty, size) =>
    setItems((prev) =>
      prev.map((x) => (x.slug === slug && x.size === size ? { ...x, qty: Math.max(1, qty) } : x)),
    );

  const clear = () => setItems([]);

  const count    = items.reduce((s, i) => s + i.qty, 0);
  const subtotal = items.reduce((s, i) => {
    const p = getProduct(i.slug);
    return s + (p?.price ?? 0) * i.qty;
  }, 0);

  return (
    <Ctx.Provider value={{ items, add, remove, setQty, clear, count, subtotal, getProduct }}>
      {children}
    </Ctx.Provider>
  );
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be used within CartProvider");
  return c;
}

/** Helper: resolve a CartItem → Product from an external product list */
export function getProductForItem(item: CartItem, products: Product[]): Product | undefined {
  return products.find((p) => p.slug === item.slug);
}