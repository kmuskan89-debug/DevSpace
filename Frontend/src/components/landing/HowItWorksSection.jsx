import React from 'react';
import { Layers, UserPlus, FolderGit2, Rocket, ArrowRight } from 'lucide-react';
import Card from '../common/Card';

export function HowItWorksSection() {
  const steps = [
    {
      number: '01',
      title: 'Create Workspace',
      description: 'Initialize your squad workspace, set visibility settings, and organize repositories under one roof.',
      icon: Layers,
      color: 'from-indigo-500 to-purple-600',
      badge: 'Step 1'
    },
    {
      number: '02',
      title: 'Invite Your Team',
      description: 'Add developers, grant role permissions (Owner, Admin, Contributor), and connect GitHub profiles.',
      icon: UserPlus,
      color: 'from-cyan-500 to-blue-600',
      badge: 'Step 2'
    },
    {
      number: '03',
      title: 'Manage Projects & Sprints',
      description: 'Set up Kanban boards, link Git feature branches, tag priorities, and assign tasks to teammates.',
      icon: FolderGit2,
      color: 'from-emerald-500 to-teal-600',
      badge: 'Step 3'
    },
    {
      number: '04',
      title: 'Collaborate & Ship Code',
      description: 'Review PRs, stream live activity logs, trigger AI code reviews, and ship features faster with confidence.',
      icon: Rocket,
      color: 'from-amber-500 to-rose-600',
      badge: 'Step 4'
    }
  ];

  return (
    <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12 bg-slate-900/30 rounded-3xl border border-slate-800/80 my-10">
      {/* Section Header */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-mono font-semibold uppercase tracking-wider">
          Simple Workflow
        </span>

        <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-100 my-0 tracking-tight">
          How DevSpace Works in 4 Steps
        </h2>

        <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
          From workspace creation to production shipping — get your entire developer team aligned in minutes.
        </p>
      </div>

      {/* 4 Steps Timeline Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div key={idx} className="relative glass-card p-6 rounded-2xl border border-slate-800 space-y-4 hover:border-indigo-500/40 transition-all group">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-extrabold font-mono bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                  {step.number}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900 text-slate-400 border border-slate-800">
                  {step.badge}
                </span>
              </div>

              <div className="p-3 w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Icon className="w-6 h-6" />
              </div>

              <h3 className="text-base font-bold text-slate-100 group-hover:text-indigo-300 transition-colors my-0">
                {step.title}
              </h3>

              <p className="text-xs text-slate-400 leading-relaxed">
                {step.description}
              </p>

              {/* Connecting line indicator for desktop */}
              {idx < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 -translate-y-1/2 z-10 text-slate-700">
                  <ArrowRight className="w-5 h-5" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default HowItWorksSection;
