import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { fetchProducts, type Product } from "./products";

export type WishlistItem = { slug: string };

type WishlistCtx = {
  items: WishlistItem[];
  toggle: (slug: string) => void;
  has: (slug: string) => boolean;
  count: number;
  getProduct: (slug: string) => Product | undefined;
};

const Ctx = createContext<WishlistCtx | null>(null);
const KEY = "shubh_wishlist_v1";

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [productCache, setProductCache] = useState<Product[]>([]);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(KEY) : null;
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);

  // Persist to localStorage on change
  useEffect(() => {
    try {
      if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(items));
    } catch {}
  }, [items]);

  // Pre-fetch products so we can resolve slugs → product details
  useEffect(() => {
    fetchProducts()
      .then(setProductCache)
      .catch(() => {});
  }, []);

  const getProduct = (slug: string): Product | undefined =>
    productCache.find((p) => p.slug === slug);

  const has = (slug: string) => items.some((x) => x.slug === slug);

  const toggle = (slug: string) => {
    if (has(slug)) {
      setItems((prev) => prev.filter((x) => x.slug !== slug));
      const p = getProduct(slug);
      toast.info(p ? `${p.name} removed from wishlist` : "Removed from wishlist");
    } else {
      setItems((prev) => [...prev, { slug }]);
      const p = getProduct(slug);
      toast.success(p ? `${p.name} added to wishlist 💖` : "Added to wishlist");
    }
  };

  const count = items.length;

  return (
    <Ctx.Provider value={{ items, toggle, has, count, getProduct }}>
      {children}
    </Ctx.Provider>
  );
}

export function useWishlist() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useWishlist must be used within WishlistProvider");
  return c;
}
