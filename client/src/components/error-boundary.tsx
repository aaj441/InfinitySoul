/**
 * Error boundary component
 * Catches React errors and displays user-friendly error page
 */

import { Component, ReactNode, ErrorInfo } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <div className="bg-card border border-border rounded-lg p-8 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="w-6 h-6 text-destructive" />
                <h1 className="text-xl font-semibold text-foreground">
                  Something went wrong
                </h1>
              </div>

              <p className="text-muted-foreground mb-6">
                An unexpected error occurred while rendering this page.
                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <div className="mt-4 p-3 bg-muted rounded text-xs font-mono text-destructive overflow-auto max-h-32">
                    {this.state.error.message}
                  </div>
                )}
              </p>

              <div className="flex gap-3">
                <Button onClick={this.handleReset} variant="default" className="flex-1">
                  Go Home
                </Button>
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="flex-1"
                >
                  Retry
                </Button>
              </div>

              {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                <details className="mt-6 text-xs">
                  <summary className="cursor-pointer font-semibold text-muted-foreground hover:text-foreground">
                    Error Details (dev only)
                  </summary>
                  <pre className="mt-2 p-2 bg-muted rounded overflow-auto max-h-40 text-destructive">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
