import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { 
  CheckCircle, 
  XCircle, 
  ArrowRight, 
  Merge, 
  SkipForward, 
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Trash2,
  AlertCircle,
  Download,
  Globe,
  Building2,
  Loader2
} from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface Operator {
  operator: string;
  count: number;
  website?: string;
  status?: 'verified' | 'fake' | 'needs_merge' | 'pending';
  merge_into?: string;
  notes?: string;
}

type VerificationAction = 'verified' | 'fake' | 'needs_merge' | 'skip';

interface VerificationResult {
  operator: string;
  action: VerificationAction;
  merge_into?: string;
  notes?: string;
}

export function OperatorVerificationTool() {
  const [operators, setOperators] = useState<Operator[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Verification data
  const [verificationResults, setVerificationResults] = useState<VerificationResult[]>([]);
  const [mergeTargetOperator, setMergeTargetOperator] = useState('');
  const [notes, setNotes] = useState('');
  const [showMergeInput, setShowMergeInput] = useState(false);

  // Progress tracking
  const [reviewedCount, setReviewedCount] = useState(0);
  const [verifiedCount, setVerifiedCount] = useState(0);
  const [fakeCount, setFakeCount] = useState(0);
  const [mergeCount, setMergeCount] = useState(0);

  const currentOperator = operators[currentIndex];

  useEffect(() => {
    loadOperators();
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input field
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'v':
          handleVerified();
          break;
        case 'f':
          handleFake();
          break;
        case 'm':
          setShowMergeInput(true);
          break;
        case 's':
          handleSkip();
          break;
        case 'arrowright':
          if (currentIndex < operators.length - 1) {
            setCurrentIndex(currentIndex + 1);
          }
          break;
        case 'arrowleft':
          if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentIndex, operators.length, showMergeInput]);

  const loadOperators = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/cleanup/operators`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to load operators');
      }

      const data = await response.json();
      setOperators(data.operators || []);
    } catch (err) {
      console.error('Error loading operators:', err);
      setError(err instanceof Error ? err.message : 'Failed to load operators');
    } finally {
      setLoading(false);
    }
  };

  const recordAction = (action: VerificationAction, mergeInto?: string) => {
    if (!currentOperator) return;

    const result: VerificationResult = {
      operator: currentOperator.operator,
      action,
      merge_into: mergeInto,
      notes: notes.trim() || undefined,
    };

    setVerificationResults([...verificationResults, result]);
    
    // Update counts
    setReviewedCount(reviewedCount + 1);
    if (action === 'verified') setVerifiedCount(verifiedCount + 1);
    if (action === 'fake') setFakeCount(fakeCount + 1);
    if (action === 'needs_merge') setMergeCount(mergeCount + 1);

    // Clear notes and move to next
    setNotes('');
    setShowMergeInput(false);
    setMergeTargetOperator('');
    
    if (currentIndex < operators.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleVerified = () => {
    recordAction('verified');
    setSuccess('✅ Marked as verified');
    setTimeout(() => setSuccess(null), 2000);
  };

  const handleFake = () => {
    if (confirm(`Mark "${currentOperator?.operator}" as FAKE? All villages will be flagged for deletion.`)) {
      recordAction('fake');
      setSuccess('❌ Marked as fake');
      setTimeout(() => setSuccess(null), 2000);
    }
  };

  const handleMerge = () => {
    if (!mergeTargetOperator.trim()) {
      setError('Please enter the correct operator name');
      return;
    }

    recordAction('needs_merge', mergeTargetOperator.trim());
    setSuccess(`🔄 Will merge into: ${mergeTargetOperator}`);
    setTimeout(() => setSuccess(null), 2000);
  };

  const handleSkip = () => {
    recordAction('skip');
    setSuccess('⏭️ Skipped');
    setTimeout(() => setSuccess(null), 1500);
  };

  const openWebsite = (url?: string) => {
    if (!url) return;
    window.open(url.startsWith('http') ? url : `https://${url}`, '_blank');
  };

  const googleSearch = (operatorName: string) => {
    window.open(`https://www.google.com/search?q=${encodeURIComponent(operatorName + ' retirement village')}`, '_blank');
  };

  const processBatchActions = async () => {
    if (verificationResults.length === 0) {
      setError('No actions to process');
      return;
    }

    if (!confirm(`Process ${verificationResults.length} verification actions?\n\n` +
      `✅ Verified: ${verifiedCount}\n` +
      `❌ Fake: ${fakeCount}\n` +
      `🔄 Merge: ${mergeCount}\n` +
      `⏭️ Skipped: ${reviewedCount - verifiedCount - fakeCount - mergeCount}`
    )) {
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // Process fake operators (delete villages)
      const fakeOps = verificationResults.filter(r => r.action === 'fake');
      for (const fakeOp of fakeOps) {
        await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/cleanup/delete-operator-villages`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ operator: fakeOp.operator }),
          }
        );
      }

      // Process merge operators
      const mergeOps = verificationResults.filter(r => r.action === 'needs_merge');
      for (const mergeOp of mergeOps) {
        if (mergeOp.merge_into) {
          await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/cleanup/merge-operators`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${publicAnonKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                oldOperators: [mergeOp.operator],
                newOperator: mergeOp.merge_into,
              }),
            }
          );
        }
      }

      setSuccess(`✅ Successfully processed ${verificationResults.length} actions!`);
      
      // Reset
      setVerificationResults([]);
      setReviewedCount(0);
      setVerifiedCount(0);
      setFakeCount(0);
      setMergeCount(0);
      
      // Reload operators
      await loadOperators();
      setCurrentIndex(0);

    } catch (err) {
      console.error('Error processing batch actions:', err);
      setError(err instanceof Error ? err.message : 'Failed to process actions');
    } finally {
      setSaving(false);
    }
  };

  const exportResults = () => {
    const csv = [
      'Operator,Action,Merge Into,Notes',
      ...verificationResults.map(r => 
        `"${r.operator}","${r.action}","${r.merge_into || ''}","${r.notes || ''}"`
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `operator-verification-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const undoLast = () => {
    if (verificationResults.length === 0) return;

    const lastResult = verificationResults[verificationResults.length - 1];
    setVerificationResults(verificationResults.slice(0, -1));
    
    // Update counts
    setReviewedCount(reviewedCount - 1);
    if (lastResult.action === 'verified') setVerifiedCount(verifiedCount - 1);
    if (lastResult.action === 'fake') setFakeCount(fakeCount - 1);
    if (lastResult.action === 'needs_merge') setMergeCount(mergeCount - 1);
    
    // Go back
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="size-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!currentOperator) {
    return (
      <Card className="p-8 text-center">
        <CheckCircle className="size-12 text-green-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">All Operators Reviewed!</h2>
        <p className="text-gray-600 mb-6">
          You've reviewed all {operators.length} operators.
        </p>
        {verificationResults.length > 0 && (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold mb-2">Actions Pending:</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>✅ Verified: {verifiedCount}</div>
                <div>❌ Fake: {fakeCount}</div>
                <div>🔄 Merge: {mergeCount}</div>
                <div>⏭️ Skipped: {reviewedCount - verifiedCount - fakeCount - mergeCount}</div>
              </div>
            </div>
            <div className="flex gap-2 justify-center">
              <Button onClick={processBatchActions} disabled={saving} size="lg">
                {saving ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
                Process All Actions
              </Button>
              <Button onClick={exportResults} variant="outline">
                <Download className="size-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        )}
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="font-semibold">
            Progress: {currentIndex + 1} / {operators.length}
          </div>
          <div className="text-sm text-gray-600">
            {reviewedCount} reviewed · {verifiedCount} ✅ · {fakeCount} ❌ · {mergeCount} 🔄
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${((currentIndex + 1) / operators.length) * 100}%` }}
          />
        </div>
      </Card>

      {/* Status Messages */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="size-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="text-red-800">{error}</div>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
          <CheckCircle className="size-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="text-green-800">{success}</div>
        </div>
      )}

      {/* Main Operator Card */}
      <Card className="p-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-3xl font-bold mb-2">{currentOperator.operator || '(null)'}</h2>
            <div className="flex items-center gap-4 text-gray-600">
              <div className="flex items-center gap-2">
                <Building2 className="size-4" />
                {currentOperator.count} villages
              </div>
              {currentOperator.website && (
                <Button 
                  variant="link" 
                  size="sm"
                  onClick={() => openWebsite(currentOperator.website)}
                  className="p-0 h-auto"
                >
                  <Globe className="size-4 mr-1" />
                  {currentOperator.website}
                  <ExternalLink className="size-3 ml-1" />
                </Button>
              )}
            </div>
          </div>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => googleSearch(currentOperator.operator)}
          >
            <Globe className="size-4 mr-2" />
            Google Search
          </Button>
        </div>

        {/* Navigation */}
        <div className="flex gap-2 mb-6">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="size-4 mr-1" />
            Previous
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setCurrentIndex(Math.min(operators.length - 1, currentIndex + 1))}
            disabled={currentIndex === operators.length - 1}
          >
            Next
            <ChevronRight className="size-4 ml-1" />
          </Button>
          {verificationResults.length > 0 && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={undoLast}
            >
              Undo Last
            </Button>
          )}
        </div>

        {/* Notes */}
        <div className="mb-6">
          <Label htmlFor="notes">Notes (optional)</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any notes about this operator..."
            rows={2}
          />
        </div>

        {/* Merge Input */}
        {showMergeInput && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <Label htmlFor="merge-target">Correct Operator Name</Label>
            <div className="flex gap-2 mt-2">
              <Input
                id="merge-target"
                value={mergeTargetOperator}
                onChange={(e) => setMergeTargetOperator(e.target.value)}
                placeholder="Enter the correct operator name..."
                autoFocus
                onKeyPress={(e) => e.key === 'Enter' && handleMerge()}
              />
              <Button onClick={handleMerge}>
                Confirm Merge
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  setShowMergeInput(false);
                  setMergeTargetOperator('');
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button 
            onClick={handleVerified}
            className="h-20 flex-col bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="size-6 mb-1" />
            <span className="font-semibold">Verified</span>
            <span className="text-xs opacity-80">Press V</span>
          </Button>

          <Button 
            onClick={handleFake}
            className="h-20 flex-col bg-red-600 hover:bg-red-700"
          >
            <XCircle className="size-6 mb-1" />
            <span className="font-semibold">Fake</span>
            <span className="text-xs opacity-80">Press F</span>
          </Button>

          <Button 
            onClick={() => setShowMergeInput(true)}
            className="h-20 flex-col bg-blue-600 hover:bg-blue-700"
          >
            <Merge className="size-6 mb-1" />
            <span className="font-semibold">Merge</span>
            <span className="text-xs opacity-80">Press M</span>
          </Button>

          <Button 
            onClick={handleSkip}
            variant="outline"
            className="h-20 flex-col"
          >
            <SkipForward className="size-6 mb-1" />
            <span className="font-semibold">Skip</span>
            <span className="text-xs opacity-80">Press S</span>
          </Button>
        </div>

        {/* Keyboard Shortcuts Help */}
        <div className="mt-6 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
          <div className="font-semibold mb-2">⌨️ Keyboard Shortcuts:</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div><kbd className="px-2 py-1 bg-white border rounded">V</kbd> Verified</div>
            <div><kbd className="px-2 py-1 bg-white border rounded">F</kbd> Fake</div>
            <div><kbd className="px-2 py-1 bg-white border rounded">M</kbd> Merge</div>
            <div><kbd className="px-2 py-1 bg-white border rounded">S</kbd> Skip</div>
            <div><kbd className="px-2 py-1 bg-white border rounded">←</kbd> Previous</div>
            <div><kbd className="px-2 py-1 bg-white border rounded">→</kbd> Next</div>
          </div>
        </div>
      </Card>

      {/* Pending Actions Summary */}
      {verificationResults.length > 0 && (
        <Card className="p-4">
          <div className="flex justify-between items-center">
            <div>
              <div className="font-semibold mb-1">Pending Actions: {verificationResults.length}</div>
              <div className="text-sm text-gray-600">
                Changes will be applied when you click "Process All Actions"
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={exportResults} variant="outline" size="sm">
                <Download className="size-4 mr-2" />
                Export CSV
              </Button>
              <Button onClick={processBatchActions} disabled={saving} size="sm">
                {saving ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
                Process All Actions
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
