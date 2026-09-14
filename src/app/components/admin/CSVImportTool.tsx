import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { Upload, Download, CheckCircle, XCircle, AlertCircle, Loader2, FileSpreadsheet } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface CSVRow {
  name: string;
  operator: string;
  suburb: string;
  state: string;
  postcode: string;
  website: string;
  facility_type: string;
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

export default function CSVImportTool() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<CSVRow[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const downloadTemplate = () => {
    const template = `name,operator,suburb,state,postcode,website,facility_type
ECH Crescent Lodge,ECH,Colonel Light Gardens,SA,5041,https://ech.asn.au,retirement_village
ECH Glendore,ECH,Glendore,SA,5037,,both
Example Village,Example Operator,Example Suburb,NSW,2000,https://example.com,aged_care`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'village_import_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const parseCSV = (text: string): CSVRow[] => {
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    const rows: CSVRow[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      rows.push(row);
    }
    
    return rows;
  };

  const validateRow = (row: CSVRow, rowIndex: number): ValidationError[] => {
    const errors: ValidationError[] = [];
    
    // Required fields
    if (!row.name || row.name.trim() === '') {
      errors.push({ row: rowIndex, field: 'name', message: 'Name is required' });
    }
    
    if (!row.suburb || row.suburb.trim() === '') {
      errors.push({ row: rowIndex, field: 'suburb', message: 'Suburb is required' });
    }
    
    // State validation
    const validStates = ['ACT', 'NSW', 'NT', 'QLD', 'SA', 'TAS', 'VIC', 'WA'];
    if (!row.state || !validStates.includes(row.state.toUpperCase())) {
      errors.push({ row: rowIndex, field: 'state', message: `State must be one of: ${validStates.join(', ')}` });
    }
    
    // Facility type validation
    const validFacilityTypes = ['retirement_village', 'aged_care', 'both', 'unclassified'];
    if (row.facility_type && !validFacilityTypes.includes(row.facility_type.toLowerCase())) {
      errors.push({ row: rowIndex, field: 'facility_type', message: `Facility type must be one of: ${validFacilityTypes.join(', ')}` });
    }
    
    // Website validation (if provided)
    if (row.website && row.website.trim() !== '') {
      try {
        new URL(row.website);
      } catch {
        errors.push({ row: rowIndex, field: 'website', message: 'Invalid URL format' });
      }
    }
    
    return errors;
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setPreview([]);
    setValidationErrors([]);
    setSuccess(null);
    setError(null);

    try {
      setLoading(true);
      
      const text = await selectedFile.text();
      const rows = parseCSV(text);
      
      // Validate all rows
      const allErrors: ValidationError[] = [];
      rows.forEach((row, index) => {
        const errors = validateRow(row, index + 2); // +2 because row 1 is headers
        allErrors.push(...errors);
      });
      
      setPreview(rows);
      setValidationErrors(allErrors);
      
      if (allErrors.length === 0) {
        setSuccess(`✅ File validated successfully! ${rows.length} villages ready to import.`);
      } else {
        setError(`⚠️ Found ${allErrors.length} validation error(s). Please fix them before importing.`);
      }
      
    } catch (err: any) {
      console.error('Error parsing CSV:', err);
      setError(`Failed to parse CSV file: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (preview.length === 0) {
      setError('No data to import');
      return;
    }

    if (validationErrors.length > 0) {
      setError('Please fix validation errors before importing');
      return;
    }

    try {
      setImporting(true);
      setError(null);
      setSuccess(null);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/cleanup/bulk-import`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ villages: preview }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to import villages');
      }

      const data = await response.json();
      
      setSuccess(`🎉 Successfully imported ${data.imported} village(s)! ${data.skipped > 0 ? `Skipped ${data.skipped} duplicate(s).` : ''}`);
      
      // Reset form
      setFile(null);
      setPreview([]);
      setValidationErrors([]);
      
      // Clear file input
      const fileInput = document.getElementById('csv-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
      // Trigger directory refresh
      window.dispatchEvent(new CustomEvent('villageDataUpdated'));
      
    } catch (err: any) {
      console.error('Error importing villages:', err);
      setError(err.message || 'Failed to import villages');
    } finally {
      setImporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          Bulk CSV Import
        </CardTitle>
        <CardDescription>
          Import multiple villages at once using a CSV file. Perfect for large operators like ECH (103 villages).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Download Template */}
        <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <Download className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="font-medium text-blue-900">Step 1: Download Template</div>
            <p className="text-sm text-blue-700 mt-1">
              Download the CSV template, fill it with village data, then upload it back.
            </p>
            <Button onClick={downloadTemplate} variant="outline" size="sm" className="mt-2">
              <Download className="h-4 w-4 mr-2" />
              Download Template CSV
            </Button>
          </div>
        </div>

        {/* Template Format Guide */}
        <div className="p-4 bg-gray-50 border rounded-lg">
          <div className="font-medium mb-2">CSV Format:</div>
          <div className="text-sm space-y-1 text-gray-700">
            <div><strong>Required:</strong> name, suburb, state</div>
            <div><strong>Optional:</strong> operator, postcode, website, facility_type</div>
            <div><strong>States:</strong> ACT, NSW, NT, QLD, SA, TAS, VIC, WA</div>
            <div><strong>Facility Types:</strong> retirement_village, aged_care, both, unclassified</div>
            <div className="text-xs text-gray-500 mt-2">
              💡 Tip: Open in Excel/Google Sheets, paste data from ECH map, save as CSV
            </div>
          </div>
        </div>

        {/* Upload File */}
        <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
          <Upload className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="font-medium text-green-900">Step 2: Upload Your CSV</div>
            <p className="text-sm text-green-700 mt-1 mb-3">
              Select your completed CSV file to validate and preview the data.
            </p>
            <input
              id="csv-upload"
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-green-600 file:text-white
                hover:file:bg-green-700
                cursor-pointer"
            />
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <Alert>
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertDescription>Validating CSV file...</AlertDescription>
          </Alert>
        )}

        {/* Success Message */}
        {success && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {/* Error Message */}
        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="font-medium text-red-900 mb-2 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Validation Errors ({validationErrors.length})
            </div>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {validationErrors.map((err, index) => (
                <div key={index} className="text-sm text-red-700">
                  <strong>Row {err.row}, {err.field}:</strong> {err.message}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Preview Table */}
        {preview.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-medium">
                Preview ({preview.length} village{preview.length !== 1 ? 's' : ''})
              </div>
              <Button 
                onClick={handleImport} 
                disabled={importing || validationErrors.length > 0}
                className="bg-green-600 hover:bg-green-700"
              >
                {importing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Import {preview.length} Village{preview.length !== 1 ? 's' : ''}
                  </>
                )}
              </Button>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto max-h-96">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">#</th>
                      <th className="px-3 py-2 text-left font-medium">Name</th>
                      <th className="px-3 py-2 text-left font-medium">Operator</th>
                      <th className="px-3 py-2 text-left font-medium">Suburb</th>
                      <th className="px-3 py-2 text-left font-medium">State</th>
                      <th className="px-3 py-2 text-left font-medium">Postcode</th>
                      <th className="px-3 py-2 text-left font-medium">Facility Type</th>
                      <th className="px-3 py-2 text-left font-medium">Website</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row, index) => {
                      const rowErrors = validationErrors.filter(e => e.row === index + 2);
                      const hasError = rowErrors.length > 0;
                      
                      return (
                        <tr 
                          key={index} 
                          className={hasError ? 'bg-red-50' : index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                        >
                          <td className="px-3 py-2 border-t">
                            {hasError ? (
                              <XCircle className="h-4 w-4 text-red-600" />
                            ) : (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            )}
                          </td>
                          <td className="px-3 py-2 border-t font-medium">{row.name || <span className="text-red-500">Missing</span>}</td>
                          <td className="px-3 py-2 border-t text-gray-600">{row.operator || '-'}</td>
                          <td className="px-3 py-2 border-t">{row.suburb || <span className="text-red-500">Missing</span>}</td>
                          <td className="px-3 py-2 border-t">{row.state || <span className="text-red-500">Missing</span>}</td>
                          <td className="px-3 py-2 border-t text-gray-600">{row.postcode || '-'}</td>
                          <td className="px-3 py-2 border-t">
                            <span className={`text-xs px-2 py-1 rounded ${
                              row.facility_type === 'retirement_village' ? 'bg-blue-100 text-blue-700' :
                              row.facility_type === 'aged_care' ? 'bg-purple-100 text-purple-700' :
                              row.facility_type === 'both' ? 'bg-green-100 text-green-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {row.facility_type || 'unclassified'}
                            </span>
                          </td>
                          <td className="px-3 py-2 border-t text-xs text-gray-500 truncate max-w-[200px]">
                            {row.website || '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Import Instructions */}
        {preview.length === 0 && !file && (
          <div className="p-4 border-2 border-dashed rounded-lg text-center text-gray-500">
            <FileSpreadsheet className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">No file selected</p>
            <p className="text-sm mt-1">Download the template, fill it out, then upload it here</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
