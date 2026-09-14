import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import {
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Building,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  Plus,
  Info,
} from 'lucide-react';
import { projectId } from '../utils/supabase/info';
import { useAuth } from '../contexts/AuthContext';

interface Village {
  id: string;
  name: string;
  operator: string | null;
  location: string;
  suburb: string;
  postcode: string;
  state: string;
  village_type: string | null;
  care_level: string | null;
  entry_price_min: number | null;
  entry_price_max: number | null;
  monthly_fees_min: number | null;
  monthly_fees_max: number | null;
  contact_phone: string | null;
  contact_email: string | null;
  website: string | null;
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: string | null;
  approved_at: string | null;
  rejected_at: string | null;
  rejection_reason: string | null;
}

interface Stats {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
}

export function OperatorDashboard() {
  const { user, accessToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [villages, setVillages] = useState<Village[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, approved: 0, pending: 0, rejected: 0 });
  const [selectedVillage, setSelectedVillage] = useState<Village | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Check if user is authenticated
  if (!user || !accessToken) {
    return (
      <div className="max-w-4xl mx-auto">
        <Alert>
          <AlertCircle className="size-4" />
          <AlertDescription>
            <strong>Login Required</strong>
            <p className="mt-2">You must be logged in to access the Operator Dashboard.</p>
            <p className="text-sm mt-2">Please log in to view and manage your village submissions.</p>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Fetch user's villages
  const fetchMyVillages = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/villages/my-submissions`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch villages');
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
      setError(err instanceof Error ? err.message : 'Failed to load your villages');
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount
  useEffect(() => {
    // Only fetch if we have valid auth credentials
    if (accessToken && user) {
      fetchMyVillages().catch((err) => {
        console.error('Initial fetch failed:', err);
        // Error is already handled in fetchMyVillages
      });
    }
  }, [accessToken, user]);

  // Delete village
  const handleDelete = async (villageId: string) => {
    if (!confirm('Are you sure you want to delete this village submission?')) {
      return;
    }

    try {
      setError(null);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/villages/my-submissions/${villageId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete village');
      }

      // Refresh villages
      await fetchMyVillages();
      setShowDetailModal(false);
      setSelectedVillage(null);
    } catch (err) {
      console.error('Error deleting village:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete village');
    }
  };

  // View details
  const handleViewDetails = (village: Village) => {
    setSelectedVillage(village);
    setShowDetailModal(true);
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-600"><CheckCircle className="size-3 mr-1" />Live</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-600"><Clock className="size-3 mr-1" />Under Review</Badge>;
      case 'rejected':
        return <Badge className="bg-red-600"><XCircle className="size-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="mb-2">My Village Submissions</h1>
        <p className="text-muted-foreground">
          Manage your retirement village listings
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Submissions</p>
              <p className="text-3xl mt-2">{stats.total}</p>
            </div>
            <Building className="size-8 text-muted-foreground" />
          </div>
        </Card>

        <Card className="p-6 bg-green-50 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700">Live</p>
              <p className="text-3xl text-green-700 mt-2">{stats.approved}</p>
            </div>
            <CheckCircle className="size-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-6 bg-yellow-50 border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-700">Under Review</p>
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

      {/* Info Banner */}
      <Alert>
        <Info className="size-4" />
        <AlertDescription>
          <strong>How it works:</strong> Submit your villages and we'll review them within 2-3 business days. 
          Once approved, they'll appear in our Village Matcher for thousands of retirees to discover. 
          You can edit pending or rejected submissions at any time.
        </AlertDescription>
      </Alert>

      {/* Villages List */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3>Your Villages</h3>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={fetchMyVillages} disabled={loading}>
              <RefreshCw className={`size-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button size="sm" onClick={() => window.location.hash = 'list-village'}>
              <Plus className="size-4 mr-2" />
              Add New Village
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">
            <RefreshCw className="size-8 mx-auto mb-4 animate-spin" />
            <p>Loading your villages...</p>
          </div>
        ) : villages.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Building className="size-12 mx-auto mb-4 opacity-50" />
            <p className="mb-2">You haven't submitted any villages yet</p>
            <p className="text-sm mb-4">Get started by adding your first retirement village</p>
            <Button onClick={() => window.location.hash = 'list-village'}>
              <Plus className="size-4 mr-2" />
              Submit Your First Village
            </Button>
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Village Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
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
                    <TableCell>{getStatusBadge(village.status)}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {village.submitted_at 
                          ? new Date(village.submitted_at).toLocaleDateString()
                          : 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleViewDetails(village)}>
                          <Eye className="size-4 mr-1" />
                          View
                        </Button>
                        {(village.status === 'pending' || village.status === 'rejected') && (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                // Store village data in sessionStorage for editing
                                sessionStorage.setItem('editingVillage', JSON.stringify(village));
                                window.location.hash = 'list-village';
                              }}
                            >
                              <Edit className="size-4 mr-1" />
                              Edit
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleDelete(village.id)}
                            >
                              <Trash2 className="size-4 mr-1" />
                              Delete
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

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
                {/* Status Info */}
                {selectedVillage.status === 'approved' && (
                  <Alert className="bg-green-50 border-green-200">
                    <CheckCircle className="size-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      <strong>Your village is live!</strong> It's now visible to retirees searching on RetirePath.
                      {selectedVillage.approved_at && (
                        <p className="text-sm mt-1">
                          Approved on {new Date(selectedVillage.approved_at).toLocaleDateString()}
                        </p>
                      )}
                    </AlertDescription>
                  </Alert>
                )}

                {selectedVillage.status === 'pending' && (
                  <Alert className="bg-yellow-50 border-yellow-200">
                    <Clock className="size-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-800">
                      <strong>Under review</strong> - Our team is reviewing your submission. 
                      We'll notify you within 2-3 business days.
                    </AlertDescription>
                  </Alert>
                )}

                {selectedVillage.status === 'rejected' && selectedVillage.rejection_reason && (
                  <Alert variant="destructive">
                    <XCircle className="size-4" />
                    <AlertDescription>
                      <strong>Submission rejected</strong>
                      <p className="mt-2">{selectedVillage.rejection_reason}</p>
                      <p className="text-sm mt-2">You can edit and resubmit this village.</p>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Village Details */}
                <div>
                  <h4 className="mb-3">Basic Information</h4>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Operator</p>
                      <p>{selectedVillage.operator || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Address</p>
                      <p>{selectedVillage.location || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Village Type</p>
                      <p>{selectedVillage.village_type || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Care Level</p>
                      <p>{selectedVillage.care_level || 'Not specified'}</p>
                    </div>
                  </div>
                </div>

                {/* Pricing */}
                {(selectedVillage.entry_price_min || selectedVillage.monthly_fees_min) && (
                  <div>
                    <h4 className="mb-3">Pricing</h4>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      {selectedVillage.entry_price_min && (
                        <div>
                          <p className="text-muted-foreground">Entry Price Range</p>
                          <p>
                            ${selectedVillage.entry_price_min.toLocaleString()} 
                            {selectedVillage.entry_price_max && ` - $${selectedVillage.entry_price_max.toLocaleString()}`}
                          </p>
                        </div>
                      )}
                      {selectedVillage.monthly_fees_min && (
                        <div>
                          <p className="text-muted-foreground">Monthly Fees Range</p>
                          <p>
                            ${selectedVillage.monthly_fees_min.toLocaleString()}/mo
                            {selectedVillage.monthly_fees_max && ` - $${selectedVillage.monthly_fees_max.toLocaleString()}/mo`}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Contact */}
                <div>
                  <h4 className="mb-3">Contact Information</h4>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Phone</p>
                      <p>{selectedVillage.contact_phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Email</p>
                      <p>{selectedVillage.contact_email}</p>
                    </div>
                    {selectedVillage.website && (
                      <div className="md:col-span-2">
                        <p className="text-muted-foreground">Website</p>
                        <a 
                          href={selectedVillage.website} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-blue-600 hover:underline"
                        >
                          {selectedVillage.website}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Metadata */}
                <div className="pt-4 border-t">
                  <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                    <div>
                      <p>Submitted</p>
                      <p>{selectedVillage.submitted_at ? new Date(selectedVillage.submitted_at).toLocaleString() : 'N/A'}</p>
                    </div>
                    {selectedVillage.approved_at && (
                      <div>
                        <p>Approved</p>
                        <p>{new Date(selectedVillage.approved_at).toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <DialogFooter className="gap-2">
                {(selectedVillage.status === 'pending' || selectedVillage.status === 'rejected') && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => {
                        sessionStorage.setItem('editingVillage', JSON.stringify(selectedVillage));
                        window.location.hash = 'list-village';
                      }}
                    >
                      <Edit className="size-4 mr-2" />
                      Edit & Resubmit
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleDelete(selectedVillage.id)}
                    >
                      <Trash2 className="size-4 mr-2" />
                      Delete
                    </Button>
                  </>
                )}
                <Button variant="outline" onClick={() => setShowDetailModal(false)}>
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}