import React, { useState, useEffect, useRef } from 'react';
import { AlertCircle, CheckCircle, Clock, PlayCircle, StopCircle, Download, Filter, RefreshCw, Mail, Search, Globe, Trash2 } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { getSupabaseClient } from '../../utils/supabase/client';

// Web Scraper Tool - Extracts village data from websites
interface Village {
  id: string;
  name: string;
  operator: string | null;
  website: string | null;
  state: string;
  suburb: string;
  // Data completeness flags
  has_pricing: boolean;
  has_email: boolean;
  has_amenities: boolean;
  has_care_services: boolean;
  has_village_type: boolean;
  has_care_level: boolean;
}

interface ScrapedData {
  villageId: string;
  villageName: string;
  url: string;
  status: 'pending' | 'scraping' | 'success' | 'error';
  tier1: { [key: string]: any };
  tier2: { [key: string]: any };
  tier3: { [key: string]: any };
  error?: string;
  fieldsFound: number;
  totalFields: number;
}

interface WebsiteFinderResult {
  villageId: string;
  villageName: string;
  suburb: string;
  state: string;
  status: 'pending' | 'searching' | 'found' | 'not_found' | 'validation_failed' | 'error';
  website?: string;
  websiteType?: 'official' | 'aggregator' | 'pattern';
  confidence?: number;
  validationReasons?: string[];
  validationWarnings?: string[];
  rejectedUrl?: string;
  error?: string;
}

export default function WebScraperTool({ accessToken }: { accessToken: string | null }) {
  const [loading, setLoading] = useState(false);
  const [villages, setVillages] = useState<Village[]>([]);
  const [selectedVillages, setSelectedVillages] = useState<string[]>([]);
  const [filterMode, setFilterMode] = useState<'all' | 'missing-entry-pricing' | 'missing-monthly-fees' | 'missing-email' | 'missing-amenities' | 'missing-operator' | 'no-website'>('all');
  const [scraping, setScraping] = useState(false);
  const [scrapedData, setScrapedData] = useState<ScrapedData[]>([]);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [batchSize, setBatchSize] = useState(50);
  const [processedVillageIds, setProcessedVillageIds] = useState<string[]>([]); // Track all processed villages
  
  // ⚡ NEW: Token refresh state
  const [currentAccessToken, setCurrentAccessToken] = useState<string | null>(accessToken);
  const [refreshingToken, setRefreshingToken] = useState(false);
  
  // Diagnostic view state
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [diagnosticData, setDiagnosticData] = useState<any[]>([]);
  const [diagnosticLoading, setDiagnosticLoading] = useState(false);
  
  // Website Finder state
  const [websiteFinderResults, setWebsiteFinderResults] = useState<WebsiteFinderResult[]>([]);
  const [findingWebsites, setFindingWebsites] = useState(false);
  
  // Auto-processor state
  const [autoProcessing, setAutoProcessing] = useState(false);
  const [autoProgress, setAutoProgress] = useState({ 
    currentBatch: 0, 
    totalBatches: 0, 
    processedCount: 0, 
    totalCount: 0,
    foundCount: 0,
    notFoundCount: 0
  });
  const [autoPaused, setAutoPaused] = useState(false);
  
  // 🔧 FIX: Use ref for immediate pause detection (React state is async!)
  const autoPausedRef = useRef(false);
  
  // AUTO-RESUME: New state for auto-resume mode
  const [autoResumeEnabled, setAutoResumeEnabled] = useState(false);
  const autoResumeRef = React.useRef(autoResumeEnabled);
  
  // NEW: Auto-scrape state for pricing scraper
  const [autoScraping, setAutoScraping] = useState(false);
  const [autoScrapePaused, setAutoScrapePaused] = useState(false);
  const autoScrapePausedRef = React.useRef(autoScrapePaused);
  const [autoScrapeProgress, setAutoScrapeProgress] = useState({
    currentBatch: 0,
    totalBatches: 0,
    processedCount: 0,
    totalCount: 0,
    successCount: 0,
    errorCount: 0
  });
  
  // Keep refs in sync with state
  useEffect(() => {
    autoResumeRef.current = autoResumeEnabled;
  }, [autoResumeEnabled]);
  
  useEffect(() => {
    autoScrapePausedRef.current = autoScrapePaused;
  }, [autoScrapePaused]);
  
  const [dataStats, setDataStats] = useState<{
    totalVillages: number;
    missingEntryPricing: number;
    missingMonthlyFees: number;
    missingEmail: number;
    missingAmenities: number;
    missingOperator: number;
    noWebsite: number;
    withWebsite: number;
    // NEW: Scrapeable counts (villages with websites AND missing data)
    scrapeableMissingEntryPricing: number;
    scrapeableMissingMonthlyFees: number;
    scrapeableMissingEmail: number;
    scrapeableMissingAmenities: number;
    scrapeableMissingOperator: number;
  } | null>(null);
  
  // Auth check
  if (!accessToken) {
    return (
      <div className="p-8 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800">
          ⚠️ <strong>Authentication Required:</strong> Please log in to use the Web Scraper Tool.
        </p>
      </div>
    );
  }

  // Load villages based on filter
  useEffect(() => {
    loadVillages();
  }, [filterMode]); // 🔧 FIX: Removed processedVillageIds dependency to prevent infinite re-renders

  // Restore saved results AND processed IDs from localStorage on mount
  useEffect(() => {
    const savedResults = localStorage.getItem('scraper_results');
    const savedProcessedIds = localStorage.getItem('scraper_processed_ids');
    
    console.log('🔍 Checking localStorage for saved results...', savedResults ? 'FOUND' : 'NOT FOUND');
    console.log('🔍 Checking localStorage for processed IDs...', savedProcessedIds ? 'FOUND' : 'NOT FOUND');
    
    if (savedResults) {
      try {
        const parsed = JSON.parse(savedResults);
        console.log(`📦 Found ${parsed.length} saved results:`, parsed);
        if (parsed.length > 0) {
          setScrapedData(parsed);
          console.log(`✅ Restored ${parsed.length} saved scraping results from localStorage`);
        }
      } catch (error) {
        console.error('❌ Error restoring saved results:', error);
      }
    } else {
      console.log('ℹ️ No saved results in localStorage');
    }

    if (savedProcessedIds) {
      try {
        const parsed = JSON.parse(savedProcessedIds);
        console.log(`📦 Found ${parsed.length} processed village IDs:`, parsed);
        if (parsed.length > 0) {
          setProcessedVillageIds(parsed);
          console.log(`✅ Restored ${parsed.length} processed village IDs from localStorage`);
        }
      } catch (error) {
        console.error('❌ Error restoring processed IDs:', error);
      }
    } else {
      console.log('ℹ️ No processed IDs in localStorage');
    }
  }, []);

  // Save results to localStorage whenever they change
  useEffect(() => {
    if (scrapedData.length > 0) {
      localStorage.setItem('scraper_results', JSON.stringify(scrapedData));
    }
  }, [scrapedData]);

  // Save processed IDs to localStorage whenever they change
  useEffect(() => {
    if (processedVillageIds.length > 0) {
      localStorage.setItem('scraper_processed_ids', JSON.stringify(processedVillageIds));
      console.log(`💾 Saved ${processedVillageIds.length} processed village IDs to localStorage`);
    }
  }, [processedVillageIds]);

  // Warn user before leaving page with unsaved results
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const hasUnsavedResults = scrapedData.some(d => d.status === 'success' || d.status === 'error');
      if (hasUnsavedResults && !scraping) {
        e.preventDefault();
        e.returnValue = 'You have unsaved scraping results. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [scrapedData, scraping]);

  const loadVillages = async (): Promise<Village[]> => {
    try {
      setLoading(true);
      
      console.log('🔐 Auth check - accessToken:', accessToken ? `Present (${accessToken.substring(0, 20)}...)` : 'MISSING!');
      console.log('🔐 projectId:', projectId);
      
      // Get current processed IDs from localStorage (most up-to-date source)
      const savedProcessedIds = localStorage.getItem('scraper_processed_ids');
      const currentProcessedIds = savedProcessedIds ? JSON.parse(savedProcessedIds) : [];
      console.log(`🔍 Loading villages with filter: ${filterMode}, excluding ${currentProcessedIds.length} processed IDs`);
      
      // Use singleton Supabase client
      const supabase = getSupabaseClient();
      
      console.log('📡 Fetching VIC villages directly from Supabase...');
      
      const { data: allVillages, error: fetchError } = await supabase
        .from('retirement_villages')
        .select(`
          id,
          name,
          operator,
          location,
          suburb,
          postcode,
          state,
          latitude,
          longitude,
          village_type,
          care_level,
          entry_price_min,
          entry_price_max,
          monthly_fees_min,
          monthly_fees_max,
          dmf_structure,
          dmf_percentage,
          dmf_cap,
          pet_friendly,
          total_units,
          bedrooms,
          age_restriction,
          contact_phone,
          contact_email,
          website,
          description,
          images,
          amenities,
          care_services,
          activities,
          status,
          source,
          verified,
          featured,
          submitted_at,
          approved_at,
          created_at,
          updated_at
        `)
        .eq('state', 'VIC')  // Filter for VIC villages only
        .order('created_at', { ascending: false });
      
      if (fetchError) {
        console.error('❌ Supabase query error:', fetchError);
        throw new Error(`Failed to load villages from database: ${fetchError.message}`);
      }
      
      console.log(`✅ Loaded ${allVillages?.length || 0} total villages from Supabase`);

      if (!allVillages || allVillages.length === 0) {
        console.warn('⚠️ No villages found in database');
        setDataStats({
          totalVillages: 0,
          missingEntryPricing: 0,
          missingMonthlyFees: 0,
          missingEmail: 0,
          missingOperator: 0,
          missingAmenities: 0,
          noWebsite: 0,
          withWebsite: 0,
          scrapeableMissingEntryPricing: 0,
          scrapeableMissingMonthlyFees: 0,
          scrapeableMissingEmail: 0,
          scrapeableMissingOperator: 0,
          scrapeableMissingAmenities: 0,
        });
        setLoading(false);
        return [];
      }

      console.log(`📊 Total villages loaded: ${allVillages.length}`);

      // Filter villages based on selected criteria
      let filtered = allVillages.filter(v => v.status === 'approved');
      console.log(`✅ Approved villages: ${filtered.length}`);

      // DEBUG: Check pricing data distribution
      const pricingStats = {
        hasAllPricing: 0,
        hasSomePricing: 0,
        hasNoPricing: 0,
        hasEntryMin: 0,
        hasEntryMax: 0,
        hasMonthlyMin: 0,
        hasMonthlyMax: 0,
      };
      
      filtered.forEach(v => {
        if (v.entry_price_min) pricingStats.hasEntryMin++;
        if (v.entry_price_max) pricingStats.hasEntryMax++;
        if (v.monthly_fees_min) pricingStats.hasMonthlyMin++;
        if (v.monthly_fees_max) pricingStats.hasMonthlyMax++;
        
        if (v.entry_price_min && v.entry_price_max && v.monthly_fees_min && v.monthly_fees_max) {
          pricingStats.hasAllPricing++;
        } else if (v.entry_price_min || v.entry_price_max || v.monthly_fees_min || v.monthly_fees_max) {
          pricingStats.hasSomePricing++;
        } else {
          pricingStats.hasNoPricing++;
        }
      });
      
      console.log('💰 PRICING DATA DISTRIBUTION:', pricingStats);

      // IMPORTANT: Filter for villages WITH websites FIRST (can't scrape without URL)
      let withWebsites = filtered.filter(v => v.website);
      console.log(`🌐 Total approved villages with websites: ${withWebsites.length}`);

      // DEBUG: Log filter mode
      console.log(`🔍 APPLYING FILTER MODE: "${filterMode}"`);

      // Then apply data completeness filters
      switch (filterMode) {
        case 'missing-entry-pricing':
          withWebsites = withWebsites.filter(v => 
            // Missing entry pricing data (both entry_min and entry_max are null)
            !v.entry_price_min && !v.entry_price_max
          );
          console.log(`📊 After "missing-entry-pricing" filter: ${withWebsites.length} villages`);
          break;
        case 'missing-monthly-fees':
          withWebsites = withWebsites.filter(v => 
            // Missing monthly fees data (both monthly_min and monthly_max are null)
            !v.monthly_fees_min && !v.monthly_fees_max
          );
          console.log(`📊 After "missing-monthly-fees" filter: ${withWebsites.length} villages`);
          break;
        case 'missing-email':
          withWebsites = withWebsites.filter(v => !v.contact_email);
          console.log(`📊 After "missing-email" filter: ${withWebsites.length} villages`);
          break;
        case 'missing-operator':
          withWebsites = withWebsites.filter(v => !v.operator || v.operator.trim() === '');
          console.log(`📊 After "missing-operator" filter: ${withWebsites.length} villages`);
          break;
        case 'missing-amenities':
          withWebsites = withWebsites.filter(v => 
            (!v.amenities || v.amenities.length === 0) || 
            (!v.care_services || v.care_services.length === 0)
          );
          console.log(`📊 After "missing-amenities" filter: ${withWebsites.length} villages`);
          break;
        case 'no-website':
          // Special case: show villages without websites (can't scrape these)
          withWebsites = filtered.filter(v => !v.website);
          console.log(`📊 After "no-website" filter: ${withWebsites.length} villages`);
          break;
        case 'all':
          // Already filtered - just use all villages with websites
          console.log(`📊 After "all" filter: ${withWebsites.length} villages`);
          break;
      }

      console.log(`🔍 After filter '${filterMode}': ${withWebsites.length} villages`);

      // DEBUG: Check first few villages to see website data
      console.log('🔍 DEBUGGING: First 5 filtered villages website data:', 
        withWebsites.slice(0, 5).map(v => ({ 
          name: v.name, 
          website: v.website, 
          hasWebsite: !!v.website,
          websiteType: typeof v.website 
        }))
      );

      // Exclude already processed villages from this session
      const unprocessed = withWebsites.filter(v => !currentProcessedIds.includes(v.id));
      console.log(`🆕 Unprocessed villages (excluding ${currentProcessedIds.length} already scraped): ${unprocessed.length}`);

      const mappedVillages: Village[] = unprocessed.map(v => ({
        id: v.id,
        name: v.name,
        operator: v.operator,
        website: v.website,
        state: v.state,
        suburb: v.suburb,
        has_pricing: !!(v.entry_price_min || v.monthly_fees_min),
        has_email: !!v.contact_email,
        has_amenities: !!(v.amenities && v.amenities.length > 0),
        has_care_services: !!(v.care_services && v.care_services.length > 0),
        has_village_type: !!v.village_type,
        has_care_level: !!v.care_level,
      }));

      setVillages(mappedVillages);

      // Calculate data stats
      setDataStats({
        totalVillages: allVillages.length,
        missingEntryPricing: allVillages.filter(v => 
          v.status === 'approved' && !v.entry_price_min && !v.entry_price_max
        ).length,
        missingMonthlyFees: allVillages.filter(v => 
          v.status === 'approved' && !v.monthly_fees_min && !v.monthly_fees_max
        ).length,
        missingEmail: allVillages.filter(v => v.status === 'approved' && !v.contact_email).length,
        missingOperator: allVillages.filter(v => v.status === 'approved' && (!v.operator || v.operator.trim() === '')).length,
        missingAmenities: allVillages.filter(v => 
          v.status === 'approved' && (
            (!v.amenities || v.amenities.length === 0) || 
            (!v.care_services || v.care_services.length === 0)
          )
        ).length,
        noWebsite: allVillages.filter(v => v.status === 'approved' && !v.website).length,
        withWebsite: allVillages.filter(v => v.status === 'approved' && v.website).length,
        // NEW: Scrapeable counts (villages with websites AND missing data)
        scrapeableMissingEntryPricing: allVillages.filter(v => 
          v.status === 'approved' && 
          v.website &&
          !v.entry_price_min && !v.entry_price_max
        ).length,
        scrapeableMissingMonthlyFees: allVillages.filter(v => 
          v.status === 'approved' && 
          v.website &&
          !v.monthly_fees_min && !v.monthly_fees_max
        ).length,
        scrapeableMissingEmail: allVillages.filter(v => 
          v.status === 'approved' && 
          v.website &&
          !v.contact_email
        ).length,
        scrapeableMissingOperator: allVillages.filter(v => 
          v.status === 'approved' && 
          v.website &&
          (!v.operator || v.operator.trim() === '')
        ).length,
        scrapeableMissingAmenities: allVillages.filter(v => 
          v.status === 'approved' && 
          v.website &&
          ((!v.amenities || v.amenities.length === 0) || (!v.care_services || v.care_services.length === 0))
        ).length,
      });

      setLoading(false);
      console.log('✅ Villages loaded successfully');
      return mappedVillages;
    } catch (err) {
      console.error('❌ Error loading villages:', err);
      alert('Error loading villages: ' + (err instanceof Error ? err.message : String(err)));
      setLoading(false);
      return [];
    }
  };

  // ⚡ NEW: Refresh authentication token without page reload
  const refreshAuthToken = async () => {
    try {
      setRefreshingToken(true);
      console.log('🔄 Refreshing authentication token...');
      
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('❌ Token refresh failed:', error);
        alert(`❌ Token refresh failed: ${error.message}\n\nPlease refresh the page (F5) to get a new session.`);
        return false;
      }
      
      if (data?.session?.access_token) {
        setCurrentAccessToken(data.session.access_token);
        console.log('✅ Token refreshed successfully!');
        alert('✅ Authentication refreshed! You can now resume scraping.');
        return true;
      } else {
        console.error('❌ No new token received');
        alert('❌ Token refresh failed. Please refresh the page (F5).');
        return false;
      }
    } catch (error: any) {
      console.error('❌ Token refresh error:', error);
      alert(`❌ Error refreshing token: ${error.message}`);
      return false;
    } finally {
      setRefreshingToken(false);
    }
  };

  // ⚡ NEW: Automatic fetch with token refresh retry
  // This function automatically handles JWT token expiration:
  // 1. Makes the initial request
  // 2. If 401 error, refreshes the token silently
  // 3. Retries the request with the new token
  // 4. This allows overnight scraping without manual intervention!
  const fetchWithAutoRefresh = async (url: string, options: RequestInit = {}): Promise<Response> => {
    // First attempt
    let response = await fetch(url, options);
    
    // If 401, try to refresh token and retry once
    if (response.status === 401) {
      console.log('🔄 Got 401 - attempting automatic token refresh...');
      console.log('   Request URL:', url);
      
      try {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase.auth.refreshSession();
        
        if (error || !data?.session?.access_token) {
          console.error('❌ Automatic token refresh failed:', error);
          throw new Error('Authentication expired and automatic refresh failed. Please refresh the page (F5).');
        }
        
        // Update token state
        const newToken = data.session.access_token;
        setCurrentAccessToken(newToken);
        console.log('✅ Token auto-refreshed! New token length:', newToken.length);
        console.log('🔄 Retrying original request...');
        
        // Update the Authorization header and retry
        const updatedOptions = {
          ...options,
          headers: {
            ...options.headers,
            'Authorization': `Bearer ${newToken}`,
          },
        };
        
        response = await fetch(url, updatedOptions);
        
        if (response.ok) {
          console.log('✅ Request succeeded after token refresh!');
        } else {
          console.error('❌ Request still failed after token refresh:', response.status);
        }
      } catch (refreshError) {
        console.error('❌ Error during token refresh process:', refreshError);
        throw refreshError;
      }
    }
    
    return response;
  };

  const handleSelectAll = () => {
    if (selectedVillages.length === villages.length) {
      setSelectedVillages([]);
    } else {
      setSelectedVillages(villages.slice(0, batchSize).map(v => v.id));
    }
  };

  const handleSelectVillage = (villageId: string) => {
    setSelectedVillages(prev => 
      prev.includes(villageId) 
        ? prev.filter(id => id !== villageId)
        : [...prev, villageId]
    );
  };

  // Load diagnostic data showing pricing breakdown
  const loadDiagnostics = async () => {
    try {
      setDiagnosticLoading(true);
      
      // Fetch all villages
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/villages/admin/all?from=0&to=2999`,
        {
          headers: {
            'Authorization': `Bearer ${currentAccessToken || accessToken || publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to load villages');
      }

      const data = await response.json();
      const allVillages = data.villages || [];
      
      // Filter approved villages with websites only
      const approvedWithWebsites = allVillages.filter((v: any) => 
        v.status === 'approved' && v.website
      );

      // Categorize each village
      const categorized = approvedWithWebsites.map((v: any) => {
        const hasEntryMin = !!v.entry_price_min;
        const hasEntryMax = !!v.entry_price_max;
        const hasMonthlyMin = !!v.monthly_fees_min;
        const hasMonthlyMax = !!v.monthly_fees_max;
        
        const pricingFieldsPresent = [hasEntryMin, hasEntryMin, hasMonthlyMin, hasMonthlyMax].filter(Boolean).length;
        
        let category = '';
        if (pricingFieldsPresent === 0) {
          category = 'MISSING (0/4 fields)';
        } else if (pricingFieldsPresent === 4) {
          category = 'COMPLETE (4/4 fields)';
        } else {
          category = `INCOMPLETE (${pricingFieldsPresent}/4 fields)`;
        }
        
        return {
          id: v.id,
          name: v.name,
          state: v.state,
          suburb: v.suburb,
          website: v.website,
          category,
          pricingFields: pricingFieldsPresent,
          entry_price_min: v.entry_price_min || null,
          entry_price_max: v.entry_price_max || null,
          monthly_fees_min: v.monthly_fees_min || null,
          monthly_fees_max: v.monthly_fees_max || null,
        };
      });

      // Sort by category then name
      categorized.sort((a, b) => {
        if (a.category !== b.category) {
          return a.category.localeCompare(b.category);
        }
        return a.name.localeCompare(b.name);
      });

      setDiagnosticData(categorized);
      setDiagnosticLoading(false);
    } catch (err) {
      console.error('❌ Error loading diagnostics:', err);
      alert('Error loading diagnostics: ' + (err instanceof Error ? err.message : String(err)));
      setDiagnosticLoading(false);
    }
  };

  // NEW: Check recently updated villages (to verify scraper is working)
  const checkRecentUpdates = async () => {
    try {
      console.log('🔍 Checking recently updated villages...');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/villages/admin/all?from=0&to=2999`,
        {
          headers: {
            'Authorization': `Bearer ${currentAccessToken || accessToken || publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to load villages');
      }

      const data = await response.json();
      const allVillages = data.villages || [];
      
      // Filter VIC villages with websites and sort by updated_at
      const vicWithWebsites = allVillages
        .filter((v: any) => v.state === 'VIC' && v.website)
        .sort((a: any, b: any) => {
          const dateA = new Date(a.updated_at || 0).getTime();
          const dateB = new Date(b.updated_at || 0).getTime();
          return dateB - dateA; // Most recent first
        })
        .slice(0, 50); // Get last 50

      console.log('📊 LAST 50 VIC VILLAGES WITH WEBSITES (Most Recent First):');
      console.log('========================================');
      
      vicWithWebsites.forEach((v: any, index: number) => {
        const updatedDate = new Date(v.updated_at);
        const minutesAgo = Math.floor((Date.now() - updatedDate.getTime()) / 1000 / 60);
        const timeAgo = minutesAgo < 60 
          ? `${minutesAgo} minutes ago`
          : minutesAgo < 1440
          ? `${Math.floor(minutesAgo / 60)} hours ago`
          : `${Math.floor(minutesAgo / 1440)} days ago`;
        
        console.log(`${index + 1}. ${v.name} (${v.suburb})`);
        console.log(`   Website: ${v.website}`);
        console.log(`   Updated: ${timeAgo} (${updatedDate.toLocaleString()})`);
        console.log('');
      });

      // Count how many were updated in the last hour
      const oneHourAgo = Date.now() - (60 * 60 * 1000);
      const recentlyUpdated = vicWithWebsites.filter((v: any) => {
        const updatedDate = new Date(v.updated_at).getTime();
        return updatedDate > oneHourAgo;
      });

      alert(`📊 RECENT UPDATES CHECK\n\n✅ Found ${vicWithWebsites.length} VIC villages with websites\n\n🕐 Updated in last hour: ${recentlyUpdated.length}\n\nCheck console for full list with timestamps!`);
      
    } catch (err) {
      console.error('❌ Error checking recent updates:', err);
      alert('Error checking updates: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  // NEW: Show ALL websites with full details
  const showAllWebsites = async () => {
    try {
      console.log('🔍 Loading ALL VIC villages with websites...');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/villages/admin/all?from=0&to=2999`,
        {
          headers: {
            'Authorization': `Bearer ${currentAccessToken || accessToken || publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to load villages');
      }

      const data = await response.json();
      const allVillages = data.villages || [];
      
      // Filter VIC villages with websites and sort by updated_at (most recent first)
      const vicWithWebsites = allVillages
        .filter((v: any) => v.state === 'VIC' && v.website)
        .sort((a: any, b: any) => {
          const dateA = new Date(a.updated_at || 0).getTime();
          const dateB = new Date(b.updated_at || 0).getTime();
          return dateB - dateA; // Most recent first
        });

      console.log(`\n📊 ALL ${vicWithWebsites.length} VIC VILLAGES WITH WEBSITES`);
      console.log('='.repeat(80));
      console.log('');
      
      vicWithWebsites.forEach((v: any, index: number) => {
        const updatedDate = new Date(v.updated_at);
        const createdDate = new Date(v.created_at);
        const minutesAgo = Math.floor((Date.now() - updatedDate.getTime()) / 1000 / 60);
        const timeAgo = minutesAgo < 60 
          ? `${minutesAgo} minutes ago`
          : minutesAgo < 1440
          ? `${Math.floor(minutesAgo / 60)} hours ago`
          : `${Math.floor(minutesAgo / 1440)} days ago`;
        
        console.log(`${index + 1}. ${v.name}`);
        console.log(`   Suburb: ${v.suburb || 'N/A'}`);
        console.log(`   Website: ${v.website}`);
        console.log(`   Operator: ${v.operator || 'N/A'}`);
        console.log(`   Created: ${createdDate.toLocaleString()}`);
        console.log(`   Updated: ${timeAgo} (${updatedDate.toLocaleString()})`);
        console.log('');
      });

      // Create CSV for download
      const csv = [
        ['#', 'Name', 'Suburb', 'Operator', 'Website', 'Created At', 'Updated At'].join(','),
        ...vicWithWebsites.map((v: any, idx: number) => 
          [
            idx + 1,
            `"${v.name}"`,
            `"${v.suburb || 'N/A'}"`,
            `"${v.operator || 'N/A'}"`,
            `"${v.website}"`,
            new Date(v.created_at).toLocaleString(),
            new Date(v.updated_at).toLocaleString()
          ].join(',')
        )
      ].join('\n');
      
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vic-websites-all-${vicWithWebsites.length}-villages.csv`;
      a.click();

      alert(`📊 ALL WEBSITES REPORT\n\n✅ Found ${vicWithWebsites.length} VIC villages with websites\n\n📥 CSV downloaded with full details\n\n🔍 Check console for full list!`);
      
    } catch (err) {
      console.error('❌ Error loading websites:', err);
      alert('Error loading websites: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  // NEW: Delete all VIC websites (reset to null)
  const deleteAllVicWebsites = async () => {
    if (!confirm('🚨 DELETE ALL VIC WEBSITES?\n\nThis will:\n• Remove all 75 website URLs from VIC villages\n• Set website field to NULL for all VIC villages\n• Allow you to start fresh with auto-scraper\n\nAre you sure?')) {
      return;
    }

    try {
      console.log('🗑️ Deleting all VIC websites...');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/villages/delete-all-vic-websites`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${currentAccessToken || accessToken || publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to delete websites');
      }

      const result = await response.json();
      
      console.log('✅ SUCCESS:', result);
      alert(`✅ DELETED ALL VIC WEBSITES!\n\n${result.deletedCount} websites removed\n\nReady to start fresh scraping!`);
      
      // Reload villages to reflect changes
      await loadVillages();
      
    } catch (err) {
      console.error('❌ Error deleting websites:', err);
      alert('Error deleting websites: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  const startScraping = async () => {
    console.log(`🚀 START SCRAPING - VERSION WITH AUTO-SAVE (v2.0)`);
    
    if (selectedVillages.length === 0) {
      alert('Please select villages to scrape');
      return;
    }

    setScraping(true);
    setProgress({ current: 0, total: selectedVillages.length });
    
    const villagesToScrape = villages.filter(v => selectedVillages.includes(v.id));
    const results: ScrapedData[] = villagesToScrape.map(v => ({
      villageId: v.id,
      villageName: v.name,
      url: v.website!,
      status: 'pending',
      tier1: {},
      tier2: {},
      tier3: {},
      fieldsFound: 0,
      totalFields: 0,
    }));

    setScrapedData(results);

    // Track results locally (can't rely on state due to React timing)
    const finalResults = [...results];

    // Scrape villages one at a time (to respect rate limits)
    for (let i = 0; i < villagesToScrape.length; i++) {
      const village = villagesToScrape[i];
      
      // Update status to scraping
      setScrapedData(prev => prev.map(r => 
        r.villageId === village.id ? { ...r, status: 'scraping' } : r
      ));

      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/scraper/scrape-village`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`, // Use publicAnonKey for this public endpoint
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              villageId: village.id,
              url: village.website,
              villageName: village.name,
            }),
          }
        );

        const result = await response.json();
        
        console.log(`📊 Scrape response for ${village.name}:`, { status: response.status, ok: response.ok, result });

        if (response.ok && result.success) {
          // Update local results array
          finalResults[i] = {
            ...finalResults[i],
            status: 'success',
            tier1: result.data.tier1,
            tier2: result.data.tier2,
            tier3: result.data.tier3,
            fieldsFound: result.data.fieldsFound,
            totalFields: result.data.totalFields,
          };
          
          // Update state for UI
          setScrapedData(prev => prev.map(r => 
            r.villageId === village.id ? finalResults[i] : r
          ));
        } else {
          console.error(`❌ Scrape failed for ${village.name}:`, result);
          
          // Update local results array
          finalResults[i] = {
            ...finalResults[i],
            status: 'error',
            error: result.error || `HTTP ${response.status}: ${response.statusText}`,
          };
          
          // Update state for UI
          setScrapedData(prev => prev.map(r => 
            r.villageId === village.id ? finalResults[i] : r
          ));
        }
      } catch (error) {
        console.error(`❌ Network error scraping ${village.name}:`, error);
        
        // Update local results array
        finalResults[i] = {
          ...finalResults[i],
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
        };
        
        // Update state for UI
        setScrapedData(prev => prev.map(r => 
          r.villageId === village.id ? finalResults[i] : r
        ));
      }

      setProgress({ current: i + 1, total: villagesToScrape.length });
      
      // IMMEDIATE SAVE to localStorage after EACH village (not just at end)
      try {
        localStorage.setItem('scraper_results', JSON.stringify(finalResults));
        console.log(`💾 Saved progress to localStorage (${i + 1}/${villagesToScrape.length} villages)`);
      } catch (e) {
        console.error('❌ Failed to save to localStorage:', e);
      }

      // Add delay between requests (2 seconds)
      if (i < villagesToScrape.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    // Mark all scraped villages as processed (both successes and failures)
    const scrapedIds = villagesToScrape.map(v => v.id);
    setProcessedVillageIds(prev => {
      const updated = [...new Set([...prev, ...scrapedIds])];
      // IMMEDIATELY save to localStorage
      try {
        localStorage.setItem('scraper_processed_ids', JSON.stringify(updated));
        console.log(`✅ Marked ${scrapedIds.length} villages as processed and saved to localStorage`);
      } catch (e) {
        console.error('❌ Failed to save processed IDs to localStorage:', e);
      }
      return updated;
    });

    setScraping(false);
    
    console.log(`🔍 DEBUG: About to check for auto-save. finalResults length: ${finalResults.length}`);
    console.log(`🔍 DEBUG: finalResults statuses:`, finalResults.map(d => ({ name: d.villageName, status: d.status })));
    
    // AUTO-SAVE: Save results to database after scraping completes
    const successfulScrapes = finalResults.filter(d => d.status === 'success');
    console.log(`🔍 DEBUG: Successful scrapes: ${successfulScrapes.length}`);
    
    if (successfulScrapes.length > 0) {
      console.log(`💾 Auto-saving ${successfulScrapes.length} successful scrapes to database...`);
      console.log(`🔑 DEBUG: accessToken exists? ${!!accessToken}, length: ${accessToken?.length || 0}`);
      
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/scraper/save-results`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${currentAccessToken || accessToken || publicAnonKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ results: successfulScrapes }),
          }
        );

        if (response.ok) {
          const result = await response.json();
          console.log(`✅ Auto-save successful! Saved ${result.updated} villages to database.`);
          
          // DON'T clear scrapedData or localStorage - keep as backup in case of crash!
          // User can manually clear with "Reset Session" button if needed
          console.log(`📦 Keeping ${successfulScrapes.length} results in localStorage as backup`);
          
          // Reload villages to get updated counts
          await loadVillages();
        } else {
          const errorText = await response.text();
          console.error(`❌ Auto-save failed with status ${response.status}`);
          console.error(`❌ Error response:`, errorText);
          alert(`⚠️  Auto-save FAILED! Status: ${response.status}\n\nPlease manually click "Save Results to Database" button.\n\nError: ${errorText}`);
        }
      } catch (error) {
        console.error(`❌ Auto-save error:`, error);
        alert(`⚠️  Auto-save FAILED with error!\n\nPlease manually click "Save Results to Database" button.\n\nError: ${error}`);
      }
    } else {
      console.log('⚠️  No successful scrapes to auto-save');
    }
    
    // AUTO-RESUME: Check if auto-resume is enabled and there are more villages
    if (autoResumeRef.current) {
      console.log('🔄 Auto-resume enabled - checking for remaining villages...');
      
      // Wait a moment for state to update
      setTimeout(async () => {
        // Reload villages to get fresh count
        await loadVillages();
        
        // Check if there are still villages to scrape
        const remainingVillages = villages.filter(v => !processedVillageIds.includes(v.id) && !scrapedIds.includes(v.id));
        
        console.log(`📊 Remaining villages: ${remainingVillages.length}`);
        
        if (remainingVillages.length > 0) {
          console.log(`🚀 Auto-resuming next batch of ${Math.min(batchSize, remainingVillages.length)} villages...`);
          
          // Auto-select next batch
          const nextBatch = remainingVillages.slice(0, batchSize).map(v => v.id);
          setSelectedVillages(nextBatch);
          
          // Show notification in console only (no alert popup)
          console.log(`🔄 Batch completed! Auto-resuming next batch... ${remainingVillages.length} villages remaining.`);
          
          // Start next batch after a short delay
          setTimeout(() => {
            startScraping();
          }, 3000);
        } else {
          console.log('🎉 All villages have been scraped! Auto-resume complete.');
          setAutoResumeEnabled(false); // Disable auto-resume when done
        }
      }, 2000);
    }
  };

  const stopScraping = () => {
    setScraping(false);
    // Disable auto-resume when user manually stops
    setAutoResumeEnabled(false);
    console.log('⏸️ Scraping stopped manually - auto-resume disabled');
  };

  // NEW: Auto-Scrape All function - processes all villages automatically
  const startAutoScrapeAll = async () => {
    // ALWAYS reload villages first to get fresh unprocessed list
    console.log('🔄 Reloading villages to get current unprocessed list...');
    const currentVillages = await loadVillages();
    
    if (currentVillages.length === 0) {
      console.log('✅ No more villages to process - all done!');
      setAutoScraping(false);
      alert('🎉 All villages have been scraped!\n\nIf you want to scrape again, please refresh the page to reset the processed list.');
      return;
    }

    console.log(`📊 Found ${currentVillages.length} unprocessed villages to scrape`);
    console.log(`📋 These villages will be scraped:`, currentVillages.slice(0, 5).map(v => v.name));

    // Only show confirmation on first run (not auto-continue)
    const dataTypeLabel = filterMode === 'missing-entry-pricing' ? 'entry pricing' : 
                          filterMode === 'missing-monthly-fees' ? 'monthly fees' : 'data';
    if (!autoScraping && !confirm(`🤖 Start AUTO-SCRAPE ALL?\\n\\nThis will automatically:\\n• Scrape ALL ${currentVillages.length} villages missing ${dataTypeLabel}\\n• Process them in batches of 10\\n• Auto-save after each batch\\n• Run until complete (estimated ${Math.ceil(currentVillages.length / 10) * 3} minutes)\\n\\nYou can pause at any time.\\n\\nContinue?`)) {
      return;
    }

    console.log('🚀 STARTING AUTO-SCRAPE - Setting autoScraping to TRUE');
    setAutoScraping(true);
    setAutoScrapePaused(false);
    console.log('✅ Auto-scraping state is now active - progress bar should appear');
    
    const SCRAPE_BATCH_SIZE = 10; // Increased from 5 to 10 for better throughput
    const totalBatches = Math.ceil(currentVillages.length / SCRAPE_BATCH_SIZE);
    
    setAutoScrapeProgress({
      currentBatch: 0,
      totalBatches,
      processedCount: 0,
      totalCount: currentVillages.length,
      successCount: 0,
      errorCount: 0
    });

    let totalSuccess = 0;
    let totalErrors = 0;
    let processedCount = 0;

    console.log(`🤖 AUTO-SCRAPE: Starting to process ${currentVillages.length} villages in ${totalBatches} batches`);

    // Process each batch
    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      // Check if paused
      if (autoScrapePausedRef.current) {
        console.log('⏸️ AUTO-SCRAPE PAUSED by user');
        alert('⏸️ Auto-scrape paused. Click "Resume" to continue.');
        break;
      }

      const batchStart = batchIndex * SCRAPE_BATCH_SIZE;
      const batchEnd = Math.min(batchStart + SCRAPE_BATCH_SIZE, currentVillages.length);
      const currentBatch = currentVillages.slice(batchStart, batchEnd);
      
      console.log(`🤖 AUTO-SCRAPE: Processing batch ${batchIndex + 1}/${totalBatches} (${currentBatch.length} villages)`);
      
      setAutoScrapeProgress(prev => ({
        ...prev,
        currentBatch: batchIndex + 1,
      }));

      // Prepare batch results
      const batchResults: ScrapedData[] = currentBatch.map(v => ({
        villageId: v.id,
        villageName: v.name,
        url: v.website!,
        status: 'pending',
        tier1: {},
        tier2: {},
        tier3: {},
        fieldsFound: 0,
        totalFields: 0,
      }));

      // Track results locally
      const finalBatchResults = [...batchResults];
      let batchSuccessCount = 0;

      // Scrape each village in the batch
      for (let i = 0; i < currentBatch.length; i++) {
        const village = currentBatch[i];
        
        console.log(`📊 Scraping ${i + 1}/${currentBatch.length}: ${village.name}`);

        try {
          const response = await fetchWithAutoRefresh(
            `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/scraper/scrape-village`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${currentAccessToken || accessToken || publicAnonKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                villageId: village.id,
                url: village.website,
                villageName: village.name,
              }),
            }
          );

          const result = await response.json();

          console.log(`📥 Response for ${village.name}:`, {
            status: response.status,
            ok: response.ok,
            success: result.success,
            hasData: !!result.data,
            error: result.error
          });

          if (response.ok && result.success) {
            finalBatchResults[i] = {
              ...finalBatchResults[i],
              status: 'success',
              tier1: result.data.tier1,
              tier2: result.data.tier2,
              tier3: result.data.tier3,
              fieldsFound: result.data.fieldsFound,
              totalFields: result.data.totalFields,
            };
            totalSuccess++;
            batchSuccessCount++;
          } else {
            console.error(`❌ Scrape failed for ${village.name}:`, result);
            finalBatchResults[i] = {
              ...finalBatchResults[i],
              status: 'error',
              error: result.error || `HTTP ${response.status}`,
            };
            totalErrors++;
          }
        } catch (error) {
          console.error(`❌ Network error scraping ${village.name}:`, error);
          finalBatchResults[i] = {
            ...finalBatchResults[i],
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error',
          };
          totalErrors++;
        }

        // Increased delay between villages to 6 seconds (from 2) to avoid rate limits
        if (i < currentBatch.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 6000));
        }
      }

      processedCount += currentBatch.length;

      // Mark batch villages as processed
      const batchIds = currentBatch.map(v => v.id);
      setProcessedVillageIds(prev => {
        const updated = [...new Set([...prev, ...batchIds])];
        // IMMEDIATELY save to localStorage (don't wait for useEffect)
        localStorage.setItem('scraper_processed_ids', JSON.stringify(updated));
        console.log(`💾 SAVED ${updated.length} processed IDs to localStorage`);
        return updated;
      });

      // Auto-save successful scrapes from this batch
      const successfulInBatch = finalBatchResults.filter(d => d.status === 'success');
      
      if (successfulInBatch.length > 0) {
        console.log(`💾 AUTO-SAVING ${successfulInBatch.length} successful scrapes from batch ${batchIndex + 1}...`);
        
        try {
          const saveResponse = await fetchWithAutoRefresh(
            `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/scraper/save-results`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${currentAccessToken || accessToken || publicAnonKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ results: successfulInBatch }),
            }
          );

          if (saveResponse.ok) {
            const saveResult = await saveResponse.json();
            console.log(`✅ Batch ${batchIndex + 1} saved successfully:`, saveResult);
          } else {
            const errorText = await saveResponse.text();
            console.error(`❌ Auto-save failed for batch ${batchIndex + 1}:`, {
              status: saveResponse.status,
              error: errorText
            });
          }
        } catch (error) {
          console.error(`❌ Auto-save error for batch ${batchIndex + 1}:`, error);
        }
      } else {
        console.warn(`⚠️ Batch ${batchIndex + 1} had 0 successful scrapes - possible rate limiting!`);
      }

      // Update progress
      setAutoScrapeProgress(prev => ({
        ...prev,
        processedCount,
        successCount: totalSuccess,
        errorCount: totalErrors
      }));

      // SAFETY CHECK: If batch had 0 successes, stop auto-resume to prevent infinite loop
      if (batchSuccessCount === 0 && batchIndex > 0) {
        console.error('🛑 STOPPING AUTO-SCRAPE: Batch had 0 successful scrapes (likely rate limited or blocked)');
        setAutoScraping(false);
        setAutoScrapePaused(false);
        alert(`⚠️ Auto-scrape stopped!\n\nBatch ${batchIndex + 1} had 0 successful scrapes.\n\nThis usually means:\n• Rate limiting from websites\n• ScraperAPI quota exceeded\n• Network blocking\n\nWait a few minutes and try again, or reduce batch size.`);
        return;
      }

      // Wait between batches (5 seconds, increased from 3)
      if (batchIndex < totalBatches - 1 && !autoScrapePausedRef.current) {
        console.log('⏳ Waiting 5 seconds before next batch...');
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }

    console.log(`🎉 AUTO-SCRAPE BATCH COMPLETE! Processed ${processedCount} villages in this batch`);
    console.log(`✅ Success: ${totalSuccess}, ❌ Errors: ${totalErrors}`);
    
    // Auto-continue to next batch if not paused
    // (next iteration will reload villages automatically)
    if (!autoScrapePausedRef.current) {
      console.log(`🔄 AUTO-CONTINUE: Starting next batch in 5 seconds...`);
      setTimeout(() => {
        startAutoScrapeAll();
      }, 5000);
      return; // Exit but keep auto-scraping active
    }
    
    // Only stop if user paused
    setAutoScraping(false);
    alert(`🎉 Auto-scrape complete!\\n\\n✅ Success: ${totalSuccess}\\n❌ Errors: ${totalErrors}\\n\\nTotal processed: ${processedCount}`);
  };

  const pauseAutoScrape = () => {
    setAutoScrapePaused(true);
    console.log('⏸️ Auto-scrape paused');
  };

  const resumeAutoScrape = () => {
    setAutoScrapePaused(false);
    console.log('▶️ Auto-scrape resumed');
    startAutoScrapeAll(); // Will automatically reload villages
  };

  const stopAutoScrape = () => {
    setAutoScraping(false);
    setAutoScrapePaused(false);
    console.log('🛑 Auto-scrape stopped');
  };

  const saveResults = async () => {
    const successfulScrapes = scrapedData.filter(d => d.status === 'success');
    
    console.log('💾 Save Results clicked! Successful scrapes:', successfulScrapes.length);
    
    if (successfulScrapes.length === 0) {
      alert('No successful scrapes to save');
      return;
    }

    if (!confirm(`Save ${successfulScrapes.length} scraped results to database?`)) {
      console.log('❌ User cancelled save');
      return;
    }

    console.log('📡 Sending save request to server...');
    console.log(`🔑 DEBUG: accessToken exists? ${!!accessToken}, length: ${accessToken?.length || 0}`);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/scraper/save-results`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${currentAccessToken || accessToken || publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ results: successfulScrapes }),
        }
      );

      console.log('📡 Server response status:', response.status);
      const responseText = await response.text();
      console.log('📡 Server response text:', responseText);
      
      let result;
      try {
        result = JSON.parse(responseText);
        console.log('📡 Server response data:', result);
      } catch (e) {
        console.error('❌ Failed to parse response as JSON:', responseText);
        result = { error: responseText };
      }

      if (response.ok) {
        alert(`✅ Saved ${result.updated} villages successfully!`);
        // Clear localStorage after successful save
        localStorage.removeItem('scraper_results');
        setScrapedData([]);
        setSelectedVillages([]);
        loadVillages();
      } else {
        console.error(`❌ Save failed. Status: ${response.status}, Error: ${result.error}`);
        alert(`❌ Save FAILED!\n\nStatus: ${response.status}\nError: ${result.error || responseText}\n\nCheck console for details.`);
      }
    } catch (error) {
      console.error('❌ Error saving results:', error);
      alert('Failed to save results');
    }
  };

  const exportResults = () => {
    const csv = [
      ['Village Name', 'URL', 'Status', 'Fields Found', 'Total Fields', 'Success Rate', 'Error'],
      ...scrapedData.map(d => [
        d.villageName,
        d.url,
        d.status,
        d.fieldsFound,
        d.totalFields,
        d.totalFields > 0 ? `${Math.round((d.fieldsFound / d.totalFields) * 100)}%` : '0%',
        d.error || '',
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scraper-results-${new Date().toISOString()}.csv`;
    a.click();
  };

  const retryFailed = async () => {
    const failedResults = scrapedData.filter(d => d.status === 'error');
    
    if (failedResults.length === 0) {
      alert('No failed villages to retry');
      return;
    }

    if (!confirm(`Retry scraping ${failedResults.length} failed villages?`)) {
      return;
    }

    setScraping(true);
    setProgress({ current: 0, total: failedResults.length });

    // Reset failed villages to pending
    setScrapedData(prev => prev.map(r => 
      r.status === 'error' ? { ...r, status: 'pending', error: undefined } : r
    ));

    // Retry each failed village
    for (let i = 0; i < failedResults.length; i++) {
      const result = failedResults[i];
      
      // Update status to scraping
      setScrapedData(prev => prev.map(r => 
        r.villageId === result.villageId ? { ...r, status: 'scraping' } : r
      ));

      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/scraper/scrape-village`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${currentAccessToken || accessToken || publicAnonKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              villageId: result.villageId,
              url: result.url,
              villageName: result.villageName,
            }),
          }
        );

        const apiResult = await response.json();

        if (response.ok && apiResult.success) {
          setScrapedData(prev => prev.map(r => 
            r.villageId === result.villageId ? {
              ...r,
              status: 'success',
              tier1: apiResult.data.tier1,
              tier2: apiResult.data.tier2,
              tier3: apiResult.data.tier3,
              fieldsFound: apiResult.data.fieldsFound,
              totalFields: apiResult.data.totalFields,
            } : r
          ));
        } else {
          setScrapedData(prev => prev.map(r => 
            r.villageId === result.villageId ? {
              ...r,
              status: 'error',
              error: apiResult.error || 'Scraping failed',
            } : r
          ));
        }
      } catch (error) {
        setScrapedData(prev => prev.map(r => 
          r.villageId === result.villageId ? {
            ...r,
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error',
          } : r
        ));
      }

      setProgress({ current: i + 1, total: failedResults.length });

      // Add delay between requests (2 seconds)
      if (i < failedResults.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    setScraping(false);
    alert(`✅ Retry complete! Check results above.`);
  };

  const emailOperators = async () => {
    const failedResults = scrapedData.filter(d => d.status === 'error');
    
    if (failedResults.length === 0) {
      alert('No failed villages to email operators about');
      return;
    }

    if (!confirm(`Send emails to operators of ${failedResults.length} failed villages asking them to update their profiles?`)) {
      return;
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/scraper/email-operators`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${currentAccessToken || accessToken || publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            villageIds: failedResults.map(r => r.villageId),
          }),
        }
      );

      const result = await response.json();

      if (response.ok) {
        alert(`✅ Sent ${result.sent} emails to operators! (${result.skipped} skipped - no operator email)`);
      } else {
        alert(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error sending operator emails:', error);
      alert('Failed to send emails');
    }
  };

  const resetSession = () => {
    if (!confirm('Reset scraping session? This will clear all processed village tracking and allow you to scrape from the beginning.')) {
      return;
    }
    
    localStorage.removeItem('scraper_results');
    localStorage.removeItem('scraper_processed_ids');
    localStorage.removeItem('auto_processor_current_batch'); // 🧹 Also clear batch index
    setScrapedData([]);
    setProcessedVillageIds([]);
    setSelectedVillages([]);
    console.log('🔄 Session reset - cleared all processed villages and batch index');
    loadVillages();
  };

  // NEW: Retry failed villages
  const retryFailedVillages = () => {
    const failedVillageIds = scrapedData
      .filter(d => d.status === 'error')
      .map(d => d.villageId);
    
    if (failedVillageIds.length === 0) {
      alert('No failed villages to retry');
      return;
    }

    if (!confirm(`Retry ${failedVillageIds.length} failed villages? This will remove them from the "processed" list so they can be scraped again.`)) {
      return;
    }

    // Remove failed village IDs from processedVillageIds
    setProcessedVillageIds(prev => prev.filter(id => !failedVillageIds.includes(id)));
    
    // Remove failed results from scrapedData
    setScrapedData(prev => prev.filter(d => d.status !== 'error'));
    
    console.log(`🔄 Removed ${failedVillageIds.length} failed villages from processed list`);
    alert(`✅ ${failedVillageIds.length} failed villages can now be retried. Reload the village list to see them.`);
    
    // Reload villages to show the failed ones again
    loadVillages();
  };

  // TEST: Simple endpoint connectivity test
  const testEndpoint = async () => {
    console.log('🧪 Testing endpoint...');
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/scraper/find-websites`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${currentAccessToken || accessToken || publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ villages: [] }),
        }
      );
      
      console.log('🧪 Response status:', response.status);
      console.log('🧪 Response headers:', Object.fromEntries(response.headers.entries()));
      
      const text = await response.text();
      console.log('🧪 Response length:', text.length);
      console.log('🧪 First 500 chars:', text.substring(0, 500));
      console.log('🧪 First 20 char codes:', Array.from(text.substring(0, 20)).map(c => `${c}(${c.charCodeAt(0)})`));
      
      try {
        const json = JSON.parse(text);
        console.log('🧪 ✅ JSON parse success:', json);
        alert('✅ Endpoint test passed! Check console for details.');
      } catch (parseError) {
        console.error('🧪 ❌ JSON parse failed:', parseError);
        alert(`❌ JSON parse failed: ${parseError.message}\n\nCheck console for full response.`);
      }
    } catch (error) {
      console.error('🧪 ❌ Fetch failed:', error);
      alert(`❌ Fetch failed: ${error.message}`);
    }
  };

  // Website Finder Functions
  const startFindingWebsites = async () => {
    if (selectedVillages.length === 0) {
      alert('Please select villages to find websites for');
      return;
    }

    setFindingWebsites(true);
    setProgress({ current: 0, total: selectedVillages.length });
    
    const villagesToFind = villages.filter(v => selectedVillages.includes(v.id));
    
    console.log(`🔍 Finding websites for ${villagesToFind.length} villages...`);
    
    try {
      // Process in batches of 10 to avoid timeouts and rate limits
      const BATCH_SIZE = 10;
      const allResults: any[] = [];
      
      for (let i = 0; i < villagesToFind.length; i += BATCH_SIZE) {
        const batch = villagesToFind.slice(i, i + BATCH_SIZE);
        console.log(`📦 Processing batch ${Math.floor(i / BATCH_SIZE) + 1} of ${Math.ceil(villagesToFind.length / BATCH_SIZE)} (${batch.length} villages)...`);
        
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/scraper/find-websites`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${currentAccessToken || accessToken || publicAnonKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              villages: batch.map(v => ({
                id: v.id,
                name: v.name,
                suburb: v.suburb,
                state: v.state,
              })),
            }),
          }
        );

        const result = await response.json();

        if (response.ok && result.success) {
          // 🔥 LOG TEST MESSAGE FROM BACKEND
          if (result.testMessage) {
            console.log(`\n${'='.repeat(80)}`);
            console.log(`%c${result.testMessage}`, 'color: red; font-weight: bold; font-size: 16px;');
            console.log(`%cBackend Version: ${result.backendVersion}`, 'color: green; font-weight: bold; font-size: 14px;');
            console.log(`${'='.repeat(80)}\n`);
          }
          
          allResults.push(...result.results);
          setProgress({ current: i + batch.length, total: selectedVillages.length });
          console.log(`✅ Batch complete: ${result.summary.found} found, ${result.summary.notFound} not found`);
        } else {
          console.error(`❌ Batch failed:`, result.error);
          alert(`❌ Batch ${Math.floor(i / BATCH_SIZE) + 1} failed: ${result.error}`);
          break;
        }
        
        // Wait 5 seconds between batches to respect rate limits
        if (i + BATCH_SIZE < villagesToFind.length) {
          console.log('⏳ Waiting 5 seconds before next batch...');
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      }
      
      setWebsiteFinderResults(allResults);
      
      const foundCount = allResults.filter(r => r.status === 'found').length;
      const notFoundCount = allResults.filter(r => r.status === 'not_found').length;
      const errorCount = allResults.filter(r => r.status === 'error').length;
      
      console.log(`✅ Website finding complete:`, { found: foundCount, notFound: notFoundCount, errors: errorCount });
      console.log(`📊 Full results from backend:`, allResults);
      alert(`✅ Found ${foundCount} websites!\n${notFoundCount} not found, ${errorCount} errors.`);
      
    } catch (error) {
      console.error('❌ Error finding websites:', error);
      alert('Failed to find websites');
    }

    setFindingWebsites(false);
  };

  const saveWebsiteUrls = async () => {
    const foundWebsites = websiteFinderResults.filter(r => r.status === 'found');
    
    if (foundWebsites.length === 0) {
      alert('No website URLs to save');
      return;
    }

    if (!confirm(`Save ${foundWebsites.length} found website URLs to database?`)) {
      return;
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/scraper/save-websites`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${currentAccessToken || accessToken || publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ results: foundWebsites }),
        }
      );

      const result = await response.json();

      if (response.ok) {
        alert(`✅ Saved ${result.updated} website URLs successfully!`);
        setWebsiteFinderResults([]);
        setSelectedVillages([]);
        loadVillages();
      } else {
        alert(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      console.error('❌ Error saving website URLs:', error);
      alert('Failed to save website URLs');
    }
  };

  // Auto-processor: Automatically process all villages with missing websites in batches
  const startAutoProcessor = async () => {
    if (!confirm('🤖 Start AUTO-PROCESSOR?\n\nThis will automatically:\n• Find all villages missing website URLs (~492 villages)\n• Search for websites in sub-batches of 5 villages\n• 💾 Save results IMMEDIATELY after each 5 villages (no data loss!)\n• Run until complete (estimated 2-3 hours)\n\nYou can pause/stop at any time - all scraped data is saved instantly!\n\nContinue?')) {
      return;
    }

    // Check if accessToken is still valid
    if (!accessToken) {
      alert('❌ Authentication required. Please refresh the page to continue.');
      return;
    }

    setAutoProcessing(true);
    setAutoPaused(false);
    autoPausedRef.current = false; // 🔧 Reset ref when starting
    
    try {
      // FIXED: Don't load all villages into memory - just count them
      console.log('🤖 AUTO-PROCESSOR: Counting villages with no website...');
      
      const countResponse = await fetchWithAutoRefresh(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/villages/admin/count-no-website`,
        {
          headers: {
            'Authorization': `Bearer ${currentAccessToken || accessToken || publicAnonKey}`,
          },
        }
      );

      if (!countResponse.ok) {
        throw new Error(`Failed to count villages: ${countResponse.status}`);
      }

      const countData = await countResponse.json();
      const totalCount = countData.count || 0;
      
      console.log(`🤖 AUTO-PROCESSOR: Found ${totalCount} villages missing website URLs`);
      
      if (totalCount === 0) {
        alert('✅ No villages need website URLs!');
        setAutoProcessing(false);
        return;
      }
      
      const BATCH_SIZE = 50;
      const totalBatches = Math.ceil(totalCount / BATCH_SIZE);
      
      // 🧹 Clear any old batch index
      localStorage.removeItem('auto_processor_current_batch');
      
      setAutoProgress({
        currentBatch: 0,
        totalBatches,
        processedCount: 0,
        totalCount: totalCount,
        foundCount: 0,
        notFoundCount: 0
      });

      let totalFound = 0;
      let totalNotFound = 0;

      // Process each batch
      for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
        // Check if paused
        if (autoPaused) {
          console.log('⏸️ AUTO-PROCESSOR PAUSED by user');
          alert('⏸️ Auto-processor paused. Click "Resume" to continue.');
          break;
        }

        // Fetch only this batch of villages
        console.log(`🤖 AUTO-PROCESSOR: Fetching batch ${batchIndex + 1}/${totalBatches}...`);
        
        const batchResponse = await fetchWithAutoRefresh(
          `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/villages/admin/no-website-batch?offset=${batchIndex * BATCH_SIZE}&limit=${BATCH_SIZE}`,
          {
            headers: {
              'Authorization': `Bearer ${currentAccessToken || accessToken || publicAnonKey}`,
            },
          }
        );

        if (!batchResponse.ok) {
          // Handle auth expiration (though fetchWithAutoRefresh should handle this)
          if (batchResponse.status === 401) {
            throw new Error(`Authentication expired after retry. Please refresh the page (F5) and your progress will be saved.`);
          }
          throw new Error(`Failed to fetch batch: ${batchResponse.status}`);
        }

        const batchData = await batchResponse.json();
        const currentBatch = batchData.villages || [];
        
        if (currentBatch.length === 0) {
          console.log('✅ No more villages to process');
          break;
        }
        
        // 🚨 CRITICAL: Warn about villages without operators
        const withoutOperator = currentBatch.filter((v: any) => !v.operator || v.operator.trim() === '');
        const withOperator = currentBatch.filter((v: any) => v.operator && v.operator.trim() !== '');
        
        console.log(`🤖 AUTO-PROCESSOR: Processing batch ${batchIndex + 1}/${totalBatches} (${currentBatch.length} villages)`);
        console.log(`   📊 ${withOperator.length} with operators, ${withoutOperator.length} without operators`);
        
        if (withoutOperator.length > 0) {
          console.warn(`   ⚠️ WARNING: ${withoutOperator.length} villages have NO OPERATOR - may find aggregator sites instead of official websites`);
          console.warn(`   Villages without operators:`, withoutOperator.map((v: any) => v.name).join(', '));
        }
        
        setAutoProgress(prev => ({
          ...prev,
          currentBatch: batchIndex + 1,
        }));

        // Process this batch through the website finder
        const SEARCH_BATCH_SIZE = 2; // ⚡ REDUCED: 2 to prevent 546 Supabase resource limit errors (was 3)
        const batchResults: WebsiteFinderResult[] = [];

        for (let i = 0; i < currentBatch.length; i += SEARCH_BATCH_SIZE) {
          // 🛑 CHECK FOR PAUSE/STOP (IMMEDIATE RESPONSE using ref!)
          if (autoPausedRef.current) {
            console.log('⏸️ AUTO-PROCESSOR PAUSED by user (during village processing)');
            alert('⏸️ Auto-processor paused. Click \"Resume\" to continue.');
            setAutoProcessing(false);
            return; // Exit immediately
          }
          
          const searchBatch = currentBatch.slice(i, i + SEARCH_BATCH_SIZE);
          
          // Wrap in retry loop to handle network errors (Failed to fetch)
          let searchResponse;
          let retryCount = 0;
          const maxRetries = 3;
          
          while (retryCount <= maxRetries) {
            try {
              searchResponse = await fetchWithAutoRefresh(
                `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/scraper/find-websites`,
                {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${currentAccessToken || accessToken || publicAnonKey}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    villages: searchBatch.map(v => ({
                      id: v.id,
                      name: v.name,
                      suburb: v.suburb,
                      state: v.state,
                      operator: v.operator, // Include operator for better search results
                    })),
                  }),
                }
              );
              
              // Success! Break out of retry loop
              break;
              
            } catch (fetchError) {
              retryCount++;
              console.error(`❌ Network error (Failed to fetch) - Attempt ${retryCount}/${maxRetries + 1}:`, fetchError);
              
              if (retryCount <= maxRetries) {
                const waitTime = retryCount * 15000; // Progressive wait: 15s, 30s, 45s
                console.log(`⏳ Waiting ${waitTime/1000} seconds before retry...`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
                console.log(`🔄 Retrying (attempt ${retryCount + 1}/${maxRetries + 1})...`);
              } else {
                // Failed after all retries - throw error to stop processing
                throw new Error(`Network error after ${maxRetries + 1} attempts: ${fetchError}. Please check your internet connection and click Resume to continue.`);
              }
            }
          }

          // Check if response is OK before parsing
          if (!searchResponse.ok) {
            const errorText = await searchResponse.text();
            console.error(`❌ Search API error (${searchResponse.status}):`, errorText);
            
            // Handle JWT expiration specifically (though fetchWithAutoRefresh should handle this)
            if (searchResponse.status === 401) {
              throw new Error(`Authentication expired after retry. Please refresh the page (F5) to get a new token and resume processing. Your progress has been saved.`);
            }
            
            // Handle Supabase resource limit (546 error) - wait longer to let resources recover
            if (searchResponse.status === 546) {
              console.error('⚠️ Edge function resource limit hit. Waiting 20 seconds before retry...');
              await new Promise(resolve => setTimeout(resolve, 20000)); // Wait 20 seconds (increased from 10)
              
              // Try one more time
              console.log('🔄 Retrying village search...');
              continue; // Skip to next iteration
            }
            
            throw new Error(`Search failed: ${searchResponse.status} - ${errorText.substring(0, 200)}`);
          }

          // Try to parse JSON, catch parsing errors
          let searchResult;
          const responseText = await searchResponse.text();
          
          try {
            searchResult = JSON.parse(responseText);
          } catch (parseError) {
            console.error(`❌ JSON parse error:`, parseError);
            console.error(`Response snippet:`, responseText.substring(0, 200));
            throw new Error(`Failed to parse response: ${parseError.message}`);
          }

          if (searchResult.success) {
            // 🔥 LOG TEST MESSAGE FROM BACKEND
            if (searchResult.testMessage) {
              console.log(`\n${'='.repeat(80)}`);
              console.log(`%c${searchResult.testMessage}`, 'color: red; font-weight: bold; font-size: 16px;');
              console.log(`%cBackend Version: ${searchResult.backendVersion}`, 'color: green; font-weight: bold; font-size: 14px;');
              console.log(`${'='.repeat(80)}\n`);
            }
            
            batchResults.push(...searchResult.results);
            console.log(`✅ Search batch complete: ${searchResult.summary.found} found, ${searchResult.summary.notFound} not found`);
            console.log(`🔍 DEBUG: batchResults now has ${batchResults.length} items`);
            console.log(`🔍 DEBUG: Sample result:`, JSON.stringify(batchResults[batchResults.length - 1], null, 2));
            
            // 🐛 DEBUG: Show debug info for not_found villages
            const notFoundResults = searchResult.results.filter((r: any) => r.status === 'not_found');
            if (notFoundResults.length > 0) {
              notFoundResults.forEach((result: any) => {
                console.log(`\n🔍 NOT FOUND DEBUG for ${result.villageName}:`);
                if (result.debug) {
                  console.log(`   Search Query: "${result.debug.searchQuery}"`);
                  console.log(`   Strategy: ${result.debug.searchStrategy}`);
                  console.log(`   Total URLs Found: ${result.debug.totalUrlsFound}`);
                  console.log(`   URLs After Filtering: ${result.debug.urlsAfterFiltering}`);
                  console.log(`   Aggregator URLs Found: ${result.debug.aggregatorUrlsFound}`);
                  if (result.debug.rawUrls && result.debug.rawUrls.length > 0) {
                    console.log(`   Raw URLs from Google:`, result.debug.rawUrls);
                  }
                  if (result.debug.filteredUrls && result.debug.filteredUrls.length > 0) {
                    console.log(`   Filtered URLs:`, result.debug.filteredUrls);
                  }
                }
              });
            }
            
            // 💾 IMMEDIATE SAVE - Save after EVERY sub-batch (every 5 villages) instead of waiting for 50
            const foundInSubBatch = searchResult.results.filter((r: any) => r.status === 'found');
            
            if (foundInSubBatch.length > 0) {
              console.log(`💾 IMMEDIATE SAVE: ${foundInSubBatch.length} found URLs from sub-batch...`);
              
              try {
                const saveResponse = await fetchWithAutoRefresh(
                  `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/scraper/save-websites`,
                  {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${currentAccessToken || accessToken || publicAnonKey}`,
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ results: foundInSubBatch }),
                  }
                );

                if (!saveResponse.ok) {
                  const errorText = await saveResponse.text();
                  console.error(`❌ Save API error (${saveResponse.status}):`, errorText);
                  throw new Error(`Save failed: ${saveResponse.status}`);
                }

                const saveResult = JSON.parse(await saveResponse.text());
                console.log(`✅ SAVED IMMEDIATELY: ${saveResult.updated} URLs to database`);
                
                totalFound += foundInSubBatch.length;
              } catch (saveError) {
                console.error(`❌ Failed to save sub-batch:`, saveError);
                // Don't throw - continue processing but log the error
              }
            }
            
            // Count not found
            const notFoundInSubBatch = searchResult.results.filter((r: any) => r.status === 'not_found' || r.status === 'error');
            totalNotFound += notFoundInSubBatch.length;
            
          } else {
            console.error(`❌ Search failed:`, searchResult.error);
            throw new Error(searchResult.error || 'Search failed');
          }
          
          // Update progress display after each sub-batch
          setAutoProgress(prev => ({
            ...prev,
            processedCount: (batchIndex * BATCH_SIZE) + i + SEARCH_BATCH_SIZE,
            foundCount: totalFound,
            notFoundCount: totalNotFound
          }));
          
          // Wait 20 seconds between searches to avoid edge function overload (increased from 12 to prevent 546 errors)
          if (i + SEARCH_BATCH_SIZE < currentBatch.length) {
            console.log('⏳ Waiting 20 seconds before next village search...');
            await new Promise(resolve => setTimeout(resolve, 20000));
            
            // 🛑 CHECK FOR PAUSE/STOP (AFTER WAIT using ref!)
            if (autoPausedRef.current) {
              console.log('⏸️ AUTO-PROCESSOR PAUSED by user (during wait)');
              alert('⏸️ Auto-processor paused. Click \"Resume\" to continue.');
              setAutoProcessing(false);
              return; // Exit immediately
            }
          }
        }

        // OLD BATCH SAVE CODE REMOVED - Now saving immediately after each sub-batch above
        // This prevents data loss if user stops the processor before completing a full batch of 50
        
        // Update progress after completing full batch
        setAutoProgress(prev => ({
          ...prev,
          processedCount: (batchIndex + 1) * BATCH_SIZE,
          foundCount: totalFound,
          notFoundCount: totalNotFound
        }));

        // Wait 5 seconds between batches (reduced from 10 for faster processing)
        if (batchIndex < totalBatches - 1 && !autoPausedRef.current) {
          console.log('⏳ Waiting 5 seconds before next batch...');
          await new Promise(resolve => setTimeout(resolve, 5000));
          
          // 🛑 CHECK FOR PAUSE/STOP (AFTER BATCH WAIT)
          if (autoPausedRef.current) {
            console.log('⏸️ AUTO-PROCESSOR PAUSED by user (between batches)');
            alert('⏸️ Auto-processor paused. Click \\"Resume\\" to continue.');
            setAutoProcessing(false);
            return; // Exit immediately
          }
        }
      }

      console.log(`🎉 AUTO-PROCESSOR COMPLETE!`);
      console.log(`✅ Found: ${totalFound}, ❌ Not Found: ${totalNotFound}`);
      
      // 🧹 Clear saved batch index since we're done
      localStorage.removeItem('auto_processor_current_batch');
      console.log('🧹 Cleared saved batch index - scraping complete!');
      
      loadVillages(); // Refresh the village list
      
      alert(`🎉 AUTO-PROCESSOR COMPLETE!\n\n✅ Found: ${totalFound} websites\n❌ Not Found: ${totalNotFound} villages\n\nResults are displayed below.`);
      
    } catch (error) {
      console.error('❌ AUTO-PROCESSOR ERROR:', error);
      
      // Check if it's a JWT expiration error
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('401') || errorMessage.includes('Authentication expired') || errorMessage.includes('Invalid JWT')) {
        alert(`🔄 SESSION EXPIRED\n\nYour authentication token has expired (this happens after ~1 hour).\n\n✅ Your progress has been saved!\n\nTo continue:\n1. Press F5 to refresh the page\n2. Go back to Batch Scraping tab\n3. Click "Resume Auto-Processor"\n\nYou'll pick up exactly where you left off!`);
      } else {
        alert(`❌ Auto-processor error: ${errorMessage}`);
      }
    }

    setAutoProcessing(false);
    setAutoPaused(false);
  };

  const pauseAutoProcessor = () => {
    setAutoPaused(true);
    autoPausedRef.current = true; // 🔧 Set ref immediately for instant detection
  };

  const resumeAutoProcessor = () => {
    setAutoPaused(false);
    autoPausedRef.current = false; // 🔧 Clear ref
    // Note: The loop will continue on next iteration
  };

  const stopAutoProcessor = () => {
    if (confirm('⚠️ Stop auto-processor?\n\nProgress will be saved, but you will need to restart to continue.')) {
      setAutoPaused(true);
      autoPausedRef.current = true; // 🔧 Set ref immediately for instant detection
      setAutoProcessing(false);
    }
  };

  const successCount = scrapedData.filter(d => d.status === 'success').length;
  const errorCount = scrapedData.filter(d => d.status === 'error').length;
  
  // Check if there are unsaved results in scrapedData that should be saved
  const unsavedResults = scrapedData.filter(d => d.status === 'success');

  return (
    <div className="space-y-6">
      {/* RECOVERY BANNER - Shows if there are unsaved successful scrapes */}
      {unsavedResults.length > 0 && (
        <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-400 rounded-lg p-6 shadow-lg">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-8 h-8 text-orange-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-xl font-bold text-orange-900 mb-2">
                ⚠️ You Have {unsavedResults.length} Unsaved Scrapes!
              </h3>
              <p className="text-orange-800 mb-3">
                These results are saved in your browser's memory but haven't been saved to the database yet. 
                <strong> Save them now to prevent data loss!</strong>
              </p>
              <div className="flex gap-3">
                <button
                  onClick={saveResults}
                  className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-bold shadow-lg"
                >
                  <CheckCircle className="w-5 h-5" />
                  💾 Save {unsavedResults.length} Results to Database NOW!
                </button>
                <button
                  onClick={exportResults}
                  className="flex items-center gap-2 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium"
                >
                  Export CSV Backup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* ⚡ NEW: TOKEN REFRESH BANNER */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-400 rounded-lg p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <RefreshCw className={`w-6 h-6 text-blue-600 ${refreshingToken ? 'animate-spin' : ''}`} />
            <div>
              <h3 className="font-bold text-blue-900">Session Active</h3>
              <p className="text-sm text-blue-700">If you see "401" or "Invalid JWT" errors, click to refresh your token</p>
            </div>
          </div>
          <button
            onClick={refreshAuthToken}
            disabled={refreshingToken}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold shadow-md transition-colors ${
              refreshingToken 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <RefreshCw className={`w-5 h-5 ${refreshingToken ? 'animate-spin' : ''}`} />
            {refreshingToken ? 'Refreshing...' : '🔄 Refresh Token'}
          </button>
        </div>
      </div>
      
      {/* Loading State */}
      {loading && !dataStats && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-lg font-medium text-gray-900">Loading VIC villages from database...</p>
          <p className="text-sm text-gray-600 mt-2">This may take a moment (510 VIC villages)</p>
        </div>
      )}

      {/* Data Completeness Summary */}
      {dataStats && (
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">📊 VIC Database Completeness Overview</h3>
          <p className="text-gray-700 mb-4">
            You have <strong>{dataStats.totalVillages.toLocaleString()}</strong> VIC villages in your database. Here's what needs work:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Missing Entry Pricing - PRIORITY! */}
            <div className="bg-white rounded-lg p-4 border-2 border-red-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Missing Entry Pricing</span>
                <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-bold">TIER 2 ⭐</span>
              </div>
              <p className="text-3xl font-bold text-red-600 mb-1">{dataStats.missingEntryPricing.toLocaleString()}</p>
              <p className="text-xs text-gray-500">villages with NO entry price (min/max)</p>
              <div className="mt-2 pt-2 border-t border-gray-200">
                <p className="text-lg font-bold text-green-700">{dataStats.scrapeableMissingEntryPricing.toLocaleString()} scrapeable</p>
                <p className="text-xs text-gray-500">have websites for scraping</p>
                <button
                  onClick={() => setFilterMode('missing-entry-pricing')}
                  className="mt-1 text-xs text-blue-600 hover:text-blue-800 underline"
                >
                  Scrape these villages →
                </button>
              </div>
              <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-red-500 h-2 rounded-full" 
                  style={{ width: `${((dataStats.totalVillages - dataStats.missingEntryPricing) / dataStats.totalVillages * 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {Math.round((dataStats.totalVillages - dataStats.missingEntryPricing) / dataStats.totalVillages * 100)}% complete
              </p>
            </div>

            {/* Missing Monthly Fees */}
            <div className="bg-white rounded-lg p-4 border-2 border-pink-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Missing Monthly Fees</span>
                <span className="px-2 py-1 bg-pink-100 text-pink-700 rounded text-xs font-bold">TIER 2</span>
              </div>
              <p className="text-3xl font-bold text-pink-600 mb-1">{dataStats.missingMonthlyFees.toLocaleString()}</p>
              <p className="text-xs text-gray-500">villages with NO monthly fees (min/max)</p>
              <div className="mt-2 pt-2 border-t border-gray-200">
                <p className="text-lg font-bold text-green-700">{dataStats.scrapeableMissingMonthlyFees.toLocaleString()} scrapeable</p>
                <p className="text-xs text-gray-500">have websites for scraping</p>
                <button
                  onClick={() => setFilterMode('missing-monthly-fees')}
                  className="mt-1 text-xs text-blue-600 hover:text-blue-800 underline"
                >
                  Scrape these villages →
                </button>
              </div>
              <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-pink-500 h-2 rounded-full" 
                  style={{ width: `${((dataStats.totalVillages - dataStats.missingMonthlyFees) / dataStats.totalVillages * 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {Math.round((dataStats.totalVillages - dataStats.missingMonthlyFees) / dataStats.totalVillages * 100)}% complete
              </p>
            </div>

            {/* Missing Email */}
            <div className="bg-white rounded-lg p-4 border-2 border-orange-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Missing Email</span>
                <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-bold">TIER 1</span>
              </div>
              <p className="text-3xl font-bold text-orange-600 mb-1">{dataStats.missingEmail.toLocaleString()}</p>
              <p className="text-xs text-gray-500">villages with no contact email</p>
              <div className="mt-2 pt-2 border-t border-gray-200">
                <p className="text-lg font-bold text-green-700">{dataStats.scrapeableMissingEmail.toLocaleString()} scrapeable</p>
                <p className="text-xs text-gray-500">have websites for scraping</p>
              </div>
              <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-orange-500 h-2 rounded-full" 
                  style={{ width: `${((dataStats.totalVillages - dataStats.missingEmail) / dataStats.totalVillages * 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {Math.round((dataStats.totalVillages - dataStats.missingEmail) / dataStats.totalVillages * 100)}% complete
              </p>
            </div>

            {/* Missing Operator */}
            <div className="bg-white rounded-lg p-4 border-2 border-purple-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Missing Operator</span>
                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-bold">TIER 1</span>
              </div>
              <p className="text-3xl font-bold text-purple-600 mb-1">{dataStats.missingOperator.toLocaleString()}</p>
              <p className="text-xs text-gray-500">villages with no operator name</p>
              <div className="mt-2 pt-2 border-t border-gray-200">
                <p className="text-lg font-bold text-green-700">{dataStats.scrapeableMissingOperator.toLocaleString()} scrapeable</p>
                <p className="text-xs text-gray-500">have websites for scraping</p>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={() => setFilterMode('missing-operator')}
                  className="flex-1 px-3 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors text-sm font-medium"
                >
                  Scrape these villages →
                </button>
              </div>
              <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-500 h-2 rounded-full" 
                  style={{ width: `${((dataStats.totalVillages - dataStats.missingOperator) / dataStats.totalVillages * 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {Math.round((dataStats.totalVillages - dataStats.missingOperator) / dataStats.totalVillages * 100)}% complete
              </p>
            </div>

            {/* Missing Amenities/Care */}
            <div className="bg-white rounded-lg p-4 border-2 border-yellow-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Missing Amenities</span>
                <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-bold">TIER 2</span>
              </div>
              <p className="text-3xl font-bold text-yellow-600 mb-1">{dataStats.missingAmenities.toLocaleString()}</p>
              <p className="text-xs text-gray-500">villages missing amenities/care data</p>
              <div className="mt-2 pt-2 border-t border-gray-200">
                <p className="text-lg font-bold text-green-700">{dataStats.scrapeableMissingAmenities.toLocaleString()} scrapeable</p>
                <p className="text-xs text-gray-500">have websites for scraping</p>
              </div>
              <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-yellow-500 h-2 rounded-full" 
                  style={{ width: `${((dataStats.totalVillages - dataStats.missingAmenities) / dataStats.totalVillages * 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {Math.round((dataStats.totalVillages - dataStats.missingAmenities) / dataStats.totalVillages * 100)}% complete
              </p>
            </div>

            {/* No Website */}
            <div className="bg-white rounded-lg p-4 border-2 border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">No Website</span>
                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-bold">CAN'T SCRAPE</span>
              </div>
              <p className="text-3xl font-bold text-gray-600 mb-1">{dataStats.noWebsite.toLocaleString()}</p>
              <p className="text-xs text-gray-500">villages without website URLs in database</p>
              <div className="mt-2 pt-2 border-t border-gray-200">
                <p className="text-lg font-bold text-green-700">✅ {dataStats.withWebsite.toLocaleString()} WITH websites</p>
                <p className="text-xs text-gray-500">ready for scraping</p>
                <button
                  onClick={() => setFilterMode('no-website')}
                  className="mt-1 text-xs text-blue-600 hover:text-blue-800 underline"
                >
                  View no-website villages →
                </button>
              </div>
              <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gray-500 h-2 rounded-full" 
                  style={{ width: `${(dataStats.withWebsite / dataStats.totalVillages * 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {Math.round(dataStats.withWebsite / dataStats.totalVillages * 100)}% have websites
              </p>
            </div>
          </div>

          {/* Diagnostic Tool */}
          <div className="mt-6 bg-purple-50 border border-purple-300 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-bold text-purple-900">🔍 Pricing Diagnostic Tool</h4>
              <button
                onClick={() => {
                  setShowDiagnostics(!showDiagnostics);
                  if (!showDiagnostics && diagnosticData.length === 0) {
                    loadDiagnostics();
                  }
                }}
                className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm"
              >
                {showDiagnostics ? 'Hide Details' : 'View Detailed Breakdown'}
              </button>
            </div>
            <p className="text-xs text-purple-800">
              See exactly which villages have missing vs incomplete pricing data with field-level details.
            </p>
          </div>

          {/* Diagnostic Data Table */}
          {showDiagnostics && (
            <div className="mt-4 bg-white border border-gray-300 rounded-lg p-4 max-h-96 overflow-y-auto">
              {diagnosticLoading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  <p className="mt-2 text-gray-600">Loading diagnostic data...</p>
                </div>
              ) : (
                <>
                  <div className="mb-4 flex items-center justify-between">
                    <h5 className="font-bold text-gray-900">
                      Showing {diagnosticData.length} villages with websites
                    </h5>
                    <button
                      onClick={() => {
                        const csv = [
                          ['ID', 'Name', 'State', 'Suburb', 'Website', 'Category', 'Entry Min', 'Entry Max', 'Monthly Min', 'Monthly Max'].join(','),
                          ...diagnosticData.map(d => 
                            [d.id, `"${d.name}"`, d.state, d.suburb, d.website, `"${d.category}"`, 
                             d.entry_price_min || '', d.entry_price_max || '', 
                             d.monthly_fees_min || '', d.monthly_fees_max || ''].join(',')
                          )
                        ].join('\n');
                        const blob = new Blob([csv], { type: 'text/csv' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'pricing-diagnostic.csv';
                        a.click();
                      }}
                      className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                    >
                      📥 Export CSV
                    </button>
                  </div>
                  
                  <table className="w-full text-xs">
                    <thead className="bg-gray-100 sticky top-0">
                      <tr>
                        <th className="p-2 text-left">Village Name</th>
                        <th className="p-2 text-left">State</th>
                        <th className="p-2 text-left">Category</th>
                        <th className="p-2 text-center">Entry Min</th>
                        <th className="p-2 text-center">Entry Max</th>
                        <th className="p-2 text-center">Monthly Min</th>
                        <th className="p-2 text-center">Monthly Max</th>
                      </tr>
                    </thead>
                    <tbody>
                      {diagnosticData.map((d) => (
                        <tr key={d.id} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="p-2">
                            <div className="font-medium">{d.name}</div>
                            <div className="text-gray-500 truncate max-w-xs">{d.website}</div>
                          </td>
                          <td className="p-2">{d.state}</td>
                          <td className="p-2">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                              d.category.startsWith('MISSING') 
                                ? 'bg-red-100 text-red-700' 
                                : d.category.startsWith('INCOMPLETE')
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-green-100 text-green-700'
                            }`}>
                              {d.category}
                            </span>
                          </td>
                          <td className="p-2 text-center">
                            {d.entry_price_min ? (
                              <span className="text-green-600">✓ ${d.entry_price_min.toLocaleString()}</span>
                            ) : (
                              <span className="text-red-500">✗</span>
                            )}
                          </td>
                          <td className="p-2 text-center">
                            {d.entry_price_max ? (
                              <span className="text-green-600">✓ ${d.entry_price_max.toLocaleString()}</span>
                            ) : (
                              <span className="text-red-500">✗</span>
                            )}
                          </td>
                          <td className="p-2 text-center">
                            {d.monthly_fees_min ? (
                              <span className="text-green-600">✓ ${d.monthly_fees_min.toLocaleString()}</span>
                            ) : (
                              <span className="text-red-500">✗</span>
                            )}
                          </td>
                          <td className="p-2 text-center">
                            {d.monthly_fees_max ? (
                              <span className="text-green-600">✓ ${d.monthly_fees_max.toLocaleString()}</span>
                            ) : (
                              <span className="text-red-500">✗</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}
            </div>
          )}

          {/* Recommendation */}
          <div className="mt-6 bg-blue-100 border border-blue-300 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <strong>💡 Recommendation:</strong> Start with <strong>Missing Entry Pricing</strong> ({dataStats.missingEntryPricing.toLocaleString()} villages) ⭐ 
              as it's the most critical pricing data for users. Then tackle <strong>Missing Monthly Fees</strong> ({dataStats.missingMonthlyFees.toLocaleString()} villages). 
              Use batch sizes of 50-100 villages at a time.
            </p>
          </div>
        </div>
      )}

      {/* Restored Results Notice */}
      {scrapedData.length > 0 && !scraping && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-yellow-800">
            <AlertCircle className="w-5 h-5" />
            <div>
              <p className="font-semibold">Unsaved Results Found!</p>
              <p className="text-sm">
                You have {scrapedData.length} scraping results that haven't been saved to the database yet. 
                Scroll down to save or retry them.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* DATABASE STATUS CARD - Quick stats */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-300 rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-blue-900 mb-1">📊 Current Database Status</h3>
            <p className="text-sm text-blue-700">VIC villages with website URLs: <span className="font-bold">{villages.filter(v => v.website).length}</span> / {villages.length}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={checkRecentUpdates}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm shadow"
            >
              🔍 Check Recent Updates
            </button>
            <button
              onClick={showAllWebsites}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm shadow"
            >
              📋 View All Websites
            </button>
            <button
              onClick={deleteAllVicWebsites}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm shadow"
            >
              🗑️ Delete All Websites
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold">🕷️ VIC Web Scraper Tool</h2>
            <p className="text-gray-600 mt-2">
              Automatically extract missing data from VIC village websites. Scrapes ALL tiers in one visit per village.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (confirm('Clear the processed villages list? This will allow you to re-scrape all villages.')) {
                  localStorage.removeItem('scraper_processed_ids');
                  localStorage.removeItem('scraped_data');
                  localStorage.removeItem('auto_processor_current_batch'); // 🧹 Also clear batch index
                  setProcessedVillageIds([]);
                  setScrapedData([]);
                  console.log('🧹 Cleared processed list and batch index from localStorage');
                  alert('✅ Processed list cleared! You can now scrape all villages again.');
                }
              }}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium text-sm"
              title="Clear the list of already-processed villages"
            >
              <Trash2 className="w-4 h-4" />
              Clear Processed List
            </button>
            {(scraping || autoScraping) && (
              <button
                onClick={() => {
                  setScraping(false);
                  setAutoScraping(false);
                  setAutoScrapePaused(false);
                  console.log('🔄 Hard reset - all scraping states cleared');
                }}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium text-sm"
                title="Reset all scraping states if stuck"
              >
                <RefreshCw className="w-4 h-4" />
                Reset Tool
              </button>
            )}
          </div>
        </div>

        {/* Filter Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Filter className="inline w-4 h-4 mr-1" />
            Filter Villages
          </label>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilterMode('missing-entry-pricing')}
              className={`px-4 py-2 rounded-lg border ${
                filterMode === 'missing-entry-pricing'
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              ⭐ Missing Entry Pricing
            </button>
            <button
              onClick={() => setFilterMode('missing-monthly-fees')}
              className={`px-4 py-2 rounded-lg border ${
                filterMode === 'missing-monthly-fees'
                  ? 'bg-pink-500 text-white border-pink-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Missing Monthly Fees
            </button>
            <button
              onClick={() => setFilterMode('missing-email')}
              className={`px-4 py-2 rounded-lg border ${
                filterMode === 'missing-email'
                  ? 'bg-orange-500 text-white border-orange-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Missing Email
            </button>
            <button
              onClick={() => setFilterMode('missing-operator')}
              className={`px-4 py-2 rounded-lg border ${
                filterMode === 'missing-operator'
                  ? 'bg-purple-500 text-white border-purple-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Missing Operator
            </button>
            <button
              onClick={() => setFilterMode('missing-amenities')}
              className={`px-4 py-2 rounded-lg border ${
                filterMode === 'missing-amenities'
                  ? 'bg-green-500 text-white border-green-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Missing Amenities/Care
            </button>
            <button
              onClick={() => setFilterMode('no-website')}
              className={`px-4 py-2 rounded-lg border ${
                filterMode === 'no-website'
                  ? 'bg-purple-500 text-white border-purple-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              🔍 No Website (Find URLs)
            </button>
            <button
              onClick={() => setFilterMode('all')}
              className={`px-4 py-2 rounded-lg border ${
                filterMode === 'all'
                  ? 'bg-gray-500 text-white border-gray-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              All with Websites
            </button>
          </div>
        </div>

        {/* Batch Size */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Batch Size (max to select)
          </label>
          <input
            type="number"
            value={batchSize}
            onChange={(e) => setBatchSize(parseInt(e.target.value) || 50)}
            min="1"
            max="500"
            className="w-32 px-3 py-2 border border-gray-300 rounded-lg"
          />
          <p className="text-xs text-gray-500 mt-1">
            ℹ️ For manual selection only. Auto-processor uses its own batch size.
          </p>
        </div>

        {/* Auto-Resume Toggle */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-blue-900">🚀 Auto-Resume Mode</h4>
                {autoResumeEnabled && (
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                    ENABLED
                  </span>
                )}
              </div>
              <p className="text-sm text-blue-700">
                Automatically start the next batch when the current one completes. 
                <strong> Walk away and let it scrape all remaining villages!</strong>
              </p>
            </div>
            <label className="flex items-center gap-3 cursor-pointer ml-4">
              <input
                type="checkbox"
                checked={autoResumeEnabled}
                onChange={(e) => setAutoResumeEnabled(e.target.checked)}
                className="w-5 h-5 cursor-pointer"
              />
              <span className="text-sm font-medium text-blue-900">
                {autoResumeEnabled ? 'ON' : 'OFF'}
              </span>
            </label>
          </div>
        </div>

        {/* Session Stats & Clear Failed Button */}
        {processedVillageIds.length > 0 && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-purple-900 mb-2">🗂️ Session Tracking</h3>
            <p className="text-purple-800 text-sm mb-3">
              <strong>{processedVillageIds.length}</strong> villages have been attempted in this session and are excluded from the filter.
            </p>
            <div className="flex gap-3">
              {scrapedData.filter(d => d.status === 'error').length > 0 && (
                <button
                  onClick={retryFailedVillages}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium text-sm"
                  title="Removes failed villages from processed list so they appear in filter again"
                >
                  <RefreshCw className="w-4 h-4" />
                  Clear {scrapedData.filter(d => d.status === 'error').length} Failed from List
                </button>
              )}
              <button
                onClick={resetSession}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium text-sm"
                title="Clears ALL processed villages (successes and failures) from tracking"
              >
                <RefreshCw className="w-4 h-4" />
                Reset Session ({processedVillageIds.length} processed)
              </button>
            </div>
          </div>
        )}

        {/* Stats */}
        {!loading && villages.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">📊 Available Villages</h3>
            <p className="text-blue-800">
              Found <strong>{villages.length}</strong> villages matching filter with websites
            </p>
          </div>
        )}

        {/* No Villages Found */}
        {!loading && villages.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-yellow-900 mb-2">⚠️ No Villages Found</h3>
            <p className="text-yellow-800">
              No villages found matching the current filter that have websites. Try a different filter or check if villages have website URLs in the database.
            </p>
          </div>
        )}

        {/* Village Selection */}
        {loading ? (
          <div className="text-center py-8">
            <RefreshCw className="inline w-6 h-6 animate-spin text-blue-500" />
            <p className="text-gray-600 mt-2">Loading villages...</p>
          </div>
        ) : (
          <>
            <div className="mb-4 flex justify-between items-center">
              <button
                onClick={handleSelectAll}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                {selectedVillages.length === Math.min(batchSize, villages.length)
                  ? 'Deselect All'
                  : `Select First ${Math.min(batchSize, villages.length)}`}
              </button>
              <span className="text-sm text-gray-600">
                {selectedVillages.length} selected
              </span>
            </div>

            <div className="border border-gray-300 rounded-lg max-h-96 overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Select</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Village</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Location</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Missing Data</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(villages || []).slice(0, 200).map((village) => (
                    <tr key={village.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2">
                        <input
                          type="checkbox"
                          checked={selectedVillages.includes(village.id)}
                          onChange={() => handleSelectVillage(village.id)}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <div className="text-sm font-medium text-gray-900">{village.name}</div>
                        <div className="text-xs text-gray-500">{village.operator}</div>
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-600">
                        {village.suburb}, {village.state}
                      </td>
                      <td className="px-4 py-2 text-xs">
                        <div className="flex gap-1 flex-wrap">
                          {!village.has_pricing && (
                            <span className="px-2 py-1 bg-red-100 text-red-700 rounded">Pricing</span>
                          )}
                          {!village.has_email && (
                            <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded">Email</span>
                          )}
                          {!village.has_amenities && (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded">Amenities</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Control Buttons */}
        <div className="mt-6 flex gap-3 flex-wrap">
          {filterMode === 'no-website' ? (
            // Website Finder Mode
            <div className="flex gap-4">
              <button
                onClick={startFindingWebsites}
                disabled={selectedVillages.length === 0 || findingWebsites || autoProcessing}
                className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
              >
                {findingWebsites ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Finding Websites...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    Find Websites Manually ({selectedVillages.length} villages)
                  </>
                )}
              </button>
              
              {/* TEST BUTTON - Remove after debugging */}
              <button
                onClick={testEndpoint}
                className="flex items-center gap-2 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium text-sm"
              >
                🧪 Test Endpoint
              </button>
              
              {/* CHECK RECENT UPDATES BUTTON */}
              <button
                onClick={checkRecentUpdates}
                className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
              >
                🔍 Check Recent Updates
              </button>
              
              {/* VIEW ALL WEBSITES BUTTON */}
              <button
                onClick={showAllWebsites}
                className="flex items-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm"
              >
                📋 View All Websites
              </button>
              
              {/* DELETE ALL WEBSITES BUTTON */}
              <button
                onClick={deleteAllVicWebsites}
                className="flex items-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm"
              >
                🗑️ Delete All Websites
              </button>
              
              {/* Auto-Processor Button */}
              {!autoProcessing ? (
                <button
                  onClick={startAutoProcessor}
                  disabled={findingWebsites}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium shadow-lg"
                >
                  <PlayCircle className="w-5 h-5" />
                  🤖 Start Auto-Processor (All Remaining)
                </button>
              ) : (
                <div className="flex gap-2">
                  {!autoPaused ? (
                    <button
                      onClick={pauseAutoProcessor}
                      className="flex items-center gap-2 px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-medium"
                    >
                      <StopCircle className="w-5 h-5" />
                      Pause Auto-Processor
                    </button>
                  ) : (
                    <button
                      onClick={resumeAutoProcessor}
                      className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                    >
                      <PlayCircle className="w-5 h-5" />
                      Resume Auto-Processor
                    </button>
                  )}
                  <button
                    onClick={stopAutoProcessor}
                    className="flex items-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                  >
                    <StopCircle className="w-5 h-5" />
                    Stop
                  </button>
                </div>
              )}
            </div>
          ) : !scraping && !autoScraping ? (
            // Scraping Mode - Show both manual and auto-scrape buttons
            <div className="flex gap-3">
              <button
                onClick={startScraping}
                disabled={selectedVillages.length === 0}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
              >
                <PlayCircle className="w-5 h-5" />
                Start Scraping ({selectedVillages.length} villages)
              </button>
              
              <button
                onClick={startAutoScrapeAll}
                disabled={villages.length === 0}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed font-medium shadow-lg"
              >
                <RefreshCw className="w-5 h-5" />
                🤖 Scrape All ({villages.length} villages)
              </button>
              
              {/* CHECK RECENT UPDATES BUTTON */}
              <button
                onClick={checkRecentUpdates}
                className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
              >
                🔍 Check Recent Updates
              </button>
              
              {/* VIEW ALL WEBSITES BUTTON */}
              <button
                onClick={showAllWebsites}
                className="flex items-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm"
              >
                📋 View All Websites
              </button>
              
              {/* DELETE ALL WEBSITES BUTTON */}
              <button
                onClick={deleteAllVicWebsites}
                className="flex items-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm"
              >
                🗑️ Delete All Websites
              </button>
            </div>
          ) : scraping ? (
            <button
              onClick={stopScraping}
              className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
            >
              <StopCircle className="w-5 h-5" />
              Stop Scraping
            </button>
          ) : autoScraping ? (
            <div className="flex gap-3">
              {autoScrapePaused ? (
                <button
                  onClick={resumeAutoScrape}
                  className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                >
                  <PlayCircle className="w-5 h-5" />
                  Resume Auto-Scrape
                </button>
              ) : (
                <button
                  onClick={pauseAutoScrape}
                  className="flex items-center gap-2 px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-medium"
                >
                  <Clock className="w-5 h-5" />
                  Pause Auto-Scrape
                </button>
              )}
              <button
                onClick={stopAutoScrape}
                className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
              >
                <StopCircle className="w-5 h-5" />
                Stop
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {/* Auto-Processor Progress */}
      {autoProcessing && (
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg shadow-lg border-2 border-purple-300 p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <RefreshCw className={`w-6 h-6 text-purple-600 ${!autoPaused ? 'animate-spin' : ''}`} />
            🤖 Auto-Processor {autoPaused ? '(Paused)' : 'Running...'}
          </h3>
          
          <div className="space-y-4">
            {/* Batch Progress */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Batch Progress: {autoProgress.currentBatch} / {autoProgress.totalBatches}
                </span>
                <span className="text-sm font-medium text-gray-700">
                  {Math.round((autoProgress.currentBatch / autoProgress.totalBatches) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-4 rounded-full transition-all duration-500"
                  style={{ width: `${(autoProgress.currentBatch / autoProgress.totalBatches) * 100}%` }}
                />
              </div>
            </div>
            
            {/* Village Progress */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Villages Processed: {autoProgress.processedCount} / {autoProgress.totalCount}
                </span>
                <span className="text-sm font-medium text-gray-700">
                  {Math.round((autoProgress.processedCount / autoProgress.totalCount) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(autoProgress.processedCount / autoProgress.totalCount) * 100}%` }}
                />
              </div>
            </div>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <div className="flex items-center gap-2 text-green-700 mb-1">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-semibold text-sm">Found</span>
                </div>
                <p className="text-2xl font-bold text-green-900">
                  {autoProgress.foundCount}
                </p>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-red-200">
                <div className="flex items-center gap-2 text-red-700 mb-1">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-semibold text-sm">Not Found</span>
                </div>
                <p className="text-2xl font-bold text-red-900">
                  {autoProgress.notFoundCount}
                </p>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <div className="flex items-center gap-2 text-blue-700 mb-1">
                  <Clock className="w-5 h-5" />
                  <span className="font-semibold text-sm">Remaining</span>
                </div>
                <p className="text-2xl font-bold text-blue-900">
                  {autoProgress.totalCount - autoProgress.processedCount}
                </p>
              </div>
            </div>
            
            {autoPaused && (
              <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4 mt-4">
                <p className="text-yellow-900 font-medium flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Auto-processor is paused. Click "Resume" to continue or "Stop" to end.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Auto-Scrape Progress */}
      {autoScraping && (
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg shadow-lg border-2 border-purple-300 p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <RefreshCw className={`w-6 h-6 text-purple-600 ${!autoScrapePaused ? 'animate-spin' : ''}`} />
            🤖 Auto-Scrape All {autoScrapePaused ? '(Paused)' : 'Running...'}
          </h3>
          
          <div className="space-y-4">
            {/* Batch Progress */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Batch Progress: {autoScrapeProgress.currentBatch} / {autoScrapeProgress.totalBatches}
                </span>
                <span className="text-sm font-medium text-gray-700">
                  {autoScrapeProgress.totalBatches > 0 ? Math.round((autoScrapeProgress.currentBatch / autoScrapeProgress.totalBatches) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-4 rounded-full transition-all duration-500"
                  style={{ width: `${autoScrapeProgress.totalBatches > 0 ? (autoScrapeProgress.currentBatch / autoScrapeProgress.totalBatches) * 100 : 0}%` }}
                />
              </div>
            </div>
            
            {/* Village Progress */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Villages Processed: {autoScrapeProgress.processedCount} / {autoScrapeProgress.totalCount}
                </span>
                <span className="text-sm font-medium text-gray-700">
                  {autoScrapeProgress.totalCount > 0 ? Math.round((autoScrapeProgress.processedCount / autoScrapeProgress.totalCount) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${autoScrapeProgress.totalCount > 0 ? (autoScrapeProgress.processedCount / autoScrapeProgress.totalCount) * 100 : 0}%` }}
                />
              </div>
            </div>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <div className="flex items-center gap-2 text-green-700 mb-1">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-semibold text-sm">Success</span>
                </div>
                <p className="text-2xl font-bold text-green-900">
                  {autoScrapeProgress.successCount}
                </p>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-red-200">
                <div className="flex items-center gap-2 text-red-700 mb-1">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-semibold text-sm">Errors</span>
                </div>
                <p className="text-2xl font-bold text-red-900">
                  {autoScrapeProgress.errorCount}
                </p>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <div className="flex items-center gap-2 text-blue-700 mb-1">
                  <Clock className="w-5 h-5" />
                  <span className="font-semibold text-sm">Remaining</span>
                </div>
                <p className="text-2xl font-bold text-blue-900">
                  {autoScrapeProgress.totalCount - autoScrapeProgress.processedCount}
                </p>
              </div>
            </div>
            
            {autoScrapePaused && (
              <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4 mt-4">
                <p className="text-yellow-900 font-medium flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Auto-scrape is paused. Click "Resume" to continue or "Stop" to end.
                </p>
              </div>
            )}
            
            <div className="bg-blue-100 border border-blue-300 rounded-lg p-4 mt-4">
              <p className="text-blue-900 text-sm">
                ℹ️ <strong>Info:</strong> Each batch of 5 villages is automatically saved to the database after scraping completes. 
                Your progress is safe and you can pause/stop at any time.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Website Finder Results */}
      {websiteFinderResults.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Globe className="w-6 h-6 text-purple-600" />
            Website Search Results
          </h3>
          
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-700 mb-1">
                <CheckCircle className="w-5 h-5" />
                <span className="font-semibold">Validated</span>
              </div>
              <p className="text-2xl font-bold text-green-900">
                {websiteFinderResults.filter(r => r.status === 'found').length}
              </p>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-orange-700 mb-1">
                <AlertCircle className="w-5 h-5" />
                <span className="font-semibold">Rejected</span>
              </div>
              <p className="text-2xl font-bold text-orange-900">
                {websiteFinderResults.filter(r => r.status === 'validation_failed').length}
              </p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-700 mb-1">
                <AlertCircle className="w-5 h-5" />
                <span className="font-semibold">Not Found</span>
              </div>
              <p className="text-2xl font-bold text-red-900">
                {websiteFinderResults.filter(r => r.status === 'not_found' || r.status === 'error').length}
              </p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-blue-700 mb-1">
                <Globe className="w-5 h-5" />
                <span className="font-semibold">Total</span>
              </div>
              <p className="text-2xl font-bold text-blue-900">
                {websiteFinderResults.length}
              </p>
            </div>
          </div>

          <div className="border border-gray-300 rounded-lg max-h-96 overflow-y-auto mb-4">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Status</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Village</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Location</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Website / Validation</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(websiteFinderResults || []).map((result) => (
                  <tr key={result.villageId} className={result.status === 'validation_failed' ? 'bg-orange-50' : ''}>
                    <td className="px-4 py-2">
                      {result.status === 'found' && (
                        <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                          <CheckCircle className="w-4 h-4" /> Validated {result.confidence && `(${result.confidence}%)`}
                        </span>
                      )}
                      {result.status === 'validation_failed' && (
                        <span className="flex items-center gap-1 text-orange-600 text-sm font-medium">
                          <AlertCircle className="w-4 h-4" /> Rejected
                        </span>
                      )}
                      {result.status === 'not_found' && (
                        <span className="flex items-center gap-1 text-gray-600 text-sm">
                          <AlertCircle className="w-4 h-4" /> Not Found
                        </span>
                      )}
                      {result.status === 'error' && (
                        <span className="flex items-center gap-1 text-red-600 text-sm">
                          <AlertCircle className="w-4 h-4" /> Error
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-sm font-medium text-gray-900">
                      {result.villageName}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-600">
                      {result.suburb}, {result.state}
                    </td>
                    <td className="px-4 py-2 text-sm">
                      {result.status === 'found' && result.website ? (
                        <div className="flex flex-col gap-1">
                          <a 
                            href={result.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline break-all"
                          >
                            {result.website}
                          </a>
                          {result.websiteType === 'pattern' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded w-fit">
                              🎯 URL Pattern Match
                            </span>
                          )}
                          {result.websiteType === 'official' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded w-fit">
                              ✓ Official Website
                            </span>
                          )}
                          {result.validationReasons && result.validationReasons.length > 0 && (
                            <div className="text-xs text-gray-600 mt-1">
                              {result.validationReasons.map((reason, idx) => (
                                <div key={idx}>{reason}</div>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : result.status === 'validation_failed' && result.rejectedUrl ? (
                        <div className="flex flex-col gap-1">
                          <div className="text-orange-700 font-medium">URL Rejected:</div>
                          <a 
                            href={result.rejectedUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-gray-600 hover:underline break-all line-through"
                          >
                            {result.rejectedUrl}
                          </a>
                          {result.validationWarnings && result.validationWarnings.length > 0 && (
                            <div className="text-xs text-orange-700 mt-1">
                              {result.validationWarnings.slice(0, 3).map((warning, idx) => (
                                <div key={idx}>{warning}</div>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">{result.error || 'No website found'}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            onClick={saveWebsiteUrls}
            disabled={websiteFinderResults.filter(r => r.status === 'found').length === 0}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
          >
            <CheckCircle className="w-5 h-5" />
            Save Website URLs to Database ({websiteFinderResults.filter(r => r.status === 'found').length} found)
          </button>
        </div>
      )}

      {/* Progress & Results */}
      {(scraping || scrapedData.length > 0) && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-bold mb-4">Scraping Progress</h3>

          {/* Progress Bar */}
          {scraping && (
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progress: {progress.current} / {progress.total}</span>
                <span>{Math.round((progress.current / progress.total) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-blue-500 h-4 rounded-full transition-all duration-300"
                  style={{ width: `${(progress.current / progress.total) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-700 mb-1">
                <CheckCircle className="w-5 h-5" />
                <span className="font-semibold">Success</span>
              </div>
              <p className="text-2xl font-bold text-green-900">{successCount}</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-700 mb-1">
                <AlertCircle className="w-5 h-5" />
                <span className="font-semibold">Errors</span>
              </div>
              <p className="text-2xl font-bold text-red-900">{errorCount}</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-blue-700 mb-1">
                <Clock className="w-5 h-5" />
                <span className="font-semibold">Pending</span>
              </div>
              <p className="text-2xl font-bold text-blue-900">
                {scrapedData.filter(d => d.status === 'pending' || d.status === 'scraping').length}
              </p>
            </div>
          </div>

          {/* Results Table */}
          <div className="border border-gray-300 rounded-lg max-h-96 overflow-y-auto mb-4">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Status</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Village</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Fields Found</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Details</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(scrapedData || []).map((result) => (
                  <tr key={result.villageId}>
                    <td className="px-4 py-2">
                      {result.status === 'pending' && (
                        <span className="flex items-center gap-1 text-gray-500 text-sm">
                          <Clock className="w-4 h-4" /> Pending
                        </span>
                      )}
                      {result.status === 'scraping' && (
                        <span className="flex items-center gap-1 text-blue-600 text-sm">
                          <RefreshCw className="w-4 h-4 animate-spin" /> Scraping...
                        </span>
                      )}
                      {result.status === 'success' && (
                        <span className="flex items-center gap-1 text-green-600 text-sm">
                          <CheckCircle className="w-4 h-4" /> Success
                        </span>
                      )}
                      {result.status === 'error' && (
                        <span className="flex items-center gap-1 text-red-600 text-sm">
                          <AlertCircle className="w-4 h-4" /> Error
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-sm font-medium text-gray-900">
                      {result.villageName}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-600">
                      {result.status === 'success' ? (
                        <span>{result.fieldsFound} / {result.totalFields}</span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-4 py-2 text-xs text-gray-500">
                      {result.status === 'success' && (
                        <div className="space-y-1">
                          {Object.keys(result.tier1).length > 0 && (
                            <div className="text-green-600">Tier 1: {Object.keys(result.tier1).length} fields</div>
                          )}
                          {Object.keys(result.tier2).length > 0 && (
                            <div className="text-blue-600">Tier 2: {Object.keys(result.tier2).length} fields</div>
                          )}
                          {Object.keys(result.tier3).length > 0 && (
                            <div className="text-purple-600">Tier 3: {Object.keys(result.tier3).length} fields</div>
                          )}
                        </div>
                      )}
                      {result.status === 'error' && (
                        <div className="text-red-600">{result.error}</div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Action Buttons */}
          {!scraping && (
            <div className="flex gap-3">
              <button
                onClick={saveResults}
                disabled={successCount === 0}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
              >
                <CheckCircle className="w-5 h-5" />
                Save Results to Database ({successCount} villages)
              </button>
              <button
                onClick={exportResults}
                className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium"
              >
                <Download className="w-5 h-5" />
                Export CSV
              </button>
              <button
                onClick={retryFailed}
                disabled={errorCount === 0}
                className="flex items-center gap-2 px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
              >
                <RefreshCw className="w-5 h-5" />
                Retry Failed ({errorCount} villages)
              </button>
              <button
                onClick={retryFailedVillages}
                disabled={errorCount === 0}
                className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
                title="Clears failed villages from processed list so they can be scraped in new batches"
              >
                <RefreshCw className="w-5 h-5" />
                Clear Failed from List
              </button>
              {/* Email Operators button disabled until launch */}
              {/* <button
                onClick={emailOperators}
                disabled={errorCount === 0}
                className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
              >
                <Mail className="w-5 h-5" />
                Email Operators ({errorCount} villages)
              </button> */}
            </div>
          )}
        </div>
      )}
    </div>
  );
}