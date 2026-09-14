# 🛡️ Data Resilience System

## Overview

The **Data Resilience System** is a comprehensive, foolproof data protection mechanism that ensures **ZERO DATA LOSS** during scraping operations. It was created in response to repeated data loss incidents where scraped data failed to save to the server.

## The Problem

Previously, data loss occurred due to:
- Authentication errors (using wrong API keys)
- Network timeouts during long operations
- Server errors during save operations
- Browser crashes or tab closures
- Component unmounting before saves completed

**Result:** Hours of scraping work lost, requiring re-scraping the same data multiple times.

## The Solution

The Data Resilience System implements multiple layers of protection:

### 1. **Automatic Local Backup**
- **BEFORE** attempting any server save, data is automatically written to `localStorage`
- Each backup gets a unique ID and timestamp
- Backups include metadata (operation type, item count, village names, etc.)
- Even if the entire app crashes, the data is safe in the browser

### 2. **Automatic Retry Logic**
- Failed saves are automatically retried up to **5 times**
- Uses exponential backoff (1s, 2s, 4s, 8s, 16s delays)
- Each retry attempt is logged with detailed error information
- If all retries fail, the backup remains in localStorage for manual recovery

### 3. **Session Recovery**
- When the app loads, it automatically checks for unsaved data from previous sessions
- The **Recovery Dashboard** shows all pending/failed backups
- One-click recovery of any lost data
- Bulk recovery option to recover all pending items at once

### 4. **Export Capability**
- Any backup can be exported as a JSON file
- Provides offline redundancy
- Allows manual inspection of data
- Can be used to recover data even if localStorage is cleared

### 5. **Audit Trail**
- Every operation is logged with timestamps
- Full history of save attempts, successes, and failures
- Exportable audit trail for debugging
- Helps identify patterns in failures

### 6. **Health Checks**
- Before starting long operations, the system checks:
  - User is authenticated
  - localStorage is available and has space
  - Storage usage is under 90%
- Prevents operations that are likely to fail

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    SCRAPING OPERATION                        │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│         STEP 1: Create Backup in localStorage               │
│  • Generate unique backup ID                                 │
│  • Store data with metadata                                  │
│  • Mark status as 'pending'                                  │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│         STEP 2: Attempt Server Save (with retries)          │
│  • Try to save to server                                     │
│  • If fails, wait with exponential backoff                   │
│  • Retry up to 5 times                                       │
│  • Log each attempt                                          │
└────────────────────────────┬────────────────────────────────┘
                             │
                    ┌────────┴────────┐
                    │                 │
                SUCCESS?           FAILURE?
                    │                 │
                    ▼                 ▼
         ┌──────────────────┐  ┌──────────────────┐
         │  Mark backup as  │  │  Mark backup as  │
         │    'saved'       │  │    'failed'      │
         └──────────────────┘  └──────────────────┘
                    │                 │
                    ▼                 ▼
         ┌──────────────────┐  ┌──────────────────┐
         │  Can be cleaned  │  │  Ready for       │
         │  up after 7 days │  │  manual recovery │
         └──────────────────┘  └──────────────────┘
```

## Usage

### For Developers

#### Integrating into a Scraper

```typescript
import { resilienceManager } from '../utils/dataResilience';

// In your scraping function:
const result = await resilienceManager.saveWithResilience(
  'operation_name',           // e.g., 'vic_website_save'
  dataToSave,                 // The actual data
  async (data) => {           // The save function
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(await response.text());
    }
    
    return await response.json();
  },
  {                           // Optional metadata
    villageCount: data.length,
    villageName: 'Some Village',
    timestamp: new Date().toISOString()
  }
);

if (result.success) {
  console.log('✅ Save successful:', result.backupId);
} else {
  console.error('❌ Save failed:', result.error);
  console.log('📦 Data backed up as:', result.backupId);
  // Don't panic! Data is safe and can be recovered
}
```

#### Key Points
- **Always** use `saveWithResilience()` for any critical data saves
- **Never** skip the resilience layer, even for "quick" saves
- **Always** check the result and log it
- **Always** pass meaningful metadata for debugging

### For End Users

#### Accessing the Recovery Dashboard
1. Go to **Admin Dashboard**
2. Click the **🛡️ Data Recovery** tab (first tab)
3. The dashboard shows:
   - System health status
   - Number of pending/failed backups
   - Storage usage
   - List of all recoverable data

#### Recovering Lost Data
1. If you see pending/failed backups, ensure you're **logged in**
2. Click **"Recover"** on individual backups, or
3. Click **"Recover All"** to recover everything at once
4. The system will automatically retry the save with proper authentication
5. Once recovered, backups are marked as 'saved'

#### Exporting Backups
- Click **"Export"** on any backup to download it as JSON
- Click **"Export All Pending"** to download all unsaved data
- Keep these exports as offline backups
- Use them for debugging or manual data recovery

#### Cleanup
- Old **saved** backups are automatically cleaned up after 7 days
- **Failed/pending** backups are NEVER automatically deleted
- You can manually delete backups after confirming they're recovered
- Click **"Cleanup Old Backups"** to remove old saved backups

## Storage Details

### localStorage Keys
- `resilience_backup_*` - Individual data backups
- `resilience_audit_*` - Audit trail entries
- `resilience_session` - Current session information

### Backup Structure
```typescript
{
  id: "vic_website_save_1234567890_abc123",
  timestamp: 1234567890000,
  operation: "vic_website_save",
  data: [...],                    // The actual data
  status: "pending",              // or "saved", "failed"
  attempts: 0,                    // Number of retry attempts
  lastError: "...",              // Last error message (if any)
  metadata: {                     // Custom metadata
    villageCount: 5,
    villageName: "Some Village",
    timestamp: "2025-03-05T..."
  }
}
```

### Audit Entry Structure
```typescript
{
  timestamp: 1234567890000,
  sessionId: "session_1234567890_abc123",
  event: "save_attempt",
  data: {
    operation: "vic_website_save",
    backupId: "...",
    itemCount: 5
  }
}
```

## Benefits

### ✅ Zero Data Loss
- Even if the server is down, data is safe
- Even if the browser crashes, data is safe
- Even if authentication fails, data is safe

### ✅ Automatic Recovery
- No manual intervention needed for transient failures
- Automatic retry with exponential backoff
- Recovers from network hiccups automatically

### ✅ Debugging Support
- Full audit trail of all operations
- Detailed error messages
- Helps identify root causes of failures

### ✅ Offline Capability
- Export backups as JSON files
- Manual recovery from exported files
- Works even if localStorage is corrupted

### ✅ Peace of Mind
- Never worry about losing hours of scraping work
- Can confidently run overnight scraping jobs
- Reduces frustration and wasted time

## Best Practices

### DO ✅
- Always use `saveWithResilience()` for critical saves
- Check the Recovery Dashboard before starting new scraping
- Export pending backups before clearing localStorage
- Keep audit trail exports for debugging
- Run cleanup periodically to free up space

### DON'T ❌
- Don't bypass the resilience system for "quick" saves
- Don't delete failed backups until you've confirmed recovery
- Don't clear localStorage without exporting backups first
- Don't ignore health check warnings
- Don't start new scraping if storage is >90% full

## Troubleshooting

### Problem: "LocalStorage full" error
**Solution:** 
1. Export all pending backups
2. Click "Cleanup Old Backups"
3. If still full, manually delete old saved backups
4. Consider reducing batch sizes

### Problem: Backups not recovering
**Cause:** Usually authentication issues
**Solution:**
1. Verify you're logged in
2. Check the audit trail for error details
3. Export the backup and inspect the data
4. Try recovering individual items instead of bulk

### Problem: Performance degradation
**Cause:** Too many backups in localStorage
**Solution:**
1. Clean up old saved backups (7+ days)
2. Recover or delete failed backups
3. Export and remove very old pending items

### Problem: Duplicate saves
**Cause:** Multiple recovery attempts
**Solution:**
1. Check the database before recovering
2. Use the recovery tool's built-in duplicate detection
3. Review audit trail to see what was actually saved

## Technical Details

### Retry Logic
- Initial delay: 1 second
- Exponential backoff: 2x each retry
- Maximum retries: 5
- Total time before giving up: ~31 seconds
- Delay sequence: 1s, 2s, 4s, 8s, 16s

### Storage Limits
- Most browsers: 5-10MB localStorage limit
- System estimates 5MB for calculations
- Warns at 90% capacity
- Automatic cleanup of old saved items

### Session Management
- Each browser session gets a unique ID
- Sessions are logged for debugging
- Session data is lightweight (just metadata)

## Future Enhancements

Potential improvements for v2:
- [ ] IndexedDB support for larger datasets
- [ ] Cloud backup option
- [ ] Real-time sync across tabs
- [ ] Compression for large backups
- [ ] Scheduled automatic recovery
- [ ] Email notifications on failures
- [ ] Integration with Sentry/error tracking

## Support

If you encounter issues with the Data Resilience System:
1. Check the Recovery Dashboard
2. Export and inspect the audit trail
3. Check browser console logs
4. Export all backups before making changes
5. Contact the development team with exported data

## Changelog

### v1.0.0 (2025-03-05)
- Initial release
- Automatic local backup before saves
- Retry logic with exponential backoff
- Recovery Dashboard UI
- Export/import capabilities
- Full audit trail
- Health checks
- Integrated into VICWebsiteScraperSimple

---

**Remember:** This system is your safety net. Use it, trust it, and never worry about data loss again! 🛡️
