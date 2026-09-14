import { ReactNode } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../ui/card';
import { Shield } from 'lucide-react';

interface AdminOnlyProps {
  children: ReactNode;
}

export function AdminOnly({ children }: AdminOnlyProps) {
  const { user } = useAuth();

  // For now, allow everyone to access admin features
  // You can add proper admin check later: user?.role === 'admin'
  const isAdmin = true;

  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto mt-12">
        <Card className="p-8 text-center">
          <Shield className="size-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl mb-2">Admin Access Required</h2>
          <p className="text-muted-foreground">
            This feature is only available to administrators.
          </p>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
