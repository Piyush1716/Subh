import { Instagram, Facebook, Youtube, Mail, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-foreground text-background mt-12">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-14 grid md:grid-cols-4 gap-10">
        <div>
          <h3 className="text-2xl font-display font-semibold mb-3">GajananGems</h3>
          <p className="text-sm text-background/70 leading-relaxed">
            Your trusted source for authentic healing crystals, gemstone jewellery and spiritual decor since 2012.
          </p>
          <div className="flex gap-3 mt-5">
            <a href="#" aria-label="Instagram" className="p-2 rounded-full bg-background/10 hover:bg-primary"><Instagram className="h-4 w-4" /></a>
            <a href="#" aria-label="Facebook" className="p-2 rounded-full bg-background/10 hover:bg-primary"><Facebook className="h-4 w-4" /></a>
            <a href="#" aria-label="YouTube" className="p-2 rounded-full bg-background/10 hover:bg-primary"><Youtube className="h-4 w-4" /></a>
          </div>
        </div>
        <div>
          <h4 className="text-sm uppercase tracking-wider mb-4 text-background">Shop</h4>
          <ul className="space-y-2 text-sm text-background/70">
            <li><a href="#">Bracelets</a></li><li><a href="#">Pendants</a></li>
            <li><a href="#">Gemstone Trees</a></li><li><a href="#">Pyramids & Spheres</a></li>
            <li><a href="#">Home Decor</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm uppercase tracking-wider mb-4 text-background">Help</h4>
          <ul className="space-y-2 text-sm text-background/70">
            <li><a href="#">Track Order</a></li><li><a href="#">Shipping & Returns</a></li>
            <li><a href="#">FAQ</a></li><li><a href="#">Contact Us</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm uppercase tracking-wider mb-4">Newsletter</h4>
          <p className="text-sm text-background/70 mb-3">Get crystal tips and 10% off your first order.</p>
          <form className="flex">
            <input type="email" required placeholder="Your email" className="flex-1 bg-background/10 px-3 py-2 rounded-l-full text-sm outline-none placeholder:text-background/50" />
            <button className="bg-primary px-4 rounded-r-full text-sm font-medium">Join</button>
          </form>
          <div className="mt-5 space-y-2 text-sm text-background/70">
            <div className="flex items-center gap-2"><Phone className="h-4 w-4" /> +91 63515 63768</div>
            <div className="flex items-center gap-2"><Mail className="h-4 w-4" /> hello@gajanangems.com</div>
          </div>
        </div>
      </div>
      <div className="border-t border-background/10 py-4 text-center text-xs text-background/50">
        © {new Date().getFullYear()} GajananGems. All rights reserved.
      </div>
    </footer>
  );
}
