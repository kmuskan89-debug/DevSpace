import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);

  // UI Interactive States
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errors, setErrors] = useState({});

  // Password Strength Calculation Helper
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: '', color: 'bg-transparent' };
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (pass.length >= 12) score += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-[#D83B01] dark:bg-[#F87171]' };
    if (score <= 3) return { score: 2, label: 'Fair', color: 'bg-[#B26B00] dark:bg-[#FBBF24]' };
    if (score <= 4) return { score: 3, label: 'Good', color: 'bg-[#0078D4] dark:bg-[#60A5FA]' };
    return { score: 4, label: 'Strong', color: 'bg-[#107C41] dark:bg-[#4EBE7E]' };
  };

  const strength = getPasswordStrength(password);

  // Form Validation
  const validateForm = () => {
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = 'Full name is required.';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters.';
    }

    if (!email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      newErrors.password = 'Password is required.';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters.';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirmation password is required.';
    } else if (confirmPassword !== password) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    if (!agreeTerms) {
      newErrors.agreeTerms = 'You must agree to the Terms of Service.';
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
      await register(name.trim(), email.trim(), password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setErrorMessage(
        err.message || 'Registration failed. Please check your information and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Quick fill helper for testing
  const handleQuickFill = () => {
    const rand = Math.floor(Math.random() * 900) + 100;
    setName('Jordan Lee');
    setEmail(`jordan.lee.${rand}@devspace.io`);
    setPassword('Developer123!');
    setConfirmPassword('Developer123!');
    setAgreeTerms(true);
    setErrors({});
    setErrorMessage('');
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="rounded-lg border border-[#E8E8E5] dark:border-[#353535] bg-[#FFFFFF] dark:bg-[#202020] p-6 sm:p-7 shadow-xs space-y-5">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-lg font-semibold tracking-tight text-[#252525] dark:text-[#F2F2F2] my-0">
            Create your account
          </h1>
          <p className="text-xs text-[#777777] dark:text-[#A0A0A0]">
            Start managing projects, sprints, and tasks in DevSpace.
          </p>
        </div>

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="p-3 rounded-md bg-[#FDF3F2] dark:bg-[rgba(248,113,113,0.12)] border border-[#F9D5D3] dark:border-[rgba(248,113,113,0.25)] text-[#D83B01] dark:text-[#F87171] text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
          <Input
            label="Full name"
            required
            autoComplete="name"
            disabled={isLoading}
            icon={User}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
            }}
            error={errors.name}
            placeholder="Alex Rivera"
          />

          <Input
            label="Work email"
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
            placeholder="alex@company.com"
          />

          <div className="space-y-1.5">
            <Input
              label="Password"
              type="password"
              required
              autoComplete="new-password"
              disabled={isLoading}
              icon={Lock}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
              }}
              error={errors.password}
              placeholder="At least 8 characters"
            />

            {/* Subtle Password Strength Indicator */}
            {password && (
              <div className="space-y-1 pt-1">
                <div className="flex gap-1 h-1">
                  {[1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      className={`flex-1 rounded-full transition-all ${
                        strength.score >= step
                          ? strength.color
                          : 'bg-[#E8E8E5] dark:bg-[#353535]'
                      }`}
                    />
                  ))}
                </div>
                <div className="flex justify-between items-center text-[10px] text-[#777777] dark:text-[#A0A0A0]">
                  <span>Password strength:</span>
                  <span className="font-medium">{strength.label}</span>
                </div>
              </div>
            )}
          </div>

          <Input
            label="Confirm password"
            type="password"
            required
            autoComplete="new-password"
            disabled={isLoading}
            icon={Lock}
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: '' }));
            }}
            error={errors.confirmPassword}
            placeholder="Repeat your password"
          />

          {/* Terms Checkbox */}
          <div className="space-y-1 pt-0.5">
            <label className="flex items-start gap-2 text-xs text-[#777777] dark:text-[#A0A0A0] cursor-pointer">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => {
                  setAgreeTerms(e.target.checked);
                  if (errors.agreeTerms) setErrors((prev) => ({ ...prev, agreeTerms: '' }));
                }}
                className="w-3.5 h-3.5 mt-0.5 rounded border-[#E8E8E5] dark:border-[#353535] text-[#252525] focus:ring-0 cursor-pointer"
              />
              <span>
                I agree to the Terms of Service and Privacy Policy
              </span>
            </label>
            {errors.agreeTerms && (
              <p className="text-[11px] text-rose-500 mt-0.5">{errors.agreeTerms}</p>
            )}
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
                <span>Creating account...</span>
              </div>
            ) : (
              'Create account'
            )}
          </Button>
        </form>

        {/* Testing Shortcut */}
        <div className="pt-2 border-t border-[#E8E8E5] dark:border-[#353535] flex items-center justify-between text-[11px] text-[#777777] dark:text-[#A0A0A0]">
          <span className="font-mono text-[10px]">Testing shortcut:</span>
          <button
            type="button"
            onClick={handleQuickFill}
            className="text-[#252525] dark:text-[#F2F2F2] hover:underline cursor-pointer font-medium"
          >
            Auto-fill form
          </button>
        </div>

        {/* Footer Link to Login */}
        <div className="pt-1 text-center text-xs text-[#777777] dark:text-[#A0A0A0]">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-[#252525] dark:text-[#F2F2F2] font-semibold hover:underline"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
