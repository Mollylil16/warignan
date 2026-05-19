import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(err: unknown): State {
    const message = err instanceof Error ? err.message : String(err);
    return { hasError: true, message };
  }

  componentDidCatch(err: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', err, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-black px-6 text-center text-white">
            <p className="text-4xl">⚠</p>
            <h1 className="text-xl font-bold">Une erreur inattendue s'est produite</h1>
            <p className="max-w-md text-sm text-white/60">{this.state.message}</p>
            <button
              className="mt-2 rounded bg-white/10 px-4 py-2 text-sm hover:bg-white/20"
              onClick={() => window.location.reload()}
            >
              Recharger la page
            </button>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
