import { Truck, ShieldCheck, Sparkles, HeartHandshake } from "lucide-react";

const items = [
  { icon: Truck, title: "Free Shipping", desc: "On orders over ₹2000" },
  { icon: ShieldCheck, title: "100% Authentic", desc: "Energised & certified crystals" },
  { icon: Sparkles, title: "Cleansed & Charged", desc: "Ready to wear" },
  { icon: HeartHandshake, title: "Expert Guidance", desc: "Find your perfect stone" },
];

export function ValueProps() {
  return (
    <section className="border-y border-border bg-card">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-6">
        {items.map((it) => (
          <div key={it.title} className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: "#EFE8DC" }}>
              <it.icon className="h-5 w-5" style={{ color: "#3F5C45" }} />
            </div>
            <div>
              <h3 className="text-sm font-semibold">{it.title}</h3>
              <p className="text-xs text-muted-foreground">{it.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
