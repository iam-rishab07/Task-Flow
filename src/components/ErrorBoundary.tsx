import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { Button } from './Button';
import { AlertCircle } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in boundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-zinc-950 text-center">
          <div className="glass-panel max-w-md w-full p-8 rounded-2xl shadow-xl flex flex-col items-center gap-6 animate-slide-in">
            <div className="h-12 w-12 rounded-full bg-rose-50 dark:bg-rose-950/20 flex items-center justify-center border border-rose-100 dark:border-rose-900/30">
              <AlertCircle className="h-6 w-6 text-rose-600 dark:text-rose-500" />
            </div>
            
            <div className="flex flex-col gap-2">
              <h2 className="text-xl font-bold font-display text-slate-800 dark:text-zinc-100">
                Something went wrong
              </h2>
              <p className="text-sm text-slate-500 dark:text-zinc-400">
                An unexpected runtime error has occurred. Our engineers have been notified.
              </p>
              {this.state.error && (
                <div className="mt-2 p-3 bg-slate-100 dark:bg-zinc-900 rounded-lg text-left text-xs font-mono text-slate-600 dark:text-zinc-400 overflow-x-auto max-w-full">
                  {this.state.error.message}
                </div>
              )}
            </div>

            <Button
              variant="primary"
              onClick={this.handleReset}
              className="w-full justify-center"
            >
              Reload Page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
