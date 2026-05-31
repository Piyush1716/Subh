import promoA from "@/assets/promo-firstorder.jpg";
import promoB from "@/assets/promo-healing.jpg";

export function PromoBanners() {
  return (
    <section className="max-w-7xl mx-auto px-4 lg:px-6 py-12 grid md:grid-cols-2 gap-6">
      <a href="#" className="block rounded-2xl overflow-hidden group">
        <img src={promoA} alt="₹50 off your first order with FIRST50" loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
      </a>
      <a href="#" className="block rounded-2xl overflow-hidden group">
        <img src={promoB} alt="10–20% off healing crystals" loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
      </a>
    </section>
  );
}
