import { LucideIcon } from 'lucide-react';
import { Card } from './card';
import { Button } from './button';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}: EmptyStateProps) {
  return (
    <Card className={`p-12 text-center ${className}`}>
      <div className="flex flex-col items-center gap-4 max-w-md mx-auto">
        {Icon && (
          <div className="size-16 rounded-full bg-muted flex items-center justify-center">
            <Icon className="size-8 text-muted-foreground" />
          </div>
        )}
        <div className="space-y-2">
          <h3 className="text-xl font-semibold">{title}</h3>
          <p className="text-muted-foreground">{description}</p>
        </div>
        {actionLabel && onAction && (
          <Button onClick={onAction} className="mt-2">
            {actionLabel}
          </Button>
        )}
      </div>
    </Card>
  );
}
