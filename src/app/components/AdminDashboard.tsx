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
  Shield,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  MapPin,
  RefreshCw,
  Trash2,
  Phone,
  Mail,
  AlertCircle,
  Database,
  MessageSquare,
  Star,
  Users,
  Send,
  FileText,
  Copy,
} from 'lucide-react';

import { DataQualityDashboard } from './admin/DataQualityDashboard';
import { ReviewsManager } from './admin/ReviewsManager';
import { FeaturedVillagesManager } from './admin/FeaturedVillagesManager';
import { AgentLeadsManager } from './admin/AgentLeadsManager';
import { EmailTemplates } from './admin/EmailTemplates';
import { MarketingMaterials } from './admin/MarketingMaterials';
import { DataRecoveryDashboard } from './DataRecoveryDashboard';
import ErrorBoundary from './ErrorBoundary';

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
  const [activeTab, setActiveTab] = useState('overview');
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
          <TabsTrigger value="data-quality" className="flex-shrink-0">
            <Database className="size-4 mr-2" />
            Data Quality
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
          <TabsTrigger value="recovery" className="flex-shrink-0">
            <Shield className="size-4 mr-2" />
            Data Recovery
          </TabsTrigger>
        </TabsList>

        {/* Data Quality Tab */}
        <TabsContent value="data-quality" className="space-y-6">
          <DataQualityDashboard accessToken={accessToken || ''} />
        </TabsContent>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
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

        {/* Data Recovery Tab */}
        <TabsContent value="recovery" className="space-y-6">
          <ErrorBoundary>
            <DataRecoveryDashboard accessToken={accessToken} />
          </ErrorBoundary>
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
