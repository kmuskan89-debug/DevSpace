import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Terminal, Sun, Moon, ArrowLeft } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export function AuthLayout() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen w-full bg-[#FFFFFF] dark:bg-[#191919] text-[#252525] dark:text-[#F2F2F2] flex flex-col justify-between relative font-sans selection:bg-[#252525] selection:text-[#FFFFFF] dark:selection:bg-[#F2F2F2] dark:selection:text-[#191919] transition-colors duration-150">
      {/* Top Header */}
      <header className="relative z-10 p-4 sm:p-6 flex items-center justify-between max-w-5xl mx-auto w-full">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-md bg-[#252525] dark:bg-[#F2F2F2] text-[#FFFFFF] dark:text-[#191919] flex items-center justify-center font-bold shadow-2xs">
            <Terminal className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-base tracking-tight text-[#252525] dark:text-[#F2F2F2]">
              DevSpace
            </span>
            <span className="text-[10px] text-[#777777] dark:text-[#A0A0A0] font-mono tracking-wider uppercase">Workspace & Project Management</span>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="p-1.5 rounded-md border border-[#E8E8E5] dark:border-[#353535] bg-[#FFFFFF] dark:bg-[#242424] text-[#777777] dark:text-[#A0A0A0] hover:text-[#252525] dark:hover:text-[#F2F2F2] transition-colors cursor-pointer"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-[#A0A0A0]" /> : <Moon className="w-4 h-4 text-[#777777]" />}
          </button>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#777777] dark:text-[#A0A0A0] hover:text-[#252525] dark:hover:text-[#F2F2F2] transition-colors border border-[#E8E8E5] dark:border-[#353535] bg-[#FFFFFF] dark:bg-[#242424] px-2.5 py-1.5 rounded-md"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
        </div>
      </header>

      {/* Main Auth Viewport */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 max-w-md mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
          className="w-full"
        >
          <Outlet />
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 p-4 text-center text-xs text-[#999999] dark:text-[#777777] font-mono">
        © 2026 DevSpace Platform.
      </footer>
    </div>
  );
}

export default AuthLayout;
