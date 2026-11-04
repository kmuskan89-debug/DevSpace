import React from 'react';
import {
  Layers,
  FolderGit2,
  Kanban,
  ListTodo,
  Users,
  Search,
  BarChart3
} from 'lucide-react';
import Card from '../common/Card';

export function FeaturesSection() {
  const capabilities = [
    {
      id: 'workspace-management',
      title: 'Workspace Management',
      description: 'Organize squads and organizations into isolated multi-tenant workspaces with robust role access controls.',
      icon: Layers
    },
    {
      id: 'project-management',
      title: 'Project Scoping & Keys',
      description: 'Structure microservices with project keys and sequential human-readable issue IDs (e.g. CORE-101).',
      icon: FolderGit2
    },
    {
      id: 'kanban-boards',
      title: 'Kanban Workflow Boards',
      description: 'Intuitive drag-and-drop columns, story point estimates, priority tags, and detailed issue modals.',
      icon: Kanban
    },
    {
      id: 'sprints-and-backlog',
      title: 'Backlog & Sprint Management',
      description: 'Plan upcoming sprints, prioritize backlog items, enforce single active sprint rules, and roll over incomplete work.',
      icon: ListTodo
    },
    {
      id: 'team-collaboration',
      title: 'Team Roles & Collaboration',
      description: 'Granular permissions (Owner, Admin, Member, Viewer), token-based invites, and contextual task discussions.',
      icon: Users
    },
    {
      id: 'search-and-views',
      title: 'Global Search & Saved Views',
      description: 'Find issues instantly with ⌘K search, filter by multiple criteria simultaneously, and save reusable custom views.',
      icon: Search
    },
    {
      id: 'analytics-and-reports',
      title: 'Analytics & Burndown Reports',
      description: 'Track sprint completion rates, daily burndown progress, member workload distributions, and export data as CSV.',
      icon: BarChart3
    }
  ];

  return (
    <section id="features" className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-10">
      {/* Section Header */}
      <div className="space-y-2 text-center max-w-2xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-semibold text-[#252525] dark:text-[#F2F2F2] tracking-tight my-0">
          Everything your engineering team needs
        </h2>
        <p className="text-xs sm:text-sm text-[#777777] dark:text-[#A0A0A0] leading-relaxed">
          DevSpace unifies issue tracking, sprint planning, and team collaboration into a single, cohesive developer workspace.
        </p>
      </div>

      {/* Capabilities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {capabilities.map((cap) => {
          const Icon = cap.icon;
          return (
            <Card
              key={cap.id}
              hoverable={true}
              className="p-4 space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="w-8 h-8 rounded-md bg-[#F1F1EF] dark:bg-[#2A2A2A] border border-[#E8E8E5] dark:border-[#353535] flex items-center justify-center text-[#252525] dark:text-[#F2F2F2]">
                  <Icon className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-semibold text-[#252525] dark:text-[#F2F2F2] my-0">
                  {cap.title}
                </h3>
                <p className="text-xs text-[#777777] dark:text-[#A0A0A0] leading-relaxed">
                  {cap.description}
                </p>
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

export default FeaturesSection;
