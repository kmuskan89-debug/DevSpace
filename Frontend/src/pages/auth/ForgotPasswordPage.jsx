import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  KeyRound,
  RefreshCw,
  Send
} from 'lucide-react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

export function ForgotPasswordPage() {
  const navigate = useNavigate();

  // Form Field State
  const [email, setEmail] = useState('alex.rivera@devspace.io');

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
  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!validateForm()) return;

    setIsLoading(true);

    // Simulate API reset link request delay
    setTimeout(() => {
      setIsLoading(false);

      if (email === 'notfound@devspace.io') {
        setErrorMessage('No DevSpace account was found associated with this email address.');
        return;
      }

      setSubmitted(true);
    }, 1200);
  };

  // Quick fill helper for testing
  const handleQuickFill = () => {
    setEmail('alex.rivera@devspace.io');
    setEmailError('');
    setErrorMessage('');
  };

  const handleSimulateError = () => {
    setEmail('notfound@devspace.io');
    setEmailError('');
    setErrorMessage('No DevSpace account was found associated with this email address.');
  };

  return (
    <div className="w-full max-w-md mx-auto py-6">
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl text-center space-y-6 glow-primary">
        {/* Top Icon Badge */}
        <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto shadow-lg shadow-indigo-950/40">
          {submitted ? (
            <CheckCircle2 className="w-7 h-7 text-emerald-400" />
          ) : (
            <KeyRound className="w-7 h-7 text-indigo-400" />
          )}
        </div>

        {/* Dynamic State 1: SUCCESS STATE */}
        {submitted ? (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight my-0">
                Check Your Email
              </h1>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                We sent password reset instructions to <br />
                <strong className="text-indigo-300 font-mono">{email}</strong>
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-left space-y-2 text-xs">
              <div className="flex items-center gap-2 text-indigo-400 font-bold">
                <Send className="w-4 h-4" />
                <span>What happens next?</span>
              </div>
              <ul className="space-y-1.5 text-slate-400 text-[11px] list-disc list-inside leading-relaxed">
                <li>Click the reset link inside the email to set a new password.</li>
                <li>The password reset link will expire in 60 minutes.</li>
                <li>Didn't receive the email? Check your spam folder.</li>
              </ul>
            </div>

            <div className="space-y-3 pt-2">
              <Button
                variant="primary"
                size="md"
                onClick={() => navigate('/login')}
                className="w-full justify-center text-sm py-2.5 shadow-lg shadow-indigo-600/20"
              >
                Back to Sign In
              </Button>

              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Didn't get the link? Try another email</span>
              </button>
            </div>
          </div>
        ) : (
          /* Dynamic State 2: FORM STATE */
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight my-0">
                Forgot Password?
              </h1>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                No worries! Enter your account email address and we'll send you a password reset link.
              </p>
            </div>

            {/* Global Error Banner */}
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5 text-left animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-left" noValidate>
              <Input
                label="Registered Email Address"
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
                helperText="Enter the email associated with your DevSpace account"
              />

              <Button
                variant="primary"
                size="md"
                type="submit"
                disabled={isLoading}
                className="w-full justify-center text-sm py-2.5 shadow-lg shadow-indigo-600/20 mt-2"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Sending reset link...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Send className="w-4 h-4" />
                    <span>Send Reset Link</span>
                  </div>
                )}
              </Button>
            </form>

            {/* Testing Helper Triggers */}
            <div className="p-2.5 rounded-xl bg-slate-900/40 border border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
              <span className="font-mono text-slate-500 uppercase text-[10px]">Testing Controls</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleQuickFill}
                  className="text-indigo-400 hover:underline font-semibold cursor-pointer"
                >
                  Valid Email
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={handleSimulateError}
                  className="text-rose-400 hover:underline font-semibold cursor-pointer"
                >
                  Not Found Error
                </button>
              </div>
            </div>

            {/* Back to Login Link */}
            <div className="pt-2 border-t border-slate-800/80">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 text-indigo-400" />
                <span>Back to Sign In</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
