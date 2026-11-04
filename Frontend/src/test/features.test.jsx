import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';

import KanbanBoard from '../components/projects/KanbanBoard';
import TaskCard from '../components/projects/TaskCard';
import ProjectCard from '../components/projects/ProjectCard';
import { TaskFilterBar } from '../components/projects/TaskFilterBar';

// Mock AuthContext for components consuming useAuth (like TaskFilterBar)
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { _id: 'user-1', id: 'user-1', name: 'Test User' },
    isAuthenticated: true,
  }),
}));

// Realistic fixtures
const sampleTasks = [
  {
    _id: 'task-1',
    id: 'task-1',
    issueKey: 'CORE-1',
    title: 'Implement OAuth Token Refresh',
    status: 'To Do',
    priority: 'High',
    type: 'Task',
    tags: ['auth', 'backend'],
    assignee: { name: 'Alice Walker', avatar: '' }
  },
  {
    _id: 'task-2',
    id: 'task-2',
    issueKey: 'CORE-2',
    title: 'Design Kanban Card Drag Overlay',
    status: 'In Progress',
    priority: 'Medium',
    type: 'Story',
    labels: ['ui'],
    assignee: { name: 'Bob Dylan', avatar: '' }
  },
  {
    _id: 'task-3',
    id: 'task-3',
    issueKey: 'CORE-3',
    title: 'Fix Memory Leak on Socket Close',
    status: 'Done',
    priority: 'Highest',
    type: 'Bug',
    labels: ['bugfix']
  }
];

const sampleProject = {
  _id: 'proj-1',
  id: 'proj-1',
  name: 'Core Platform',
  key: 'CORE',
  description: 'Primary platform infrastructure service',
  status: 'Active',
  lead: 'Alice Walker',
  leadObj: { name: 'Alice Walker' },
  totalTasksCount: 15,
  completedTasksCount: 10,
  progress: 67
};

describe('Core Application Features', () => {
  describe('KanbanBoard Component', () => {
    it('renders all four Kanban columns with counts', () => {
      render(
        <KanbanBoard
          tasks={sampleTasks}
          onTaskClick={vi.fn()}
          onAddTask={vi.fn()}
          onMoveTask={vi.fn()}
        />
      );

      expect(screen.getByText('To Do')).toBeInTheDocument();
      expect(screen.getByText('In Progress')).toBeInTheDocument();
      expect(screen.getByText('Code Review')).toBeInTheDocument();
      expect(screen.getByText('Done')).toBeInTheDocument();

      expect(screen.getByText('Implement OAuth Token Refresh')).toBeInTheDocument();
      expect(screen.getByText('Design Kanban Card Drag Overlay')).toBeInTheDocument();
      expect(screen.getByText('Fix Memory Leak on Socket Close')).toBeInTheDocument();
    });

    it('renders empty state when tasks list is empty', () => {
      render(
        <KanbanBoard
          tasks={[]}
          onTaskClick={vi.fn()}
          onAddTask={vi.fn()}
          onMoveTask={vi.fn()}
        />
      );

      expect(screen.getByText(/no tasks on this board/i)).toBeInTheDocument();
    });

    it('filters tasks by search input keyword', async () => {
      const user = userEvent.setup();
      render(
        <KanbanBoard
          tasks={sampleTasks}
          onTaskClick={vi.fn()}
          onAddTask={vi.fn()}
          onMoveTask={vi.fn()}
        />
      );

      const searchInput = screen.getByPlaceholderText(/search tasks/i);
      await user.type(searchInput, 'Memory Leak');

      expect(screen.getByText('Fix Memory Leak on Socket Close')).toBeInTheDocument();
      expect(screen.queryByText('Implement OAuth Token Refresh')).not.toBeInTheDocument();
    });
  });

  describe('TaskCard Component', () => {
    it('renders issue key, title, labels, and handles click event', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(
        <TaskCard
          task={sampleTasks[0]}
          onClick={handleClick}
          onDragStart={vi.fn()}
        />
      );

      expect(screen.getByText('CORE-1')).toBeInTheDocument();
      expect(screen.getByText('Implement OAuth Token Refresh')).toBeInTheDocument();
      expect(screen.getByText('#auth')).toBeInTheDocument();

      const card = screen.getByText('CORE-1').closest('div');
      await user.click(card);
      expect(handleClick).toHaveBeenCalled();
    });
  });

  describe('ProjectCard Component', () => {
    it('renders project name, key badge, description, and progress', () => {
      render(
        <BrowserRouter>
          <ProjectCard project={sampleProject} />
        </BrowserRouter>
      );

      expect(screen.getByText('Core Platform')).toBeInTheDocument();
      expect(screen.getByText('CORE')).toBeInTheDocument();
      expect(screen.getByText(/primary platform infrastructure/i)).toBeInTheDocument();
      expect(screen.getByText('67%')).toBeInTheDocument();
    });
  });

  describe('TaskFilterBar Component', () => {
    it('renders filter controls and triggers onChangeFilters callback', async () => {
      const user = userEvent.setup();
      const handleChangeFilters = vi.fn();

      render(
        <TaskFilterBar
          filters={{ search: '', status: 'all', priority: 'all' }}
          onChangeFilters={handleChangeFilters}
          onResetFilters={vi.fn()}
          sort={{ field: 'createdAt', order: 'desc' }}
          onChangeSort={vi.fn()}
        />
      );

      const statusSelect = screen.getByDisplayValue('All Statuses');
      expect(statusSelect).toBeInTheDocument();

      await user.selectOptions(statusSelect, 'In Progress');
      expect(handleChangeFilters).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'In Progress' })
      );

      const searchInput = screen.getByPlaceholderText(/search issues, keys\.\.\./i);
      await user.type(searchInput, 'bug');

      // TaskFilterBar debounces searchInput by 300ms before calling onChangeFilters
      await vi.waitFor(() => {
        expect(handleChangeFilters).toHaveBeenCalledWith(
          expect.objectContaining({ search: 'bug' })
        );
      }, { timeout: 1000 });
    });
  });
});
