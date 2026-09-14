import { useState } from 'react';
import { Alert, AlertDescription } from '../ui/alert';
import { Button } from '../ui/button';
import { Lightbulb, X } from 'lucide-react';
import { useOnboarding } from '../../contexts/OnboardingContext';

interface FeatureHintProps {
  id: string;
  title?: string;
  message: string;
  variant?: 'info' | 'tip' | 'warning';
  dismissable?: boolean;
  className?: string;
}

export function FeatureHint({
  id,
  title = '💡 Tip',
  message,
  variant = 'tip',
  dismissable = true,
  className = '',
}: FeatureHintProps) {
  const { shouldShowToolTip, markStepComplete } = useOnboarding();
  const [isVisible, setIsVisible] = useState(shouldShowToolTip(id));

  const handleDismiss = () => {
    setIsVisible(false);
    markStepComplete(id);
  };

  if (!isVisible) return null;

  const variantStyles = {
    info: 'bg-blue-50 border-blue-200 text-blue-900',
    tip: 'bg-purple-50 border-purple-200 text-purple-900',
    warning: 'bg-amber-50 border-amber-200 text-amber-900',
  };

  return (
    <Alert className={`${variantStyles[variant]} ${className}`}>
      <div className="flex items-start gap-3">
        <Lightbulb className="size-5 flex-shrink-0 mt-0.5" />
        <div className="flex-1 space-y-1">
          {title && <div className="font-semibold">{title}</div>}
          <AlertDescription className="text-sm">{message}</AlertDescription>
        </div>
        {dismissable && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-8 w-8 p-0 flex-shrink-0"
          >
            <X className="size-4" />
            <span className="sr-only">Dismiss</span>
          </Button>
        )}
      </div>
    </Alert>
  );
}

interface InlineHintProps {
  children: React.ReactNode;
  hint: string;
  id: string;
}

export function InlineHint({ children, hint, id }: InlineHintProps) {
  const { shouldShowToolTip } = useOnboarding();
  const [showHint, setShowHint] = useState(false);

  if (!shouldShowToolTip(id)) {
    return <>{children}</>;
  }

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setShowHint(true)}
        onMouseLeave={() => setShowHint(false)}
      >
        {children}
      </div>
      {showHint && (
        <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg max-w-xs">
          {hint}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
        </div>
      )}
    </div>
  );
}
