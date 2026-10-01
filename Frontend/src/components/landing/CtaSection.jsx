import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Terminal, Zap, ShieldCheck } from 'lucide-react';
import Button from '../common/Button';

export function CtaSection() {
  const navigate = useNavigate();

  return (
    <section id="cta" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="relative glass-panel rounded-3xl p-8 sm:p-14 border border-indigo-500/30 overflow-hidden shadow-2xl glow-primary text-center space-y-6">
        {/* Background ambient glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-cyan-500/20 opacity-60 pointer-events-none" />

        <div className="relative z-10 space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-mono border border-indigo-500/30">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>Ready to Level Up Your Engineering Team?</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-100 tracking-tight my-0 leading-tight">
            Start Collaborating on DevSpace Today
          </h2>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl mx-auto">
            Join thousands of developers building microservices, tracking sprints, and streamlining code reviews in one sleek workspace.
          </p>
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Button
            variant="primary"
            size="lg"
            icon={ArrowRight}
            onClick={() => navigate('/register')}
            className="w-full sm:w-auto text-base px-8 py-3"
          >
            Create Free Account
          </Button>

          <Button
            variant="outline"
            size="lg"
            icon={Terminal}
            onClick={() => navigate('/dashboard')}
            className="w-full sm:w-auto text-base px-8 py-3"
          >
            Explore Dashboard Demo
          </Button>
        </div>

        <div className="relative z-10 pt-4 flex items-center justify-center gap-6 text-xs text-slate-400 font-mono">
          <span>✓ Free 14-day trial</span>
          <span>•</span>
          <span>✓ Instant setup</span>
          <span>•</span>
          <span>✓ Cancel anytime</span>
        </div>
      </div>
    </section>
  );
}

export default CtaSection;
