import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  AtSign,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  GitBranch,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Cpu,
  Zap,
  ShieldCheck,
  Check
} from 'lucide-react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

// Google Brand SVG Icon
function GoogleIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

export function RegisterPage() {
  const navigate = useNavigate();

  // Form Fields
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  // UI Interactive States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errors, setErrors] = useState({});

  // Password Strength Calculation Helper
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: '', color: 'bg-slate-800', text: 'text-slate-500' };
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (pass.length >= 12) score += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 25, label: 'Weak', color: 'bg-rose-500', text: 'text-rose-400' };
    if (score <= 2) return { score: 50, label: 'Fair', color: 'bg-amber-500', text: 'text-amber-400' };
    if (score <= 4) return { score: 75, label: 'Good', color: 'bg-cyan-400', text: 'text-cyan-300' };
    return { score: 100, label: 'Strong', color: 'bg-emerald-400', text: 'text-emerald-400' };
  };

  const strength = getPasswordStrength(password);

  // Form Validation
  const validateForm = () => {
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = 'Full name is required.';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Please enter a valid full name.';
    }

    if (!username.trim()) {
      newErrors.username = 'Username is required.';
    } else if (!/^[a-zA-Z0-9_-]{3,20}$/.test(username.trim())) {
      newErrors.username = 'Username must be 3-20 characters (letters, numbers, hyphens).';
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
      newErrors.confirmPassword = 'Please confirm your password.';
    } else if (confirmPassword !== password) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    if (!agreeTerms) {
      newErrors.agreeTerms = 'You must accept the Terms of Service & Privacy Policy.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit Handler
  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!validateForm()) return;

    setIsLoading(true);

    // Simulate Registration API delay
    setTimeout(() => {
      setIsLoading(false);

      if (email === 'taken@devspace.io') {
        setErrorMessage('An account with this email already exists. Try signing in.');
        return;
      }

      localStorage.setItem('devspace_token', 'mock_token_register_123');
      navigate('/dashboard');
    }, 1200);
  };

  // Quick fill helper for testing
  const handleQuickFill = () => {
    setName('Alex Rivera');
    setUsername('alexrivera');
    setEmail('alex.rivera@devspace.io');
    setPassword('DevSpace2026!');
    setConfirmPassword('DevSpace2026!');
    setAgreeTerms(true);
    setErrors({});
    setErrorMessage('');
  };

  return (
    <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center py-4">
      {/* LEFT SIDE: Branding & Developer Value Proposition */}
      <div className="lg:col-span-6 space-y-6 text-left">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-card border border-indigo-500/30 text-xs font-mono text-indigo-300 shadow-xl shadow-indigo-950/20">
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          <span>Join the DevSpace Developer Platform</span>
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-100 tracking-tight my-0 leading-tight">
            Build Better Code Together in Minutes
          </h1>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            Create your free account to unlock multi-repository workspaces, interactive Kanban sprint boards, and automated AI code reviews.
          </p>
        </div>

        {/* Value Bullets */}
        <div className="space-y-3 pt-2">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-200">Zero-Config Workspaces</h4>
              <p className="text-[11px] text-slate-400">Initialize sprint tracking for microservices and open-source repos instantly.</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0">
              <GitBranch className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-200">Automated GitHub Sync</h4>
              <p className="text-[11px] text-slate-400">Bi-directional branch linking, PR review status, and build notifications.</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-200">Free Unlimited Public Workspaces</h4>
              <p className="text-[11px] text-slate-400">No credit card required. Free tier includes up to 5 collaborators per private workspace.</p>
            </div>
          </div>
        </div>

        {/* Social Proof Card */}
        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-2">
          <p className="text-xs text-slate-300 italic leading-relaxed">
            "Setting up DevSpace took 2 minutes. The real-time Kanban boards and automated PR sync have streamlined our entire squad's sprint velocity."
          </p>
          <div className="flex items-center gap-2 pt-1">
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center font-bold text-[10px] text-white">
              ER
            </div>
            <div>
              <span className="text-xs font-bold text-slate-200 block">Elena Rostova</span>
              <span className="text-[10px] text-slate-400 font-mono">Frontend Lead @ DevSpace Core</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Registration Form Card */}
      <div className="lg:col-span-6">
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl space-y-5 glow-primary">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-100 tracking-tight my-0">
              Create Account
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Start your 14-day free trial. No credit card required.
            </p>
          </div>

          {/* Global Error Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
            {/* Grid for Name & Username */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Input
                label="Full Name"
                type="text"
                required
                disabled={isLoading}
                icon={User}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: null }));
                }}
                error={errors.name}
                placeholder="Alex Rivera"
              />

              <Input
                label="Username"
                type="text"
                required
                disabled={isLoading}
                icon={AtSign}
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (errors.username) setErrors((prev) => ({ ...prev, username: null }));
                }}
                error={errors.username}
                placeholder="alexrivera"
              />
            </div>

            {/* Email Field */}
            <Input
              label="Email Address"
              type="email"
              required
              disabled={isLoading}
              icon={Mail}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: null }));
              }}
              error={errors.email}
              placeholder="developer@company.com"
            />

            {/* Password Field with Strength Indicator */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Password <span className="text-rose-400">*</span>
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  disabled={isLoading}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: null }));
                  }}
                  placeholder="At least 8 characters"
                  className={`w-full rounded-lg bg-slate-900/90 border border-slate-700/80 pl-9 pr-10 py-2 text-sm text-slate-100 placeholder-slate-500 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                    errors.password ? 'border-rose-500 focus:border-rose-500' : ''
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-rose-400 mt-1">{errors.password}</p>}

              {/* Password Strength Meter */}
              {password && (
                <div className="pt-1.5 space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-400">Password strength:</span>
                    <span className={`font-bold ${strength.text}`}>{strength.label}</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                    <div
                      className={`h-full ${strength.color} transition-all duration-300 rounded-full`}
                      style={{ width: `${strength.score}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Confirm Password <span className="text-rose-400">*</span>
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  disabled={isLoading}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: null }));
                  }}
                  placeholder="Re-enter password"
                  className={`w-full rounded-lg bg-slate-900/90 border border-slate-700/80 pl-9 pr-10 py-2 text-sm text-slate-100 placeholder-slate-500 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                    errors.confirmPassword ? 'border-rose-500 focus:border-rose-500' : ''
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                  title={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-xs text-rose-400 mt-1">{errors.confirmPassword}</p>}
            </div>

            {/* Terms & Conditions Checkbox */}
            <div className="pt-1 space-y-1">
              <label className="flex items-start gap-2.5 cursor-pointer select-none text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => {
                    setAgreeTerms(e.target.checked);
                    if (errors.agreeTerms) setErrors((prev) => ({ ...prev, agreeTerms: null }));
                  }}
                  className="mt-0.5 w-4 h-4 rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-950 cursor-pointer"
                />
                <span className="leading-snug">
                  I agree to the{' '}
                  <span className="text-indigo-400 hover:underline">Terms of Service</span> and{' '}
                  <span className="text-indigo-400 hover:underline">Privacy Policy</span>.
                </span>
              </label>
              {errors.agreeTerms && <p className="text-xs text-rose-400 pl-6">{errors.agreeTerms}</p>}
            </div>

            {/* Submit Button */}
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
                  <span>Creating account...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>Create Free Developer Account</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </Button>
          </form>

          {/* Social Auth Dividers */}
          <div className="relative flex items-center justify-center my-3">
            <div className="w-full border-t border-slate-800" />
            <span className="absolute bg-slate-950 px-3 text-[10px] font-mono text-slate-500 uppercase">
              Or sign up with
            </span>
          </div>

          {/* Social OAuth Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800/80 border border-slate-700/80 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
            >
              <GoogleIcon />
              <span>Google</span>
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800/80 border border-slate-700/80 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
            >
              <GitBranch className="w-4 h-4 text-cyan-400" />
              <span>GitHub</span>
            </button>
          </div>

          {/* Demo Helper */}
          <div className="p-2.5 rounded-xl bg-slate-900/40 border border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
            <span className="font-mono text-slate-500 uppercase text-[10px]">Testing Helper</span>
            <button
              type="button"
              onClick={handleQuickFill}
              className="text-indigo-400 hover:underline font-semibold cursor-pointer"
            >
              Quick Fill Demo Data
            </button>
          </div>

          {/* Footer Link to Login */}
          <p className="text-center text-xs text-slate-400 pt-1">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-indigo-400 hover:text-indigo-300">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
