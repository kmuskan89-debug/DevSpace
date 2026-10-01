import React from 'react';
import {
  Kanban,
  Zap,
  MessageSquare,
  GitBranch,
  Bot,
  BarChart3,
  Check
} from 'lucide-react';
import Card from '../common/Card';

export function FeaturesSection() {
  const features = [
    {
      id: 'project-management',
      title: 'Project & Sprint Management',
      description: 'Organize microservices into workspaces, track Kanban boards, set issue priorities, and manage sprint backlogs effortless.',
      icon: Kanban,
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
      badge: 'Sprint Board'
    },
    {
      id: 'real-time-collab',
      title: 'Real-Time Collaboration',
      description: 'WebSockets powered engine enabling live pair programming, real-time code cursors, and instant team status updates.',
      icon: Zap,
      color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
      badge: 'Live Sync'
    },
    {
      id: 'team-communication',
      title: 'Developer Communication',
      description: 'Inline code threads, pull request review comments, and contextual notifications directly inside your sprint workflow.',
      icon: MessageSquare,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      badge: 'Contextual Threads'
    },
    {
      id: 'github-integration',
      title: 'Native GitHub Integration',
      description: 'Bi-directional sync connecting pull requests, git feature branches, commit hashes, and automated webhook triggers.',
      icon: GitBranch,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      badge: 'OAuth2 Sync'
    },
    {
      id: 'ai-assistant',
      title: 'AI Code Assistant & Reviewer',
      description: 'Automated PR summaries, security vulnerability scans, test suite generation, and intelligent code review agent.',
      icon: Bot,
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
      badge: 'LLM Powered'
    },
    {
      id: 'analytics',
      title: 'Engineering Velocity Analytics',
      description: 'Track commit frequency, pull request merge time, sprint progress charts, and team productivity insights.',
      icon: BarChart3,
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
      badge: 'Live Metrics'
    }
  ];

  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
      {/* Section Header */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-mono font-semibold uppercase tracking-wider">
          Platform Capabilities
        </span>

        <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-100 my-0 tracking-tight">
          Everything Your Engineering Team Needs
        </h2>

        <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
          Designed by developers for developers. DevSpace combines issue tracking, git sync, team chats, and AI reviews into one sleek dashboard.
        </p>
      </div>

      {/* 6 Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feat) => {
          const Icon = feat.icon;
          return (
            <Card
              key={feat.id}
              hoverable={true}
              className="flex flex-col justify-between p-6 border border-slate-800 hover:border-indigo-500/40 group transition-all"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-xl border ${feat.color} group-hover:scale-105 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900 text-slate-400 border border-slate-800">
                    {feat.badge}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-100 group-hover:text-indigo-300 transition-colors my-0">
                  {feat.title}
                </h3>

                <p className="text-xs text-slate-400 leading-relaxed">
                  {feat.description}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 group-hover:text-indigo-400 transition-colors">
                <Check className="w-3.5 h-3.5 text-indigo-400" />
                <span>Production Ready</span>
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

export default FeaturesSection;
