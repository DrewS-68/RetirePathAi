import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { Upload, Play, CheckCircle, XCircle, Loader, AlertCircle, Download, FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';

interface VillageRow {
  id: string;
  name: string;
  operator: string;
  suburb: string;
  postcode: string;
  state: string;
  currentWebsite: string;
  location: string;
  newUrl: string; // User will fill this in
  status: 'pending' | 'processing' | 'success' | 'error';
  error?: string;
}

export function BulkURLFixerCSV() {
  const { accessToken } = useAuth();
  const [villages, setVillages] = useState<VillageRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [completed, setCompleted] = useState(0);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('📁 handleFileUpload triggered!');
    const file = event.target.files?.[0];
    console.log('📁 Selected file:', file?.name, file?.size, 'bytes');
    
    if (!file) {
      console.log('❌ No file selected');
      return;
    }

    console.log(`📁 Reading file: ${file.name} (${file.size} bytes)`);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      console.log('📁 File read complete, length:', text?.length);
      parseCSV(text);
    };
    reader.onerror = (e) => {
      console.error('❌ FileReader error:', e);
    };
    reader.readAsText(file);
  };

  const parseCSV = (csvText: string) => {
    const lines = csvText.split('\n').filter(line => line.trim());
    
    console.log('📄 Total lines in CSV:', lines.length);
    console.log('📄 First line (header):', lines[0]);
    if (lines[1]) console.log('📄 Second line (first data):', lines[1]);
    
    if (lines.length < 2) {
      alert('❌ CSV appears to be empty or only has a header row!');
      return;
    }
    
    // Parse header to detect column format
    const headerLine = lines[0];
    let headerFields = headerLine.split(',');
    
    // Handle quoted fields in header
    if (headerLine.includes('"')) {
      const regex = /("(?:[^"]|"")*"|[^,]*)(,|$)/g;
      headerFields = [];
      let match;
      while ((match = regex.exec(headerLine)) !== null) {
        let field = match[1];
        if (field.startsWith('"') && field.endsWith('"')) {
          field = field.slice(1, -1).replace(/""/g, '"');
        }
        headerFields.push(field.trim());
      }
    }
    
    console.log('📋 Headers detected:', headerFields);
    
    // Detect column indices by header name (case-insensitive)
    const getColumnIndex = (possibleNames: string[]) => {
      return headerFields.findIndex(h => 
        possibleNames.some(name => h.toLowerCase().includes(name.toLowerCase()))
      );
    };
    
    const columnMap = {
      id: getColumnIndex(['id']),
      name: getColumnIndex(['name', 'village name']),
      operator: getColumnIndex(['operator', 'provider']),
      suburb: getColumnIndex(['suburb', 'city', 'town']),
      postcode: getColumnIndex(['postcode', 'post code', 'zip']),
      state: getColumnIndex(['state']),
      currentWebsite: getColumnIndex(['current website', 'current url', 'old url', 'bad url']),
      location: getColumnIndex(['location']),
      newUrl: getColumnIndex(['new website', 'new url', 'correct url', 'website'])
    };
    
    console.log('🗺️ Column mapping:', columnMap);
    
    // Validate required columns
    if (columnMap.name === -1) {
      alert('❌ CSV must have a "Name" column!');
      return;
    }
    
    // Skip header row
    const dataLines = lines.slice(1);
    
    const parsed: VillageRow[] = dataLines.map((line, index) => {
      // Try multiple CSV parsing strategies
      
      // Strategy 1: Split by comma (simple)
      let fields = line.split(',');
      
      // Strategy 2: Handle quoted fields properly
      if (line.includes('"')) {
        // Use regex to handle quoted fields with commas inside
        const regex = /("(?:[^"]|"")*"|[^,]*)(,|$)/g;
        fields = [];
        let match;
        while ((match = regex.exec(line)) !== null) {
          let field = match[1];
          // Remove surrounding quotes and unescape doubled quotes
          if (field.startsWith('"') && field.endsWith('"')) {
            field = field.slice(1, -1).replace(/""/g, '"');
          }
          fields.push(field.trim());
        }
      }
      
      console.log(`\n🔍 Line ${index + 1}:`);
      console.log('Raw line:', line.substring(0, 200)); // First 200 chars
      console.log('Fields found:', fields.length);
      console.log('All fields:', fields);
      
      // Use column mapping to extract values
      const getValue = (colIndex: number) => {
        if (colIndex === -1 || colIndex >= fields.length) return '';
        return fields[colIndex].trim();
      };
      
      const row = {
        // Generate a unique ID from name if ID column doesn't exist
        id: getValue(columnMap.id) || `auto-${index}`,
        name: getValue(columnMap.name),
        operator: getValue(columnMap.operator),
        suburb: getValue(columnMap.suburb),
        postcode: getValue(columnMap.postcode),
        state: getValue(columnMap.state),
        currentWebsite: getValue(columnMap.currentWebsite),
        location: getValue(columnMap.location),
        newUrl: getValue(columnMap.newUrl),
        status: 'pending' as const
      };
      
      // Skip if name is empty
      if (!row.name) {
        console.log(`⚠️ Skipping line ${index + 1} - no name found`);
        return null;
      }
      
      console.log(`📋 Parsed village: "${row.name}"`);
      console.log(`   ID: "${row.id}"`);
      console.log(`   Operator: "${row.operator}"`);
      console.log(`   Current URL: "${row.currentWebsite}"`);
      console.log(`   New URL (field 9): "${row.newUrl}"`);
      
      return row;
    }).filter(Boolean) as VillageRow[];

    setVillages(parsed);
    console.log(`\n✅ Loaded ${parsed.length} villages from CSV`);
    
    // Count how many already have URLs filled in
    const preFilledUrls = parsed.filter(v => v.newUrl.trim() !== '').length;
    console.log(`🔗 ${preFilledUrls} villages have URLs pre-filled`);
    
    if (parsed.length === 0) {
      alert(`❌ No villages were loaded from the CSV!\n\nPossible issues:\n1. CSV format is not recognized\n2. CSV might be corrupted\n3. Wrong file uploaded\n\nPlease check the console for details.`);
    } else if (preFilledUrls > 0) {
      alert(`✅ Loaded ${parsed.length} villages!\n\n${preFilledUrls} already have new URLs filled in.\n${parsed.length - preFilledUrls} still need URLs.`);
    } else {
      alert(`⚠️ Loaded ${parsed.length} villages, but NO new URLs were found!\n\nPlease check:\n1. Did you fill in the "New URL" column (column 9)?\n2. Is the CSV saved properly?\n\nYou can still add URLs manually in the table below.`);
    }
  };

  const updateNewUrl = (id: string, newUrl: string) => {
    setVillages(prev => 
      prev.map(v => v.id === id ? { ...v, newUrl } : v)
    );
  };

  const processBulkUpdate = async () => {
    const villagesToUpdate = villages.filter(v => v.newUrl.trim() !== '');
    
    if (villagesToUpdate.length === 0) {
      alert('⚠️ Please add at least one new URL before processing');
      return;
    }

    if (!confirm(`🚀 Ready to update ${villagesToUpdate.length} village URLs?\n\nThis will update in database:\n✅ Website URLs\n✅ Operator names\n✅ Village names (if corrected)\n✅ Location (suburb/state/postcode)\n✅ Reset scrape status\n\nNote: This does NOT trigger scraping - use the scraper tools separately.\n\nContinue?`)) {
      return;
    }

    setProcessing(true);
    setCompleted(0);

    for (const village of villagesToUpdate) {
      try {
        // Update status to processing
        setVillages(prev => 
          prev.map(v => v.id === village.id ? { ...v, status: 'processing' as const } : v)
        );

        console.log(`🔄 Processing ${village.name}...`);

        // Call the bulk URL fixer endpoint
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/bulk-url-fixer/update-and-scrape`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              villageName: village.name,
              newUrl: village.newUrl,
              operator: village.operator,
              suburb: village.suburb,
              state: village.state,
              postcode: village.postcode
            })
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Scrape failed: ${errorText}`);
        }

        const result = await response.json();

        // Update status to success
        setVillages(prev => 
          prev.map(v => v.id === village.id ? { ...v, status: 'success' as const } : v)
        );

        setCompleted(c => c + 1);
        console.log(`✅ Completed ${village.name}`);

      } catch (error) {
        console.error(`❌ Error processing ${village.name}:`, error);
        
        // Update status to error
        setVillages(prev => 
          prev.map(v => v.id === village.id ? { 
            ...v, 
            status: 'error' as const,
            error: error instanceof Error ? error.message : 'Unknown error'
          } : v)
        );
      }

      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    setProcessing(false);
    alert(`✅ Bulk update complete!\n\nSuccessful: ${villages.filter(v => v.status === 'success').length}\nFailed: ${villages.filter(v => v.status === 'error').length}`);
  };

  const downloadTemplate = () => {
    const csv = `ID,Name,Operator,Suburb,Postcode,State,Current Website (BAD),Location\n` +
      `"example-id-123","Sample Village Name","Sample Operator","Sample Suburb","3000","VIC","https://directory-url.com","Sample Location"\n`;
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bulk_url_fixer_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: VillageRow['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-gray-100">Pending</Badge>;
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-700"><Loader className="size-3 mr-1 animate-spin inline" />Processing</Badge>;
      case 'success':
        return <Badge className="bg-green-100 text-green-700"><CheckCircle className="size-3 mr-1 inline" />Success</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-700"><XCircle className="size-3 mr-1 inline" />Error</Badge>;
    }
  };

  const pendingCount = villages.filter(v => v.status === 'pending' && v.newUrl.trim() !== '').length;
  const successCount = villages.filter(v => v.status === 'success').length;
  const errorCount = villages.filter(v => v.status === 'error').length;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Upload className="size-8" />
          Bulk URL Fixer (Update Only)
        </h1>
        <p className="text-gray-600">
          Updates: Website URLs, Operator names, Village names, Suburb/State/Postcode - Scraping done separately
        </p>
      </div>

      {/* Upload Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Step 1: Upload CSV</CardTitle>
          <CardDescription>
            Upload the CSV exported from the Data Quality Analyzer containing villages with bad directory URLs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                disabled={processing}
                id="csv-upload"
                className="hidden"
                ref={(input) => {
                  if (input) {
                    (window as any).csvUploadInput = input;
                  }
                }}
              />
              <Button
                type="button"
                size="lg"
                className="w-full"
                disabled={processing}
                onClick={() => {
                  console.log('🖱️ Upload button clicked!');
                  const input = document.getElementById('csv-upload') as HTMLInputElement;
                  console.log('📂 File input element:', input);
                  if (input) {
                    input.click();
                    console.log('✅ Triggered file input click');
                  } else {
                    console.error('❌ Could not find file input element!');
                  }
                }}
              >
                <Upload className="size-5 mr-2" />
                {villages.length === 0 ? 'Upload CSV File' : 'Upload Different CSV'}
              </Button>
            </div>
            <Button
              variant="outline"
              onClick={downloadTemplate}
              disabled={processing}
              size="lg"
            >
              <Download className="size-4 mr-2" />
              Download Template
            </Button>
          </div>
          
          {villages.length > 0 && (
            <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle className="size-5" />
                <span className="font-semibold">
                  ✅ Loaded {villages.length} villages from CSV
                </span>
              </div>
              <div className="mt-2 text-sm text-green-600">
                {villages.filter(v => v.newUrl.trim() !== '').length} villages have new URLs filled in
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {villages.length > 0 && (
        <>
          {/* Stats */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-sm text-gray-600">Ready to Process</div>
                  <div className="text-2xl font-bold text-blue-600">{pendingCount}</div>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <div className="text-sm text-gray-600">Processing</div>
                  <div className="text-2xl font-bold text-yellow-600">
                    {villages.filter(v => v.status === 'processing').length}
                  </div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-sm text-gray-600">Success</div>
                  <div className="text-2xl font-bold text-green-600">{successCount}</div>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <div className="text-sm text-gray-600">Failed</div>
                  <div className="text-2xl font-bold text-red-600">{errorCount}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Button */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Step 2: Add Correct URLs & Process</CardTitle>
              <CardDescription>
                Fill in the "New URL" column below, then click "Start Bulk Update & Scrape"
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={processBulkUpdate}
                disabled={processing || pendingCount === 0}
                size="lg"
                className="w-full"
              >
                {processing ? (
                  <>
                    <Loader className="mr-2 size-5 animate-spin" />
                    Processing {completed}/{pendingCount}...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 size-5" />
                    Update URLs in Database ({pendingCount} villages)
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Table */}
          <Card>
            <CardHeader>
              <CardTitle>Villages ({villages.length})</CardTitle>
              <CardDescription>
                Add the correct website URL for each village. Leave blank to skip.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-2 text-left font-semibold">Status</th>
                      <th className="p-2 text-left font-semibold">Village Name</th>
                      <th className="p-2 text-left font-semibold">Location</th>
                      <th className="p-2 text-left font-semibold">Current (Bad) URL</th>
                      <th className="p-2 text-left font-semibold w-80">New URL ✏️</th>
                    </tr>
                  </thead>
                  <tbody>
                    {villages.map((village) => (
                      <tr key={village.id} className="border-t hover:bg-gray-50">
                        <td className="p-2">
                          {getStatusBadge(village.status)}
                        </td>
                        <td className="p-2 font-medium">
                          {village.name}
                          {village.error && (
                            <div className="text-xs text-red-600 mt-1">
                              <AlertCircle className="size-3 inline mr-1" />
                              {village.error}
                            </div>
                          )}
                        </td>
                        <td className="p-2 text-gray-600">
                          {village.suburb}, {village.state} {village.postcode}
                        </td>
                        <td className="p-2">
                          <div className="text-xs text-red-600 truncate max-w-xs" title={village.currentWebsite}>
                            {village.currentWebsite}
                          </div>
                        </td>
                        <td className="p-2">
                          <Input
                            type="url"
                            placeholder="https://correct-village-website.com.au"
                            value={village.newUrl}
                            onChange={(e) => updateNewUrl(village.id, e.target.value)}
                            disabled={processing || village.status === 'success'}
                            className={village.status === 'success' ? 'bg-green-50' : ''}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Instructions */}
      {villages.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="size-5" />
              How to Use (2 Workflows)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Workflow 1: Pre-fill CSV */}
              <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-300">
                <h4 className="font-bold text-blue-900 mb-3">⚡ RECOMMENDED: Pre-fill URLs in CSV (Faster!)</h4>
                <ol className="space-y-2 list-decimal list-inside text-sm">
                  <li>
                    <strong>Export CSV</strong> from Data Quality Analyzer → Analytics tab → Click "Export CSV (41)"
                  </li>
                  <li>
                    <strong>Open CSV in Excel/Google Sheets</strong> → You'll see a column called "New URL (PASTE CORRECT URL HERE)"
                  </li>
                  <li>
                    <strong>Research & paste correct URLs</strong> directly in the CSV file for each village
                  </li>
                  <li>
                    <strong>Save the CSV</strong> with your new URLs filled in
                  </li>
                  <li>
                    <strong>Upload that CSV here</strong> → All URLs will auto-populate!
                  </li>
                  <li>
                    <strong>Click "Start Bulk Update & Scrape"</strong> → Done! ✅
                  </li>
                </ol>
              </div>

              {/* Workflow 2: Fill in UI */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-bold text-gray-900 mb-3">🐌 Alternative: Fill URLs in the UI</h4>
                <ol className="space-y-2 list-decimal list-inside text-sm">
                  <li>
                    <strong>Export CSV</strong> from Data Quality Analyzer
                  </li>
                  <li>
                    <strong>Upload CSV here</strong> (leave "New URL" column empty in CSV)
                  </li>
                  <li>
                    <strong>Manually type URLs</strong> in the table below after uploading
                  </li>
                  <li>
                    <strong>Click "Start Bulk Update & Scrape"</strong>
                  </li>
                </ol>
              </div>

              <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-start gap-2">
                  <CheckCircle className="size-5 text-green-600 mt-0.5" />
                  <div className="text-sm text-green-800">
                    <strong>Best Practice:</strong> Use Workflow 1 (pre-fill CSV) - it's easier to research URLs in Excel/Sheets, 
                    you can copy/paste faster, and you'll have a backup of your work!
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}