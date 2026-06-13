import { productImageUrl } from "./products";

// Lightweight type for search dropdown results
export type SearchResult = {
  slug: string;
  name: string;
  price: number;
  old?: number;
  img: string;
};

type RawSearchRow = {
  id: number;
  title: string;
  price: number;
  old_price?: number | null;
  image_url?: string | null;
  slug?: string | null;
};

/**
 * Normalise a raw Supabase row (partial product) into a SearchResult.
 * Used in the header search dropdown — we only select a handful of columns.
 */
export function normaliseProductForSearch(row: RawSearchRow): SearchResult {
  const slug =
    row.slug ??
    row.title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");

  return {
    slug,
    name: row.title,
    price: row.price,
    old: row.old_price ?? undefined,
    img: productImageUrl(row.image_url),
  };
}
