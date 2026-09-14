import React, { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { AlertCircle, Search, CheckCircle, XCircle, Loader2, RefreshCw, Download, Save } from 'lucide-react';

interface VillageUrl {
  id: number;
  name: string;
  website: string;
  state: string;
  status: string;
}

interface UrlSuggestion {
  id: number;
  name: string;
  currentUrl: string;
  suggestedUrl: string | null;
  confidence: string;
  alternativeUrls: string[];
  status: 'pending' | 'found' | 'not_found' | 'error' | 'approved' | 'rejected';
  error?: string;
}

export function AutoUrlFinder({ badVillages }: { badVillages: VillageUrl[] }) {
  // Load from localStorage on mount
  const [suggestions, setSuggestions] = useState<UrlSuggestion[]>(() => {
    try {
      const saved = localStorage.getItem('autoUrlFinderResults');
      if (saved) {
        const parsed = JSON.parse(saved);
        console.log('📦 Loaded saved results from localStorage:', parsed.length, 'suggestions');
        return parsed;
      }
    } catch (err) {
      console.error('Failed to load saved results:', err);
    }
    return [];
  });
  
  const [processing, setProcessing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Save to localStorage whenever suggestions change
  React.useEffect(() => {
    if (suggestions.length > 0) {
      localStorage.setItem('autoUrlFinderResults', JSON.stringify(suggestions));
      console.log('💾 Saved results to localStorage:', suggestions.length, 'suggestions');
    }
  }, [suggestions]);

  // Debug logging
  console.log('🔍 AutoUrlFinder rendered:', {
    badVillagesCount: badVillages.length,
    suggestionsCount: suggestions.length,
    processing,
    currentIndex
  });

  // Auto-find URLs for all bad villages
  const autoFindAll = async () => {
    setProcessing(true);
    setError(null);
    setCurrentIndex(0);

    // Initialize suggestions
    const initialSuggestions: UrlSuggestion[] = badVillages.map(v => ({
      id: v.id,
      name: v.name,
      currentUrl: v.website,
      suggestedUrl: null,
      confidence: 'pending',
      alternativeUrls: [],
      status: 'pending'
    }));

    setSuggestions(initialSuggestions);

    // Process each village one by one
    for (let i = 0; i < badVillages.length; i++) {
      const village = badVillages[i];
      setCurrentIndex(i);

      try {
        console.log(`🔍 Auto-finding URL ${i + 1}/${badVillages.length}: ${village.name}`);

        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/auto-find-url`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${publicAnonKey}`,
            },
            body: JSON.stringify({ villageName: village.name })
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${await response.text()}`);
        }

        const data = await response.json();

        // Update this specific suggestion
        setSuggestions(prev => prev.map((s, idx) => 
          idx === i ? {
            ...s,
            suggestedUrl: data.suggestedUrl,
            confidence: data.confidence,
            alternativeUrls: data.alternativeUrls || [],
            status: data.suggestedUrl ? 'found' : 'not_found'
          } : s
        ));

        // Small delay to avoid rate limiting (1 second between requests)
        if (i < badVillages.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

      } catch (err: any) {
        console.error(`Error finding URL for ${village.name}:`, err);
        
        setSuggestions(prev => prev.map((s, idx) => 
          idx === i ? {
            ...s,
            status: 'error',
            error: err.message
          } : s
        ));
      }
    }

    setProcessing(false);
    console.log('✅ Auto-find complete!');
  };

  // Resume from a specific index (for stuck processes)
  const resumeFrom = async (startIndex: number) => {
    setProcessing(true);
    setError(null);
    setCurrentIndex(startIndex);

    console.log(`🔄 Resuming from index ${startIndex}...`);

    // Process remaining villages
    for (let i = startIndex; i < badVillages.length; i++) {
      const village = badVillages[i];
      setCurrentIndex(i);

      // Mark as pending
      setSuggestions(prev => prev.map((s, idx) => 
        idx === i ? { ...s, status: 'pending' as const, error: undefined } : s
      ));

      try {
        console.log(`🔍 Auto-finding URL ${i + 1}/${badVillages.length}: ${village.name}`);

        // Add timeout wrapper (30 second timeout)
        const fetchWithTimeout = async (url: string, options: any, timeout = 30000) => {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), timeout);
          
          try {
            const response = await fetch(url, {
              ...options,
              signal: controller.signal
            });
            clearTimeout(timeoutId);
            return response;
          } catch (err) {
            clearTimeout(timeoutId);
            throw err;
          }
        };

        const response = await fetchWithTimeout(
          `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/auto-find-url`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${publicAnonKey}`,
            },
            body: JSON.stringify({ villageName: village.name })
          },
          30000 // 30 second timeout
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const data = await response.json();

        // Update this specific suggestion
        setSuggestions(prev => prev.map((s, idx) => 
          idx === i ? {
            ...s,
            suggestedUrl: data.suggestedUrl,
            confidence: data.confidence,
            alternativeUrls: data.alternativeUrls || [],
            status: data.suggestedUrl ? 'found' : 'not_found'
          } : s
        ));

        // Small delay to avoid rate limiting
        if (i < badVillages.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1500)); // Increased to 1.5 seconds
        }

      } catch (err: any) {
        console.error(`❌ Error finding URL for ${village.name}:`, err);
        
        const errorMessage = err.name === 'AbortError' ? 'Request timeout (30s)' : err.message;
        
        setSuggestions(prev => prev.map((s, idx) => 
          idx === i ? {
            ...s,
            status: 'error',
            error: errorMessage
          } : s
        ));
        
        // Continue to next village even if this one fails
        console.log(`⏭️ Continuing to next village...`);
      }
    }

    setProcessing(false);
    console.log('✅ Resume complete!');
  };

  // Auto-find URL for a single village
  const autoFindSingle = async (index: number) => {
    const village = badVillages[index];

    setSuggestions(prev => {
      const newSuggestions = [...prev];
      if (!newSuggestions[index]) {
        newSuggestions[index] = {
          id: village.id,
          name: village.name,
          currentUrl: village.website,
          suggestedUrl: null,
          confidence: 'pending',
          alternativeUrls: [],
          status: 'pending'
        };
      } else {
        newSuggestions[index].status = 'pending';
      }
      return newSuggestions;
    });

    try {
      console.log(`🔍 Auto-finding URL for: ${village.name}`);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/auto-find-url`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ villageName: village.name })
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      const data = await response.json();

      setSuggestions(prev => prev.map((s, idx) => 
        idx === index ? {
          ...s,
          suggestedUrl: data.suggestedUrl,
          confidence: data.confidence,
          alternativeUrls: data.alternativeUrls || [],
          status: data.suggestedUrl ? 'found' : 'not_found'
        } : s
      ));

    } catch (err: any) {
      console.error(`Error finding URL for ${village.name}:`, err);
      
      setSuggestions(prev => prev.map((s, idx) => 
        idx === index ? {
          ...s,
          status: 'error',
          error: err.message
        } : s
      ));
    }
  };

  // Approve a suggestion
  const approveSuggestion = (index: number) => {
    setSuggestions(prev => prev.map((s, idx) => 
      idx === index ? { ...s, status: 'approved' as const } : s
    ));
  };

  // Reject a suggestion
  const rejectSuggestion = (index: number) => {
    setSuggestions(prev => prev.map((s, idx) => 
      idx === index ? { ...s, status: 'rejected' as const } : s
    ));
  };

  // Edit a suggestion
  const editSuggestion = (index: number, newUrl: string) => {
    setSuggestions(prev => prev.map((s, idx) => 
      idx === index ? { ...s, suggestedUrl: newUrl, status: 'approved' as const } : s
    ));
  };

  // Save approved URLs to database
  const saveCorrectedUrls = async () => {
    const approvedUpdates = suggestions
      .filter(s => s.status === 'approved' && s.suggestedUrl)
      .map(s => ({ id: s.id, url: s.suggestedUrl }));

    if (approvedUpdates.length === 0) {
      setError('No approved URLs to save');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/save-auto-found-urls`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ updates: approvedUpdates })
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      const result = await response.json();
      
      alert(`✅ Successfully updated ${result.updated} village URLs!\n${result.failed > 0 ? `⚠️ ${result.failed} failed` : ''}`);
      
      // Clear approved suggestions
      setSuggestions(prev => prev.filter(s => s.status !== 'approved'));

    } catch (err: any) {
      setError(err.message);
      console.error('Error saving URLs:', err);
    } finally {
      setSaving(false);
    }
  };

  // Export manual review CSV
  const exportToCSV = () => {
    // Get all villages that need manual review (not approved)
    const needsManualReview = suggestions.filter(s => 
      s.status === 'rejected' || 
      s.status === 'not_found' || 
      s.status === 'error' ||
      (s.status === 'found' && s.confidence === 'low')
    );

    if (needsManualReview.length === 0) {
      alert('No villages need manual review!');
      return;
    }

    // Create CSV content
    const headers = ['ID', 'Village Name', 'Current URL (Bad)', 'Suggested URL', 'Status', 'Confidence', 'Notes'];
    const rows = needsManualReview.map(s => [
      s.id,
      `"${s.name}"`,
      `"${s.currentUrl || ''}"`,
      `"${s.suggestedUrl || ''}\"`,
      s.status,
      s.confidence,
      `"${s.error || (s.confidence === 'low' ? 'Low confidence - verify URL' : 'Needs manual research')}"`,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `vic-villages-manual-review-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    console.log(`📥 Exported ${needsManualReview.length} villages for manual review`);
  };

  // Download backup JSON
  const downloadBackup = () => {
    if (suggestions.length === 0) {
      alert('No results to backup!');
      return;
    }

    const backup = {
      timestamp: new Date().toISOString(),
      version: '1.0',
      suggestions: suggestions
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `auto-url-finder-backup-${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    console.log(`💾 Downloaded backup with ${suggestions.length} suggestions`);
  };

  // Restore from backup JSON
  const restoreBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const backup = JSON.parse(content);
        
        if (!backup.suggestions || !Array.isArray(backup.suggestions)) {
          throw new Error('Invalid backup file format');
        }

        setSuggestions(backup.suggestions);
        localStorage.setItem('autoUrlFinderResults', JSON.stringify(backup.suggestions));
        
        alert(`✅ Restored ${backup.suggestions.length} suggestions from backup!\nBackup date: ${new Date(backup.timestamp).toLocaleString()}`);
      } catch (err: any) {
        alert(`❌ Failed to restore backup: ${err.message}`);
        console.error('Restore error:', err);
      }
    };
    reader.readAsText(file);
    
    // Reset input so same file can be selected again
    event.target.value = '';
  };

  const summary = {
    total: suggestions.length,
    found: suggestions.filter(s => s.status === 'found').length,
    notFound: suggestions.filter(s => s.status === 'not_found').length,
    approved: suggestions.filter(s => s.status === 'approved').length,
    rejected: suggestions.filter(s => s.status === 'rejected').length,
    error: suggestions.filter(s => s.status === 'error').length,
    pending: suggestions.filter(s => s.status === 'pending').length
  };

  const approvedSuggestions = suggestions.filter(s => s.status === 'approved');

  return (
    <div className="space-y-6">
      {/* DEBUG INFO */}
      <div className="bg-yellow-50 border border-yellow-300 rounded p-3 text-xs">
        <div className="font-bold mb-1">🐛 Debug Info:</div>
        <div>Bad Villages Count: {badVillages.length}</div>
        <div>Suggestions Count: {suggestions.length}</div>
        <div>localStorage Key: autoUrlFinderResults</div>
        <div>localStorage Size: {localStorage.getItem('autoUrlFinderResults')?.length || 0} chars</div>
        <button 
          onClick={() => {
            const data = localStorage.getItem('autoUrlFinderResults');
            console.log('Raw localStorage data:', data);
            if (data) {
              console.log('Parsed data:', JSON.parse(data));
            }
          }}
          className="mt-2 px-2 py-1 bg-yellow-200 rounded text-xs"
        >
          Log localStorage Data
        </button>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-lg p-6">
        <h3 className="text-2xl font-bold text-blue-900 mb-3 flex items-center gap-2">
          <Search className="size-7" />
          🤖 Auto URL Finder
        </h3>
        <p className="text-blue-700 mb-4">
          Automatically search Google to find correct official website URLs for VIC villages with bad URLs.
          Review and approve suggestions before saving.
        </p>
        
        <div className="flex gap-3 flex-wrap">
          <Button 
            onClick={autoFindAll} 
            disabled={processing || badVillages.length === 0}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700"
          >
            {processing ? (
              <>
                <Loader2 className="size-4 mr-2 animate-spin" />
                Finding URLs... ({currentIndex + 1}/{badVillages.length})
              </>
            ) : (
              <>
                <Search className="size-4 mr-2" />
                🚀 Auto-Find All URLs ({badVillages.length} villages)
              </>
            )}
          </Button>

          {/* SYNC BUTTON - Always visible to remove duplicates */}
          <Button 
            onClick={() => {
              const currentBadIds = new Set(badVillages.map(v => v.id));
              const beforeCount = suggestions.length;
              
              // Filter suggestions to only keep villages that are still in badVillages
              const synced = suggestions.filter(sug => currentBadIds.has(sug.id));
              
              setSuggestions(synced);
              localStorage.setItem('autoUrlFinderResults', JSON.stringify(synced));
              
              const removed = beforeCount - synced.length;
              
              alert(`✅ Synced with database!\n\nBefore: ${beforeCount} suggestions\nAfter: ${synced.length} suggestions\nRemoved: ${removed} duplicates (already fixed in database)`);
            }}
            disabled={processing}
            size="lg"
            variant="outline"
            className="border-green-300 text-green-600 hover:bg-green-50"
          >
            <RefreshCw className="size-4 mr-2" />
            🔄 Sync with Database (Remove Fixed Villages)
          </Button>

          {suggestions.length > 0 && !processing && (
            <>
              <Button 
                onClick={exportToCSV} 
                disabled={processing}
                size="lg"
                variant="outline"
              >
                <Download className="size-4 mr-2" />
                📝 Export {needsManualReview.length} for Manual Review
              </Button>

              <Button 
                onClick={saveCorrectedUrls} 
                disabled={processing || approvedSuggestions.length === 0}
                size="lg"
                className="bg-green-600 hover:bg-green-700"
              >
                <Save className="size-4 mr-2" />
                💾 Save {approvedSuggestions.length} Corrected URLs to Database
              </Button>
            </>
          )}
        </div>

        {processing && (
          <div className="mt-4 bg-white rounded-lg p-4">
            <div className="flex items-center gap-2 text-blue-700">
              <Loader2 className="size-5 animate-spin" />
              <span className="font-semibold">
                Processing village {currentIndex + 1} of {badVillages.length}...
              </span>
            </div>
            <div className="mt-2 bg-blue-200 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-blue-600 h-full transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / badVillages.length) * 100}%` }}
              />
            </div>
            <Button
              onClick={() => {
                setProcessing(false);
                console.log('🛑 User stopped processing');
              }}
              className="mt-3 bg-red-500 hover:bg-red-600"
              size="sm"
            >
              ⏹️ Stop Processing
            </Button>
          </div>
        )}

        {/* Resume from stuck villages */}
        {!processing && summary.pending > 0 && suggestions.length > 0 && (
          <div className="mt-4 bg-orange-50 border border-orange-300 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-orange-900 mb-1">
                  🔄 Resume Available
                </div>
                <div className="text-sm text-orange-700">
                  {summary.pending} villages still pending (stuck on "Searching...")
                </div>
              </div>
              <Button
                onClick={() => {
                  // Find first pending index
                  const firstPendingIndex = suggestions.findIndex(s => s.status === 'pending');
                  if (firstPendingIndex >= 0) {
                    resumeFrom(firstPendingIndex);
                  }
                }}
                className="bg-orange-600 hover:bg-orange-700"
              >
                🔄 Resume from #{suggestions.findIndex(s => s.status === 'pending') + 1}
              </Button>
            </div>
          </div>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription>Error: {error}</AlertDescription>
        </Alert>
      )}

      {suggestions.length > 0 && (
        <div>
          {/* Summary Stats */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            <div className="p-3 bg-green-50 border border-green-300 rounded-lg">
              <div className="text-2xl font-bold text-green-700">{summary.found}</div>
              <div className="text-xs text-green-600">✅ URLs Found</div>
            </div>
            <div className="p-3 bg-blue-50 border border-blue-300 rounded-lg">
              <div className="text-2xl font-bold text-blue-700">{summary.approved}</div>
              <div className="text-xs text-blue-600">👍 Approved</div>
            </div>
            <div className="p-3 bg-red-50 border border-red-300 rounded-lg">
              <div className="text-2xl font-bold text-red-700">{summary.notFound + summary.rejected}</div>
              <div className="text-xs text-red-600">❌ Not Found/Rejected</div>
            </div>
            <div className="p-3 bg-gray-50 border border-gray-300 rounded-lg">
              <div className="text-2xl font-bold text-gray-700">{summary.error}</div>
              <div className="text-xs text-gray-600">⚠️ Errors</div>
            </div>
          </div>

          {/* Results List */}
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <div 
                key={suggestion.id}
                className={`p-4 rounded-lg border-2 ${
                  suggestion.status === 'approved' ? 'bg-green-50 border-green-300' :
                  suggestion.status === 'rejected' ? 'bg-gray-50 border-gray-300' :
                  suggestion.status === 'found' ? 'bg-blue-50 border-blue-300' :
                  suggestion.status === 'not_found' ? 'bg-red-50 border-red-300' :
                  suggestion.status === 'error' ? 'bg-red-50 border-red-400' :
                  'bg-yellow-50 border-yellow-300'
                }`}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="font-bold text-gray-900 mb-1">
                      {index + 1}. {suggestion.name}
                    </div>
                    
                    <div className="text-xs mb-2 p-2 bg-red-100 border border-red-300 rounded">
                      <span className="font-semibold text-red-700">❌ OLD (BAD) URL:</span>
                      <br />
                      <span className="text-red-600 break-all font-mono text-[10px]">{suggestion.currentUrl || 'None'}</span>
                    </div>

                    {suggestion.status === 'pending' && (
                      <div className="flex items-center gap-2 text-yellow-700">
                        <Loader2 className="size-4 animate-spin" />
                        <span className="text-sm font-semibold">Searching...</span>
                      </div>
                    )}

                    {suggestion.status === 'found' && suggestion.suggestedUrl && (
                      <div>
                        <div className="text-sm mb-2">
                          <span className={`font-semibold ${
                            suggestion.confidence === 'high' ? 'text-green-700' :
                            suggestion.confidence === 'medium' ? 'text-blue-700' :
                            'text-amber-700'
                          }`}>
                            {suggestion.confidence === 'high' ? '🎯 High Confidence' :
                             suggestion.confidence === 'medium' ? '🔍 Medium Confidence' :
                             '⚠️ Low Confidence'}
                          </span>
                        </div>
                        <div className="mb-1">
                          <span className="text-xs font-semibold text-green-700">✅ NEW (SUGGESTED) URL:</span>
                        </div>
                        <input
                          type="text"
                          value={suggestion.suggestedUrl}
                          onChange={(e) => editSuggestion(index, e.target.value)}
                          className="w-full p-2 border-2 border-green-400 bg-green-50 rounded text-sm mb-2 font-mono"
                        />
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => approveSuggestion(index)}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="size-3 mr-1" />
                            Approve
                          </Button>
                          <Button 
                            onClick={() => rejectSuggestion(index)}
                            size="sm"
                            variant="outline"
                          >
                            <XCircle className="size-3 mr-1" />
                            Reject
                          </Button>
                          <a 
                            href={suggestion.suggestedUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline self-center"
                          >
                            🔗 Open
                          </a>
                        </div>
                      </div>
                    )}

                    {suggestion.status === 'approved' && (
                      <div className="text-green-700 font-semibold flex items-center gap-2">
                        <CheckCircle className="size-4" />
                        Approved: {suggestion.suggestedUrl}
                      </div>
                    )}

                    {suggestion.status === 'rejected' && (
                      <div className="text-gray-600 flex items-center gap-2">
                        <XCircle className="size-4" />
                        Rejected - needs manual research
                      </div>
                    )}

                    {suggestion.status === 'not_found' && (
                      <div className="text-red-700">
                        ❌ No suitable URL found - needs manual research
                      </div>
                    )}

                    {suggestion.status === 'error' && (
                      <div className="text-red-700">
                        ⚠️ Error: {suggestion.error}
                      </div>
                    )}
                  </div>

                  {suggestion.status === 'found' && (
                    <Button 
                      onClick={() => autoFindSingle(index)}
                      size="sm"
                      variant="outline"
                    >
                      <Search className="size-3 mr-1" />
                      Retry
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {badVillages.length === 0 && (
        <Alert className="bg-green-50 border-green-300">
          <CheckCircle className="size-4 text-green-600" />
          <AlertDescription className="text-green-800">
            🎉 No bad URLs found! All VIC villages have valid URLs.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}