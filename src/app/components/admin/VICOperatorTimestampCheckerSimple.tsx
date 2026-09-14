import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Clock, Loader2 } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

export function VICOperatorTimestampCheckerSimple() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');

  const checkTimestamps = async () => {
    setLoading(true);
    setResult('Loading...');

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/admin/vic-operators/check-timestamps`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      const data = await response.json();
      
      const summary = `Found ${data.villages.length} VIC villages\n` +
        `With operators: ${data.summary.withOperators}\n` +
        `Missing operators: ${data.summary.missingOperators}`;

      setResult(summary);
      alert(summary);

    } catch (err: any) {
      console.error('Error:', err);
      setResult(`Error: ${err.message}`);
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 bg-yellow-50 border-2 border-yellow-400">
      <h2 className="text-xl font-bold mb-4">
        <Clock className="inline size-5 mr-2" />
        VIC Timestamp Checker (Simple)
      </h2>

      <Button
        onClick={checkTimestamps}
        disabled={loading}
        className="mb-4"
      >
        {loading ? (
          <>
            <Loader2 className="size-4 mr-2 animate-spin" />
            Loading...
          </>
        ) : (
          <>
            <Clock className="size-4 mr-2" />
            Check Timestamps
          </>
        )}
      </Button>

      {result && (
        <pre className="text-sm bg-white p-4 rounded border">
          {result}
        </pre>
      )}
    </Card>
  );
}
