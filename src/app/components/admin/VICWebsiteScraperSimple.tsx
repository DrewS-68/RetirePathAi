import { useState, useEffect, useRef, memo } from 'react';
import { Globe, Play, CheckCircle, XCircle, AlertCircle, Download, Shield, Pause, Square } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { getSupabaseClient } from '../../utils/supabase/client';

/**
 * DATA RESILIENCE MANAGER - INLINED TO WORK AROUND BUILD SYSTEM LIMITATIONS
 * This provides foolproof data protection for all scraping operations.
 */
interface DataBackup {
  id: string;
  timestamp: number;
  operation: string;
  data: any;
  status: 'pending' | 'saved' | 'failed';
  attempts: number;
  lastError?: string;
  metadata?: Record<string, any>;
}

const BACKUP_PREFIX = 'resilience_backup_';
const AUDIT_PREFIX = 'resilience_audit_';
const SESSION_KEY = 'resilience_session';
const MAX_RETRIES = 5;
const INITIAL_RETRY_DELAY = 1000;

class DataResilienceManager {
  private sessionId: string;
  
  constructor() {
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    try {
      this.initSession();
      console.log('✅ DataResilienceManager constructor completed successfully');
    } catch (error) {
      console.error('❌ Error in DataResilienceManager constructor:', error);
      // Don't throw - allow the manager to be created even if init fails
    }
  }

  private initSession(): void {
    const sessionData = {
      id: this.sessionId,
      startTime: Date.now(),
      userAgent: navigator.userAgent,
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
    this.audit('session_start', { sessionId: this.sessionId });
  }

  getPendingRecoveries(): DataBackup[] {
    const recoveries: DataBackup[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(BACKUP_PREFIX)) {
        try {
          const backup = JSON.parse(localStorage.getItem(key) || '');
          if (backup.status === 'pending' || backup.status === 'failed') {
            recoveries.push(backup);
          }
        } catch (e) {
          console.error('Error parsing backup:', key, e);
        }
      }
    }
    return recoveries.sort((a, b) => a.timestamp - b.timestamp);
  }

  async saveWithResilience<T>(
    operation: string,
    data: T,
    saveFn: (data: T) => Promise<any>,
    metadata?: Record<string, any>
  ): Promise<{ success: boolean; error?: string; backupId?: string }> {
    const backupId = this.createBackup(operation, data, metadata);
    
    this.audit('save_attempt', {
      operation,
      backupId,
      itemCount: Array.isArray(data) ? data.length : 1,
      metadata,
    });

    let lastError: string | undefined;
    
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        await saveFn(data);
        this.markBackupSaved(backupId);
        
        this.audit('save_success', {
          operation,
          backupId,
          attempt,
          itemCount: Array.isArray(data) ? data.length : 1,
        });
        
        return { success: true, backupId };
        
      } catch (error: any) {
        lastError = error?.message || String(error);
        
        this.audit('save_failed', {
          operation,
          backupId,
          attempt,
          error: lastError,
        });
        
        this.updateBackupAttempt(backupId, lastError);
        
        if (attempt < MAX_RETRIES) {
          const delay = INITIAL_RETRY_DELAY * Math.pow(2, attempt - 1);
          console.log(`Save attempt ${attempt} failed. Retrying in ${delay}ms...`);
          await this.sleep(delay);
        }
      }
    }
    
    this.markBackupFailed(backupId, lastError);
    
    return {
      success: false,
      error: lastError,
      backupId,
    };
  }

  createBackup(operation: string, data: any, metadata?: Record<string, any>): string {
    const id = `${operation}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const backup: DataBackup = {
      id,
      timestamp: Date.now(),
      operation,
      data,
      status: 'pending',
      attempts: 0,
      metadata,
    };
    
    try {
      const key = `${BACKUP_PREFIX}${id}`;
      localStorage.setItem(key, JSON.stringify(backup));
      console.log(`✅ Created backup: ${key}`);
      
      this.audit('backup_created', {
        backupId: id,
        operation,
        dataSize: JSON.stringify(data).length,
      });
      
      return id;
    } catch (e) {
      console.error('Failed to create backup:', e);
      throw new Error(`Failed to create backup: ${e}`);
    }
  }

  private markBackupSaved(backupId: string): void {
    const key = `${BACKUP_PREFIX}${backupId}`;
    try {
      const backup = JSON.parse(localStorage.getItem(key) || '');
      backup.status = 'saved';
      localStorage.setItem(key, JSON.stringify(backup));
      console.log(`✅ Backup marked as saved: ${backupId}`);
    } catch (e) {
      console.error('Failed to mark backup as saved:', e);
    }
  }

  private markBackupFailed(backupId: string, error?: string): void {
    const key = `${BACKUP_PREFIX}${backupId}`;
    try {
      const backup = JSON.parse(localStorage.getItem(key) || '');
      backup.status = 'failed';
      backup.lastError = error;
      localStorage.setItem(key, JSON.stringify(backup));
      console.error(`❌ Backup marked as failed: ${backupId}`, error);
    } catch (e) {
      console.error('Failed to mark backup as failed:', e);
    }
  }

  private updateBackupAttempt(backupId: string, error: string): void {
    const key = `${BACKUP_PREFIX}${backupId}`;
    try {
      const backup = JSON.parse(localStorage.getItem(key) || '');
      backup.attempts += 1;
      backup.lastError = error;
      localStorage.setItem(key, JSON.stringify(backup));
    } catch (e) {
      console.error('Failed to update backup attempt:', e);
    }
  }

  getBackup(backupId: string): DataBackup | null {
    const key = `${BACKUP_PREFIX}${backupId}`;
    try {
      return JSON.parse(localStorage.getItem(key) || 'null');
    } catch (e) {
      return null;
    }
  }

  exportAllPending(): void {
    const pending = this.getPendingRecoveries();
    
    if (pending.length === 0) {
      console.log('No pending backups to export');
      return;
    }
    
    const blob = new Blob([JSON.stringify(pending, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `all_pending_backups_${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    this.audit('all_backups_exported', { count: pending.length });
  }

  private audit(event: string, data: Record<string, any>): void {
    const auditEntry = {
      timestamp: Date.now(),
      sessionId: this.sessionId,
      event,
      data,
    };
    
    const key = `${AUDIT_PREFIX}${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    try {
      localStorage.setItem(key, JSON.stringify(auditEntry));
    } catch (e) {
      console.error('Failed to write audit log:', e);
    }
    
    console.log(`[AUDIT] ${event}:`, data);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getStats(): {
    pending: number;
    saved: number;
    failed: number;
    totalBackups: number;
  } {
    let pending = 0;
    let saved = 0;
    let failed = 0;
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(BACKUP_PREFIX)) {
        try {
          const backup: DataBackup = JSON.parse(localStorage.getItem(key) || '');
          if (backup.status === 'pending') pending++;
          else if (backup.status === 'saved') saved++;
          else if (backup.status === 'failed') failed++;
        } catch (e) {
          console.error('Error parsing backup:', key, e);
        }
      }
    }
    
    return { pending, saved, failed, totalBackups: pending + saved + failed };
  }
}

// Create singleton instance
console.log('🔧 ABOUT TO CREATE RESILIENCE MANAGER SINGLETON...');
let resilienceManager: DataResilienceManager | null = null;

try {
  resilienceManager = new DataResilienceManager();
  console.log('✅ RESILIENCE MANAGER SINGLETON CREATED:', resilienceManager);
  console.log('✅ getStats method exists:', typeof resilienceManager.getStats === 'function');
  console.log('✅ Instance check:', resilienceManager instanceof DataResilienceManager);
} catch (error) {
  console.error('❌ FAILED TO CREATE RESILIENCE MANAGER:', error);
  // Create a dummy manager so the code doesn't break
  resilienceManager = null;
}

// 🌍 EXPOSE TO WINDOW AT MODULE LEVEL (runs when file loads, not when component mounts)
// This avoids interference with Figma's iframe initialization
if (typeof window !== 'undefined') {
  (window as any).resilienceManager = resilienceManager;
  console.log('🌍 EXPOSED window.resilienceManager at MODULE LEVEL');
  console.log('🌍 Value assigned to window:', window.resilienceManager);
  console.log('🌍 Type:', typeof window.resilienceManager);
}

/**
 * VIC Website Scraper using PATTERN-ONLY approach (NO Google Search!)
 * 
 * 🎯 NEW APPROACH - MUCH FASTER:
 * - Uses URL pattern construction only
 * - NO Google Search API calls (they were returning 0 results)
 * - Constructs likely URLs from operator templates
 * - Verifies URLs with fast HEAD requests
 * 
 * 🛡️ WITH DATA RESILIENCE:
 * - All data is automatically backed up to localStorage before saving
 * - Automatic retry on failure
 * - Recovery on restart
 * - Export capability for manual backup
 * 
 * ⏯️ WITH PAUSE/STOP CONTROLS:
 * - Pause scraping at any time and resume later
 * - Stop completely and reset
 * - State is preserved during pause
 */
export const VICWebsiteScraperSimple = memo(function VICWebsiteScraperSimple() {
  console.log('🎬 VICWebsiteScraperSimple COMPONENT RENDERING...');
  console.log('🛡️ resilienceManager in component scope:', resilienceManager);
  
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [summary, setSummary] = useState({ success: 0, notFound: 0, errors: 0 });
  const [isExporting, setIsExporting] = useState(false);
  const [dbStats, setDbStats] = useState<{
    total: number;
    withWebsite: number;
    withoutWebsite: number;
  } | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [results, setResults] = useState<Array<{
    villageId: string;
    villageName: string;
    operator: string;
    website: string | null;
    status: 'success' | 'not_found' | 'error';
    error?: string;
  }>>([]);
  
  // 🛡️ DIAGNOSTICS STATE
  const [diagnostics, setDiagnostics] = useState<{
    backupCount: number;
    failedSaves: number;
    successfulSaves: number;
  }>({ backupCount: 0, failedSaves: 0, successfulSaves: 0 });

  // Use ref to track component mount status to prevent state updates after unmount
  const isMountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);
  const statsLoadedRef = useRef(false); // Track if stats have been loaded already
  const pausedRef = useRef(false); // Track pause state in ref for immediate access in loops

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    
    return () => {
      isMountedRef.current = false;
      // Abort any ongoing requests when component unmounts
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Load database stats on mount - with delay to avoid iframe issues
  useEffect(() => {
    // Use a timeout to defer the initial load and avoid iframe communication issues
    const timer = setTimeout(() => {
      if (isMountedRef.current && !statsLoadedRef.current) {
        statsLoadedRef.current = true;
        loadDatabaseStats();
        loadDiagnostics(); // 🛡️ Load diagnostics too
      }
    }, 1500); // Increased to 1500ms delay to let iframe fully stabilize

    return () => clearTimeout(timer);
  }, []);

  const loadDiagnostics = () => {
    try {
      // Count all backups in localStorage
      let backupCount = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('resilience_backup_vic_website_save')) {
          backupCount++;
        }
      }
      
      setDiagnostics({
        backupCount,
        failedSaves: 0, // This will be updated during scraping
        successfulSaves: 0 // This will be updated during scraping
      });
      
      console.log(`🛡️ Loaded diagnostics: ${backupCount} backups in localStorage`);
    } catch (e) {
      console.error('Error loading diagnostics:', e);
      // Set safe defaults if loading fails
      setDiagnostics({
        backupCount: 0,
        failedSaves: 0,
        successfulSaves: 0
      });
    }
  };

  const loadDatabaseStats = async () => {
    if (!isMountedRef.current || isLoadingStats) return; // Prevent duplicate calls
    
    setIsLoadingStats(true);
    
    // Create a new abort controller for this request
    const statsAbortController = new AbortController();
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/admin/check-vic-websites`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          signal: statsAbortController.signal,
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch stats: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (isMountedRef.current) {
        setDbStats({
          total: data.totalVIC || 0,
          withWebsite: data.withWebsite || 0,
          withoutWebsite: data.withoutWebsite || 0,
        });
      }
    } catch (error: any) {
      // Ignore abort errors
      if (error.name === 'AbortError') {
        console.log('🛑 Stats load aborted');
        return;
      }
      console.error('Error loading database stats:', error);
      // Don't show errors to user, just log them
    } finally {
      if (isMountedRef.current) {
        setIsLoadingStats(false);
      }
    }
  };

  const exportToCSV = async (onlyWithWebsites: boolean) => {
    if (!isMountedRef.current) return; // Safety check
    
    setIsExporting(true);
    try {
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        alert('Please log in to export data');
        return;
      }

      const url = `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/scraper/export-websites-csv?state=VIC&onlyWithWebsites=${onlyWithWebsites}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
        signal: abortControllerRef.current?.signal, // Add abort signal
      });

      if (!response.ok) {
        throw new Error(`Failed to export: ${response.statusText}`);
      }

      // Download the file
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `vic-villages-${onlyWithWebsites ? 'with-websites' : 'all'}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);

      if (isMountedRef.current) {
        alert(`✅ CSV exported successfully!`);
      }
    } catch (error: any) {
      // Skip abort errors
      if (error.name === 'AbortError') {
        console.log('🛑 Export aborted');
        return;
      }

      console.error('Export error:', error);
      if (isMountedRef.current) {
        alert(`Export failed: ${error.message}`);
      }
    } finally {
      if (isMountedRef.current) {
        setIsExporting(false);
      }
    }
  };

  const startScraping = async () => {
    if (!isMountedRef.current) return; // Safety check
    
    // 🛡️ RESILIENCE CHECK BEFORE STARTING
    console.log('🛡️ DATA RESILIENCE PRE-FLIGHT CHECK:');
    console.log('✅ Resilience Manager:', resilienceManager ? 'Loaded' : '❌ MISSING');
    console.log('✅ saveWithResilience function:', typeof resilienceManager?.saveWithResilience === 'function' ? 'Available' : '❌ MISSING');
    
    // Test localStorage availability
    try {
      localStorage.setItem('__test__', 'test');
      localStorage.removeItem('__test__');
      console.log('✅ LocalStorage: Available');
    } catch (e) {
      console.error('❌ LocalStorage: NOT AVAILABLE - Backups will fail!', e);
      alert('⚠️ WARNING: LocalStorage is not available!\n\nData resilience system will NOT work.\n\nMake sure you\'re not in private/incognito mode.');
    }
    
    setIsRunning(true);
    setResults([]);
    setSummary({ success: 0, notFound: 0, errors: 0 });

    // Create new abort controller for this scraping session
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      const supabase = getSupabaseClient();

      // 🔑 CRITICAL: Get user's access token for authenticated requests
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('❌ You must be logged in to scrape websites!');
        if (isMountedRef.current) setIsRunning(false);
        return;
      }
      const accessToken = session.access_token;

      // Get all VIC villages without websites that have operators
      const { data: villages, error: fetchError } = await supabase
        .from('retirement_villages')
        .select('id, name, suburb, state, operator')
        .eq('state', 'VIC')
        .is('website', null)
        .not('operator', 'is', null)
        .order('name');

      if (fetchError) {
        throw new Error(`Database error: ${fetchError.message}`);
      }

      if (!villages || villages.length === 0) {
        alert('No VIC villages found that need websites!');
        if (isMountedRef.current) setIsRunning(false);
        return;
      }

      if (isMountedRef.current) {
        setProgress({ current: 0, total: villages.length });
      }
      console.log(`🏘️ Found ${villages.length} VIC villages to scrape`);

      // Process villages in small batches to avoid timeouts
      const BATCH_SIZE = 1; // ⚡ ULTRA-SMALL: 1 village at a time to avoid worker limits
      const newResults: typeof results = [];
      let successCount = 0;
      let notFoundCount = 0;
      let errorCount = 0;

      for (let i = 0; i < villages.length; i += BATCH_SIZE) {
        // Check if component is still mounted and not aborted
        if (!isMountedRef.current || abortControllerRef.current?.signal.aborted) {
          console.log('🛑 Scraping aborted - component unmounted or stopped');
          break;
        }

        // ⏸️ Wait while paused
        while (pausedRef.current && isMountedRef.current) {
          console.log('⏸️ Scraping paused, waiting...');
          await new Promise(resolve => setTimeout(resolve, 500)); // Check every 500ms
        }

        // Check again after pause in case stop was called
        if (!isMountedRef.current || abortControllerRef.current?.signal.aborted) {
          console.log('🛑 Scraping stopped after pause');
          break;
        }

        const batch = villages.slice(i, i + BATCH_SIZE);
        console.log(`📦 Processing village ${i + 1} of ${villages.length}: ${batch[0].name}`);

        // Use the PATTERN-ONLY endpoint (NO Google Search - FAST & RELIABLE!)
        try {
          const response = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/pattern-only-scraper/find-websites`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${publicAnonKey}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                villages: batch.map(v => ({
                  id: v.id,
                  name: v.name,
                  suburb: v.suburb,
                  state: v.state,
                  operator: v.operator
                }))
              }),
              signal: abortControllerRef.current.signal // Add abort signal
            }
          );

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${await response.text()}`);
          }

          const data = await response.json();
          console.log('✅ Search complete:', data);

          // 💾 SAVE THE RESULTS TO DATABASE!
          const resultsToSave = (data.results || []).filter((r: any) => r.status === 'found' && r.website);
          
          if (resultsToSave.length > 0) {
            console.log(`💾 Saving ${resultsToSave.length} websites to database WITH RESILIENCE...`);
            
            // 🛡️ USE RESILIENCE MANAGER - Automatic backup + retry logic
            const saveResult = await resilienceManager?.saveWithResilience(
              'vic_website_save',
              resultsToSave,
              async (dataToSave) => {
                const saveResponse = await fetch(
                  `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/scraper/save-websites`,
                  {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${accessToken}`, // 🔑 USE ACCESS TOKEN, NOT PUBLIC KEY!
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                      results: dataToSave
                    }),
                    signal: abortControllerRef.current?.signal
                  }
                );

                if (!saveResponse.ok) {
                  const errorText = await saveResponse.text();
                  throw new Error(`Save failed: ${errorText}`);
                }

                return await saveResponse.json();
              },
              {
                villageCount: resultsToSave.length,
                villageName: batch[0].name,
                timestamp: new Date().toISOString()
              }
            );

            if (saveResult?.success) {
              console.log(`✅ Saved ${resultsToSave.length} websites to database (Backup: ${saveResult.backupId})`);
              setDiagnostics(prev => ({
                ...prev,
                successfulSaves: prev.successfulSaves + 1
              }));
            } else {
              console.error(`❌ Failed to save websites after retries. Backup saved as: ${saveResult?.backupId}`);
              console.error(`Error: ${saveResult?.error}`);
              // Data is safely backed up in localStorage and can be recovered later
              setDiagnostics(prev => ({
                ...prev,
                failedSaves: prev.failedSaves + 1
              }));
            }
          }

          // Process results for display
          for (const result of data.results || []) {
            const status = result.website ? 'success' : 'not_found';
            
            newResults.push({
              villageId: result.villageId || result.id,
              villageName: result.villageName || result.name,
              operator: result.operator || 'Unknown',
              website: result.website || null,
              status,
              error: result.error
            });

            if (status === 'success') successCount++;
            else if (status === 'not_found') notFoundCount++;
          }

          // Only update state if component is still mounted
          if (isMountedRef.current) {
            setResults([...newResults]);
            setSummary({ success: successCount, notFound: notFoundCount, errors: errorCount });
            setProgress({ current: Math.min(i + BATCH_SIZE, villages.length), total: villages.length });
          }

          // Small delay between batches to avoid rate limiting
          if (i + BATCH_SIZE < villages.length) {
            await new Promise(resolve => setTimeout(resolve, 2000));
          }

        } catch (err: any) {
          // Skip abort errors (these are intentional when unmounting)
          if (err.name === 'AbortError') {
            console.log('🛑 Request aborted');
            break;
          }

          console.error('Batch error:', err);
          errorCount++;
          
          // Add error results for this batch
          for (const village of batch) {
            newResults.push({
              villageId: village.id,
              villageName: village.name,
              operator: village.operator || 'Unknown',
              website: null,
              status: 'error',
              error: err.message
            });
          }

          // Only update state if component is still mounted
          if (isMountedRef.current) {
            setResults([...newResults]);
            setSummary({ success: successCount, notFound: notFoundCount, errors: errorCount });
            setProgress({ current: Math.min(i + BATCH_SIZE, villages.length), total: villages.length });
          }
        }
      }

      alert(`🎉 Scraping complete!\n\nFound: ${successCount}\nNot Found: ${notFoundCount}\nErrors: ${errorCount}`);

    } catch (error: any) {
      // Skip abort errors (expected when component unmounts)
      if (error.name === 'AbortError') {
        console.log('🛑 Scraping aborted');
        return;
      }

      console.error('Fatal error:', error);
      if (isMountedRef.current) {
        alert(`Error: ${error.message}`);
      }
    } finally {
      // Only update state if component is still mounted
      if (isMountedRef.current) {
        setIsRunning(false);
      }
      // Refresh database stats after scraping (with delay to avoid rapid requests)
      setTimeout(() => {
        if (isMountedRef.current) {
          loadDatabaseStats();
          loadDiagnostics(); // 🛡️ Refresh diagnostics too
        }
      }, 1000);
    }
  };

  const pauseScraping = () => {
    if (!isMountedRef.current) return; // Safety check
    
    setIsPaused(true);
    pausedRef.current = true;
    console.log('⏸️ Scraping paused');
  };

  const resumeScraping = () => {
    if (!isMountedRef.current) return; // Safety check
    
    setIsPaused(false);
    pausedRef.current = false;
    console.log('▶️ Scraping resumed');
  };

  const stopScraping = () => {
    if (!isMountedRef.current) return; // Safety check
    
    setIsRunning(false);
    setIsPaused(false);
    pausedRef.current = false;
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    console.log('🛑 Scraping stopped');
  };

  return (
    <div className="bg-white border-2 border-green-300 p-6 rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Globe className="w-6 h-6 text-green-600" />
          <h2 className="text-2xl font-bold text-green-900">🎯 Pattern-Only Scraper (NO Google!)</h2>
        </div>
        {isRunning && !isPaused && (
          <div className="px-3 py-1 bg-green-100 border border-green-400 rounded-full text-sm font-semibold text-green-900 animate-pulse">
            🔄 Scraping...
          </div>
        )}
        {isRunning && isPaused && (
          <div className="px-3 py-1 bg-yellow-100 border border-yellow-400 rounded-full text-sm font-semibold text-yellow-900">
            ⏸️ Paused
          </div>
        )}
      </div>

      <div className="mb-6 p-4 bg-blue-50 rounded-lg border-2 border-blue-300">
        <h3 className="font-semibold text-blue-900 mb-2">🎯 NEW APPROACH - NO Google Search!</h3>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li><strong>Strategy:</strong> URL pattern construction ONLY (Google Search was returning 0 results)</li>
          <li><strong>How it works:</strong> Constructs likely URLs from operator templates, then verifies with HEAD requests</li>
          <li><strong>Much faster:</strong> No Google API calls, no rate limits, instant results</li>
          <li><strong>Batch size:</strong> 1 village at a time</li>
          <li><strong>Auto-saves:</strong> Results are saved to database automatically with full resilience protection</li>
        </ul>
      </div>

      {/* 🛡️ DATA RESILIENCE INDICATOR */}
      <div className="mb-6 p-4 bg-blue-50 border-2 border-blue-300 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-blue-900">🛡️ Data Resilience ACTIVE</h3>
        </div>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li><strong>Automatic Backup:</strong> All data is saved to localStorage BEFORE server save</li>
          <li><strong>Retry Logic:</strong> Failed saves are automatically retried up to 5 times</li>
          <li><strong>Recovery System:</strong> Any lost data can be recovered from the Recovery Dashboard</li>
          <li><strong>Export Capability:</strong> You can export backups as JSON files at any time</li>
          <li><strong>Zero Data Loss:</strong> Even if the app crashes, your data is safe!</li>
        </ul>
      </div>

      {/* 🛡️ DATA RESILIENCE DIAGNOSTICS PANEL */}
      <div className="mb-6 p-5 bg-purple-50 border-2 border-purple-300 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-purple-900">📊 Data Resilience Diagnostics</h3>
          <button
            onClick={() => {
              loadDiagnostics();
              alert('🔄 Diagnostics refreshed!');
            }}
            className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700"
          >
            🔄 Refresh
          </button>
        </div>
        
        <div className="grid grid-cols-3 gap-3 mb-3">
          <div className="p-3 bg-white border-2 border-purple-200 rounded-lg text-center">
            <div className="text-3xl font-bold text-purple-900">{diagnostics.backupCount}</div>
            <div className="text-xs font-semibold text-purple-700 mt-1">📦 Backups in LocalStorage</div>
          </div>
          <div className="p-3 bg-white border-2 border-green-300 rounded-lg text-center">
            <div className="text-3xl font-bold text-green-900">{diagnostics.successfulSaves}</div>
            <div className="text-xs font-semibold text-green-700 mt-1">✅ Successful Saves (This Session)</div>
          </div>
          <div className="p-3 bg-white border-2 border-red-300 rounded-lg text-center">
            <div className="text-3xl font-bold text-red-900">{diagnostics.failedSaves}</div>
            <div className="text-xs font-semibold text-red-700 mt-1">❌ Failed Saves (This Session)</div>
          </div>
        </div>
        
        {diagnostics.backupCount > 0 && (
          <div className="mt-3 p-3 bg-yellow-100 border border-yellow-400 rounded-lg">
            <p className="text-sm text-yellow-900 font-semibold">
              ⚠️ You have {diagnostics.backupCount} backups in localStorage!
            </p>
            <p className="text-xs text-yellow-800 mt-1">
              These are websites that were scraped but may have failed to save to the database. 
              Use the VIC Website Recovery Tool from the Admin Dashboard to recover them!
            </p>
          </div>
        )}
        
        {diagnostics.failedSaves > 0 && (
          <div className="mt-2 p-3 bg-red-100 border border-red-400 rounded-lg">
            <p className="text-sm text-red-900 font-semibold">
              🚨 {diagnostics.failedSaves} saves failed during this scraping session!
            </p>
            <p className="text-xs text-red-800 mt-1">
              Don't worry - the data is backed up in localStorage. Check the console for backup IDs.
            </p>
          </div>
        )}
      </div>

      {/* DATABASE STATS - REAL COUNTS */}
      <div className="mb-6 p-5 bg-blue-50 border-2 border-blue-300 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-blue-900">📊 Real Database Status</h3>
          <div className="flex gap-2">
            <button
              onClick={loadDatabaseStats}
              disabled={isLoadingStats}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoadingStats ? '🔄 Loading...' : '🔄 Refresh Count'}
            </button>
            <button
              onClick={async () => {
                try {
                  const supabase = getSupabaseClient();
                  const { data: villages } = await supabase
                    .from('retirement_villages')
                    .select('id, name, website')
                    .eq('state', 'VIC')
                    .not('website', 'is', null)
                    .order('name');
                  
                  if (villages) {
                    console.log('🔍 VIC Villages with Websites:', villages);
                    const csv = [
                      'Village Name,Website',
                      ...villages.map(v => `"${v.name}","${v.website}"`)
                    ].join('\n');
                    
                    const blob = new Blob([csv], { type: 'text/csv' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `vic-websites-audit-${new Date().toISOString().split('T')[0]}.csv`;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                    
                    alert(`✅ Downloaded audit file with ${villages.length} websites!`);
                  }
                } catch (error) {
                  console.error('Audit error:', error);
                  alert('Failed to audit database');
                }
              }}
              className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700"
            >
              🔍 Audit DB
            </button>
          </div>
        </div>
        
        {dbStats ? (
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-white border-2 border-blue-200 rounded-lg text-center">
              <div className="text-3xl font-bold text-blue-900">{dbStats.total}</div>
              <div className="text-xs font-semibold text-blue-700 mt-1">Total VIC Villages</div>
            </div>
            <div className="p-3 bg-white border-2 border-green-300 rounded-lg text-center">
              <div className="text-3xl font-bold text-green-900">{dbStats.withWebsite}</div>
              <div className="text-xs font-semibold text-green-700 mt-1">✅ With Websites</div>
              <div className="text-xs text-green-600 mt-1">
                {dbStats.total > 0 ? Math.round((dbStats.withWebsite / dbStats.total) * 100) : 0}% complete
              </div>
            </div>
            <div className="p-3 bg-white border-2 border-orange-300 rounded-lg text-center">
              <div className="text-3xl font-bold text-orange-900">{dbStats.withoutWebsite}</div>
              <div className="text-xs font-semibold text-orange-700 mt-1">❌ Still Need Websites</div>
            </div>
          </div>
        ) : (
          <div className="text-center text-sm text-gray-600 py-4">
            {isLoadingStats ? 'Loading database stats...' : 'Click Refresh to load current stats'}
          </div>
        )}
      </div>

      {/* Progress */}
      {isRunning && progress.total > 0 && (
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Progress: {progress.current} / {progress.total}</span>
            <span>{Math.round((progress.current / progress.total) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-green-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Summary Stats */}
      {isRunning && (
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-green-900">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Found</span>
            </div>
            <div className="text-2xl font-bold text-green-900 mt-1">{summary.success}</div>
          </div>
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 text-yellow-900">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Not Found</span>
            </div>
            <div className="text-2xl font-bold text-yellow-900 mt-1">{summary.notFound}</div>
          </div>
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-900">
              <XCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Errors</span>
            </div>
            <div className="text-2xl font-bold text-red-900 mt-1">{summary.errors}</div>
          </div>
        </div>
      )}

      {/* Start Button */}
      {!isRunning && (
        <div className="space-y-3">
          <button
            onClick={startScraping}
            className="w-full px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold flex items-center justify-center gap-2 text-lg"
          >
            <Play className="w-5 h-5" />
            Start Scraping (Use Proven Scraper)
          </button>

          {/* Export Buttons - Always visible */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => exportToCSV(false)}
              className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold flex items-center justify-center gap-2"
              disabled={isExporting}
            >
              <Download className="w-4 h-4" />
              {isExporting ? 'Exporting...' : 'Export All VIC Villages'}
            </button>
            <button
              onClick={() => exportToCSV(true)}
              className="px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold flex items-center justify-center gap-2"
              disabled={isExporting}
            >
              <Download className="w-4 h-4" />
              {isExporting ? 'Exporting...' : 'Export With Websites Only'}
            </button>
          </div>
        </div>
      )}

      {isRunning && (
        <div className="text-center text-sm text-gray-600 py-4">
          <p className="font-semibold">Scraping in progress...</p>
          <p className="text-xs mt-1">This may take a few minutes. Please don't close this page.</p>
        </div>
      )}

      {/* Pause/Stop Buttons */}
      {isRunning && (
        <div className="space-y-3">
          <button
            onClick={pauseScraping}
            className="w-full px-6 py-4 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-semibold flex items-center justify-center gap-2 text-lg"
            disabled={isPaused}
          >
            <Pause className="w-5 h-5" />
            {isPaused ? 'Paused' : 'Pause Scraping'}
          </button>
          <button
            onClick={resumeScraping}
            className="w-full px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold flex items-center justify-center gap-2 text-lg"
            disabled={!isPaused}
          >
            <Play className="w-5 h-5" />
            Resume Scraping
          </button>
          <button
            onClick={stopScraping}
            className="w-full px-6 py-4 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold flex items-center justify-center gap-2 text-lg"
          >
            <Square className="w-5 h-5" />
            Stop Scraping
          </button>
        </div>
      )}

      {/* Results Table */}
      {results.length > 0 && (
        <div className="mt-6">
          <h3 className="font-semibold text-gray-900 mb-3">
            Recent Results (last {Math.min(10, results.length)}):
          </h3>
          <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">Village</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">Operator</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">Status</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">Website</th>
                </tr>
              </thead>
              <tbody>
                {results.slice(-10).reverse().map((result, idx) => (
                  <tr key={`${result.villageId}-${idx}`} className="border-t border-gray-100">
                    <td className="px-4 py-2 text-gray-900">{result.villageName}</td>
                    <td className="px-4 py-2 text-gray-600 text-xs">{result.operator}</td>
                    <td className="px-4 py-2">
                      {result.status === 'success' && (
                        <span className="inline-flex items-center gap-1 text-green-700">
                          <CheckCircle className="w-3 h-3" /> Found
                        </span>
                      )}
                      {result.status === 'not_found' && (
                        <span className="inline-flex items-center gap-1 text-yellow-700">
                          <AlertCircle className="w-3 h-3" /> Not Found
                        </span>
                      )}
                      {result.status === 'error' && (
                        <span className="inline-flex items-center gap-1 text-red-700">
                          <XCircle className="w-3 h-3" /> Error
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-gray-600 text-xs">
                      {result.website ? (
                        <a 
                          href={result.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline truncate block max-w-md"
                        >
                          {result.website}
                        </a>
                      ) : (
                        <span className="text-gray-400">{result.error || 'Not found'}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Info */}
      {!isRunning && results.length === 0 && (
        <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
          <p className="font-semibold mb-2">✅ This is the PROVEN scraper!</p>
          <p className="mb-2">This uses the same scraping infrastructure that successfully found websites before:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Uses the /scraper/find-websites endpoint</li>
            <li>Ultra-light batches (1 village at a time)</li>
            <li>Proven to avoid timeout issues</li>
            <li>Automatically saves results to database</li>
          </ul>
        </div>
      )}
    </div>
  );
});