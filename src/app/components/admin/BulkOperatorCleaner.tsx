import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Loader2, Trash2, AlertTriangle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface CleanupResult {
  success: boolean;
  cleared: number;
  errors: number;
  message: string;
}

// Common false positive operators to clear
const suspectOperators = [
  'Aberlea Inc',
  'Independent',
  'Inc',
  'Pty Ltd',
  'Limited',
];

export function BulkOperatorCleaner() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CleanupResult | null>(null);
  const [customOperator, setCustomOperator] = useState('');
  const [operatorSample, setOperatorSample] = useState<string[]>([]);
  const [loadingSample, setLoadingSample] = useState(false);

  // Load a sample of operators to see what's in the database
  const loadOperatorSample = async () => {
    setLoadingSample(true);
    try {
      const url = `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/admin/operator-sample`;
      console.log(`[BULK CLEANER] Loading operator sample from: ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
        },
      });

      // Check if response is ok before parsing JSON
      if (!response.ok) {
        console.log(`[BULK CLEANER] Endpoint not available (${response.status})`);
        return;
      }

      const data = await response.json();
      console.log(`[BULK CLEANER] Operator sample:`, data);
      
      if (data.operators) {
        setOperatorSample(data.operators);
      }
    } catch (error) {
      console.error('[BULK CLEANER] Error loading operator sample:', error);
    } finally {
      setLoadingSample(false);
    }
  };

  // DISABLED: Don't load on mount to prevent 404 errors
  // Uncomment if you need this feature and the endpoint is created
  // useEffect(() => {
  //   loadOperatorSample();
  // }, []);

  const clearOperatorsByName = async (operatorName: string) => {
    setLoading(true);
    setResult(null);

    console.log(`[BULK CLEANER] Starting clear for: "${operatorName}"`);

    try {
      const url = `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/admin/bulk-clear-operator`;
      console.log(`[BULK CLEANER] Fetching: ${url}`);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ operatorName }),
      });

      console.log(`[BULK CLEANER] Response status: ${response.status}`);
      
      const data = await response.json();
      console.log(`[BULK CLEANER] Response data:`, data);

      if (data.success) {
        setResult({
          success: true,
          cleared: data.cleared,
          errors: 0,
          message: `Successfully cleared ${data.cleared} villages with operator "${operatorName}"`,
        });
      } else {
        setResult({
          success: false,
          cleared: 0,
          errors: 1,
          message: data.error || 'Failed to clear operators',
        });
      }
    } catch (error) {
      console.error('[BULK CLEANER] Error clearing operators:', error);
      setResult({
        success: false,
        cleared: 0,
        errors: 1,
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setLoading(false);
      console.log(`[BULK CLEANER] Finished clearing "${operatorName}"`);
    }
  };

  const handleCustomClear = () => {
    if (customOperator.trim()) {
      clearOperatorsByName(customOperator.trim());
    }
  };

  return (
    <Card className="border-2 border-red-500">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-600" />
              Bulk Operator Cleaner
            </CardTitle>
            <CardDescription>
              Clear incorrect operators that were falsely matched (e.g., generic company names)
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <Alert>
          <AlertTriangle className="w-4 h-4" />
          <AlertDescription>
            <strong>Warning:</strong> This will set the operator field to NULL for all matching villages.
            They can be re-scraped later with better filters.
          </AlertDescription>
        </Alert>

        {/* Preset Suspect Operators */}
        <div>
          <h3 className="font-semibold mb-2 text-sm">Quick Clear - Common False Positives:</h3>
          <div className="flex flex-wrap gap-2">
            {suspectOperators.map((op) => (
              <Button
                key={op}
                onClick={() => clearOperatorsByName(op)}
                disabled={loading}
                variant="outline"
                size="sm"
                className="border-red-300 hover:bg-red-50"
              >
                {loading ? (
                  <Loader2 className="w-3 h-3 animate-spin mr-1" />
                ) : (
                  <Trash2 className="w-3 h-3 mr-1" />
                )}
                Clear "{op}"
              </Button>
            ))}
          </div>
        </div>

        {/* Custom Operator Name */}
        <div>
          <h3 className="font-semibold mb-2 text-sm">Clear Custom Operator:</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={customOperator}
              onChange={(e) => setCustomOperator(e.target.value)}
              placeholder="Enter operator name..."
              className="flex-1 px-3 py-2 border rounded-md text-sm"
              disabled={loading}
            />
            <Button
              onClick={handleCustomClear}
              disabled={loading || !customOperator.trim()}
              variant="destructive"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Results */}
        {result && (
          <Alert className={result.success ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}>
            {result.success ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-600" />
            )}
            <AlertDescription>
              <div className="space-y-1">
                <p className={result.success ? 'text-green-900' : 'text-red-900'}>
                  {result.message}
                </p>
                {result.success && result.cleared > 0 && (
                  <p className="text-xs text-green-700">
                    These {result.cleared} villages can now be re-scraped with improved filtering.
                  </p>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 p-3 rounded-lg text-sm space-y-2">
          <p className="font-semibold text-blue-900">💡 Usage Tips:</p>
          <ul className="text-blue-800 space-y-1 list-disc list-inside text-xs">
            <li><strong>"Aberlea Inc"</strong> - Appears to be a false positive from generic website text</li>
            <li><strong>"Independent"</strong> - Too generic, likely from "Independent Living" text</li>
            <li>After clearing, run the Smart Scraper again with improved whitelist validation</li>
            <li>Check the reconciliation report to identify other false positives</li>
          </ul>
        </div>

        {/* Operator Sample */}
        <div className="mt-4">
          <h3 className="font-semibold mb-2 text-sm">Operator Sample:</h3>
          <div className="flex flex-wrap gap-2">
            {loadingSample ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              operatorSample.map((op) => (
                <Button
                  key={op}
                  onClick={() => clearOperatorsByName(op)}
                  disabled={loading}
                  variant="outline"
                  size="sm"
                  className="border-red-300 hover:bg-red-50"
                >
                  {loading ? (
                    <Loader2 className="w-3 h-3 animate-spin mr-1" />
                  ) : (
                    <Trash2 className="w-3 h-3 mr-1" />
                  )}
                  Clear "{op}"
                </Button>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}