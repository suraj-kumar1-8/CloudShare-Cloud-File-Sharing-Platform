import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CloudLightning, Eye, EyeOff, Mail, Lock, User, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { AnimatedBlob, PasswordStrengthIndicator } from '../components/AuthComponents';
import { validateSignupForm, checkPasswordStrength } from '../utils/authValidation';
import InputField from '../components/InputField';
import GradientButton from '../components/GradientButton';

export default function Signup() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    
    if (name === 'password') {
      setPasswordStrength(checkPasswordStrength(value));
    }
    
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validateSignupForm(form);
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setLoading(true);
    try {
      await register({ 
        name: form.name.trim(), 
        email: form.email.trim(), 
        password: form.password 
      });
      toast.success('Account created! Welcome aboard 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleClick = () => {
    toast('Google sign-up is coming soon.', { icon: 'ℹ️' });
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
            <p className="text-white/60 mt-1">Join thousands sharing securely</p>
          </div>
        </div>

        {/* Signup Card */}
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
              className="text-center py-2 rounded-xl font-semibold bg-transparent border border-white/10 text-white/70 hover:text-white hover:bg-white/5 transition-colors"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="text-center py-2 rounded-xl font-semibold bg-white/10 border border-white/10 text-white"
            >
              Register
            </Link>
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">Create Account</h2>
          <p className="text-white/60 text-sm mb-6">Sign up to get started with CloudShare</p>

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
              <span className="bg-slate-950/50 px-2 text-white/55">OR sign up with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <InputField
              label="Full name"
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Your name"
              icon={User}
              error={errors.name}
            />

            {/* Email */}
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

            {/* Password */}
            <div>
              <InputField
                label="Password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Create a strong password"
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
              
              {/* Password Strength Indicator */}
              {form.password && passwordStrength && (
                <div className="mt-3 p-3 bg-slate-950/40 rounded-xl border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-white/70">Password Strength</span>
                    <span className={`text-xs font-semibold ${
                      passwordStrength.level === 'weak' && 'text-red-400' ||
                      passwordStrength.level === 'fair' && 'text-yellow-400' ||
                      passwordStrength.level === 'good' && 'text-blue-400' ||
                      passwordStrength.level === 'strong' && 'text-green-400'
                    }`}>
                      {passwordStrength.level.charAt(0).toUpperCase() + passwordStrength.level.slice(1)}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        passwordStrength.level === 'weak' && 'bg-red-500 w-1/4' ||
                        passwordStrength.level === 'fair' && 'bg-yellow-500 w-1/2' ||
                        passwordStrength.level === 'good' && 'bg-blue-500 w-3/4' ||
                        passwordStrength.level === 'strong' && 'bg-green-500 w-full'
                      }`}
                    />
                  </div>
                  <div className="mt-2 space-y-1 text-xs text-white/60">
                    <div className="flex items-center gap-2">
                      {form.password.length >= 8 ? <Check size={14} className="text-green-400" /> : <div className="w-3.5 h-3.5" />}
                      At least 8 characters
                    </div>
                    <div className="flex items-center gap-2">
                      {/[A-Z]/.test(form.password) && /[a-z]/.test(form.password) ? <Check size={14} className="text-green-400" /> : <div className="w-3.5 h-3.5" />}
                      Uppercase & lowercase letters
                    </div>
                    <div className="flex items-center gap-2">
                      {/[0-9]/.test(form.password) ? <Check size={14} className="text-green-400" /> : <div className="w-3.5 h-3.5" />}
                      At least one number
                    </div>
                    <div className="flex items-center gap-2">
                      {/[^A-Za-z0-9]/.test(form.password) ? <Check size={14} className="text-green-400" /> : <div className="w-3.5 h-3.5" />}
                      Special character (!@#$, etc)
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <InputField
              label="Confirm password"
              type={showConfirm ? 'text' : 'password'}
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Repeat your password"
              icon={Lock}
              error={errors.confirmPassword}
              right={(
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="text-white/40 hover:text-white/70 transition-colors"
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                >
                  {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              )}
            />

            {/* Submit Button */}
            <GradientButton
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-2xl font-semibold"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Create account
                  <Check size={18} />
                </>
              )}
            </GradientButton>
          </form>

          {/* Terms */}
          <p className="mt-4 text-xs text-white/55 text-center">
            By signing up, you agree to our{' '}
            <Link to="/terms" className="text-blue-400 hover:text-blue-300">Terms of Service</Link>
          </p>
          <p className="mt-6 text-center text-white/60">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-400 hover:text-blue-300 font-semibold">
              Sign in
            </Link>
          </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

