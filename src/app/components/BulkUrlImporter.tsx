import React, { useState } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { AlertCircle, CheckCircle, Upload } from 'lucide-react';

interface UrlUpdate {
  villageId: number;
  villageName: string;
  oldUrl: string;
  newUrl: string;
}

export function BulkUrlImporter() {
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<UrlUpdate[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      setError('Please select a CSV file');
      return;
    }

    setFile(selectedFile);
    setError(null);
    setSuccess(null);
    parseCSV(selectedFile);
  };

  const parseCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n');
        const updates: UrlUpdate[] = [];

        // Skip header row
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          // Parse CSV line (handle quoted fields)
          const fields = line.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g);
          if (!fields || fields.length < 4) continue;

          const villageId = parseInt(fields[0].replace(/"/g, ''));
          const villageName = fields[1].replace(/"/g, '');
          const oldUrl = fields[2].replace(/"/g, '');
          const newUrl = fields[3].replace(/"/g, '');

          // Only include rows where newUrl is different and not empty
          if (newUrl && newUrl !== oldUrl) {
            updates.push({
              villageId,
              villageName,
              oldUrl: oldUrl || '(no URL)',
              newUrl,
            });
          }
        }

        setPreview(updates);
        if (updates.length === 0) {
          setError('No URL updates found in CSV. Make sure you filled in the "Corrected URL" column.');
        }
      } catch (err: any) {
        setError(`Failed to parse CSV: ${err.message}`);
        console.error('CSV parsing error:', err);
      }
    };
    reader.readAsText(file);
  };

  const importUrls = async () => {
    if (preview.length === 0) {
      setError('No URL updates to import');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/database-stats/bulk-update-urls`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ updates: preview }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      const data = await response.json();
      setSuccess(`✅ Successfully updated ${data.updatedCount} village URLs!`);
      setPreview([]);
      setFile(null);
      
      // Reset file input
      const fileInput = document.getElementById('csv-file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (err: any) {
      setError(err.message);
      console.error('Error importing URLs:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* File Upload */}
      <div>
        <label htmlFor="csv-file-input" className="block text-sm font-medium mb-2">
          Upload Corrected CSV
        </label>
        <input
          id="csv-file-input"
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>

      {/* Error Message */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription>Error: {error}</AlertDescription>
        </Alert>
      )}

      {/* Success Message */}
      {success && (
        <Alert className="bg-green-50 border-green-300">
          <CheckCircle className="size-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {/* Preview */}
      {preview.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">
            📋 Preview: {preview.length} URL updates ready to import
          </h3>
          
          <div className="mb-4 p-4 bg-blue-50 border border-blue-300 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>⚠️ Review carefully!</strong> These changes will be applied to your database immediately.
            </p>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto border-2 border-gray-300 rounded-lg p-4 bg-gray-50">
            {preview.map((update, index) => (
              <div key={index} className="p-3 bg-white border border-gray-200 rounded">
                <div className="font-semibold text-gray-900">{update.villageName}</div>
                <div className="text-xs text-gray-500 mt-1">ID: {update.villageId}</div>
                <div className="mt-2 space-y-1 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-red-600 font-medium">Old:</span>
                    <span className="text-red-600 break-all">{update.oldUrl}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-600 font-medium">New:</span>
                    <span className="text-green-600 break-all">{update.newUrl}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex gap-3">
            <Button onClick={importUrls} disabled={loading} size="lg">
              {loading ? 'Importing...' : `✅ Import ${preview.length} URL Updates`}
            </Button>
            <Button
              onClick={() => {
                setPreview([]);
                setFile(null);
                const fileInput = document.getElementById('csv-file-input') as HTMLInputElement;
                if (fileInput) fileInput.value = '';
              }}
              variant="outline"
              size="lg"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Instructions */}
      {!file && !preview.length && (
        <div className="p-6 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg text-center">
          <Upload className="size-12 mx-auto text-gray-400 mb-3" />
          <h3 className="text-lg font-semibold mb-2">Upload Your Corrected CSV</h3>
          <p className="text-sm text-gray-600 mb-4">
            After exporting from the VIC URL Checker above, manually fill in the "Corrected URL" column in Excel/Google Sheets, then upload it here.
          </p>
          <p className="text-xs text-gray-500">
            CSV format: Village ID, Village Name, Current URL, <strong>Corrected URL (FILL THIS IN)</strong>, Status, Notes
          </p>
        </div>
      )}
    </div>
  );
}
