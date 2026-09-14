import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Upload, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import Papa from 'papaparse';

/**
 * VIC Address Uploader
 * 
 * Standalone tool to upload street addresses from VIC Gov CSV 
 * and save them directly to the database (not just localStorage).
 */
export function VICAddressUploader() {
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; details?: any } | null>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setResult(null);
    setUploading(true);

    console.log('📍 Starting VIC Gov Address Upload...');

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (parseResults) => {
        try {
          console.log(`📍 Parsed ${parseResults.data.length} rows from CSV`);

          // First, fetch all VIC villages without operators from the database
          console.log('📍 Fetching VIC villages without operators...');
          
          const fetchResponse = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/villages/vic-all`,
            {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${publicAnonKey}`,
              },
            }
          );

          if (!fetchResponse.ok) {
            throw new Error(`Failed to fetch villages: ${await fetchResponse.text()}`);
          }

          const { villages } = await fetchResponse.json();
          console.log(`📍 Fetched ${villages.length} total VIC villages`);

          // Filter to only villages without operators
          const villagesNeedingOperators = villages.filter((v: any) => 
            !v.operator || v.operator.trim() === ''
          );
          console.log(`📍 ${villagesNeedingOperators.length} villages need operators`);

          // Build address map from CSV
          const addressMap = new Map<string, string>();
          
          parseResults.data.forEach((row: any, idx) => {
            const name = (
              row['village name'] || 
              row['Village Name'] || 
              row['Village name'] || 
              row['name'] || 
              row['Name'] || 
              ''
            ).trim().toLowerCase();
            
            const streetAddress = (
              row['street address'] || 
              row['Street Address'] || 
              row['Street address'] || 
              row['address'] || 
              row['Address'] || 
              ''
            ).trim();

            if (name && streetAddress) {
              addressMap.set(name, streetAddress);
              if (idx < 3) {
                console.log(`📍 Mapped: "${name}" → "${streetAddress}"`);
              }
            }
          });

          console.log(`📍 Built address map with ${addressMap.size} entries`);

          if (addressMap.size === 0) {
            setResult({
              success: false,
              message: 'No valid addresses found in CSV. Check column names: "village name", "street address"',
            });
            setUploading(false);
            return;
          }

          // Match addresses to villages without operators
          const dbUpdates: Array<{ id: string; street_address: string }> = [];
          let matchedCount = 0;
          let unmatchedCount = 0;

          villagesNeedingOperators.forEach((village: any) => {
            const villageName = village.name.toLowerCase();
            const streetAddress = addressMap.get(villageName);

            if (streetAddress) {
              matchedCount++;
              dbUpdates.push({
                id: village.id,
                street_address: streetAddress,
              });
              
              if (matchedCount <= 5) {
                console.log(`✅ Matched: ${village.name} → ${streetAddress}`);
              }
            } else {
              unmatchedCount++;
              if (unmatchedCount <= 3) {
                console.log(`⚠️ No match for: ${village.name}`);
              }
            }
          });

          console.log(`📊 Matching complete: ${matchedCount} matched, ${unmatchedCount} unmatched`);

          if (dbUpdates.length === 0) {
            setResult({
              success: false,
              message: `No villages matched! ${villagesNeedingOperators.length} villages need operators, ${addressMap.size} addresses in CSV, but 0 names matched.`,
              details: {
                villagesNeedingOperators: villagesNeedingOperators.length,
                addressesInCSV: addressMap.size,
                matched: 0,
              },
            });
            setUploading(false);
            return;
          }

          // Save to database
          console.log(`📍 Saving ${dbUpdates.length} addresses to database...`);
          
          const saveResponse = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/villages/batch-update-addresses`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${publicAnonKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ updates: dbUpdates }),
            }
          );

          const saveResult = await saveResponse.json();

          if (!saveResponse.ok) {
            throw new Error(saveResult.error || 'Failed to save addresses');
          }

          console.log('✅ Addresses saved successfully:', saveResult);

          setResult({
            success: true,
            message: `Successfully saved ${saveResult.updated} street addresses to the database!`,
            details: {
              totalVillages: villages.length,
              villagesNeedingOperators: villagesNeedingOperators.length,
              addressesInCSV: addressMap.size,
              matched: matchedCount,
              unmatched: unmatchedCount,
              savedToDatabase: saveResult.updated,
              failed: saveResult.failed || 0,
            },
          });

        } catch (err: any) {
          console.error('❌ Upload failed:', err);
          setResult({
            success: false,
            message: `Upload failed: ${err.message}`,
          });
        } finally {
          setUploading(false);
          // Reset file input
          e.target.value = '';
        }
      },
      error: (error: any) => {
        console.error('❌ CSV parse error:', error);
        setResult({
          success: false,
          message: `CSV parse error: ${error.message}`,
        });
        setUploading(false);
      },
    });
  };

  return (
    <Card className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-400">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-900">
          <Upload className="size-5" />
          📍 VIC Gov Street Address Uploader
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-gray-700">
          Upload your VIC Gov CSV with street addresses to save them directly to the database.
          This will match addresses to the 107 villages that need operators.
        </div>

        <div className="p-3 bg-purple-100 border border-purple-300 rounded text-sm text-purple-900">
          <div className="font-semibold mb-1">📋 Required CSV Format:</div>
          <code className="text-xs">
            village name, street address
          </code>
          <div className="mt-2 text-xs">
            Example: "Aberlea Aged Care Facility", "11 Manningtree Road"
          </div>
        </div>

        <label htmlFor="vic-address-upload" className="cursor-pointer block">
          <Button 
            disabled={uploading}
            className="w-full bg-purple-600 hover:bg-purple-700"
            asChild
          >
            <div>
              {uploading ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Uploading & Saving...
                </>
              ) : (
                <>
                  <Upload className="size-4 mr-2" />
                  Upload VIC Gov CSV
                </>
              )}
            </div>
          </Button>
          <input
            id="vic-address-upload"
            type="file"
            accept=".csv"
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>

        {result && (
          <div className={`p-4 rounded-lg border-2 ${
            result.success 
              ? 'bg-green-50 border-green-400' 
              : 'bg-red-50 border-red-400'
          }`}>
            <div className="flex items-start gap-2">
              {result.success ? (
                <CheckCircle className="size-5 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="size-5 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <div className={`font-semibold ${
                  result.success ? 'text-green-900' : 'text-red-900'
                }`}>
                  {result.message}
                </div>
                
                {result.details && (
                  <div className="mt-3 text-sm space-y-1 text-gray-700">
                    <div>📊 Total VIC villages: {result.details.totalVillages}</div>
                    <div>❌ Villages needing operators: {result.details.villagesNeedingOperators}</div>
                    <div>📍 Addresses in CSV: {result.details.addressesInCSV}</div>
                    <div className="font-semibold text-green-700">
                      ✅ Matched & saved: {result.details.matched || result.details.savedToDatabase}
                    </div>
                    {result.details.unmatched > 0 && (
                      <div className="text-orange-700">
                        ⚠️ Unmatched: {result.details.unmatched} (name mismatch)
                      </div>
                    )}
                    {result.details.failed > 0 && (
                      <div className="text-red-700">
                        ❌ Failed to save: {result.details.failed}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
