import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw
} from 'lucide-react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import api from '../../utils/axios';

export function ForgotPasswordPage() {
  const navigate = useNavigate();

  // Form Field State
  const [email, setEmail] = useState('');

  // Interactive UI States
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [emailError, setEmailError] = useState('');

  // Validation
  const validateForm = () => {
    if (!email.trim()) {
      setEmailError('Email address is required.');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError('Please enter a valid email address.');
      return false;
    }
    setEmailError('');
    return true;
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      await api.post('/auth/forgot-password', { email: email.trim().toLowerCase() });
      setSubmitted(true);
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message ||
        err.message ||
        'Failed to request password reset. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Quick fill helper for testing
  const handleQuickFill = () => {
    setEmail('dev@example.com');
    setEmailError('');
    setErrorMessage('');
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="rounded-lg border border-[#E8E8E5] dark:border-[#353535] bg-[#FFFFFF] dark:bg-[#202020] p-6 sm:p-7 shadow-xs space-y-5">
        {submitted ? (
          /* State 1: Confirmation */
          <div className="space-y-4 text-center">
            <div className="w-9 h-9 rounded-md bg-[#EBF8F1] dark:bg-[rgba(78,190,126,0.12)] border border-[#D1F0DE] dark:border-[rgba(78,190,126,0.25)] text-[#107C41] dark:text-[#4EBE7E] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-4 h-4" />
            </div>

            <div className="space-y-1">
              <h1 className="text-lg font-semibold tracking-tight text-[#252525] dark:text-[#F2F2F2] my-0">
                Instructions Sent
              </h1>
              <p className="text-xs text-[#777777] dark:text-[#A0A0A0] leading-relaxed">
                If an account with <strong className="text-[#252525] dark:text-[#F2F2F2] font-mono">{email}</strong> exists,
                we have dispatched password recovery instructions.
              </p>
            </div>

            <div className="p-3 rounded-md bg-[#F7F7F5] dark:bg-[#1C1C1C] border border-[#E8E8E5] dark:border-[#353535] text-left text-xs text-[#777777] dark:text-[#A0A0A0] space-y-1">
              <p className="font-medium text-[#252525] dark:text-[#F2F2F2]">Next steps:</p>
              <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                <li>Check your inbox and spam folder.</li>
                <li>The security reset link expires in 60 minutes.</li>
              </ul>
            </div>

            <div className="pt-2 space-y-2">
              <Button
                variant="primary"
                size="md"
                onClick={() => navigate('/login')}
                className="w-full justify-center h-9 text-xs font-medium"
              >
                Back to Sign in
              </Button>

              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="inline-flex items-center gap-1.5 text-xs text-[#777777] dark:text-[#A0A0A0] hover:text-[#252525] dark:hover:text-[#F2F2F2] transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Try a different email</span>
              </button>
            </div>
          </div>
        ) : (
          /* State 2: Request Form */
          <div className="space-y-5">
            <div className="space-y-1">
              <h1 className="text-lg font-semibold tracking-tight text-[#252525] dark:text-[#F2F2F2] my-0">
                Reset your password
              </h1>
              <p className="text-xs text-[#777777] dark:text-[#A0A0A0]">
                Enter your registered email address and we will send you password reset instructions.
              </p>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="p-3 rounded-md bg-[#FDF3F2] dark:bg-[rgba(248,113,113,0.12)] border border-[#F9D5D3] dark:border-[rgba(248,113,113,0.25)] text-[#D83B01] dark:text-[#F87171] text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
              <Input
                label="Registered email address"
                type="email"
                required
                disabled={isLoading}
                icon={Mail}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError('');
                }}
                error={emailError}
                placeholder="developer@company.com"
              />

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
                    <span>Sending reset link...</span>
                  </div>
                ) : (
                  'Send Reset Link'
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
                Fill email
              </button>
            </div>

            {/* Back to Login Link */}
            <div className="pt-1 text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs text-[#777777] dark:text-[#A0A0A0] hover:text-[#252525] dark:hover:text-[#F2F2F2] transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Sign in</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
