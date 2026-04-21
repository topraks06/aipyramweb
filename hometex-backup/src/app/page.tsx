
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { TRTexBanner } from '@/components/TRTexBanner';
import { HeroSection } from '@/components/home/HeroSection';
import { TrendBlock } from '@/components/home/TrendBlock';
import { CollectionGrid } from '@/components/home/CollectionGrid';
import { FeaturedBrands } from '@/components/home/FeaturedBrands';
import { RegionSection } from '@/components/home/RegionSection';
import { AIAgentsSection } from '@/components/home/AIAgentsSection';
import { PerdeAICTA } from '@/components/home/PerdeAICTA';
import { EcosystemSection } from '@/components/EcosystemSection';
import { GoogleCloudSection } from '@/components/home/GoogleCloudSection';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <Navbar />
      <HeroSection />
      <TrendBlock />
      <CollectionGrid />
      <FeaturedBrands />
      <RegionSection />
      <AIAgentsSection />
      <GoogleCloudSection />
      <PerdeAICTA />
      <EcosystemSection />
      <TRTexBanner />
      <Footer />
    </div>
  );
}
