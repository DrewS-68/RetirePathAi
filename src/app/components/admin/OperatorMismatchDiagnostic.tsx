import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Loader2, AlertTriangle, ExternalLink } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface MismatchVillage {
  id: number;
  name: string;
  operator: string;
  website: string;
  extractedDomain: string;
  expectedOperator: string;
  updated_at: string;
}

export function OperatorMismatchDiagnostic() {
  const [villages, setVillages] = useState<MismatchVillage[]>([]);
  const [loading, setLoading] = useState(false);
  const [specificVillage, setSpecificVillage] = useState('');
  const [specificResult, setSpecificResult] = useState<any>(null);

  const checkMismatches = async () => {
    setLoading(true);
    try {
      const url = `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/admin/check-operator-mismatches`;
      console.log('[MISMATCH CHECK] Loading from:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('[MISMATCH CHECK] Results:', data);
      
      if (data.mismatches) {
        setVillages(data.mismatches);
      }
    } catch (error) {
      console.error('[MISMATCH CHECK] Error:', error);
      alert('Error checking mismatches. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const checkSpecificVillage = async () => {
    if (!specificVillage.trim()) {
      alert('Please enter a village name');
      return;
    }

    setLoading(true);
    try {
      const url = `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/admin/check-specific-village?name=${encodeURIComponent(specificVillage)}`;
      console.log('[SPECIFIC CHECK] Loading:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('[SPECIFIC CHECK] Result:', data);
      setSpecificResult(data);
    } catch (error) {
      console.error('[SPECIFIC CHECK] Error:', error);
      alert('Error checking village. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-600" />
          🔍 Operator Mismatch Diagnostic
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-white rounded border border-orange-200">
          <p className="text-sm text-gray-700 mb-3">
            <strong>Purpose:</strong> Check if villages have website URLs that belong to a different operator than what's in the database.
          </p>
          <p className="text-xs text-gray-600">
            Example: Village has operator "RCA Villages" but website is "keyton.com.au" → Should be "Keyton"
          </p>
        </div>

        {/* Check Specific Village */}
        <div className="p-4 bg-blue-50 rounded border border-blue-200">
          <h3 className="font-semibold text-sm mb-2">Check Specific Village</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={specificVillage}
              onChange={(e) => setSpecificVillage(e.target.value)}
              placeholder="Enter village name (e.g., Grovedale Place)"
              className="flex-1 px-3 py-2 border rounded text-sm"
              onKeyPress={(e) => e.key === 'Enter' && checkSpecificVillage()}
            />
            <Button onClick={checkSpecificVillage} disabled={loading} size="sm">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Check'}
            </Button>
          </div>

          {specificResult && (
            <div className="mt-4 p-3 bg-white rounded border text-sm space-y-2">
              <div><strong>Name:</strong> {specificResult.name}</div>
              <div><strong>Current Operator:</strong> {specificResult.operator}</div>
              <div><strong>Website:</strong> {specificResult.website || 'None'}</div>
              {specificResult.website && (
                <>
                  <div><strong>Extracted Domain:</strong> {specificResult.extractedDomain}</div>
                  <div className={specificResult.isMismatch ? 'text-red-600 font-semibold' : 'text-green-600'}>
                    <strong>Status:</strong> {specificResult.isMismatch ? '❌ MISMATCH!' : '✅ Correct'}
                  </div>
                  {specificResult.isMismatch && (
                    <div className="text-orange-600">
                      <strong>Should be:</strong> {specificResult.expectedOperator}
                    </div>
                  )}
                </>
              )}
              <div className="text-xs text-gray-500">
                Last updated: {new Date(specificResult.updated_at).toLocaleString()}
              </div>
            </div>
          )}
        </div>

        {/* Check All Mismatches */}
        <div className="flex gap-2">
          <Button onClick={checkMismatches} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Checking...
              </>
            ) : (
              'Find All Mismatches'
            )}
          </Button>
        </div>

        {villages.length > 0 && (
          <div className="space-y-2">
            <div className="p-3 bg-red-50 border border-red-200 rounded">
              <div className="text-lg font-bold text-red-600">
                ⚠️ Found {villages.length} operator mismatches!
              </div>
              <div className="text-xs text-red-700 mt-1">
                These villages have websites that belong to different operators
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto space-y-2">
              {villages.map((village) => (
                <div
                  key={village.id}
                  className="p-3 bg-white rounded border border-orange-300"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm mb-1">{village.name}</div>
                      <div className="text-xs space-y-1">
                        <div className="text-red-600">
                          <strong>Current:</strong> {village.operator}
                        </div>
                        <div className="text-green-600">
                          <strong>Should be:</strong> {village.expectedOperator}
                        </div>
                        <div className="text-gray-600">
                          <strong>Domain:</strong> {village.extractedDomain}
                        </div>
                        {village.website && (
                          <a
                            href={village.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline flex items-center gap-1"
                          >
                            {village.website.substring(0, 50)}...
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {villages.length === 0 && !loading && !specificResult && (
          <div className="text-center text-gray-500 py-8">
            Click "Find All Mismatches" to check for operator errors
          </div>
        )}
      </CardContent>
    </Card>
  );
}
