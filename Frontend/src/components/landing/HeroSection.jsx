import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Layers, CheckCircle2 } from 'lucide-react';
import Button from '../common/Button';
import DashboardPreviewMockup from './DashboardPreviewMockup';

export function HeroSection() {
  const navigate = useNavigate();

  const scrollToFeatures = () => {
    const el = document.getElementById('features');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="pt-12 sm:pt-16 pb-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center space-y-8">
      {/* Release Tag Pill */}
      <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#F1F1EF] dark:bg-[#242424] border border-[#E8E8E5] dark:border-[#353535] text-xs font-mono text-[#777777] dark:text-[#A0A0A0]">
        <Layers className="w-3.5 h-3.5 text-[#252525] dark:text-[#F2F2F2]" />
        <span>DevSpace 2.0 — Agile & Workspace Management</span>
      </div>

      {/* Main Headline & Supporting Text */}
      <div className="space-y-4 max-w-3xl mx-auto">
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-[#252525] dark:text-[#F2F2F2] leading-[1.12]">
          Your team's work, organized in one place.
        </h1>

        <p className="text-sm sm:text-lg text-[#777777] dark:text-[#A0A0A0] max-w-2xl mx-auto leading-relaxed font-normal">
          Plan projects, manage tasks, collaborate with your team, and keep every milestone on track with DevSpace.
        </p>
      </div>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
        <Button
          variant="primary"
          size="md"
          icon={ArrowRight}
          onClick={() => navigate('/register')}
          className="w-full sm:w-auto h-9 px-5 text-xs font-medium"
        >
          Get Started
        </Button>

        <Button
          variant="outline"
          size="md"
          onClick={scrollToFeatures}
          className="w-full sm:w-auto h-9 px-5 text-xs font-medium"
        >
          Explore Features
        </Button>
      </div>

      {/* Trust Highlights */}
      <div className="flex items-center justify-center gap-6 text-xs text-[#777777] dark:text-[#A0A0A0] pt-2">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#107C41] dark:text-[#4EBE7E]" />
          <span>No credit card required</span>
        </div>
        <span>•</span>
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#107C41] dark:text-[#4EBE7E]" />
          <span>Instant workspace setup</span>
        </div>
      </div>

      {/* Realistic Product Showcase Mockup */}
      <div className="pt-6">
        <DashboardPreviewMockup />
      </div>
    </section>
  );
}

export default HeroSection;
