import React, { useState } from 'react';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Upload, Filter, Download, CheckCircle } from 'lucide-react';

interface Village {
  id: string;
  name: string;
  url: string;
  [key: string]: string;
}

export function CsvDuplicateFilter() {
  const [correctedVillages, setCorrectedVillages] = useState<Village[]>([]);
  const [badVillages, setBadVillages] = useState<Village[]>([]);
  const [filteredVillages, setFilteredVillages] = useState<Village[]>([]);
  const [stats, setStats] = useState<{
    totalBad: number;
    totalCorrected: number;
    duplicates: number;
    remaining: number;
  } | null>(null);

  // Parse CSV file
  const parseCSV = (text: string): Village[] => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    
    const villages: Village[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;

      // Handle quoted fields with commas
      const values: string[] = [];
      let currentValue = '';
      let insideQuotes = false;
      
      for (let char of line) {
        if (char === '"') {
          insideQuotes = !insideQuotes;
        } else if (char === ',' && !insideQuotes) {
          values.push(currentValue.trim());
          currentValue = '';
        } else {
          currentValue += char;
        }
      }
      values.push(currentValue.trim());

      const village: Village = {
        id: '',
        name: '',
        url: ''
      };

      headers.forEach((header, index) => {
        const value = values[index] || '';
        const cleanValue = value.replace(/^"(.*)"$/, '$1').trim();
        
        // Map common header variations
        const lowerHeader = header.toLowerCase();
        if (lowerHeader.includes('id')) {
          village.id = cleanValue;
        } else if (lowerHeader.includes('name') || lowerHeader.includes('village')) {
          village.name = cleanValue;
        } else if (lowerHeader.includes('url') || lowerHeader.includes('website')) {
          village.url = cleanValue;
        }
        
        village[header] = cleanValue;
      });

      if (village.name) {
        villages.push(village);
      }
    }

    return villages;
  };

  // Handle file upload for corrected villages
  const handleCorrectedUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const villages = parseCSV(text);
      setCorrectedVillages(villages);
      console.log('📥 Loaded corrected villages:', villages.length);
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  // Handle file upload for bad villages
  const handleBadUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const villages = parseCSV(text);
      setBadVillages(villages);
      console.log('📥 Loaded bad villages:', villages.length);
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  // Filter duplicates
  const filterDuplicates = () => {
    if (correctedVillages.length === 0 || badVillages.length === 0) {
      alert('Please upload both CSV files first!');
      return;
    }

    // Normalize village names for comparison (lowercase, trim, remove extra spaces)
    const normalizeeName = (name: string) => {
      return name.toLowerCase().trim().replace(/\s+/g, ' ');
    };

    // Create a Set of corrected village names
    const correctedNames = new Set(
      correctedVillages.map(v => normalizeeName(v.name))
    );

    console.log('🔍 Corrected village names:', Array.from(correctedNames));

    // Filter out bad villages that are in corrected list
    const remaining = badVillages.filter(v => {
      const normalized = normalizeeName(v.name);
      const isDuplicate = correctedNames.has(normalized);
      
      if (isDuplicate) {
        console.log('🗑️ Removing duplicate:', v.name);
      }
      
      return !isDuplicate;
    });

    setFilteredVillages(remaining);
    setStats({
      totalBad: badVillages.length,
      totalCorrected: correctedVillages.length,
      duplicates: badVillages.length - remaining.length,
      remaining: remaining.length
    });

    console.log('✅ Filtering complete:', {
      totalBad: badVillages.length,
      duplicates: badVillages.length - remaining.length,
      remaining: remaining.length
    });
  };

  // Export filtered results
  const exportFiltered = () => {
    if (filteredVillages.length === 0) {
      alert('No filtered results to export!');
      return;
    }

    // Get all unique headers from filtered villages
    const allHeaders = new Set<string>();
    filteredVillages.forEach(v => {
      Object.keys(v).forEach(key => allHeaders.add(key));
    });

    const headers = Array.from(allHeaders);
    const rows = filteredVillages.map(v => 
      headers.map(h => {
        const value = v[h] || '';
        // Quote values that contain commas
        return value.includes(',') ? `"${value}"` : value;
      })
    );

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `vic-villages-filtered-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    console.log(`📥 Exported ${filteredVillages.length} filtered villages`);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-300 rounded-lg p-6">
        <h3 className="text-2xl font-bold text-purple-900 mb-3 flex items-center gap-2">
          <Filter className="size-7" />
          🧹 CSV Duplicate Filter
        </h3>
        <p className="text-purple-700 mb-4">
          Upload your 30 corrected URLs and 88 bad URLs CSVs. This tool will filter out duplicates by village name and show you the TRUE remaining list.
        </p>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {/* Upload Corrected Villages */}
          <div className="bg-white rounded-lg border-2 border-green-300 p-4">
            <h4 className="font-bold text-green-900 mb-2">
              ✅ Step 1: Upload Corrected Villages (30)
            </h4>
            <label className="cursor-pointer">
              <input
                type="file"
                accept=".csv"
                onChange={handleCorrectedUpload}
                className="hidden"
              />
              <div className="border-2 border-dashed border-green-400 rounded-lg p-4 text-center hover:bg-green-50 transition">
                <Upload className="size-8 mx-auto mb-2 text-green-600" />
                <div className="text-sm text-green-700">
                  Click to upload CSV
                </div>
              </div>
            </label>
            {correctedVillages.length > 0 && (
              <div className="mt-3 p-2 bg-green-100 rounded text-sm">
                <CheckCircle className="size-4 inline mr-1 text-green-600" />
                <span className="font-bold text-green-800">
                  {correctedVillages.length} corrected villages loaded
                </span>
              </div>
            )}
          </div>

          {/* Upload Bad Villages */}
          <div className="bg-white rounded-lg border-2 border-red-300 p-4">
            <h4 className="font-bold text-red-900 mb-2">
              ❌ Step 2: Upload Bad Villages (88)
            </h4>
            <label className="cursor-pointer">
              <input
                type="file"
                accept=".csv"
                onChange={handleBadUpload}
                className="hidden"
              />
              <div className="border-2 border-dashed border-red-400 rounded-lg p-4 text-center hover:bg-red-50 transition">
                <Upload className="size-8 mx-auto mb-2 text-red-600" />
                <div className="text-sm text-red-700">
                  Click to upload CSV
                </div>
              </div>
            </label>
            {badVillages.length > 0 && (
              <div className="mt-3 p-2 bg-red-100 rounded text-sm">
                <CheckCircle className="size-4 inline mr-1 text-red-600" />
                <span className="font-bold text-red-800">
                  {badVillages.length} bad villages loaded
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Filter Button */}
        <div className="flex gap-3">
          <Button
            onClick={filterDuplicates}
            disabled={correctedVillages.length === 0 || badVillages.length === 0}
            size="lg"
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Filter className="size-4 mr-2" />
            🧹 Filter Duplicates
          </Button>

          {filteredVillages.length > 0 && (
            <Button
              onClick={exportFiltered}
              size="lg"
              className="bg-green-600 hover:bg-green-700"
            >
              <Download className="size-4 mr-2" />
              📥 Export {filteredVillages.length} Filtered Villages
            </Button>
          )}
        </div>

        {/* Stats */}
        {stats && (
          <div className="mt-6 grid grid-cols-4 gap-3">
            <div className="p-3 bg-red-50 border border-red-300 rounded-lg">
              <div className="text-2xl font-bold text-red-700">{stats.totalBad}</div>
              <div className="text-xs text-red-600">Original Bad URLs</div>
            </div>
            <div className="p-3 bg-green-50 border border-green-300 rounded-lg">
              <div className="text-2xl font-bold text-green-700">{stats.totalCorrected}</div>
              <div className="text-xs text-green-600">Already Corrected</div>
            </div>
            <div className="p-3 bg-orange-50 border border-orange-300 rounded-lg">
              <div className="text-2xl font-bold text-orange-700">{stats.duplicates}</div>
              <div className="text-xs text-orange-600">Duplicates Removed</div>
            </div>
            <div className="p-3 bg-blue-50 border border-blue-300 rounded-lg">
              <div className="text-2xl font-bold text-blue-700">{stats.remaining}</div>
              <div className="text-xs text-blue-600">🎯 Still Need Work</div>
            </div>
          </div>
        )}
      </div>

      {/* Preview filtered results */}
      {filteredVillages.length > 0 && (
        <div className="bg-white border-2 border-blue-300 rounded-lg p-4">
          <h4 className="font-bold text-blue-900 mb-3">
            🎯 Filtered Results ({filteredVillages.length} villages)
          </h4>
          <div className="max-h-96 overflow-y-auto space-y-2">
            {filteredVillages.map((village, index) => (
              <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded">
                <div className="font-semibold text-gray-900">{village.name}</div>
                <div className="text-xs text-gray-600 break-all">{village.url}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
