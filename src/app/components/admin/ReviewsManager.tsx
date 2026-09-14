import { useState, useEffect } from 'react';
import { projectId } from '../../utils/supabase/info';
import { Star, CheckCircle, XCircle, Eye, Trash2, RefreshCw, MessageSquare } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

interface Review {
  id: string;
  village_id: string;
  user_email: string;
  rating: number;
  title: string;
  comment: string;
  experience_type: string | null;
  stayed_duration: string | null;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason: string | null;
  helpful_count: number;
  created_at: string;
  retirement_villages?: {
    id: string;
    name: string;
    suburb: string;
    state: string;
  };
}

interface ReviewsManagerProps {
  accessToken: string;
}

export function ReviewsManager({ accessToken }: ReviewsManagerProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/reviews/admin/all`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }

      const data = await response.json();
      setReviews(data.reviews || []);
    } catch (err: any) {
      console.error('Error fetching reviews:', err);
      setError('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (reviewId: string) => {
    try {
      setActionLoading(true);
      setError(null);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/reviews/admin/${reviewId}/approve`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to approve review');
      }

      await fetchReviews();
      setShowDetailModal(false);
      setSelectedReview(null);
    } catch (err: any) {
      console.error('Error approving review:', err);
      setError('Failed to approve review');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedReview) return;

    try {
      setActionLoading(true);
      setError(null);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/reviews/admin/${selectedReview.id}/reject`,
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
        throw new Error('Failed to reject review');
      }

      await fetchReviews();
      setShowRejectModal(false);
      setShowDetailModal(false);
      setSelectedReview(null);
      setRejectionReason('');
    } catch (err: any) {
      console.error('Error rejecting review:', err);
      setError('Failed to reject review');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm('Are you sure you want to permanently delete this review?')) {
      return;
    }

    try {
      setActionLoading(true);
      setError(null);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/reviews/admin/${reviewId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete review');
      }

      await fetchReviews();
      setShowDetailModal(false);
      setSelectedReview(null);
    } catch (err: any) {
      console.error('Error deleting review:', err);
      setError('Failed to delete review');
    } finally {
      setActionLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`size-4 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-600"><CheckCircle className="size-3 mr-1" />Approved</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-600"><MessageSquare className="size-3 mr-1" />Pending</Badge>;
      case 'rejected':
        return <Badge className="bg-red-600"><XCircle className="size-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const pendingReviews = reviews.filter(r => r.status === 'pending');
  const approvedReviews = reviews.filter(r => r.status === 'approved');
  const rejectedReviews = reviews.filter(r => r.status === 'rejected');

  const stats = {
    total: reviews.length,
    pending: pendingReviews.length,
    approved: approvedReviews.length,
    rejected: rejectedReviews.length,
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading reviews...</div>;
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Total Reviews</div>
          <div className="text-2xl mt-1">{stats.total}</div>
        </Card>
        <Card className="p-4 bg-yellow-50 border-yellow-200">
          <div className="text-sm text-yellow-700">Pending</div>
          <div className="text-2xl text-yellow-700 mt-1">{stats.pending}</div>
        </Card>
        <Card className="p-4 bg-green-50 border-green-200">
          <div className="text-sm text-green-700">Approved</div>
          <div className="text-2xl text-green-700 mt-1">{stats.approved}</div>
        </Card>
        <Card className="p-4 bg-red-50 border-red-200">
          <div className="text-sm text-red-700">Rejected</div>
          <div className="text-2xl text-red-700 mt-1">{stats.rejected}</div>
        </Card>
      </div>

      {/* Refresh Button */}
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={fetchReviews} disabled={loading}>
          <RefreshCw className={`size-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Reviews Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">
            Pending ({stats.pending})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved ({stats.approved})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected ({stats.rejected})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4 mt-6">
          {pendingReviews.length === 0 ? (
            <Card className="p-8 text-center">
              <MessageSquare className="size-12 mx-auto mb-4 text-gray-300" />
              <p className="text-muted-foreground">No pending reviews</p>
            </Card>
          ) : (
            pendingReviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                onView={() => {
                  setSelectedReview(review);
                  setShowDetailModal(true);
                }}
                onApprove={() => handleApprove(review.id)}
                onReject={() => {
                  setSelectedReview(review);
                  setShowRejectModal(true);
                }}
                actionLoading={actionLoading}
                renderStars={renderStars}
                getStatusBadge={getStatusBadge}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4 mt-6">
          {approvedReviews.length === 0 ? (
            <Card className="p-8 text-center">
              <CheckCircle className="size-12 mx-auto mb-4 text-gray-300" />
              <p className="text-muted-foreground">No approved reviews</p>
            </Card>
          ) : (
            approvedReviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                onView={() => {
                  setSelectedReview(review);
                  setShowDetailModal(true);
                }}
                onDelete={() => handleDelete(review.id)}
                actionLoading={actionLoading}
                renderStars={renderStars}
                getStatusBadge={getStatusBadge}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4 mt-6">
          {rejectedReviews.length === 0 ? (
            <Card className="p-8 text-center">
              <XCircle className="size-12 mx-auto mb-4 text-gray-300" />
              <p className="text-muted-foreground">No rejected reviews</p>
            </Card>
          ) : (
            rejectedReviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                onView={() => {
                  setSelectedReview(review);
                  setShowDetailModal(true);
                }}
                onDelete={() => handleDelete(review.id)}
                actionLoading={actionLoading}
                renderStars={renderStars}
                getStatusBadge={getStatusBadge}
              />
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Review Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-2xl">
          {selectedReview && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <DialogTitle>{selectedReview.title}</DialogTitle>
                    <DialogDescription>
                      {selectedReview.retirement_villages?.name || 'Unknown Village'}
                    </DialogDescription>
                  </div>
                  {getStatusBadge(selectedReview.status)}
                </div>
              </DialogHeader>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  {renderStars(selectedReview.rating)}
                  <span className="text-sm text-muted-foreground">
                    {selectedReview.rating} out of 5 stars
                  </span>
                </div>

                <div>
                  <Label>Review</Label>
                  <p className="text-sm mt-2 whitespace-pre-wrap">{selectedReview.comment}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <Label>Reviewer</Label>
                    <p className="text-sm">{selectedReview.user_email}</p>
                  </div>
                  <div>
                    <Label>Date</Label>
                    <p className="text-sm">{new Date(selectedReview.created_at).toLocaleDateString()}</p>
                  </div>
                  {selectedReview.experience_type && (
                    <div>
                      <Label>Experience Type</Label>
                      <p className="text-sm">{selectedReview.experience_type}</p>
                    </div>
                  )}
                  {selectedReview.stayed_duration && (
                    <div>
                      <Label>Duration</Label>
                      <p className="text-sm">{selectedReview.stayed_duration}</p>
                    </div>
                  )}
                </div>

                {selectedReview.rejection_reason && (
                  <div className="pt-4 border-t">
                    <Label>Rejection Reason</Label>
                    <p className="text-sm text-red-600 mt-2">{selectedReview.rejection_reason}</p>
                  </div>
                )}
              </div>

              <DialogFooter className="gap-2">
                {selectedReview.status === 'pending' && (
                  <>
                    <Button onClick={() => handleApprove(selectedReview.id)} disabled={actionLoading}>
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
                <Button variant="outline" onClick={() => handleDelete(selectedReview.id)} disabled={actionLoading}>
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
            <DialogTitle>Reject Review</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this review.
            </DialogDescription>
          </DialogHeader>

          <div>
            <Label htmlFor="rejection-reason">Reason for Rejection</Label>
            <Textarea
              id="rejection-reason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g., Inappropriate language, spam, not relevant..."
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
              Reject Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Review Card Component
interface ReviewCardProps {
  review: Review;
  onView: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  onDelete?: () => void;
  actionLoading: boolean;
  renderStars: (rating: number) => JSX.Element;
  getStatusBadge: (status: string) => JSX.Element;
}

function ReviewCard({
  review,
  onView,
  onApprove,
  onReject,
  onDelete,
  actionLoading,
  renderStars,
  getStatusBadge,
}: ReviewCardProps) {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            {renderStars(review.rating)}
            <h4 className="text-lg">{review.title}</h4>
            {getStatusBadge(review.status)}
          </div>
          <p className="text-sm text-muted-foreground mb-2">
            {review.retirement_villages?.name || 'Unknown Village'} • {review.user_email}
          </p>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {review.comment}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" onClick={onView}>
          <Eye className="size-4 mr-2" />
          View
        </Button>
        {onApprove && (
          <Button size="sm" onClick={onApprove} disabled={actionLoading}>
            <CheckCircle className="size-4 mr-2" />
            Approve
          </Button>
        )}
        {onReject && (
          <Button size="sm" variant="destructive" onClick={onReject} disabled={actionLoading}>
            <XCircle className="size-4 mr-2" />
            Reject
          </Button>
        )}
        {onDelete && (
          <Button size="sm" variant="outline" onClick={onDelete} disabled={actionLoading}>
            <Trash2 className="size-4" />
          </Button>
        )}
      </div>
    </Card>
  );
}
