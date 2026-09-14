import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { AlertCircle, Trash2, Loader2, CheckCircle, ExternalLink, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface SuspectedFake {
  id: string;
  name: string;
  operator: string | null;
  suburb: string;
  website: string | null;
  reasons: string[];
  severity: 'high' | 'medium' | 'low';
}

interface DuplicateVillage {
  id: string;
  name: string;
  operator: string | null;
  suburb: string;
  state: string;
  postcode: string;
  website: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  facility_type: string | null;
}

interface Summary {
  total: number;
  high: number;
  medium: number;
  low: number;
}

export function FakeDetectionTool() {
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deletingDuplicates, setDeletingDuplicates] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [suspectedFakes, setSuspectedFakes] = useState<SuspectedFake[]>([]);
  const [summary, setSummary] = useState<Summary>({ total: 0, high: 0, medium: 0, low: 0 });
  const [totalUnclassified, setTotalUnclassified] = useState(0);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [expandedDuplicates, setExpandedDuplicates] = useState<Map<string, DuplicateVillage[]>>(new Map());
  const [loadingDuplicates, setLoadingDuplicates] = useState<Set<string>>(new Set());

  const detectFakes = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      setSuspectedFakes([]);
      setSummary({ total: 0, high: 0, medium: 0, low: 0 });

      console.log('[Fake Detection] Fetching unclassified villages...');

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/cleanup/detect-fakes`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      console.log('[Fake Detection] Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('[Fake Detection] Error response:', errorData);
        throw new Error(errorData.error || 'Failed to detect fakes');
      }

      const data = await response.json();
      console.log('[Fake Detection] Response data:', data);
      console.log('[Fake Detection] Suspected fakes count:', data.suspectedFakes?.length || 0);
      console.log('[Fake Detection] Total unclassified:', data.total);

      if (data.suspectedFakes && data.suspectedFakes.length > 0) {
        setSuspectedFakes(data.suspectedFakes || []);
        setSummary(data.summary || { total: 0, high: 0, medium: 0, low: 0 });
        setTotalUnclassified(data.total || 0);

        // Auto-select high severity items
        const highSeverityIds = (data.suspectedFakes || [])
          .filter((f: SuspectedFake) => f.severity === 'high')
          .map((f: SuspectedFake) => f.id);
        setSelectedIds(new Set(highSeverityIds));

        setSuccess(`Found ${data.suspectedFakes.length} suspected fake villages! Review and delete as needed.`);
      } else {
        // No suspected fakes found
        setSummary(data.summary || { total: 0, high: 0, medium: 0, low: 0 });
        setTotalUnclassified(data.total || 0);
        setSuccess(`Scanned ${data.total || 0} unclassified villages. No obvious fakes detected! ✅`);
      }

    } catch (err) {
      console.error('[Fake Detection] Error detecting fakes:', err);
      setError(err instanceof Error ? err.message : 'Failed to detect fakes');
    } finally {
      setLoading(false);
    }
  };

  const bulkDelete = async () => {
    if (selectedIds.size === 0) {
      setError('Please select at least one village to delete');
      return;
    }

    if (!confirm(`Delete ${selectedIds.size} suspected fake village(s)?\n\nThis action cannot be undone!`)) {
      return;
    }

    try {
      setDeleting(true);
      setError(null);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/cleanup/bulk-delete-fakes`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ villageIds: Array.from(selectedIds) }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete villages');
      }

      const data = await response.json();
      setSuccess(`Successfully deleted ${data.deletedCount} village(s)! 🎉`);
      
      // Refresh the list
      setSelectedIds(new Set());
      detectFakes();

    } catch (err) {
      console.error('Error deleting villages:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete villages');
    } finally {
      setDeleting(false);
    }
  };

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const selectAllBySeverity = (severity: 'high' | 'medium' | 'low') => {
    const filtered = suspectedFakes
      .filter(f => f.severity === severity)
      .map(f => f.id);
    setSelectedIds(new Set([...selectedIds, ...filtered]));
  };

  const deselectAll = () => {
    setSelectedIds(new Set());
  };

  const autoDeleteExactDuplicates = async () => {
    if (!confirm('Auto-delete EXACT duplicates (same name + suburb + operator + website)?\n\nThis will keep the first occurrence and delete the rest.\n\nThis action cannot be undone!')) {
      return;
    }

    try {
      setDeletingDuplicates(true);
      setError(null);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/cleanup/auto-delete-exact-duplicates`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete duplicates');
      }

      const data = await response.json();
      
      if (data.deletedCount > 0) {
        setSuccess(`✅ Successfully deleted ${data.deletedCount} exact duplicate(s) from ${data.totalGroups} group(s)!`);
      } else {
        setSuccess('✅ No exact duplicates found!');
      }
      
      // Refresh the fake detection list
      detectFakes();

    } catch (err) {
      console.error('Error deleting exact duplicates:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete duplicates');
    } finally {
      setDeletingDuplicates(false);
    }
  };

  const getSeverityColor = (severity: 'high' | 'medium' | 'low') => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getSeverityIcon = (severity: 'high' | 'medium' | 'low') => {
    switch (severity) {
      case 'high': return <AlertCircle className="size-4" />;
      case 'medium': return <AlertTriangle className="size-4" />;
      case 'low': return <AlertCircle className="size-4" />;
    }
  };

  const loadDuplicates = async (id: string) => {
    if (loadingDuplicates.has(id)) return;

    setLoadingDuplicates(new Set([...loadingDuplicates, id]));

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/cleanup/get-duplicates`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ villageId: id }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get duplicates');
      }

      const data = await response.json();
      setExpandedDuplicates(new Map([...expandedDuplicates, [id, data.duplicates || []]]));

    } catch (err) {
      console.error('Error getting duplicates:', err);
      setError(err instanceof Error ? err.message : 'Failed to get duplicates');
    } finally {
      setLoadingDuplicates(new Set([...loadingDuplicates].filter(dupId => dupId !== id)));
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">Detect Obvious Fakes</h2>
            <p className="text-gray-600">
              Automatically identify suspicious villages that are likely fake or invalid data.
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={autoDeleteExactDuplicates} 
              disabled={deletingDuplicates}
              variant="outline"
            >
              {deletingDuplicates ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
              🧹 Auto-Delete Exact Duplicates
            </Button>
            <Button onClick={detectFakes} disabled={loading}>
              {loading ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
              Scan Unclassified Villages
            </Button>
          </div>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="size-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="text-red-800">{error}</div>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
            <CheckCircle className="size-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="text-green-800">{success}</div>
          </div>
        )}

        {/* Summary */}
        {summary.total > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-2xl font-bold text-blue-900">{totalUnclassified}</div>
              <div className="text-sm text-blue-700">Total Unclassified</div>
            </div>
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="text-2xl font-bold text-red-900">{summary.high}</div>
              <div className="text-sm text-red-700">High Severity</div>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="text-2xl font-bold text-yellow-900">{summary.medium}</div>
              <div className="text-sm text-yellow-700">Medium Severity</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-gray-900">{summary.low}</div>
              <div className="text-sm text-gray-700">Low Severity</div>
            </div>
          </div>
        )}

        {/* Bulk Actions */}
        {suspectedFakes.length > 0 && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="font-semibold">{selectedIds.size} selected</span>
              <Button size="sm" variant="outline" onClick={() => selectAllBySeverity('high')}>
                Select All High
              </Button>
              <Button size="sm" variant="outline" onClick={() => selectAllBySeverity('medium')}>
                Select All Medium
              </Button>
              <Button size="sm" variant="outline" onClick={deselectAll}>
                Deselect All
              </Button>
            </div>
            <Button 
              onClick={bulkDelete} 
              disabled={deleting || selectedIds.size === 0}
              variant="destructive"
            >
              {deleting ? <Loader2 className="size-4 animate-spin mr-2" /> : <Trash2 className="size-4 mr-2" />}
              Delete {selectedIds.size} Selected
            </Button>
          </div>
        )}

        {/* Detection Criteria Info */}
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 mb-4">
          <h3 className="font-semibold mb-2">🔍 Detection Criteria:</h3>
          <ul className="text-sm space-y-1 text-gray-700">
            <li>• <strong>High:</strong> No contact info, parked domains, duplicates</li>
            <li>• <strong>Medium:</strong> Single-village operators, missing operator name</li>
            <li>• <strong>Low:</strong> Very short names, other minor issues</li>
          </ul>
        </div>
      </Card>

      {/* Results List */}
      {suspectedFakes.length > 0 && (
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">Suspected Fakes ({suspectedFakes.length})</h3>
          
          <div className="space-y-3">
            {suspectedFakes.map((fake) => (
              <div
                key={fake.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedIds.has(fake.id) ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                }`}
                onClick={() => toggleSelection(fake.id)}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(fake.id)}
                    onChange={() => {}}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-lg">{fake.name}</h4>
                        <div className="text-sm text-gray-600">
                          {fake.suburb} • {fake.operator || '(no operator)'}
                        </div>
                      </div>
                      <Badge className={getSeverityColor(fake.severity)}>
                        {getSeverityIcon(fake.severity)}
                        <span className="ml-1">{fake.severity.toUpperCase()}</span>
                      </Badge>
                    </div>

                    {/* Reasons */}
                    <div className="space-y-1 mb-2">
                      {fake.reasons.map((reason, idx) => (
                        <div key={idx} className="text-sm flex items-start gap-2">
                          <span className="text-red-500">⚠️</span>
                          <span>{reason}</span>
                        </div>
                      ))}
                    </div>

                    {/* Website Link */}
                    {fake.website && (
                      <div className="mt-2">
                        <a
                          href={fake.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {fake.website}
                          <ExternalLink className="size-3" />
                        </a>
                      </div>
                    )}

                    {/* Duplicates */}
                    {expandedDuplicates.has(fake.id) && (
                      <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="text-sm font-semibold text-orange-900">
                            ⚠️ All {1 + (expandedDuplicates.get(fake.id)?.length || 0)} duplicate(s) found:
                          </h5>
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-white"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Select ALL including the parent village
                              const allIds = [fake.id, ...(expandedDuplicates.get(fake.id)?.map(d => d.id) || [])];
                              setSelectedIds(new Set([...selectedIds, ...allIds]));
                            }}
                          >
                            ✓ Select All {1 + (expandedDuplicates.get(fake.id)?.length || 0)}
                          </Button>
                        </div>
                        <div className="text-xs text-orange-800 mb-3 font-medium">
                          💡 Tip: Review all entries below and select the fake ones to delete
                        </div>
                        <div className="space-y-2">{expandedDuplicates.get(fake.id)?.map((dup) => (
                          <div key={dup.id} className="p-2 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex items-start gap-3">
                              <input
                                type="checkbox"
                                checked={selectedIds.has(dup.id)}
                                onChange={() => toggleSelection(dup.id)}
                                className="mt-1"
                              />
                              <div className="flex-1">
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <h4 className="font-semibold text-lg">{dup.name}</h4>
                                    <div className="text-sm text-gray-600">
                                      {dup.suburb} • {dup.operator || '(no operator)'}
                                    </div>
                                  </div>
                                  <Badge className={getSeverityColor(fake.severity)}>
                                    {getSeverityIcon(fake.severity)}
                                    <span className="ml-1">{fake.severity.toUpperCase()}</span>
                                  </Badge>
                                </div>

                                {/* Website Link */}
                                {dup.website && (
                                  <div className="mt-2">
                                    <a
                                      href={dup.website}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      {dup.website}
                                      <ExternalLink className="size-3" />
                                    </a>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}</div>
                      </div>
                    )}

                    {/* Expand Duplicates */}
                    {!expandedDuplicates.has(fake.id) && (
                      <div className="mt-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => loadDuplicates(fake.id)}
                          disabled={loadingDuplicates.has(fake.id)}
                        >
                          {loadingDuplicates.has(fake.id) ? <Loader2 className="size-4 animate-spin mr-2" /> : <ChevronDown className="size-4 mr-2" />}
                          Show Duplicates
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* No Results */}
      {!loading && suspectedFakes.length === 0 && summary.total === 0 && (
        <Card className="p-12 text-center">
          <div className="text-gray-400 mb-4">
            <CheckCircle className="size-16 mx-auto" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No Scan Run Yet</h3>
          <p className="text-gray-600 mb-4">
            Click "Scan Unclassified Villages" to detect obvious fakes.
          </p>
        </Card>
      )}

      {!loading && suspectedFakes.length === 0 && summary.total > 0 && (
        <Card className="p-12 text-center">
          <div className="text-green-400 mb-4">
            <CheckCircle className="size-16 mx-auto" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No Obvious Fakes Found! 🎉</h3>
          <p className="text-gray-600 mb-4">
            All {totalUnclassified} unclassified villages passed the automated checks.
          </p>
          <p className="text-sm text-gray-500">
            You can still manually review them using the Manual Village Classification tool.
          </p>
        </Card>
      )}
    </div>
  );
}