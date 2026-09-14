import React, { useState, useRef } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Upload, CheckCircle, AlertCircle, Download, FileSpreadsheet, Building2 } from 'lucide-react';
import { getSupabaseClient } from '../../utils/supabase/client';
import Papa from 'papaparse';

interface VICOperator {
  operatorName: string;
  villageName?: string;
  address?: string;
  suburb?: string;
  postcode?: string;
  contactEmail?: string;
  contactPhone?: string;
  registrationNumber?: string;
  websiteUrl?: string; // Add website URL support
  [key: string]: any; // Allow for flexible CSV columns
}

interface ImportResult {
  success: number;
  failed: number;
  skipped: number;
  errors: string[];
  newVillages: number;
  existingOperators: number;
}

export function VICDataImporter() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [showHeaderMapping, setShowHeaderMapping] = useState(false);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [updateMode, setUpdateMode] = useState(true); // NEW: Toggle between insert-only and update mode
  const [headerMapping, setHeaderMapping] = useState<{
    operatorName: string;
    villageName: string;
    address: string;
    suburb: string;
    postcode: string;
    contactEmail: string;
    contactPhone: string;
    registrationNumber: string;
    websiteUrl: string;
  }>({
    operatorName: '',
    villageName: '',
    address: '',
    suburb: '',
    postcode: '',
    contactEmail: '',
    contactPhone: '',
    registrationNumber: '',
    websiteUrl: ''
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    setResults(null);

    try {
      // Use PapaParse to properly handle multi-line cells with newlines
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        encoding: 'UTF-8',
        complete: (results) => {
          try {
            if (!results.data || results.data.length === 0) {
              throw new Error('CSV file is empty or could not be parsed');
            }

            console.log(`📄 PapaParse results: ${results.data.length} rows`);
            console.log(`📋 Headers:`, results.meta.fields);
            
            const validHeaders = results.meta.fields?.filter(h => h && h.trim().length > 0) || [];
            
            if (validHeaders.length === 0) {
              throw new Error('No valid headers found in CSV file');
            }
            
            setCsvHeaders(validHeaders);
            setParsedData(results.data);
            
            // Smart auto-mapping - detect common column names
            const autoMapping = {
              operatorName: '',
              villageName: '',
              address: '',
              suburb: '',
              postcode: '',
              contactEmail: '',
              contactPhone: '',
              registrationNumber: '',
              websiteUrl: '' // Add website URL support
            };
            
            validHeaders.forEach(header => {
              const lowerHeader = header.toLowerCase().trim();
              
              // Operator Name
              if (lowerHeader.includes('operator') || lowerHeader.includes('company') || lowerHeader.includes('organisation') || lowerHeader.includes('organization') || lowerHeader.includes('name of operator')) {
                autoMapping.operatorName = header;
              }
              // Village Name  
              if ((lowerHeader.includes('village') && lowerHeader.includes('name')) || lowerHeader.includes('facility name') || lowerHeader.includes('retirement village name')) {
                autoMapping.villageName = header;
              }
              // Address - PRIORITIZE Physical address over Postal address
              if (lowerHeader.includes('physical') && lowerHeader.includes('address')) {
                // HIGHEST PRIORITY: Physical address
                autoMapping.address = header;
              } else if (lowerHeader.includes('village') && lowerHeader.includes('address')) {
                // SECOND PRIORITY: Village address
                if (!autoMapping.address || !autoMapping.address.toLowerCase().includes('physical')) {
                  autoMapping.address = header;
                }
              } else if (lowerHeader.includes('street') || (lowerHeader.includes('address') && !lowerHeader.includes('postal') && !lowerHeader.includes('mail'))) {
                // THIRD PRIORITY: Generic address (but NOT postal/mail address)
                if (!autoMapping.address) {
                  autoMapping.address = header;
                }
              }
              // Suburb
              if (lowerHeader.includes('suburb') || lowerHeader.includes('city') || lowerHeader.includes('town')) {
                autoMapping.suburb = header;
              }
              // Postcode
              if (lowerHeader.includes('postcode') || lowerHeader.includes('post code') || lowerHeader.includes('zip')) {
                autoMapping.postcode = header;
              }
              // Email
              if (lowerHeader.includes('email') || lowerHeader.includes('e-mail')) {
                autoMapping.contactEmail = header;
              }
              // Phone
              if (lowerHeader.includes('phone') || lowerHeader.includes('telephone') || lowerHeader.includes('mobile') || lowerHeader.includes('contact')) {
                autoMapping.contactPhone = header;
              }
              // Registration
              if (lowerHeader.includes('registration') || lowerHeader.includes('reg') || lowerHeader.includes('number') || lowerHeader.includes('id')) {
                autoMapping.registrationNumber = header;
              }
              // Website URL
              if (lowerHeader.includes('website') || lowerHeader.includes('url')) {
                autoMapping.websiteUrl = header;
              }
            });
            
            setHeaderMapping(autoMapping);
            setShowHeaderMapping(true);
            setUploading(false);

            console.log(`📊 Parsed ${results.data.length} rows from CSV`);
            console.log('🤖 Auto-mapped headers:', autoMapping);
            
          } catch (err) {
            console.error('CSV Parsing Error:', err);
            setError(err instanceof Error ? err.message : 'Failed to parse CSV file');
            setUploading(false);
          }
        },
        error: (error) => {
          console.error('PapaParse Error:', error);
          setError(`Failed to parse CSV: ${error.message}`);
          setUploading(false);
        }
      });
    } catch (err) {
      console.error('CSV Upload Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to parse CSV file. Please check the file encoding and format.');
      setUploading(false);
    }
  };

  const importToDatabase = async () => {
    if (!parsedData.length) {
      setError('No data to import');
      return;
    }

    // Validate header mapping
    if (!headerMapping.operatorName) {
      setError('Please map the Operator Name field');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const supabase = getSupabaseClient();
      
      let successCount = 0;
      let failedCount = 0;
      let skippedCount = 0;
      let newVillagesCount = 0;
      let existingOperatorsCount = 0;
      const errors: string[] = [];

      console.log(`🚀 Starting import of ${parsedData.length} operators from VIC...`);
      
      // Helper function to parse Australian postal address
      // Handles formats like: "741 Mt Dandenong Road, KILSYTH VIC 3137" or "Melbourne VIC 3000"
      const parsePostalAddress = (postalAddress: string): { suburb: string; state: string; postcode: string } => {
        if (!postalAddress) return { suburb: '', state: '', postcode: '' };
        
        // CRITICAL: CSV addresses have newlines! Convert to single line with spaces
        // Example CSV format:
        //   "19 - 41 Gwalia Street
        //    TRARALGON VIC 3844
        //    Australia"
        // We need to normalize this to: "19 - 41 Gwalia Street TRARALGON VIC 3844 Australia"
        const trimmed = postalAddress.trim().replace(/\r?\n/g, ' ').replace(/\s+/g, ' ');
        
        // 🔍 DEBUG: Log the exact string we're trying to parse
        console.log(`🔍 PARSING ADDRESS: "${trimmed}"`);
        console.log(`   Length: ${trimmed.length} chars`);
        console.log(`   Last 20 chars: "${trimmed.slice(-20)}"`);
        
        // Pattern 1: Full address with street number, street name, suburb, state, postcode (optionally followed by Australia/Aus)
        // Example: "741 Mt Dandenong Road, KILSYTH VIC 3137 Australia" or "741 Mt Dandenong Road, KILSYTH VIC 3137"
        // The suburb and postcode are at the END of the address (before optional country name)
        const fullAddressMatch = trimmed.match(/,?\s*([A-Z\s]+?)\s+(VIC|NSW|QLD|SA|WA|TAS|NT|ACT)\s+(\d{4})(\s+(Australia|Aus|AUS))?$/i);
        
        console.log(`   Pattern 1 match:`, fullAddressMatch);
        
        if (fullAddressMatch) {
          const result = {
            suburb: fullAddressMatch[1].trim(),
            state: fullAddressMatch[2].toUpperCase(),
            postcode: fullAddressMatch[3]
          };
          console.log(`   ✅ Pattern 1 SUCCESS:`, result);
          return result;
        }
        
        // Pattern 2: Simple format "Suburb STATE 1234" (optionally followed by Australia/Aus)
        const simpleMatch = trimmed.match(/^(.+?)\s+(VIC|NSW|QLD|SA|WA|TAS|NT|ACT)\s+(\d{4})(\s+(Australia|Aus|AUS))?$/i);
        
        console.log(`   Pattern 2 match:`, simpleMatch);
        
        if (simpleMatch) {
          const result = {
            suburb: simpleMatch[1].trim(),
            state: simpleMatch[2].toUpperCase(),
            postcode: simpleMatch[3]
          };
          console.log(`   ✅ Pattern 2 SUCCESS:`, result);
          return result;
        }
        
        // Pattern 3: Just look for any 4-digit postcode and state in the string
        const anyPostcodeMatch = trimmed.match(/(VIC|NSW|QLD|SA|WA|TAS|NT|ACT)\s+(\d{4})/i);
        
        console.log(`   Pattern 3 match:`, anyPostcodeMatch);
        
        if (anyPostcodeMatch) {
          // Try to extract suburb - anything before the state
          const beforeState = trimmed.substring(0, trimmed.indexOf(anyPostcodeMatch[0])).trim();
          // Get the last part after comma (if any)
          const suburbParts = beforeState.split(',');
          const suburb = suburbParts[suburbParts.length - 1].trim();
          
          const result = {
            suburb: suburb,
            state: anyPostcodeMatch[1].toUpperCase(),
            postcode: anyPostcodeMatch[2]
          };
          console.log(`   ✅ Pattern 3 SUCCESS:`, result);
          return result;
        }
        
        // Fallback: just use the whole thing as suburb
        console.log(`   ❌ NO PATTERN MATCHED - using fallback`);
        return { suburb: trimmed, state: 'VIC', postcode: '' };
      };

      for (const row of parsedData) {
        try {
          const operatorName = row[headerMapping.operatorName]?.trim();
          
          if (!operatorName) {
            skippedCount++;
            continue;
          }

          // Extract mapped data
          const villageName = headerMapping.villageName ? row[headerMapping.villageName]?.trim() : operatorName;
          const rawAddress = headerMapping.address ? row[headerMapping.address]?.trim() : '';
          const contactEmail = headerMapping.contactEmail ? row[headerMapping.contactEmail]?.trim() : '';
          const contactPhone = headerMapping.contactPhone ? row[headerMapping.contactPhone]?.trim() : '';
          const registrationNumber = headerMapping.registrationNumber ? row[headerMapping.registrationNumber]?.trim() : '';
          const websiteUrl = headerMapping.websiteUrl ? row[headerMapping.websiteUrl]?.trim() : ''; // Add website URL support
          
          // Parse PHYSICAL address to extract suburb, state, postcode
          // CRITICAL: We use the PHYSICAL address (not postal/PO Box address)
          // Example: "741 Mt Dandenong Road, KILSYTH VIC 3137" → suburb: "Kilsyth", postcode: "3137"
          let suburb = '';
          let postcode = '';
          let state = 'VIC';
          let address = rawAddress; // Full physical address for location field
          
          if (rawAddress) {
            const parsed = parsePostalAddress(rawAddress);
            suburb = parsed.suburb;
            postcode = parsed.postcode;
            state = parsed.state;
            
            console.log(`📍 Parsed address for ${operatorName}:`, {
              rawAddress,
              suburb,
              postcode,
              state
            });
          }
          
          // Override suburb/postcode with manual mapping if provided (rare case)
          if (headerMapping.suburb) {
            const manualSuburb = row[headerMapping.suburb]?.trim();
            if (manualSuburb) {
              suburb = manualSuburb;
              console.log(`🔧 Manual suburb override: ${manualSuburb}`);
            }
          }
          
          if (headerMapping.postcode) {
            const manualPostcode = row[headerMapping.postcode]?.trim();
            if (manualPostcode) {
              // Extract 4-digit postcode from the value (more lenient)
              const postcodeMatch = manualPostcode.match(/\d{4}/);
              if (postcodeMatch) {
                postcode = postcodeMatch[0];
                console.log(`🔧 Manual postcode override: ${manualPostcode} → ${postcode}`);
              }
            }
          }

          // Check if operator already exists
          const { data: existingVillages, error: checkError } = await supabase
            .from('retirement_villages')
            .select('id, operator, name')
            .eq('operator', operatorName)
            .limit(1);

          if (checkError) {
            console.error(`Error checking operator ${operatorName}:`, checkError);
            failedCount++;
            errors.push(`${operatorName}: Database check failed`);
            continue;
          }

          if (existingVillages && existingVillages.length > 0) {
            // Operator already exists
            existingOperatorsCount++;
            console.log(`✓ Operator already exists: ${operatorName}`);
            
            if (updateMode) {
              // SAFE UPDATE: Only update fields that have non-empty values in the CSV
              // This prevents overwriting good data with empty strings!
              const updateData: any = {};
              
              // Only update website if it's provided in CSV
              if (websiteUrl) {
                updateData.website = websiteUrl;
                console.log(`🌐 Updating website for ${operatorName}: ${websiteUrl}`);
              }
              
              // Only update other fields if they're provided AND not empty
              if (villageName) updateData.name = villageName;
              if (address) updateData.location = address;
              if (suburb) updateData.suburb = suburb;
              if (postcode) updateData.postcode = postcode;
              if (contactEmail) updateData.contact_email = contactEmail;
              if (contactPhone) updateData.contact_phone = contactPhone;
              
              // Skip update if no data to update
              if (Object.keys(updateData).length === 0) {
                console.log(`⏭️ Skipping ${operatorName} - no new data to update`);
                successCount++;
                continue;
              }

              const { error: updateError } = await supabase
                .from('retirement_villages')
                .update(updateData)  // ✅ Only update fields that have values
                .eq('id', existingVillages[0].id);

              if (updateError) {
                console.error(`❌ Failed to update ${operatorName}:`, updateError);
                failedCount++;
                errors.push(`${operatorName}: ${updateError.message}`);
              } else {
                console.log(`✅ Updated ${Object.keys(updateData).length} fields for: ${operatorName}`);
                successCount++;
              }
            } else {
              // Skip update in insert-only mode
              successCount++;
            }
            continue;
          }

          // Insert new village with VIC data
          const villageData = {
            name: villageName || operatorName,
            operator: operatorName,
            location: address || suburb || 'VIC',
            suburb: suburb || '',
            postcode: postcode || '',
            state: state,
            status: 'approved', // Auto-approve government data
            facility_type: 'retirement_village', // CRITICAL: Set facility_type so it appears in directory
            village_type: 'Retirement Village',
            care_level: 'Independent Living',
            description: `${operatorName} - Victorian retirement village operator (Government Register)${registrationNumber ? ` - Reg: ${registrationNumber}` : ''}`,
            contact_email: contactEmail || '',
            contact_phone: contactPhone || '',
            submitted_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            website: websiteUrl || '' // FIXED: Use 'website' not 'website_url'
          };

          const { error: insertError } = await supabase
            .from('retirement_villages')
            .insert([villageData]);

          if (insertError) {
            console.error(`❌ Failed to insert ${operatorName}:`, insertError);
            failedCount++;
            errors.push(`${operatorName}: ${insertError.message}`);
          } else {
            console.log(`✅ Imported: ${operatorName}`);
            successCount++;
            newVillagesCount++;
          }

        } catch (err) {
          console.error('Error processing row:', err);
          failedCount++;
          errors.push(`Row error: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }

        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      setResults({
        success: successCount,
        failed: failedCount,
        skipped: skippedCount,
        errors: errors.slice(0, 20), // Show first 20 errors
        newVillages: newVillagesCount,
        existingOperators: existingOperatorsCount
      });

      console.log(`
        🎉 VIC IMPORT COMPLETE!
        ✅ Success: ${successCount}
        ❌ Failed: ${failedCount}
        ⏭️ Skipped: ${skippedCount}
        🆕 New Villages: ${newVillagesCount}
        🔄 Existing Operators: ${existingOperatorsCount}
      `);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed');
      console.error('Import error:', err);
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = `Operator Name,Village Name,Address,Suburb,Postcode,Contact Email,Contact Phone,Registration Number,Website URL
Example Operator Pty Ltd,Example Village,123 Main St,Melbourne,3000,contact@example.com,03 1234 5678,VIC12345,https://www.example.com
Another Operator,Another Village,456 Park Ave,Geelong,3220,info@another.com,03 9876 5432,VIC67890,https://www.another.com`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vic-import-template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl mb-2">VIC Government Data Importer</h2>
            <p className="text-gray-600">
              Bulk import retirement village operators from Victorian government register
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={downloadTemplate}
          >
            <Download className="size-4 mr-2" />
            Download Template
          </Button>
        </div>

        {/* Upload Section */}
        {!showHeaderMapping && (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <FileSpreadsheet className="size-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg mb-2">Upload VIC Government CSV</h3>
            <p className="text-sm text-gray-600 mb-4">
              Select the CSV file from the Victorian government containing operator data
            </p>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
              disabled={uploading}
              ref={fileInputRef}
            />
            <Button 
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="size-4 mr-2" />
              {uploading ? 'Processing...' : 'Select CSV File'}
            </Button>
          </div>
        )}

        {/* Header Mapping Section */}
        {showHeaderMapping && !results && (
          <div className="space-y-4">
            {/* CRITICAL WARNING about Physical vs Postal address */}
            <div className="bg-amber-50 border-2 border-amber-500 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="size-6 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-amber-900 mb-2">⚠️ CRITICAL: Map Physical Address (NOT Postal Address)</h3>
                  <p className="text-sm text-amber-800 mb-2">
                    <strong>For the Address field, you MUST select "Physical address"</strong> (where the village is located).
                  </p>
                  <p className="text-sm text-amber-800">
                    <strong>DO NOT select "Postal address"</strong> - this is often a PO Box at head office in a different suburb with the wrong postcode!
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold mb-2">Map CSV Headers to Database Fields</h3>
              <p className="text-sm text-gray-700">
                Found {csvHeaders.length} columns with {parsedData.length} rows of data.
                Match your CSV headers to our database fields below.
              </p>
            </div>

            {/* PREVIEW: Show sample data from first 3 rows to help identify correct columns */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="font-semibold mb-3 text-purple-900">📋 Sample Data (First 3 Rows)</h3>
              <div className="space-y-3 text-xs">
                {parsedData.slice(0, 3).map((row, idx) => (
                  <div key={idx} className="bg-white p-3 rounded border border-purple-200">
                    <div className="font-semibold text-purple-900 mb-2">Row {idx + 1}:</div>
                    <div className="grid grid-cols-1 gap-1">
                      {csvHeaders.slice(0, 10).map(header => (
                        <div key={header} className="flex">
                          <span className="font-medium text-purple-700 w-48 flex-shrink-0">{header}:</span>
                          <span className="text-gray-700 truncate" title={row[header]}>{row[header] || '(empty)'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Operator Name - Required */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Operator Name <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg p-2"
                  value={headerMapping.operatorName}
                  onChange={(e) => setHeaderMapping({ ...headerMapping, operatorName: e.target.value })}
                >
                  <option value="">-- Select Column --</option>
                  {csvHeaders.map(header => (
                    <option key={header} value={header}>{header}</option>
                  ))}
                </select>
              </div>

              {/* Village Name */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Village Name <span className="text-gray-400">(optional)</span>
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg p-2"
                  value={headerMapping.villageName}
                  onChange={(e) => setHeaderMapping({ ...headerMapping, villageName: e.target.value })}
                >
                  <option value="">-- Select Column --</option>
                  {csvHeaders.map(header => (
                    <option key={header} value={header}>{header}</option>
                  ))}
                </select>
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Address <span className="text-gray-400">(optional)</span>
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg p-2"
                  value={headerMapping.address}
                  onChange={(e) => setHeaderMapping({ ...headerMapping, address: e.target.value })}
                >
                  <option value="">-- Select Column --</option>
                  {csvHeaders.map(header => (
                    <option key={header} value={header}>{header}</option>
                  ))}
                </select>
              </div>

              {/* Suburb */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Suburb <span className="text-gray-400">(optional)</span>
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg p-2"
                  value={headerMapping.suburb}
                  onChange={(e) => setHeaderMapping({ ...headerMapping, suburb: e.target.value })}
                >
                  <option value="">-- Select Column --</option>
                  {csvHeaders.map(header => (
                    <option key={header} value={header}>{header}</option>
                  ))}
                </select>
              </div>

              {/* Postcode */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Postcode <span className="text-gray-400">(optional)</span>
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg p-2"
                  value={headerMapping.postcode}
                  onChange={(e) => setHeaderMapping({ ...headerMapping, postcode: e.target.value })}
                >
                  <option value="">-- Select Column --</option>
                  {csvHeaders.map(header => (
                    <option key={header} value={header}>{header}</option>
                  ))}
                </select>
              </div>

              {/* Contact Email */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Contact Email <span className="text-gray-400">(optional)</span>
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg p-2"
                  value={headerMapping.contactEmail}
                  onChange={(e) => setHeaderMapping({ ...headerMapping, contactEmail: e.target.value })}
                >
                  <option value="">-- Select Column --</option>
                  {csvHeaders.map(header => (
                    <option key={header} value={header}>{header}</option>
                  ))}
                </select>
              </div>

              {/* Contact Phone */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Contact Phone <span className="text-gray-400">(optional)</span>
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg p-2"
                  value={headerMapping.contactPhone}
                  onChange={(e) => setHeaderMapping({ ...headerMapping, contactPhone: e.target.value })}
                >
                  <option value="">-- Select Column --</option>
                  {csvHeaders.map(header => (
                    <option key={header} value={header}>{header}</option>
                  ))}
                </select>
              </div>

              {/* Registration Number */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Registration Number <span className="text-gray-400">(optional)</span>
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg p-2"
                  value={headerMapping.registrationNumber}
                  onChange={(e) => setHeaderMapping({ ...headerMapping, registrationNumber: e.target.value })}
                >
                  <option value="">-- Select Column --</option>
                  {csvHeaders.map(header => (
                    <option key={header} value={header}>{header}</option>
                  ))}
                </select>
              </div>

              {/* Website URL */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Website URL <span className="text-gray-400">(optional)</span>
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg p-2"
                  value={headerMapping.websiteUrl}
                  onChange={(e) => setHeaderMapping({ ...headerMapping, websiteUrl: e.target.value })}
                >
                  <option value="">-- Select Column --</option>
                  {csvHeaders.map(header => (
                    <option key={header} value={header}>{header}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={importToDatabase}
                disabled={uploading || !headerMapping.operatorName}
                className="flex-1"
              >
                <Building2 className="size-4 mr-2" />
                {uploading ? 'Importing...' : `Import ${parsedData.length} Operators`}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowHeaderMapping(false);
                  setParsedData([]);
                  setCsvHeaders([]);
                }}
                disabled={uploading}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Results Section */}
        {results && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4 bg-green-50 border-green-200">
                <div className="flex items-center gap-3">
                  <CheckCircle className="size-8 text-green-600" />
                  <div>
                    <div className="text-2xl font-bold text-green-900">{results.success}</div>
                    <div className="text-sm text-green-700">Successful</div>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-blue-50 border-blue-200">
                <div className="flex items-center gap-3">
                  <Building2 className="size-8 text-blue-600" />
                  <div>
                    <div className="text-2xl font-bold text-blue-900">{results.newVillages}</div>
                    <div className="text-sm text-blue-700">New Villages Added</div>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-gray-50 border-gray-200">
                <div className="flex items-center gap-3">
                  <CheckCircle className="size-8 text-gray-600" />
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{results.existingOperators}</div>
                    <div className="text-sm text-gray-700">Already in Database</div>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-red-50 border-red-200">
                <div className="flex items-center gap-3">
                  <AlertCircle className="size-8 text-red-600" />
                  <div>
                    <div className="text-2xl font-bold text-red-900">{results.failed}</div>
                    <div className="text-sm text-red-700">Failed</div>
                  </div>
                </div>
              </Card>
            </div>

            {results.errors.length > 0 && (
              <Card className="p-4 bg-yellow-50 border-yellow-200">
                <h3 className="font-semibold mb-2 text-yellow-900">Import Errors</h3>
                <div className="text-sm space-y-1 max-h-60 overflow-y-auto">
                  {results.errors.map((error, index) => (
                    <div key={index} className="text-yellow-800">{error}</div>
                  ))}
                  {results.errors.length >= 20 && (
                    <div className="text-yellow-700 italic">... and more errors</div>
                  )}
                </div>
              </Card>
            )}

            <Button
              onClick={() => {
                setResults(null);
                setShowHeaderMapping(false);
                setParsedData([]);
                setCsvHeaders([]);
              }}
              className="w-full"
            >
              Import Another File
            </Button>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="size-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="text-red-800">{error}</div>
          </div>
        )}
      </Card>
    </div>
  );
}