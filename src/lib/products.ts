import { supabase } from "@/lib/supabase";

// ─── Type matching your Supabase table ───────────────────────────────────────
export type Product = {
  id: number;
  title: string;
  description: string | null;
  price: number;
  discont_price: number | null;   // matches the column name you specified
  image_url: string;
  created_at: string;

  // UI-friendly aliases (derived, not stored in DB)
  slug: string;           // generated from title
  name: string;           // alias for title
  img: string;            // alias for image_url
  old?: number;           // alias for discont_price (original/strikethrough price)
  tag?: string;
  rating?: number;
  reviews?: number;
  stone?: string;
  shortDescription?: string;
  benefits?: string[];
  sizes?: string[];
  categories?: string[];
  gallery?: string[];
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Turn a product title into a URL slug  e.g. "Pyrite Bracelet" → "pyrite-bracelet" */
export function titleToSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

/** Normalise a raw Supabase row into the shape the UI expects */
function normalise(row: Record<string, unknown>): Product {
  const title = row.title as string;
  return {
    ...(row as unknown as Product),
    name: title,
    slug: titleToSlug(title),
    img: row.image_url as string,
    old: (row.discont_price as number | null) ?? undefined,
    shortDescription: (row.description as string | null) ?? undefined,
  };
}

// ─── Data-fetching functions ──────────────────────────────────────────────────

/** Fetch all products ordered by newest first */
export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map(normalise);
}

/** Fetch a single product by its slug (derived from title) */
export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  const all = await fetchProducts();
  return all.find((p) => p.slug === slug) ?? null;
}

/** Fetch a single product by its numeric id */
export async function fetchProductById(id: number): Promise<Product | null> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return normalise(data);
}
