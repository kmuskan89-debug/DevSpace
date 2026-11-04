import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Terminal } from 'lucide-react';

export function LandingFooter() {
  const navigate = useNavigate();

  return (
    <footer className="border-t border-[#E8E8E5] dark:border-[#353535] bg-[#FFFFFF] dark:bg-[#191919] pt-12 pb-8 px-4 sm:px-6 lg:px-8 text-xs text-[#777777] dark:text-[#A0A0A0]">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="sm:col-span-2 space-y-3">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-6 h-6 rounded-md bg-[#252525] dark:bg-[#F2F2F2] text-[#FFFFFF] dark:text-[#191919] flex items-center justify-center font-bold">
                <Terminal className="w-3.5 h-3.5" />
              </div>
              <span className="font-semibold text-sm tracking-tight text-[#252525] dark:text-[#F2F2F2]">
                DevSpace
              </span>
            </Link>

            <p className="text-xs text-[#777777] dark:text-[#A0A0A0] max-w-sm leading-relaxed">
              A minimalist, high-performance project and workspace management platform designed for software teams.
            </p>
          </div>

          {/* Links: Product */}
          <div className="space-y-2.5">
            <h4 className="text-[11px] font-mono uppercase tracking-wider font-semibold text-[#252525] dark:text-[#F2F2F2]">
              Platform
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="hover:text-[#252525] dark:hover:text-[#F2F2F2] transition-colors cursor-pointer"
                >
                  Dashboard
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('features');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="hover:text-[#252525] dark:hover:text-[#F2F2F2] transition-colors cursor-pointer"
                >
                  Features
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('workflow');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="hover:text-[#252525] dark:hover:text-[#F2F2F2] transition-colors cursor-pointer"
                >
                  Workflow
                </button>
              </li>
            </ul>
          </div>

          {/* Links: Account */}
          <div className="space-y-2.5">
            <h4 className="text-[11px] font-mono uppercase tracking-wider font-semibold text-[#252525] dark:text-[#F2F2F2]">
              Account
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link to="/login" className="hover:text-[#252525] dark:hover:text-[#F2F2F2] transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-[#252525] dark:hover:text-[#F2F2F2] transition-colors">
                  Create Account
                </Link>
              </li>
              <li>
                <Link to="/forgot-password" className="hover:text-[#252525] dark:hover:text-[#F2F2F2] transition-colors">
                  Reset Password
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-[#E8E8E5] dark:border-[#353535] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#999999] dark:text-[#777777] font-mono">
          <p>© 2026 DevSpace Platform. Built with React & Tailwind CSS.</p>
          <p>Production Ready • Security Verified</p>
        </div>
      </div>
    </footer>
  );
}

export default LandingFooter;
