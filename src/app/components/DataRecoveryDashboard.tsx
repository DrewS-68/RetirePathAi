import { useState, useEffect, useRef } from 'react';
import { resilienceManager } from '../utils/dataResilience';
import { AlertTriangle, CheckCircle, XCircle, Download, RefreshCw, Trash2, Clock, Database, Activity } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface RecoveryProps {
  accessToken: string | null;
}

export function DataRecoveryDashboard({ accessToken }: RecoveryProps) {
  const [pendingRecoveries, setPendingRecoveries] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [healthCheck, setHealthCheck] = useState<any>(null);
  const [recovering, setRecovering] = useState<Set<string>>(new Set());
  const [logs, setLogs] = useState<string[]>([]);

  // Use ref to track component mount status
  const isMountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    isMountedRef.current = true;
    
    // Defer initial load to avoid iframe issues
    const loadTimer = setTimeout(() => {
      if (isMountedRef.current) {
        loadRecoveryData();
        performHealthCheck();
      }
    }, 500);

    return () => {
      isMountedRef.current = false;
      clearTimeout(loadTimer);
      
      // Abort any ongoing requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [accessToken]);

  const loadRecoveryData = () => {
    if (!isMountedRef.current) return;
    
    try {
      const recoveries = resilienceManager.getPendingRecoveries();
      if (isMountedRef.current) {
        setPendingRecoveries(recoveries);
      }
      
      const statsData = resilienceManager.getStats();
      if (isMountedRef.current) {
        setStats(statsData);
      }
      
      if (recoveries.length > 0) {
        addLog(`⚠️ Found ${recoveries.length} pending/failed backups`);
      } else {
        addLog('✅ No pending recoveries found');
      }
    } catch (error: any) {
      console.error('Error loading recovery data:', error);
      if (isMountedRef.current) {
        addLog(`❌ Error loading data: ${error.message}`);
      }
    }
  };

  const performHealthCheck = async () => {
    if (!isMountedRef.current) return;
    
    try {
      const health = await resilienceManager.healthCheck(accessToken);
      if (isMountedRef.current) {
        setHealthCheck(health);
        
        if (health.healthy) {
          addLog('✅ System health check passed');
        } else {
          addLog(`❌ Health check issues: ${health.issues.join(', ')}`);
        }
      }
    } catch (error: any) {
      console.error('Health check error:', error);
      if (isMountedRef.current) {
        addLog(`❌ Health check failed: ${error.message}`);
      }
    }
  };

  const addLog = (message: string) => {
    if (!isMountedRef.current) return;
    
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${message}`, ...prev.slice(0, 49)]);
  };

  const recoverBackup = async (backup: any) => {
    if (!isMountedRef.current) return;
    
    if (!accessToken) {
      addLog(`❌ Cannot recover ${backup.id}: No access token`);
      return;
    }

    if (recovering.has(backup.id)) {
      return; // Already recovering
    }

    setRecovering(prev => new Set(prev).add(backup.id));
    addLog(`🔄 Starting recovery for ${backup.operation} (${backup.id})`);

    // Create abort controller for this operation
    const recoveryAbortController = new AbortController();

    try {
      // Determine the save function based on operation type
      let saveFn: (data: any) => Promise<any>;

      if (backup.operation.includes('website')) {
        // Website save function
        saveFn = async (data: any) => {
          if (!isMountedRef.current || recoveryAbortController.signal.aborted) {
            throw new Error('Operation aborted');
          }
          
          const websites = Array.isArray(data) ? data : [data];
          const supabase = createClient(
            `https://${projectId}.supabase.co`,
            publicAnonKey,
            {
              realtime: {
                params: {
                  eventsPerSecond: 0, // Disable realtime
                },
              },
            }
          );

          for (const site of websites) {
            if (!isMountedRef.current || recoveryAbortController.signal.aborted) {
              throw new Error('Operation aborted');
            }
            
            const response = await fetch(
              `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/vic-villages/website`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify(site),
                signal: recoveryAbortController.signal,
              }
            );

            if (!response.ok) {
              const error = await response.text();
              throw new Error(`Failed to save website: ${error}`);
            }
          }
        };
      } else if (backup.operation.includes('village')) {
        // Village save function
        saveFn = async (data: any) => {
          if (!isMountedRef.current || recoveryAbortController.signal.aborted) {
            throw new Error('Operation aborted');
          }
          
          const villages = Array.isArray(data) ? data : [data];
          
          for (const village of villages) {
            if (!isMountedRef.current || recoveryAbortController.signal.aborted) {
              throw new Error('Operation aborted');
            }
            
            const response = await fetch(
              `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/villages`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify(village),
                signal: recoveryAbortController.signal,
              }
            );

            if (!response.ok) {
              const error = await response.text();
              throw new Error(`Failed to save village: ${error}`);
            }
          }
        };
      } else {
        throw new Error(`Unknown operation type: ${backup.operation}`);
      }

      // Attempt recovery
      const result = await resilienceManager.recoverBackup(backup.id, saveFn);

      if (!isMountedRef.current) return;

      if (result.success) {
        addLog(`✅ Successfully recovered ${backup.id}`);
      } else {
        addLog(`❌ Recovery failed for ${backup.id}: ${result.error}`);
      }

      // Reload data
      loadRecoveryData();

    } catch (error: any) {
      if (error.name === 'AbortError' || error.message === 'Operation aborted') {
        console.log('🛑 Recovery aborted');
        return;
      }
      
      if (isMountedRef.current) {
        addLog(`❌ Recovery error for ${backup.id}: ${error.message}`);
      }
    } finally {
      if (isMountedRef.current) {
        setRecovering(prev => {
          const next = new Set(prev);
          next.delete(backup.id);
          return next;
        });
      }
    }
  };

  const recoverAll = async () => {
    if (!isMountedRef.current) return;
    
    addLog(`🔄 Starting recovery of all ${pendingRecoveries.length} backups`);
    
    for (const backup of pendingRecoveries) {
      if (!isMountedRef.current) break;
      await recoverBackup(backup);
    }
    
    if (isMountedRef.current) {
      addLog('✅ Bulk recovery completed');
    }
  };

  const exportBackup = (backupId: string) => {
    if (!isMountedRef.current) return;
    
    try {
      resilienceManager.exportBackup(backupId);
      addLog(`📥 Exported backup ${backupId}`);
    } catch (error: any) {
      addLog(`❌ Export failed: ${error.message}`);
    }
  };

  const exportAll = () => {
    if (!isMountedRef.current) return;
    
    try {
      resilienceManager.exportAllPending();
      addLog(`📥 Exported all pending backups`);
    } catch (error: any) {
      addLog(`❌ Export failed: ${error.message}`);
    }
  };

  const deleteBackup = (backupId: string) => {
    if (!isMountedRef.current) return;
    
    if (confirm('Are you sure you want to delete this backup? This cannot be undone.')) {
      try {
        resilienceManager.deleteBackup(backupId);
        addLog(`🗑️ Deleted backup ${backupId}`);
        loadRecoveryData();
      } catch (error: any) {
        addLog(`❌ Delete failed: ${error.message}`);
      }
    }
  };

  const cleanupOldBackups = () => {
    if (!isMountedRef.current) return;
    
    try {
      const count = resilienceManager.cleanupOldBackups(7);
      addLog(`🧹 Cleaned up ${count} old saved backups`);
      loadRecoveryData();
    } catch (error: any) {
      addLog(`❌ Cleanup failed: ${error.message}`);
    }
  };

  const exportAuditTrail = () => {
    if (!isMountedRef.current) return;
    
    try {
      resilienceManager.exportAuditTrail();
      addLog('📥 Exported audit trail');
    } catch (error: any) {
      addLog(`❌ Export failed: ${error.message}`);
    }
  };

  const formatTimestamp = (ts: number) => {
    const date = new Date(ts);
    const now = Date.now();
    const diff = now - ts;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleString();
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (!stats || !healthCheck) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center gap-3 text-gray-600">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Loading recovery dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center gap-3 mb-4">
            <Database className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold">Data Resilience Dashboard</h1>
              <p className="text-gray-600">Foolproof data protection and recovery system</p>
            </div>
          </div>

          {/* Health Check */}
          <div className={`p-4 rounded-lg border-2 ${
            healthCheck.healthy 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center gap-2">
              {healthCheck.healthy ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-600" />
              )}
              <span className="font-semibold">
                {healthCheck.healthy ? 'System Healthy' : 'System Issues Detected'}
              </span>
            </div>
            {!healthCheck.healthy && (
              <ul className="mt-2 ml-7 space-y-1">
                {healthCheck.issues.map((issue: string, i: number) => (
                  <li key={i} className="text-sm text-red-700">• {issue}</li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Saved</p>
                <p className="text-3xl font-bold text-green-600">{stats.saved}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Failed</p>
                <p className="text-3xl font-bold text-red-600">{stats.failed}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Storage Used</p>
                <p className="text-3xl font-bold text-blue-600">
                  {stats.storageUsage.percentage}%
                </p>
                <p className="text-xs text-gray-500">
                  {formatBytes(stats.storageUsage.used)}
                </p>
              </div>
              <Activity className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4">Actions</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={recoverAll}
              disabled={pendingRecoveries.length === 0 || !accessToken}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              <RefreshCw className="w-4 h-4" />
              Recover All ({pendingRecoveries.length})
            </button>

            <button
              onClick={exportAll}
              disabled={pendingRecoveries.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              Export All Pending
            </button>

            <button
              onClick={cleanupOldBackups}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              <Trash2 className="w-4 h-4" />
              Cleanup Old Backups
            </button>

            <button
              onClick={exportAuditTrail}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <Download className="w-4 h-4" />
              Export Audit Trail
            </button>

            <button
              onClick={() => {
                loadRecoveryData();
                performHealthCheck();
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Pending Recoveries */}
        {pendingRecoveries.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-4">
              Pending/Failed Backups ({pendingRecoveries.length})
            </h2>
            
            {!accessToken && (
              <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800">
                  ⚠️ You must be logged in to recover data
                </p>
              </div>
            )}

            <div className="space-y-3">
              {pendingRecoveries.map((backup) => (
                <div
                  key={backup.id}
                  className={`p-4 rounded-lg border-2 ${
                    backup.status === 'failed'
                      ? 'bg-red-50 border-red-200'
                      : 'bg-yellow-50 border-yellow-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {backup.status === 'failed' ? (
                          <XCircle className="w-5 h-5 text-red-600" />
                        ) : (
                          <Clock className="w-5 h-5 text-yellow-600" />
                        )}
                        <span className="font-semibold">{backup.operation}</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          backup.status === 'failed'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {backup.status}
                        </span>
                      </div>

                      <div className="text-sm text-gray-600 space-y-1 ml-7">
                        <p>
                          <strong>Time:</strong> {formatTimestamp(backup.timestamp)}
                        </p>
                        <p>
                          <strong>Items:</strong> {Array.isArray(backup.data) ? backup.data.length : 1}
                        </p>
                        <p>
                          <strong>Attempts:</strong> {backup.attempts}
                        </p>
                        {backup.lastError && (
                          <p className="text-red-600">
                            <strong>Error:</strong> {backup.lastError}
                          </p>
                        )}
                        {backup.metadata && Object.keys(backup.metadata).length > 0 && (
                          <p>
                            <strong>Metadata:</strong> {JSON.stringify(backup.metadata)}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => recoverBackup(backup)}
                        disabled={recovering.has(backup.id) || !accessToken}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-1"
                      >
                        {recovering.has(backup.id) ? (
                          <>
                            <RefreshCw className="w-3 h-3 animate-spin" />
                            Recovering...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="w-3 h-3" />
                            Recover
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => exportBackup(backup.id)}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 flex items-center gap-1"
                      >
                        <Download className="w-3 h-3" />
                        Export
                      </button>

                      <button
                        onClick={() => deleteBackup(backup.id)}
                        disabled={recovering.has(backup.id)}
                        className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Activity Log */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4">Activity Log</h2>
          <div className="bg-gray-900 text-gray-100 rounded-lg p-4 font-mono text-sm max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-400">No activity yet...</p>
            ) : (
              logs.map((log, i) => (
                <div key={i} className="mb-1">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}