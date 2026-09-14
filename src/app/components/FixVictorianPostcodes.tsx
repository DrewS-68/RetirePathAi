import { useState } from 'react';
import { getSupabaseClient } from '../utils/supabase/client';
import { Button } from './ui/button';
import { AlertCircle, CheckCircle, MapPin } from 'lucide-react';

export function FixVictorianPostcodes() {
  const [checking, setChecking] = useState(false);
  const [fixing, setFixing] = useState(false);
  const [checkResult, setCheckResult] = useState<any>(null);
  const [fixResult, setFixResult] = useState<any>(null);

  const checkVictorianVillages = async () => {
    setChecking(true);
    setCheckResult(null);
    
    try {
      const supabase = getSupabaseClient();
      
      // Find Victorian villages with missing postcodes
      const { data: vicVillages, error } = await supabase
        .from('retirement_villages')
        .select('*')
        .eq('state', 'VIC')
        .or('postcode.is.null,postcode.eq.');
      
      if (error) throw error;
      
      console.log('Victorian villages with missing postcodes:', vicVillages);
      
      setCheckResult({
        total: vicVillages?.length || 0,
        villages: vicVillages || []
      });
      
    } catch (err: any) {
      console.error(err);
      setCheckResult({ error: err.message });
    } finally {
      setChecking(false);
    }
  };

  const fixPostcodes = async () => {
    if (!checkResult || !checkResult.villages || checkResult.villages.length === 0) {
      return;
    }
    
    setFixing(true);
    setFixResult(null);
    
    try {
      const supabase = getSupabaseClient();
      
      // Helper function to parse Australian postal address
      const parsePostalAddress = (postalAddress: string): { suburb: string; state: string; postcode: string } => {
        if (!postalAddress) return { suburb: '', state: '', postcode: '' };
        
        const trimmed = postalAddress.trim();
        
        // Pattern 1: Full address with street number, street name, suburb, state, postcode (optionally followed by Australia/Aus)
        // Example: "741 Mt Dandenong Road, KILSYTH VIC 3137 Australia" or "741 Mt Dandenong Road, KILSYTH VIC 3137"
        const fullAddressMatch = trimmed.match(/,?\s*([A-Z\s]+?)\s+(VIC|NSW|QLD|SA|WA|TAS|NT|ACT)\s+(\d{4})(\s+(Australia|Aus|AUS))?$/i);
        
        if (fullAddressMatch) {
          return {
            suburb: fullAddressMatch[1].trim(),
            state: fullAddressMatch[2].toUpperCase(),
            postcode: fullAddressMatch[3]
          };
        }
        
        // Pattern 2: Simple format "Suburb STATE 1234" (optionally followed by Australia/Aus)
        const simpleMatch = trimmed.match(/^(.+?)\s+(VIC|NSW|QLD|SA|WA|TAS|NT|ACT)\s+(\d{4})(\s+(Australia|Aus|AUS))?$/i);
        
        if (simpleMatch) {
          return {
            suburb: simpleMatch[1].trim(),
            state: simpleMatch[2].toUpperCase(),
            postcode: simpleMatch[3]
          };
        }
        
        // Pattern 3: Just look for any 4-digit postcode and state in the string
        const anyPostcodeMatch = trimmed.match(/(VIC|NSW|QLD|SA|WA|TAS|NT|ACT)\s+(\d{4})/i);
        if (anyPostcodeMatch) {
          // Try to extract suburb - anything before the state
          const beforeState = trimmed.substring(0, trimmed.indexOf(anyPostcodeMatch[0])).trim();
          // Get the last part after comma (if any)
          const suburbParts = beforeState.split(',');
          const suburb = suburbParts[suburbParts.length - 1].trim();
          
          return {
            suburb: suburb,
            state: anyPostcodeMatch[1].toUpperCase(),
            postcode: anyPostcodeMatch[2]
          };
        }
        
        return { suburb: trimmed, state: 'VIC', postcode: '' };
      };
      
      let fixed = 0;
      let failed = 0;
      const errors: string[] = [];
      
      for (const village of checkResult.villages) {
        try {
          // Try to parse from description or location field
          let postalData = { suburb: '', state: 'VIC', postcode: '' };
          
          // DEBUG: Log what we're trying to parse
          console.log(`🔍 PARSING VILLAGE: ${village.name}`);
          console.log(`   Location field: "${village.location}"`);
          console.log(`   Suburb field: "${village.suburb}"`);
          console.log(`   Postcode field: "${village.postcode}"`);
          
          // Check if location has postal format
          if (village.location) {
            postalData = parsePostalAddress(village.location);
            console.log(`   ✅ Parsed result:`, postalData);
          }
          
          // If we found a postcode, update the village
          if (postalData.postcode) {
            const { error: updateError } = await supabase
              .from('retirement_villages')
              .update({
                suburb: postalData.suburb,
                postcode: postalData.postcode,
                state: postalData.state
              })
              .eq('id', village.id);
            
            if (updateError) throw updateError;
            
            console.log(`✅ Fixed: ${village.name} -> ${postalData.suburb} ${postalData.postcode}`);
            fixed++;
          } else {
            console.log(`⚠️ Could not parse postcode for: ${village.name}`);
            failed++;
            errors.push(`${village.name}: Could not extract postcode from location`);
          }
          
        } catch (err: any) {
          console.error(`Error fixing ${village.name}:`, err);
          failed++;
          errors.push(`${village.name}: ${err.message}`);
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      setFixResult({
        success: true,
        fixed,
        failed,
        errors: errors.slice(0, 10)
      });
      
      console.log(`🎉 Fixed ${fixed} villages, ${failed} failed`);
      
      // Trigger refresh
      window.dispatchEvent(new Event('villageDataUpdated'));
      
    } catch (err: any) {
      console.error(err);
      setFixResult({ success: false, error: err.message });
    } finally {
      setFixing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <MapPin className="size-6 text-purple-600" />
        Fix Victorian Village Postcodes
      </h2>
      
      <div className="mb-4 p-4 bg-purple-50 border border-purple-200 rounded">
        <p className="text-sm text-gray-700 mb-2">
          <strong>What this does:</strong> Finds Victorian villages with missing postcodes and attempts to extract them from the location field.
        </p>
        <p className="text-sm text-gray-700">
          The Victorian CSV import may have stored postal addresses in the location field. This tool will parse them.
        </p>
      </div>
      
      <div className="space-y-4">
        <button 
          onClick={checkVictorianVillages} 
          disabled={checking}
          className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 font-semibold"
        >
          {checking ? 'Checking...' : 'Check Victorian Villages'}
        </button>

        {checkResult && !checkResult.error && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded">
            <strong className="text-blue-900">
              Found {checkResult.total} Victorian villages with missing postcodes
            </strong>
            
            {checkResult.total > 0 && (
              <>
                <div className="mt-3 max-h-40 overflow-y-auto">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Sample villages:</p>
                  <div className="space-y-1">
                    {checkResult.villages.slice(0, 5).map((v: any) => (
                      <div key={v.id} className="text-sm bg-white p-2 rounded border text-gray-700">
                        <strong>{v.name}</strong> - Location: {v.location || 'N/A'}
                      </div>
                    ))}
                  </div>
                </div>
                
                <button 
                  onClick={fixPostcodes} 
                  disabled={fixing}
                  className="w-full mt-4 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-semibold"
                >
                  {fixing ? 'Fixing...' : `Fix ${checkResult.total} Villages`}
                </button>
              </>
            )}
            
            {checkResult.total === 0 && (
              <p className="text-sm text-blue-700 mt-2">
                ✓ All Victorian villages already have postcodes!
              </p>
            )}
          </div>
        )}
        
        {checkResult?.error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700">
            <div className="flex items-center gap-2">
              <AlertCircle className="size-5" />
              <strong>Error:</strong>
            </div>
            <p className="mt-1">{checkResult.error}</p>
          </div>
        )}
        
        {fixResult && fixResult.success && (
          <div className="p-4 bg-green-50 border border-green-200 rounded">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="size-5 text-green-600" />
              <strong className="text-green-900">
                ✅ Fixed {fixResult.fixed} villages!
              </strong>
            </div>
            
            {fixResult.failed > 0 && (
              <div className="mt-2">
                <p className="text-sm text-orange-700">
                  ⚠️ {fixResult.failed} villages could not be fixed
                </p>
                {fixResult.errors.length > 0 && (
                  <div className="mt-2 text-xs space-y-1 max-h-32 overflow-y-auto">
                    {fixResult.errors.map((err: string, i: number) => (
                      <div key={i} className="text-orange-600">{err}</div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            <p className="text-sm text-green-700 mt-3">
              These villages will now appear in postcode searches! 🎉
            </p>
          </div>
        )}
        
        {fixResult && !fixResult.success && (
          <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700">
            <div className="flex items-center gap-2">
              <AlertCircle className="size-5" />
              <strong>Error:</strong>
            </div>
            <p className="mt-1">{fixResult.error}</p>
          </div>
        )}
      </div>
    </div>
  );
}