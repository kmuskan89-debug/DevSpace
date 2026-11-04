import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';

import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import api from '../utils/axios';

// Mock AuthContext
const mockLogin = vi.fn();
const mockRegister = vi.fn();

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
    register: mockRegister,
    isAuthenticated: false,
    isLoading: false,
  }),
}));

// Mock axios
vi.mock('../utils/axios', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

describe('Authentication Pages & Workflows', () => {
  describe('LoginPage', () => {
    it('renders login form with email, password, and sign in button', () => {
      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      );

      expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/name@company.com/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/••••••••••••/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('shows validation errors when submitting empty fields', async () => {
      const user = userEvent.setup();
      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      );

      const submitBtn = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitBtn);

      expect(screen.getByText(/email address is required/i)).toBeInTheDocument();
      expect(mockLogin).not.toHaveBeenCalled();
    });

    it('submits credentials through auth context when valid', async () => {
      const user = userEvent.setup();
      mockLogin.mockResolvedValueOnce({ success: true });

      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      );

      const emailInput = screen.getByPlaceholderText(/name@company.com/i);
      const passwordInput = screen.getByPlaceholderText(/••••••••••••/i);
      const submitBtn = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'developer@example.com');
      await user.type(passwordInput, 'SecretPassword123!');
      await user.click(submitBtn);

      expect(mockLogin).toHaveBeenCalledWith('developer@example.com', 'SecretPassword123!');
    });
  });

  describe('RegisterPage', () => {
    it('renders registration form with name, email, and password inputs', () => {
      render(
        <BrowserRouter>
          <RegisterPage />
        </BrowserRouter>
      );

      expect(screen.getByRole('heading', { name: /create your account/i })).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/alex rivera/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/alex@company.com/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/at least 8 characters/i)).toBeInTheDocument();
    });

    it('validates password requirements on empty submit', async () => {
      const user = userEvent.setup();
      render(
        <BrowserRouter>
          <RegisterPage />
        </BrowserRouter>
      );

      const submitBtn = screen.getByRole('button', { name: /create account/i });
      await user.click(submitBtn);

      expect(screen.getByText(/full name is required/i)).toBeInTheDocument();
      expect(mockRegister).not.toHaveBeenCalled();
    });
  });

  describe('ForgotPasswordPage', () => {
    it('validates email format and displays confirmation upon submission', async () => {
      const user = userEvent.setup();
      api.post.mockResolvedValueOnce({ data: { message: 'Instructions sent' } });

      render(
        <BrowserRouter>
          <ForgotPasswordPage />
        </BrowserRouter>
      );

      const emailInput = screen.getByPlaceholderText(/developer@company.com/i);
      const submitBtn = screen.getByRole('button', { name: /send reset link/i });

      await user.type(emailInput, 'dev@example.com');
      await user.click(submitBtn);

      expect(api.post).toHaveBeenCalledWith('/auth/forgot-password', {
        email: 'dev@example.com'
      });
      expect(await screen.findByRole('heading', { name: /instructions sent/i })).toBeInTheDocument();
    });
  });
});
