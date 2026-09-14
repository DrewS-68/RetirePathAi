import { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { CheckCircle2, XCircle, AlertCircle, RefreshCw } from 'lucide-react';

export function BackendStatus() {
  const [status, setStatus] = useState<'checking' | 'online' | 'offline' | 'error'>('checking');
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [version, setVersion] = useState<string>('');

  const checkBackend = async () => {
    setStatus('checking');
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/health`,
        {
          headers: {
            'apikey': publicAnonKey, // Supabase requires both headers
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (data.status === 'ok') {
          setStatus('online');
          setVersion(data.version || 'unknown'); // Store the version
        } else {
          setStatus('error');
        }
      } else {
        setStatus('offline');
      }
    } catch (error: any) {
      // Silently handle fetch errors - this is expected when backend is not deployed
      if (error.name === 'AbortError' || error.message?.includes('fetch')) {
        setStatus('offline');
      } else {
        setStatus('error');
      }
    } finally {
      setLastChecked(new Date());
    }
  };

  useEffect(() => {
    // Only check backend on mount, don't throw errors
    checkBackend().catch(() => {
      // Silently handle any unhandled errors
      setStatus('offline');
    });
  }, []);

  const getStatusIcon = () => {
    switch (status) {
      case 'checking':
        return <RefreshCw className="size-4 animate-spin text-blue-600" />;
      case 'online':
        return <CheckCircle2 className="size-4 text-green-600" />;
      case 'offline':
        return <XCircle className="size-4 text-red-600" />;
      case 'error':
        return <AlertCircle className="size-4 text-orange-600" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'checking':
        return 'Checking backend...';
      case 'online':
        return 'Backend Online';
      case 'offline':
        return 'Backend Offline (using fallback mode)';
      case 'error':
        return 'Backend Error';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'checking':
        return 'bg-blue-50 border-blue-200';
      case 'online':
        return 'bg-green-50 border-green-200';
      case 'offline':
        return 'bg-red-50 border-red-200';
      case 'error':
        return 'bg-orange-50 border-orange-200';
    }
  };

  return (
    <div className={`fixed bottom-4 right-4 p-3 rounded-lg border ${getStatusColor()} shadow-lg z-50 flex items-center gap-2`}>
      {getStatusIcon()}
      <div className="flex flex-col">
        <span className="text-sm font-medium">{getStatusText()}</span>
        {status === 'online' && version ? (
          <span className="text-xs text-gray-500">
            Version: {version}
          </span>
        ) : lastChecked && (
          <span className="text-xs text-gray-500">
            Last checked: {lastChecked.toLocaleTimeString()}
          </span>
        )}
      </div>
      <button
        onClick={checkBackend}
        disabled={status === 'checking'}
        className="ml-2 p-1 hover:bg-white/50 rounded"
        title="Refresh status"
      >
        <RefreshCw className={`size-3 ${status === 'checking' ? 'animate-spin' : ''}`} />
      </button>
    </div>
  );
}