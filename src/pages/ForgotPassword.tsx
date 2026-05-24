import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Mail, ArrowLeft, Send } from 'lucide-react';

export const ForgotPassword: React.FC = () => {
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsPending(true);
    // Simulate reset request latency
    setTimeout(() => {
      setIsPending(false);
      setIsSent(true);
      showToast('Password reset link sent to your email!', 'success');
    }, 1000);
  };

  return (
    <div className="flex flex-col gap-6 text-center">
      <div className="flex flex-col gap-1 text-left">
        <h2 className="text-2xl font-extrabold font-display text-slate-800 dark:text-zinc-50">
          Reset Password
        </h2>
        <p className="text-sm text-slate-400 dark:text-zinc-500">
          We will email you a secure link to reset your account password
        </p>
      </div>

      {!isSent ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
          <Input
            label="Email Address"
            type="email"
            placeholder="name@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="h-4 w-4" />}
            required
            autoFocus
          />

          <Button
            type="submit"
            variant="primary"
            className="w-full justify-center mt-2"
            isLoading={isPending}
          >
            Send Reset Link <Send className="ml-2 h-4 w-4 shrink-0" />
          </Button>
        </form>
      ) : (
        <div className="p-4 rounded-xl border border-indigo-500/10 bg-indigo-50/30 dark:bg-indigo-950/15 text-left text-sm text-slate-600 dark:text-zinc-300">
          We've sent a password reset link to <strong className="text-slate-800 dark:text-white font-semibold">{email}</strong>. Please check your inbox and click the link to configure your password.
        </div>
      )}

      <p className="text-sm text-slate-500 dark:text-zinc-400 flex items-center justify-center gap-1.5">
        <ArrowLeft className="h-4 w-4" />
        <Link
          to="/login"
          className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          Back to sign in
        </Link>
      </p>
    </div>
  );
};
export default ForgotPassword;
