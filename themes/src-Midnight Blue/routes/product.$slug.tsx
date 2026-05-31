import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Star, Heart, Minus, Plus, Truck, ShieldCheck, Sparkles, ChevronRight } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { fetchProductBySlug, fetchProducts, type Product } from "@/lib/products";
import { useCart } from "@/lib/cart";

export const Route = createFileRoute("/product/$slug")({
  head: ({ params }) => {
    return {
      meta: [
        { title: `Product — GajananGems` },
        { name: "description", content: "Authentic healing crystals and gemstone jewellery." },
      ],
    };
  },
  loader: async ({ params }) => {
    const product = await fetchProductBySlug(params.slug);
    if (!product) throw notFound();
    const allProducts = await fetchProducts();
    const related = allProducts.filter((p) => p.slug !== params.slug).slice(0, 4);
    return { product, related };
  },
  notFoundComponent: () => (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center p-8 text-center">
        <div>
          <h1 className="text-4xl font-semibold mb-3">Product not found</h1>
          <Link to="/" className="text-primary underline">Back to shop</Link>
        </div>
      </div>
      <Footer />
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="min-h-screen flex items-center justify-center p-8">
      <p className="text-destructive">{error.message}</p>
    </div>
  ),
  component: ProductPage,
});

function ProductPage() {
  const { product, related } = Route.useLoaderData() as { product: Product; related: Product[] };
  const gallery = product.gallery?.length ? product.gallery : [product.img];
  const [active, setActive] = useState(0);
  const [size, setSize] = useState<string | undefined>(product.sizes?.[2]);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<"desc" | "info" | "reviews">("desc");
  const { add } = useCart();
  const navigate = useNavigate();

  const handleAddToCart = () => add(product.slug, qty, size);
  const handleBuyNow = () => {
    add(product.slug, qty, size);
    navigate({ to: "/checkout" });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1">
        <nav className="max-w-7xl mx-auto px-4 lg:px-6 pt-5 text-xs sm:text-sm text-muted-foreground flex items-center gap-1 flex-wrap">
          <Link to="/" className="hover:text-primary">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <span>Products</span>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground line-clamp-1">{product.name}</span>
        </nav>

        <section className="max-w-7xl mx-auto px-4 lg:px-6 py-6 sm:py-10 grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Gallery */}
          <div className="flex flex-col-reverse sm:flex-row gap-3">
            <div className="flex sm:flex-col gap-2 sm:gap-3 overflow-auto sm:max-h-[560px]">
              {gallery.map((g, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition ${active === i ? "border-primary" : "border-border"}`}
                >
                  <img src={g} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
            <div className="relative flex-1 aspect-square rounded-2xl overflow-hidden bg-secondary">
              <img src={gallery[active]} alt={product.name} className="w-full h-full object-cover" />
              {product.old && (
                <span className="absolute top-4 left-4 bg-primary text-primary-foreground text-xs uppercase tracking-wider px-3 py-1 rounded-full">
                  Sale
                </span>
              )}
            </div>
          </div>

          {/* Info */}
          <div>
            {product.tag && (
              <span className="inline-block bg-primary text-primary-foreground text-[10px] uppercase tracking-wider px-3 py-1 rounded-full mb-3">
                {product.tag}
              </span>
            )}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold mb-3">{product.name}</h1>

            {(product.rating !== undefined) && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className={`h-4 w-4 ${s <= Math.round(product.rating ?? 0) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">({product.reviews} reviews)</span>
              </div>
            )}

            <div className="flex items-baseline gap-3 mb-5">
              <span className="text-3xl font-bold text-primary">₹{product.price}</span>
              {product.old && (
                <>
                  <span className="text-lg text-muted-foreground line-through">₹{product.old}</span>
                  <span className="text-sm bg-secondary text-secondary-foreground px-2 py-0.5 rounded font-medium">
                    Save ₹{product.old - product.price}
                  </span>
                </>
              )}
            </div>

            {product.shortDescription && (
              <p className="text-muted-foreground text-sm sm:text-base mb-6 leading-relaxed">
                {product.shortDescription}
              </p>
            )}

            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-6">
                <p className="text-sm font-medium mb-2">Beads Size (mm)</p>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSize(s)}
                      className={`px-3 py-1.5 text-sm border rounded-full transition ${size === s ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary"}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-4 mb-5">
              <div className="flex items-center border border-border rounded-full overflow-hidden">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-4 py-2.5 hover:bg-secondary transition">
                  <Minus className="h-4 w-4" />
                </button>
                <span className="px-4 py-2.5 min-w-[3rem] text-center font-medium">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="px-4 py-2.5 hover:bg-secondary transition">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-foreground text-background rounded-full py-3 font-medium hover:bg-primary transition-colors"
              >
                Add to Cart
              </button>
              <button className="p-3 border border-border rounded-full hover:border-primary" aria-label="Wishlist">
                <Heart className="h-5 w-5" />
              </button>
            </div>

            <button
              onClick={handleBuyNow}
              className="w-full bg-primary text-primary-foreground rounded-full py-3 font-medium hover:bg-primary/90 transition-colors mb-6"
            >
              Buy Now
            </button>

            <div className="bg-secondary/50 rounded-xl p-4 text-sm space-y-2 mb-6">
              <p className="font-medium">Want a perfect fit?</p>
              <p className="text-muted-foreground">Mention your wrist size in the order notes 💖. For sizes larger than 7 inches a small charge is added; smaller sizes ship with the extra beads.</p>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center text-xs">
              <div className="p-3 border border-border rounded-lg">
                <Truck className="h-5 w-5 mx-auto mb-1 text-primary" />
                Free shipping ₹2000+
              </div>
              <div className="p-3 border border-border rounded-lg">
                <ShieldCheck className="h-5 w-5 mx-auto mb-1 text-primary" />
                100% Authentic
              </div>
              <div className="p-3 border border-border rounded-lg">
                <Sparkles className="h-5 w-5 mx-auto mb-1 text-primary" />
                Cleansed & Charged
              </div>
            </div>

            {product.categoryName  && (
              <p className="text-xs text-muted-foreground mt-6">
                <span className="font-medium text-foreground">Category:</span> {product.categoryName}
                {product.stone && <> · <span className="font-medium text-foreground">Stone:</span> {product.stone}</>}
              </p>
            )}
          </div>
        </section>

        {/* Tabs */}
        <section className="max-w-7xl mx-auto px-4 lg:px-6 pb-12">
          <div className="border-b border-border flex gap-6 overflow-x-auto">
            {[
              { id: "desc", label: "Description" },
              { id: "info", label: "Additional Information" },
              { id: "reviews", label: `Reviews (${product.reviews ?? 0})` },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id as typeof tab)}
                className={`py-3 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition ${tab === t.id ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="py-6 prose max-w-none">
            {tab === "desc" && (
              <div className="space-y-4 text-sm sm:text-base text-foreground/80">
                {product.benefits && product.benefits.length > 0 ? (
                  <>
                    <h3 className="text-lg font-semibold text-foreground">Benefits of a {product.name}</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      {product.benefits.map((b) => <li key={b}>{b}</li>)}
                    </ul>
                  </>
                ) : (
                  <p>{product.description ?? "No description available."}</p>
                )}
              </div>
            )}
            {tab === "info" && (
              <table className="w-full text-sm">
                <tbody className="divide-y divide-border">
                  {product.sizes && <tr><td className="py-3 font-medium w-40">Beads Size (mm)</td><td>{product.sizes.join(", ")}</td></tr>}
                  {product.stone && <tr><td className="py-3 font-medium">Stone</td><td>{product.stone}</td></tr>}
                  <tr><td className="py-3 font-medium">Added</td><td>{new Date(product.created_at).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</td></tr>
                </tbody>
              </table>
            )}
            {tab === "reviews" && (
              <div className="space-y-4">
                {product.rating !== undefined ? (
                  <div className="flex items-center gap-4">
                    <div className="text-5xl font-semibold">{product.rating}</div>
                    <div>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className={`h-4 w-4 ${s <= Math.round(product.rating ?? 0) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} />
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground">Based on {product.reviews} reviews</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No reviews yet.</p>
                )}
                <p className="text-sm text-muted-foreground">Sign in to leave a review.</p>
              </div>
            )}
          </div>
        </section>

        {/* Related */}
        {related.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 lg:px-6 pb-16">
            <h2 className="text-2xl sm:text-3xl font-semibold mb-6">You may also like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5">
              {related.map((r) => (
                <Link key={r.id} to="/product/$slug" params={{ slug: r.slug }} className="group bg-card rounded-2xl overflow-hidden border border-border hover:shadow-xl transition">
                  <div className="aspect-square overflow-hidden bg-secondary">
                    <img src={r.img} alt={r.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-3 sm:p-4">
                    <h3 className="text-xs sm:text-sm font-medium line-clamp-2 min-h-[2.5rem]">{r.name}</h3>
                    <div className="mt-2 text-base font-semibold">₹{r.price}</div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
