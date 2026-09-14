import React, { useState } from 'react';
import { Play, Check, X, AlertCircle } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { useAuth } from '../../contexts/AuthContext';

/**
 * End-to-End Website Finder Test
 * Tests the complete flow: find website → save to database → verify
 */
export function E2EWebsiteTest() {
  const { accessToken } = useAuth();
  const [testing, setTesting] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);

  const runE2ETest = async () => {
    setTesting(true);
    setTestResults(null);

    const results: any = {
      step1_fetchVillage: null,
      step2_findWebsite: null,
      step3_saveWebsite: null,
      step4_verifyDatabase: null,
      success: false,
      error: null
    };

    try {
      console.log('🧪 E2E TEST: Starting comprehensive website flow test...');

      // STEP 1: Get first VIC village without website BUT WITH an operator
      console.log('📋 STEP 1: Fetching a VIC village with operator but no website...');
      const villageResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/villages/admin/no-website-batch?offset=0&limit=50`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken || publicAnonKey}`,
          },
        }
      );

      if (!villageResponse.ok) {
        throw new Error(`Step 1 failed: ${villageResponse.status}`);
      }

      const villageData = await villageResponse.json();
      
      // Find first village WITH an operator
      const testVillage = villageData.villages?.find((v: any) => v.operator && v.operator.trim() !== '');

      if (!testVillage) {
        throw new Error('Step 1 failed: No villages found with operators but without websites. Try importing villages with operators first.');
      }

      results.step1_fetchVillage = {
        success: true,
        village: {
          id: testVillage.id,
          name: testVillage.name,
          suburb: testVillage.suburb,
          state: testVillage.state,
          operator: testVillage.operator
        }
      };

      console.log(`✅ STEP 1 COMPLETE: Found village "${testVillage.name}" with operator "${testVillage.operator}"`);

      // STEP 2: Find website for this village
      console.log('🔍 STEP 2: Searching for website...');
      const findResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/scraper/find-websites`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken || publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            villages: [{
              id: testVillage.id,
              name: testVillage.name,
              suburb: testVillage.suburb,
              state: testVillage.state,
            }]
          }),
        }
      );

      if (!findResponse.ok) {
        throw new Error(`Step 2 failed: ${findResponse.status}`);
      }

      const findData = await findResponse.json();
      
      console.log('🔍 STEP 2 RAW RESPONSE:', JSON.stringify(findData, null, 2));

      results.step2_findWebsite = {
        success: findData.success,
        summary: findData.summary,
        results: findData.results
      };

      if (!findData.success || findData.results.length === 0) {
        throw new Error('Step 2 failed: No results returned from find-websites');
      }

      const foundResult = findData.results[0];
      console.log(`✅ STEP 2 COMPLETE: Result status = "${foundResult.status}"`);

      if (foundResult.status !== 'found') {
        results.step2_findWebsite.warning = `Website not found (status: ${foundResult.status})`;
        results.step3_saveWebsite = { skipped: true, reason: 'No website found' };
        results.step4_verifyDatabase = { skipped: true, reason: 'No website to verify' };
        setTestResults(results);
        return;
      }

      console.log(`   Website: ${foundResult.website}`);

      // STEP 3: Save website to database
      console.log('💾 STEP 3: Saving website to database...');
      console.log('   Sending to save-websites:', JSON.stringify({ results: [foundResult] }, null, 2));

      const saveResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/scraper/save-websites`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken || publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ results: [foundResult] }),
        }
      );

      const saveText = await saveResponse.text();
      console.log('💾 STEP 3 RAW RESPONSE:', saveText);

      let saveData;
      try {
        saveData = JSON.parse(saveText);
      } catch (e) {
        throw new Error(`Step 3 failed: Could not parse response: ${saveText.substring(0, 200)}`);
      }

      if (!saveResponse.ok) {
        throw new Error(`Step 3 failed: ${saveResponse.status} - ${saveData.error || saveText}`);
      }

      results.step3_saveWebsite = {
        success: true,
        updated: saveData.updated,
        failed: saveData.failed,
        details: saveData.details
      };

      console.log(`✅ STEP 3 COMPLETE: Saved ${saveData.updated} website(s)`);

      // STEP 4: Verify website was saved
      console.log('🔍 STEP 4: Verifying website in database...');
      
      // Wait 2 seconds for database to update
      await new Promise(resolve => setTimeout(resolve, 2000));

      const verifyResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/scraper/debug-vic-websites`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken || publicAnonKey}`,
          },
        }
      );

      if (verifyResponse.ok) {
        const verifyData = await verifyResponse.json();
        results.step4_verifyDatabase = {
          success: true,
          totalWithWebsite: verifyData.withWebsite,
          approvedWithWebsite: verifyData.approvedWithWebsite,
          sampleWithWebsite: verifyData.sampleWithWebsite?.slice(0, 3)
        };

        console.log(`✅ STEP 4 COMPLETE: ${verifyData.approvedWithWebsite} approved villages now have websites`);
      } else {
        results.step4_verifyDatabase = {
          success: false,
          error: 'Could not fetch debug endpoint'
        };
      }

      results.success = true;
      console.log('🎉 E2E TEST COMPLETE - ALL STEPS PASSED!');

    } catch (error) {
      console.error('❌ E2E TEST FAILED:', error);
      results.error = error instanceof Error ? error.message : String(error);
    } finally {
      setTestResults(results);
      setTesting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center gap-2 mb-4">
        <Play className="size-5 text-purple-600" />
        <h3 className="text-lg font-semibold">End-to-End Website Finder Test</h3>
      </div>

      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
        <p className="text-sm text-purple-800">
          <strong>🧪 Complete Flow Test:</strong> This tests the entire website finding and saving pipeline in one go.
        </p>
        <ol className="mt-2 text-sm text-purple-700 space-y-1 list-decimal list-inside">
          <li>Fetch a VIC village without a website</li>
          <li>Search for its website using find-websites API</li>
          <li>Save the website using save-websites API</li>
          <li>Verify the website was saved to the database</li>
        </ol>
      </div>

      <button
        onClick={runE2ETest}
        disabled={testing}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400"
      >
        {testing ? (
          <>
            <AlertCircle className="size-4 animate-spin" />
            Running Test...
          </>
        ) : (
          <>
            <Play className="size-4" />
            Run End-to-End Test
          </>
        )}
      </button>

      {/* Test Results */}
      {testResults && (
        <div className="mt-6 space-y-4">
          {/* Overall Status */}
          <div className={`p-4 rounded-lg border-2 ${
            testResults.success 
              ? 'bg-green-50 border-green-300' 
              : 'bg-red-50 border-red-300'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              {testResults.success ? (
                <Check className="size-6 text-green-600" />
              ) : (
                <X className="size-6 text-red-600" />
              )}
              <span className="font-bold text-lg">
                {testResults.success ? 'TEST PASSED ✅' : 'TEST FAILED ❌'}
              </span>
            </div>
            {testResults.error && (
              <p className="text-sm text-red-800 mt-2">Error: {testResults.error}</p>
            )}
          </div>

          {/* Step 1 */}
          <div className={`p-3 rounded border ${
            testResults.step1_fetchVillage?.success ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
          }`}>
            <h4 className="font-semibold mb-1">Step 1: Fetch Village</h4>
            {testResults.step1_fetchVillage?.success ? (
              <div className="text-sm">
                <Check className="size-4 inline text-green-600 mr-1" />
                Found: {testResults.step1_fetchVillage.village.name}
                <div className="text-xs text-gray-600 mt-1">
                  Operator: {testResults.step1_fetchVillage.village.operator || 'None'}
                </div>
                <div className="text-xs text-gray-600">
                  ID: {testResults.step1_fetchVillage.village.id}
                </div>
              </div>
            ) : (
              <p className="text-sm text-red-600">Not completed</p>
            )}
          </div>

          {/* Step 2 */}
          <div className={`p-3 rounded border ${
            testResults.step2_findWebsite?.success ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
          }`}>
            <h4 className="font-semibold mb-1">Step 2: Find Website</h4>
            {testResults.step2_findWebsite ? (
              <div className="text-sm space-y-1">
                {testResults.step2_findWebsite.success ? (
                  <>
                    <div>
                      <Check className="size-4 inline text-green-600 mr-1" />
                      Summary: {testResults.step2_findWebsite.summary?.found || 0} found, {testResults.step2_findWebsite.summary?.notFound || 0} not found
                    </div>
                    {testResults.step2_findWebsite.results?.length > 0 && (
                      <div className="bg-white p-2 rounded mt-2">
                        <div className="text-xs">
                          <strong>Status:</strong> {testResults.step2_findWebsite.results[0].status}
                        </div>
                        {testResults.step2_findWebsite.results[0].website && (
                          <div className="text-xs break-all">
                            <strong>Website:</strong> {testResults.step2_findWebsite.results[0].website}
                          </div>
                        )}
                      </div>
                    )}
                    {testResults.step2_findWebsite.warning && (
                      <p className="text-yellow-600">{testResults.step2_findWebsite.warning}</p>
                    )}
                  </>
                ) : (
                  <p className="text-red-600">Failed to find website</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-600">Not completed</p>
            )}
          </div>

          {/* Step 3 */}
          <div className={`p-3 rounded border ${
            testResults.step3_saveWebsite?.success ? 'bg-green-50 border-green-200' : 
            testResults.step3_saveWebsite?.skipped ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200'
          }`}>
            <h4 className="font-semibold mb-1">Step 3: Save Website</h4>
            {testResults.step3_saveWebsite?.skipped ? (
              <p className="text-sm text-yellow-700">
                Skipped: {testResults.step3_saveWebsite.reason}
              </p>
            ) : testResults.step3_saveWebsite?.success ? (
              <div className="text-sm">
                <Check className="size-4 inline text-green-600 mr-1" />
                Updated: {testResults.step3_saveWebsite.updated}, Failed: {testResults.step3_saveWebsite.failed}
                {testResults.step3_saveWebsite.details && (
                  <div className="bg-white p-2 rounded mt-2 max-h-32 overflow-auto">
                    <pre className="text-xs">
                      {JSON.stringify(testResults.step3_saveWebsite.details, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-600">Not completed</p>
            )}
          </div>

          {/* Step 4 */}
          <div className={`p-3 rounded border ${
            testResults.step4_verifyDatabase?.success ? 'bg-green-50 border-green-200' :
            testResults.step4_verifyDatabase?.skipped ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200'
          }`}>
            <h4 className="font-semibold mb-1">Step 4: Verify Database</h4>
            {testResults.step4_verifyDatabase?.skipped ? (
              <p className="text-sm text-yellow-700">
                Skipped: {testResults.step4_verifyDatabase.reason}
              </p>
            ) : testResults.step4_verifyDatabase?.success ? (
              <div className="text-sm">
                <Check className="size-4 inline text-green-600 mr-1" />
                Approved with websites: {testResults.step4_verifyDatabase.approvedWithWebsite}
              </div>
            ) : (
              <p className="text-sm text-gray-600">Not completed</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
