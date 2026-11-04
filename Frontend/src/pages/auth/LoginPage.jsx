import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Form Field States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // UI States
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errors, setErrors] = useState({});

  // Validation helper
  const validateForm = () => {
    const newErrors = {};
    if (!email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      newErrors.password = 'Password is required.';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setErrorMessage(err.message || 'Invalid credentials. Please verify your email and password.');
    } finally {
      setIsLoading(false);
    }
  };

  // Quick fill helper for testing
  const handleQuickFill = () => {
    setEmail('alex.rivera@devspace.io');
    setPassword('Developer123!');
    setErrors({});
    setErrorMessage('');
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="rounded-lg border border-[#E8E8E5] dark:border-[#353535] bg-[#FFFFFF] dark:bg-[#202020] p-6 sm:p-7 shadow-xs space-y-5">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-lg font-semibold tracking-tight text-[#252525] dark:text-[#F2F2F2] my-0">
            Sign in to DevSpace
          </h1>
          <p className="text-xs text-[#777777] dark:text-[#A0A0A0]">
            Enter your credentials to access your engineering workspaces.
          </p>
        </div>

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="p-3 rounded-md bg-[#FDF3F2] dark:bg-[rgba(248,113,113,0.12)] border border-[#F9D5D3] dark:border-[rgba(248,113,113,0.25)] text-[#D83B01] dark:text-[#F87171] text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
          <Input
            label="Email address"
            type="email"
            required
            autoComplete="email"
            disabled={isLoading}
            icon={Mail}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
            }}
            error={errors.email}
            placeholder="name@company.com"
          />

          <div className="space-y-1">
            <Input
              label="Password"
              type="password"
              required
              autoComplete="current-password"
              disabled={isLoading}
              icon={Lock}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
              }}
              error={errors.password}
              placeholder="••••••••••••"
            />
          </div>

          <div className="flex items-center justify-between text-xs pt-0.5">
            <label className="flex items-center gap-2 text-[#777777] dark:text-[#A0A0A0] cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-[#E8E8E5] dark:border-[#353535] text-[#252525] focus:ring-0 cursor-pointer"
              />
              <span>Remember me</span>
            </label>

            <Link
              to="/forgot-password"
              className="text-[#777777] dark:text-[#A0A0A0] hover:text-[#252525] dark:hover:text-[#F2F2F2] transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          <Button
            variant="primary"
            size="md"
            type="submit"
            disabled={isLoading}
            className="w-full justify-center mt-2 h-9 text-xs font-medium"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Signing in...</span>
              </div>
            ) : (
              'Sign in'
            )}
          </Button>
        </form>

        {/* Testing Helper Control */}
        <div className="pt-2 border-t border-[#E8E8E5] dark:border-[#353535] flex items-center justify-between text-[11px] text-[#777777] dark:text-[#A0A0A0]">
          <span className="font-mono text-[10px]">Testing shortcut:</span>
          <button
            type="button"
            onClick={handleQuickFill}
            className="text-[#252525] dark:text-[#F2F2F2] hover:underline cursor-pointer font-medium"
          >
            Fill Demo Account
          </button>
        </div>

        {/* Footer Link to Register */}
        <div className="pt-1 text-center text-xs text-[#777777] dark:text-[#A0A0A0]">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="text-[#252525] dark:text-[#F2F2F2] font-semibold hover:underline"
          >
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
