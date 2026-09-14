import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { 
  Upload, 
  Download, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Loader2, 
  FileSpreadsheet,
  RefreshCw,
  Search,
  Database,
  ArrowRight,
  Check,
  X
} from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import Papa from 'papaparse';

interface GovVillage {
  organisationName: string;
  physicalAddress: string;
  suburb: string;
  state: string;
  postcode: string;
}

interface DBVillage {
  id: string;
  name: string;
  operator: string | null;
  suburb: string;
  state: string;
  postcode: string;
  website: string | null;
  location: string;
}

interface MatchResult {
  dbVillage: DBVillage;
  govVillage: GovVillage | null;
  matchScore: number;
  status: 'matched' | 'unmatched' | 'mismatch';
  differences: {
    suburb?: { current: string; correct: string };
    operator?: { current: string | null; correct: string };
    postcode?: { current: string; correct: string };
  };
  googleVerified?: {
    suburb: string | null;
    postcode: string | null;
    address: string | null;
    confidence: 'high' | 'medium' | 'low';
  };
}

export default function VICGovReconciliation() {
  console.log('🔵 VICGovReconciliation component mounted');
  
  const [file, setFile] = useState<File | null>(null);
  const [govData, setGovData] = useState<GovVillage[]>([]);
  const [dbVillages, setDBVillages] = useState<DBVillage[]>([]);
  const [matchResults, setMatchResults] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [verifyingIndex, setVerifyingIndex] = useState<number | null>(null);
  
  console.log('🟢 State initialized', { govDataLength: govData.length, dbVillagesLength: dbVillages.length });

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;
    
    console.log('📁 File uploaded:', uploadedFile.name);
    
    setFile(uploadedFile);
    setError(null);
    setSuccess(null);
    
    // Use PapaParse to handle multi-line CSV fields properly
    Papa.parse(uploadedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          console.log('📊 PapaParse Results:', results);
          console.log('📊 CSV Headers:', results.meta.fields);
          console.log('📊 Total Rows:', results.data.length);
          
          const parsed: GovVillage[] = [];
          const failed: string[] = [];
          
          results.data.forEach((row: any, index: number) => {
            const organisationName = row['Organisation name'] || row['Organisation Name'] || row['organisation_name'] || '';
            const physicalAddress = row['Physical address'] || row['Physical Address'] || row['physical_address'] || '';
            
            if (!organisationName || !physicalAddress) {
              failed.push(`Row ${index + 1}: Missing organisation name or address`);
              return;
            }
            
            // Extract suburb and postcode from address
            // Format: "19 - 41 Gwalia Street\nTRARALGON VIC 3844\nAustralia"
            // OR: "339 St Helena Road\nST HELENA VIC 3088\nAustralia"
            const vicMatch = physicalAddress.match(/\b(VIC|NSW|QLD|SA|WA|TAS|ACT|NT)\s+(\d{4})/i);
            
            if (vicMatch) {
              const state = vicMatch[1].toUpperCase();
              const postcode = vicMatch[2];
              
              // Extract the line containing "SUBURB VIC POSTCODE"
              const lines = physicalAddress.split('\n');
              const suburbLine = lines.find(line => line.includes(vicMatch[0]));
              
              if (suburbLine) {
                // Extract suburb from "SUBURB VIC 3088" format
                // Remove the "VIC POSTCODE" part to get just the suburb
                const suburbPart = suburbLine.replace(vicMatch[0], '').trim();
                
                if (suburbPart) {
                  parsed.push({
                    organisationName: organisationName.trim(),
                    physicalAddress: physicalAddress.trim(),
                    suburb: suburbPart.trim(),
                    state,
                    postcode,
                  });
                  
                  if (index < 5) {
                    console.log(`✅ Row ${index + 1} SUCCESS:`, { 
                      organisationName: organisationName.substring(0, 40), 
                      suburb: suburbPart, 
                      postcode 
                    });
                  }
                } else {
                  failed.push(`Row ${index + 1}: Empty suburb in "${suburbLine}"`);
                }
              } else {
                failed.push(`Row ${index + 1}: Could not find suburb line in address`);
              }
            } else {
              failed.push(`Row ${index + 1}: No VIC postcode pattern in "${physicalAddress.substring(0, 60)}"`);
            }
          });
          
          console.log('✅ Successfully parsed villages:', parsed.length);
          console.log('❌ Failed to parse:', failed.length, 'rows');
          
          if (failed.length > 0 && failed.length < 20) {
            console.log('❌ Failures:', failed);
          }
          
          setGovData(parsed);
          setSuccess(`✅ Parsed ${parsed.length} villages from VIC Government CSV (${failed.length} skipped)`);
        } catch (err) {
          console.error('❌ CSV Processing Error:', err);
          setError(`Failed to process CSV: ${err.message}`);
        }
      },
      error: (error) => {
        console.error('❌ PapaParse Error:', error);
        setError(`Failed to parse CSV: ${error.message}`);
      },
    });
  };

  // Fetch VIC villages from database
  const fetchDBVillages = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/villages/all`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }
      
      const allVillages: DBVillage[] = await response.json();
      
      // Filter to VIC only
      const vicVillages = allVillages.filter(v => v.state === 'VIC');
      
      setDBVillages(vicVillages);
      setSuccess(`✅ Fetched ${vicVillages.length} VIC villages from database`);
    } catch (err) {
      setError(`Failed to fetch villages: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Fuzzy match village names
  const calculateSimilarity = (str1: string, str2: string): number => {
    const s1 = str1.toLowerCase().replace(/[^a-z0-9]/g, '');
    const s2 = str2.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    if (s1 === s2) return 100;
    if (s1.includes(s2) || s2.includes(s1)) return 90;
    
    // Levenshtein distance
    const matrix: number[][] = [];
    for (let i = 0; i <= s2.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= s1.length; j++) {
      matrix[0][j] = j;
    }
    for (let i = 1; i <= s2.length; i++) {
      for (let j = 1; j <= s1.length; j++) {
        if (s2.charAt(i - 1) === s1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    const distance = matrix[s2.length][s1.length];
    const maxLength = Math.max(s1.length, s2.length);
    return Math.round((1 - distance / maxLength) * 100);
  };

  // Analyze and match villages
  const analyzeData = async () => {
    console.log('Analyze button clicked');
    console.log('Gov data length:', govData.length);
    console.log('DB villages length:', dbVillages.length);
    
    if (govData.length === 0 || dbVillages.length === 0) {
      const errorMsg = 'Please upload CSV and fetch database villages first';
      console.error(errorMsg);
      setError(errorMsg);
      return;
    }
    
    setAnalyzing(true);
    setError(null);
    setSuccess(null);
    setProgress(0);
    
    console.log('Starting analysis...');
    
    try {
      const results: MatchResult[] = [];
      
      for (let i = 0; i < dbVillages.length; i++) {
        const dbVillage = dbVillages[i];
        
        // Find best match in gov data
        let bestMatch: GovVillage | null = null;
        let bestScore = 0;
        
        for (const govVillage of govData) {
          const score = calculateSimilarity(dbVillage.name, govVillage.organisationName);
          if (score > bestScore) {
            bestScore = score;
            bestMatch = govVillage;
          }
        }
        
        // Determine status and differences
        const differences: any = {};
        let status: 'matched' | 'unmatched' | 'mismatch' = 'unmatched';
        
        if (bestMatch && bestScore >= 70) {
          status = 'matched';
          
          // Check for differences in suburb
          if (dbVillage.suburb.toLowerCase() !== bestMatch.suburb.toLowerCase()) {
            differences.suburb = {
              current: dbVillage.suburb,
              correct: bestMatch.suburb,
            };
            status = 'mismatch';
          }
          
          // Check for differences in postcode
          if (dbVillage.postcode !== bestMatch.postcode) {
            differences.postcode = {
              current: dbVillage.postcode,
              correct: bestMatch.postcode,
            };
            status = 'mismatch';
          }
          
          // NOTE: We do NOT check operator because the Gov CSV only has village names,
          // not operator company names (e.g., "Leith Park" vs "Abound Communities")
        }
        
        results.push({
          dbVillage,
          govVillage: bestMatch,
          matchScore: bestScore,
          status,
          differences,
        });
        
        setProgress(Math.round(((i + 1) / dbVillages.length) * 50)); // First 50% for matching
      }
      
      console.log('Analysis complete. Results:', results.length);
      setMatchResults(results);
      
      const matchedCount = results.filter(r => r.status === 'matched').length;
      const mismatchCount = results.filter(r => r.status === 'mismatch').length;
      const unmatchedCount = results.filter(r => r.status === 'unmatched').length;
      
      console.log(`Matched: ${matchedCount}, Mismatches: ${mismatchCount}, Unmatched: ${unmatchedCount}`);
      
      // Auto-verify mismatches with Google
      if (mismatchCount > 0) {
        setSuccess(`✅ Found ${mismatchCount} mismatches. Now verifying with Google...`);
        
        const mismatches = results.filter(r => r.status === 'mismatch');
        
        for (let i = 0; i < mismatches.length; i++) {
          const mismatch = mismatches[i];
          
          try {
            const response = await fetch(
              `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/vic-reconcile/google-verify`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${publicAnonKey}`,
                },
                body: JSON.stringify({
                  villageName: mismatch.dbVillage.name,
                  currentSuburb: mismatch.dbVillage.suburb,
                }),
              }
            );
            
            if (response.ok) {
              const data = await response.json();
              
              // Update the result with Google verification
              const resultIndex = results.findIndex(r => r.dbVillage.id === mismatch.dbVillage.id);
              if (resultIndex >= 0) {
                results[resultIndex].googleVerified = data.google;
              }
            }
            
            // Update progress (50-100%)
            const verifyProgress = 50 + Math.round(((i + 1) / mismatches.length) * 50);
            setProgress(verifyProgress);
            
            // Small delay to avoid rate limiting (500ms between requests)
            if (i < mismatches.length - 1) {
              await new Promise(resolve => setTimeout(resolve, 500));
            }
          } catch (err) {
            console.error(`Failed to verify ${mismatch.dbVillage.name}:`, err);
            // Continue to next village even if one fails
          }
        }
        
        // Update state with all Google verifications
        setMatchResults([...results]);
        setSuccess(`✅ Analysis complete: ${matchedCount} matched, ${mismatchCount} mismatches (Google verified), ${unmatchedCount} unmatched`);
      } else {
        setSuccess(`✅ Analysis complete: ${matchedCount} matched, ${mismatchCount} mismatches, ${unmatchedCount} unmatched`);
      }
    } catch (err) {
      console.error('Analysis error:', err);
      setError(`Analysis failed: ${err.message}`);
    } finally {
      setAnalyzing(false);
      setProgress(100);
    }
  };

  // Update database with correct data
  const updateDatabase = async () => {
    const mismatches = matchResults.filter(r => r.status === 'mismatch');
    
    if (mismatches.length === 0) {
      setError('No mismatches to update');
      return;
    }
    
    if (!confirm(`Update ${mismatches.length} villages with correct data from VIC Government CSV?`)) {
      return;
    }
    
    setUpdating(true);
    setError(null);
    setProgress(0);
    
    try {
      let updatedCount = 0;
      
      for (let i = 0; i < mismatches.length; i++) {
        const match = mismatches[i];
        
        const updateData: any = {};
        
        if (match.differences.suburb) {
          updateData.suburb = match.differences.suburb.correct;
          updateData.location = `${match.differences.suburb.correct}, ${match.dbVillage.state}`;
        }
        
        if (match.differences.postcode) {
          updateData.postcode = match.differences.postcode.correct;
        }
        
        if (match.differences.operator) {
          updateData.operator = match.differences.operator.correct;
        }
        
        // Update via backend
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/vic-reconcile/update`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${publicAnonKey}`,
            },
            body: JSON.stringify({
              villageId: match.dbVillage.id,
              updates: updateData,
            }),
          }
        );
        
        if (response.ok) {
          updatedCount++;
        }
        
        setProgress(Math.round(((i + 1) / mismatches.length) * 100));
      }
      
      setSuccess(`✅ Successfully updated ${updatedCount}/${mismatches.length} villages`);
      
      // Refresh analysis
      await fetchDBVillages();
    } catch (err) {
      setError(`Update failed: ${err.message}`);
    } finally {
      setUpdating(false);
    }
  };

  // Google verification for individual village
  const verifyWithGoogle = async (idx: number) => {
    const result = mismatchResults[idx];
    if (!result) return;
    
    setVerifyingIndex(idx);
    setError(null);
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/vic-reconcile/google-verify`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            villageName: result.dbVillage.name,
            currentSuburb: result.dbVillage.suburb,
          }),
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }
      
      const data = await response.json();
      
      // Update match result with Google verification
      const updatedResults = [...matchResults];
      const originalIdx = matchResults.findIndex(r => r.dbVillage.id === result.dbVillage.id);
      if (originalIdx >= 0) {
        updatedResults[originalIdx].googleVerified = data.google;
        setMatchResults(updatedResults);
      }
      
      setSuccess(`✅ Google verified: ${data.google.suburb || 'N/A'} ${data.google.postcode || 'N/A'}`);
    } catch (err) {
      setError(`Google verification failed: ${err.message}`);
    } finally {
      setVerifyingIndex(null);
    }
  };

  const downloadTemplate = () => {
    const template = `Organisation name,Physical address\nApplewood Retirement Village,\"123 Main St, Doncaster VIC 3108\"\nExample Village,\"456 Test Rd, Example Suburb VIC 3000\"`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vic_gov_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const downloadResults = () => {
    if (matchResults.length === 0) {
      alert('No results to export. Please run analysis first.');
      return;
    }

    // Create CSV header
    const headers = [
      'Village Name',
      'Status',
      'Match Score',
      'Current Suburb',
      'Gov CSV Suburb',
      'Google Suburb',
      'Current Postcode',
      'Gov CSV Postcode',
      'Google Postcode',
      'Current Operator',
      'Google Confidence',
      'Google Full Address',
      'Google Agrees With',
      'Recommendation'
    ];

    // Create CSV rows
    const rows = matchResults.map(result => {
      let googleAgreesWith = 'N/A';
      let recommendation = '';

      if (result.status === 'matched') {
        recommendation = '✅ No changes needed';
      } else if (result.status === 'unmatched') {
        recommendation = '⚠️ Manual review - no gov match found';
      } else if (result.status === 'mismatch') {
        if (result.googleVerified && result.differences.suburb) {
          const googleSuburb = (result.googleVerified.suburb || '').toLowerCase();
          const currentSuburb = result.differences.suburb.current.toLowerCase();
          const govSuburb = result.differences.suburb.correct.toLowerCase();

          if (googleSuburb === govSuburb) {
            googleAgreesWith = 'Gov CSV';
            recommendation = '✅ Update to Gov CSV data (Google confirms)';
          } else if (googleSuburb === currentSuburb) {
            googleAgreesWith = 'Current DB';
            recommendation = '⚠️ Keep current DB data (Google confirms)';
          } else {
            googleAgreesWith = 'Neither';
            recommendation = '❌ Manual review needed (Google disagrees with both)';
          }
        } else {
          recommendation = '🔍 Pending Google verification';
        }
      }

      return [
        result.dbVillage.name,
        result.status.toUpperCase(),
        `${result.matchScore}%`,
        result.dbVillage.suburb,
        result.govVillage?.suburb || 'N/A',
        result.googleVerified?.suburb || 'Not verified',
        result.dbVillage.postcode,
        result.govVillage?.postcode || 'N/A',
        result.googleVerified?.postcode || 'Not verified',
        result.dbVillage.operator || '(empty)',
        result.googleVerified?.confidence || 'N/A',
        result.googleVerified?.address || 'N/A',
        googleAgreesWith,
        recommendation
      ];
    });

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => 
        row.map(cell => {
          // Escape cells that contain commas or quotes
          const cellStr = String(cell);
          if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
            return `"${cellStr.replace(/"/g, '""')}"`;
          }
          return cellStr;
        }).join(',')
      )
    ].join('\n');

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vic_reconciliation_results_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const matchedResults = matchResults.filter(r => r.status === 'matched');
  const mismatchResults = matchResults.filter(r => r.status === 'mismatch');
  const unmatchedResults = matchResults.filter(r => r.status === 'unmatched');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="size-5" />
            VIC Government Data Reconciliation
          </CardTitle>
          <CardDescription>
            Cross-reference 505 Copilot villages against VIC Government authoritative data to fix incorrect suburbs, operators, and postcodes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Upload CSV */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Step 1: Upload VIC Government CSV</h3>
              <Button variant="outline" size="sm" onClick={downloadTemplate}>
                <Download className="size-4 mr-2" />
                Download Template
              </Button>
            </div>
            
            <div className="flex items-center gap-3">
              <label htmlFor="csv-upload" className="cursor-pointer">
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors">
                  <Upload className="size-4" />
                  <span className="font-medium">Choose CSV File</span>
                </div>
                <input
                  id="csv-upload"
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              {file && (
                <span className="text-sm text-muted-foreground">
                  {file.name}
                </span>
              )}
              {govData.length > 0 && (
                <Badge variant="default" className="bg-green-600">
                  <CheckCircle className="size-3 mr-1" />
                  {govData.length} villages loaded
                </Badge>
              )}
            </div>
          </div>

          {/* Step 2: Fetch DB Data */}
          <div className="space-y-3">
            <h3 className="font-semibold">Step 2: Fetch Database Villages</h3>
            <Button onClick={fetchDBVillages} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Fetching...
                </>
              ) : (
                <>
                  <RefreshCw className="size-4 mr-2" />
                  Fetch VIC Villages from Database
                </>
              )}
            </Button>
            {dbVillages.length > 0 && (
              <Badge variant="default" className="ml-3 bg-blue-600">
                <Database className="size-3 mr-1" />
                {dbVillages.length} VIC villages
              </Badge>
            )}
          </div>

          {/* Step 3: Analyze */}
          <div className="space-y-3">
            <h3 className="font-semibold">Step 3: Analyze & Match</h3>
            
            {/* TEST: Simple button */}
            <button
              onClick={() => {
                console.log('🔴 SIMPLE BUTTON CLICKED!');
                alert('Simple button works!');
              }}
              style={{ padding: '10px 20px', background: 'red', color: 'white', border: 'none', cursor: 'pointer' }}
            >
              TEST BUTTON
            </button>
            
            <Button 
              type="button"
              onClick={(e) => {
                e.preventDefault();
                console.log('🟣 BUTTON CLICKED!', { govData: govData.length, dbVillages: dbVillages.length });
                analyzeData();
              }}
              disabled={analyzing || govData.length === 0 || dbVillages.length === 0}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {analyzing ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Analyzing ({progress}%)...
                </>
              ) : (
                <>
                  <Search className="size-4 mr-2" />
                  Run Fuzzy Matching Analysis
                </>
              )}
            </Button>
            {analyzing && (
              <Progress value={progress} className="mt-3" />
            )}
          </div>

          {/* Alerts */}
          {error && (
            <Alert variant="destructive">
              <XCircle className="size-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert>
              <CheckCircle className="size-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {matchResults.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Analysis Results</CardTitle>
                <CardDescription>
                  Review matches and apply corrections
                </CardDescription>
              </div>
              <Button 
                onClick={downloadResults} 
                variant="outline"
                className="border-blue-500 text-blue-600 hover:bg-blue-50"
              >
                <FileSpreadsheet className="size-4 mr-2" />
                Export to Spreadsheet
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-6">
              <Badge variant="default" className="bg-green-600 text-white">
                <Check className="size-3 mr-1" />
                {matchedResults.length} Perfect Matches
              </Badge>
              <Badge variant="default" className="bg-yellow-600 text-white">
                <AlertTriangle className="size-3 mr-1" />
                {mismatchResults.length} Mismatches
              </Badge>
              <Badge variant="default" className="bg-red-600 text-white">
                <X className="size-3 mr-1" />
                {unmatchedResults.length} Unmatched
              </Badge>
            </div>

            {mismatchResults.length > 0 && (
              <div className="mb-6">
                <Button 
                  onClick={updateDatabase} 
                  disabled={updating}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {updating ? (
                    <>
                      <Loader2 className="size-4 mr-2 animate-spin" />
                      Updating ({progress}%)...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="size-4 mr-2" />
                      Update {mismatchResults.length} Mismatches with Gov Data
                    </>
                  )}
                </Button>
                {updating && (
                  <Progress value={progress} className="mt-3" />
                )}
              </div>
            )}

            <Tabs defaultValue="mismatches">
              <TabsList>
                <TabsTrigger value="mismatches">
                  Mismatches ({mismatchResults.length})
                </TabsTrigger>
                <TabsTrigger value="matched">
                  Matched ({matchedResults.length})
                </TabsTrigger>
                <TabsTrigger value="unmatched">
                  Unmatched ({unmatchedResults.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="mismatches" className="space-y-3 mt-4">
                {mismatchResults.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No mismatches found! 🎉</p>
                ) : (
                  mismatchResults.map((result, idx) => (
                    <Card key={idx} className="border-yellow-300 bg-yellow-50">
                      <CardContent className="pt-6">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold text-lg">{result.dbVillage.name}</h4>
                              <p className="text-sm text-muted-foreground">Match Score: {result.matchScore}%</p>
                            </div>
                            <Badge variant="default" className="bg-yellow-600">
                              <AlertTriangle className="size-3 mr-1" />
                              Mismatch
                            </Badge>
                          </div>

                          {result.govVillage && (
                            <div className="text-sm">
                              <p className="text-muted-foreground mb-2">Matched with: <span className="font-medium text-foreground">{result.govVillage.organisationName}</span></p>
                            </div>
                          )}

                          {/* Show differences */}
                          <div className="space-y-2 border-t pt-3">
                            {result.differences.suburb && (
                              <div className="flex items-center gap-3 text-sm">
                                <span className="font-medium w-24">Suburb:</span>
                                <span className="text-red-600 line-through">{result.differences.suburb.current}</span>
                                <ArrowRight className="size-4 text-muted-foreground" />
                                <span className="text-green-600 font-medium">{result.differences.suburb.correct}</span>
                              </div>
                            )}
                            
                            {result.differences.operator && (
                              <div className="flex items-center gap-3 text-sm">
                                <span className="font-medium w-24">Operator:</span>
                                <span className="text-red-600 line-through">{result.differences.operator.current || '(empty)'}</span>
                                <ArrowRight className="size-4 text-muted-foreground" />
                                <span className="text-green-600 font-medium">{result.differences.operator.correct}</span>
                              </div>
                            )}
                            
                            {result.differences.postcode && (
                              <div className="flex items-center gap-3 text-sm">
                                <span className="font-medium w-24">Postcode:</span>
                                <span className="text-red-600 line-through">{result.differences.postcode.current}</span>
                                <ArrowRight className="size-4 text-muted-foreground" />
                                <span className="text-green-600 font-medium">{result.differences.postcode.correct}</span>
                              </div>
                            )}
                          </div>

                          {/* Google Verification Results */}
                          {result.googleVerified && (
                            <div className="border-t pt-3 mt-3">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge 
                                  variant="default" 
                                  className={
                                    result.googleVerified.confidence === 'high' 
                                      ? 'bg-green-600' 
                                      : result.googleVerified.confidence === 'medium'
                                      ? 'bg-yellow-600'
                                      : 'bg-gray-600'
                                  }
                                >
                                  🌐 Google Verified ({result.googleVerified.confidence} confidence)
                                </Badge>
                              </div>
                              <div className="bg-blue-50 border border-blue-200 rounded p-3 space-y-1">
                                <p className="text-sm">
                                  <span className="font-medium">Google says:</span>{' '}
                                  <span className="text-blue-900 font-semibold">
                                    {result.googleVerified.suburb || 'N/A'} VIC {result.googleVerified.postcode || 'N/A'}
                                  </span>
                                </p>
                                {result.googleVerified.address && (
                                  <p className="text-xs text-muted-foreground">
                                    Full address: {result.googleVerified.address}
                                  </p>
                                )}
                                
                                {/* Show which source matches Google */}
                                <div className="mt-2 pt-2 border-t border-blue-300">
                                  <p className="text-xs font-medium text-blue-900 mb-1">Google agrees with:</p>
                                  {result.googleVerified.suburb && result.differences.suburb && (
                                    <>
                                      {result.googleVerified.suburb.toLowerCase() === result.differences.suburb.correct.toLowerCase() ? (
                                        <Badge variant="default" className="bg-green-600 text-xs">
                                          ✅ Gov CSV is correct
                                        </Badge>
                                      ) : result.googleVerified.suburb.toLowerCase() === result.differences.suburb.current.toLowerCase() ? (
                                        <Badge variant="default" className="bg-red-600 text-xs">
                                          ✅ Current DB is correct
                                        </Badge>
                                      ) : (
                                        <Badge variant="default" className="bg-gray-600 text-xs">
                                          ⚠️ Neither match - manual review needed
                                        </Badge>
                                      )}
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Google Verification Button */}
                          {!result.googleVerified && (
                            <div className="border-t pt-3 mt-3">
                              {verifyingIndex === idx ? (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Loader2 className="size-4 animate-spin" />
                                  Verifying with Google...
                                </div>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => verifyWithGoogle(idx)}
                                  disabled={verifyingIndex !== null}
                                  className="border-blue-500 text-blue-600 hover:bg-blue-50"
                                >
                                  <Search className="size-4 mr-2" />
                                  Verify with Google
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="matched" className="space-y-2 mt-4">
                {matchedResults.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No perfect matches yet</p>
                ) : (
                  <div className="max-h-96 overflow-y-auto space-y-2">
                    {matchedResults.map((result, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 border rounded-lg bg-green-50">
                        <div>
                          <p className="font-medium">{result.dbVillage.name}</p>
                          <p className="text-sm text-muted-foreground">{result.dbVillage.suburb}, {result.dbVillage.state}</p>
                        </div>
                        <Badge variant="default" className="bg-green-600">
                          <Check className="size-3 mr-1" />
                          {result.matchScore}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="unmatched" className="space-y-2 mt-4">
                {unmatchedResults.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">All villages matched! 🎉</p>
                ) : (
                  <div className="max-h-96 overflow-y-auto space-y-2">
                    {unmatchedResults.map((result, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                        <div>
                          <p className="font-medium">{result.dbVillage.name}</p>
                          <p className="text-sm text-muted-foreground">{result.dbVillage.suburb}, {result.dbVillage.state}</p>
                        </div>
                        <Badge variant="destructive">
                          <X className="size-3 mr-1" />
                          No Match
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}