import HeroSection from "@/components/landing/hero-section";
import { SemanticHubs } from "@/components/seo/SemanticHubs";
import { FaqSection } from "@/components/seo/FaqSection";
import { getSemanticClusters, getSeoSettings } from "@/lib/admin/settings-store";

export default function HomePage() {
  const clusters = getSemanticClusters();
  const seo = getSeoSettings();

  return (
    <div className="flex flex-col min-h-screen bg-[#0A0C10]">
      <HeroSection />
      <div className="mx-auto max-w-7xl w-full px-4 sm:px-8 lg:px-14 pb-10">
        <SemanticHubs clusters={clusters} />
        <FaqSection
          items={seo.faqItems}
          enableSchema={seo.enableFaqSchema !== false && seo.jsonLdEnabled}
        />
      </div>
    </div>
  );
}
