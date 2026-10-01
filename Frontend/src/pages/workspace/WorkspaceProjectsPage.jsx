import React, { useState } from 'react';
import { Plus, Search, FolderGit2, Filter, Layers } from 'lucide-react';
import useWorkspace from '../../hooks/useWorkspace';
import ProjectCard from '../../components/projects/ProjectCard';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';

export function WorkspaceProjectsPage() {
  const { workspace, projects: initialProjects } = useWorkspace();
  const [projects, setProjects] = useState(initialProjects);

  // Search & Filter States
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Modal State & Form Input Fields
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [projName, setProjName] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projRepo, setProjRepo] = useState('');
  const [projPriority, setProjPriority] = useState('Medium');
  const [projTech, setProjTech] = useState('React, Express, Redis');

  // Filtered Projects Logic
  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase()) ||
      p.githubRepo.toLowerCase().includes(search.toLowerCase());

    const matchesPriority =
      priorityFilter === 'all' || p.priority?.toLowerCase() === priorityFilter;

    return matchesSearch && matchesPriority;
  });

  // Create Project submit handler (Frontend state only)
  const handleCreateProject = (e) => {
    e.preventDefault();
    if (!projName.trim()) return;

    const newProj = {
      id: `proj-${Date.now().toString().slice(-4)}`,
      workspaceId: workspace.id,
      name: projName,
      description: projDesc || 'New software development project repository',
      status: 'Active',
      priority: projPriority,
      progress: 0,
      techStack: projTech.split(',').map((t) => t.trim()).filter(Boolean),
      lead: 'Alex Rivera',
      openTasksCount: 0,
      completedTasksCount: 0,
      githubRepo: projRepo || `devspace/${projName.toLowerCase().replace(/\s+/g, '-')}`,
      updatedAt: 'Just now'
    };

    setProjects([newProj, ...projects]);
    setIsNewProjectModalOpen(false);
    setProjName('');
    setProjDesc('');
    setProjRepo('');
    setProjPriority('Medium');
  };

  return (
    <div className="space-y-6">
      {/* Page Heading & Search/Filter Controls */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 font-semibold mb-1">
              <FolderGit2 className="w-4 h-4 text-cyan-400" />
              <span>REPOSITORIES & PROJECTS</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-100 my-0">
              Workspace Projects ({filteredProjects.length})
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Manage code repositories, track sprint progress, and assign issues in {workspace.name}
            </p>
          </div>

          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={() => setIsNewProjectModalOpen(true)}
            className="shrink-0"
          >
            Create Project
          </Button>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects by name, repo, or description..."
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto">
            <span className="text-xs text-slate-400 font-medium whitespace-nowrap">Filter Priority:</span>
            {['all', 'urgent', 'high', 'medium', 'low'].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPriorityFilter(p)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all capitalize cursor-pointer whitespace-nowrap ${
                  priorityFilter === p
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      ) : (
        <div className="glass-panel p-10 rounded-2xl text-center border border-dashed border-slate-800 space-y-3">
          <FolderGit2 className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-slate-200 my-0">No projects found</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            No repository matching "{search}" or selected filter. Try clearing filters or create a new project.
          </p>
          <Button variant="outline" size="sm" onClick={() => { setSearch(''); setPriorityFilter('all'); }}>
            Reset Search & Filters
          </Button>
        </div>
      )}

      {/* Create Project Modal (Frontend UI Only) */}
      <Modal
        isOpen={isNewProjectModalOpen}
        onClose={() => setIsNewProjectModalOpen(false)}
        title="Create New Project"
        subtitle={`Initialize a new repository tracker inside ${workspace.name}`}
        footer={
          <>
            <Button variant="outline" onClick={() => setIsNewProjectModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreateProject}>
              Create Project
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateProject} className="space-y-4">
          <Input
            label="Project / Repository Name"
            required
            placeholder="e.g. Realtime Notification Gateway"
            value={projName}
            onChange={(e) => setProjName(e.target.value)}
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Description
            </label>
            <textarea
              rows={3}
              value={projDesc}
              onChange={(e) => setProjDesc(e.target.value)}
              placeholder="Primary mission and features of this project repository..."
              className="w-full rounded-lg bg-slate-900/90 border border-slate-700/80 px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="GitHub Repository Link"
              placeholder="devspace/notification-gateway"
              value={projRepo}
              onChange={(e) => setProjRepo(e.target.value)}
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Priority Level
              </label>
              <select
                value={projPriority}
                onChange={(e) => setProjPriority(e.target.value)}
                className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3.5 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
          </div>

          <Input
            label="Tech Stack Badges (comma separated)"
            placeholder="Go, Docker, WebSockets"
            value={projTech}
            onChange={(e) => setProjTech(e.target.value)}
          />
        </form>
      </Modal>
    </div>
  );
}

export default WorkspaceProjectsPage;
