import React from 'react';
import Logo from './ui/Logo';


class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-6">
        <div className="mb-10">
          <Logo size="md" />
        </div>

        <div className="w-24 h-24 rounded-3xl bg-red-50 flex items-center justify-center mb-6"
          style={{ boxShadow: '0 0 0 8px #fff1f2' }}>
          <span className="text-5xl select-none">⚠️</span>
        </div>

        <h1 className="font-display text-2xl font-extrabold text-slate-900 mb-2 text-center">
          Something went wrong
        </h1>
        <p className="text-slate-500 text-sm text-center max-w-xs mb-8 leading-relaxed">
          An unexpected error occurred. Please reload the app.
        </p>

        {/* Show error in dev only */}
        {import.meta.env.DEV && this.state.error && (
          <div className="w-full max-w-xs mb-6 p-3 bg-red-50 rounded-xl border border-red-100">
            <p className="text-xs text-red-600 font-mono break-all">
              {this.state.error.message}
            </p>
          </div>
        )}

        <button onClick={this.handleReload}
          className="btn-primary w-full max-w-xs py-3" style={{ borderRadius: '12px' }}>
          Reload App
        </button>
      </div>
    );
  }
}

export default ErrorBoundary;