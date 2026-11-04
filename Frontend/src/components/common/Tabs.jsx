import React from 'react';
import { motion } from 'framer-motion';

export function Tabs({ tabs = [], activeTab, onChange, className = '', layoutId = 'notionTabPill' }) {
  return (
    <div className={`flex items-center gap-1 border-b border-[#E8E8E5] dark:border-[#353535] pb-px overflow-x-auto ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`relative inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap cursor-pointer focus:outline-none ${
              isActive
                ? 'text-[#252525] dark:text-[#F2F2F2] font-semibold'
                : 'text-[#777777] dark:text-[#A0A0A0] hover:text-[#252525] dark:hover:text-[#F2F2F2] hover:bg-[#F1F1EF] dark:hover:bg-[#2A2A2A] rounded'
            }`}
          >
            {isActive && (
              <motion.div
                layoutId={layoutId}
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#252525] dark:bg-[#F2F2F2]"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                    isActive
                      ? 'bg-[#EAEAE7] dark:bg-[#333333] text-[#252525] dark:text-[#F2F2F2]'
                      : 'bg-[#F1F1EF] dark:bg-[#2A2A2A] text-[#777777] dark:text-[#A0A0A0]'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default Tabs;
