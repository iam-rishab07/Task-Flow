import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useToast } from '../contexts/ToastContext';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';

export const Signup: React.FC = () => {
  const navigate = useNavigate();
  const { signup } = useAuthStore();
  const { showToast } = useToast();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});

  const validate = () => {
    const newErrors: { name?: string; email?: string; password?: string } = {};
    if (!name) {
      newErrors.name = 'Full name is required';
    }

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
      const success = await signup(name, email, password);
      if (success) {
        showToast('Successfully registered account!', 'success');
        navigate('/');
      } else {
        showToast('Signup failed. Ensure credentials match patterns.', 'error');
      }
    } catch (err) {
      showToast('Registration encountered an error. Please try again.', 'error');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 text-center">
      <div className="flex flex-col gap-1 text-left">
        <h2 className="text-2xl font-extrabold font-display text-slate-800 dark:text-zinc-50">
          Create Account
        </h2>
        <p className="text-sm text-slate-400 dark:text-zinc-500">
          Get started with your free workspace today
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
        <Input
          label="Full Name"
          type="text"
          placeholder="John Doe"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
          }}
          error={errors.name}
          leftIcon={<User className="h-4 w-4" />}
          required
          autoFocus
        />

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
        />

        <Input
          label="Password"
          type="password"
          placeholder="At least 8 characters"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
          }}
          error={errors.password}
          leftIcon={<Lock className="h-4 w-4" />}
          required
          autoComplete="new-password"
        />

        <Button
          type="submit"
          variant="primary"
          className="w-full justify-center mt-2"
          isLoading={isPending}
        >
          Get Started <ArrowRight className="ml-2 h-4 w-4 shrink-0" />
        </Button>
      </form>

      <p className="text-sm text-slate-500 dark:text-zinc-400">
        Already have an account?{' '}
        <Link
          to="/login"
          className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
};
export default Signup;
