import HeroSection from "@/components/landing/hero-section";
import { SemanticHubs } from "@/components/seo/SemanticHubs";
import { getSemanticClusters } from "@/lib/admin/settings-store";

export default function HomePage() {
  const clusters = getSemanticClusters();

  return (
    <div className="flex flex-col min-h-screen bg-[#0A0C10]">
      <HeroSection />
      <div className="mx-auto max-w-7xl w-full px-4 sm:px-8 lg:px-14">
        <SemanticHubs clusters={clusters} />
      </div>
    </div>
  );
}
