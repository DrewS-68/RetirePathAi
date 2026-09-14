import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Upload, Download, Search, Building2, AlertCircle, CheckCircle, Mail } from 'lucide-react';
import { getSupabaseClient } from '../utils/supabase/client';

interface OperatorFromCSV {
  name: string;
  contactEmail?: string;
  contactPhone?: string;
  state?: string;
  suburb?: string;
  villageName?: string;
  registrationNumber?: string;
}

interface GapAnalysisResult {
  missingOperators: OperatorFromCSV[];
  existingOperators: string[];
  totalUploaded: number;
  totalInDatabase: number;
  gapCount: number;
}

export function OperatorGapAnalysis() {
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<GapAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [showHeaderMapping, setShowHeaderMapping] = useState(false);
  const [headerMapping, setHeaderMapping] = useState<{
    operatorName: string;
    contactEmail: string;
    contactPhone: string;
    state: string;
    suburb: string;
    villageName: string;
    registrationNumber: string;
  }>({
    operatorName: '',
    contactEmail: '',
    contactPhone: '',
    state: '',
    suburb: '',
    villageName: '',
    registrationNumber: ''
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length === 0) {
        throw new Error('CSV file is empty');
      }

      // Parse headers
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      setCsvHeaders(headers);
      
      // Show header mapping UI
      setShowHeaderMapping(true);
      setUploading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse CSV file');
      setUploading(false);
    }
  };

  const analyzeGaps = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setAnalyzing(true);
    setError(null);

    try {
      // Parse CSV
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length === 0) {
        throw new Error('CSV file is empty');
      }

      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      const uploadedOperators: OperatorFromCSV[] = [];

      // Parse CSV data
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
        const row: any = {};
        
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });

        // Extract operator info (adjust field names based on your CSV structure)
        const operatorName = row['Operator Name'] || row['operator_name'] || row['Operator'] || row['Organisation'] || '';
        
        if (operatorName) {
          uploadedOperators.push({
            name: operatorName,
            contactEmail: row['Email'] || row['email'] || row['Contact Email'] || '',
            contactPhone: row['Phone'] || row['phone'] || row['Contact Phone'] || '',
            state: row['State'] || row['state'] || '',
            suburb: row['Suburb'] || row['suburb'] || row['Location'] || '',
            villageName: row['Village Name'] || row['village_name'] || row['Name'] || '',
            registrationNumber: row['Registration Number'] || row['registration_number'] || row['Reg No'] || ''
          });
        }
      }

      // Fetch existing operators from database
      const { data: dbOperators, error: dbError } = await getSupabaseClient()
        .from('villages_3bba8be8')
        .select('operator_name')
        .order('operator_name');

      if (dbError) throw dbError;

      // Get unique operators from database
      const existingOperatorNames = new Set(
        (dbOperators || []).map(v => v.operator_name?.toLowerCase().trim())
      );

      // Find missing operators
      const missingOperators = uploadedOperators.filter(op => {
        const normalizedName = op.name.toLowerCase().trim();
        return !existingOperatorNames.has(normalizedName);
      });

      // Remove duplicates from missing operators
      const uniqueMissingOperators = Array.from(
        new Map(missingOperators.map(op => [op.name.toLowerCase(), op])).values()
      );

      setResults({
        missingOperators: uniqueMissingOperators,
        existingOperators: Array.from(existingOperatorNames),
        totalUploaded: uploadedOperators.length,
        totalInDatabase: existingOperatorNames.size,
        gapCount: uniqueMissingOperators.length
      });

      setAnalyzing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze operators');
      setAnalyzing(false);
    }
  };

  const exportMissingOperators = () => {
    if (!results || results.missingOperators.length === 0) return;

    const headers = ['Operator Name', 'Contact Email', 'Contact Phone', 'State', 'Suburb', 'Village Name', 'Registration Number'];
    const csvContent = [
      headers.join(','),
      ...results.missingOperators.map(op => [
        `"${op.name}"`,
        `"${op.contactEmail || ''}"`,
        `"${op.contactPhone || ''}"`,
        `"${op.state || ''}"`,
        `"${op.suburb || ''}"`,
        `"${op.villageName || ''}"`,
        `"${op.registrationNumber || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `missing-operators-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const exportEmailList = () => {
    if (!results || results.missingOperators.length === 0) return;

    const operatorsWithEmail = results.missingOperators.filter(op => op.contactEmail);
    
    if (operatorsWithEmail.length === 0) {
      setError('No operators with email addresses found');
      return;
    }

    const csvContent = [
      'Operator Name,Email,State,Suburb',
      ...operatorsWithEmail.map(op => 
        `"${op.name}","${op.contactEmail}","${op.state || ''}","${op.suburb || ''}"`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `operator-email-list-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="mb-2">Operator Gap Analysis</h1>
        <p className="text-muted-foreground">
          Upload a CSV of retirement village operators from government registers to identify 
          which operators are missing from your database.
        </p>
      </div>

      {/* Instructions */}
      <Card className="p-6 mb-6 bg-blue-50 border-blue-200">
        <h3 className="mb-3">How to Use This Tool</h3>
        <ol className="space-y-2 text-sm text-muted-foreground">
          <li><strong>1. Get Government Data:</strong> Download operator registers from state Consumer Affairs websites</li>
          <li><strong>2. Upload CSV:</strong> Upload the CSV file containing operator information</li>
          <li><strong>3. Review Results:</strong> See which operators are missing from your database</li>
          <li><strong>4. Export Lists:</strong> Download lists for your pre-launch outreach campaign</li>
        </ol>
      </Card>

      {/* CSV Format Guide */}
      <Card className="p-6 mb-6">
        <h3 className="mb-3">Expected CSV Format</h3>
        <p className="text-sm text-muted-foreground mb-3">
          Your CSV should include at least an operator name column. Additional columns help with outreach:
        </p>
        <div className="bg-gray-50 p-4 rounded-lg border">
          <code className="text-sm">
            Operator Name, Contact Email, Contact Phone, State, Suburb, Village Name, Registration Number
          </code>
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          ℹ️ The tool will try to match common column names automatically (e.g., "Operator", "Organisation", "email", etc.)
        </p>
      </Card>

      {/* Upload Section */}
      <Card className="p-6 mb-6">
        <h3 className="mb-4">Upload Government Register CSV</h3>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors">
          <input
            type="file"
            accept=".csv"
            onChange={analyzeGaps}
            className="hidden"
            id="csv-upload"
            disabled={analyzing}
          />
          <label 
            htmlFor="csv-upload" 
            className="cursor-pointer flex flex-col items-center"
          >
            <Upload className="size-12 text-gray-400 mb-4" />
            <p className="mb-2">
              {analyzing ? 'Analyzing...' : 'Click to upload CSV file'}
            </p>
            <p className="text-sm text-muted-foreground">
              Supported format: CSV files from government registers
            </p>
          </label>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
            <AlertCircle className="size-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}
      </Card>

      {/* Results */}
      {results && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Upload className="size-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Uploaded</p>
                  <p className="text-2xl">{results.totalUploaded}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-lg">
                  <CheckCircle className="size-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">In Database</p>
                  <p className="text-2xl">{results.totalInDatabase}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-amber-100 p-2 rounded-lg">
                  <AlertCircle className="size-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Missing</p>
                  <p className="text-2xl">{results.gapCount}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <Mail className="size-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">With Email</p>
                  <p className="text-2xl">
                    {results.missingOperators.filter(op => op.contactEmail).length}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Export Buttons */}
          <Card className="p-6">
            <h3 className="mb-4">Export Options</h3>
            <div className="flex gap-3 flex-wrap">
              <Button onClick={exportMissingOperators} disabled={results.gapCount === 0}>
                <Download className="size-4 mr-2" />
                Export All Missing Operators
              </Button>
              <Button 
                onClick={exportEmailList} 
                variant="outline"
                disabled={results.missingOperators.filter(op => op.contactEmail).length === 0}
              >
                <Mail className="size-4 mr-2" />
                Export Email List Only
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-3">
              Use these lists for your pre-launch outreach campaign to invite missing operators
            </p>
          </Card>

          {/* Missing Operators Table */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3>Missing Operators ({results.gapCount})</h3>
              <div className="text-sm text-muted-foreground">
                Ready for outreach campaign
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 text-sm">Operator Name</th>
                    <th className="text-left p-3 text-sm">Email</th>
                    <th className="text-left p-3 text-sm">Phone</th>
                    <th className="text-left p-3 text-sm">State</th>
                    <th className="text-left p-3 text-sm">Location</th>
                  </tr>
                </thead>
                <tbody>
                  {results.missingOperators.map((operator, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Building2 className="size-4 text-gray-400" />
                          <span>{operator.name}</span>
                        </div>
                      </td>
                      <td className="p-3 text-sm">
                        {operator.contactEmail ? (
                          <span className="text-green-600">{operator.contactEmail}</span>
                        ) : (
                          <span className="text-gray-400">No email</span>
                        )}
                      </td>
                      <td className="p-3 text-sm text-muted-foreground">
                        {operator.contactPhone || '-'}
                      </td>
                      <td className="p-3 text-sm">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                          {operator.state || 'Unknown'}
                        </span>
                      </td>
                      <td className="p-3 text-sm text-muted-foreground">
                        {operator.suburb || operator.villageName || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Next Steps */}
          <Card className="p-6 bg-green-50 border-green-200">
            <h3 className="mb-3">Next Steps for Pre-Launch Outreach</h3>
            <ol className="space-y-2 text-sm">
              <li className="flex gap-2">
                <span className="flex-shrink-0 font-semibold">1.</span>
                <span>Export the email list using the button above</span>
              </li>
              <li className="flex gap-2">
                <span className="flex-shrink-0 font-semibold">2.</span>
                <span>Draft a personalized outreach email emphasizing free listing and local visibility</span>
              </li>
              <li className="flex gap-2">
                <span className="flex-shrink-0 font-semibold">3.</span>
                <span>Send emails to operators 2-3 weeks before launch</span>
              </li>
              <li className="flex gap-2">
                <span className="flex-shrink-0 font-semibold">4.</span>
                <span>Follow up with phone calls to operators without email addresses</span>
              </li>
              <li className="flex gap-2">
                <span className="flex-shrink-0 font-semibold">5.</span>
                <span>Prioritize smaller regional operators who need visibility most</span>
              </li>
            </ol>
          </Card>
        </div>
      )}

      {/* Government Register Resources */}
      <Card className="p-6 bg-purple-50 border-purple-200">
        <h3 className="mb-3">Where to Find Government Registers</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-semibold mb-2">Victoria</p>
            <p className="text-muted-foreground">Consumer Affairs Victoria - Register of Retirement Villages</p>
          </div>
          <div>
            <p className="font-semibold mb-2">New South Wales</p>
            <p className="text-muted-foreground">NSW Fair Trading - Retirement Villages Register</p>
          </div>
          <div>
            <p className="font-semibold mb-2">Queensland</p>
            <p className="text-muted-foreground">Queensland Government - Retirement Villages</p>
          </div>
          <div>
            <p className="font-semibold mb-2">Other States</p>
            <p className="text-muted-foreground">Contact respective Consumer Affairs departments</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-4">
          💡 Tip: Many states provide downloadable spreadsheets or public databases. Contact them directly if CSV export isn't available online.
        </p>
      </Card>
    </div>
  );
}