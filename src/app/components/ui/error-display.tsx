import { AlertCircle, AlertTriangle, Info, RefreshCw, X } from 'lucide-react';
import { Alert, AlertDescription } from './alert';
import { Button } from './button';
import { ErrorState } from '../../utils/error-handling';

interface ErrorDisplayProps {
  error: ErrorState | null;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export function ErrorDisplay({ error, onRetry, onDismiss, className }: ErrorDisplayProps) {
  if (!error) return null;

  const getIcon = () => {
    switch (error.type) {
      case 'error':
        return <AlertCircle className="size-5" />;
      case 'warning':
        return <AlertTriangle className="size-5" />;
      case 'info':
        return <Info className="size-5" />;
      default:
        return <AlertCircle className="size-5" />;
    }
  };

  const getVariant = () => {
    switch (error.type) {
      case 'error':
        return 'destructive';
      case 'warning':
        return 'default';
      case 'info':
        return 'default';
      default:
        return 'destructive';
    }
  };

  return (
    <Alert variant={getVariant()} className={className}>
      <div className="flex items-start gap-3">
        {getIcon()}
        <div className="flex-1">
          <AlertDescription>{error.message}</AlertDescription>
          {error.code && (
            <p className="text-xs text-muted-foreground mt-1">
              Error code: {error.code}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {error.retryable && onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="h-8"
            >
              <RefreshCw className="size-3 mr-1" />
              Retry
            </Button>
          )}
          {onDismiss && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="h-8 w-8 p-0"
            >
              <X className="size-4" />
              <span className="sr-only">Dismiss</span>
            </Button>
          )}
        </div>
      </div>
    </Alert>
  );
}
