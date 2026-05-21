import { supabase } from "@/lib/supabase";

import bracelet from "@/assets/cat-bracelet.jpg";
import tree from "@/assets/cat-tree.jpg";
import sphere from "@/assets/cat-sphere.jpg";
import pyramid from "@/assets/cat-pyramid.jpg";
import pendant from "@/assets/cat-pendant.jpg";
import cluster from "@/assets/cat-cluster.jpg";
import ring from "@/assets/cat-ring.jpg";

// ─── Types ────────────────────────────────────────────────────────────────────

/** Shape of a row returned from the Supabase `products` table */
export type Product = {
  id: number;
  title: string;
  description: string | null;
  price: number;
  discont_price: number | null;   // matches the DB column name
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

  /** Category slug used to group products (populated from DB `category_slug` column if present) */
  categorySlug?: string;
};

/** A product category used for the category listing pages */
export type Category = {
  slug: string;
  name: string;
  img: string;
  description: string;
};

// ─── Static category definitions ─────────────────────────────────────────────
// Category metadata (name, image, description) is defined here because it is
// purely presentational. Products are linked to a category via the
// `category_slug` column in Supabase.

export const categories: Category[] = [
  {
    slug: "bracelet",
    name: "Bracelets",
    img: bracelet,
    description:
      "Handcrafted gemstone & crystal bracelets cleansed and charged for healing, protection, and abundance.",
  },
  {
    slug: "gemstone-trees",
    name: "Gemstone Trees",
    img: tree,
    description:
      "Beautiful gemstone trees to attract prosperity, balance energies, and elevate your space.",
  },
  {
    slug: "spheres",
    name: "Spheres",
    img: sphere,
    description:
      "Crystal spheres radiate energy in all directions, perfect for meditation and harmonising spaces.",
  },
  {
    slug: "pyramids",
    name: "Pyramids",
    img: pyramid,
    description:
      "Crystal pyramids focus and amplify energy — ideal for vastu, healing and manifestation.",
  },
  {
    slug: "pendants",
    name: "Pendants",
    img: pendant,
    description:
      "Wearable crystal pendants to keep healing energy close to your heart all day.",
  },
  {
    slug: "clusters",
    name: "Clusters",
    img: cluster,
    description:
      "Raw crystal clusters that cleanse surrounding energy and bring natural beauty to any room.",
  },
  {
    slug: "finger-rings",
    name: "Finger Rings",
    img: ring,
    description:
      "Gemstone-set rings combining astrology, fashion and healing benefits.",
  },
];

/** Look up a category by slug */
export function getCategory(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

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
    // Support an optional `category_slug` column in Supabase for category pages
    categorySlug: (row.category_slug as string | null) ?? undefined,
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

/**
 * Fetch all products belonging to a given category slug.
 * Relies on the `category_slug` column existing in the Supabase `products` table.
 * Falls back to an empty array if the column is not yet present.
 */
export async function fetchProductsByCategory(categorySlug: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("category_slug", categorySlug)
    .order("created_at", { ascending: false });

  if (error) {
    // If the column doesn't exist yet, fall back to filtering all products
    console.warn("fetchProductsByCategory: falling back to client-side filter", error.message);
    const all = await fetchProducts();
    return all.filter((p) => p.categorySlug === categorySlug);
  }

  return (data ?? []).map(normalise);
}
