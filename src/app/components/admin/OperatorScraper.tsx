import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { 
  Upload, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  FileSpreadsheet,
  Building2,
  Search,
  Download,
  StopCircle
} from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import Papa from 'papaparse';
import { ScraperDebugPanel } from './ScraperDebugPanel';

interface Village {
  name: string;
  suburb: string;
  postcode: string;
  streetAddress?: string; // 🆕 Optional street address from VIC gov register
}

interface Operator {
  name: string;
}

interface ScrapeResult {
  village: Village;
  scrapedOperator: string | null;
  matchedOperator: string | null;
  confidence: number;
  status: 'matched' | 'no_match' | 'pending';
}

export default function OperatorScraper() {
  const [villageFile, setVillageFile] = useState<File | null>(null);
  const [operatorFile, setOperatorFile] = useState<File | null>(null);
  const [villages, setVillages] = useState<Village[]>([]);
  const [operators, setOperators] = useState<Operator[]>([]);
  const [results, setResults] = useState<ScrapeResult[]>([]);
  const [scraping, setScraping] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [shouldStop, setShouldStop] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState<string>('Calculating...');
  const [savedToDbCount, setSavedToDbCount] = useState(0); // 🆕 Track real-time DB saves

  // Auto-recovery: Load saved results from localStorage on mount
  useEffect(() => {
    const savedResults = localStorage.getItem('operatorScrapingResults');
    const savedProgress = localStorage.getItem('operatorScrapingProgress');
    const savedVillages = localStorage.getItem('operatorScrapingVillages');
    const savedOperators = localStorage.getItem('operatorScrapingOperators');
    
    if (savedResults) {
      try {
        const parsed = JSON.parse(savedResults);
        if (parsed.length > 0) {
          setResults(parsed);
          setSuccess(`🔄 Recovered ${parsed.length} results from previous session`);
          console.log('✅ Auto-recovered results:', parsed.length);
        }
      } catch (e) {
        console.error('Failed to recover results:', e);
      }
    }
    
    if (savedProgress) {
      setProgress(parseInt(savedProgress));
    }

    // 🆕 RECOVER CSV DATA
    if (savedVillages) {
      try {
        const parsed = JSON.parse(savedVillages);
        setVillages(parsed);
        console.log('✅ Auto-recovered villages:', parsed.length);
      } catch (e) {
        console.error('Failed to recover villages:', e);
      }
    }

    if (savedOperators) {
      try {
        const parsed = JSON.parse(savedOperators);
        setOperators(parsed);
        console.log('✅ Auto-recovered operators:', parsed.length);
      } catch (e) {
        console.error('Failed to recover operators:', e);
      }
    }
  }, []);

  // Auto-save results to localStorage whenever they change (debounced to reduce writes)
  useEffect(() => {
    if (results.length > 0) {
      const timeoutId = setTimeout(() => {
        localStorage.setItem('operatorScrapingResults', JSON.stringify(results));
        console.log(`💾 Auto-saved ${results.length} results to localStorage`);
      }, 500); // Debounce: wait 500ms after last change
      
      return () => clearTimeout(timeoutId);
    }
  }, [results]);

  // 🆕 Save SINGLE village to database IMMEDIATELY
  const saveVillageToDatabase = async (result: ScrapeResult) => {
    // Only save if matched
    if (result.status !== 'matched' || !result.matchedOperator) {
      return { success: false, reason: 'no_match' };
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/operator-scraper/save-results`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ results: [result] }), // Send single village as array
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        console.log(`💾✅ Saved ${result.village.name} → ${result.matchedOperator}`);
        setSavedToDbCount(prev => prev + 1); // Update counter
        return { success: true, data };
      } else {
        const errorText = await response.text();
        console.error(`💾❌ Failed to save ${result.village.name}:`, errorText);
        return { success: false, error: errorText };
      }
    } catch (err: any) {
      console.error(`💾❌ Error saving ${result.village.name}:`, err.message);
      return { success: false, error: err.message };
    }
  };

  // Save to backend database (batch mode for manual save button)
  const saveResultsToDatabase = async (resultsToSave: ScrapeResult[]) => {
    try {
      console.log(`💾 Saving ${resultsToSave.length} results to database...`);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/operator-scraper/save-results`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ results: resultsToSave }),
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Results saved to database:', data);
        // Don't overwrite existing success messages - just log
        console.log(`✅ Database saved: ${data.successCount} updated, ${data.skipCount} skipped, ${data.errorCount} errors`);
        return data;
      } else {
        const errorText = await response.text();
        console.error('❌ Failed to save to database:', errorText);
        // Only log error, don't overwrite UI messages
        return { success: false, error: errorText };
      }
    } catch (err: any) {
      console.error('❌ Database save error:', err);
      return { success: false, error: err.message };
    }
  };

  // Handle village CSV upload
  const handleVillageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Warn if we have existing results
    if (results.length > 0) {
      if (!confirm(`⚠️ You have ${results.length} scraped results. Uploading a new village CSV will NOT clear them. Continue?`)) {
        e.target.value = ''; // Reset file input
        return;
      }
    }

    setVillageFile(file);
    setError(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const parsed: Village[] = [];
          
          results.data.forEach((row: any, index: number) => {
            const name = row['village name'] || row['Village Name'] || row['name'] || row['Name'] || '';
            const suburb = row['suburb'] || row['Suburb'] || '';
            const postcode = row['postcode'] || row['Postcode'] || '';
            const streetAddress = row['street address'] || row['Street Address'] || row['StreetAddress'] || ''; // 🆕 Accept with or without space

            if (name && suburb && postcode) {
              parsed.push({ name: name.trim(), suburb: suburb.trim(), postcode: postcode.trim(), streetAddress: streetAddress.trim() || undefined });
            }
          });

          setVillages(parsed);
          setSuccess(`✅ Loaded ${parsed.length} villages. You still have ${results.length} scraped results saved.`);
          
          // 💾 SAVE VILLAGES TO LOCALSTORAGE
          localStorage.setItem('operatorScrapingVillages', JSON.stringify(parsed));
          console.log(`💾 Saved ${parsed.length} villages to localStorage`);
        } catch (err) {
          setError(`Failed to parse village CSV: ${err.message}`);
        }
      },
      error: (error) => {
        setError(`CSV parse error: ${error.message}`);
      },
    });
  };

  // Handle operator CSV upload
  const handleOperatorUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setOperatorFile(file);
    setError(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const parsed: Operator[] = [];
          
          results.data.forEach((row: any) => {
            const name = row['operator'] || row['Operator'] || row['name'] || row['Name'] || '';
            
            if (name) {
              parsed.push({ name: name.trim() });
            }
          });

          setOperators(parsed);
          setSuccess(`✅ Loaded ${parsed.length} operators`);
          
          // 💾 SAVE OPERATORS TO LOCALSTORAGE
          localStorage.setItem('operatorScrapingOperators', JSON.stringify(parsed));
          console.log(`💾 Saved ${parsed.length} operators to localStorage`);
        } catch (err) {
          setError(`Failed to parse operator CSV: ${err.message}`);
        }
      },
      error: (error) => {
        setError(`CSV parse error: ${error.message}`);
      },
    });
  };

  // 🆕 Handle VIC Gov CSV upload (street addresses)
  const handleVicGovUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log('🔷 VIC Gov CSV upload started');
    console.log('🔷 Current state - villages:', villages.length, 'results:', results.length);

    if (villages.length === 0 && results.length === 0) {
      const errorMsg = '⚠️ Please upload your village CSV first (step 1), then add street addresses';
      setError(errorMsg);
      alert(errorMsg); // Make it visible!
      e.target.value = ''; // Reset file input
      return;
    }

    setError(null);
    setSuccess(null);
    console.log('✅ Processing VIC Gov CSV:', file.name);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (parseResults) => {
        try {
          console.log('📍 Parsing VIC Gov CSV for street addresses...');
          console.log('📍 CSV rows found:', parseResults.data.length);
          
          let addressesAdded = 0;
          let noMatchVillages = 0;

          // Build a map of street addresses from VIC Gov CSV
          const addressMap = new Map<string, string>();
          
          parseResults.data.forEach((row: any, idx) => {
            if (idx === 0) {
              console.log('📍 RAW COLUMNS:', Object.keys(row));
              console.log('📍 FIRST ROW DATA:', row);
            }

            const name = (row['village name'] || row['Village Name'] || row['Village name'] || row['name'] || row['Name'] || '').trim().toLowerCase();
            const suburb = (row['suburb'] || row['Suburb'] || '').trim().toLowerCase();
            const streetAddress = (row['street address'] || row['Street Address'] || row['Street address'] || row['address'] || row['Address'] || '').trim();
            
            if (idx === 0) {
              console.log('📍 PARSED VALUES:', { name, suburb, streetAddress });
            }
            
            // Only require name and street address (suburb is optional)
            if (name && streetAddress) {
              // Use name-only as key (villages already have suburbs)
              addressMap.set(name, streetAddress);
              if (idx < 3) console.log(`📍 Mapped: ${name} → ${streetAddress}`);
            }
          });

          console.log(`📊 Loaded ${addressMap.size} street addresses from VIC Gov CSV`);
          
          if (addressMap.size === 0) {
            const errorMsg = '❌ No valid addresses found in CSV. Check that columns are: village name, street address';
            setError(errorMsg);
            alert(errorMsg);
            return;
          }

          // 🆕 SCENARIO 1: Update villages array (before scraping)
          if (villages.length > 0 && results.length === 0) {
            const updatedVillages = villages.map(village => {
              const streetAddress = addressMap.get(village.name.toLowerCase());

              if (streetAddress) {
                addressesAdded++;
                console.log(`✅ Added address to ${village.name}: ${streetAddress}`);
                return {
                  ...village,
                  streetAddress,
                };
              }

              return village;
            });

            if (addressesAdded === 0) {
              const errorMsg = `⚠️ No street addresses matched your ${villages.length} villages`;
              setError(errorMsg);
              alert(errorMsg + '\n\nCheck that village names and suburbs match exactly between your CSV files.');
              return;
            }

            setVillages(updatedVillages);
            localStorage.setItem('operatorScrapingVillages', JSON.stringify(updatedVillages));

            const successMsg = `✅ Added ${addressesAdded} street addresses to ${villages.length} villages (ready for scraping!)`;
            setSuccess(successMsg);
            alert(successMsg);
            console.log(`✅ Street addresses added to villages: ${addressesAdded}/${villages.length}`);
            return;
          }

          // 🆕 SCENARIO 2: Update results - only add addresses to no-match villages
          const updatedResults = results.map(result => {
            // Only update if village doesn't have an operator OR has "Independent"
            const needsAddress = result.status === 'no_match' || 
                                result.matchedOperator?.toLowerCase().includes('independent');
            
            if (!needsAddress) {
              return result; // Already has operator - skip
            }

            noMatchVillages++;

            const streetAddress = addressMap.get(result.village.name.toLowerCase());

            if (streetAddress) {
              addressesAdded++;
              console.log(`✅ Added address to ${result.village.name}: ${streetAddress}`);
              return {
                ...result,
                village: {
                  ...result.village,
                  streetAddress,
                },
              };
            }

            return result;
          });

          if (addressesAdded === 0) {
            const errorMsg = `⚠️ No street addresses matched. Found ${noMatchVillages} no-match villages but none matched VIC Gov CSV.`;
            setError(errorMsg);
            alert(errorMsg + '\n\nCheck that village names and suburbs match exactly between your CSV files.');
            return;
          }

          // Save updated results
          setResults(updatedResults);
          localStorage.setItem('operatorScrapingResults', JSON.stringify(updatedResults));

          const successMsg = `✅ Added ${addressesAdded} street addresses to no-match villages (out of ${noMatchVillages} total no-matches)`;
          setSuccess(successMsg);
          alert(successMsg);
          console.log(`✅ Street addresses added: ${addressesAdded}/${noMatchVillages}`);
        } catch (err: any) {
          const errorMsg = `Failed to parse VIC Gov CSV: ${err?.message || String(err)}`;
          setError(errorMsg);
          alert(errorMsg);
          console.error('VIC Gov CSV parse error:', err);
        }
      },
      error: (error: any) => {
        const errorMsg = `CSV parse error: ${error?.message || String(error)}`;
        setError(errorMsg);
        alert(errorMsg);
      },
    });
  };

  // Start scraping
  const startScraping = async () => {
    // Allow resuming if we have saved results, even if CSVs aren't loaded
    if (results.length > 0) {
      // We're resuming - extract villages from saved results
      if (villages.length === 0) {
        const recoveredVillages = results.map(r => r.village);
        setVillages(recoveredVillages);
        console.log(`🔄 Recovered ${recoveredVillages.length} villages from saved results`);
      }
      
      // 🆕 Operators are now OPTIONAL - backend extracts from Google
      if (operators.length === 0) {
        console.log('⚠️ No operator whitelist - will extract operator names directly from Google');
      }
    } else {
      // Fresh start - need villages CSV (operators now optional)
      if (villages.length === 0) {
        setError('Please upload village CSV first');
        return;
      }

      // 🆕 Operators are now OPTIONAL - backend extracts from Google
      if (operators.length === 0) {
        console.log('⚠️ No operator whitelist - will extract operator names directly from Google');
      }
    }

    setScraping(true);
    setError(null);
    setStartTime(Date.now()); // Track when we started
    setSavedToDbCount(0); // Reset counter
    
    // Resume from where we left off
    const alreadyScrapedCount = results.length;
    const villagesToScrape = villages.slice(alreadyScrapedCount);
    
    console.log(`📊 Already scraped: ${alreadyScrapedCount} villages`);
    console.log(`📊 Remaining: ${villagesToScrape.length} villages`);
    
    if (villagesToScrape.length === 0) {
      setSuccess('✅ All villages already scraped!');
      setScraping(false);
      return;
    }
    
    const currentResults = [...results];

    // 🆕 PRE-SCRAPE: Check if operator is in village name
    const checkOperatorInName = (villageName: string, operatorList: string[]): { matched: string | null; confidence: number } => {
      const nameLower = villageName.toLowerCase();
      
      for (const operator of operatorList) {
        const operatorLower = operator.toLowerCase();
        
        // Exact substring match
        if (nameLower.includes(operatorLower)) {
          console.log(`✅ Found exact operator in name: "${operator}" in "${villageName}"`);
          return { matched: operator, confidence: 100 };
        }
      }
      
      // 🆕 EXTRACT ACRONYMS from village name (e.g., "VMCH", "RSL", "BCS")
      const acronymsInName = villageName.match(/\b[A-Z]{2,}\b/g) || [];
      
      if (acronymsInName.length > 0) {
        console.log(`🔍 Found potential acronyms in "${villageName}":`, acronymsInName);
        
        for (const acronym of acronymsInName) {
          // Generate acronym from each operator
          for (const operator of operatorList) {
            const operatorWords = operator.split(' ').filter(w => w.length > 0);
            const operatorAcronym = operatorWords.map(w => w[0].toUpperCase()).join('');
            
            if (acronym === operatorAcronym) {
              console.log(`✅ ACRONYM MATCH: "${acronym}" in "${villageName}" matches "${operator}" (${operatorAcronym})`);
              return { matched: operator, confidence: 95 };
            }
            
            // Also check partial matches for longer acronyms
            if (acronym.length >= 3 && operatorAcronym.startsWith(acronym)) {
              console.log(`✅ PARTIAL ACRONYM MATCH: "${acronym}" matches start of "${operator}" (${operatorAcronym})`);
              return { matched: operator, confidence: 90 };
            }
          }
        }
      }
      
      return { matched: null, confidence: 0 };
    };

    try {
      for (let i = 0; i < villagesToScrape.length; i++) {
        // Check if user clicked Stop
        if (shouldStop) {
          console.log('⏸️ Scraping paused by user');
          setSuccess(`⏸️ Scraping paused at ${currentResults.length}/${villages.length} villages. Click "Resume" to continue.`);
          setShouldStop(false);
          break;
        }

        const village = villagesToScrape[i];
        const totalIndex = alreadyScrapedCount + i;

        // 🆕 STEP 1: Check if operator is in the village name itself
        const nameCheck = checkOperatorInName(village.name, operators.map(o => o.name));
        
        if (nameCheck.matched) {
          console.log(`⚡ FAST MATCH: "${village.name}" → "${nameCheck.matched}" (${nameCheck.confidence}% from name)`);
          currentResults.push({
            village,
            scrapedOperator: `FROM NAME: ${nameCheck.matched}`,
            matchedOperator: nameCheck.matched,
            confidence: nameCheck.confidence,
            status: 'matched',
          });
          
          // 💾 SAVE TO DATABASE IMMEDIATELY
          try {
            await saveVillageToDatabase(currentResults[currentResults.length - 1]);
          } catch (saveErr) {
            console.error(`⚠️ Failed to save to DB (continuing scrape):`, saveErr);
          }
          
          // Save and update UI immediately
          localStorage.setItem('operatorScrapingResults', JSON.stringify(currentResults));
          localStorage.setItem('operatorScrapingProgress', String(Math.round(((totalIndex + 1) / villages.length) * 100)));
          setResults([...currentResults]);
          setProgress(Math.round(((totalIndex + 1) / villages.length) * 100));
          
          // No API call needed - instant! Just continue to next village
          continue;
        }

        // 🆕 STEP 2: If not in name, scrape Google
        try {
          console.log(`🔍 Scraping village ${totalIndex + 1}/${villages.length}: ${village.name}, ${village.suburb}`);
          
          const response = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/operator-scraper/scrape`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${publicAnonKey}`,
              },
              body: JSON.stringify({
                villageName: village.name,
                suburb: village.suburb,
                streetAddress: village.streetAddress || '', // 🆕 Include street address if available
                operatorWhitelist: operators.length > 0 ? operators.map(o => o.name) : [], // Pass empty array if no whitelist
              }),
            }
          );

          if (response.ok) {
            const data = await response.json();
            console.log(`✅ Response for ${village.name}:`, data);
            const newResult = {
              village,
              scrapedOperator: data.scrapedOperator,
              matchedOperator: data.matchedOperator,
              confidence: data.confidence,
              status: (data.matchedOperator ? 'matched' : 'no_match') as const,
            };
            currentResults.push(newResult);
            
            // 💾 SAVE TO DATABASE IMMEDIATELY if matched
            try {
              await saveVillageToDatabase(newResult);
            } catch (saveErr) {
              console.error(`⚠️ Failed to save to DB (continuing scrape):`, saveErr);
            }
          } else {
            const errorText = await response.text();
            console.error(`❌ HTTP ${response.status} for ${village.name}:`, errorText);
            currentResults.push({
              village,
              scrapedOperator: null,
              matchedOperator: null,
              confidence: 0,
              status: 'no_match',
            });
          }

          // 💾 SAVE TO LOCALSTORAGE AFTER EVERY VILLAGE
          localStorage.setItem('operatorScrapingResults', JSON.stringify(currentResults));
          localStorage.setItem('operatorScrapingProgress', String(Math.round(((totalIndex + 1) / villages.length) * 100)));
          
          // Update UI
          setResults([...currentResults]);
          setProgress(Math.round(((totalIndex + 1) / villages.length) * 100));

          // Calculate real-time ETA based on actual performance
          if (startTime && i > 0) {
            const elapsedMs = Date.now() - startTime;
            const avgTimePerVillage = elapsedMs / (i + 1); // Average time per village in milliseconds
            const remaining = villagesToScrape.length - (i + 1);
            const estimatedMs = remaining * avgTimePerVillage;
            
            const hours = Math.floor(estimatedMs / (1000 * 60 * 60));
            const minutes = Math.floor((estimatedMs % (1000 * 60 * 60)) / (1000 * 60));
            
            if (hours > 0) {
              setEstimatedTimeRemaining(`~${hours}h ${minutes}m`);
            } else if (minutes > 0) {
              setEstimatedTimeRemaining(`~${minutes} minutes`);
            } else {
              setEstimatedTimeRemaining('< 1 minute');
            }
          }

          // Rate limiting: 1 second between requests
          if (i < villagesToScrape.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        } catch (err) {
          console.error(`❌ Failed to scrape ${village.name}:`, err);
          currentResults.push({
            village,
            scrapedOperator: null,
            matchedOperator: null,
            confidence: 0,
            status: 'no_match',
          });
          
          // 💾 SAVE EVEN ON ERROR
          localStorage.setItem('operatorScrapingResults', JSON.stringify(currentResults));
        }
      }

      console.log('📊 Final results array length:', currentResults.length);
      console.log('📊 Sample results:', currentResults.slice(0, 5));
      
      setResults(currentResults);
      
      const matchedCount = currentResults.filter(r => r.status === 'matched').length;
      const noMatchCount = currentResults.filter(r => r.status === 'no_match').length;
      
      console.log(`✅ Matched: ${matchedCount}, No match: ${noMatchCount}`);
      
      setSuccess(`✅ Scraping complete: ${matchedCount} matched, ${noMatchCount} need manual review`);
      
      // 💾 Note: Individual villages were saved in real-time during scraping
      console.log(`💾 Real-time saves completed: ${savedToDbCount} villages saved to database`);
      setSuccess(`✅ Scraping complete: ${matchedCount} matched, ${noMatchCount} need review. 💾 ${savedToDbCount} saved to database in real-time!`);
    } catch (err: any) {
      console.error('❌ Scraping error:', err);
      setError(`Scraping failed: ${err.message}`);
    } finally {
      setScraping(false);
    }
  };

  // Download results
  const downloadResults = () => {
    if (results.length === 0) {
      alert('No results to export');
      return;
    }

    const headers = ['Village Name', 'Suburb', 'Postcode', 'Scraped Operator', 'Matched Operator', 'Confidence', 'Status', 'Recommendation'];

    const rows = results.map(result => {
      let recommendation = '';
      if (result.status === 'matched') {
        if (result.confidence >= 80) {
          recommendation = '✅ Auto-update (High confidence)';
        } else if (result.confidence >= 60) {
          recommendation = '⚠️ Review before updating (Medium confidence)';
        } else {
          recommendation = '🔍 Manual verification needed (Low confidence)';
        }
      } else {
        recommendation = '❌ Manual search required';
      }

      return [
        result.village.name,
        result.village.suburb,
        result.village.postcode,
        result.scrapedOperator || 'Not found',
        result.matchedOperator || 'None',
        result.confidence > 0 ? `${result.confidence}%` : 'N/A',
        result.status.toUpperCase(),
        recommendation,
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row =>
        row.map(cell => {
          const cellStr = String(cell);
          if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
            return `"${cellStr.replace(/"/g, '""')}"`;
          }
          return cellStr;
        }).join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `operator_scraping_results_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Manual save handler with UI feedback
  const handleManualSave = async () => {
    if (results.length === 0) {
      alert('No results to save');
      return;
    }

    const matchedResults = results.filter(r => r.status === 'matched');
    if (matchedResults.length === 0) {
      alert('No matched results to save');
      return;
    }

    setError(null);
    setSuccess('Saving to database...');

    try {
      const result = await saveResultsToDatabase(results);
      if (result && result.success !== false) {
        if (result.successCount === 0 && result.skipCount > 0) {
          setError(`⚠️ Database updated: ${result.successCount || 0} saved, ${result.skipCount || 0} skipped. Villages may not exist in DB! Click "🔍 Verify Database" to check.`);
        } else {
          setSuccess(`✅ Database updated: ${result.successCount || 0} saved, ${result.skipCount || 0} skipped`);
        }
      } else {
        setError(`Failed to save: ${result?.error || 'Unknown error'}`);
      }
    } catch (err: any) {
      setError(`Save error: ${err.message}`);
    }
  };

  // Download ONLY no-match results for review
  const downloadNoMatches = () => {
    // Export ALL villages where we couldn't find a real operator:
    // 1. Villages with status: 'no_match' (Google found nothing, or found operator not in whitelist)
    // 2. Villages where matchedOperator is "Independent" (we found independent, not a real operator)
    const noMatches = results.filter(r => {
      // Include if status is no_match
      if (r.status === 'no_match') return true;
      
      // Also include if matched operator is "Independent" (not a real operator)
      if (r.matchedOperator?.toLowerCase().includes('independent')) return true;
      
      return false;
    });
    
    if (noMatches.length === 0) {
      alert('✅ All villages have real operators assigned!');
      return;
    }

    console.log(`📊 Exporting ${noMatches.length} villages without real operators`);

    const headers = ['Village Name', 'Suburb', 'Postcode', 'What Google Found', 'Issue'];

    const rows = noMatches.map(result => {
      let issue = '';
      
      if (!result.scrapedOperator || result.scrapedOperator === 'Not found') {
        issue = 'Google returned no operator name';
      } else {
        issue = `Google found "${result.scrapedOperator}" but not in your 118-operator whitelist`;
      }

      return [
        result.village.name,
        result.village.suburb,
        result.village.postcode,
        result.scrapedOperator || 'Nothing found',
        issue,
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row =>
        row.map(cell => {
          const cellStr = String(cell);
          if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
            return `"${cellStr.replace(/"/g, '""')}"`;
          }
          return cellStr;
        }).join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `unmatched_villages_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Apply updates to database
  const applyUpdates = async () => {
    const highConfidenceMatches = results.filter(r => r.status === 'matched' && r.confidence >= 80);

    if (highConfidenceMatches.length === 0) {
      setError('No high-confidence matches to update');
      return;
    }

    if (!confirm(`Update ${highConfidenceMatches.length} villages with operators (80%+ confidence only)?`)) {
      return;
    }

    // Note: This would need a backend endpoint to update villages by name+suburb
    // For now, just export to CSV for manual upload
    alert('This feature requires backend implementation. Please use "Export to Spreadsheet" and update manually for now.');
  };

  const downloadVillageTemplate = () => {
    const template = `village name,suburb,postcode,street address\nApplewood Retirement Village,Doncaster,3108,123 Applewood Road\nExample Village,Example Suburb,3000,456 Example Street`;
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'village_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const downloadOperatorTemplate = () => {
    const template = `operator\nAbound Communities\nAveo\nStockland\nLendlease`;
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'operator_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // 🆕 Export ONLY no-match villages for safe re-scraping
  const exportNoMatchesOnly = () => {
    const noMatches = results.filter(r => r.status === 'no_match' || r.matchedOperator?.toLowerCase().includes('independent'));
    
    if (noMatches.length === 0) {
      setError('No no-match villages to export!');
      return;
    }

    // Create CSV with just the village data needed for re-scraping
    const headers = ['village name', 'suburb', 'postcode'];
    const rows = noMatches.map(r => [
      `"${r.village.name}"`,
      r.village.suburb,
      r.village.postcode
    ]);

    const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vic-no-match-villages-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    setSuccess(`✅ Exported ${noMatches.length} no-match villages to CSV`);
  };

  // 🆕 EXPORT ALL RESULTS (INCLUDING MATCHED) FOR REVIEW
  const exportAllResultsToCSV = () => {
    if (results.length === 0) {
      setError('No scraping results to export');
      return;
    }

    const headers = ['name', 'suburb', 'postcode', 'street address', 'matched operator', 'confidence', 'status'];
    const rows = results.map(r => [
      `"${r.village.name}"`,
      `"${r.village.suburb}"`,
      `"${r.village.postcode}"`,
      `"${r.village.streetAddress || ''}"`,
      `"${r.matchedOperator || ''}"`,
      r.confidence || 0,
      r.status || '',
    ]);

    const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scraping-results-all-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    setSuccess(`✅ Exported ${results.length} scraping results to CSV`);
  };

  const matchedResults = results.filter(r => r.status === 'matched');
  const noMatchResults = results.filter(r => r.status === 'no_match');

  // Check if we have saved data in localStorage (even if not loaded into state yet)
  const hasSavedData = () => {
    try {
      const savedResults = localStorage.getItem('operatorScrapingResults');
      console.log('🔍 hasSavedData check - savedResults raw:', savedResults ? 'EXISTS' : 'NULL');
      if (!savedResults) return false;
      const parsed = JSON.parse(savedResults);
      console.log('🔍 hasSavedData check - parsed length:', parsed.length);
      const hasData = Array.isArray(parsed) && parsed.length > 0;
      console.log('🔍 hasSavedData returning:', hasData);
      return hasData;
    } catch (e) {
      console.error('Error checking saved data:', e);
      return false;
    }
  };

  console.log('📊 Component render - results.length:', results.length);
  console.log('📊 Component render - hasSavedData():', hasSavedData());

  // Show database statistics
  const showDatabaseStats = async () => {
    setError(null);
    setSuccess('📊 Fetching database stats...');

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/database-stats`,
        {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('📊 Database Stats:', data);
        
        const vicStats = data.byState?.find((s: any) => s.state === 'VIC');
        const vicTotal = vicStats?.count || 0;
        const vicWithOperator = vicStats?.with_operator || 0;
        const vicWithoutOperator = vicTotal - vicWithOperator;

        setSuccess(
          `📊 VIC Database: ${vicTotal} villages total | ` +
          `${vicWithOperator} with operators | ` +
          `${vicWithoutOperator} without operators`
        );
      } else {
        const errorText = await response.text();
        console.error('Database stats error response:', errorText);
        setError(`Failed to fetch database stats: ${response.status} - ${errorText}`);
      }
    } catch (err: any) {
      setError(`Stats error: ${err.message}`);
    }
  };

  // Verify villages exist in database
  const verifyDatabase = async () => {
    if (results.length === 0) {
      alert('No results to verify. Upload CSVs and scrape first.');
      return;
    }

    setError(null);
    setSuccess('🔍 Checking database...');

    try {
      // Check first 5 villages
      const samplesToCheck = results.slice(0, 5);
      let foundCount = 0;
      let notFoundCount = 0;

      for (const result of samplesToCheck) {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/villages?state=VIC&name=${encodeURIComponent(result.village.name)}`,
          {
            headers: { 'Authorization': `Bearer ${publicAnonKey}` },
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.villages && data.villages.length > 0) {
            foundCount++;
            console.log(`✅ Found in DB: ${result.village.name}`);
          } else {
            notFoundCount++;
            console.log(`❌ NOT in DB: ${result.village.name}`);
          }
        }
      }

      if (foundCount === 0) {
        setError(`⚠️ PROBLEM: None of the ${samplesToCheck.length} villages checked exist in database! You need to import villages first.`);
      } else if (notFoundCount > 0) {
        setSuccess(`⚠️ Mixed results: ${foundCount} found, ${notFoundCount} missing in database.`);
      } else {
        setSuccess(`✅ All ${foundCount} sample villages exist in database! Saves should work.`);
      }
    } catch (err: any) {
      setError(`Database check failed: ${err.message}`);
    }
  };

  // Clear localStorage button (for debugging)
  const clearSavedData = () => {
    if (confirm('Clear saved scraping data from localStorage?')) {
      localStorage.removeItem('operatorScrapingResults');
      localStorage.removeItem('operatorScrapingProgress');
      localStorage.removeItem('operatorScrapingVillages');
      localStorage.removeItem('operatorScrapingOperators');
      setResults([]);
      setProgress(0);
      setSuccess('✅ Cleared saved data');
    }
  };

  // 🆕 MANUAL LOAD FROM LOCALSTORAGE
  const manualLoadSavedResults = () => {
    const savedResults = localStorage.getItem('operatorScrapingResults');
    const savedVillages = localStorage.getItem('operatorScrapingVillages');
    const savedOperators = localStorage.getItem('operatorScrapingOperators');
    
    if (!savedResults) {
      setError('❌ No saved results found in localStorage');
      return;
    }
    
    try {
      const parsedResults = JSON.parse(savedResults);
      setResults(parsedResults);
      
      if (savedVillages) {
        setVillages(JSON.parse(savedVillages));
      }
      
      if (savedOperators) {
        setOperators(JSON.parse(savedOperators));
      }
      
      setSuccess(`✅ Loaded ${parsedResults.length} results from localStorage`);
      console.log('✅ Manually loaded results:', parsedResults);
    } catch (e: any) {
      setError(`❌ Failed to load results: ${e.message}`);
    }
  };

  // Debug: Check localStorage state
  const debugLocalStorage = () => {
    const savedResults = localStorage.getItem('operatorScrapingResults');
    const savedProgress = localStorage.getItem('operatorScrapingProgress');
    const savedVillages = localStorage.getItem('operatorScrapingVillages');
    const savedOperators = localStorage.getItem('operatorScrapingOperators');
    
    console.log('=== LOCALSTORAGE DEBUG ===');
    console.log('Saved Results:', savedResults ? JSON.parse(savedResults).length + ' items' : 'NULL');
    console.log('Saved Progress:', savedProgress || 'NULL');
    console.log('Current Results State:', results.length);
    console.log('Current Villages:', villages.length);
    console.log('Current Operators:', operators.length);
    console.log('========================');
    
    alert(`🔍 Debug Info:
    
localStorage Results: ${savedResults ? JSON.parse(savedResults).length + ' items' : 'EMPTY'}
localStorage Progress: ${savedProgress || 'EMPTY'}
Current State Results: ${results.length}
Current Villages: ${villages.length}
Current Operators: ${operators.length}
    
Check console for full details.`);
  };

  // 🆕 IMPORT PREVIOUS RESULTS FROM CSV
  const handleImportResults = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (parseResults) => {
        try {
          const imported: ScrapeResult[] = [];
          
          parseResults.data.forEach((row: any) => {
            const villageName = row['Village Name'] || '';
            const suburb = row['Suburb'] || '';
            const postcode = row['Postcode'] || '';
            const scrapedOperator = row['Scraped Operator'] || null;
            const matchedOperator = row['Matched Operator'] || null;
            const confidenceStr = row['Confidence'] || '0';
            const status = row['Status']?.toLowerCase() || 'no_match';

            if (villageName && suburb && postcode) {
              // Parse confidence (remove % sign if present)
              const confidence = confidenceStr === 'N/A' ? 0 : parseInt(confidenceStr.replace('%', '')) || 0;
              
              imported.push({
                village: {
                  name: villageName.trim(),
                  suburb: suburb.trim(),
                  postcode: postcode.trim(),
                },
                scrapedOperator: scrapedOperator === 'Not found' ? null : scrapedOperator,
                matchedOperator: matchedOperator === 'None' ? null : matchedOperator,
                confidence,
                status: status === 'matched' ? 'matched' : 'no_match',
              });
            }
          });

          if (imported.length === 0) {
            setError('No valid results found in CSV. Make sure you uploaded the exported results file.');
            return;
          }

          // Save to state and localStorage
          setResults(imported);
          localStorage.setItem('operatorScrapingResults', JSON.stringify(imported));
          setProgress(100);
          localStorage.setItem('operatorScrapingProgress', '100');

          const matchedCount = imported.filter(r => r.status === 'matched').length;
          const noMatchCount = imported.filter(r => r.status === 'no_match').length;

          setSuccess(`✅ Imported ${imported.length} results: ${matchedCount} matched, ${noMatchCount} no-match`);
          console.log('✅ Imported results:', imported.length);
        } catch (err) {
          setError(`Failed to import results: ${err.message}`);
          console.error('Import error:', err);
        }
      },
      error: (error) => {
        setError(`CSV parse error: ${error.message}`);
      },
    });
  };

  // 🆕 RE-ANALYZE VILLAGE NAMES for operator matches
  const reanalyzeNames = () => {
    if (operators.length === 0) {
      setError('⚠️ Operator whitelist needed for name re-analysis. Upload CSV or skip this step.');
      return;
    }

    if (results.length === 0) {
      setError('No results to analyze. Import your CSV first.');
      return;
    }

    console.log('🔍 Re-analyzing village names for operator matches...');
    console.log('📋 Operators in whitelist:', operators.map(o => o.name).slice(0, 20)); // Show first 20
    
    let matchesFound = 0;
    const updatedResults = results.map(result => {
      // Skip if already matched to a real operator
      if (result.status === 'matched' && result.matchedOperator && !result.matchedOperator.toLowerCase().includes('independent')) {
        return result;
      }

      // Check if operator is in village name
      const villageName = result.village.name;
      const villageNameLower = villageName.toLowerCase();
      
      for (const operator of operators) {
        const operatorLower = operator.name.toLowerCase();
        
        // 🆕 CASE 1: Exact substring match (case-insensitive)
        if (villageNameLower.includes(operatorLower)) {
          console.log(`✅ Found "${operator.name}" in "${result.village.name}"`);
          matchesFound++;
          return {
            ...result,
            scrapedOperator: `FROM NAME: ${operator.name}`,
            matchedOperator: operator.name,
            confidence: 100,
            status: 'matched' as const,
          };
        }
        
        // 🆕 CASE 2: Operator IS an acronym (e.g., "VMCH", "RSL", "BCS" in the operator list)
        // Check if operator name is a short acronym (2-6 uppercase letters)
        if (/^[A-Z]{2,6}$/.test(operator.name)) {
          // Check if this acronym appears in the village name (case-insensitive)
          const acronymRegex = new RegExp(`\\b${operator.name}\\b`, 'i'); // Word boundary, case-insensitive
          if (acronymRegex.test(villageName)) {
            console.log(`✅ ACRONYM DIRECT MATCH: "${operator.name}" found in "${result.village.name}"`);
            matchesFound++;
            return {
              ...result,
              scrapedOperator: `FROM NAME (Acronym): ${operator.name}`,
              matchedOperator: operator.name,
              confidence: 100,
              status: 'matched' as const,
            };
          }
          
          // 🆕 CASE 2B: Generate acronym FROM village name to match operator acronym
          // Example: "Villa Maria Catholic Homes Northcote" → extract "Villa Maria Catholic Homes" → generate "VMCH"
          // Extract sequences of capitalized words (title case phrases)
          const words = villageName.split(/\s+/);
          
          // Try different window sizes (2-6 consecutive capitalized words)
          for (let windowSize = 2; windowSize <= 6; windowSize++) {
            for (let i = 0; i <= words.length - windowSize; i++) {
              const windowWords = words.slice(i, i + windowSize);
              
              // Check if all words in window are capitalized (title case)
              const allCapitalized = windowWords.every(w => /^[A-Z]/.test(w));
              
              if (allCapitalized) {
                const generatedAcronym = windowWords.map(w => w[0].toUpperCase()).join('');
                
                if (generatedAcronym === operator.name) {
                  const matchedPhrase = windowWords.join(' ');
                  console.log(`✅ ACRONYM FROM NAME: "${operator.name}" matches "${matchedPhrase}" in "${result.village.name}"`);
                  matchesFound++;
                  return {
                    ...result,
                    scrapedOperator: `FROM NAME (${matchedPhrase}): ${operator.name}`,
                    matchedOperator: operator.name,
                    confidence: 100,
                    status: 'matched' as const,
                  };
                }
              }
            }
          }
        }
        
        // 🆕 CASE 3: Generate acronym from multi-word operator name
        // Check for acronyms (e.g., "VMCH", "RSL", "BCS") already in the village name
        const acronymsInName = villageName.match(/\b[A-Z]{2,}\b/g) || [];
        
        for (const acronym of acronymsInName) {
          const operatorWords = operator.name.split(/[\s-]+/).filter(w => w.length > 0); // Split on spaces or hyphens
          const operatorAcronym = operatorWords.map(w => w[0].toUpperCase()).join('');
          
          if (acronym === operatorAcronym) {
            console.log(`✅ ACRONYM MATCH: "${acronym}" in "${result.village.name}" matches "${operator.name}" (${operatorAcronym})`);
            matchesFound++;
            return {
              ...result,
              scrapedOperator: `FROM NAME (Acronym): ${operator.name}`,
              matchedOperator: operator.name,
              confidence: 95,
              status: 'matched' as const,
            };
          }
        }
      }
      
      return result;
    });

    if (matchesFound === 0) {
      setSuccess('✅ No additional matches found in village names');
      return;
    }

    // Update state and save
    setResults(updatedResults);
    localStorage.setItem('operatorScrapingResults', JSON.stringify(updatedResults));

    const newMatchedCount = updatedResults.filter(r => r.status === 'matched').length;
    const newNoMatchCount = updatedResults.filter(r => r.status === 'no_match').length;

    setSuccess(`🎯 Found ${matchesFound} new matches in village names! Total: ${newMatchedCount} matched, ${newNoMatchCount} no-match`);
    console.log(`✅ Re-analysis complete: ${matchesFound} new matches found`);
  };

  // 🆕 RE-SCRAPE NO-MATCHES with improved logic
  const rescrapeNoMatches = async () => {
    // Operators now optional for re-scraping
    if (operators.length === 0) {
      console.log('⚠️ No operator whitelist - will extract operator names directly from Google');
    }

    if (results.length === 0) {
      setError('No results to re-scrape. Import your CSV first.');
      return;
    }

    // Get all no-match and independent villages
    const noMatches = results.filter(r => {
      if (r.status === 'no_match') return true;
      if (r.matchedOperator?.toLowerCase().includes('independent')) return true;
      return false;
    });

    if (noMatches.length === 0) {
      setSuccess('✅ All villages already have operators!');
      return;
    }

    if (!confirm(`Re-scrape ${noMatches.length} no-match villages with improved logic? This will use ScraperAPI credits.`)) {
      return;
    }

    setScraping(true);
    setError(null);
    setStartTime(Date.now());
    setShouldStop(false);
    setSavedToDbCount(0); // Reset counter

    console.log(`🔄 Re-scraping ${noMatches.length} no-match villages...`);

    let newMatchesFound = 0;

    try {
      for (let i = 0; i < noMatches.length; i++) {
        // Check if user clicked Stop
        if (shouldStop) {
          console.log('⏸️ Re-scraping paused by user');
          setSuccess(`⏸️ Re-scraping paused after ${i} villages. ${newMatchesFound} new matches found.`);
          setShouldStop(false);
          break;
        }

        const village = noMatches[i].village;
        console.log(`🔍 Re-scraping ${i + 1}/${noMatches.length}: ${village.name}`);
        if (village.streetAddress) {
          console.log(`   📍 Using street address: ${village.streetAddress}`);
        }

        try {
          const response = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/operator-scraper/scrape`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${publicAnonKey}`,
              },
              body: JSON.stringify({
                villageName: village.name,
                suburb: village.suburb,
                streetAddress: village.streetAddress || '', // 🆕 Include street address if available
                operatorWhitelist: operators.length > 0 ? operators.map(o => o.name) : [], // Pass empty array if no whitelist
              }),
            }
          );

          if (response.ok) {
            const data = await response.json();
            console.log(`✅ Re-scrape response for ${village.name}:`, data);

            // Update the result in our array
            const updatedResults = results.map(r => {
              if (r.village.name === village.name && r.village.suburb === village.suburb) {
                const wasNoMatch = r.status === 'no_match' || r.matchedOperator?.toLowerCase().includes('independent');
                const nowMatched = data.matchedOperator && !data.matchedOperator.toLowerCase().includes('independent');
                
                if (wasNoMatch && nowMatched) {
                  newMatchesFound++;
                  console.log(`🎉 NEW MATCH: ${village.name} → ${data.matchedOperator}`);
                }

                return {
                  ...r,
                  scrapedOperator: data.scrapedOperator,
                  matchedOperator: data.matchedOperator,
                  confidence: data.confidence,
                  status: data.matchedOperator ? 'matched' : 'no_match',
                };
              }
              return r;
            });

            setResults(updatedResults);
            localStorage.setItem('operatorScrapingResults', JSON.stringify(updatedResults));
          }

          setProgress(Math.round(((i + 1) / noMatches.length) * 100));

          // Rate limiting: 1 second between requests
          if (i < noMatches.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        } catch (err) {
          console.error(`❌ Failed to re-scrape ${village.name}:`, err);
        }
      }

      const finalMatchedCount = results.filter(r => r.status === 'matched').length;
      const finalNoMatchCount = results.filter(r => r.status === 'no_match').length;

      setSuccess(`✅ Re-scraping complete! Found ${newMatchesFound} new matches. Total: ${finalMatchedCount} matched, ${finalNoMatchCount} no-match`);
      setProgress(100);
    } catch (err) {
      console.error('❌ Re-scraping error:', err);
      setError(`Re-scraping failed: ${err.message}`);
    } finally {
      setScraping(false);
    }
  };
  
  return (
    <div className="space-y-6">
      {/* 🐛 DEBUG PANEL - Remove after fixing */}
      <ScraperDebugPanel 
        villages={villages}
        operators={operators}
        results={results}
        scraping={scraping}
      />
      
      {/* 🆕 RECOVERY STATUS */}
      {results.length > 0 && (
        <Alert className="bg-purple-50 border-purple-300">
          <CheckCircle className="size-4 text-purple-600" />
          <AlertDescription className="text-purple-800">
            <strong>📦 {results.length} scraped results loaded</strong> - Ready to save to database or export
          </AlertDescription>
        </Alert>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="size-5" />
            Operator Scraper
          </CardTitle>
          <CardDescription>
            Scrape Google to find operators for VIC villages using the known operator whitelist
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Upload Village CSV */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Step 1: Upload Village CSV (509 villages)</h3>
              <Button variant="outline" size="sm" onClick={downloadVillageTemplate}>
                <Download className="size-4 mr-2" />
                Download Template
              </Button>
            </div>

            <div className="flex items-center gap-3">
              <label htmlFor="village-upload" className="cursor-pointer">
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors">
                  <Upload className="size-4" />
                  <span className="font-medium">Choose Village CSV</span>
                </div>
                <input
                  id="village-upload"
                  type="file"
                  accept=".csv"
                  onChange={handleVillageUpload}
                  className="hidden"
                />
              </label>
              {villageFile && <span className="text-sm text-muted-foreground">{villageFile.name}</span>}
              {villages.length > 0 && (
                <Badge variant="default" className="bg-green-600">
                  <CheckCircle className="size-3 mr-1" />
                  {villages.length} villages
                </Badge>
              )}
            </div>
          </div>

          {/* Step 2: Upload Operator Whitelist (OPTIONAL) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Step 2: Upload Operator Whitelist (Optional)</h3>
                <p className="text-sm text-muted-foreground">Only needed for name-matching. Backend will extract operators from Google directly.</p>
              </div>
              <Button variant="outline" size="sm" onClick={downloadOperatorTemplate}>
                <Download className="size-4 mr-2" />
                Download Template
              </Button>
            </div>

            <div className="flex items-center gap-3">
              <label htmlFor="operator-upload" className="cursor-pointer">
                <div className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors">
                  <Upload className="size-4" />
                  <span className="font-medium">Choose Operator CSV</span>
                </div>
                <input
                  id="operator-upload"
                  type="file"
                  accept=".csv"
                  onChange={handleOperatorUpload}
                  className="hidden"
                />
              </label>
              {operatorFile && <span className="text-sm text-muted-foreground">{operatorFile.name}</span>}
              {operators.length > 0 && (
                <Badge variant="default" className="bg-purple-600">
                  <Building2 className="size-3 mr-1" />
                  {operators.length} operators
                </Badge>
              )}
            </div>
          </div>

          {/* 🆕 IMPORT PREVIOUS RESULTS */}
          <div className="space-y-3 border-t pt-6">
            <h3 className="font-semibold text-orange-600">🔄 Or Load Previous Results</h3>
            <p className="text-sm text-muted-foreground">
              Already scraped? Upload your exported CSV to continue from where you left off.
            </p>
            <div className="flex items-center gap-3">
              <label htmlFor="import-results" className="cursor-pointer">
                <div className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-md transition-colors">
                  <Upload className="size-4" />
                  <span className="font-medium">Import Previous Results CSV</span>
                </div>
                <input
                  id="import-results"
                  type="file"
                  accept=".csv"
                  onChange={handleImportResults}
                  className="hidden"
                />
              </label>
            </div>
            
            {/* 🆕 RE-ANALYZE NAMES BUTTON */}
            {results.length > 0 && operators.length > 0 && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">🔍 Found operators in village names?</h4>
                <p className="text-sm text-blue-700 mb-3">
                  Many villages have the operator name in their title (e.g., "Aveo Durack", "Stockland Village"). 
                  Click below to automatically match them!
                </p>
                <Button
                  onClick={reanalyzeNames}
                  variant="outline"
                  className="border-blue-500 text-blue-700 hover:bg-blue-100"
                  disabled={scraping}
                >
                  <Search className="size-4 mr-2" />
                  Re-analyze Village Names
                </Button>
              </div>
            )}

            {/* 🆕 ADD STREET ADDRESSES - Show when villages OR results exist */}
            {((villages.length > 0 && operators.length > 0) || (results.length > 0 && operators.length > 0)) && (
              <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <h4 className="font-semibold text-purple-800 mb-2">📍 Add Street Addresses from VIC Gov Data</h4>
                <p className="text-sm text-purple-700 mb-3">
                  Upload your VIC Gov reconciled CSV (with street addresses like "19-41 Gwalia Street"). 
                  {results.length > 0 ? (
                    <>We'll merge addresses into the {results.filter(r => r.status === 'no_match' || r.matchedOperator?.toLowerCase().includes('independent')).length} no-match villages for more precise Google searches.</>
                  ) : (
                    <>We'll add addresses to your {villages.length} villages before scraping starts.</>
                  )}
                </p>
                {(() => {
                  if (results.length > 0) {
                    const noMatchVillages = results.filter(r => r.status === 'no_match' || r.matchedOperator?.toLowerCase().includes('independent'));
                    const withAddresses = noMatchVillages.filter(r => r.village.streetAddress);
                    const withoutAddresses = noMatchVillages.length - withAddresses.length;
                    
                    if (withAddresses.length > 0) {
                      return (
                        <div className="mb-3 p-2 bg-purple-100 rounded border border-purple-300">
                          <p className="text-sm font-medium text-purple-800">
                            ✅ {withAddresses.length} no-match villages have street addresses
                          </p>
                          {withoutAddresses > 0 && (
                            <p className="text-xs text-purple-600 mt-1">
                              ⚠️ {withoutAddresses} still need addresses
                            </p>
                          )}
                        </div>
                      );
                    }
                  } else if (villages.length > 0) {
                    const withAddresses = villages.filter(v => v.streetAddress);
                    const withoutAddresses = villages.length - withAddresses.length;
                    
                    if (withAddresses.length > 0) {
                      return (
                        <div className="mb-3 p-2 bg-purple-100 rounded border border-purple-300">
                          <p className="text-sm font-medium text-purple-800">
                            ✅ {withAddresses.length}/{villages.length} villages have street addresses
                          </p>
                          {withoutAddresses > 0 && (
                            <p className="text-xs text-purple-600 mt-1">
                              ⚠️ {withoutAddresses} still need addresses
                            </p>
                          )}
                        </div>
                      );
                    }
                  }
                  return null;
                })()}
                  <p className="text-xs text-purple-600 mb-3">
                    💡 <strong>Format:</strong> CSV must have columns: <code>village name</code> and <code>street address</code> (suburb is optional)
                  </p>
                  <label htmlFor="vicgov-upload" className="cursor-pointer">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors">
                      <Upload className="size-4" />
                      <span className="font-medium">Upload VIC Gov CSV (with addresses)</span>
                    </div>
                    <input
                      id="vicgov-upload"
                      type="file"
                      accept=".csv"
                      onChange={handleVicGovUpload}
                      className="hidden"
                    />
                  </label>
              </div>
            )}

            {/* 🆕 RE-SCRAPE NO-MATCHES - Only show after initial scraping */}
            {results.length > 0 && operators.length > 0 && (
              <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <h4 className="font-semibold text-orange-800 mb-2">🔄 Re-scrape No-Matches with Improved Logic</h4>
                <p className="text-sm text-orange-700 mb-3">
                  Use improved scraping with URL domain checking and better operator matching to find more matches for the {results.filter(r => r.status === 'no_match' || r.matchedOperator?.toLowerCase().includes('independent')).length} remaining no-match villages.
                </p>
                <Button
                  onClick={rescrapeNoMatches}
                  variant="outline"
                  className="border-orange-500 text-orange-700 hover:bg-orange-100"
                  disabled={scraping}
                >
                  <Search className="size-4 mr-2" />
                  Re-scrape No-Matches ({results.filter(r => r.status === 'no_match' || r.matchedOperator?.toLowerCase().includes('independent')).length})
                </Button>
              </div>
            )}
          </div>

          {/* Step 3: Scrape */}
          <div className="space-y-3">
            <h3 className="font-semibold">Step 3: Scrape Operators from Google</h3>
            <div className="flex gap-3">
              <Button
                onClick={startScraping}
                disabled={scraping || villages.length === 0}
                className="bg-green-600 hover:bg-green-700"
              >
                {scraping ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Scraping ({progress}%)... {savedToDbCount > 0 && `💾 ${savedToDbCount} saved to DB`}
                  </>
                ) : (
                  <>
                    <Search className="size-4 mr-2" />
                    {results.length > 0 && results.length < villages.length ? 'Resume' : 'Start'} Operator Scraping
                  </>
                )}
              </Button>
              
              {scraping && (
                <Button
                  onClick={() => setShouldStop(true)}
                  variant="destructive"
                  className="bg-red-600 hover:bg-red-700"
                >
                  <StopCircle className="size-4 mr-2" />
                  Stop Scraping
                </Button>
              )}
            </div>
            {scraping && (
              <div className="space-y-2">
                <Progress value={progress} />
                <p className="text-sm text-muted-foreground">
                  Processing village {Math.round((progress / 100) * villages.length)} of {villages.length}
                  <br />
                  <span className="text-xs">⏱️ Estimated time: {estimatedTimeRemaining}</span>
                  {savedToDbCount > 0 && (
                    <>
                      <br />
                      <span className="text-xs text-green-600 font-semibold">💾 Saved to database: {savedToDbCount} villages</span>
                    </>
                  )}
                </p>
              </div>
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

          {/* Debug Panel */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              onClick={manualLoadSavedResults}
              variant="default"
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 font-semibold"
            >
              🔄 Load Saved Results
            </Button>
            <Button
              onClick={debugLocalStorage}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              🔍 Debug localStorage
            </Button>
            <Button
              onClick={clearSavedData}
              variant="outline"
              size="sm"
              className="text-xs text-red-600"
            >
              🗑️ Clear Saved Data
            </Button>
            
            <Button
              onClick={verifyDatabase}
              variant="outline"
              size="sm"
              className="text-xs text-blue-600"
            >
              🔍 Verify Database
            </Button>
            
            <Button
              onClick={showDatabaseStats}
              variant="outline"
              size="sm"
              className="text-xs text-green-600"
            >
              📊 Database Stats
            </Button>
            
            {/* 🆕 EXPORT BUTTONS ALWAYS VISIBLE IF DATA EXISTS */}
            {(results.length > 0 || hasSavedData()) && (
              <>
                <Button
                  onClick={downloadNoMatches}
                  variant="outline"
                  size="sm"
                  className="border-orange-500 text-orange-600 hover:bg-orange-50"
                  disabled={noMatchResults.length === 0 && results.length > 0}
                >
                  <XCircle className="size-4 mr-2" />
                  Export No-Matches ({noMatchResults.length || '?'})
                </Button>
                <Button
                  onClick={downloadResults}
                  variant="outline"
                  size="sm"
                  className="border-blue-500 text-blue-600 hover:bg-blue-50"
                >
                  <FileSpreadsheet className="size-4 mr-2" />
                  Export All Results
                </Button>
                <Button
                  onClick={handleManualSave}
                  variant="default"
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700"
                  disabled={results.length === 0}
                >
                  💾 Save Matches to Database
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Scraping Results</CardTitle>
                <CardDescription>Review operator matches</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={exportAllResultsToCSV}
                  variant="outline"
                  size="sm"
                  className="border-green-500 text-green-600 hover:bg-green-50 font-semibold"
                >
                  <Download className="size-4 mr-2" />
                  📊 Export All Results to CSV
                </Button>
                <Button
                  onClick={exportNoMatchesOnly}
                  variant="outline"
                  className="border-purple-500 text-purple-600 hover:bg-purple-50 font-semibold"
                  disabled={noMatchResults.length === 0}
                >
                  <Download className="size-4 mr-2" />
                  📍 Export No-Matches for Re-scraping ({noMatchResults.length})
                </Button>
                <Button
                  onClick={downloadNoMatches}
                  variant="outline"
                  className="border-orange-500 text-orange-600 hover:bg-orange-50"
                  disabled={noMatchResults.length === 0}
                >
                  <XCircle className="size-4 mr-2" />
                  Export No-Matches (Review)
                </Button>
                <Button
                  onClick={downloadResults}
                  variant="outline"
                  className="border-blue-500 text-blue-600 hover:bg-blue-50"
                >
                  <FileSpreadsheet className="size-4 mr-2" />
                  Export All Results
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* 🛡️ SAFE WORKFLOW GUIDE */}
            {noMatchResults.length > 0 && (
              <Alert className="mb-6 bg-purple-50 border-purple-300">
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-semibold text-purple-900">🛡️ Safe Re-scraping Workflow (Protects your {matchedResults.length} matched villages):</p>
                    <ol className="text-sm text-purple-800 space-y-1 ml-4 list-decimal">
                      <li>Click <strong>"📍 Export No-Matches for Re-scraping"</strong> button above to download {noMatchResults.length} villages as CSV</li>
                      <li>Start fresh: Clear this page and upload ONLY that {noMatchResults.length}-village CSV</li>
                      <li>Upload your VIC Gov CSV (with street addresses) using the purple button</li>
                      <li>Upload the 118-operator whitelist</li>
                      <li>Click "Start Scraping" to re-scrape with street address precision</li>
                      <li>Merge results manually later (your {matchedResults.length} matched villages stay safe!)</li>
                    </ol>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-4 mb-6">
              <Badge variant="default" className="bg-green-600 text-white">
                <CheckCircle className="size-3 mr-1" />
                {matchedResults.length} Matched
              </Badge>
              <Badge variant="default" className="bg-yellow-600 text-white">
                <XCircle className="size-3 mr-1" />
                {noMatchResults.length} Need Manual Review
              </Badge>
            </div>

            {/* Matched Results */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">✅ Matched Operators ({matchedResults.length})</h3>
              <div className="max-h-96 overflow-y-auto space-y-2">
                {matchedResults.map((result, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 border rounded-lg bg-green-50">
                    <div className="flex-1">
                      <p className="font-medium">{result.village.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {result.village.suburb}, VIC {result.village.postcode}
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        Google found: "{result.scrapedOperator}"
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-medium text-green-700">{result.matchedOperator}</p>
                        <p className="text-xs text-muted-foreground">
                          {result.confidence >= 80 ? '🎯 High' : result.confidence >= 60 ? '⚠️ Medium' : '❓ Low'} confidence ({result.confidence}%)
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* No Match Results */}
              <h3 className="font-semibold text-lg mt-6">❌ Need Manual Review ({noMatchResults.length})</h3>
              <div className="max-h-96 overflow-y-auto space-y-2">
                {noMatchResults.map((result, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 border rounded-lg bg-yellow-50">
                    <div className="flex-1">
                      <p className="font-medium">{result.village.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {result.village.suburb}, VIC {result.village.postcode}
                      </p>
                      {result.village.streetAddress && (
                        <p className="text-xs text-purple-600 mt-1">
                          📍 {result.village.streetAddress}
                        </p>
                      )}
                      {result.scrapedOperator && (
                        <p className="text-xs text-orange-600 mt-1">
                          Google found: "{result.scrapedOperator}" (not in whitelist)
                        </p>
                      )}
                      {!result.scrapedOperator && (
                        <p className="text-xs text-red-600 mt-1">
                          ⚠️ Google returned no operator
                        </p>
                      )}
                    </div>
                    <Badge variant="default" className="bg-yellow-600">
                      No Match
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}