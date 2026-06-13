import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { CheckCircle2, Package, Mail, MessageCircle } from "lucide-react";
import { z } from "zod";

export const Route = createFileRoute("/order-confirmation")({
  validateSearch: z.object({
    orderId:    z.string().optional(),
    firstName:  z.string().optional(),
    total:      z.string().optional(),
    payMethod:  z.string().optional(),
  }),
  head: () => ({
    meta: [
      { title: "Order Confirmed — GajananGems" },
      { name: "description", content: "Your GajananGems order has been placed successfully." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OrderConfirmationPage,
});

function OrderConfirmationPage() {
  const { orderId, firstName, total, payMethod } = Route.useSearch();

  const payLabel =
    payMethod === "razorpay" ? "Razorpay (Online)"
    : payMethod ?? "Online Payment";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-lg w-full text-center">
          {/* Success icon */}
          <div
            className="mx-auto h-20 w-20 rounded-full flex items-center justify-center mb-6 shadow-lg"
            style={{ backgroundColor: "#3F5C45" }}
          >
            <CheckCircle2 className="h-10 w-10 text-white" />
          </div>

          <h1 className="text-3xl font-semibold mb-2">
            {firstName ? `Thank you, ${firstName}! 🎉` : "Order Confirmed! 🎉"}
          </h1>
          <p className="text-muted-foreground mb-8">
            Your order has been placed successfully. We'll send a confirmation to your email shortly.
          </p>

          {/* Order details card */}
          {orderId && (
            <div className="border border-border rounded-2xl bg-card p-6 mb-8 text-left space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Order ID</span>
                <span className="font-semibold">#{orderId}</span>
              </div>
              {total && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-semibold">₹{parseInt(total).toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Payment</span>
                <span className="font-semibold">{payLabel}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Estimated delivery</span>
                <span className="font-semibold">5–7 business days</span>
              </div>
            </div>
          )}

          {/* Next steps */}
          <div className="grid sm:grid-cols-3 gap-4 mb-8 text-left">
            <div className="border border-border rounded-xl p-4 bg-card flex flex-col items-center text-center gap-2">
              <Mail className="h-6 w-6 text-primary" />
              <p className="text-xs font-medium">Check your email</p>
              <p className="text-xs text-muted-foreground">Order confirmation sent to your inbox</p>
            </div>
            <div className="border border-border rounded-xl p-4 bg-card flex flex-col items-center text-center gap-2">
              <Package className="h-6 w-6 text-primary" />
              <p className="text-xs font-medium">Track your order</p>
              <p className="text-xs text-muted-foreground">Use your Order ID &amp; email to track</p>
            </div>
            <div className="border border-border rounded-xl p-4 bg-card flex flex-col items-center text-center gap-2">
              <MessageCircle className="h-6 w-6 text-primary" />
              <p className="text-xs font-medium">Need help?</p>
              <p className="text-xs text-muted-foreground">WhatsApp +91 63515 63768</p>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/order-tracking"
              className="inline-flex items-center justify-center border border-primary text-primary rounded-full px-6 py-2.5 text-sm font-medium hover:bg-primary hover:text-white transition-colors"
            >
              Track My Order
            </Link>
            <Link
              to="/"
              className="inline-flex items-center justify-center bg-primary text-primary-foreground rounded-full px-6 py-2.5 text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
