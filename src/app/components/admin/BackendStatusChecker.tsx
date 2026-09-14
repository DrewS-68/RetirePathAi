import React, { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { CheckCircle, XCircle, Loader, RefreshCw, AlertCircle } from 'lucide-react';

export function BackendStatusChecker() {
  const [status, setStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [version, setVersion] = useState('');
  const [error, setError] = useState('');

  const checkBackend = async () => {
    setStatus('checking');
    setError('');
    
    try {
      console.log('🔍 Checking backend health at:', `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/health`);
      
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

      console.log('📡 Backend response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Backend error response:', errorText);
        throw new Error(`Server returned ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Backend response data:', data);
      setVersion(data.version || 'unknown');
      setStatus('online');
    } catch (err) {
      console.error('❌ Backend check failed:', err);
      setError(err.message || 'Unknown error');
      setStatus('offline');
    }
  };

  useEffect(() => {
    checkBackend();
    // Check every 10 seconds
    const interval = setInterval(checkBackend, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white border rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {status === 'checking' && (
            <>
              <Loader className="w-5 h-5 animate-spin text-gray-400" />
              <span className="text-sm text-gray-600">Checking backend...</span>
            </>
          )}
          
          {status === 'online' && (
            <>
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <span className="text-sm text-green-700">Backend Online</span>
                <p className="text-xs text-gray-500">Version: {version}</p>
              </div>
            </>
          )}
          
          {status === 'offline' && (
            <>
              <XCircle className="w-5 h-5 text-red-600" />
              <div>
                <span className="text-sm text-red-700">Backend Offline</span>
                <p className="text-xs text-red-600">{error}</p>
              </div>
            </>
          )}
        </div>
        
        <button
          onClick={checkBackend}
          className="flex items-center gap-2 px-3 py-1.5 text-sm border rounded hover:bg-gray-50"
          disabled={status === 'checking'}
        >
          <RefreshCw className={`w-4 h-4 ${status === 'checking' ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>
      
      {status === 'offline' && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="mb-2"><strong>Backend is starting up or needs deployment</strong></p>
              <ol className="list-decimal list-inside space-y-1 text-xs">
                <li>Wait 30-60 seconds for the Edge Function to wake up</li>
                <li>Check Supabase Dashboard → Edge Functions</li>
                <li>Look for "make-server-3bba8be8" function</li>
                <li>Click "Refresh" button above to retry</li>
              </ol>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}