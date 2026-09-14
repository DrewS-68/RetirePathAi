import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { 
  Globe, 
  Search, 
  CheckCircle, 
  XCircle, 
  Loader, 
  AlertCircle,
  Play,
  Eye,
  Check,
  X,
  RefreshCw,
  Download,
  Edit,
  Save,
  PencilLine
} from 'lucide-react';

interface ScrapedData {
  source: string;
  scraped_at: string;
  scraped_from: string;
  scraped_entry_price_min?: number;
  scraped_entry_price_max?: number;
  scraped_contact_phone?: string;
  scraped_amenities?: string[];
  scraped_pet_friendly?: boolean;
  scraped_images?: string[];
}

interface Village {
  id: string;
  name: string;
  operator: string | null;
  suburb: string;
  state: string;
  website: string | null;
  scraped_data: ScrapedData | null;
  entry_price_min: number | null;
  entry_price_max: number | null;
  contact_phone: string | null;
  amenities: string[];
  pet_friendly: boolean;
  images: string[];
}

export function DataEnrichmentDashboard() {
  const { accessToken, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [scraping, setScraping] = useState(false);
  const [selectedState, setSelectedState] = useState('VIC');
  const [scrapeResults, setScrapeResults] = useState<any>(null);
  const [villagesForReview, setVillagesForReview] = useState<Village[]>([]);
  const [selectedVillage, setSelectedVillage] = useState<Village | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showSetupNotice, setShowSetupNotice] = useState(true);
  const [autoSetupLoading, setAutoSetupLoading] = useState(false);
  const [duplicates, setDuplicates] = useState<any[]>([]);
  const [duplicatesLoading, setDuplicatesLoading] = useState(false);
  const [showDuplicatesModal, setShowDuplicatesModal] = useState(false);
  const [multiLocationOperators, setMultiLocationOperators] = useState<any[]>([]);
  const [multiLocationLoading, setMultiLocationLoading] = useState(false);
  const [showMultiLocationModal, setShowMultiLocationModal] = useState(false);
  const [websiteValidation, setWebsiteValidation] = useState<any>(null);
  const [validationLoading, setValidationLoading] = useState(false);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [editingWebsiteFor, setEditingWebsiteFor] = useState<string | null>(null);
  const [newWebsiteUrl, setNewWebsiteUrl] = useState('');
  const [showManualEntryModal, setShowManualEntryModal] = useState(false);
  const [manualEntryVillage, setManualEntryVillage] = useState<Village | null>(null);
  const [manualEntryData, setManualEntryData] = useState({
    entry_price_min: '',
    entry_price_max: '',
    contact_phone: '',
    amenities: '',
    pet_friendly: false,
    images: ''
  });
  const [batchScraping, setBatchScraping] = useState(false);
  const [batchProgress, setBatchProgress] = useState<{
    currentState: string;
    processedStates: number;
    totalStates: number;
    overallStats: any;
  } | null>(null);
  const [filterState, setFilterState] = useState<string>('VIC');
  const [stateCounts, setStateCounts] = useState<{[key: string]: number}>({});

  useEffect(() => {
    loadVillagesForReview();
  }, [filterState]); // Reload when filter changes

  const tryAutoSetup = async () => {
    try {
      setAutoSetupLoading(true);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/admin/setup-scraped-data-column`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        alert('✅ Database setup complete! The scraped_data column has been added automatically.');
        setShowSetupNotice(false);
      } else if (data.manual) {
        alert(`⚠️ Automatic setup not available.\n\n${data.message}\n\nPlease follow the manual instructions below.`);
      } else {
        throw new Error(data.error || 'Setup failed');
      }
    } catch (error) {
      console.error('Error during auto-setup:', error);
      alert(`❌ Auto-setup failed: ${error.message}\n\nPlease use the manual setup instructions below.`);
    } finally {
      setAutoSetupLoading(false);
    }
  };

  const loadVillagesForReview = async () => {
    try {
      setLoading(true);
      
      // Build URL with optional state filter
      const url = new URL(`https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/data-enrichment/villages-with-scraped-data`);
      console.log('🔍 [DEBUG] URL before filter:', url.toString());
      console.log('🔍 [DEBUG] filterState value:', filterState);
      console.log('🔍 [DEBUG] filterState type:', typeof filterState);
      console.log('🔍 [DEBUG] filterState === "ALL"?', filterState === 'ALL');
      console.log('🔍 [DEBUG] filterState !== "ALL"?', filterState !== 'ALL');
      
      if (filterState && filterState !== 'ALL') {
        console.log('🔍 [DEBUG] INSIDE IF - Adding state parameter:', filterState);
        url.searchParams.append('state', filterState);
        console.log('🔍 [DEBUG] URL after append:', url.toString());
        console.log('🔍 [DEBUG] searchParams.get("state"):', url.searchParams.get('state'));
      } else {
        console.log('🔍 [DEBUG] SKIPPED - filterState is:', filterState);
      }
      
      console.log('🔍 Loading villages with filter:', filterState, 'URL:', url.toString());
      
      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'apikey': publicAnonKey,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load villages for review');
      }

      const data = await response.json();
      console.log('📊 Backend response:', {
        totalReceived: data.villages?.length,
        filteredBy: data.filteredBy,
        stateCounts: data.stateCounts
      });
      
      setVillagesForReview(data.villages || []);
      
      // Store state counts if provided
      if (data.stateCounts) {
        setStateCounts(data.stateCounts);
      }
    } catch (error) {
      console.error('Error loading villages for review:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrapeVillageData = async () => {
    try {
      setScraping(true);
      setScrapeResults(null);
      
      // Debug: Check if accessToken exists
      if (!accessToken) {
        alert('❌ You are not logged in. Please log in first and make sure you have admin access.');
        console.error('No access token available');
        setScraping(false);
        return;
      }
      
      console.log('🔑 Sending scrape request with auth token...');
      console.log('📋 Request details:', {
        url: `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/data-enrichment/scrape-village-data`,
        hasToken: !!accessToken,
        tokenPreview: accessToken ? `${accessToken.substring(0, 20)}...` : 'none',
        state: selectedState
      });
      
      // Create an AbortController with a 5 minute timeout for long-running scraping operations
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minutes
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/data-enrichment/scrape-village-data`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'apikey': publicAnonKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ state: selectedState }),
          signal: controller.signal, // Add abort signal
        }
      );
      
      clearTimeout(timeoutId); // Clear the timeout if request completes

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.error || 'Failed to scrape village data';
        const details = data.details || data.note || '';
        throw new Error(`${errorMsg}${details ? '\n\n' + details : ''}`);
      }

      // ============================
      // 🔥 TEST MESSAGE LOGGING 🔥
      // ============================
      if (data.testMessage) {
        console.log(`%c${data.testMessage}`, 'background: #ff0000; color: #ffffff; font-size: 20px; padding: 10px; font-weight: bold;');
        console.log(`%cBackend Version: ${data.backendVersion}`, 'background: #00ff00; color: #000000; font-size: 16px; padding: 5px; font-weight: bold;');
      }

      setScrapeResults(data);
      
      // Reload villages for review
      await loadVillagesForReview();
    } catch (error) {
      console.error('Error scraping village data:', error);
      
      // Handle timeout errors specifically
      if (error.name === 'AbortError') {
        alert(`⏱️ Request timeout:\n\nThe scraping operation took longer than 5 minutes and was cancelled.\n\nThis usually means there are too many villages to scrape at once.\n\nTry scraping a smaller batch or check the backend logs for partial results.`);
      } else {
        alert(`❌ Error scraping village data:\n\n${error.message}\n\nCheck browser console (F12) for full details.`);
      }
    } finally {
      setScraping(false);
    }
  };

  // NEW: Scrape a single village for testing
  const scrapeSingleVillage = async (villageId: string) => {
    try {
      setScraping(true);
      
      if (!accessToken) {
        alert('❌ You are not logged in. Please log in first and make sure you have admin access.');
        console.error('No access token available');
        setScraping(false);
        return;
      }
      
      console.log(`🔍 Scraping single village: ${villageId}...`);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/data-enrichment/scrape-village-data`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'apikey': publicAnonKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ villageIds: [villageId], forceRescrape: true }), // Single village - force rescrape
        }
      );

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.error || 'Failed to scrape village';
        throw new Error(errorMsg);
      }

      console.log('✅ Single village scrape results:', data);
      
      // ============================
      // 🔥 TEST MESSAGE LOGGING 🔥
      // ============================
      if (data.testMessage) {
        console.log(`%c${data.testMessage}`, 'background: #ff0000; color: #ffffff; font-size: 20px; padding: 10px; font-weight: bold;');
        console.log(`%cBackend Version: ${data.backendVersion}`, 'background: #00ff00; color: #000000; font-size: 16px; padding: 5px; font-weight: bold;');
      }
      
      const noData = data.summary?.noData || 0;
      const message = `✅ Scraping complete!\n\n${data.summary?.success || 0} succeeded\n${data.summary?.failed || 0} failed\n${noData} no data\n\nCheck Console (F12) for debug logs!${noData > 0 ? '\n\n💡 TIP: If no data was found, the website might be:\n• A corporate homepage (not village-specific)\n• JavaScript-heavy (content loads dynamically)\n• Missing the expected data\n\nSOLUTIONS:\n1. Click Edit icon to enter the village-specific page URL\n2. Click "Manual" button to enter data manually' : ''}`;
      
      alert(message);
      
      // Reload villages for review
      await loadVillagesForReview();
    } catch (error) {
      console.error('Error scraping single village:', error);
      alert(`❌ Error: ${error.message}`);
    } finally {
      setScraping(false);
    }
  };

  // NEW: Batch scrape ALL villages across ALL states
  const batchScrapeAllVillages = async () => {
    if (!confirm('🚀 START BATCH SCRAPING?\n\nThis will scrape ALL 1,797 remaining villages across all states.\n\nThis process will run continuously until all villages are processed.\n\nClick OK to start.')) {
      return;
    }

    try {
      setBatchScraping(true);
      setBatchProgress(null);
      
      if (!accessToken) {
        alert('❌ You are not logged in. Please log in first and make sure you have admin access.');
        console.error('No access token available');
        setBatchScraping(false);
        return;
      }

      const states = ['VIC', 'NT', 'NSW', 'QLD', 'WA', 'SA', 'TAS', 'ACT'];
      const overallStats = {
        total: 0,
        success: 0,
        failed: 0,
        skipped: 0,
        noData: 0
      };

      console.log('🔥🔥🔥 STARTING BATCH SCRAPING FOR ALL STATES 🔥🔥🔥');

      for (let i = 0; i < states.length; i++) {
        const state = states[i];
        let hasMore = true;
        let stateAttempts = 0;
        const maxStateAttempts = 500; // Safety limit per state

        console.log(`\n${'='.repeat(60)}`);
        console.log(`📍 SCRAPING STATE: ${state} (${i + 1}/${states.length})`);
        console.log(`${'='.repeat(60)}\n`);

        while (hasMore && stateAttempts < maxStateAttempts) {
          try {
            stateAttempts++;
            
            setBatchProgress({
              currentState: state,
              processedStates: i,
              totalStates: states.length,
              overallStats: { ...overallStats }
            });

            console.log(`\n🔄 ${state} - Batch ${stateAttempts}...`);

            const response = await fetch(
              `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/data-enrichment/scrape-village-data`,
              {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${accessToken}`,
                  'apikey': publicAnonKey,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ state }),
              }
            );

            const data = await response.json();

            if (!response.ok) {
              console.error(`❌ Error scraping ${state} batch ${stateAttempts}:`, data.error);
              // Continue to next batch even if this one failed
              await new Promise(resolve => setTimeout(resolve, 2000)); // 2s delay before retry
              continue;
            }

            // ============================
            // 🔥 TEST MESSAGE LOGGING 🔥
            // ============================
            if (data.testMessage) {
              console.log(`%c${data.testMessage}`, 'background: #ff0000; color: #ffffff; font-size: 20px; padding: 10px; font-weight: bold;');
              console.log(`%cBackend Version: ${data.backendVersion}`, 'background: #00ff00; color: #000000; font-size: 16px; padding: 5px; font-weight: bold;');
            }

            // Update overall stats
            overallStats.total += data.summary.total || 0;
            overallStats.success += data.summary.success || 0;
            overallStats.failed += data.summary.failed || 0;
            overallStats.skipped += data.summary.skipped || 0;
            overallStats.noData += data.summary.noData || 0;

            console.log(`✅ Batch ${stateAttempts} complete:`, data.summary);
            console.log(`📊 Overall: ${overallStats.success} success, ${overallStats.skipped} skipped, ${overallStats.failed} failed, ${overallStats.noData} no data`);

            // If no villages were scraped, we're done with this state
            if (data.summary.total === 0) {
              console.log(`✅ ${state} complete - no more villages to scrape`);
              hasMore = false;
            }

            // Small delay between batches to avoid overwhelming the server
            await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay

          } catch (error) {
            console.error(`❌ Error in ${state} batch ${stateAttempts}:`, error);
            // Continue to next attempt
            await new Promise(resolve => setTimeout(resolve, 3000)); // 3s delay on error
          }
        }

        console.log(`\n✅ STATE ${state} COMPLETE after ${stateAttempts} batches\n`);
      }

      console.log(`\n${'='.repeat(60)}`);
      console.log(`🎉 BATCH SCRAPING COMPLETE!`);
      console.log(`${'='.repeat(60)}`);
      console.log(`📊 FINAL STATS:`);
      console.log(`   Total Processed: ${overallStats.total}`);
      console.log(`   ✅ Success: ${overallStats.success}`);
      console.log(`   ⏭️  Skipped: ${overallStats.skipped}`);
      console.log(`   ❌ Failed: ${overallStats.failed}`);
      console.log(`   📭 No Data: ${overallStats.noData}`);
      console.log(`${'='.repeat(60)}\n`);

      alert(`🎉 BATCH SCRAPING COMPLETE!\n\nTotal: ${overallStats.total}\n✅ Success: ${overallStats.success}\n⏭️ Skipped: ${overallStats.skipped}\n❌ Failed: ${overallStats.failed}\n📭 No Data: ${overallStats.noData}\n\nCheck the console (F12) for detailed logs!`);

      // Reload villages for review
      await loadVillagesForReview();

    } catch (error) {
      console.error('❌ FATAL ERROR in batch scraping:', error);
      alert(`❌ Fatal error in batch scraping:\n\n${error.message}\n\nCheck browser console (F12) for details.`);
    } finally {
      setBatchScraping(false);
      setBatchProgress(null);
    }
  };

  const updateVillageWebsite = async (villageId: string, websiteUrl: string) => {
    try {
      setActionLoading(true);
      
      if (!accessToken) {
        alert('❌ You are not logged in.');
        return;
      }
      
      // Validate URL format
      try {
        new URL(websiteUrl);
      } catch (e) {
        alert('❌ Invalid URL format. Please enter a valid URL starting with http:// or https://');
        return;
      }
      
      console.log(`🔄 Updating website for village ${villageId} to: ${websiteUrl}`);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/villages/admin/${villageId}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'apikey': publicAnonKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ website: websiteUrl }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update website');
      }

      console.log('✅ Website updated successfully');
      alert('✅ Website URL updated! You can now scrape this village.');
      
      // Reload villages for review
      await loadVillagesForReview();
      
      // Clear editing state
      setEditingWebsiteFor(null);
      setNewWebsiteUrl('');
    } catch (error) {
      console.error('Error updating website:', error);
      alert(`❌ Error updating website:\\n\\n${error.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const saveManualEntry = async () => {
    try {
      if (!manualEntryVillage) return;
      
      setActionLoading(true);
      
      // Parse amenities from comma-separated string
      const amenitiesArray = manualEntryData.amenities
        ? manualEntryData.amenities.split(',').map(a => a.trim()).filter(a => a)
        : [];
      
      // Parse images from comma-separated URLs
      const imagesArray = manualEntryData.images
        ? manualEntryData.images.split(',').map(i => i.trim()).filter(i => i)
        : [];
      
      // Build scraped_data object
      const scrapedData: any = {
        source: 'manual_entry',
        scraped_at: new Date().toISOString(),
        scraped_from: manualEntryVillage.website || 'manual_entry'
      };
      
      if (manualEntryData.entry_price_min) {
        scrapedData.scraped_entry_price_min = parseFloat(manualEntryData.entry_price_min);
      }
      if (manualEntryData.entry_price_max) {
        scrapedData.scraped_entry_price_max = parseFloat(manualEntryData.entry_price_max);
      }
      if (manualEntryData.contact_phone) {
        scrapedData.scraped_contact_phone = manualEntryData.contact_phone;
      }
      if (amenitiesArray.length > 0) {
        scrapedData.scraped_amenities = amenitiesArray;
      }
      if (manualEntryData.pet_friendly) {
        scrapedData.scraped_pet_friendly = true;
      }
      if (imagesArray.length > 0) {
        scrapedData.scraped_images = imagesArray;
      }
      
      // Save to database
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/villages/admin/${manualEntryVillage.id}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'apikey': publicAnonKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ scraped_data: scrapedData }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save manual entry');
      }

      console.log('✅ Manual entry saved successfully');
      alert('✅ Manual data saved! The village is now pending review.');
      
      // Reload villages for review
      await loadVillagesForReview();
      
      // Clear and close modal
      setShowManualEntryModal(false);
      setManualEntryVillage(null);
      setManualEntryData({
        entry_price_min: '',
        entry_price_max: '',
        contact_phone: '',
        amenities: '',
        pet_friendly: false,
        images: ''
      });
    } catch (error) {
      console.error('Error saving manual entry:', error);
      alert(`❌ Error saving manual entry:\n\n${error.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const approveScrapedData = async (villageId: string, fieldsToApprove?: string[]) => {
    try {
      setActionLoading(true);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/data-enrichment/approve-scraped-data/${villageId}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'apikey': publicAnonKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ fieldsToApprove }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to approve scraped data');
      }

      await loadVillagesForReview();
      setShowReviewModal(false);
      setSelectedVillage(null);
    } catch (error) {
      console.error('Error approving scraped data:', error);
      alert('Error approving scraped data. Check console for details.');
    } finally {
      setActionLoading(false);
    }
  };

  const rejectScrapedData = async (villageId: string) => {
    try {
      setActionLoading(true);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/data-enrichment/reject-scraped-data/${villageId}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'apikey': publicAnonKey,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to reject scraped data');
      }

      await loadVillagesForReview();
      setShowReviewModal(false);
      setSelectedVillage(null);
    } catch (error) {
      console.error('Error rejecting scraped data:', error);
      alert('Error rejecting scraped data. Check console for details.');
    } finally {
      setActionLoading(false);
    }
  };

  const approveAllScrapedData = async () => {
    // Confirmation dialog
    const confirmMsg = `⚠️ BULK APPROVE ALL SCRAPED DATA\n\n` +
      `This will approve and merge scraped data for ${villagesForReview.length} villages.\n\n` +
      `• Amenities will be MERGED (existing + new)\n` +
      `• Pricing and phone numbers will be ADDED if missing\n` +
      `• This action cannot be undone\n\n` +
      `Are you sure you want to continue?`;
    
    if (!confirm(confirmMsg)) {
      return;
    }

    try {
      setActionLoading(true);
      
      console.log('🔍 Bulk approving villages with state filter:', filterState);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/data-enrichment/approve-all-scraped-data`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'apikey': publicAnonKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            state: filterState && filterState !== 'ALL' ? filterState : undefined
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to approve all scraped data');
      }

      // Show results
      const resultMsg = `✅ BULK APPROVAL COMPLETE!\n\n` +
        `Total: ${data.results.total}\n` +
        `Successful: ${data.results.successful}\n` +
        `Failed: ${data.results.failed}\n` +
        (data.results.errors.length > 0 ? `\nErrors:\n${data.results.errors.map(e => `• ${e.villageName}: ${e.error}`).join('\n')}` : '');
      
      alert(resultMsg);
      
      await loadVillagesForReview();
    } catch (error) {
      console.error('Error bulk approving scraped data:', error);
      alert(`❌ Error bulk approving scraped data:\n\n${error.message}\n\nCheck console for details.`);
    } finally {
      setActionLoading(false);
    }
  };

  const findDuplicates = async () => {
    try {
      setDuplicatesLoading(true);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/data-enrichment/find-duplicates`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'apikey': publicAnonKey,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to find duplicates');
      }

      const data = await response.json();
      setDuplicates(data.duplicates || []);
    } catch (error) {
      console.error('Error finding duplicates:', error);
      alert(`❌ Error finding duplicates:\n\n${error.message}\n\nCheck console for details.`);
    } finally {
      setDuplicatesLoading(false);
    }
  };

  const findMultiLocationOperators = async () => {
    try {
      setMultiLocationLoading(true);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/data-enrichment/multi-location-analysis`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'apikey': publicAnonKey,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to find multi-location operators');
      }

      const data = await response.json();
      setMultiLocationOperators(data.operators || []);
    } catch (error) {
      console.error('Error finding multi-location operators:', error);
      alert(`❌ Error finding multi-location operators:\n\n${error.message}\n\nCheck console for details.`);
    } finally {
      setMultiLocationLoading(false);
    }
  };

  const validateWebsites = async () => {
    try {
      setValidationLoading(true);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/data-enrichment/validate-websites`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'apikey': publicAnonKey,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to validate websites');
      }

      const data = await response.json();
      setWebsiteValidation(data.validation || []);
    } catch (error) {
      console.error('Error validating websites:', error);
      alert(`❌ Error validating websites:\n\n${error.message}\n\nCheck console for details.`);
    } finally {
      setValidationLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl mb-2">Data Enrichment System</h2>
        <p className="text-gray-600">
          Automatically discover village websites and scrape missing data (pricing, amenities, contact info)
        </p>
        
        {/* Auth Status Indicator */}
        {!accessToken && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg inline-flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span className="text-sm text-red-800">
              ⚠️ Not logged in - Please sign in to use this feature
            </span>
          </div>
        )}
        {accessToken && user && (
          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg inline-flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-800">
              ✓ Logged in as {user.email}
            </span>
          </div>
        )}
      </div>

      {/* Database Setup Notice */}
      {showSetupNotice && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <h3 className="text-lg text-yellow-900">⚠️ Database Setup Required</h3>
              </div>
              <p className="text-sm text-yellow-800 mb-4">
                Before using the Data Enrichment System, you need to add the <code className="bg-yellow-100 px-2 py-1 rounded">scraped_data</code> column to your database.
              </p>
              
              <div className="bg-white rounded border border-yellow-200 p-4 mb-4">
                <p className="text-sm mb-2">Click the SQL below to select it, then copy (Ctrl+C or Cmd+C):</p>
                <textarea
                  readOnly
                  value="ALTER TABLE retirement_villages ADD COLUMN IF NOT EXISTS scraped_data JSONB;"
                  onClick={(e) => e.currentTarget.select()}
                  className="w-full text-sm bg-gray-900 text-green-400 p-3 rounded font-mono resize-none"
                  rows={2}
                  style={{ cursor: 'text' }}
                />
                <p className="text-xs text-gray-600 mt-2">
                  💡 <strong>Tip:</strong> Click the box above, it will auto-select. Then Ctrl+C (Windows) or Cmd+C (Mac) to copy.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-4">
                <p className="text-sm mb-3">
                  <strong>Step-by-step:</strong>
                </p>
                <ol className="text-sm space-y-2 ml-4" style={{ listStyle: 'decimal' }}>
                  <li>Click the SQL box above to select all text</li>
                  <li>Press <kbd className="px-2 py-1 bg-white border rounded text-xs">Ctrl+C</kbd> (Windows) or <kbd className="px-2 py-1 bg-white border rounded text-xs">⌘+C</kbd> (Mac)</li>
                  <li>Click the green button below to open Supabase SQL Editor</li>
                  <li>Paste the SQL and click "Run"</li>
                  <li>Come back here and click "I've completed setup"</li>
                </ol>
              </div>

              <div className="flex items-center gap-3">
                <a
                  href="https://supabase.com/dashboard/project/_/sql/new"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                >
                  Open Supabase SQL Editor
                  <Globe className="w-4 h-4" />
                </a>
                <button
                  onClick={() => setShowSetupNotice(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                >
                  I've completed setup ✓
                </button>
              </div>
            </div>
            <button
              onClick={() => setShowSetupNotice(false)}
              className="text-yellow-600 hover:text-yellow-800 ml-4"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* State Selector & Actions */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center gap-4 mb-4">
          <div>
            <label className="block text-sm mb-2">Select State to Enrich:</label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="border rounded px-4 py-2"
              disabled={scraping}
            >
              <option value="VIC">Victoria (VIC)</option>
              <option value="NT">Northern Territory (NT)</option>
              <option value="NSW">New South Wales (NSW)</option>
              <option value="QLD">Queensland (QLD)</option>
              <option value="WA">Western Australia (WA)</option>
              <option value="SA">South Australia (SA)</option>
              <option value="TAS">Tasmania (TAS)</option>
              <option value="ACT">Australian Capital Territory (ACT)</option>
            </select>
          </div>
        </div>

        {/* Batch Scrape ALL Villages */}
        <div className="mb-6 p-4 border-2 border-purple-300 bg-purple-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="w-6 h-6 text-purple-600" />
              <div>
                <h3 className="text-lg font-semibold text-purple-900">🚀 Batch Scrape ALL Villages</h3>
                <p className="text-sm text-purple-700">
                  Automatically scrape all 1,797 remaining villages across all states
                </p>
              </div>
            </div>
            <button
              onClick={batchScrapeAllVillages}
              disabled={batchScraping || scraping}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center gap-2"
            >
              {batchScraping ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Scraping...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  START BATCH SCRAPE
                </>
              )}
            </button>
          </div>
          
          {/* Batch Progress */}
          {batchProgress && (
            <div className="mt-4 p-3 bg-white rounded border border-purple-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-purple-900">
                  Current State: <strong>{batchProgress.currentState}</strong>
                </span>
                <span className="text-sm text-purple-700">
                  {batchProgress.processedStates} / {batchProgress.totalStates} states completed
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2 bg-green-50 rounded">
                  <div className="text-lg font-bold text-green-600">{batchProgress.overallStats.success}</div>
                  <div className="text-gray-600">Success</div>
                </div>
                <div className="p-2 bg-yellow-50 rounded">
                  <div className="text-lg font-bold text-yellow-600">{batchProgress.overallStats.skipped}</div>
                  <div className="text-gray-600">Skipped</div>
                </div>
                <div className="p-2 bg-red-50 rounded">
                  <div className="text-lg font-bold text-red-600">{batchProgress.overallStats.failed}</div>
                  <div className="text-gray-600">Failed</div>
                </div>
                <div className="p-2 bg-gray-50 rounded">
                  <div className="text-lg font-bold text-gray-600">{batchProgress.overallStats.noData}</div>
                  <div className="text-gray-600">No Data</div>
                </div>
              </div>
              <div className="mt-2 text-xs text-purple-600 text-center">
                ⚡ Batch scraping in progress... Check browser console (F12) for detailed logs
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Step 2: Scrape Data */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <Download className="w-5 h-5 text-green-600" />
              <div>
                <h3 className="text-sm">Step 2: Scrape Data</h3>
                <p className="text-xs text-gray-600">Extract pricing & amenities from websites</p>
              </div>
            </div>
            <button
              onClick={scrapeVillageData}
              disabled={scraping}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {scraping ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Scraping...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Scrape Village Data
                </>
              )}
            </button>
          </div>
        </div>

        {/* Scraping Results */}
        {scrapeResults && (
          <div className="mt-4 border-t pt-4">
            <h4 className="text-sm mb-2">Data Scraping Results:</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center p-3 bg-blue-50 rounded">
                <p className="text-2xl">{scrapeResults.summary.total}</p>
                <p className="text-xs text-gray-600">Total Scraped</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded">
                <p className="text-2xl text-green-600">{scrapeResults.summary.success}</p>
                <p className="text-xs text-gray-600">Successfully Scraped</p>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded">
                <p className="text-2xl text-yellow-600">{scrapeResults.summary.skipped + scrapeResults.summary.noData}</p>
                <p className="text-xs text-gray-600">Skipped/No Data</p>
              </div>
              <div className="text-center p-3 bg-red-50 rounded">
                <p className="text-2xl text-red-600">{scrapeResults.summary.failed}</p>
                <p className="text-xs text-gray-600">Failed</p>
              </div>
            </div>
            
            {/* Detailed Results List */}
            {scrapeResults.results && scrapeResults.results.length > 0 && (
              <div className="mt-4">
                <h5 className="text-xs font-medium text-gray-700 mb-2">Detailed Results:</h5>
                <div className="max-h-60 overflow-y-auto border rounded">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-3 py-2 text-left">Village</th>
                        <th className="px-3 py-2 text-left">Status</th>
                        <th className="px-3 py-2 text-left">Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scrapeResults.results.map((result: any, idx: number) => (
                        <tr key={idx} className="border-t">
                          <td className="px-3 py-2">{result.name}</td>
                          <td className="px-3 py-2">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              result.status === 'success' ? 'bg-green-100 text-green-800' :
                              result.status === 'skipped' ? 'bg-yellow-100 text-yellow-800' :
                              result.status === 'no_data' ? 'bg-gray-100 text-gray-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {result.status}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-gray-600">
                            {result.status === 'success' && `${result.fieldsFound} fields found`}
                            {result.status === 'skipped' && result.reason}
                            {result.status === 'no_data' && result.reason}
                            {(result.status === 'failed' || result.status === 'error') && result.reason}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Find & Delete Duplicates */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Search className="w-5 h-5 text-orange-600" />
            <div>
              <h3 className="text-lg">Find Duplicate Villages</h3>
              <p className="text-sm text-gray-600">
                Scan the database for villages with identical names and locations
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                findDuplicates();
                setShowDuplicatesModal(true);
              }}
              disabled={duplicatesLoading}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {duplicatesLoading ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              Scan for Duplicates
            </button>
          </div>
        </div>

        {duplicates.length > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded p-4">
            <p className="text-sm text-orange-900">
              <strong>⚠️ {duplicates.length} duplicate groups found!</strong>
              <br />
              Total duplicate villages: {duplicates.reduce((sum, d) => sum + d.count, 0)}
            </p>
          </div>
        )}
      </div>

      {/* Duplicates Modal */}
      {showDuplicatesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl mb-1">Duplicate Villages</h3>
                  <p className="text-sm text-gray-600">
                    {duplicates.length} duplicate groups found ({duplicates.reduce((sum, d) => sum + d.count, 0)} total villages)
                  </p>
                </div>
                <button
                  onClick={() => setShowDuplicatesModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {duplicatesLoading ? (
                <div className="text-center py-8">
                  <Loader className="w-8 h-8 animate-spin mx-auto mb-3 text-gray-400" />
                  <p className="text-gray-600">Scanning database...</p>
                </div>
              ) : duplicates.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                  <p className="text-gray-600">No duplicates found!</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Your database is clean - no villages with identical names and locations.
                  </p>
                </div>
              ) : (
                <>
                  {/* Bulk Actions */}
                  <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-sm mb-2">🤖 Smart Bulk Delete</h4>
                        <p className="text-xs text-gray-600 mb-2">
                          Automatically keeps the BEST village from each duplicate group and deletes the rest.
                        </p>
                        <p className="text-xs text-gray-600">
                          <strong>Selection criteria:</strong> Verified villages, older entries (likely FOI data), complete data (website, phone, pricing, amenities)
                        </p>
                      </div>
                      <button
                        onClick={async () => {
                          const confirmMsg = `⚠️ SMART BULK DELETE ALL DUPLICATES\n\n` +
                            `This will process ${duplicates.length} duplicate groups:\n\n` +
                            `• Keeps the BEST village from each group\n` +
                            `• Deletes ${duplicates.reduce((sum, d) => sum + d.count - 1, 0)} duplicate entries\n` +
                            `• This action CANNOT be undone\n\n` +
                            `Selection criteria:\n` +
                            `  - Verified villages (FOI data)\n` +
                            `  - Older entries (more likely official)\n` +
                            `  - Complete data (website, phone, pricing)\n\n` +
                            `Are you ABSOLUTELY SURE?`;
                          
                          if (!confirm(confirmMsg)) return;
                          
                          try {
                            setDuplicatesLoading(true);
                            
                            const response = await fetch(
                              `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/data-enrichment/bulk-delete-duplicates`,
                              {
                                method: 'POST',
                                headers: {
                                  'Authorization': `Bearer ${accessToken}`,
                                  'apikey': publicAnonKey,
                                },
                              }
                            );

                            if (!response.ok) {
                              throw new Error('Failed to bulk delete duplicates');
                            }

                            const data = await response.json();
                            
                            const resultMsg = `✅ BULK DELETE COMPLETE!\n\n` +
                              `Groups Processed: ${data.results.totalGroups}\n` +
                              `Villages Kept: ${data.results.totalKept}\n` +
                              `Duplicates Deleted: ${data.results.totalDeleted}\n` +
                              (data.results.errors.length > 0 ? `\nErrors: ${data.results.errors.length}` : '');
                            
                            alert(resultMsg);
                            
                            // Refresh duplicates list
                            await findDuplicates();
                          } catch (error) {
                            console.error('Error bulk deleting duplicates:', error);
                            alert(`❌ Error bulk deleting duplicates:\n\n${error.message}`);
                          } finally {
                            setDuplicatesLoading(false);
                          }
                        }}
                        disabled={duplicatesLoading}
                        className="ml-4 px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 flex items-center gap-2 whitespace-nowrap"
                      >
                        {duplicatesLoading ? (
                          <>
                            <Loader className="w-4 h-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            Auto-Clean All ({duplicates.length} groups)
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {duplicates.map((duplicateGroup, groupIdx) => (
                      <div key={groupIdx} className="border rounded-lg p-4 bg-orange-50">
                        <h4 className="text-sm mb-3">
                          <strong>Duplicate Group #{groupIdx + 1}</strong> ({duplicateGroup.count} villages)
                          <br />
                          <span className="text-xs text-gray-600">
                            Key: {duplicateGroup.key}
                          </span>
                        </h4>
                        <div className="space-y-2">
                          {duplicateGroup.villages.map((village, villageIdx) => (
                            <div key={village.id} className="bg-white border rounded p-3 flex items-start justify-between">
                              <div className="flex-1">
                                <p className="text-sm">
                                  <strong>{village.name}</strong>
                                </p>
                                <p className="text-xs text-gray-600">
                                  📍 {village.suburb}, {village.state} {village.operator ? `• Operator: ${village.operator}` : ''}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  🆔 ID: <code className="bg-gray-100 px-1 rounded">{village.id}</code>
                                  {' • '}
                                  📅 Created: {new Date(village.created_at).toLocaleDateString()} {new Date(village.created_at).toLocaleTimeString()}
                                  {village.website && (
                                    <>
                                      {' • '}
                                      <a href={village.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                        🌐 Website
                                      </a>
                                    </>
                                  )}
                                  {village.has_scraped_data && (
                                    <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-800 rounded text-xs">
                                      📊 Has scraped data
                                    </span>
                                  )}
                                </p>
                              </div>
                              <button
                                onClick={async () => {
                                  if (confirm(`⚠️ DELETE VILLAGE?\n\nAre you sure you want to delete:\n${village.name}\n${village.suburb}, ${village.state}\n\nThis action cannot be undone!`)) {
                                    try {
                                      const response = await fetch(
                                        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/data-enrichment/delete-village/${village.id}`,
                                        {
                                          method: 'POST',
                                          headers: {
                                            'Authorization': `Bearer ${accessToken}`,
                                            'apikey': publicAnonKey,
                                          },
                                        }
                                      );

                                      if (!response.ok) {
                                        throw new Error('Failed to delete village');
                                      }

                                      alert('✅ Village deleted successfully!');
                                      // Refresh duplicates list
                                      await findDuplicates();
                                    } catch (error) {
                                      console.error('Error deleting village:', error);
                                      alert(`❌ Error deleting village:\n\n${error.message}`);
                                    }
                                  }
                                }}
                                className="ml-3 px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-1"
                              >
                                <XCircle className="w-3 h-3" />
                                Delete
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Find Multi-Location Operators */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Search className="w-5 h-5 text-orange-600" />
            <div>
              <h3 className="text-lg">Find Multi-Location Operators</h3>
              <p className="text-sm text-gray-600">
                Scan the database for operators with multiple villages
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              findMultiLocationOperators();
              setShowMultiLocationModal(true);
            }}
            disabled={multiLocationLoading}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {multiLocationLoading ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            Scan for Multi-Location Operators
          </button>
        </div>

        {multiLocationOperators.length > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded p-4">
            <p className="text-sm text-orange-900">
              <strong>⚠️ {multiLocationOperators.length} multi-location operators found!</strong>
              <br />
              Total villages: {multiLocationOperators.reduce((sum, d) => sum + d.count, 0)}
            </p>
          </div>
        )}
      </div>

      {/* Multi-Location Modal */}
      {showMultiLocationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl mb-1">Multi-Location Operators</h3>
                  <p className="text-sm text-gray-600">
                    {multiLocationOperators.length} operators found ({multiLocationOperators.reduce((sum, d) => sum + d.count, 0)} total villages)
                  </p>
                </div>
                <button
                  onClick={() => setShowMultiLocationModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {multiLocationLoading ? (
                <div className="text-center py-8">
                  <Loader className="w-8 h-8 animate-spin mx-auto mb-3 text-gray-400" />
                  <p className="text-gray-600">Scanning database...</p>
                </div>
              ) : multiLocationOperators.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                  <p className="text-gray-600">No multi-location operators found!</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Your database is clean - no operators with multiple villages.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {multiLocationOperators.map((operatorGroup, groupIdx) => (
                    <div key={groupIdx} className="border rounded-lg p-4 bg-orange-50">
                      <h4 className="text-sm mb-3">
                        <strong>Operator #{groupIdx + 1}</strong> ({operatorGroup.count} villages)
                        <br />
                        <span className="text-xs text-gray-600">
                          Name: {operatorGroup.operator}
                        </span>
                      </h4>
                      <div className="space-y-2">
                        {operatorGroup.villages.map((village, villageIdx) => (
                          <div key={village.id} className="bg-white border rounded p-3 flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-sm">
                                <strong>{village.name}</strong>
                              </p>
                              <p className="text-xs text-gray-600">
                                📍 {village.suburb}, {village.state} {village.operator ? `• Operator: ${village.operator}` : ''}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                🆔 ID: <code className="bg-gray-100 px-1 rounded">{village.id}</code>
                                {' • '}
                                📅 Created: {new Date(village.created_at).toLocaleDateString()} {new Date(village.created_at).toLocaleTimeString()}
                                {village.website && (
                                  <>
                                    {' • '}
                                    <a href={village.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                      🌐 Website
                                    </a>
                                  </>
                                )}
                                {village.has_scraped_data && (
                                  <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-800 rounded text-xs">
                                    📊 Has scraped data
                                  </span>
                                )}
                              </p>
                            </div>
                            <button
                              onClick={async () => {
                                if (confirm(`⚠️ DELETE VILLAGE?\n\nAre you sure you want to delete:\n${village.name}\n${village.suburb}, ${village.state}\n\nThis action cannot be undone!`)) {
                                  try {
                                    const response = await fetch(
                                      `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/data-enrichment/delete-village/${village.id}`,
                                      {
                                        method: 'POST',
                                        headers: {
                                          'Authorization': `Bearer ${accessToken}`,
                                          'apikey': publicAnonKey,
                                        },
                                      }
                                    );

                                    if (!response.ok) {
                                      throw new Error('Failed to delete village');
                                    }

                                    alert('✅ Village deleted successfully!');
                                    // Refresh duplicates list
                                    await findMultiLocationOperators();
                                  } catch (error) {
                                    console.error('Error deleting village:', error);
                                    alert(`❌ Error deleting village:\n\n${error.message}`);
                                  }
                                }
                              }}
                              className="ml-3 px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-1"
                            >
                              <XCircle className="w-3 h-3" />
                              Delete
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Validate Websites */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Search className="w-5 h-5 text-orange-600" />
            <div>
              <h3 className="text-lg">Validate Village Websites</h3>
              <p className="text-sm text-gray-600">
                Check the validity of village websites
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              validateWebsites();
              setShowValidationModal(true);
            }}
            disabled={validationLoading}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {validationLoading ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            Validate Websites
          </button>
        </div>

        {websiteValidation && (
          <div className="bg-orange-50 border border-orange-200 rounded p-4">
            <p className="text-sm text-orange-900">
              <strong>⚠️ Website validation results:</strong>
              <br />
              Total villages: {websiteValidation.total}
              <br />
              Valid websites: {websiteValidation.valid}
              <br />
              Invalid websites: {websiteValidation.invalid}
            </p>
          </div>
        )}
      </div>

      {/* Validation Modal */}
      {showValidationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl mb-1">Website Validation Results</h3>
                  <p className="text-sm text-gray-600">
                    {websiteValidation ? `Total villages: ${websiteValidation.total}` : 'No validation results'}
                  </p>
                </div>
                <button
                  onClick={() => setShowValidationModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {validationLoading ? (
                <div className="text-center py-8">
                  <Loader className="w-8 h-8 animate-spin mx-auto mb-3 text-gray-400" />
                  <p className="text-gray-600">Validating websites...</p>
                </div>
              ) : !websiteValidation ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                  <p className="text-gray-600">No validation results found!</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Run the validation to check the validity of village websites.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-sm mb-2">Website Validation Summary</h4>
                        <p className="text-xs text-gray-600 mb-2">
                          Total villages: {websiteValidation.total}
                        </p>
                        <p className="text-xs text-gray-600">
                          Valid websites: {websiteValidation.valid}
                        </p>
                        <p className="text-xs text-gray-600">
                          Invalid websites: {websiteValidation.invalid}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {websiteValidation.villages.map((village: any, villageIdx: number) => (
                      <div key={villageIdx} className="border rounded-lg p-4 bg-orange-50">
                        <h4 className="text-sm mb-3">
                          <strong>Village #{villageIdx + 1}</strong>
                          <br />
                          <span className="text-xs text-gray-600">
                            Name: {village.name}
                          </span>
                        </h4>
                        <div className="space-y-2">
                          <div key={village.id} className="bg-white border rounded p-3 flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-sm">
                                <strong>{village.name}</strong>
                              </p>
                              <p className="text-xs text-gray-600">
                                📍 {village.suburb}, {village.state} {village.operator ? `• Operator: ${village.operator}` : ''}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                🆔 ID: <code className="bg-gray-100 px-1 rounded">{village.id}</code>
                                {' • '}
                                📅 Created: {new Date(village.created_at).toLocaleDateString()} {new Date(village.created_at).toLocaleTimeString()}
                                {village.website && (
                                  <>
                                    {' • '}
                                    <a href={village.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                      🌐 Website
                                    </a>
                                  </>
                                )}
                                {village.has_scraped_data && (
                                  <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-800 rounded text-xs">
                                    📊 Has scraped data
                                  </span>
                                )}
                              </p>
                            </div>
                            <button
                              onClick={async () => {
                                if (confirm(`⚠️ DELETE VILLAGE?\n\nAre you sure you want to delete:\n${village.name}\n${village.suburb}, ${village.state}\n\nThis action cannot be undone!`)) {
                                  try {
                                    const response = await fetch(
                                      `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/data-enrichment/delete-village/${village.id}`,
                                      {
                                        method: 'POST',
                                        headers: {
                                          'Authorization': `Bearer ${accessToken}`,
                                          'apikey': publicAnonKey,
                                        },
                                      }
                                    );

                                    if (!response.ok) {
                                      throw new Error('Failed to delete village');
                                    }

                                    alert('✅ Village deleted successfully!');
                                    // Refresh validation results
                                    await validateWebsites();
                                  } catch (error) {
                                    console.error('Error deleting village:', error);
                                    alert(`❌ Error deleting village:\n\n${error.message}`);
                                  }
                                }
                              }}
                              className="ml-3 px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-1"
                            >
                              <XCircle className="w-3 h-3" />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Villages Pending Review */}
      <div className="bg-white p-6 rounded-lg shadow" id="data-enrichment-dashboard">
        {/* State Filter */}
        <div className="mb-4 flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <label className="text-sm font-semibold text-blue-900">Filter by State:</label>
          <select
            value={filterState}
            onChange={(e) => setFilterState(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm font-medium"
          >
            <option value="VIC">VIC {stateCounts.VIC ? `(${stateCounts.VIC})` : ''}</option>
            <option value="NSW">NSW {stateCounts.NSW ? `(${stateCounts.NSW})` : ''}</option>
            <option value="QLD">QLD {stateCounts.QLD ? `(${stateCounts.QLD})` : ''}</option>
            <option value="SA">SA {stateCounts.SA ? `(${stateCounts.SA})` : ''}</option>
            <option value="WA">WA {stateCounts.WA ? `(${stateCounts.WA})` : ''}</option>
            <option value="TAS">TAS {stateCounts.TAS ? `(${stateCounts.TAS})` : ''}</option>
            <option value="NT">NT {stateCounts.NT ? `(${stateCounts.NT})` : ''}</option>
            <option value="ACT">ACT {stateCounts.ACT ? `(${stateCounts.ACT})` : ''}</option>
            <option value="ALL">All States ({Object.values(stateCounts).reduce((a, b) => a + b, 0) || 0})</option>
          </select>
          <div className="text-xs text-blue-700 ml-2">
            {Object.keys(stateCounts).length > 0 && (
              <span>
                Total ready: {Object.entries(stateCounts).map(([state, count]) => `${state}: ${count}`).join(', ')}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Eye className="w-5 h-5 text-purple-600" />
            <div>
              <h3 className="text-lg">Step 3: Review Scraped Data</h3>
              <p className="text-sm text-gray-600">
                {villagesForReview.length} villages with scraped data pending review
                {filterState && filterState !== 'ALL' && <span className="font-semibold ml-1">({filterState})</span>}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {villagesForReview.length > 0 && (
              <button
                onClick={approveAllScrapedData}
                disabled={actionLoading}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                Approve All {filterState && filterState !== 'ALL' ? `${filterState} ` : ''}({villagesForReview.length})
              </button>
            )}
            <button
              onClick={loadVillagesForReview}
              className="flex items-center gap-2 px-3 py-2 text-sm border rounded hover:bg-gray-50"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <Loader className="w-8 h-8 animate-spin mx-auto mb-3 text-gray-400" />
            <p className="text-gray-600">Loading villages...</p>
          </div>
        ) : villagesForReview.length === 0 ? (
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-3" />
            <p className="text-gray-600 font-semibold mb-2">No villages loaded for review</p>
            <p className="text-sm text-gray-500 mb-4">
              If you've scraped villages, click the "Refresh" button above to load them,
              <br />
              or run the scraper to discover and extract data from village websites.
            </p>
            <p className="text-xs text-gray-400">
              💡 Expected: {`{villagesForReview.length}`} villages with scraped_data in JSONB field
            </p>
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 text-sm">Village Name</th>
                  <th className="text-left px-4 py-3 text-sm">Operator</th>
                  <th className="text-left px-4 py-3 text-sm">Location</th>
                  <th className="text-left px-4 py-3 text-sm">Website</th>
                  <th className="text-left px-4 py-3 text-sm">Data Found</th>
                  <th className="text-right px-4 py-3 text-sm">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {villagesForReview.map((village) => {
                  const scrapedData = village.scraped_data;
                  // Count only actual data fields, not metadata
                  const dataFields = scrapedData ? Object.keys(scrapedData).filter(k => 
                    k.startsWith('scraped_') && 
                    k !== 'scraped_at' && 
                    k !== 'scraped_from'
                  ) : [];
                  
                  return (
                    <tr key={village.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">{village.name}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className="text-gray-700 font-medium">
                          {village.operator || <span className="text-gray-400 italic">No operator</span>}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {village.suburb}, {village.state}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {editingWebsiteFor === village.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="url"
                              value={newWebsiteUrl}
                              onChange={(e) => setNewWebsiteUrl(e.target.value)}
                              placeholder="https://example.com/village-page"
                              className="px-2 py-1 text-xs border rounded flex-1 min-w-0"
                              autoFocus
                            />
                            <button
                              onClick={() => {
                                updateVillageWebsite(village.id, newWebsiteUrl);
                              }}
                              disabled={actionLoading || !newWebsiteUrl}
                              className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 flex items-center gap-1"
                            >
                              <Save className="w-3 h-3" />
                              Save
                            </button>
                            <button
                              onClick={() => {
                                setEditingWebsiteFor(null);
                                setNewWebsiteUrl('');
                              }}
                              className="px-2 py-1 text-xs border rounded hover:bg-gray-50"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            {village.website ? (
                              <a 
                                href={village.website} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline flex items-center gap-1"
                              >
                                <Globe className="w-3 h-3" />
                                Visit
                              </a>
                            ) : (
                              <span className="text-gray-400">No website</span>
                            )}
                            <button
                              onClick={() => {
                                setEditingWebsiteFor(village.id);
                                setNewWebsiteUrl(village.website || '');
                              }}
                              className="px-1.5 py-0.5 text-xs border rounded hover:bg-gray-50 flex items-center gap-1"
                              title="Edit website URL"
                            >
                              <Edit className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="space-y-1">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                            {dataFields.length} field{dataFields.length !== 1 ? 's' : ''}
                          </span>
                          {dataFields.length > 0 && (
                            <p className="text-xs text-gray-500">
                              {dataFields.map(f => f.replace('scraped_', '')).join(', ')}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-right">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => scrapeSingleVillage(village.id)}
                            disabled={scraping || !village.website}
                            className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                            title={village.website ? "Scrape this village only" : "No website available"}
                          >
                            <Play className="w-3 h-3" />
                            Scrape
                          </button>
                          <button
                            onClick={() => {
                              setManualEntryVillage(village);
                              setShowManualEntryModal(true);
                            }}
                            className="px-2 py-1 text-xs bg-orange-600 text-white rounded hover:bg-orange-700 flex items-center gap-1"
                            title="Manually enter data for JavaScript-heavy sites"
                          >
                            <PencilLine className="w-3 h-3" />
                            Manual
                          </button>
                          <button
                            onClick={() => {
                              console.log('🔍 Village scraped_data:', village.scraped_data);
                              console.log('📊 Data fields found:', dataFields);
                              console.log('📋 Field details:', {
                                amenities: village.scraped_data?.scraped_amenities,
                                images: village.scraped_data?.scraped_images,
                                phone: village.scraped_data?.scraped_contact_phone,
                                pricing: village.scraped_data?.scraped_entry_price_min || village.scraped_data?.scraped_entry_price_max,
                                petFriendly: village.scraped_data?.scraped_pet_friendly
                              });
                              setSelectedVillage(village);
                              setShowReviewModal(true);
                            }}
                            className="px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700"
                          >
                            Review
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedVillage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl mb-1">{selectedVillage.name}</h3>
                  <p className="text-sm text-gray-600">
                    {selectedVillage.suburb}, {selectedVillage.state}
                  </p>
                  {selectedVillage.website && (
                    <a 
                      href={selectedVillage.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline flex items-center gap-1 mt-1"
                    >
                      <Globe className="w-3 h-3" />
                      {selectedVillage.website}
                    </a>
                  )}
                </div>
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {selectedVillage.scraped_data && (
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded">
                    <p className="text-sm text-gray-600 mb-1">
                      Scraped from: {selectedVillage.scraped_data.scraped_from}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(selectedVillage.scraped_data.scraped_at).toLocaleString()}
                    </p>
                  </div>

                  {/* Pricing Comparison */}
                  {(selectedVillage.scraped_data.scraped_entry_price_min || selectedVillage.scraped_data.scraped_entry_price_max) && (
                    <div className="border rounded p-4">
                      <h4 className="text-sm mb-2">Entry Pricing</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Current:</p>
                          <p className="text-sm">
                            {selectedVillage.entry_price_min || selectedVillage.entry_price_max ? (
                              `$${(selectedVillage.entry_price_min || 0).toLocaleString()} - $${(selectedVillage.entry_price_max || 0).toLocaleString()}`
                            ) : (
                              <span className="text-gray-400">Not set</span>
                            )}
                          </p>
                        </div>
                        <div className="bg-green-50 p-2 rounded">
                          <p className="text-xs text-gray-600 mb-1">Scraped:</p>
                          <p className="text-sm text-green-800">
                            ${(selectedVillage.scraped_data.scraped_entry_price_min || 0).toLocaleString()} - ${(selectedVillage.scraped_data.scraped_entry_price_max || 0).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Phone Comparison */}
                  {selectedVillage.scraped_data.scraped_contact_phone && (
                    <div className="border rounded p-4">
                      <h4 className="text-sm mb-2">Contact Phone</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Current:</p>
                          <p className="text-sm">
                            {selectedVillage.contact_phone || <span className="text-gray-400">Not set</span>}
                          </p>
                        </div>
                        <div className="bg-green-50 p-2 rounded">
                          <p className="text-xs text-gray-600 mb-1">Scraped:</p>
                          <p className="text-sm text-green-800">
                            {selectedVillage.scraped_data.scraped_contact_phone}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Amenities Comparison */}
                  {selectedVillage.scraped_data.scraped_amenities && selectedVillage.scraped_data.scraped_amenities.length > 0 && (
                    <div className="border rounded p-4">
                      <h4 className="text-sm mb-2">Amenities</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Current:</p>
                          {selectedVillage.amenities && selectedVillage.amenities.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {selectedVillage.amenities.map((amenity, idx) => (
                                <span key={idx} className="text-xs px-2 py-1 bg-gray-100 rounded">
                                  {amenity}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">Not set</span>
                          )}
                        </div>
                        <div className="bg-green-50 p-2 rounded">
                          <p className="text-xs text-gray-600 mb-1">Scraped:</p>
                          <div className="flex flex-wrap gap-1">
                            {selectedVillage.scraped_data.scraped_amenities.map((amenity, idx) => (
                              <span key={idx} className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                                {amenity}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Pet Friendly */}
                  {selectedVillage.scraped_data.scraped_pet_friendly && (
                    <div className="border rounded p-4">
                      <h4 className="text-sm mb-2">Pet Friendly</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Current:</p>
                          <p className="text-sm">
                            {selectedVillage.pet_friendly ? '✅ Yes' : '❌ No'}
                          </p>
                        </div>
                        <div className="bg-green-50 p-2 rounded">
                          <p className="text-xs text-gray-600 mb-1">Scraped:</p>
                          <p className="text-sm text-green-800">
                            ✅ Yes
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Images */}
                  {selectedVillage.scraped_data.scraped_images && selectedVillage.scraped_data.scraped_images.length > 0 && (
                    <div className="border rounded p-4">
                      <h4 className="text-sm mb-2">Images ({selectedVillage.scraped_data.scraped_images.length} found)</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Current:</p>
                          {selectedVillage.images && selectedVillage.images.length > 0 ? (
                            <div className="grid grid-cols-3 gap-1">
                              {selectedVillage.images.slice(0, 3).map((img, idx) => (
                                <img 
                                  key={idx} 
                                  src={img} 
                                  alt={`Current ${idx + 1}`}
                                  className="w-full h-16 object-cover rounded border"
                                />
                              ))}
                              {selectedVillage.images.length > 3 && (
                                <div className="text-xs text-gray-600">+{selectedVillage.images.length - 3} more</div>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">No images</span>
                          )}
                        </div>
                        <div className="bg-green-50 p-2 rounded">
                          <p className="text-xs text-gray-600 mb-1">Scraped:</p>
                          <div className="grid grid-cols-3 gap-1">
                            {selectedVillage.scraped_data.scraped_images.slice(0, 6).map((img, idx) => (
                              <img 
                                key={idx} 
                                src={img} 
                                alt={`Scraped ${idx + 1}`}
                                className="w-full h-16 object-cover rounded border border-green-200"
                              />
                            ))}
                          </div>
                          <p className="text-xs text-green-700 mt-2">
                            {selectedVillage.scraped_data.scraped_images.length} image(s) will be added
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-3 mt-6 pt-6 border-t">
                <button
                  onClick={() => approveScrapedData(selectedVillage.id)}
                  disabled={actionLoading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                >
                  {actionLoading ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Approve & Merge All Data
                    </>
                  )}
                </button>
                <button
                  onClick={() => rejectScrapedData(selectedVillage.id)}
                  disabled={actionLoading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                >
                  {actionLoading ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <X className="w-4 h-4" />
                      Reject All Data
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual Entry Modal */}
      {showManualEntryModal && manualEntryVillage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-xl mb-1">Manual Data Entry</h3>
                  <p className="text-sm text-gray-600">
                    {manualEntryVillage.name} - {manualEntryVillage.suburb}, {manualEntryVillage.state}
                  </p>
                  <p className="text-xs text-orange-600 mt-2">
                    ���� Use this for JavaScript-heavy websites where auto-scraping fails
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowManualEntryModal(false);
                    setManualEntryVillage(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-1">Entry Price Min ($)</label>
                    <input
                      type="number"
                      value={manualEntryData.entry_price_min}
                      onChange={(e) => setManualEntryData({ ...manualEntryData, entry_price_min: e.target.value })}
                      placeholder="350000"
                      className="w-full px-3 py-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Entry Price Max ($)</label>
                    <input
                      type="number"
                      value={manualEntryData.entry_price_max}
                      onChange={(e) => setManualEntryData({ ...manualEntryData, entry_price_max: e.target.value })}
                      placeholder="750000"
                      className="w-full px-3 py-2 border rounded"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    value={manualEntryData.contact_phone}
                    onChange={(e) => setManualEntryData({ ...manualEntryData, contact_phone: e.target.value })}
                    placeholder="1300 123 456"
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1">Amenities (comma-separated)</label>
                  <textarea
                    value={manualEntryData.amenities}
                    onChange={(e) => setManualEntryData({ ...manualEntryData, amenities: e.target.value })}
                    placeholder="pool, gym, library, cinema, spa, cafe, garden"
                    rows={3}
                    className="w-full px-3 py-2 border rounded"
                  />
                  <p className="text-xs text-gray-500 mt-1">Enter amenities separated by commas</p>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={manualEntryData.pet_friendly}
                      onChange={(e) => setManualEntryData({ ...manualEntryData, pet_friendly: e.target.checked })}
                      className="rounded"
                    />
                    Pet Friendly
                  </label>
                </div>

                <div>
                  <label className="block text-sm mb-1">Image URLs (comma-separated)</label>
                  <textarea
                    value={manualEntryData.images}
                    onChange={(e) => setManualEntryData({ ...manualEntryData, images: e.target.value })}
                    placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                    rows={3}
                    className="w-full px-3 py-2 border rounded"
                  />
                  <p className="text-xs text-gray-500 mt-1">Enter image URLs separated by commas</p>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-6 pt-6 border-t">
                <button
                  onClick={saveManualEntry}
                  disabled={actionLoading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                >
                  {actionLoading ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Manual Entry
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowManualEntryModal(false);
                    setManualEntryVillage(null);
                  }}
                  className="px-4 py-2 border rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}