import React from 'react';
import LandingNavbar from '../components/landing/LandingNavbar';
import HeroSection from '../components/landing/HeroSection';
import FeaturesSection from '../components/landing/FeaturesSection';
import HowItWorksSection from '../components/landing/HowItWorksSection';
import CtaSection from '../components/landing/CtaSection';
import LandingFooter from '../components/landing/LandingFooter';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FFFFFF] dark:bg-[#191919] text-[#252525] dark:text-[#F2F2F2] flex flex-col justify-between font-sans antialiased selection:bg-[#252525] selection:text-[#FFFFFF] dark:selection:bg-[#F2F2F2] dark:selection:text-[#191919] transition-colors duration-150 overflow-x-hidden">
      {/* Navbar */}
      <LandingNavbar />

      {/* Main Page Content */}
      <main className="flex-1 space-y-12">
        {/* Section 1: Hero with Dashboard Product Preview */}
        <HeroSection />

        {/* Section 2: Features (7 Core Capabilities) */}
        <FeaturesSection />

        {/* Section 3: How It Works (4 Step Workflow) */}
        <HowItWorksSection />

        {/* Section 4: Call to Action */}
        <CtaSection />
      </main>

      {/* Section 5: Footer */}
      <LandingFooter />
    </div>
  );
}

export default LandingPage;
