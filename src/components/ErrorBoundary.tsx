import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
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
    console.error('[Scholar Owl ErrorBoundary] Uncaught UI error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div 
          id="scholar-owl-error-fallback"
          className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4"
          role="alert"
          aria-live="assertive"
        >
          <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-rose-100 dark:border-rose-900/30 p-6 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center text-rose-500">
              <AlertCircle className="w-8 h-8" />
            </div>
            
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                {this.props.fallbackTitle || 'Đã xảy ra sự cố hiển thị'}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Cú Scholar Owl đã ghi nhận sự cố để bảo vệ phiên làm việc của bạn. Dữ liệu học vụ của bạn vẫn an toàn trên hệ thống.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl text-left overflow-x-auto text-xs font-mono text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                {this.state.error.message || 'Lỗi không xác định'}
              </div>
            )}

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                id="btn-retry-error-boundary"
                onClick={this.handleReset}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-purple hover:bg-brand-purple-hover text-white rounded-xl font-medium text-sm transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                Tải lại trang
              </button>
              <button
                id="btn-home-error-boundary"
                onClick={() => window.location.href = '/'}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl font-medium text-sm transition-all active:scale-95 cursor-pointer"
              >
                <Home className="w-4 h-4" />
                Về trang chủ
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
