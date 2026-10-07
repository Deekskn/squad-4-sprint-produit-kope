import { HeroSection } from '@/shared/components/home/HeroSection.jsx';
import { CategorySection } from '@/shared/components/home/CategorySection.jsx';
import { FeaturedProfessionalSection } from '@/shared/components/home/FeaturedProfessionalSection.jsx';
import { HowItWorksSection } from '@/shared/components/home/HowItWorksSection.jsx';
import { TrustSection } from '@/shared/components/home/TrustSection.jsx';
import { ZoneSection } from '@/shared/components/home/ZoneSection.jsx';
import { ProCTA } from '@/shared/components/home/ProCTA.jsx';
import { FAQSection } from '@/shared/components/home/FAQSection.jsx';
import { FinalCTA } from '@/shared/components/home/FinalCTA.jsx';

export function HomePage() {
  return (
    <>
      <HeroSection />
      <CategorySection />
      <FeaturedProfessionalSection />
      <HowItWorksSection />
      <TrustSection />
      <ZoneSection />
      <ProCTA />
      <FAQSection />
      <FinalCTA />
    </>
  );
}
