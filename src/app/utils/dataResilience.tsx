/**
 * DATA RESILIENCE MANAGER
 * 
 * This utility provides foolproof data protection for all scraping operations.
 * It ensures NO DATA IS EVER LOST by implementing multiple backup strategies.
 * 
 * Features:
 * - Automatic local backup before server saves
 * - Retry logic with exponential backoff
 * - Session recovery across browser refreshes
 * - Export/download capability
 * - Audit trail of all operations
 * - Health checks before operations
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

interface SaveAttempt {
  timestamp: number;
  success: boolean;
  error?: string;
  itemCount?: number;
}

const BACKUP_PREFIX = 'resilience_backup_';
const AUDIT_PREFIX = 'resilience_audit_';
const SESSION_KEY = 'resilience_session';
const MAX_RETRIES = 5;
const INITIAL_RETRY_DELAY = 1000; // 1 second

export class DataResilienceManager {
  private sessionId: string;
  
  constructor() {
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.initSession();
  }

  /**
   * Initialize session and check for pending recoveries
   */
  private initSession(): void {
    const sessionData = {
      id: this.sessionId,
      startTime: Date.now(),
      userAgent: navigator.userAgent,
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
    
    // Log session start
    this.audit('session_start', { sessionId: this.sessionId });
  }

  /**
   * Check if there's any unsaved data from previous sessions
   */
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
    
    // Sort by timestamp, oldest first
    return recoveries.sort((a, b) => a.timestamp - b.timestamp);
  }

  /**
   * Save data with automatic backup and retry logic
   */
  async saveWithResilience<T>(
    operation: string,
    data: T,
    saveFn: (data: T) => Promise<any>,
    metadata?: Record<string, any>
  ): Promise<{ success: boolean; error?: string; backupId?: string }> {
    // Step 1: Create local backup FIRST
    const backupId = this.createBackup(operation, data, metadata);
    
    // Step 2: Log the save attempt
    this.audit('save_attempt', {
      operation,
      backupId,
      itemCount: Array.isArray(data) ? data.length : 1,
      metadata,
    });

    // Step 3: Attempt to save with retry logic
    let lastError: string | undefined;
    
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        // Try to save
        await saveFn(data);
        
        // Success! Mark backup as saved
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
        
        // Update backup with error info
        this.updateBackupAttempt(backupId, lastError);
        
        // If we have more retries, wait with exponential backoff
        if (attempt < MAX_RETRIES) {
          const delay = INITIAL_RETRY_DELAY * Math.pow(2, attempt - 1);
          console.log(`Save attempt ${attempt} failed. Retrying in ${delay}ms...`);
          await this.sleep(delay);
        }
      }
    }
    
    // All retries failed - mark backup as failed
    this.markBackupFailed(backupId, lastError);
    
    return {
      success: false,
      error: lastError,
      backupId,
    };
  }

  /**
   * Create a local backup
   */
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

  /**
   * Mark backup as successfully saved
   */
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

  /**
   * Mark backup as failed
   */
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

  /**
   * Update backup attempt count
   */
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

  /**
   * Recover and retry a failed backup
   */
  async recoverBackup(
    backupId: string,
    saveFn: (data: any) => Promise<any>
  ): Promise<{ success: boolean; error?: string }> {
    const key = `${BACKUP_PREFIX}${backupId}`;
    
    try {
      const backup: DataBackup = JSON.parse(localStorage.getItem(key) || '');
      
      this.audit('recovery_attempt', {
        backupId,
        operation: backup.operation,
        originalTimestamp: backup.timestamp,
      });
      
      // Use the same retry logic
      return await this.saveWithResilience(
        `recovery_${backup.operation}`,
        backup.data,
        saveFn,
        { ...backup.metadata, recoveredFrom: backupId }
      );
      
    } catch (e: any) {
      const error = e?.message || String(e);
      this.audit('recovery_failed', { backupId, error });
      return { success: false, error };
    }
  }

  /**
   * Get a specific backup by ID
   */
  getBackup(backupId: string): DataBackup | null {
    const key = `${BACKUP_PREFIX}${backupId}`;
    try {
      return JSON.parse(localStorage.getItem(key) || 'null');
    } catch (e) {
      return null;
    }
  }

  /**
   * Export backup to downloadable JSON file
   */
  exportBackup(backupId: string): void {
    const backup = this.getBackup(backupId);
    if (!backup) {
      throw new Error(`Backup not found: ${backupId}`);
    }
    
    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_${backupId}_${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    this.audit('backup_exported', { backupId });
  }

  /**
   * Export all pending/failed backups
   */
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

  /**
   * Delete a backup (only after confirmed saved)
   */
  deleteBackup(backupId: string): void {
    const key = `${BACKUP_PREFIX}${backupId}`;
    localStorage.removeItem(key);
    this.audit('backup_deleted', { backupId });
  }

  /**
   * Clean up old saved backups (keep failed/pending)
   */
  cleanupOldBackups(daysOld: number = 7): number {
    const cutoffTime = Date.now() - (daysOld * 24 * 60 * 60 * 1000);
    let deletedCount = 0;
    
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key?.startsWith(BACKUP_PREFIX)) {
        try {
          const backup: DataBackup = JSON.parse(localStorage.getItem(key) || '');
          // Only delete old SAVED backups
          if (backup.status === 'saved' && backup.timestamp < cutoffTime) {
            localStorage.removeItem(key);
            deletedCount++;
          }
        } catch (e) {
          console.error('Error during cleanup:', key, e);
        }
      }
    }
    
    this.audit('cleanup_completed', { deletedCount, daysOld });
    return deletedCount;
  }

  /**
   * Audit trail logging
   */
  private audit(event: string, data: Record<string, any>): void {
    const auditEntry = {
      timestamp: Date.now(),
      sessionId: this.sessionId,
      event,
      data,
    };
    
    // Store in localStorage with timestamp key
    const key = `${AUDIT_PREFIX}${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    try {
      localStorage.setItem(key, JSON.stringify(auditEntry));
    } catch (e) {
      console.error('Failed to write audit log:', e);
    }
    
    // Also log to console for immediate visibility
    console.log(`[AUDIT] ${event}:`, data);
  }

  /**
   * Get audit trail
   */
  getAuditTrail(limit: number = 100): any[] {
    const trail: any[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(AUDIT_PREFIX)) {
        try {
          trail.push(JSON.parse(localStorage.getItem(key) || ''));
        } catch (e) {
          console.error('Error parsing audit entry:', key, e);
        }
      }
    }
    
    // Sort by timestamp, newest first
    return trail.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);
  }

  /**
   * Export audit trail
   */
  exportAuditTrail(): void {
    const trail = this.getAuditTrail(1000);
    
    const blob = new Blob([JSON.stringify(trail, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_trail_${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Health check before starting operations
   */
  async healthCheck(accessToken: string | null): Promise<{
    healthy: boolean;
    issues: string[];
  }> {
    const issues: string[] = [];
    
    // Check 1: Access token exists
    if (!accessToken) {
      issues.push('No access token - user not authenticated');
    }
    
    // Check 2: LocalStorage available and has space
    try {
      const testKey = 'health_check_test';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
    } catch (e) {
      issues.push('LocalStorage not available or full');
    }
    
    // Check 3: Check localStorage usage
    const usage = this.getLocalStorageUsage();
    if (usage.percentage > 90) {
      issues.push(`LocalStorage ${usage.percentage}% full - may need cleanup`);
    }
    
    this.audit('health_check', {
      healthy: issues.length === 0,
      issues,
      storageUsage: usage,
    });
    
    return {
      healthy: issues.length === 0,
      issues,
    };
  }

  /**
   * Get localStorage usage stats
   */
  getLocalStorageUsage(): {
    used: number;
    percentage: number;
    backupCount: number;
    auditCount: number;
  } {
    let totalSize = 0;
    let backupCount = 0;
    let auditCount = 0;
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key) || '';
        totalSize += key.length + value.length;
        
        if (key.startsWith(BACKUP_PREFIX)) backupCount++;
        if (key.startsWith(AUDIT_PREFIX)) auditCount++;
      }
    }
    
    // Most browsers limit to 5-10MB
    const estimatedLimit = 5 * 1024 * 1024;
    
    return {
      used: totalSize,
      percentage: Math.round((totalSize / estimatedLimit) * 100),
      backupCount,
      auditCount,
    };
  }

  /**
   * Sleep helper
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get storage statistics
   */
  getStats(): {
    pending: number;
    saved: number;
    failed: number;
    totalBackups: number;
    oldestPending: number | null;
    storageUsage: ReturnType<typeof this.getLocalStorageUsage>;
  } {
    let pending = 0;
    let saved = 0;
    let failed = 0;
    let oldestPending: number | null = null;
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(BACKUP_PREFIX)) {
        try {
          const backup: DataBackup = JSON.parse(localStorage.getItem(key) || '');
          
          if (backup.status === 'pending') {
            pending++;
            if (!oldestPending || backup.timestamp < oldestPending) {
              oldestPending = backup.timestamp;
            }
          } else if (backup.status === 'saved') {
            saved++;
          } else if (backup.status === 'failed') {
            failed++;
            if (!oldestPending || backup.timestamp < oldestPending) {
              oldestPending = backup.timestamp;
            }
          }
        } catch (e) {
          console.error('Error parsing backup:', key, e);
        }
      }
    }
    
    return {
      pending,
      saved,
      failed,
      totalBackups: pending + saved + failed,
      oldestPending,
      storageUsage: this.getLocalStorageUsage(),
    };
  }
}

// Create singleton instance
export const resilienceManager = new DataResilienceManager();
