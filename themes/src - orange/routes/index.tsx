import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { HeroSlider } from "@/components/site/HeroSlider";
import { ValueProps } from "@/components/site/ValueProps";
import { TopCategories } from "@/components/site/TopCategories";
import { FeaturedProducts } from "@/components/site/FeaturedProducts";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main>
        <HeroSlider />
        <ValueProps />
        <TopCategories />
        <FeaturedProducts />
      </main>
      <Footer />
    </div>
  );
}
