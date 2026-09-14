import { Loader2 } from 'lucide-react';
import { Card } from './card';

interface LoadingStateProps {
  message?: string;
  fullScreen?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingState({ 
  message = 'Loading...', 
  fullScreen = false,
  size = 'md' 
}: LoadingStateProps) {
  const sizeClasses = {
    sm: 'size-6',
    md: 'size-12',
    lg: 'size-16',
  };

  const content = (
    <div className="flex flex-col items-center justify-center gap-4">
      <Loader2 className={`${sizeClasses[size]} animate-spin text-blue-600`} />
      <p className="text-muted-foreground text-center">{message}</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {content}
      </div>
    );
  }

  return (
    <Card className="p-8">
      {content}
    </Card>
  );
}

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'size-4',
    md: 'size-6',
    lg: 'size-8',
  };

  return (
    <Loader2 className={`${sizeClasses[size]} animate-spin ${className}`} />
  );
}

interface LoadingOverlayProps {
  message?: string;
  isLoading: boolean;
}

export function LoadingOverlay({ message = 'Processing...', isLoading }: LoadingOverlayProps) {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <Card className="p-8">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="size-12 animate-spin text-blue-600" />
          <p className="text-lg font-medium">{message}</p>
        </div>
      </Card>
    </div>
  );
}
