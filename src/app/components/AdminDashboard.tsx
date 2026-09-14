import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import {
  Building,
  Building2,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  MapPin,
  Shield,
  RefreshCw,
  Trash2,
  Phone,
  Mail,
  AlertCircle,
  BarChart3,
  Database,
  Download,
  Upload,
  MessageSquare,
  Star,
  Users,
  Send,
  FileText,
  Copy,
  Sparkles,
} from 'lucide-react';

import { DataQualityDashboard } from './admin/DataQualityDashboard';
import { ReviewsManager } from './admin/ReviewsManager';
import { FeaturedVillagesManager } from './admin/FeaturedVillagesManager';
import { AgentLeadsManager } from './admin/AgentLeadsManager';
import { EmailTemplates } from './admin/EmailTemplates';
import { MarketingMaterials } from './admin/MarketingMaterials';
import { VICWebsiteChecker } from './admin/VICWebsiteChecker';
import { VICDataImporter } from './admin/VICDataImporter';
import { VictorianVillagesInspector } from './admin/VictorianVillagesInspector';
import { VictorianVillagesSourceAnalyzer } from './admin/VictorianVillagesSourceAnalyzer';
import { VictorianDuplicateFinder } from './admin/VictorianDuplicateFinder';
import { VictorianSourceComparison } from './admin/VictorianSourceComparison';
import { DeleteAgedCareFacilities } from './admin/DeleteAgedCareFacilities';
import { DeleteOldVictorianVillages } from './admin/DeleteOldVictorianVillages';
import { VICOperatorsExporter } from './admin/VICOperatorsExporter';
import { VICOperatorBulkUpdate } from './admin/VICOperatorBulkUpdate';
import { VICOperatorDiagnostic } from './admin/VICOperatorDiagnostic';
import { VICOperatorAutoScraper } from './admin/VICOperatorAutoScraper';
import { VICOperatorWhitelistImporter } from './admin/VICOperatorWhitelistImporter';
import { VICOperatorWhitelistManager } from './admin/VICOperatorWhitelistManager';
import { VICVillageDeleter } from './admin/VICVillageDeleter';
import { VICDatabaseInspector } from './admin/VICDatabaseInspector';
import { VICDeleteOldWithWebsites } from './admin/VICDeleteOldWithWebsites';
import { VICOperatorTimestampCheckerSimple } from './admin/VICOperatorTimestampCheckerSimple';
import { VICVillageDiagnostic } from './admin/VICVillageDiagnostic';
import { VICVillageServerDeleter } from './admin/VICVillageServerDeleter';
import { VICCSVDuplicateChecker } from './admin/VICCSVDuplicateChecker';
import { VICVillageRealTimeCounter } from './admin/VICVillageRealTimeCounter';
import { VICOperatorFieldInspector } from './admin/VICOperatorFieldInspector';
import { VICManualOperatorSetter } from './admin/VICManualOperatorSetter';
import { VICExtractOperatorsFromDescription } from './admin/VICExtractOperatorsFromDescription';
import { VICOperatorAudit } from './admin/VICOperatorAudit';
import { VICOperatorDatabaseCheck } from './admin/VICOperatorDatabaseCheck';
import { VICVillageBrowser } from './admin/VICVillageBrowser';
import { VICVillageCSVImporter } from './admin/VICVillageCSVImporter';
import { VICDatabaseStats } from './admin/VICDatabaseStats';
import VICGovReconciliation from './admin/VICGovReconciliation';
import OperatorScraper from './admin/OperatorScraper';
import { OperatorScraperDiagnostic } from './admin/OperatorScraperDiagnostic';
import { SmartOperatorScraper } from './admin/SmartOperatorScraper';
import { BulkOperatorCleaner } from './admin/BulkOperatorCleaner';
import { OperatorListViewer } from './admin/OperatorListViewer';
import { VICAberleaFilter } from './admin/VICAberleaFilter';
import { VICRecentOperatorCheck } from './admin/VICRecentOperatorCheck';
import { VICOperatorCSVMerger } from './admin/VICOperatorCSVMerger';
import { VICOperatorCSVExport } from './admin/VICOperatorCSVExport';
import { VICScrapedOperatorMerge } from './admin/VICScrapedOperatorMerge';
import { LocalStorageInspector } from './admin/LocalStorageInspector';
import { DatabaseOperatorInspector } from './admin/DatabaseOperatorInspector';
import { VICOperatorCountCheck } from './admin/VICOperatorCountCheck';
import { VICLocalStorageCheck } from './admin/VICLocalStorageCheck';
import { VICScrapedCSVImporter } from './admin/VICScrapedCSVImporter';
import { VICMergeDebugger } from './admin/VICMergeDebugger';
import { VICNameMatchingDiagnostic } from './admin/VICNameMatchingDiagnostic';
import { VICCSVOperatorMerge } from './admin/VICCSVOperatorMerge';
import { VICCSVDatabaseComparison } from './admin/VICCSVDatabaseComparison';
import { VICOperatorReconciliation } from './admin/VICOperatorReconciliation';
import { VICOperatorFullExport } from './admin/VICOperatorFullExport';
import { VICOperatorCSVBulkImport } from './admin/VICOperatorCSVBulkImport';
import { VICMissingOperatorExport } from './admin/VICMissingOperatorExport';
import { VICURLImporter } from './admin/VICURLImporter';
import { VICVillagesNeedingURLsExport } from './admin/VICVillagesNeedingURLsExport';
import { DeleteAllVICWebsites } from './admin/DeleteAllVICWebsites';
import { VICWebsiteScraper } from './admin/VICWebsiteScraper';
import { VICWebsiteScraperSimple } from './admin/VICWebsiteScraperSimple';
import { VICWebsiteRecoveryTool } from './admin/VICWebsiteRecoveryTool';
import { VICMissingWebsitesFinder } from './admin/VICMissingWebsitesFinder';
import { WebsiteScraperDiagnostics } from './admin/WebsiteScraperDiagnostics';
import { VICURLPatternGenerator } from './admin/VICURLPatternGenerator';
import { StartFreshInstructions } from './admin/StartFreshInstructions';
import { VICAddressUploader } from './admin/VICAddressUploader';
import { DeleteAllVictorianVillages } from './DeleteAllVictorianVillages';
import { VICOperatorScraper } from './VICOperatorScraper';
import { DatabaseInvestigator } from './admin/DatabaseInvestigator';
import { DataEnrichmentDashboard } from './admin/DataEnrichmentDashboard';
import { WebsiteBulkEditor } from './admin/WebsiteBulkEditor';
import { BackendStatusChecker } from './admin/BackendStatusChecker';
import { VICWebsiteAnalyzer } from './admin/VICWebsiteAnalyzer';
import { VICBlacklistCleaner } from './admin/VICBlacklistCleaner';
import { VICBlacklistCleanup } from './admin/VICBlacklistCleanup';
import { VICOperatorURLGenerator } from './admin/VICOperatorURLGenerator';
import { VICMultiMethodScraper } from './admin/VICMultiMethodScraper';
import { VICOperatorDomainScraper } from './admin/VICOperatorDomainScraper';
import { VICScraperCleanup } from './admin/VICScraperCleanup';
import { VICRecentScrapeResults } from './admin/VICRecentScrapeResults';
import { OperatorMismatchDiagnostic } from './admin/OperatorMismatchDiagnostic';
import { VICURLCleanup } from './admin/VICURLCleanup';
import { VICOperatorDomainsUploader } from './admin/VICOperatorDomainsUploader';
import { VICMultiStrategyScraper } from './admin/VICMultiStrategyScraper';
import { AustralianUnityCleanup } from './admin/AustralianUnityCleanup';
import DatabaseStatsChecker from './admin/DatabaseStatsChecker';
import ScrapedDataReview from './admin/ScrapedDataReviewSimplified';
import BulkClassifier from './admin/BulkClassifier';
import { ManualVillageClassifier } from './admin/ManualVillageClassifier';
import LocalStorageRecovery from './admin/LocalStorageRecovery';
import DatabasePricingAudit from './admin/DatabasePricingAudit';
import ResilientPricingScraper from './admin/ResilientPricingScraper';
import ErrorBoundary from './ErrorBoundary';
import { SimpleVillageScraper } from './admin/SimpleVillageScraper';
import { FailedVillagesInspector } from './admin/FailedVillagesInspector';
import WebScraperTool from './admin/WebScraperTool';
import { DataQualityAnalyzer } from './admin/DataQualityAnalyzer';
import { BulkURLFixerCSV } from './admin/BulkURLFixerCSV';
import { BatchScrapingDashboard } from './admin/BatchScrapingDashboard';
import { VicUrlChecker } from './VicUrlChecker';
import { VicWebsiteDiagnostic } from './admin/VicWebsiteDiagnostic';
import { ManualWebsiteImporter } from './admin/ManualWebsiteImporter';
import { E2EWebsiteTest } from './admin/E2EWebsiteTest';
import { VicOperatorCheck } from './admin/VicOperatorCheck';
import { DeleteBadWebsite } from './admin/DeleteBadWebsite';
import { GoogleSearchDebugger } from './admin/GoogleSearchDebugger';
import { GoogleURLBulkGenerator } from './admin/GoogleURLBulkGenerator';
import { ScraperAPIURLFinder } from './admin/ScraperAPIURLFinder';
import ScraperAPIDebugger from './admin/ScraperAPIDebugger';
import AdmillanDiagnostic from './admin/AdmillanDiagnostic';
import { OperatorPatternManager } from './admin/OperatorPatternManager';
import { OperatorURLInspector } from './admin/OperatorURLInspector';
import { VICWebsiteMigrator } from './admin/VICWebsiteMigrator';
import { ScrapedDataInspector } from './admin/ScrapedDataInspector';
import { VICWebsiteImportAnalyzer } from './admin/VICWebsiteImportAnalyzer';
import { DatabasePersistenceTest } from './admin/DatabasePersistenceTest';
import { BackendPersistenceTest } from './admin/BackendPersistenceTest';
import { DataRecoveryDashboard } from './DataRecoveryDashboard';
import { DeleteAllVICVillages } from './admin/DeleteAllVICVillages';
import { SimpleVICDeleter } from './admin/SimpleVICDeleter';
import { SimpleVICCSVUploader } from './admin/SimpleVICCSVUploader';
import { DeleteOldVICVillages } from './admin/DeleteOldVICVillages';
import { VICDuplicateChecker } from './admin/VICDuplicateChecker';
import { ComprehensiveVillageScraper } from './admin/ComprehensiveVillageScraper';

interface Village {
  id: string;
  name: string;
  operator: string | null;
  location: string;
  suburb: string;
  postcode: string;
  state: string;
  latitude: number | null;
  longitude: number | null;
  village_type: string | null;
  care_level: string | null;
  entry_price_min: number | null;
  entry_price_max: number | null;
  monthly_fees_min: number | null;
  monthly_fees_max: number | null;
  dmf_structure: string | null;
  dmf_percentage: number | null;
  dmf_cap: number | null;
  amenities: string[];
  care_services: string[];
  activities: string[];
  pet_friendly: boolean;
  total_units: number | null;
  bedrooms: string[];
  age_restriction: number;
  contact_phone: string | null;
  contact_email: string | null;
  website: string | null;
  description: string | null;
  images: string[];
  status: 'pending' | 'approved' | 'rejected';
  source: string;
  verified: boolean;
  submitted_at: string | null;
  approved_at: string | null;
  rejected_at: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
}

interface Stats {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
}

export function AdminDashboard() {
  const { user, accessToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [villages, setVillages] = useState<Village[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, approved: 0, pending: 0, rejected: 0 });
  const [selectedVillage, setSelectedVillage] = useState<Village | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('operator-scraper'); // Changed default to operator-scraper to avoid loading heavy tabs
  const [signatureCopied, setSignatureCopied] = useState(false);

  // Admin-only access control
  const ADMIN_EMAILS = ['smith68d@gmail.com']; // Admin email for RetirePath

  // Check if user is authenticated
  if (!user || !accessToken) {
    return (
      <div className="max-w-4xl mx-auto">
        <Alert>
          <Shield className="size-4" />
          <AlertDescription>
            <strong>Authentication Required</strong>
            <p className="mt-2">You must be logged in to access the Admin Dashboard.</p>
            <p className="text-sm mt-2">Please log in or create an account to manage village submissions.</p>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Check if user is admin
  if (!ADMIN_EMAILS.includes(user.email || '')) {
    return (
      <div className="max-w-4xl mx-auto">
        <Alert variant="destructive">
          <Shield className="size-4" />
          <AlertDescription>
            <strong>Access Denied</strong>
            <p className="mt-2">This dashboard is for administrators only.</p>
            <p className="text-sm mt-2">If you believe this is an error, please contact support.</p>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Fetch all villages
  const fetchVillages = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/villages/admin/all?from=0&to=99`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.error || `Server error: ${response.status} ${response.statusText}`;
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setVillages(data.villages || []);

      // Calculate stats
      const total = data.villages?.length || 0;
      const approved = data.villages?.filter((v: Village) => v.status === 'approved').length || 0;
      const pending = data.villages?.filter((v: Village) => v.status === 'pending').length || 0;
      const rejected = data.villages?.filter((v: Village) => v.status === 'rejected').length || 0;

      setStats({ total, approved, pending, rejected });
    } catch (err) {
      console.error('Error fetching villages:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`Failed to load villages: ${errorMessage}. The backend server may be starting up or unavailable.`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount
  useEffect(() => {
    // Only fetch if we have valid auth credentials
    if (accessToken && user) {
      fetchVillages().catch((err) => {
        console.error('Initial fetch failed:', err);
        // Error is already handled in fetchVillages, just prevent unhandled rejection
      });
    }
  }, []); // Empty dependencies - only run once on mount

  // Listen for navigation events from other components
  useEffect(() => {
    const handleNavigateToEnrichment = (event: any) => {
      const { tab, sectionId } = event.detail;
      
      // Switch to the requested tab
      setActiveTab(tab);
      
      // Wait for tab to render, then scroll to section
      setTimeout(() => {
        const section = document.getElementById(sectionId);
        if (section) {
          section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    };
    
    window.addEventListener('navigateToEnrichment', handleNavigateToEnrichment);
    
    return () => {
      window.removeEventListener('navigateToEnrichment', handleNavigateToEnrichment);
    };
  }, []);

  // Approve village
  const handleApprove = async (villageId: string) => {
    try {
      setActionLoading(true);
      setError(null);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/villages/admin/${villageId}/approve`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to approve village');
      }

      // Refresh villages
      await fetchVillages();
      setShowDetailModal(false);
      setSelectedVillage(null);
    } catch (err) {
      console.error('Error approving village:', err);
      setError('Failed to approve village. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  // Reject village
  const handleReject = async () => {
    if (!selectedVillage) return;

    try {
      setActionLoading(true);
      setError(null);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/villages/admin/${selectedVillage.id}/reject`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ reason: rejectionReason }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to reject village');
      }

      // Refresh villages
      await fetchVillages();
      setShowRejectModal(false);
      setShowDetailModal(false);
      setSelectedVillage(null);
      setRejectionReason('');
    } catch (err) {
      console.error('Error rejecting village:', err);
      setError('Failed to reject village. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete village
  const handleDelete = async (villageId: string) => {
    if (!confirm('Are you sure you want to permanently delete this village?')) {
      return;
    }

    try {
      setActionLoading(true);
      setError(null);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/villages/admin/${villageId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete village');
      }

      // Refresh villages
      await fetchVillages();
      setShowDetailModal(false);
      setSelectedVillage(null);
    } catch (err) {
      console.error('Error deleting village:', err);
      setError('Failed to delete village. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  // Copy email signature to clipboard
  const copyEmailSignature = () => {
    const signatureHTML = `<table cellpadding="0" cellspacing="0" border="0" style="font-family: Arial, sans-serif; font-size: 14px; color: #333333; line-height: 1.5; background-color: transparent;">
    <tr>
        <td style="padding-right: 15px; vertical-align: top; background-color: transparent;">
            <img src="https://i.imgur.com/8vFk8de.png" alt="RetirePath Logo" width="60" height="60" style="display: block; border: 0; background-color: transparent;">
        </td>
        <td style="vertical-align: top; border-left: 3px solid #2D6A4F; padding-left: 15px; background-color: transparent;">
            <table cellpadding="0" cellspacing="0" border="0" style="background-color: transparent;">
                <tr>
                    <td style="padding-bottom: 5px; background-color: transparent;">
                        <strong style="font-size: 16px; color: #1B4332;">Drew Smith</strong>
                    </td>
                </tr>
                <tr>
                    <td style="padding-bottom: 8px; color: #666666; font-size: 13px; background-color: transparent;">
                        RetirePath
                    </td>
                </tr>
                <tr>
                    <td style="padding-bottom: 3px; background-color: transparent;">
                         <a href="mailto:drew@retirepath.com.au" style="color: #2D6A4F; text-decoration: none;">drew@retirepath.com.au</a>
                    </td>
                </tr>
                <tr>
                    <td style="padding-bottom: 3px; background-color: transparent;">
                        📱 0422 208 230
                    </td>
                </tr>
                <tr>
                    <td style="padding-bottom: 8px; background-color: transparent;">
                        🌐 <a href="https://www.retirepath.com.au" style="color: #2D6A4F; text-decoration: none;">www.retirepath.com.au</a>
                    </td>
                </tr>
                <tr>
                    <td style="padding-top: 8px; font-size: 12px; color: #666666; font-style: italic; border-top: 1px solid #E5E7EB; padding-top: 8px; background-color: transparent;">
                        Your retirement village transition guide
                    </td>
                </tr>
                <tr>
                    <td style="padding-top: 8px; font-size: 11px; color: #666666; line-height: 1.4; background-color: transparent;">
                        <em>RetirePath acknowledges the Traditional Custodians of Country throughout Australia and recognises their continuing connection to land, waters and culture. We pay our respects to Elders past and present.</em>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</table>`;

    // Create a temporary div to hold the HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = signatureHTML;
    tempDiv.style.position = 'fixed';
    tempDiv.style.left = '-9999px';
    document.body.appendChild(tempDiv);

    // Select the content
    const range = document.createRange();
    range.selectNodeContents(tempDiv);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);

    try {
      // Copy to clipboard
      document.execCommand('copy');
      setSignatureCopied(true);
      
      // Reset after 3 seconds
      setTimeout(() => {
        setSignatureCopied(false);
      }, 3000);
    } catch (err) {
      console.error('Failed to copy signature:', err);
      alert('Failed to copy signature. Please try again.');
    } finally {
      // Clean up
      selection?.removeAllRanges();
      document.body.removeChild(tempDiv);
    }
  };

  // View village details
  const handleViewDetails = (village: Village) => {
    console.log(' Opening village for review:', village.name);
    console.log('🔍 Village data:', village);
    console.log('🔍 Village scraped_data:', (village as any).scraped_data);
    setSelectedVillage(village);
    setShowDetailModal(true);
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-600"><CheckCircle className="size-3 mr-1" />Approved</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-600"><Clock className="size-3 mr-1" />Pending</Badge>;
      case 'rejected':
        return <Badge className="bg-red-600"><XCircle className="size-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Filter villages by status
  const pendingVillages = villages.filter(v => v.status === 'pending');
  const approvedVillages = villages.filter(v => v.status === 'approved');
  const rejectedVillages = villages.filter(v => v.status === 'rejected');

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage retirement village submissions and listings
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            size="lg"
            variant="outline"
            onClick={copyEmailSignature}
            className="bg-gradient-to-r from-emerald-50 to-green-50 hover:from-emerald-100 hover:to-green-100 border-green-300"
          >
            {signatureCopied ? (
              <>
                <CheckCircle className="size-5 mr-2 text-green-600" />
                <span className="text-green-700">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="size-5 mr-2" />
                Copy Email Signature
              </>
            )}
          </Button>
          <Button
            size="lg"
            onClick={() => window.location.hash = '#generate-csv'}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
          >
            <Download className="size-5 mr-2" />
            Generate CSV for Image Scraping
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap gap-1 h-auto p-1 bg-muted rounded-lg">
          <TabsTrigger value="recovery" className="flex-shrink-0">
            <Shield className="size-4 mr-2" />
            🛡️ Data Recovery
          </TabsTrigger>
          <TabsTrigger value="operator-scraper" className="flex-shrink-0">
            <Building2 className="size-4 mr-2" />
            🔥 Operator Scraper
          </TabsTrigger>
          <TabsTrigger value="url-uploader" className="flex-shrink-0">
            <Upload className="size-4 mr-2" />
            📊 URL Manager
          </TabsTrigger>
          <TabsTrigger value="vic-reconcile" className="flex-shrink-0">
            <Database className="size-4 mr-2" />
            VIC Reconcile
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex-shrink-0">
            <BarChart3 className="size-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="data-quality" className="flex-shrink-0">
            <Database className="size-4 mr-2" />
            Data Quality
          </TabsTrigger>
          <TabsTrigger value="batch-scraping" className="flex-shrink-0">
            <RefreshCw className="size-4 mr-2" />
            Scraper
          </TabsTrigger>
          <TabsTrigger value="overview" className="flex-shrink-0">
            <Building className="size-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="pending" className="flex-shrink-0">
            <Clock className="size-4 mr-2" />
            Pending ({stats.pending})
          </TabsTrigger>
          <TabsTrigger value="approved" className="flex-shrink-0">
            <CheckCircle className="size-4 mr-2" />
            Approved ({stats.approved})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="flex-shrink-0">
            <XCircle className="size-4 mr-2" />
            Rejected ({stats.rejected})
          </TabsTrigger>
          <TabsTrigger value="reviews" className="flex-shrink-0">
            <MessageSquare className="size-4 mr-2" />
            Reviews
          </TabsTrigger>
          <TabsTrigger value="featured" className="flex-shrink-0">
            <Star className="size-4 mr-2" />
            Featured
          </TabsTrigger>
          <TabsTrigger value="leads" className="flex-shrink-0">
            <Users className="size-4 mr-2" />
            Agent Leads
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex-shrink-0">
            <Send className="size-4 mr-2" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="marketing" className="flex-shrink-0">
            <FileText className="size-4 mr-2" />
            Marketing
          </TabsTrigger>
          <TabsTrigger value="letterhead" className="flex-shrink-0">
            <FileText className="size-4 mr-2" />
            Letterhead
          </TabsTrigger>
          <TabsTrigger value="vic-import" className="flex-shrink-0">
            <Download className="size-4 mr-2" />
            VIC Import
          </TabsTrigger>
        </TabsList>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <DataQualityAnalyzer />
        </TabsContent>

        {/* Data Quality Tab */}
        <TabsContent value="data-quality" className="space-y-6">
          <DataQualityDashboard accessToken={accessToken || ''} />
        </TabsContent>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Alert about pagination */}
          <Alert>
            <AlertCircle className="size-4" />
            <AlertDescription>
              <strong>Note:</strong> This dashboard loads the 100 most recently created villages for performance. For full village management, use the specialized tabs.
            </AlertDescription>
          </Alert>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-4">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Villages</p>
                  <p className="text-3xl mt-2">{stats.total}</p>
                </div>
                <Building className="size-8 text-muted-foreground" />
              </div>
            </Card>

            <Card className="p-6 bg-green-50 border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-700">Approved</p>
                  <p className="text-3xl text-green-700 mt-2">{stats.approved}</p>
                </div>
                <CheckCircle className="size-8 text-green-600" />
              </div>
            </Card>

            <Card className="p-6 bg-yellow-50 border-yellow-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-700">Pending Review</p>
                  <p className="text-3xl text-yellow-700 mt-2">{stats.pending}</p>
                </div>
                <Clock className="size-8 text-yellow-600" />
              </div>
            </Card>

            <Card className="p-6 bg-red-50 border-red-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-700">Rejected</p>
                  <p className="text-3xl text-red-700 mt-2">{stats.rejected}</p>
                </div>
                <XCircle className="size-8 text-red-600" />
              </div>
            </Card>
          </div>

          {/* Recent Submissions */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3>Recent Submissions</h3>
              <Button size="sm" variant="outline" onClick={fetchVillages} disabled={loading}>
                <RefreshCw className={`size-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>

            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading villages...</div>
            ) : villages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No villages yet. Waiting for submissions!
              </div>
            ) : (
              <div className="space-y-4">
                {villages.slice(0, 5).map((village) => (
                  <div
                    key={village.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="text-base">{village.name}</h4>
                        {getStatusBadge(village.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        <MapPin className="size-3 inline mr-1" />
                        {village.suburb}, {village.state} {village.postcode}
                      </p>
                      {village.operator && (
                        <p className="text-sm text-muted-foreground">
                          Operator: {village.operator}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleViewDetails(village)}>
                        <Eye className="size-4 mr-2" />
                        View
                      </Button>
                      {village.status === 'pending' && (
                        <Button size="sm" onClick={() => handleApprove(village.id)} disabled={actionLoading}>
                          <CheckCircle className="size-4 mr-2" />
                          Approve
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Pending Tab */}
        <TabsContent value="pending" className="space-y-6">
          <Card className="p-6">
            <h3 className="mb-4">Pending Submissions</h3>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : pendingVillages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="size-12 mx-auto mb-4 opacity-50" />
                <p>No pending submissions</p>
              </div>
            ) : (
              <VillageTable
                villages={pendingVillages}
                onView={handleViewDetails}
                onApprove={handleApprove}
                onReject={(village) => {
                  setSelectedVillage(village);
                  setShowRejectModal(true);
                }}
                actionLoading={actionLoading}
              />
            )}
          </Card>
        </TabsContent>

        {/* Approved Tab */}
        <TabsContent value="approved" className="space-y-6">
          <Card className="p-6">
            <h3 className="mb-4">Approved Villages</h3>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : approvedVillages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="size-12 mx-auto mb-4 opacity-50" />
                <p>No approved villages yet</p>
              </div>
            ) : (
              <VillageTable
                villages={approvedVillages}
                onView={handleViewDetails}
                onDelete={handleDelete}
                actionLoading={actionLoading}
              />
            )}
          </Card>
        </TabsContent>

        {/* Rejected Tab */}
        <TabsContent value="rejected" className="space-y-6">
          <Card className="p-6">
            <h3 className="mb-4">Rejected Submissions</h3>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : rejectedVillages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <XCircle className="size-12 mx-auto mb-4 opacity-50" />
                <p>No rejected submissions</p>
              </div>
            ) : (
              <VillageTable
                villages={rejectedVillages}
                onView={handleViewDetails}
                onDelete={handleDelete}
                actionLoading={actionLoading}
              />
            )}
          </Card>
        </TabsContent>

        {/* Reviews Tab */}
        <TabsContent value="reviews" className="space-y-6">
          <Card className="p-6">
            <h3 className="mb-4">Village Reviews</h3>
            <ReviewsManager accessToken={accessToken || ''} />
          </Card>
        </TabsContent>

        {/* Featured Tab */}
        <TabsContent value="featured" className="space-y-6">
          <Card className="p-6">
            <h3 className="mb-4">Featured Villages</h3>
            <FeaturedVillagesManager accessToken={accessToken || ''} />
          </Card>
        </TabsContent>

        {/* Agent Leads Tab */}
        <TabsContent value="leads" className="space-y-6">
          <Card className="p-6">
            <h3 className="mb-4">Agent Leads</h3>
            <AgentLeadsManager accessToken={accessToken || ''} />
          </Card>
        </TabsContent>

        {/* Email Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          <EmailTemplates />
        </TabsContent>

        {/* Marketing Tab */}
        <TabsContent value="marketing" className="space-y-6">
          <MarketingMaterials />
        </TabsContent>

        {/* Letterhead Tab */}
        <TabsContent value="letterhead" className="space-y-6">
          <Card className="p-6">
            <h3 className="mb-4">Letterhead Preview</h3>
            <p className="text-muted-foreground">Letterhead preview coming soon...</p>
          </Card>
        </TabsContent>

        {/* VIC Import Tab */}
        <TabsContent value="vic-import" className="space-y-6">
          {/* 🚀 Quick Start Guide */}
          <Card className="p-6 bg-gradient-to-r from-purple-50 via-pink-50 to-orange-50 border-2 border-purple-400">
            <h2 className="text-2xl font-bold mb-2 text-purple-900 flex items-center gap-2">
              <Download className="size-6" />
              🎯 Quick Start: Update VIC Villages
            </h2>
            <div className="space-y-4">
              <Alert className="bg-blue-50 border-blue-400">
                <AlertCircle className="size-4" />
                <AlertDescription>
                  <strong>✨ NEW: VIC Combined Importer</strong> - Update everything in ONE upload!
                  <div className="mt-2 space-y-1 text-sm">
                    <div>• ✅ Corrected village names</div>
                    <div>• ✅ Operators</div>
                    <div>• ✅ Website URLs</div>
                    <div>• ✅ Suburbs & Postcodes</div>
                    <div>• ✅ Smart fuzzy matching (finds villages even with name variations)</div>
                  </div>
                </AlertDescription>
              </Alert>
              
              <div className="bg-white p-4 rounded-lg border-2 border-purple-200">
                <h3 className="font-semibold mb-2 text-purple-900">📋 Your CSVs:</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <Badge className="bg-green-600 mt-0.5">CSV #1</Badge>
                    <div>
                      <strong>28 villages</strong> with corrected names + operators + full data
                      <br />
                      <span className="text-xs text-gray-600">Columns: Name, Operator, Suburb, Postcode, State, Website URL</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Badge className="bg-blue-600 mt-0.5">CSV #2</Badge>
                    <div>
                      <strong>44 villages</strong> with corrected names + URLs + suburbs + postcodes
                      <br />
                      <span className="text-xs text-gray-600">Columns: Name, Suburb, Postcode, Website URL</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border-2 border-green-300">
                <h3 className="font-semibold mb-2 text-green-900">🚀 Quick Steps:</h3>
                <ol className="space-y-1 text-sm list-decimal list-inside">
                  <li>Scroll down to <strong>"🚀 VIC Combined Data Importer"</strong> (purple/pink card)</li>
                  <li>Upload CSV #1 (28 villages) → Import → Check results</li>
                  <li>Upload CSV #2 (44 villages) → Import → Check results</li>
                  <li>Download the results CSV to review what was updated</li>
                  <li>Done! 🎉</li>
                </ol>
              </div>
            </div>
          </Card>

          <VICWebsiteChecker />
          <VICDataImporter />
          <VictorianVillagesInspector />
          <VictorianVillagesSourceAnalyzer />
          <VictorianDuplicateFinder />
          <VictorianSourceComparison />
          <DeleteAgedCareFacilities />
          <DeleteOldVictorianVillages />
          <VICOperatorsExporter />
          <VICOperatorBulkUpdate />
          <VICOperatorDiagnostic />
          <VICOperatorAutoScraper />
          <VICOperatorWhitelistImporter />
          <VICOperatorWhitelistManager />
          <VICVillageDeleter />
          <VICDatabaseInspector />
          <VICDeleteOldWithWebsites />
          <VICOperatorTimestampCheckerSimple />
          <VICVillageDiagnostic />
          <VICVillageServerDeleter />
          <VICCSVDuplicateChecker />
          <VICVillageRealTimeCounter />
          <VICOperatorFieldInspector />
          <VICManualOperatorSetter />
          <VICExtractOperatorsFromDescription />
          <VICOperatorAudit />
          <VICOperatorDatabaseCheck />
          <VICVillageBrowser />
          <VICVillageCSVImporter />
          <VICOperatorScraper />
          <DeleteAllVictorianVillages />
          <DatabaseInvestigator />
          <DataEnrichmentDashboard />
          <WebsiteBulkEditor />
          <BackendStatusChecker />
        </TabsContent>

        {/* VIC Reconcile Tab */}
        <TabsContent value="vic-reconcile" className="space-y-6">
          <VICDatabaseStats />
          <VICGovReconciliation />
        </TabsContent>

        {/* 🛡️ Data Recovery Dashboard - FIRST PRIORITY! */}
        <TabsContent value="recovery" className="space-y-6">
          <ErrorBoundary>
            <DataRecoveryDashboard accessToken={accessToken} />
          </ErrorBoundary>
        </TabsContent>

        {/* Operator Scraper Tab */}
        <TabsContent value="operator-scraper" className="space-y-6">
          {/* 🕷️ SCRAPERAPI URL FINDER - USES YOUR EXISTING CREDITS! */}
          <ErrorBoundary>
            <ScraperAPIURLFinder />
          </ErrorBoundary>

          {/* 🔗 GOOGLE URL BULK GENERATOR (Requires Google billing) */}
          <ErrorBoundary>
            <GoogleURLBulkGenerator />
          </ErrorBoundary>
          
          {/* 🎯 INSTRUCTIONS: Simple 3-step process */}
          <StartFreshInstructions />
          
          {/* 🎯 THE ONLY EXPORT TOOL YOU NEED! */}
          <VICOperatorFullExport />
          
          {/* 🆕 Import URLs for 41 VIC villages */}
          <VICURLImporter accessToken={accessToken} />
          
          {/* 🆕 DELETE ALL BAD WEBSITE URLs */}
          <DeleteAllVICWebsites />
          
          {/* 🔍 DIAGNOSTICS - Analyze why scraping has low success rate */}
          <WebsiteScraperDiagnostics />
          
          {/* ⚡ URL PATTERN GENERATOR - Add operator URL patterns */}
          <VICURLPatternGenerator />
          
          {/* 🔍 WEBSITE RECOVERY TOOL - Find and recover the lost 318 websites */}
          <VICWebsiteRecoveryTool />
          
          {/* 🗑️ STEP 1: CLEAN BLACKLISTED URLs FIRST! */}
          <VICBlacklistCleaner />
          
          {/* 🗑️ STEP 1B: DELETE BLACKLISTED WEBSITES FROM DATABASE */}
          <VICBlacklistCleanup />
          
          {/* 🏥 AUSTRALIAN UNITY CLEANUP - Fix incorrect operator assignments */}
          <AustralianUnityCleanup />
          
          {/* ❌ DEPRECATED: OLD SINGLE-STRATEGY SCRAPER - HIDDEN */}
          {/* <VICOperatorDomainScraper /> */}
          
          {/* 🕒 VIEW RECENT SCRAPE RESULTS */}
          <VICRecentScrapeResults />
          
          {/* 🔍 OPERATOR MISMATCH DIAGNOSTIC */}
          <OperatorMismatchDiagnostic />
          
          {/* 🧹 VIC URL CLEANUP & BULK FIX */}
          <VICURLCleanup />
          
          {/* 📁 UPLOAD OPERATOR DOMAINS CSV - REQUIRED FOR SCRAPER! */}
          <VICOperatorDomainsUploader />
          
          {/* ⭐⭐⭐ USE THIS ONE! MULTI-STRATEGY SCRAPER (60-80% SUCCESS!) ⭐⭐⭐ */}
          <VICMultiStrategyScraper />
          
          {/* 🔗 STEP 1D: GENERATE URLs FOR MAJOR OPERATORS (Stockland, Aveo, etc.) */}
          <VICOperatorURLGenerator />
          
          {/* 🚀 STEP 2: MULTI-METHOD SCRAPER - 80%+ Success Rate Target! */}
          <VICMultiMethodScraper />
          
          {/* 🧹 STEP 2B: CLEANUP BAD SCRAPING RESULTS */}
          <VICScraperCleanup />
          
          {/* 🔍 ANALYZE WHAT WORKED - Study existing websites */}
          <VICWebsiteAnalyzer />
          
          {/* 🔍 FIND MISSING WEBSITES - Diagnose what was lost */}
          <VICMissingWebsitesFinder />
          
          {/* ✅ PROVEN WEBSITE SCRAPER WITH DATA RESILIENCE - ALWAYS USE THIS ONE! */}
          <ErrorBoundary>
            <VICWebsiteScraperSimple />
          </ErrorBoundary>
          
          {/* ⚠️ OLD SCRAPER REMOVED - It didn't have data resilience and caused data loss! */}
          {/* If you need the old scraper, uncomment below (NOT RECOMMENDED): */}
          {/* <VICWebsiteScraper /> */}
          
          {/* 🆕 Export villages still needing URLs */}
          <VICVillagesNeedingURLsExport accessToken={accessToken} />
          
          {/* You can ignore this green card - it's for a different workflow */}
          <VICOperatorCSVBulkImport />
          
          {/* Temporarily disabled - causing page hangs */}
          {/* <SmartOperatorScraper /> */}
          <VICRecentOperatorCheck />
          <VICOperatorCountCheck />
          <VICLocalStorageCheck />
          <VICScrapedCSVImporter />
          <VICMergeDebugger />
          <VICNameMatchingDiagnostic />
          <VICCSVOperatorMerge />
          <VICOperatorReconciliation />
          <VICCSVDatabaseComparison />
          <VICOperatorCSVExport />
          <VICScrapedOperatorMerge />
          <VICAberleaFilter />
          <VICOperatorCSVMerger />
          <OperatorListViewer />
          <BulkOperatorCleaner />
          <VICDatabaseStats />
          <DatabaseOperatorInspector />
          <VICAddressUploader />
          <LocalStorageInspector />
          <OperatorScraperDiagnostic />
          <OperatorScraper />
        </TabsContent>

        {/* URL Uploader Tab */}
        <TabsContent value="url-uploader" className="space-y-6">
          <SimpleVICDeleter />
          <ComprehensiveVillageScraper />
          <VICDuplicateChecker />
          <SimpleVICCSVUploader />
          <DeleteOldVICVillages />
        </TabsContent>

        {/* Batch Scraping Tab */}
        <TabsContent value="batch-scraping" className="space-y-6">
          {/* 🧪 DATABASE PERSISTENCE TEST - Test if updates actually work */}
          <ErrorBoundary>
            <DatabasePersistenceTest />
          </ErrorBoundary>
          
          {/* 🧪 BACKEND PERSISTENCE TEST - Test if backend save endpoint works */}
          <ErrorBoundary>
            <BackendPersistenceTest accessToken={accessToken} />
          </ErrorBoundary>
          
          {/* 🔍 IMPORT ANALYZER - Check what happened with the CSV import */}
          <ErrorBoundary>
            <VICWebsiteImportAnalyzer />
          </ErrorBoundary>
          
          {/* 🔍 VIC URL ANALYSIS - Shows what types of URLs we have for VIC villages */}
          <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-lg">
            <h2 className="text-2xl font-bold mb-2 text-blue-900">🔍 VIC URL Analysis</h2>
            <p className="text-sm text-blue-700 mb-4">Check what types of URLs we have stored for Victorian villages (official sites vs listing sites)</p>
            
            <ErrorBoundary>
              <VicUrlChecker />
            </ErrorBoundary>
          </div>

          {/* 🔍 DIAGNOSTIC: VIC Website Status Checker */}
          <ErrorBoundary>
            <VicWebsiteDiagnostic />
          </ErrorBoundary>

          {/* 🗑️ DELETE BAD WEBSITE */}
          <ErrorBoundary>
            <DeleteBadWebsite />
          </ErrorBoundary>

          {/* 🔍 GOOGLE SEARCH DEBUGGER */}
          <ErrorBoundary>
            <GoogleSearchDebugger />
          </ErrorBoundary>

          {/* 🔗 GOOGLE URL BULK GENERATOR - Generate 200+ search URLs */}
          <ErrorBoundary>
            <GoogleURLBulkGenerator />
          </ErrorBoundary>

          {/* 🐛 SCRAPERAPI DEBUGGER */}
          <ErrorBoundary>
            <ScraperAPIDebugger />
          </ErrorBoundary>

          {/* 🔍 ADMILLAN DIAGNOSTIC */}
          <ErrorBoundary>
            <AdmillanDiagnostic />
          </ErrorBoundary>

          {/* ⚠️ OPERATOR READINESS CHECK */}
          <ErrorBoundary>
            <VicOperatorCheck />
          </ErrorBoundary>

          {/* 🧪 MANUAL TEST: Website Importer */}
          <ErrorBoundary>
            <ManualWebsiteImporter />
          </ErrorBoundary>

          {/* 🧪 END-TO-END TEST: Complete Website Flow */}
          <ErrorBoundary>
            <E2EWebsiteTest />
          </ErrorBoundary>

          {/* ✅ RE-ENABLED: Batch Scraping Dashboard - The most powerful scraping tool */}
          <ErrorBoundary>
            <BatchScrapingDashboard />
          </ErrorBoundary>
          <ErrorBoundary>
            <DatabaseStatsChecker />
          </ErrorBoundary>
          <ErrorBoundary>
            <WebScraperTool accessToken={accessToken} />
          </ErrorBoundary>
          <ErrorBoundary>
            <ScrapedDataReview accessToken={accessToken} />
          </ErrorBoundary>
          <ErrorBoundary>
            <BulkClassifier accessToken={accessToken} />
          </ErrorBoundary>
          <ErrorBoundary>
            <ManualVillageClassifier />
          </ErrorBoundary>
          <ErrorBoundary>
            <LocalStorageRecovery />
          </ErrorBoundary>
          <ErrorBoundary>
            <DatabasePricingAudit accessToken={accessToken} />
          </ErrorBoundary>
          <ErrorBoundary>
            <ResilientPricingScraper accessToken={accessToken} />
          </ErrorBoundary>
          <ErrorBoundary>
            <SimpleVillageScraper />
          </ErrorBoundary>
          <ErrorBoundary>
            <FailedVillagesInspector />
          </ErrorBoundary>
          <ErrorBoundary>
            <BulkURLFixerCSV />
          </ErrorBoundary>
          <ErrorBoundary>
            <OperatorPatternManager />
          </ErrorBoundary>
          <ErrorBoundary>
            <OperatorURLInspector />
          </ErrorBoundary>
          
          {/* 🔍 SCRAPED DATA INSPECTOR - See what's actually in scraped_data */}
          <ErrorBoundary>
            <ScrapedDataInspector />
          </ErrorBoundary>
          
          {/* 🔄 WEBSITE MIGRATOR - Copy scraped websites to main website field */}
          <ErrorBoundary>
            <VICWebsiteMigrator />
          </ErrorBoundary>
          
          {/* Database Health Check Button */}
          <div className="bg-white rounded-lg shadow-md p-6 mt-6">
            <h3 className="text-xl font-bold mb-4">🏥 Database Health Check</h3>
            <p className="text-gray-600 mb-4">
              Check VIC villages database status (total count, operators, websites, etc.)
            </p>
            <button
              onClick={async () => {
                try {
                  console.log('🏥 Running database health check...');
                  const response = await fetch(
                    `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/database-health-check/vic-villages`,
                    {
                      headers: {
                        'Authorization': `Bearer ${publicAnonKey}`,
                      },
                    }
                  );

                  if (response.ok) {
                    const data = await response.json();
                    console.log('🏥 DATABASE HEALTH CHECK RESULTS:', data);
                    
                    alert(`🏥 Database Health Check Complete!\n\n` +
                      `Total VIC Villages: ${data.summary.totalVicVillages}\n` +
                      `With Operator: ${data.summary.withOperator}\n` +
                      `With Website field: ${data.summary.withWebsite}\n` +
                      `With scraped_data.website: ${data.summary.withScrapedWebsite}\n` +
                      `With BOTH operator+website: ${data.summary.withBoth}\n` +
                      `Unique Operators: ${data.summary.uniqueOperators}\n` +
                      `NEED MIGRATION: ${data.summary.needsMigration}\n\n` +
                      `Check console for detailed breakdown`);
                  } else {
                    alert('Health check failed');
                  }
                } catch (error) {
                  console.error('Health check error:', error);
                  alert('Health check failed. Check console.');
                }
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              🏥 Run Health Check
            </button>
          </div>
        </TabsContent>
      </Tabs>

      {/* Village Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          {selectedVillage && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <DialogTitle>{selectedVillage.name}</DialogTitle>
                    <DialogDescription>
                      {selectedVillage.suburb}, {selectedVillage.state} {selectedVillage.postcode}
                    </DialogDescription>
                  </div>
                  {getStatusBadge(selectedVillage.status)}
                </div>
              </DialogHeader>

              <div className="space-y-6">
                {/* Basic Info */}
                <div>
                  <h4 className="mb-3">Basic Information</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Operator</Label>
                      <p className="text-sm">{selectedVillage.operator || 'Not provided'}</p>
                    </div>
                    <div>
                      <Label>Address</Label>
                      <p className="text-sm">{selectedVillage.location}</p>
                    </div>
                    <div>
                      <Label>Village Type</Label>
                      <p className="text-sm">{selectedVillage.village_type || 'Not specified'}</p>
                    </div>
                    <div>
                      <Label>Care Level</Label>
                      <p className="text-sm">{selectedVillage.care_level || 'Not specified'}</p>
                    </div>
                  </div>
                </div>

                {/* Pricing */}
                <div>
                  <h4 className="mb-3">Pricing</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Entry Price Range</Label>
                      <p className="text-sm">
                        {selectedVillage.entry_price_min && selectedVillage.entry_price_max
                          ? `$${selectedVillage.entry_price_min.toLocaleString()} - $${selectedVillage.entry_price_max.toLocaleString()}`
                          : 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <Label>Monthly Fees Range</Label>
                      <p className="text-sm">
                        {selectedVillage.monthly_fees_min && selectedVillage.monthly_fees_max
                          ? `$${selectedVillage.monthly_fees_min.toLocaleString()} - $${selectedVillage.monthly_fees_max.toLocaleString()}`
                          : 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <Label>DMF Structure</Label>
                      <p className="text-sm">{selectedVillage.dmf_structure || 'Not specified'}</p>
                    </div>
                    <div>
                      <Label>Pet Friendly</Label>
                      <p className="text-sm">{selectedVillage.pet_friendly ? 'Yes' : 'No'}</p>
                    </div>
                  </div>
                </div>

                {/* Contact */}
                <div>
                  <h4 className="mb-3">Contact Information</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Phone</Label>
                      <p className="text-sm">{selectedVillage.contact_phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <Label>Email</Label>
                      <p className="text-sm">{selectedVillage.contact_email || 'Not provided'}</p>
                    </div>
                    <div>
                      <Label>Website</Label>
                      <p className="text-sm">
                        {selectedVillage.website ? (
                          <a href={selectedVillage.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {selectedVillage.website}
                          </a>
                        ) : (
                          'Not provided'
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {selectedVillage.description && (
                  <div>
                    <Label>Description</Label>
                    <p className="text-sm mt-2">{selectedVillage.description}</p>
                  </div>
                )}

                {/* Amenities */}
                {selectedVillage.amenities?.length > 0 && (
                  <div>
                    <Label>Amenities</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedVillage.amenities.map((amenity, i) => (
                        <Badge key={i} variant="outline">{amenity}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Metadata */}
                <div className="pt-4 border-t">
                  <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                    <div>
                      <Label>Source</Label>
                      <p>{selectedVillage.source}</p>
                    </div>
                    <div>
                      <Label>Submitted</Label>
                      <p>{selectedVillage.submitted_at ? new Date(selectedVillage.submitted_at).toLocaleDateString() : 'N/A'}</p>
                    </div>
                    {selectedVillage.rejection_reason && (
                      <div className="md:col-span-2">
                        <Label>Rejection Reason</Label>
                        <p className="text-red-600">{selectedVillage.rejection_reason}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <DialogFooter className="gap-2">
                {selectedVillage.status === 'pending' && (
                  <>
                    <Button
                      onClick={() => handleApprove(selectedVillage.id)}
                      disabled={actionLoading}
                    >
                      <CheckCircle className="size-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        setShowDetailModal(false);
                        setShowRejectModal(true);
                      }}
                      disabled={actionLoading}
                    >
                      <XCircle className="size-4 mr-2" />
                      Reject
                    </Button>
                  </>
                )}
                <Button
                  variant="outline"
                  onClick={() => handleDelete(selectedVillage.id)}
                  disabled={actionLoading}
                >
                  <Trash2 className="size-4 mr-2" />
                  Delete
                </Button>
                <Button variant="outline" onClick={() => setShowDetailModal(false)}>
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Modal */}
      <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Submission</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this village submission.
            </DialogDescription>
          </DialogHeader>

          <div>
            <Label htmlFor="rejection-reason">Reason for Rejection</Label>
            <Textarea
              id="rejection-reason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g., Incomplete information, duplicate entry, invalid contact details..."
              rows={4}
              className="mt-2"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectModal(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectionReason.trim() || actionLoading}
            >
              Reject Submission
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Village Table Component
interface VillageTableProps {
  villages: Village[];
  onView: (village: Village) => void;
  onApprove?: (villageId: string) => void;
  onReject?: (village: Village) => void;
  onDelete?: (villageId: string) => void;
  actionLoading?: boolean;
}

function VillageTable({ villages, onView, onApprove, onReject, onDelete, actionLoading }: VillageTableProps) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Village Name</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Operator</TableHead>
            <TableHead>Entry Price</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {villages.map((village) => (
            <TableRow key={village.id}>
              <TableCell>
                <div>
                  <p>{village.name}</p>
                  <p className="text-xs text-muted-foreground">{village.village_type || 'N/A'}</p>
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  <p>{village.suburb}</p>
                  <p className="text-xs text-muted-foreground">{village.state} {village.postcode}</p>
                </div>
              </TableCell>
              <TableCell className="text-sm">{village.operator || 'N/A'}</TableCell>
              <TableCell className="text-sm">
                {village.entry_price_min ? `$${village.entry_price_min.toLocaleString()}` : 'N/A'}
              </TableCell>
              <TableCell>
                <div className="text-sm space-y-1">
                  {village.contact_phone && (
                    <p className="flex items-center gap-1">
                      <Phone className="size-3" />
                      {village.contact_phone}
                    </p>
                  )}
                  {village.contact_email && (
                    <p className="flex items-center gap-1">
                      <Mail className="size-3" />
                      {village.contact_email}
                    </p>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button size="sm" variant="outline" onClick={() => onView(village)}>
                    <Eye className="size-4" />
                  </Button>
                  {onApprove && (
                    <Button size="sm" onClick={() => onApprove(village.id)} disabled={actionLoading}>
                      <CheckCircle className="size-4" />
                    </Button>
                  )}
                  {onReject && (
                    <Button size="sm" variant="destructive" onClick={() => onReject(village)} disabled={actionLoading}>
                      <XCircle className="size-4" />
                    </Button>
                  )}
                  {onDelete && (
                    <Button size="sm" variant="outline" onClick={() => onDelete(village.id)} disabled={actionLoading}>
                      <Trash2 className="size-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}