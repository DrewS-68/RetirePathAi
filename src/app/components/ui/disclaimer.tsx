import { AlertCircle, Info } from 'lucide-react';
import { Alert, AlertDescription } from './alert';

interface DisclaimerProps {
  variant?: 'default' | 'warning' | 'info';
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Disclaimer({ 
  variant = 'default', 
  title, 
  children, 
  className = '' 
}: DisclaimerProps) {
  const variantStyles = {
    default: 'border-amber-200 bg-amber-50 text-amber-900',
    warning: 'border-red-200 bg-red-50 text-red-900',
    info: 'border-blue-200 bg-blue-50 text-blue-900',
  };

  const Icon = variant === 'info' ? Info : AlertCircle;

  return (
    <Alert className={`${variantStyles[variant]} ${className}`}>
      <Icon className="h-4 w-4" />
      {title && <div className="font-semibold mb-1">{title}</div>}
      <AlertDescription className="text-sm leading-relaxed">
        {children}
      </AlertDescription>
    </Alert>
  );
}
