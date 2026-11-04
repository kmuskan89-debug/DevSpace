import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Terminal, Menu, X, Sun, Moon } from 'lucide-react';
import Button from '../common/Button';
import { useTheme } from '../../hooks/useTheme';

export function LandingNavbar() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[#E8E8E5] dark:border-[#353535] bg-[#FFFFFF]/90 dark:bg-[#191919]/90 backdrop-blur-sm px-4 sm:px-8 py-3 transition-colors">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Brand Logo & Wordmark */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded-md bg-[#252525] dark:bg-[#F2F2F2] text-[#FFFFFF] dark:text-[#191919] flex items-center justify-center font-bold shadow-2xs">
            <Terminal className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-sm tracking-tight text-[#252525] dark:text-[#F2F2F2]">
              DevSpace
            </span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono text-[#777777] dark:text-[#A0A0A0] bg-[#F1F1EF] dark:bg-[#2A2A2A] border border-[#E8E8E5] dark:border-[#353535]">
              v2.4
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-[#777777] dark:text-[#A0A0A0]">
          <button
            type="button"
            onClick={() => scrollToSection('features')}
            className="hover:text-[#252525] dark:hover:text-[#F2F2F2] transition-colors cursor-pointer"
          >
            Features
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('workflow')}
            className="hover:text-[#252525] dark:hover:text-[#F2F2F2] transition-colors cursor-pointer"
          >
            Workflow
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('capabilities')}
            className="hover:text-[#252525] dark:hover:text-[#F2F2F2] transition-colors cursor-pointer"
          >
            Capabilities
          </button>
        </nav>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            className="p-1.5 rounded-md text-[#777777] dark:text-[#A0A0A0] hover:text-[#252525] dark:hover:text-[#F2F2F2] hover:bg-[#F1F1EF] dark:hover:bg-[#2A2A2A] transition-colors cursor-pointer"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-3.5 h-3.5" />
            ) : (
              <Moon className="w-3.5 h-3.5" />
            )}
          </button>
          <Link
            to="/login"
            className="text-xs font-medium text-[#777777] dark:text-[#A0A0A0] hover:text-[#252525] dark:hover:text-[#F2F2F2] transition-colors px-2 py-1"
          >
            Sign in
          </Link>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/register')}
          >
            Get Started
          </Button>
        </div>

        {/* Mobile Hamburger & Theme Toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            onClick={toggleTheme}
            className="p-1.5 rounded-md text-[#777777] dark:text-[#A0A0A0] hover:text-[#252525] dark:hover:text-[#F2F2F2] hover:bg-[#F1F1EF] dark:hover:bg-[#2A2A2A] transition-colors cursor-pointer"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-md text-[#777777] dark:text-[#A0A0A0] hover:text-[#252525] dark:hover:text-[#F2F2F2] hover:bg-[#F1F1EF] dark:hover:bg-[#2A2A2A] transition-colors cursor-pointer"
            aria-label="Open mobile menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden pt-3 pb-4 border-t border-[#E8E8E5] dark:border-[#353535] mt-3 space-y-3">
          <div className="flex flex-col space-y-2 text-xs font-medium text-[#777777] dark:text-[#A0A0A0]">
            <button
              type="button"
              onClick={() => scrollToSection('features')}
              className="text-left px-2 py-1.5 rounded hover:bg-[#F1F1EF] dark:hover:bg-[#2A2A2A] hover:text-[#252525] dark:hover:text-[#F2F2F2]"
            >
              Features
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('workflow')}
              className="text-left px-2 py-1.5 rounded hover:bg-[#F1F1EF] dark:hover:bg-[#2A2A2A] hover:text-[#252525] dark:hover:text-[#F2F2F2]"
            >
              Workflow
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('capabilities')}
              className="text-left px-2 py-1.5 rounded hover:bg-[#F1F1EF] dark:hover:bg-[#2A2A2A] hover:text-[#252525] dark:hover:text-[#F2F2F2]"
            >
              Capabilities
            </button>
          </div>
          <div className="pt-2 border-t border-[#E8E8E5] dark:border-[#353535] flex flex-col gap-2">
            <Link
              to="/login"
              className="text-center py-2 text-xs font-medium text-[#252525] dark:text-[#F2F2F2] border border-[#E8E8E5] dark:border-[#353535] rounded-md"
            >
              Sign in
            </Link>
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/register')}
              className="w-full justify-center"
            >
              Get Started Free
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}

export default LandingNavbar;
