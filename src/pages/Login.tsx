import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useToast } from '../contexts/ToastContext';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Mail, Lock, ArrowRight } from 'lucide-react';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { showToast } = useToast();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsPending(true);
    try {
      const success = await login(email, password);
      if (success) {
        showToast('Successfully logged in!', 'success');
        navigate('/');
      } else {
        showToast('Invalid credentials. Passwords require 8+ characters.', 'error');
      }
    } catch (err) {
      showToast('Authentication failed. Please try again.', 'error');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 text-center">
      <div className="flex flex-col gap-1 text-left">
        <h2 className="text-2xl font-extrabold font-display text-slate-800 dark:text-zinc-50">
          Welcome Back
        </h2>
        <p className="text-sm text-slate-400 dark:text-zinc-500">
          Enter your details below to log in to your account
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
        <Input
          label="Email Address"
          type="email"
          placeholder="name@company.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
          }}
          error={errors.email}
          leftIcon={<Mail className="h-4 w-4" />}
          required
          autoComplete="email"
          autoFocus
        />

        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
            }}
            error={errors.password}
            leftIcon={<Lock className="h-4 w-4" />}
            required
            autoComplete="current-password"
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full justify-center mt-2"
          isLoading={isPending}
        >
          Sign In <ArrowRight className="ml-2 h-4 w-4 shrink-0" />
        </Button>
      </form>

      <p className="text-sm text-slate-500 dark:text-zinc-400">
        Don't have an account?{' '}
        <Link
          to="/signup"
          className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          Create account
        </Link>
      </p>
    </div>
  );
};
export default Login;
