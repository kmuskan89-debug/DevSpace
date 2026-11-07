import React, { useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Layers,
  AlertCircle,
  Plus,
  ChevronDown,
  ArrowRight
} from 'lucide-react';
import useWorkspace from '../../hooks/useWorkspace';
import ProjectBacklogPage from './ProjectBacklogPage';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';

export function WorkspaceBacklogPage() {
  const navigate = useNavigate();
  const { workspaceId: paramWsId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const {
    workspace,
    projects,
    isLoadingProjects,
    projectsError,
    fetchProjects
  } = useWorkspace(paramWsId);

  const effectiveWsId = paramWsId || workspace?.id || workspace?._id;

  // Selected project resolution
  const selectedProjParam = searchParams.get('project');
  const activeProject = useMemo(() => {
    if (!projects || projects.length === 0) return null;
    if (selectedProjParam) {
      const match = projects.find(
        (p) => (p.id || p._id) === selectedProjParam || p.key === selectedProjParam
      );
      if (match) return match;
    }
    return projects[0];
  }, [projects, selectedProjParam]);

  const activeProjectId = activeProject?.id || activeProject?._id;

  // 1. Loading State
  if (isLoadingProjects && (!projects || projects.length === 0)) {
    return (
      <div className="space-y-4">
        <div className="p-4 rounded-lg border border-[#E8E8E5] dark:border-[#353535] bg-[#FFFFFF] dark:bg-[#202020] animate-pulse h-20" />
        <SkeletonLoader variant="card" count={3} />
      </div>
    );
  }

  // 2. Error State
  if (projectsError && (!projects || projects.length === 0)) {
    return (
      <div className="p-8 rounded-lg border border-[#E8E8E5] dark:border-[#353535] bg-[#FFFFFF] dark:bg-[#202020] text-center max-w-md mx-auto space-y-3 my-8">
        <AlertCircle className="w-8 h-8 text-[#D83B01] dark:text-[#F87171] mx-auto" />
        <div>
          <h3 className="text-base font-semibold text-[#252525] dark:text-[#F2F2F2] my-0">
            Failed to load workspace projects
          </h3>
          <p className="text-xs text-[#777777] dark:text-[#A0A0A0] mt-1">
            {projectsError}
          </p>
        </div>
        <div className="pt-2 flex justify-center gap-2">
          <Button variant="outline" size="sm" onClick={() => fetchProjects(true)}>
            Retry
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate(`/workspace/${effectiveWsId}/projects`)}
          >
            Go to Projects
          </Button>
        </div>
      </div>
    );
  }

  // 3. Empty State (Zero Projects)
  if (!projects || projects.length === 0) {
    return (
      <div className="space-y-4">
        <EmptyState
          icon={Layers}
          title="No projects in this workspace"
          description="A project is required before you can create, prioritize, and manage sprint backlog issues."
          action={{
            label: 'Create Project',
            icon: Plus,
            onClick: () => navigate(`/workspace/${effectiveWsId}/projects`)
          }}
        />
      </div>
    );
  }

  // 4. Multi-Project / One-Project Workspace
  return (
    <div className="space-y-5">
      {/* Workspace Backlog Project Selector Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-lg border border-[#E8E8E5] dark:border-[#353535] bg-[#FFFFFF] dark:bg-[#202020]">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-md bg-[#252525] dark:bg-[#F2F2F2] text-[#FFFFFF] dark:text-[#191919] flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
            <Layers className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-semibold text-[#252525] dark:text-[#F2F2F2] my-0 truncate">
                Workspace Backlog
              </h2>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono text-[#777777] dark:text-[#A0A0A0] bg-[#F1F1EF] dark:bg-[#2A2A2A] border border-[#E8E8E5] dark:border-[#353535] shrink-0 font-bold">
                {projects.length} {projects.length === 1 ? 'project' : 'projects'}
              </span>
            </div>
            <p className="text-[11px] text-[#777777] dark:text-[#A0A0A0] truncate mt-0.5">
              Select a project to plan sprints, estimate story points, and order backlog issues.
            </p>
          </div>
        </div>

        {/* Project Selector & Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <label
            htmlFor="workspace-backlog-project-select"
            className="text-xs font-medium text-[#777777] dark:text-[#A0A0A0] shrink-0 hidden sm:inline"
          >
            Project:
          </label>
          <div className="relative">
            <select
              id="workspace-backlog-project-select"
              value={activeProjectId || ''}
              onChange={(e) => {
                setSearchParams({ project: e.target.value });
              }}
              className="bg-[#F7F7F5] dark:bg-[#2A2A2A] border border-[#E8E8E5] dark:border-[#353535] rounded-md pl-2.5 pr-8 py-1.5 text-xs font-medium text-[#252525] dark:text-[#F2F2F2] focus:outline-none focus:border-[#252525] dark:focus:border-[#F2F2F2] cursor-pointer appearance-none"
            >
              {projects.map((p) => {
                const pId = p.id || p._id;
                return (
                  <option key={pId} value={pId}>
                    {p.name} ({p.key || 'PROJ'})
                  </option>
                );
              })}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#777777] dark:text-[#A0A0A0] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {activeProjectId && (
            <Button
              variant="outline"
              size="sm"
              icon={ArrowRight}
              onClick={() =>
                navigate(`/workspace/${effectiveWsId}/projects/${activeProjectId}/backlog`)
              }
              title="Open full dedicated project view"
            >
              Dedicated View
            </Button>
          )}
        </div>
      </div>

      {/* Render Project Backlog with overrideProjectId */}
      {activeProjectId && (
        <ProjectBacklogPage
          key={activeProjectId}
          overrideProjectId={activeProjectId}
          hideNavTabs={false}
        />
      )}
    </div>
  );
}

export default WorkspaceBacklogPage;
