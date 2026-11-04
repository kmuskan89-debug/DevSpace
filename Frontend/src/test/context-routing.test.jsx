import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

import { ThemeProvider, useTheme } from '../context/ThemeContext';
import ProtectedRoute from '../components/common/ProtectedRoute';

// Helper component to consume and test ThemeContext
function ThemeConsumer() {
  const { theme, toggleTheme } = useTheme();
  return (
    <div>
      <span data-testid="current-theme">{theme}</span>
      <button onClick={toggleTheme}>Toggle Theme</button>
    </div>
  );
}

// Mock useAuth for ProtectedRoute tests
const mockUseAuth = vi.fn();
vi.mock('../context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

describe('Context & Routing Architecture', () => {
  describe('ThemeContext', () => {
    it('initializes with default dark theme and toggles theme on button click', async () => {
      const user = userEvent.setup();
      render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>
      );

      const themeDisplay = screen.getByTestId('current-theme');
      expect(themeDisplay.textContent).toBe('dark');
      expect(document.documentElement.classList.contains('dark')).toBe(true);

      const toggleBtn = screen.getByRole('button', { name: /toggle theme/i });
      await user.click(toggleBtn);

      expect(themeDisplay.textContent).toBe('light');
      expect(document.documentElement.classList.contains('light')).toBe(true);
      expect(localStorage.getItem('devspace_theme')).toBe('light');
    });

    it('loads saved theme preference from localStorage', () => {
      localStorage.setItem('devspace_theme', 'light');

      render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>
      );

      const themeDisplay = screen.getByTestId('current-theme');
      expect(themeDisplay.textContent).toBe('light');
    });
  });

  describe('ProtectedRoute Guard', () => {
    it('redirects unauthenticated users to /login', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
      });

      render(
        <MemoryRouter initialEntries={['/dashboard']}>
          <Routes>
            <Route path="/login" element={<div>Login Page</div>} />
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<div>Protected Dashboard</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('Login Page')).toBeInTheDocument();
      expect(screen.queryByText('Protected Dashboard')).not.toBeInTheDocument();
    });

    it('renders protected child routes when authenticated', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
      });

      render(
        <MemoryRouter initialEntries={['/dashboard']}>
          <Routes>
            <Route path="/login" element={<div>Login Page</div>} />
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<div>Protected Dashboard</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('Protected Dashboard')).toBeInTheDocument();
      expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
    });

    it('shows loading spinner while verifying session', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        isLoading: true,
      });

      render(
        <MemoryRouter initialEntries={['/dashboard']}>
          <Routes>
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<div>Protected Dashboard</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText(/verifying session/i)).toBeInTheDocument();
    });
  });
});

