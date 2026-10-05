import { HeroSection } from './home/HeroSection.jsx';
import { CategorySection } from './home/CategorySection.jsx';
import { FeaturedProfessionalSection } from './home/FeaturedProfessionalSection.jsx';
import { HowItWorksSection } from './home/HowItWorksSection.jsx';
import { TrustSection } from './home/TrustSection.jsx';
import { ZoneSection } from './home/ZoneSection.jsx';
import { ProCTA } from './home/ProCTA.jsx';
import { FAQSection } from './home/FAQSection.jsx';
import { FinalCTA } from './home/FinalCTA.jsx';

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
