import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import WorkspaceBacklogPage from '../pages/workspace/WorkspaceBacklogPage';
import { Sidebar } from '../components/navigation/Sidebar';

// Mock useWorkspace
const mockUseWorkspace = vi.fn();
vi.mock('../hooks/useWorkspace', () => ({
  useWorkspace: () => mockUseWorkspace(),
  default: () => mockUseWorkspace(),
}));

// Mock useWorkspaceContext
vi.mock('../context/WorkspaceContext', () => ({
  useWorkspaceContext: () => ({
    workspaces: [{ id: 'ws-1', _id: 'ws-1', name: 'DevSpace Platform' }],
    openCreateModal: vi.fn(),
  }),
}));

// Mock useAuth
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { name: 'Alice Walker', email: 'alice@test.com' },
    isAuthenticated: true,
    logout: vi.fn(),
  }),
}));

// Mock ProjectBacklogPage
vi.mock('../pages/workspace/ProjectBacklogPage', () => ({
  default: ({ overrideProjectId }) => (
    <div data-testid="project-backlog-mock">
      Mocked Project Backlog for {overrideProjectId}
    </div>
  ),
  ProjectBacklogPage: ({ overrideProjectId }) => (
    <div data-testid="project-backlog-mock">
      Mocked Project Backlog for {overrideProjectId}
    </div>
  ),
}));

describe('Workspace-Level Backlog Navigation & Views', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('WorkspaceBacklogPage Component', () => {
    it('displays clear empty state with Create Project action when workspace has 0 projects', () => {
      mockUseWorkspace.mockReturnValue({
        workspace: { id: 'ws-1', name: 'DevSpace' },
        projects: [],
        isLoadingProjects: false,
        projectsError: null,
        fetchProjects: vi.fn(),
      });

      render(
        <MemoryRouter initialEntries={['/workspace/ws-1/backlog']}>
          <Routes>
            <Route path="/workspace/:workspaceId/backlog" element={<WorkspaceBacklogPage />} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText(/no projects in this workspace/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create project/i })).toBeInTheDocument();
      expect(screen.queryByTestId('project-backlog-mock')).not.toBeInTheDocument();
    });

    it('renders project selector and embeds ProjectBacklogPage when projects exist', () => {
      mockUseWorkspace.mockReturnValue({
        workspace: { id: 'ws-1', name: 'DevSpace' },
        projects: [
          { id: 'proj-1', _id: 'proj-1', name: 'Backend API', key: 'API' },
          { id: 'proj-2', _id: 'proj-2', name: 'Frontend Web', key: 'WEB' },
        ],
        isLoadingProjects: false,
        projectsError: null,
        fetchProjects: vi.fn(),
      });

      render(
        <MemoryRouter initialEntries={['/workspace/ws-1/backlog']}>
          <Routes>
            <Route path="/workspace/:workspaceId/backlog" element={<WorkspaceBacklogPage />} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('Workspace Backlog')).toBeInTheDocument();
      expect(screen.getByText('2 projects')).toBeInTheDocument();
      const select = screen.getByRole('combobox');
      expect(select).toBeInTheDocument();
      expect(screen.getByTestId('project-backlog-mock')).toHaveTextContent('Mocked Project Backlog for proj-1');
    });

    it('displays loading skeleton while workspace projects are loading', () => {
      mockUseWorkspace.mockReturnValue({
        workspace: { id: 'ws-1', name: 'DevSpace' },
        projects: [],
        isLoadingProjects: true,
        projectsError: null,
        fetchProjects: vi.fn(),
      });

      render(
        <MemoryRouter initialEntries={['/workspace/ws-1/backlog']}>
          <Routes>
            <Route path="/workspace/:workspaceId/backlog" element={<WorkspaceBacklogPage />} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.queryByText(/no projects in this workspace/i)).not.toBeInTheDocument();
      expect(screen.queryByTestId('project-backlog-mock')).not.toBeInTheDocument();
    });
  });

  describe('Sidebar Backlog Navigation & Distinct Active States', () => {
    it('sets Backlog active and Projects inactive when on /workspace/ws-1/backlog', () => {
      mockUseWorkspace.mockReturnValue({
        workspace: { id: 'ws-1', _id: 'ws-1', name: 'DevSpace' },
        projects: [{ id: 'proj-1', _id: 'proj-1', name: 'Backend API', key: 'API' }],
      });

      render(
        <MemoryRouter initialEntries={['/workspace/ws-1/backlog']}>
          <Sidebar />
        </MemoryRouter>
      );

      const backlogLink = screen.getByTitle('Backlog');
      const projectsLink = screen.getByTitle('Projects');

      expect(backlogLink.getAttribute('href')).toBe('/workspace/ws-1/backlog');
      expect(backlogLink.className).toContain('font-semibold');
      expect(projectsLink.className).not.toContain('font-semibold');
    });

    it('sets Projects active and Backlog inactive when on /workspace/ws-1/projects', () => {
      mockUseWorkspace.mockReturnValue({
        workspace: { id: 'ws-1', _id: 'ws-1', name: 'DevSpace' },
        projects: [{ id: 'proj-1', _id: 'proj-1', name: 'Backend API', key: 'API' }],
      });

      render(
        <MemoryRouter initialEntries={['/workspace/ws-1/projects']}>
          <Sidebar />
        </MemoryRouter>
      );

      const backlogLink = screen.getByTitle('Backlog');
      const projectsLink = screen.getByTitle('Projects');

      expect(projectsLink.className).toContain('font-semibold');
      expect(backlogLink.className).not.toContain('font-semibold');
    });
  });
});

