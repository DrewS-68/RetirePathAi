import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface LazyComponentWrapperProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

export function LazyComponentWrapper({ 
  title, 
  icon, 
  children, 
  defaultExpanded = false 
}: LazyComponentWrapperProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <Card>
      <CardHeader 
        className="cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <CardTitle className="flex items-center gap-2 text-lg">
          {isExpanded ? (
            <ChevronDown className="size-5 text-gray-500" />
          ) : (
            <ChevronRight className="size-5 text-gray-500" />
          )}
          {icon}
          {title}
          <span className="text-xs text-gray-400 ml-auto">
            {isExpanded ? 'Click to collapse' : 'Click to expand'}
          </span>
        </CardTitle>
      </CardHeader>
      
      {isExpanded && (
        <CardContent>
          {children}
        </CardContent>
      )}
    </Card>
  );
}
