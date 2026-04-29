import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(error: unknown): State {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { hasError: true, message };
  }

  componentDidCatch(error: unknown, info: { componentStack: string }) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8 text-center">
          <div className="text-4xl">⚠️</div>
          <h1 className="text-xl font-semibold text-slate-700">Something went wrong</h1>
          <p className="text-slate-500 max-w-md">
            An unexpected error occurred on this page. Try refreshing — if the problem persists, contact support.
          </p>
          <button
            onClick={() => this.setState({ hasError: false, message: '' })}
            className="mt-2 px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 transition"
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
