import React from 'react';
import LandingNavbar from '../components/landing/LandingNavbar';
import HeroSection from '../components/landing/HeroSection';
import FeaturesSection from '../components/landing/FeaturesSection';
import HowItWorksSection from '../components/landing/HowItWorksSection';
import CtaSection from '../components/landing/CtaSection';
import LandingFooter from '../components/landing/LandingFooter';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white font-sans antialiased overflow-x-hidden">
      {/* Navbar */}
      <LandingNavbar />

      {/* Main Page Content */}
      <main className="flex-1 space-y-12">
        {/* Section 1: Hero with Dashboard Product Preview */}
        <HeroSection />

        {/* Section 2: Features (6 Key Capabilities) */}
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
