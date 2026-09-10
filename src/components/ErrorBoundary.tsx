import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('MOIL SMARTMINE Error Boundary caught an exception:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-dark-950 flex items-center justify-center p-6 text-slate-100">
          <div className="glass-panel p-8 rounded-2xl max-w-md w-full border border-red-500/30 text-center space-y-5">
            <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center justify-center mx-auto text-red-400">
              <AlertTriangle size={32} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">System State Exception</h2>
              <p className="text-sm text-slate-400 mt-2">
                An unexpected calculation or rendering error occurred. The application state has been safely isolated.
              </p>
            </div>
            {this.state.error && (
              <div className="bg-dark-900 p-3 rounded-lg text-xs font-mono text-red-400 overflow-x-auto text-left max-h-32">
                {this.state.error.message}
              </div>
            )}
            <button
              onClick={this.handleReload}
              className="w-full py-3 px-4 bg-brand-500 hover:bg-brand-600 text-dark-950 font-semibold rounded-xl transition flex items-center justify-center gap-2"
            >
              <RefreshCw size={18} />
              Restore Operational Session
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
