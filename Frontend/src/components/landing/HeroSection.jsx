import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, ArrowRight, Terminal, Play, ShieldCheck, CheckCircle2 } from 'lucide-react';
import Button from '../common/Button';
import DashboardPreviewMockup from './DashboardPreviewMockup';

export function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="relative pt-12 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center space-y-8 overflow-hidden">
      {/* Background Radial Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[450px] bg-gradient-to-b from-indigo-600/20 via-purple-600/10 to-transparent blur-3xl pointer-events-none" />

      {/* Release Pill Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card border border-indigo-500/30 text-xs font-mono text-indigo-300 shadow-xl shadow-indigo-950/20 animate-in fade-in slide-in-from-top duration-500">
        <Zap className="w-3.5 h-3.5 text-cyan-400" />
        <span>DevSpace v2.4 — Next-Gen Developer Collaboration OS</span>
      </div>

      {/* Main Headline */}
      <div className="max-w-4xl mx-auto space-y-4">
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-100 my-0 leading-[1.08]">
          One Unified Workspace for{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-300 bg-clip-text text-transparent">
            Modern Developer Teams
          </span>
        </h1>

        <p className="text-base sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Streamline multi-repo code reviews, sprint boards, team communications, and automated CI workflows in one centralized developer hub.
        </p>
      </div>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <Button
          variant="primary"
          size="lg"
          icon={ArrowRight}
          onClick={() => navigate('/register')}
          className="w-full sm:w-auto text-base px-7 py-3"
        >
          Get Started Free
        </Button>

        <Button
          variant="outline"
          size="lg"
          icon={Play}
          onClick={() => navigate('/dashboard')}
          className="w-full sm:w-auto text-base px-7 py-3"
        >
          View Interactive Demo
        </Button>
      </div>

      {/* Trust Highlights */}
      <div className="flex flex-wrap items-center justify-center gap-6 pt-2 text-xs text-slate-400 font-mono">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>No credit card required</span>
        </div>
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Instant GitHub Sync</span>
        </div>
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Unlimited Public Workspaces</span>
        </div>
      </div>

      {/* Product Preview Mockup */}
      <div className="pt-6">
        <DashboardPreviewMockup />
      </div>
    </section>
  );
}

export default HeroSection;
