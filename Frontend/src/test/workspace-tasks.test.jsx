import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import WorkspaceTasksPage from '../pages/workspace/WorkspaceTasksPage';
import { Sidebar } from '../components/navigation/Sidebar';
import api from '../utils/axios';

// Mock axios API
vi.mock('../utils/axios', () => ({
  default: {
    get: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

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
const mockUser = { _id: 'user-123', id: 'user-123', name: 'Alice Walker', email: 'alice@test.com' };
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
    isAuthenticated: true,
    logout: vi.fn(),
  }),
}));

// Mock Toast
vi.mock('../components/common/Toast', () => ({
  useToast: () => ({
    addToast: vi.fn(),
  }),
}));

const mockTasksData = [
  {
    _id: 'task-1',
    id: 'task-1',
    issueKey: 'DSP-101',
    title: 'Implement OAuth Token Refresh',
    description: 'Ensure token refresh happens before expiry',
    status: 'To Do',
    priority: 'High',
    dueDate: '2027-12-31T00:00:00.000Z',
    project: { _id: 'proj-1', id: 'proj-1', name: 'Auth Service', key: 'DSP' },
    sprint: { _id: 'sprint-1', name: 'Sprint 24' },
    assignee: { _id: 'user-123', name: 'Alice Walker' },
  },
  {
    _id: 'task-2',
    id: 'task-2',
    issueKey: 'DSP-102',
    title: 'Database Index Migration',
    description: 'Add compound indices to tasks collection',
    status: 'In Progress',
    priority: 'Medium',
    dueDate: '2020-01-01T00:00:00.000Z', // past date -> overdue
    project: { _id: 'proj-1', id: 'proj-1', name: 'Auth Service', key: 'DSP' },
    assignee: { _id: 'user-123', name: 'Alice Walker' },
  },
  {
    _id: 'task-3',
    id: 'task-3',
    issueKey: 'DSP-103',
    title: 'Code review for PR #42',
    description: 'Review security patches',
    status: 'In Review',
    priority: 'Highest',
    project: { _id: 'proj-2', id: 'proj-2', name: 'Frontend Web', key: 'WEB' },
    assignee: { _id: 'user-123', name: 'Alice Walker' },
  },
  {
    _id: 'task-4',
    id: 'task-4',
    issueKey: 'DSP-104',
    title: 'Setup Vitest and Playwright CI',
    status: 'Done',
    priority: 'Low',
    project: { _id: 'proj-2', id: 'proj-2', name: 'Frontend Web', key: 'WEB' },
    assignee: { _id: 'user-123', name: 'Alice Walker' },
  },
];

describe('Workspace My Tasks Feature', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseWorkspace.mockReturnValue({
      workspace: { id: 'ws-1', _id: 'ws-1', name: 'DevSpace Platform' },
      projects: [
        { id: 'proj-1', _id: 'proj-1', name: 'Auth Service', key: 'DSP' },
        { id: 'proj-2', _id: 'proj-2', name: 'Frontend Web', key: 'WEB' },
      ],
      members: [{ user: mockUser, role: 'Admin' }],
    });
  });

  describe('WorkspaceTasksPage Component', () => {
    it('fetches tasks for the current user and active workspace on load', async () => {
      api.get.mockResolvedValueOnce({
        data: { tasks: mockTasksData, total: 4 },
      });

      render(
        <MemoryRouter initialEntries={['/workspace/ws-1/tasks']}>
          <Routes>
            <Route path="/workspace/:workspaceId/tasks" element={<WorkspaceTasksPage />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(api.get).toHaveBeenCalledWith('/tasks', {
          params: {
            workspaceId: 'ws-1',
            assignee: 'user-123',
            page: 1,
            limit: 100,
          },
        });
      });

      expect(await screen.findByText('Implement OAuth Token Refresh')).toBeInTheDocument();
      expect(screen.getByText('Database Index Migration')).toBeInTheDocument();
      expect(screen.getByText('Code review for PR #42')).toBeInTheDocument();
      expect(screen.getByText('Setup Vitest and Playwright CI')).toBeInTheDocument();
    });

    it('groups tasks correctly into To Do, In Progress, In Review, and Done', async () => {
      api.get.mockResolvedValueOnce({
        data: { tasks: mockTasksData },
      });

      render(
        <MemoryRouter initialEntries={['/workspace/ws-1/tasks']}>
          <Routes>
            <Route path="/workspace/:workspaceId/tasks" element={<WorkspaceTasksPage />} />
          </Routes>
        </MemoryRouter>
      );

      expect(await screen.findByText('Implement OAuth Token Refresh')).toBeInTheDocument();

      // Check status section headers exist
      expect(screen.getByRole('heading', { name: 'To Do' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'In Progress' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'In Review' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Done' })).toBeInTheDocument();

      // Overdue indicator on task-2
      expect(screen.getByText(/overdue/i)).toBeInTheDocument();
    });

    it('displays empty state when user has no assigned tasks', async () => {
      api.get.mockResolvedValueOnce({
        data: { tasks: [] },
      });

      render(
        <MemoryRouter initialEntries={['/workspace/ws-1/tasks']}>
          <Routes>
            <Route path="/workspace/:workspaceId/tasks" element={<WorkspaceTasksPage />} />
          </Routes>
        </MemoryRouter>
      );

      expect(await screen.findByText(/no tasks assigned to you/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /browse workspace projects/i })).toBeInTheDocument();
    });

    it('displays error state with retry option on API failure', async () => {
      api.get.mockRejectedValueOnce(new Error('Network connection failed'));

      render(
        <MemoryRouter initialEntries={['/workspace/ws-1/tasks']}>
          <Routes>
            <Route path="/workspace/:workspaceId/tasks" element={<WorkspaceTasksPage />} />
          </Routes>
        </MemoryRouter>
      );

      expect(await screen.findByText(/failed to load assigned tasks/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();

      // Retry clicked
      api.get.mockResolvedValueOnce({
        data: { tasks: mockTasksData },
      });

      fireEvent.click(screen.getByRole('button', { name: /retry/i }));

      expect(await screen.findByText('Implement OAuth Token Refresh')).toBeInTheDocument();
    });

    it('filters tasks client-side by search query', async () => {
      api.get.mockResolvedValueOnce({
        data: { tasks: mockTasksData },
      });

      render(
        <MemoryRouter initialEntries={['/workspace/ws-1/tasks']}>
          <Routes>
            <Route path="/workspace/:workspaceId/tasks" element={<WorkspaceTasksPage />} />
          </Routes>
        </MemoryRouter>
      );

      expect(await screen.findByText('Implement OAuth Token Refresh')).toBeInTheDocument();

      const searchInput = screen.getByPlaceholderText(/search my tasks/i);
      fireEvent.change(searchInput, { target: { value: 'Index Migration' } });

      expect(screen.getByText('Database Index Migration')).toBeInTheDocument();
      expect(screen.queryByText('Implement OAuth Token Refresh')).not.toBeInTheDocument();
    });

    it('supports quick status update via select input', async () => {
      api.get.mockResolvedValueOnce({
        data: { tasks: mockTasksData },
      });
      api.patch.mockResolvedValueOnce({
        data: { task: { ...mockTasksData[0], status: 'In Progress' } },
      });

      render(
        <MemoryRouter initialEntries={['/workspace/ws-1/tasks']}>
          <Routes>
            <Route path="/workspace/:workspaceId/tasks" element={<WorkspaceTasksPage />} />
          </Routes>
        </MemoryRouter>
      );

      expect(await screen.findByText('Implement OAuth Token Refresh')).toBeInTheDocument();

      const statusSelects = screen.getAllByRole('combobox');
      // The task's status dropdown is one of the select boxes
      const taskStatusSelect = statusSelects.find((s) => s.value === 'To Do');
      expect(taskStatusSelect).toBeDefined();

      fireEvent.change(taskStatusSelect, { target: { value: 'In Progress' } });

      await waitFor(() => {
        expect(api.patch).toHaveBeenCalledWith('/tasks/task-1/status', {
          status: 'In Progress',
        });
      });
    });

    it('renders Load More Tasks button when hasNextPage is true and loads page 2 without duplicating existing tasks', async () => {
      // Page 1 response
      api.get.mockResolvedValueOnce({
        data: {
          tasks: [mockTasksData[0], mockTasksData[1]],
          pagination: {
            total: 3,
            page: 1,
            limit: 2,
            totalPages: 2,
            hasNextPage: true,
          },
        },
      });

      render(
        <MemoryRouter initialEntries={['/workspace/ws-1/tasks']}>
          <Routes>
            <Route path="/workspace/:workspaceId/tasks" element={<WorkspaceTasksPage />} />
          </Routes>
        </MemoryRouter>
      );

      expect(await screen.findByText('Implement OAuth Token Refresh')).toBeInTheDocument();
      expect(screen.getByText('Database Index Migration')).toBeInTheDocument();

      const loadMoreBtn = screen.getByRole('button', { name: /load more tasks/i });
      expect(loadMoreBtn).toBeInTheDocument();

      // Page 2 response with one new task and one already seen task (task-1 duplicate test)
      api.get.mockResolvedValueOnce({
        data: {
          tasks: [mockTasksData[0], mockTasksData[2]],
          pagination: {
            total: 3,
            page: 2,
            limit: 2,
            totalPages: 2,
            hasNextPage: false,
          },
        },
      });

      fireEvent.click(loadMoreBtn);

      await waitFor(() => {
        expect(api.get).toHaveBeenCalledWith('/tasks', {
          params: {
            workspaceId: 'ws-1',
            assignee: 'user-123',
            page: 2,
            limit: 100,
          },
        });
      });

      // New task is rendered
      expect(await screen.findByText('Code review for PR #42')).toBeInTheDocument();
      // Total count in DOM for task 1 is still 1 (no duplicate)
      expect(screen.getAllByText('Implement OAuth Token Refresh')).toHaveLength(1);
      // Load More button is no longer visible
      expect(screen.queryByRole('button', { name: /load more tasks/i })).not.toBeInTheDocument();
      expect(screen.getByText(/all assigned tasks loaded/i)).toBeInTheDocument();
    });

    it('resets tasks when switching active workspace', async () => {
      api.get.mockResolvedValueOnce({
        data: { tasks: [mockTasksData[0]] },
      });

      const { unmount } = render(
        <MemoryRouter initialEntries={['/workspace/ws-1/tasks']}>
          <Routes>
            <Route path="/workspace/:workspaceId/tasks" element={<WorkspaceTasksPage />} />
          </Routes>
        </MemoryRouter>
      );

      expect(await screen.findByText('Implement OAuth Token Refresh')).toBeInTheDocument();
      unmount();

      // Switch to ws-2
      mockUseWorkspace.mockReturnValueOnce({
        workspace: { id: 'ws-2', _id: 'ws-2', name: 'Second Workspace' },
        projects: [],
        members: [{ user: mockUser, role: 'Admin' }],
      });
      api.get.mockResolvedValueOnce({
        data: { tasks: [mockTasksData[3]] },
      });

      render(
        <MemoryRouter initialEntries={['/workspace/ws-2/tasks']}>
          <Routes>
            <Route path="/workspace/:workspaceId/tasks" element={<WorkspaceTasksPage />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(api.get).toHaveBeenCalledWith('/tasks', {
          params: {
            workspaceId: 'ws-2',
            assignee: 'user-123',
            page: 1,
            limit: 100,
          },
        });
      });

      expect(await screen.findByText('Setup Vitest and Playwright CI')).toBeInTheDocument();
      expect(screen.queryByText('Implement OAuth Token Refresh')).not.toBeInTheDocument();
    });
  });

  describe('Sidebar Navigation & Mutual Exclusivity', () => {
    it('sets My Tasks active and Projects/Backlog inactive when on /workspace/ws-1/tasks', () => {
      render(
        <MemoryRouter initialEntries={['/workspace/ws-1/tasks']}>
          <Sidebar />
        </MemoryRouter>
      );

      const myTasksLink = screen.getByTitle('My Tasks');
      const projectsLink = screen.getByTitle('Projects');
      const backlogLink = screen.getByTitle('Backlog');

      expect(myTasksLink.getAttribute('href')).toBe('/workspace/ws-1/tasks');
      expect(myTasksLink.className).toContain('font-semibold');
      expect(projectsLink.className).not.toContain('font-semibold');
      expect(backlogLink.className).not.toContain('font-semibold');
    });

    it('sets Projects active and My Tasks inactive when on /workspace/ws-1/projects', () => {
      render(
        <MemoryRouter initialEntries={['/workspace/ws-1/projects']}>
          <Sidebar />
        </MemoryRouter>
      );

      const myTasksLink = screen.getByTitle('My Tasks');
      const projectsLink = screen.getByTitle('Projects');
      const backlogLink = screen.getByTitle('Backlog');

      expect(projectsLink.className).toContain('font-semibold');
      expect(myTasksLink.className).not.toContain('font-semibold');
      expect(backlogLink.className).not.toContain('font-semibold');
    });

    it('sets Backlog active and My Tasks inactive when on /workspace/ws-1/backlog', () => {
      render(
        <MemoryRouter initialEntries={['/workspace/ws-1/backlog']}>
          <Sidebar />
        </MemoryRouter>
      );

      const myTasksLink = screen.getByTitle('My Tasks');
      const projectsLink = screen.getByTitle('Projects');
      const backlogLink = screen.getByTitle('Backlog');

      expect(backlogLink.className).toContain('font-semibold');
      expect(myTasksLink.className).not.toContain('font-semibold');
      expect(projectsLink.className).not.toContain('font-semibold');
    });
  });
});
