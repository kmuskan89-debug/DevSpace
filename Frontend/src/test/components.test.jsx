import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Modal from '../components/common/Modal';
import Dropdown, { DropdownItem } from '../components/common/Dropdown';
import Tabs from '../components/common/Tabs';
import Badge from '../components/common/Badge';
import Avatar from '../components/common/Avatar';
import ThemeToggle from '../components/common/ThemeToggle';
import LoadingState from '../components/common/LoadingState';
import EmptyState from '../components/common/EmptyState';
import { ThemeProvider } from '../context/ThemeContext';

describe('Shared UI Components', () => {
  describe('Button Component', () => {
    it('renders with children text and handles click events', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click Me</Button>);

      const btn = screen.getByRole('button', { name: /click me/i });
      expect(btn).toBeInTheDocument();
      await user.click(btn);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not trigger click when disabled', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(<Button disabled onClick={handleClick}>Disabled</Button>);

      const btn = screen.getByRole('button', { name: /disabled/i });
      expect(btn).toBeDisabled();
      await user.click(btn);
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('renders loading spinner and disables button when loading=true', () => {
      render(<Button loading>Saving</Button>);
      const btn = screen.getByRole('button');
      expect(btn).toBeDisabled();
      expect(btn.querySelector('.animate-spin')).toBeInTheDocument();
    });
  });

  describe('Input Component', () => {
    it('renders label, placeholder, and updates value on change', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(
        <Input
          label="Project Name"
          placeholder="Enter project name"
          value=""
          onChange={handleChange}
        />
      );

      expect(screen.getByText(/project name/i)).toBeInTheDocument();
      const input = screen.getByPlaceholderText(/enter project name/i);
      await user.type(input, 'New App');
      expect(handleChange).toHaveBeenCalled();
    });

    it('displays error message when provided', () => {
      render(
        <Input
          label="Email Address"
          value="invalid"
          onChange={() => {}}
          error="Please enter a valid email"
        />
      );
      expect(screen.getByText(/please enter a valid email/i)).toBeInTheDocument();
    });
  });

  describe('Modal Component', () => {
    it('renders title, children, and calls onClose on backdrop click', async () => {
      const user = userEvent.setup();
      const handleClose = vi.fn();

      render(
        <Modal isOpen={true} onClose={handleClose} title="Create Task" subtitle="Add a new task">
          <p>Modal body content</p>
        </Modal>
      );

      expect(screen.getByText('Create Task')).toBeInTheDocument();
      expect(screen.getByText('Modal body content')).toBeInTheDocument();

      const closeBtn = screen.getByLabelText(/close modal/i);
      await user.click(closeBtn);
      expect(handleClose).toHaveBeenCalled();
    });

    it('does not render when isOpen is false', () => {
      render(
        <Modal isOpen={false} onClose={() => {}} title="Hidden Modal">
          <p>Should not see</p>
        </Modal>
      );
      expect(screen.queryByText('Hidden Modal')).not.toBeInTheDocument();
    });
  });

  describe('Dropdown Component', () => {
    it('opens on trigger click and renders items', async () => {
      const user = userEvent.setup();
      const handleSelect = vi.fn();

      render(
        <Dropdown trigger={<button>Options Menu</button>}>
          <DropdownItem onClick={handleSelect}>Edit Item</DropdownItem>
          <DropdownItem danger>Delete Item</DropdownItem>
        </Dropdown>
      );

      expect(screen.queryByText('Edit Item')).not.toBeInTheDocument();
      const triggerBtn = screen.getByRole('button', { name: /options menu/i });
      await user.click(triggerBtn);

      expect(screen.getByText('Edit Item')).toBeInTheDocument();
      await user.click(screen.getByText('Edit Item'));
      expect(handleSelect).toHaveBeenCalledTimes(1);
    });
  });

  describe('Tabs Component', () => {
    it('renders tabs and calls onChange on tab selection', async () => {
      const user = userEvent.setup();
      const handleTabChange = vi.fn();
      const tabs = [
        { id: 'board', label: 'Kanban Board', count: 12 },
        { id: 'backlog', label: 'Backlog', count: 5 }
      ];

      render(<Tabs tabs={tabs} activeTab="board" onChange={handleTabChange} />);

      expect(screen.getByText('Kanban Board')).toBeInTheDocument();
      expect(screen.getByText('Backlog')).toBeInTheDocument();

      await user.click(screen.getByText('Backlog'));
      expect(handleTabChange).toHaveBeenCalledWith('backlog');
    });
  });

  describe('Badge Component', () => {
    it('renders priority badges with appropriate text and styles', () => {
      const { rerender } = render(<Badge priority="Highest" />);
      expect(screen.getByText('Highest')).toBeInTheDocument();

      rerender(<Badge priority="Low" />);
      expect(screen.getByText('Low')).toBeInTheDocument();
    });

    it('renders custom status badge', () => {
      render(<Badge status="Active" />);
      expect(screen.getByText('Active')).toBeInTheDocument();
    });
  });

  describe('Avatar Component', () => {
    it('renders fallback user initials when no image URL provided', () => {
      render(<Avatar name="Alice Johnson" size="md" />);
      expect(screen.getByText('AJ')).toBeInTheDocument();
    });

    it('renders img element when src is provided', () => {
      render(<Avatar name="Bob Smith" src="https://example.com/avatar.jpg" />);
      const img = screen.getByAltText('Bob Smith');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('loading', 'lazy');
      expect(img).toHaveAttribute('decoding', 'async');
    });
  });

  describe('LoadingState & EmptyState Components', () => {
    it('LoadingState displays custom message and spinner', () => {
      render(<LoadingState message="Fetching workspace data..." />);
      expect(screen.getByText('Fetching workspace data...')).toBeInTheDocument();
    });

    it('EmptyState renders title, description, and triggers action button', async () => {
      const user = userEvent.setup();
      const handleAction = vi.fn();

      render(
        <EmptyState
          title="No projects found"
          description="Create your first project to get started"
          action={{
            label: 'Create Project',
            onClick: handleAction
          }}
        />
      );

      expect(screen.getByText('No projects found')).toBeInTheDocument();
      expect(screen.getByText(/create your first project/i)).toBeInTheDocument();

      const actionBtn = screen.getByRole('button', { name: /create project/i });
      await user.click(actionBtn);
      expect(handleAction).toHaveBeenCalledTimes(1);
    });
  });

  describe('ThemeToggle Component', () => {
    it('renders theme toggle button with accessible aria-label', () => {
      render(
        <ThemeProvider>
          <ThemeToggle />
        </ThemeProvider>
      );

      const toggleBtn = screen.getByRole('button', { name: /switch to (light|dark) theme/i });
      expect(toggleBtn).toBeInTheDocument();
    });
  });
});
