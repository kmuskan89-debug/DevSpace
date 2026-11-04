import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import Button from '../common/Button';

export function CtaSection() {
  const navigate = useNavigate();

  return (
    <section id="capabilities" className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <div className="rounded-lg border border-[#E8E8E5] dark:border-[#353535] bg-[#F7F7F5] dark:bg-[#202020] p-8 sm:p-12 text-center space-y-6">
        <div className="space-y-2 max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-semibold text-[#252525] dark:text-[#F2F2F2] tracking-tight my-0">
            Ready to organize your engineering team?
          </h2>
          <p className="text-xs sm:text-sm text-[#777777] dark:text-[#A0A0A0] leading-relaxed">
            Create your workspace in seconds. Plan sprints, track issues, and collaborate with clarity.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            variant="primary"
            size="md"
            icon={ArrowRight}
            onClick={() => navigate('/register')}
            className="w-full sm:w-auto h-9 px-5 text-xs font-medium"
          >
            Get Started Free
          </Button>

          <Button
            variant="outline"
            size="md"
            onClick={() => navigate('/login')}
            className="w-full sm:w-auto h-9 px-5 text-xs font-medium"
          >
            Sign In to Workspace
          </Button>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-[#777777] dark:text-[#A0A0A0] pt-2">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#107C41] dark:text-[#4EBE7E]" />
            <span>Instant provisioning</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#107C41] dark:text-[#4EBE7E]" />
            <span>Granular role permissions</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#107C41] dark:text-[#4EBE7E]" />
            <span>No credit card required</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CtaSection;
