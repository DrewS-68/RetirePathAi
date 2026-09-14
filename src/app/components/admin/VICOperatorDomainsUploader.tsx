import { useState } from 'react';
import { Upload, CheckCircle, AlertCircle, Zap } from 'lucide-react';
import { Button } from '../ui/button';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

export function VICOperatorDomainsUploader() {
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Generate and upload sample CSV with common VIC operators
  const generateSampleCSV = async () => {
    const sampleCSV = `operator,domain
Stockland,stockland.com.au
Aveo Group,aveo.com.au
Australian Unity,australianunity.com.au
Lendlease,lendlease.com
Baptcare,baptcare.org.au
Bolton Clarke,boltonclarke.com.au
Uniting AgeWell,unitingagewell.org
Mecwacare,mecwacare.org.au
St Vincent's Care Services,svcs.org.au
Mercy Health,mercyhealth.com.au`;

    setUploading(true);
    setSuccess(null);
    setError(null);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/vic-operator-domains/upload`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ csvData: sampleCSV })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      setSuccess(`✅ Generated and uploaded ${data.count} sample operator domains! You can now test the scraper.`);
    } catch (err: any) {
      setError(err.message || 'Failed to generate sample CSV');
    } finally {
      setUploading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setSuccess(null);
    setError(null);

    try {
      // Read file as text
      const text = await file.text();
      
      // Basic validation - check if it looks like CSV
      const lines = text.trim().split('\n');
      if (lines.length < 2) {
        throw new Error('CSV file appears to be empty or invalid');
      }

      // Check header
      const header = lines[0].toLowerCase();
      if (!header.includes('operator') || !header.includes('domain')) {
        throw new Error('CSV must have "operator" and "domain" columns');
      }

      console.log(`📤 Uploading CSV with ${lines.length - 1} operator domains...`);

      // Upload to backend KV store
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/vic-operator-domains/upload`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ csvData: text })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      setSuccess(`✅ Successfully uploaded ${lines.length - 1} operator domains!`);
      console.log('Upload success:', data);

      // Clear file input
      e.target.value = '';
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload CSV file');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg shadow-lg p-6 border-2 border-purple-200">
      <div className="flex items-start gap-4 mb-4">
        <div className="bg-purple-100 rounded-lg p-3">
          <Upload className="w-8 h-8 text-purple-600" />
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-purple-900 mb-1">
            📁 Upload Operator Domains CSV
          </h2>
          <p className="text-sm text-purple-700">
            <strong>REQUIRED FIRST STEP:</strong> Upload your CSV file containing VIC operator names and their website domains.
            This file enables the Multi-Strategy Scraper to search operator-specific websites.
          </p>
        </div>
      </div>

      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">📋 CSV Format Required:</h3>
        <div className="text-sm text-blue-800 font-mono bg-white p-2 rounded border">
          operator,domain<br/>
          Stockland,stockland.com.au<br/>
          Aveo Group,aveo.com.au<br/>
          Australian Unity,australianunity.com.au
        </div>
        <p className="text-xs text-blue-700 mt-2">
          ✅ Must have "operator" and "domain" columns<br/>
          ✅ Expected: ~117 VIC operators with verified domains
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            disabled={uploading}
            className="block w-full text-sm text-gray-700 border border-gray-300 rounded-lg cursor-pointer bg-white hover:bg-gray-50 focus:outline-none p-2"
          />
        </div>

        {uploading && (
          <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-300 rounded-lg animate-pulse">
            <div className="w-5 h-5 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="font-medium text-blue-900">Uploading CSV...</span>
          </div>
        )}

        {success && (
          <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-300 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-green-900">{success}</div>
              <p className="text-sm text-green-700 mt-1">
                You can now use the Multi-Strategy Scraper below! 🎯
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-300 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-red-900">Upload Failed</div>
              <div className="text-sm text-red-700 mt-1">{error}</div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4">
        <Button
          onClick={generateSampleCSV}
          disabled={uploading}
          className="bg-purple-500 text-white hover:bg-purple-600"
        >
          <Zap className="w-4 h-4 mr-2" />
          Generate Sample CSV
        </Button>
      </div>
    </div>
  );
}