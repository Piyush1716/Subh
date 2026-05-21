import { Link } from "@tanstack/react-router";
import { categories as cats } from "@/lib/products";

export function TopCategories() {
  return (
    <section className="max-w-7xl mx-auto px-4 lg:px-6 py-16">
      <div className="text-center mb-10">
        <p className="text-sm uppercase tracking-[0.3em] text-primary mb-2">Discover</p>
        <h2 className="text-4xl md:text-5xl font-semibold">Top Categories</h2>
        <div className="h-1 w-16 bg-primary mx-auto mt-4 rounded-full" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {cats.map((c) => (
          <Link to="/category/$slug" params={{ slug: c.slug }} key={c.slug} className="group block text-center">
            <div className="aspect-square rounded-full overflow-hidden bg-secondary border border-border group-hover:shadow-lg transition-all">
              <img src={c.img} alt={c.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            <h3 className="mt-3 text-sm font-medium group-hover:text-primary transition-colors">{c.name}</h3>
          </Link>
        ))}
      </div>
    </section>
  );
}
