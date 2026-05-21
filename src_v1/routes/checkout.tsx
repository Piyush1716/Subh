import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { useCart } from "@/lib/cart";
import { useState } from "react";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Shubhanjali" },
      { name: "description", content: "Securely complete your order for healing crystals and gemstone jewellery." },
    ],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { items, subtotal, clear, getProduct } = useCart();
  const navigate = useNavigate();
  const [pay, setPay] = useState("cod");
  const [placing, setPlacing] = useState(false);
  const shipping = subtotal > 0 && subtotal < 2000 ? 99 : 0;
  const total = subtotal + shipping;

  const onPlace = (e: React.FormEvent) => {
    e.preventDefault();
    setPlacing(true);
    // TODO: integrate with your order API / Supabase orders table here
    setTimeout(() => {
      clear();
      navigate({ to: "/" });
    }, 800);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-6 py-8 lg:py-12">
        <nav className="text-sm text-muted-foreground mb-4">
          <Link to="/" className="hover:text-primary">Home</Link> <span className="mx-1">/</span>{" "}
          <Link to="/cart" className="hover:text-primary">Cart</Link> <span className="mx-1">/</span> <span>Checkout</span>
        </nav>
        <h1 className="text-3xl lg:text-4xl font-semibold mb-8">Checkout</h1>

        {items.length === 0 ? (
          <div className="text-center py-16 border border-border rounded-xl bg-card">
            <p className="mb-4">Your cart is empty.</p>
            <Link to="/" className="inline-flex bg-primary text-primary-foreground rounded-full px-6 py-3 text-sm">Shop now</Link>
          </div>
        ) : (
          <form onSubmit={onPlace} className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <section className="border border-border rounded-xl p-6 bg-card">
                <h2 className="text-lg font-semibold mb-4">Billing Details</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="First name *" name="firstName" required />
                  <Field label="Last name *" name="lastName" required />
                  <Field label="Email *" name="email" type="email" required className="sm:col-span-2" />
                  <Field label="Phone *" name="phone" type="tel" required className="sm:col-span-2" />
                  <Field label="Street address *" name="address" required className="sm:col-span-2" />
                  <Field label="Town / City *" name="city" required />
                  <Field label="State *" name="state" required />
                  <Field label="PIN Code *" name="pin" required />
                  <Field label="Country" name="country" defaultValue="India" />
                </div>
                <div className="mt-4">
                  <label className="block text-sm mb-1">Order notes (optional)</label>
                  <textarea name="notes" rows={3} className="w-full border border-input rounded-md px-3 py-2 bg-background text-sm" />
                </div>
              </section>

              <section className="border border-border rounded-xl p-6 bg-card">
                <h2 className="text-lg font-semibold mb-4">Payment Method</h2>
                <div className="space-y-3">
                  {[
                    { id: "cod", label: "Cash on Delivery", desc: "Pay with cash upon delivery." },
                    { id: "upi", label: "UPI / Net Banking", desc: "Pay securely via UPI or Net Banking." },
                    { id: "card", label: "Credit / Debit Card", desc: "Visa, Mastercard, Rupay." },
                  ].map((m) => (
                    <label key={m.id} className={`flex gap-3 border rounded-lg p-4 cursor-pointer ${pay === m.id ? "border-primary bg-secondary/50" : "border-border"}`}>
                      <input type="radio" name="pay" value={m.id} checked={pay === m.id} onChange={() => setPay(m.id)} className="mt-1" />
                      <div>
                        <div className="font-medium text-sm">{m.label}</div>
                        <div className="text-xs text-muted-foreground">{m.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </section>
            </div>

            <aside className="border border-border rounded-xl p-6 bg-card h-fit space-y-4 lg:sticky lg:top-28">
              <h2 className="text-lg font-semibold">Your Order</h2>
              <div className="space-y-3 max-h-72 overflow-auto">
                {items.map((it) => {
                  const p = getProduct(it.slug);
                  if (!p) return null;
                  return (
                    <div key={`${it.slug}-${it.size ?? ""}`} className="flex gap-3 text-sm">
                      <img src={p.img} alt={p.name} className="h-14 w-14 rounded object-cover" />
                      <div className="flex-1">
                        <div className="font-medium line-clamp-1">{p.name}</div>
                        <div className="text-xs text-muted-foreground">Qty {it.qty}{it.size ? ` · ${it.size}` : ""}</div>
                      </div>
                      <div>₹{(p.price * it.qty).toLocaleString()}</div>
                    </div>
                  );
                })}
              </div>
              <div className="border-t border-border pt-4 space-y-2 text-sm">
                <div className="flex justify-between"><span>Subtotal</span><span>₹{subtotal.toLocaleString()}</span></div>
                <div className="flex justify-between"><span>Shipping</span><span>{shipping === 0 ? "Free" : `₹${shipping}`}</span></div>
                <div className="flex justify-between font-semibold text-base pt-2 border-t border-border"><span>Total</span><span>₹{total.toLocaleString()}</span></div>
              </div>
              <button type="submit" disabled={placing} className="w-full bg-primary text-primary-foreground rounded-full py-3 text-sm font-medium hover:bg-primary/90 disabled:opacity-60">
                {placing ? "Placing order..." : "Place Order"}
              </button>
              <p className="text-xs text-muted-foreground text-center">Your personal data will be used to process your order and support your experience.</p>
            </aside>
          </form>
        )}
      </main>
      <Footer />
    </div>
  );
}

function Field({ label, className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; className?: string }) {
  return (
    <div className={className}>
      <label className="block text-sm mb-1">{label}</label>
      <input {...props} className="w-full border border-input rounded-md px-3 py-2 bg-background text-sm" />
    </div>
  );
}
