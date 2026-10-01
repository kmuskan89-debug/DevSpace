import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Kanban,
  GitBranch,
  GitCommit,
  GitPullRequest,
  CheckCircle2,
  Terminal,
  Bot,
  Play,
  Layers,
  ArrowRight
} from 'lucide-react';
import Badge from '../common/Badge';
import Avatar from '../common/Avatar';

export function DashboardPreviewMockup() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('board');

  return (
    <div className="w-full max-w-5xl mx-auto glass-panel rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-700/60 shadow-2xl glow-primary space-y-4 text-left">
      {/* Window Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-rose-500/80" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
          </div>
          <span className="text-xs font-mono text-slate-500 hidden sm:inline">
            devspace://ws-core-platform/workspace/overview
          </span>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('board')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'board'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Kanban className="w-3.5 h-3.5" />
            <span>Sprint Board</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('commits')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'commits'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <GitCommit className="w-3.5 h-3.5" />
            <span>Live Commits</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ai')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'ai'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-cyan-400" />
            <span>AI Code Copilot</span>
          </button>
        </div>
      </div>

      {/* Dynamic Content View Area */}
      {activeTab === 'board' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1 animate-in fade-in duration-300">
          {/* Column 1 */}
          <div className="glass-card p-3.5 rounded-xl border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold text-slate-400">TO DO (2)</span>
              <span className="w-2 h-2 rounded-full bg-slate-500" />
            </div>
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-700/70 space-y-2 hover:border-indigo-500/40 transition-colors">
              <div className="flex justify-between items-center text-[10px] font-mono text-slate-500">
                <span>TASK-102</span>
                <Badge priority="High" size="sm" />
              </div>
              <p className="text-xs font-bold text-slate-200">Rate Limiting Redis Token Bucket</p>
              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                <span>Branch: feature/redis-limiter</span>
                <Avatar name="Sarah Chen" size="sm" />
              </div>
            </div>
          </div>

          {/* Column 2 */}
          <div className="glass-card p-3.5 rounded-xl border border-indigo-500/30 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold text-indigo-400">IN PROGRESS (1)</span>
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            </div>
            <div className="p-3 rounded-lg bg-slate-900 border border-indigo-500/50 space-y-2 shadow-lg shadow-indigo-950/40">
              <div className="flex justify-between items-center text-[10px] font-mono text-slate-500">
                <span>TASK-101</span>
                <Badge priority="Urgent" size="sm" />
              </div>
              <p className="text-xs font-bold text-slate-200">OAuth2 PKCE Mobile Authorization</p>
              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                <span className="text-indigo-300 font-mono">PR #42 Open</span>
                <Avatar name="Alex Rivera" size="sm" />
              </div>
            </div>
          </div>

          {/* Column 3 */}
          <div className="glass-card p-3.5 rounded-xl border border-emerald-500/30 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold text-emerald-400">DONE (18)</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>
            <div className="p-3 rounded-lg bg-slate-900 border border-emerald-500/30 space-y-2">
              <div className="flex justify-between items-center text-[10px] font-mono text-slate-500">
                <span>TASK-104</span>
                <Badge priority="Low" size="sm" />
              </div>
              <p className="text-xs font-bold text-slate-200">JWT Gateway Verification Suite</p>
              <div className="flex items-center justify-between text-[10px] text-emerald-400 pt-1 border-t border-slate-800 font-mono">
                <span>Build #148 Passed (46 tests)</span>
                <Avatar name="David Kim" size="sm" />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'commits' && (
        <div className="space-y-2.5 pt-1 font-mono text-xs animate-in fade-in duration-300">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <GitCommit className="w-4 h-4 text-indigo-400" />
              <div>
                <span className="text-slate-100 font-bold">c8f419b: fix(auth): refresh token rotation race condition</span>
                <span className="block text-[11px] text-slate-400">pushed by @alexrivera • 14 mins ago</span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px]">
              Verified
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <GitPullRequest className="w-4 h-4 text-cyan-400" />
              <div>
                <span className="text-slate-100 font-bold">PR #42: feat(ui): add responsive sidebar & dark theme tokens</span>
                <span className="block text-[11px] text-slate-400">opened by @elena • 42 mins ago</span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px]">
              Approved (2)
            </span>
          </div>
        </div>
      )}

      {activeTab === 'ai' && (
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-3 animate-in fade-in duration-300">
          <div className="flex items-center gap-2 text-cyan-400 font-bold border-b border-slate-800 pb-2">
            <Bot className="w-4 h-4" />
            <span>DevSpace AI Copilot Agent</span>
          </div>
          <p className="text-slate-300 leading-relaxed">
            <span className="text-slate-500">// Automated Code Review Summary</span><br />
            Found 0 security vulnerabilities in PR #42. Redis token bucket rate limiter benchmark handles 14,500 req/sec with 1.2ms p99 latency.
          </p>
          <div className="p-2.5 rounded bg-slate-900 border border-cyan-500/30 text-indigo-300">
            ✓ Recommendation: Ready to merge into <code>main</code>
          </div>
        </div>
      )}

      {/* Interactive Footer Banner */}
      <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-indigo-400" />
          <span>Real-time WebSocket connection active • 14 engineers online</span>
        </div>

        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center gap-1 font-bold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
        >
          <span>Launch Full Dashboard</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

export default DashboardPreviewMockup;
