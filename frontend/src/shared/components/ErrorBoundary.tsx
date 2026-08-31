import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an unhandled error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  private handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/";
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] w-full flex flex-col items-center justify-center p-8 text-center bg-[#FAF7F2] text-[#111111] font-body rounded-3xl border border-[#E8E2D9] my-6 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-[#E8826B]/15 text-[#E8826B] border border-[#E8826B]/30 flex items-center justify-center mb-5 shadow-xs">
            <AlertTriangle size={32} />
          </div>
          <h2 className="text-2xl font-extrabold font-display text-[#111111] mb-2">
            Something unexpected occurred
          </h2>
          <p className="text-sm text-[#706B65] max-w-md mb-6 leading-relaxed">
            We encountered a temporary rendering issue. Your session data and booking details are safe.
          </p>

          {this.state.error && (
            <div className="w-full max-w-lg mb-6 p-4 rounded-xl bg-white border border-[#E8E2D9] text-left overflow-auto max-h-40 font-mono text-xs text-red-600">
              {this.state.error.toString()}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 bg-[#111111] hover:bg-black text-white font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-full shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <RefreshCw size={14} />
              <span>Reload Section</span>
            </button>
            <button
              onClick={this.handleGoHome}
              className="inline-flex items-center gap-2 bg-white hover:bg-[#F4EFEA] text-[#111111] border border-[#E8E2D9] font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-full shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <Home size={14} />
              <span>Return Home</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
