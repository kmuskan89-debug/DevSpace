import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
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
  Layers,
  Zap,
  ShieldCheck,
  Terminal
} from 'lucide-react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

// SVG Google Icon
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

export function LoginPage() {
  const navigate = useNavigate();

  // Form Field States
  const [email, setEmail] = useState('alex.rivera@devspace.io');
  const [password, setPassword] = useState('password123');
  const [rememberMe, setRememberMe] = useState(true);

  // UI Interactive States
  const [showPassword, setShowPassword] = useState(false);
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
  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!validateForm()) return;

    setIsLoading(true);

    // Simulate authentication API request delay
    setTimeout(() => {
      setIsLoading(false);

      // Trigger mock error if invalid credentials entered
      if (email === 'error@devspace.io') {
        setErrorMessage('Invalid credentials. Please verify your email and password.');
        return;
      }

      // Success path
      localStorage.setItem('devspace_token', 'mock_token_123');
      navigate('/dashboard');
    }, 1200);
  };

  // Quick fill helper for testing
  const handleQuickFill = () => {
    setEmail('alex.rivera@devspace.io');
    setPassword('password123');
    setErrors({});
    setErrorMessage('');
  };

  const handleSimulateError = () => {
    setEmail('error@devspace.io');
    setPassword('wrongpass');
    setErrors({});
    setErrorMessage('Invalid credentials. Please verify your email and password.');
  };

  return (
    <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center py-4">
      {/* LEFT SIDE: Branding & Product Showcase (Hidden on small, stacked on medium, split on lg) */}
      <div className="lg:col-span-6 space-y-6 text-left">
        {/* Release Tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-card border border-indigo-500/30 text-xs font-mono text-indigo-300 shadow-xl shadow-indigo-950/20">
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          <span>DevSpace Collaboration OS v2.4</span>
        </div>

        {/* Headline */}
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-100 tracking-tight my-0 leading-tight">
            Accelerate How Your Team Builds & Ships Code
          </h1>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            One workspace for issue tracking, Git branch linking, live pair programming, and AI automated code reviews.
          </p>
        </div>

        {/* Feature Bullets */}
        <div className="space-y-3 pt-2">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-200">Real-Time Sprint Sync</h4>
              <p className="text-[11px] text-slate-400">WebSockets engine for live cursor editing and sprint board updates.</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0">
              <GitBranch className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-200">Bi-Directional Git Sync</h4>
              <p className="text-[11px] text-slate-400">Link PRs, feature branches, and deployment status automatically.</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-200">Enterprise Security & RBAC</h4>
              <p className="text-[11px] text-slate-400">Granular role access control, SSO integration, and full audit logs.</p>
            </div>
          </div>
        </div>

        {/* Testimonial Quote Card */}
        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-2">
          <p className="text-xs text-slate-300 italic leading-relaxed">
            "DevSpace reduced our pull request review cycle time by 45%. It's become the daily operating system for our engineering squad."
          </p>
          <div className="flex items-center gap-2 pt-1">
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-[10px] text-white">
              AR
            </div>
            <div>
              <span className="text-xs font-bold text-slate-200 block">Alex Rivera</span>
              <span className="text-[10px] text-slate-400 font-mono">Lead Architect @ Core Platform</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Login Form Card */}
      <div className="lg:col-span-6">
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl space-y-6 glow-primary">
          {/* Form Header */}
          <div>
            <h2 className="text-2xl font-extrabold text-slate-100 tracking-tight my-0">
              Welcome Back
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Sign in to your DevSpace account to access your workspaces
            </p>
          </div>

          {/* Global Error Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
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

            {/* Password Field with Eye Visibility Toggle */}
            <div className="space-y-1.5">
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
                  placeholder="••••••••"
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
              {errors.password && <p className="text-xs text-rose-400">{errors.password}</p>}
            </div>

            {/* Controls Row: Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-300">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-950 cursor-pointer"
                />
                <span>Remember me for 30 days</span>
              </label>

              <Link
                to="/forgot-password"
                className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button with Loading State */}
            <Button
              variant="primary"
              size="md"
              type="submit"
              disabled={isLoading}
              className="w-full justify-center text-sm py-2.5 shadow-lg shadow-indigo-600/20"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Signing in...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>Sign In to DevSpace</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </Button>
          </form>

          {/* Social Dividers */}
          <div className="relative flex items-center justify-center my-4">
            <div className="w-full border-t border-slate-800" />
            <span className="absolute bg-slate-950 px-3 text-[10px] font-mono text-slate-500 uppercase">
              Or continue with
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

          {/* Interactive UI Demo Testing Helpers */}
          <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/80 text-[11px] text-slate-400 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-slate-500 uppercase text-[10px]">Testing Controls</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleQuickFill}
                  className="text-indigo-400 hover:underline font-semibold cursor-pointer"
                >
                  Quick Fill
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={handleSimulateError}
                  className="text-rose-400 hover:underline font-semibold cursor-pointer"
                >
                  Simulate Error
                </button>
              </div>
            </div>
          </div>

          {/* Footer link to Register */}
          <p className="text-center text-xs text-slate-400 pt-1">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-bold text-indigo-400 hover:text-indigo-300">
              Create a free account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
