import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackDescription?: string;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
    this.handleReset = this.handleReset.bind(this);
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary capturou um erro:', error, errorInfo);
  }

  handleReset() {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[300px] flex items-center justify-center p-6 bg-slate-50 border border-red-200 rounded-3xl m-4 shadow-sm">
          <div className="max-w-md w-full text-center space-y-4">
            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <AlertTriangle size={28} />
            </div>
            
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-serif">
                {this.props.fallbackTitle || 'Ocorreu uma falha temporária neste módulo'}
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                {this.props.fallbackDescription || 'O sistema interceptou um erro inesperado e impediu o fechamento da tela.'}
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-red-50/80 rounded-xl text-left border border-red-100 overflow-x-auto">
                <p className="text-xs font-mono text-red-700 break-words">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={this.handleReset}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-sm flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
              >
                <RefreshCw size={15} />
                <span>Tentar Novamente</span>
              </button>
              
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-xl text-sm flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Home size={15} />
                <span>Recarregar Página</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
