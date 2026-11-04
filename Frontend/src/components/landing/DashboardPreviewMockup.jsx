import React, { useState } from 'react';
import {
  Kanban,
  BarChart3,
  ListTodo
} from 'lucide-react';
import Badge from '../common/Badge';
import Avatar from '../common/Avatar';

export function DashboardPreviewMockup() {
  const [activeTab, setActiveTab] = useState('board');

  return (
    <div className="w-full max-w-5xl mx-auto rounded-lg border border-[#E8E8E5] dark:border-[#353535] bg-[#FFFFFF] dark:bg-[#202020] shadow-sm text-left overflow-hidden">
      {/* Top Application Browser Chrome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-4 py-2.5 border-b border-[#E8E8E5] dark:border-[#353535] bg-[#F7F7F5] dark:bg-[#1C1C1C]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#D1D1CD] dark:bg-[#444444]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#D1D1CD] dark:bg-[#444444]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#D1D1CD] dark:bg-[#444444]" />
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#777777] dark:text-[#A0A0A0] font-mono">
            <span className="text-[#252525] dark:text-[#F2F2F2] font-semibold">DevSpace</span>
            <span>/</span>
            <span>Core Platform</span>
            <span>/</span>
            <span className="text-[#252525] dark:text-[#F2F2F2]">Sprint 1</span>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1 bg-[#FFFFFF] dark:bg-[#242424] p-0.5 rounded-md border border-[#E8E8E5] dark:border-[#353535]">
          <button
            type="button"
            onClick={() => setActiveTab('board')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'board'
                ? 'bg-[#252525] text-[#FFFFFF] dark:bg-[#F2F2F2] dark:text-[#191919]'
                : 'text-[#777777] dark:text-[#A0A0A0] hover:text-[#252525] dark:hover:text-[#F2F2F2]'
            }`}
          >
            <Kanban className="w-3.5 h-3.5" />
            <span>Sprint Board</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('backlog')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'backlog'
                ? 'bg-[#252525] text-[#FFFFFF] dark:bg-[#F2F2F2] dark:text-[#191919]'
                : 'text-[#777777] dark:text-[#A0A0A0] hover:text-[#252525] dark:hover:text-[#F2F2F2]'
            }`}
          >
            <ListTodo className="w-3.5 h-3.5" />
            <span>Backlog</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('reports')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'reports'
                ? 'bg-[#252525] text-[#FFFFFF] dark:bg-[#F2F2F2] dark:text-[#191919]'
                : 'text-[#777777] dark:text-[#A0A0A0] hover:text-[#252525] dark:hover:text-[#F2F2F2]'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Burndown</span>
          </button>
        </div>
      </div>

      {/* Main Preview Content */}
      <div className="p-4 sm:p-5 bg-[#FFFFFF] dark:bg-[#202020] space-y-4">
        {/* Sprint Header & Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8E8E5] dark:border-[#353535]">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-[#252525] dark:text-[#F2F2F2] my-0">
                Sprint 1 — Core Service Architecture
              </h3>
              <Badge status="Active" size="sm" />
            </div>
            <p className="text-xs text-[#777777] dark:text-[#A0A0A0] mt-0.5">
              Target: Nov 1 – Nov 15 • 18 Story Points committed • 12 Points Completed
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="px-2 py-1 rounded bg-[#F7F7F5] dark:bg-[#242424] border border-[#E8E8E5] dark:border-[#353535] text-[#777777] dark:text-[#A0A0A0]">
              Filter: All Issues
            </span>
            <span className="px-2 py-1 rounded bg-[#F7F7F5] dark:bg-[#242424] border border-[#E8E8E5] dark:border-[#353535] text-[#777777] dark:text-[#A0A0A0]">
              Sort: Priority
            </span>
          </div>
        </div>

        {/* Tab 1: Sprint Board */}
        {activeTab === 'board' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {/* Column: To Do */}
            <div className="rounded-md border border-[#E8E8E5] dark:border-[#353535] bg-[#F7F7F5] dark:bg-[#1C1C1C] p-3 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-semibold text-[#777777] dark:text-[#A0A0A0]">
                <span>TO DO (1)</span>
                <span className="text-[10px] font-mono">3 pts</span>
              </div>

              <div className="rounded border border-[#E8E8E5] dark:border-[#353535] bg-[#FFFFFF] dark:bg-[#242424] p-3 space-y-2 shadow-2xs">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="font-semibold text-[#252525] dark:text-[#F2F2F2]">CORE-104</span>
                  <Badge priority="Medium" size="sm" />
                </div>
                <p className="text-xs font-medium text-[#252525] dark:text-[#F2F2F2] my-0 leading-tight">
                  Implement session token revocation on logout
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-[#E8E8E5] dark:border-[#353535] text-[11px] text-[#777777] dark:text-[#A0A0A0]">
                  <span className="font-mono">3 pts</span>
                  <Avatar name="Alice Smith" size="xs" />
                </div>
              </div>
            </div>

            {/* Column: In Progress */}
            <div className="rounded-md border border-[#E8E8E5] dark:border-[#353535] bg-[#F7F7F5] dark:bg-[#1C1C1C] p-3 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-semibold text-[#777777] dark:text-[#A0A0A0]">
                <span>IN PROGRESS (2)</span>
                <span className="text-[10px] font-mono">8 pts</span>
              </div>

              <div className="rounded border border-[#E8E8E5] dark:border-[#353535] bg-[#FFFFFF] dark:bg-[#242424] p-3 space-y-2 shadow-2xs">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="font-semibold text-[#252525] dark:text-[#F2F2F2]">CORE-102</span>
                  <Badge priority="Urgent" size="sm" />
                </div>
                <p className="text-xs font-medium text-[#252525] dark:text-[#F2F2F2] my-0 leading-tight">
                  Recursive NoSQL sanitizer for MongoDB queries
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-[#E8E8E5] dark:border-[#353535] text-[11px] text-[#777777] dark:text-[#A0A0A0]">
                  <span className="font-mono">5 pts</span>
                  <Avatar name="Alex Rivera" size="xs" />
                </div>
              </div>

              <div className="rounded border border-[#E8E8E5] dark:border-[#353535] bg-[#FFFFFF] dark:bg-[#242424] p-3 space-y-2 shadow-2xs">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="font-semibold text-[#252525] dark:text-[#F2F2F2]">CORE-105</span>
                  <Badge priority="High" size="sm" />
                </div>
                <p className="text-xs font-medium text-[#252525] dark:text-[#F2F2F2] my-0 leading-tight">
                  Workspace invitation token generation & validation
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-[#E8E8E5] dark:border-[#353535] text-[11px] text-[#777777] dark:text-[#A0A0A0]">
                  <span className="font-mono">3 pts</span>
                  <Avatar name="David Kim" size="xs" />
                </div>
              </div>
            </div>

            {/* Column: Done */}
            <div className="rounded-md border border-[#E8E8E5] dark:border-[#353535] bg-[#F7F7F5] dark:bg-[#1C1C1C] p-3 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-semibold text-[#777777] dark:text-[#A0A0A0]">
                <span>DONE (2)</span>
                <span className="text-[10px] font-mono">7 pts</span>
              </div>

              <div className="rounded border border-[#E8E8E5] dark:border-[#353535] bg-[#FFFFFF] dark:bg-[#242424] p-3 space-y-2 opacity-85 shadow-2xs">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="font-semibold text-[#777777] dark:text-[#A0A0A0] line-through">CORE-101</span>
                  <Badge status="Done" size="sm" />
                </div>
                <p className="text-xs font-medium text-[#777777] dark:text-[#A0A0A0] my-0 leading-tight">
                  Sequential project issue key generation
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-[#E8E8E5] dark:border-[#353535] text-[11px] text-[#777777] dark:text-[#A0A0A0]">
                  <span className="font-mono">5 pts</span>
                  <Avatar name="Sarah Chen" size="xs" />
                </div>
              </div>

              <div className="rounded border border-[#E8E8E5] dark:border-[#353535] bg-[#FFFFFF] dark:bg-[#242424] p-3 space-y-2 opacity-85 shadow-2xs">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="font-semibold text-[#777777] dark:text-[#A0A0A0] line-through">CORE-103</span>
                  <Badge status="Done" size="sm" />
                </div>
                <p className="text-xs font-medium text-[#777777] dark:text-[#A0A0A0] my-0 leading-tight">
                  Single active sprint enforcement constraint
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-[#E8E8E5] dark:border-[#353535] text-[11px] text-[#777777] dark:text-[#A0A0A0]">
                  <span className="font-mono">2 pts</span>
                  <Avatar name="Alice Smith" size="xs" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Backlog Management */}
        {activeTab === 'backlog' && (
          <div className="space-y-3">
            <div className="rounded-md border border-[#E8E8E5] dark:border-[#353535] divide-y divide-[#E8E8E5] dark:divide-[#353535]">
              <div className="p-2.5 flex items-center justify-between bg-[#F7F7F5] dark:bg-[#1C1C1C] text-xs font-semibold text-[#777777] dark:text-[#A0A0A0]">
                <span>Backlog Issues (Unassigned to Sprints)</span>
                <span>3 Issues • 11 Story Points</span>
              </div>
              <div className="p-3 flex items-center justify-between text-xs hover:bg-[#F1F1EF] dark:hover:bg-[#2A2A2A] transition-colors">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[11px] font-semibold text-[#777777] dark:text-[#A0A0A0]">CORE-108</span>
                  <span className="text-[#252525] dark:text-[#F2F2F2]">CSV export for workspace task analytics</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge priority="Low" size="sm" />
                  <span className="font-mono text-[11px] text-[#777777] dark:text-[#A0A0A0]">2 pts</span>
                </div>
              </div>
              <div className="p-3 flex items-center justify-between text-xs hover:bg-[#F1F1EF] dark:hover:bg-[#2A2A2A] transition-colors">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[11px] font-semibold text-[#777777] dark:text-[#A0A0A0]">CORE-109</span>
                  <span className="text-[#252525] dark:text-[#F2F2F2]">Saved view filter preset duplication & sharing</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge priority="Medium" size="sm" />
                  <span className="font-mono text-[11px] text-[#777777] dark:text-[#A0A0A0]">5 pts</span>
                </div>
              </div>
              <div className="p-3 flex items-center justify-between text-xs hover:bg-[#F1F1EF] dark:hover:bg-[#2A2A2A] transition-colors">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[11px] font-semibold text-[#777777] dark:text-[#A0A0A0]">CORE-110</span>
                  <span className="text-[#252525] dark:text-[#F2F2F2]">Last-owner guard for workspace role demotions</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge priority="High" size="sm" />
                  <span className="font-mono text-[11px] text-[#777777] dark:text-[#A0A0A0]">4 pts</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Burndown Report */}
        {activeTab === 'reports' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded-md bg-[#F7F7F5] dark:bg-[#1C1C1C] border border-[#E8E8E5] dark:border-[#353535]">
                <p className="text-[11px] text-[#777777] dark:text-[#A0A0A0]">Committed</p>
                <p className="text-base font-semibold text-[#252525] dark:text-[#F2F2F2] mt-0.5">18 pts</p>
              </div>
              <div className="p-3 rounded-md bg-[#F7F7F5] dark:bg-[#1C1C1C] border border-[#E8E8E5] dark:border-[#353535]">
                <p className="text-[11px] text-[#777777] dark:text-[#A0A0A0]">Completed</p>
                <p className="text-base font-semibold text-[#107C41] dark:text-[#4EBE7E] mt-0.5">12 pts</p>
              </div>
              <div className="p-3 rounded-md bg-[#F7F7F5] dark:bg-[#1C1C1C] border border-[#E8E8E5] dark:border-[#353535]">
                <p className="text-[11px] text-[#777777] dark:text-[#A0A0A0]">Remaining</p>
                <p className="text-base font-semibold text-[#252525] dark:text-[#F2F2F2] mt-0.5">6 pts</p>
              </div>
              <div className="p-3 rounded-md bg-[#F7F7F5] dark:bg-[#1C1C1C] border border-[#E8E8E5] dark:border-[#353535]">
                <p className="text-[11px] text-[#777777] dark:text-[#A0A0A0]">Completion</p>
                <p className="text-base font-semibold text-[#252525] dark:text-[#F2F2F2] mt-0.5">67%</p>
              </div>
            </div>

            {/* Minimal SVG Burndown chart representation */}
            <div className="p-4 rounded-md border border-[#E8E8E5] dark:border-[#353535] bg-[#F7F7F5] dark:bg-[#1C1C1C] space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-[#777777] dark:text-[#A0A0A0]">
                <span>Sprint Velocity Trendline</span>
                <span>Day 8 of 14</span>
              </div>
              <div className="h-24 w-full flex items-end gap-1.5 pt-2">
                {[18, 18, 16, 16, 14, 14, 12, 12, 10, 8, 6, 4, 2, 0].map((val, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      style={{ height: `${(val / 18) * 75}px` }}
                      className={`w-full rounded-xs transition-all ${
                        idx <= 7
                          ? 'bg-[#252525] dark:bg-[#F2F2F2]'
                          : 'bg-[#D1D1CD]/60 dark:bg-[#444444]/60'
                      }`}
                    />
                    <span className="text-[9px] font-mono text-[#999999]">d{idx + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardPreviewMockup;
