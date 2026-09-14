import { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { Star, ThumbsUp, User, Calendar } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';

interface Review {
  id: string;
  village_id: string;
  user_email: string;
  rating: number;
  title: string;
  comment: string;
  experience_type: string | null;
  stayed_duration: string | null;
  helpful_count: number;
  created_at: string;
}

interface VillageReviewsProps {
  villageId: string;
}

export function VillageReviews({ villageId }: VillageReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReviews();
  }, [villageId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/reviews/village/${villageId}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }

      const data = await response.json();
      setReviews(data.reviews || []);
      setReviewCount(data.count || 0);
      setAverageRating(data.averageRating || 0);
    } catch (err: any) {
      console.error('Error fetching reviews:', err);
      setError('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleHelpful = async (reviewId: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/reviews/${reviewId}/helpful`,
        {
          method: 'PUT',
        }
      );

      if (response.ok) {
        // Refresh reviews to show updated helpful count
        fetchReviews();
      }
    } catch (err) {
      console.error('Error marking review as helpful:', err);
    }
  };

  const formatExperienceType = (type: string | null) => {
    if (!type) return null;
    
    const types: Record<string, string> = {
      current_resident: 'Current Resident',
      past_resident: 'Past Resident',
      family_member: 'Family Member',
      visitor: 'Visitor',
    };
    
    return types[type] || type;
  };

  const formatDuration = (duration: string | null) => {
    if (!duration) return null;
    
    const durations: Record<string, string> = {
      less_than_1_year: '< 1 year',
      '1_2_years': '1-2 years',
      '3_5_years': '3-5 years',
      '5_plus_years': '5+ years',
    };
    
    return durations[duration] || duration;
  };

  const renderStars = (rating: number, size: 'sm' | 'lg' = 'sm') => {
    const starSize = size === 'sm' ? 'size-4' : 'size-6';
    
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${starSize} ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Loading reviews...
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Reviews Summary */}
      {reviewCount > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="text-4xl">{averageRating.toFixed(1)}</div>
                {renderStars(Math.round(averageRating), 'lg')}
              </div>
              <p className="text-sm text-muted-foreground">
                Based on {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
              </p>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-1">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = reviews.filter(r => r.rating === stars).length;
                const percentage = reviewCount > 0 ? (count / reviewCount) * 100 : 0;
                
                return (
                  <div key={stars} className="flex items-center gap-2 text-sm">
                    <span className="w-8">{stars} ★</span>
                    <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-400"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="w-8 text-muted-foreground">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <Card className="p-8 text-center">
          <Star className="size-12 mx-auto mb-4 text-gray-300" />
          <p className="text-muted-foreground">No reviews yet</p>
          <p className="text-sm text-muted-foreground mt-2">
            Be the first to share your experience with this village
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id} className="p-6">
              {/* Review Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {renderStars(review.rating)}
                    <h4 className="text-lg">{review.title}</h4>
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="size-3" />
                      {review.user_email.split('@')[0]}
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Calendar className="size-3" />
                      {new Date(review.created_at).toLocaleDateString()}
                    </div>
                    
                    {review.experience_type && (
                      <Badge variant="outline">
                        {formatExperienceType(review.experience_type)}
                      </Badge>
                    )}
                    
                    {review.stayed_duration && (
                      <Badge variant="outline">
                        {formatDuration(review.stayed_duration)}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Review Comment */}
              <p className="text-muted-foreground mb-4 whitespace-pre-wrap">
                {review.comment}
              </p>

              {/* Helpful Button */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleHelpful(review.id)}
                >
                  <ThumbsUp className="size-4 mr-2" />
                  Helpful {review.helpful_count > 0 && `(${review.helpful_count})`}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}