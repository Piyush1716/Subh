import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { fetchProducts, type Product } from "./products";

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
const KEY = "shubh_cart_v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [productCache, setProductCache] = useState<Product[]>([]);

  // Hydrate cart from localStorage on mount
  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(KEY) : null;
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);

  // Persist cart to localStorage whenever it changes
  useEffect(() => {
    try {
      if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(items));
    } catch {}
  }, [items]);

  // Pre-fetch all products once so cart can resolve slugs → product details
  useEffect(() => {
    fetchProducts()
      .then(setProductCache)
      .catch((e) => console.error("CartProvider: failed to fetch products", e));
  }, []);

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

  const count = items.reduce((s, i) => s + i.qty, 0);
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

/**
 * Helper used by cart/checkout pages to resolve a CartItem → Product.
 * Reads from the cart context's in-memory product cache (backed by Supabase).
 */
export function getProductForItem(item: CartItem, products: Product[]): Product | undefined {
  return products.find((p) => p.slug === item.slug);
}
