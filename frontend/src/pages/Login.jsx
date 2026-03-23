import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CloudLightning, Eye, EyeOff, Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { AnimatedBlob } from '../components/AuthComponents';
import { validateLoginForm } from '../utils/authValidation';
import InputField from '../components/InputField';
import GradientButton from '../components/GradientButton';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', rememberMe: false });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    setForm(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validateLoginForm(form);
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setLoading(true);
    try {
      await login(form);
      if (form.rememberMe) {
        localStorage.setItem('rememberMe', 'true');
        localStorage.setItem('userEmail', form.email);
      }
      toast.success('Welcome back! 👋');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleClick = () => {
    toast('Google sign-in is coming soon.', { icon: 'ℹ️' });
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <div className="absolute inset-0 -z-10 bg-animated-gradient" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-slate-950/70 via-slate-950/35 to-slate-950" />
      <AnimatedBlob />

      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="mb-8 flex flex-col items-center gap-4">
          <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-sky-500 shadow-lg shadow-black/25">
            <CloudLightning size={32} className="text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white">CloudShare</h1>
            <p className="text-white/60 mt-1">Secure file sharing that feels premium</p>
          </div>
        </div>

        {/* Login Card */}
        <div className="rounded-3xl bg-gradient-to-r from-indigo-500/40 via-sky-500/35 to-purple-500/40 p-[1px] shadow-2xl shadow-black/30">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="bg-slate-950/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8"
          >
          {/* Toggle */}
          <div className="grid grid-cols-2 gap-2 mb-6">
            <Link
              to="/login"
              className="text-center py-2 rounded-xl font-semibold bg-white/10 border border-white/10 text-white"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="text-center py-2 rounded-xl font-semibold bg-transparent border border-white/10 text-white/70 hover:text-white hover:bg-white/5 transition-colors"
            >
              Register
            </Link>
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
          <p className="text-white/60 text-sm mb-6">Sign in to your account to continue</p>

          {/* Google */}
          <button
            type="button"
            onClick={handleGoogleClick}
            className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white py-3 rounded-xl transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-slate-950/50 px-2 text-white/55">OR login with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <InputField
              label="Email address"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@company.com"
              icon={Mail}
              error={errors.email}
            />

            {/* Password Input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-white/80">Password</div>
                <Link to="/forgot-password" className="text-xs text-blue-400 hover:text-blue-300">
                  Forgot?
                </Link>
              </div>
              <InputField
                label={null}
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                icon={Lock}
                error={errors.password}
                right={(
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-white/40 hover:text-white/70 transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                )}
              />
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="rememberMe"
                name="rememberMe"
                checked={form.rememberMe}
                onChange={handleChange}
                className="w-4 h-4 rounded border-white/20 bg-white/5 text-sky-400 focus:ring-sky-400"
              />
              <label htmlFor="rememberMe" className="ml-2 text-sm text-white/70">
                Remember this device
              </label>
            </div>

            {/* Submit Button */}
            <GradientButton
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-2xl font-semibold"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </GradientButton>
          </form>

          {/* Sign Up Link */}
          <p className="mt-8 text-center text-gray-400">
            Don't have an account?{' '}
            <Link to="/signup" className="text-blue-400 hover:text-blue-300 font-semibold">
              Sign up
            </Link>
          </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
