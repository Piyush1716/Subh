import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import bracelets from "@/assets/hero-bracelets.jpg";
import tree from "@/assets/hero-tree.jpg";
import spheres from "@/assets/hero-spheres.jpg";

const slides = [
  { img: bracelets, title: "Bracelets", subtitle: "Best way to absorb the energy of crystals", cta: "Shop Bracelets" },
  { img: tree, title: "Gemstone Trees", subtitle: "Bring prosperity & positivity home", cta: "Shop Trees" },
  { img: spheres, title: "Crystal Spheres", subtitle: "Harmony in every facet", cta: "Shop Spheres" },
];

export function HeroSlider() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((p) => (p + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="relative w-full overflow-hidden bg-peach">
      <div className="relative h-[420px] sm:h-[520px] md:h-[600px]">
        {slides.map((s, idx) => (
          <div
            key={idx}
            className="absolute inset-0 transition-opacity duration-700"
            style={{ opacity: i === idx ? 1 : 0 }}
            aria-hidden={i !== idx}
          >
            <img
              src={s.img}
              alt={s.title}
              className="absolute inset-0 w-full h-full object-cover"
              loading={idx === 0 ? "eager" : "lazy"}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background/40 via-transparent to-transparent md:via-transparent" />
            <div className="relative max-w-7xl mx-auto h-full px-6 lg:px-12 flex items-center justify-end">
              <div className="max-w-md text-right md:text-left">
                <h1 className="text-5xl md:text-7xl font-semibold text-foreground mb-4">{s.title}</h1>
                <p className="text-lg md:text-xl text-foreground/80 mb-6">{s.subtitle}</p>
                <button className="bg-foreground text-background px-7 py-3 rounded-full font-medium hover:bg-primary transition-colors">
                  {s.cta} →
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => setI((i - 1 + slides.length) % slides.length)}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/70 hover:bg-background rounded-full p-2 shadow-md"
        aria-label="Previous"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={() => setI((i + 1) % slides.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/70 hover:bg-background rounded-full p-2 shadow-md"
        aria-label="Next"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setI(idx)}
            className={`h-2 rounded-full transition-all ${i === idx ? "w-8 bg-foreground" : "w-2 bg-foreground/40"}`}
            aria-label={`Slide ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
