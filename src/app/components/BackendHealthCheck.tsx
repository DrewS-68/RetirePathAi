import { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { AlertCircle, CheckCircle, Loader2, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Button } from './ui/button';
import { Card } from './ui/card';

export function BackendHealthCheck() {
  const [status, setStatus] = useState<'checking' | 'healthy' | 'error'>('checking');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [serverVersion, setServerVersion] = useState<string>('');

  const checkHealth = async () => {
    setStatus('checking');
    setErrorMessage('');
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/health`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'apikey': publicAnonKey,
            'Authorization': `Bearer ${publicAnonKey}`, // Supabase requires both apikey AND Authorization headers
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const data = await response.json();
      setServerVersion(data.version || 'unknown');
      setStatus('healthy');
    } catch (error) {
      console.error('Backend health check failed:', error);
      setStatus('error');
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        setErrorMessage('Cannot connect to backend server. The Edge Function may not be deployed or is unavailable.');
      } else {
        setErrorMessage(error instanceof Error ? error.message : 'Unknown error occurred');
      }
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <Card className="p-6">
      <h3 className="mb-4">Backend Status</h3>
      
      {status === 'checking' && (
        <Alert>
          <Loader2 className="size-4 animate-spin" />
          <AlertTitle>Checking Backend...</AlertTitle>
          <AlertDescription>
            Connecting to Edge Function server...
          </AlertDescription>
        </Alert>
      )}

      {status === 'healthy' && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="size-4 text-green-600" />
          <AlertTitle className="text-green-800">Backend Online</AlertTitle>
          <AlertDescription className="text-green-700">
            Server is responding normally. Version: {serverVersion}
            <br />
            <span className="text-xs text-green-600 mt-1 block">
              Endpoint: https://{projectId}.supabase.co/functions/v1/make-server-3bba8be8/
            </span>
          </AlertDescription>
        </Alert>
      )}

      {status === 'error' && (
        <>
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertTitle>Backend Unavailable</AlertTitle>
            <AlertDescription>
              {errorMessage}
            </AlertDescription>
          </Alert>

          <div className="mt-4 space-y-3">
            <h4 className="text-sm">Troubleshooting Steps:</h4>
            <ol className="text-sm space-y-2 list-decimal list-inside text-muted-foreground">
              <li>Check if the Edge Function is deployed in your Supabase Dashboard</li>
              <li>Navigate to: Dashboard → Edge Functions → "make-server-3bba8be8"</li>
              <li>Verify the function is deployed and not showing errors</li>
              <li>Check the function logs for any startup errors</li>
              <li>If not deployed, deploy from the Supabase CLI or Dashboard</li>
            </ol>

            <div className="pt-3">
              <Button 
                onClick={checkHealth} 
                variant="outline" 
                size="sm"
                className="w-full"
              >
                <RefreshCw className="size-4 mr-2" />
                Retry Connection
              </Button>
            </div>
          </div>
        </>
      )}
    </Card>
  );
}