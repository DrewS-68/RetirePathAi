import React, { useState } from 'react';
import { Upload, Check, X, AlertCircle } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Manual Website Importer
 * Directly updates village websites in the database
 * Bypasses AUTO-PROCESSOR to test database permissions
 */
export function ManualWebsiteImporter() {
  const { accessToken } = useAuth();
  const [testVillageId, setTestVillageId] = useState('');
  const [testWebsite, setTestWebsite] = useState('');
  const [testResult, setTestResult] = useState<any>(null);
  const [testing, setTesting] = useState(false);

  const testSingleUpdate = async () => {
    if (!testVillageId || !testWebsite) {
      alert('Please enter both Village ID and Website URL');
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      console.log('🧪 Testing single village update...');
      console.log('Village ID:', testVillageId);
      console.log('Website:', testWebsite);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/scraper/save-websites`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken || publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            results: [
              {
                villageId: testVillageId,
                villageName: 'Test Village',
                website: testWebsite,
                status: 'found'
              }
            ]
          }),
        }
      );

      const data = await response.json();
      
      console.log('📊 Response:', data);
      
      if (response.ok) {
        setTestResult({
          success: true,
          message: `Successfully updated ${data.updated} village(s)`,
          details: data.details
        });
      } else {
        setTestResult({
          success: false,
          message: `Error: ${data.error}`,
          details: data
        });
      }

    } catch (error) {
      console.error('❌ Test error:', error);
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        details: null
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center gap-2 mb-4">
        <Upload className="size-5 text-blue-600" />
        <h3 className="text-lg font-semibold">Manual Website Importer</h3>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
        <p className="text-sm text-yellow-800">
          <strong>🧪 Test Tool:</strong> This directly tests the database update without using AUTO-PROCESSOR.
          Use this to verify database permissions are working.
        </p>
      </div>

      {/* Single Village Test */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Village ID (from diagnostic)
          </label>
          <input
            type="text"
            value={testVillageId}
            onChange={(e) => setTestVillageId(e.target.value)}
            placeholder="e.g., 123e4567-e89b-12d3-a456-426614174000"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Run the diagnostic above to get a sample Village ID from "Sample Villages WITHOUT Websites"
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Website URL
          </label>
          <input
            type="url"
            value={testWebsite}
            onChange={(e) => setTestWebsite(e.target.value)}
            placeholder="https://example.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          onClick={testSingleUpdate}
          disabled={testing || !testVillageId || !testWebsite}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          {testing ? (
            <>
              <AlertCircle className="size-4 animate-spin" />
              Testing...
            </>
          ) : (
            <>
              <Upload className="size-4" />
              Test Single Update
            </>
          )}
        </button>

        {/* Test Result */}
        {testResult && (
          <div className={`p-4 rounded-lg border-2 ${
            testResult.success 
              ? 'bg-green-50 border-green-300' 
              : 'bg-red-50 border-red-300'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              {testResult.success ? (
                <Check className="size-5 text-green-600" />
              ) : (
                <X className="size-5 text-red-600" />
              )}
              <span className="font-semibold">
                {testResult.success ? 'SUCCESS' : 'FAILED'}
              </span>
            </div>
            <p className="text-sm mb-2">{testResult.message}</p>
            {testResult.details && (
              <div className="bg-white p-3 rounded border mt-2">
                <pre className="text-xs overflow-auto">
                  {JSON.stringify(testResult.details, null, 2)}
                </pre>
              </div>
            )}
            
            {testResult.success && (
              <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
                <p className="text-sm font-semibold text-blue-900 mb-2">
                  ✅ Next Steps:
                </p>
                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Run the diagnostic again to verify the website was saved</li>
                  <li>Check if "With Website" count increased from 0 to 1</li>
                  <li>If it worked, the AUTO-PROCESSOR should work too</li>
                  <li>Check backend logs to see why AUTO-PROCESSOR isn't saving</li>
                </ol>
              </div>
            )}
            
            {!testResult.success && testResult.details && (
              <div className="mt-3 p-3 bg-red-50 rounded border border-red-200">
                <p className="text-sm font-semibold text-red-900 mb-2">
                  ❌ Possible Issues:
                </p>
                <ul className="text-sm text-red-800 space-y-1 list-disc list-inside">
                  <li>Village ID doesn't exist in database</li>
                  <li>Database permissions issue (service role)</li>
                  <li>Authentication token expired</li>
                  <li>Network error</li>
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-6 bg-gray-50 p-4 rounded-lg">
        <h4 className="font-semibold mb-2">📋 How to Use:</h4>
        <ol className="text-sm space-y-1 list-decimal list-inside text-gray-700">
          <li>Run the VIC Website Diagnostic above</li>
          <li>Copy a Village ID from "Sample Villages WITHOUT Websites"</li>
          <li>Paste it in the "Village ID" field</li>
          <li>Enter any test website URL (e.g., https://example.com)</li>
          <li>Click "Test Single Update"</li>
          <li>Check if it succeeds or fails</li>
          <li>Run diagnostic again to verify the update</li>
        </ol>
      </div>
    </div>
  );
}
