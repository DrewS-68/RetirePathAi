import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  fullPage?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const errorUI = (
        <Card className="p-8 border-red-200 bg-red-50 max-w-2xl mx-auto">
          <div className="text-center mb-6">
            <AlertCircle className="size-16 mx-auto text-red-600 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Oops! Something went wrong</h2>
            <p className="text-muted-foreground">
              We're sorry for the inconvenience. An unexpected error occurred.
            </p>
          </div>

          <Alert variant="destructive" className="mb-4">
            <AlertDescription>
              <div className="font-semibold mb-2">Error Details:</div>
              <div className="text-sm">
                {this.state.error?.message || 'An unexpected error occurred'}
              </div>
            </AlertDescription>
          </Alert>

          <div className="flex gap-3 justify-center">
            <Button
              variant="outline"
              onClick={this.handleReset}
            >
              <RefreshCw className="size-4 mr-2" />
              Try Again
            </Button>
            <Button onClick={this.handleGoHome}>
              <Home className="size-4 mr-2" />
              Go to Home
            </Button>
          </div>
          
          {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
            <details className="mt-6 text-xs">
              <summary className="cursor-pointer font-semibold mb-2 text-center">
                Technical Details (Development Only)
              </summary>
              <pre className="bg-white p-3 rounded border overflow-auto max-h-64 text-left">
                {this.state.error?.stack}
                {'\n\n'}
                {this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
        </Card>
      );

      if (this.props.fullPage) {
        return (
          <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-white to-purple-50">
            {errorUI}
          </div>
        );
      }

      return errorUI;
    }

    return this.props.children;
  }
}