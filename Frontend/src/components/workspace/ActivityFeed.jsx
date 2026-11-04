import React, { useState } from 'react';
import {
  Activity,
  Search,
  Filter,
  XCircle,
  FolderGit2,
  CheckSquare,
  MessageSquare,
  UserPlus,
  Kanban
} from 'lucide-react';
import Card from '../common/Card';
import EmptyState from '../common/EmptyState';
import ActivityItem from '../dashboard/ActivityItem';

const CATEGORIES = [
  { id: 'all', label: 'All Events' },
  { id: 'task', label: 'Tasks', icon: CheckSquare },
  { id: 'sprint', label: 'Sprints', icon: Kanban },
  { id: 'project', label: 'Projects', icon: FolderGit2 },
  { id: 'member', label: 'Members', icon: UserPlus },
  { id: 'comment', label: 'Comments', icon: MessageSquare }
];

export function ActivityFeed({ activities = [] }) {
  const [category, setCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredActivities = activities.filter((act) => {
    // Category match
    const actionStr = (act.action || act.type || '').toUpperCase();
    let matchesCategory = true;
    if (category === 'task') {
      matchesCategory = actionStr.includes('TASK');
    } else if (category === 'sprint') {
      matchesCategory = actionStr.includes('SPRINT');
    } else if (category === 'project') {
      matchesCategory = actionStr.includes('PROJECT');
    } else if (category === 'member') {
      matchesCategory = actionStr.includes('MEMBER');
    } else if (category === 'comment') {
      matchesCategory = actionStr.includes('COMMENT');
    }

    if (!matchesCategory) return false;

    // Search match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const userName = (act.user || act.actor?.name || '').toLowerCase();
      const actionName = (act.action || '').toLowerCase();
      const targetName = (
        act.target ||
        act.details?.title ||
        act.details?.name ||
        act.details?.issueKey ||
        ''
      ).toLowerCase();
      return (
        userName.includes(q) || actionName.includes(q) || targetName.includes(q)
      );
    }

    return true;
  });

  return (
    <Card hoverable={false} className="p-4 sm:p-5 border border-[#E8E8E5] dark:border-[#353535] bg-[#FFFFFF] dark:bg-[#202020] space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8E8E5] dark:border-[#353535]">
        <div>
          <h2 className="text-sm font-semibold text-[#252525] dark:text-[#F2F2F2] my-0">
            Workspace Activity Feed
          </h2>
          <p className="text-xs text-[#777777] dark:text-[#A0A0A0] mt-0.5">
            Audit history of task transitions, sprint cycles, and collaboration events
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#999999] dark:text-[#666666]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search activity..."
            className="w-full bg-[#F7F7F5] dark:bg-[#1C1C1C] border border-[#E8E8E5] dark:border-[#353535] rounded-md pl-8 pr-7 py-1 text-xs text-[#252525] dark:text-[#F2F2F2] placeholder-[#999999] dark:placeholder-[#666666] focus:outline-none focus:border-[#252525] dark:focus:border-[#F2F2F2]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[#999999] hover:text-[#252525] dark:hover:text-[#F2F2F2] cursor-pointer"
            >
              <XCircle className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        <span className="text-[10px] font-mono uppercase text-[#777777] dark:text-[#A0A0A0] flex items-center gap-1 shrink-0 mr-1">
          <Filter className="w-3 h-3" /> Event:
        </span>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setCategory(cat.id)}
            className={`px-2.5 py-1 rounded text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
              category === cat.id
                ? 'bg-[#252525] dark:bg-[#F2F2F2] text-[#FFFFFF] dark:text-[#191919] font-semibold'
                : 'bg-[#F7F7F5] dark:bg-[#252525] text-[#777777] dark:text-[#A0A0A0] border border-[#E8E8E5] dark:border-[#353535] hover:text-[#252525] dark:hover:text-[#F2F2F2]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Activity Timeline List */}
      {filteredActivities.length > 0 ? (
        <div className="space-y-2 pt-1">
          {filteredActivities.map((act) => (
            <ActivityItem key={act.id || act._id} activity={act} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Activity}
          title="No activity records found"
          description={
            searchQuery || category !== 'all'
              ? 'No activity matches your active search or category filters.'
              : 'Workspace activities such as task progression, sprint start/end, and membership events will appear here.'
          }
          className="py-12"
        />
      )}
    </Card>
  );
}

export default ActivityFeed;
