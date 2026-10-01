import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Terminal, GitBranch, Shield, Heart } from 'lucide-react';

export function LandingFooter() {
  const navigate = useNavigate();

  return (
    <footer className="glass-panel border-t border-slate-800/80 pt-16 pb-12 px-4 sm:px-6 lg:px-8 mt-20 text-xs text-slate-400">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-8 pb-12 border-b border-slate-800/80">
        {/* Brand Column */}
        <div className="md:col-span-2 space-y-4">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-400 p-0.5 shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-[7px] flex items-center justify-center">
                <Terminal className="w-4 h-4 text-cyan-400" />
              </div>
            </div>
            <span className="font-extrabold text-lg tracking-tight text-slate-100">
              DevSpace
            </span>
          </Link>

          <p className="text-slate-400 max-w-sm leading-relaxed">
            The developer collaboration platform for modern software teams. Manage microservices, track sprint boards, and ship code faster.
          </p>

          <div className="flex items-center gap-3 pt-2">
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-100 hover:border-slate-700 transition-colors"
            >
              <GitBranch className="w-4 h-4" />
            </a>
            <span className="text-[11px] font-mono text-slate-500">Built with React & Tailwind CSS</span>
          </div>
        </div>

        {/* Links Column 1: Product */}
        <div className="space-y-3">
          <h4 className="font-mono uppercase text-[11px] font-bold text-slate-200 tracking-wider">
            Product
          </h4>
          <ul className="space-y-2">
            <li>
              <button type="button" onClick={() => navigate('/dashboard')} className="hover:text-indigo-400 transition-colors cursor-pointer">
                Dashboard Overview
              </button>
            </li>
            <li>
              <button type="button" onClick={() => navigate('/workspace/ws-core-platform/projects/proj-auth-service/board')} className="hover:text-indigo-400 transition-colors cursor-pointer">
                Kanban Sprint Board
              </button>
            </li>
            <li>
              <button type="button" onClick={() => navigate('/workspace/ws-core-platform/members')} className="hover:text-indigo-400 transition-colors cursor-pointer">
                Team Management
              </button>
            </li>
            <li>
              <button type="button" onClick={() => navigate('/workspace/ws-core-platform/activity')} className="hover:text-indigo-400 transition-colors cursor-pointer">
                Live Audit Logs
              </button>
            </li>
          </ul>
        </div>

        {/* Links Column 2: Account */}
        <div className="space-y-3">
          <h4 className="font-mono uppercase text-[11px] font-bold text-slate-200 tracking-wider">
            Account
          </h4>
          <ul className="space-y-2">
            <li>
              <Link to="/login" className="hover:text-indigo-400 transition-colors">
                Sign In
              </Link>
            </li>
            <li>
              <Link to="/register" className="hover:text-indigo-400 transition-colors">
                Create Account
              </Link>
            </li>
            <li>
              <Link to="/forgot-password" className="hover:text-indigo-400 transition-colors">
                Password Recovery
              </Link>
            </li>
            <li>
              <Link to="/settings" className="hover:text-indigo-400 transition-colors">
                User Preferences
              </Link>
            </li>
          </ul>
        </div>

        {/* Links Column 3: Legal & Security */}
        <div className="space-y-3">
          <h4 className="font-mono uppercase text-[11px] font-bold text-slate-200 tracking-wider">
            Security & Legal
          </h4>
          <ul className="space-y-2 text-slate-400">
            <li className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>SOC2 Type II Certified</span>
            </li>
            <li>GDPR & Data Protection</li>
            <li>Privacy Policy</li>
            <li>Terms of Service</li>
          </ul>
        </div>
      </div>

      {/* Copyright Footer */}
      <div className="max-w-7xl mx-auto pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
        <p>© 2026 DevSpace Collaboration Platform. All rights reserved.</p>
        <div className="flex items-center gap-1">
          <span>Engineered with</span>
          <Heart className="w-3 h-3 text-rose-500 fill-rose-500 inline" />
          <span>for developers worldwide.</span>
        </div>
      </div>
    </footer>
  );
}

export default LandingFooter;
