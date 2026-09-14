import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { projectId } from '../utils/supabase/info';
import { Star, Send, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Alert, AlertDescription } from './ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

interface ReviewSubmissionFormProps {
  villageId: string;
  villageName: string;
  onSuccess?: () => void;
}

export function ReviewSubmissionForm({ villageId, villageName, onSuccess }: ReviewSubmissionFormProps) {
  const { user, accessToken } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [experienceType, setExperienceType] = useState('');
  const [stayedDuration, setStayedDuration] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !accessToken) {
      setError('Please log in to submit a review');
      return;
    }

    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    if (!title.trim() || !comment.trim()) {
      setError('Please provide both a title and comment');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/reviews`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            village_id: villageId,
            rating,
            title,
            comment,
            experience_type: experienceType || null,
            stayed_duration: stayedDuration || null,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit review');
      }

      setSuccess(true);
      setRating(0);
      setTitle('');
      setComment('');
      setExperienceType('');
      setStayedDuration('');
      
      if (onSuccess) {
        onSuccess();
      }

      // Reset success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000);
    } catch (err: any) {
      console.error('Error submitting review:', err);
      setError(err.message || 'Failed to submit review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Card className="p-6">
        <Alert>
          <AlertCircle className="size-4" />
          <AlertDescription>
            Please log in to write a review for {villageName}
          </AlertDescription>
        </Alert>
      </Card>
    );
  }

  if (success) {
    return (
      <Card className="p-6">
        <Alert className="bg-green-50 border-green-200">
          <AlertDescription className="text-green-800">
            <strong>Thank you for your review!</strong>
            <p className="mt-2">Your review has been submitted and is pending approval. It will be visible once our team has reviewed it.</p>
          </AlertDescription>
        </Alert>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="mb-4">Write a Review for {villageName}</h3>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="size-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Star Rating */}
        <div>
          <Label>Your Rating *</Label>
          <div className="flex items-center gap-2 mt-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="focus:outline-none transition-transform hover:scale-110"
              >
                <Star
                  className={`size-8 ${
                    star <= (hoveredRating || rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
            <span className="ml-2 text-sm text-muted-foreground">
              {rating > 0 && `${rating} out of 5 stars`}
            </span>
          </div>
        </div>

        {/* Review Title */}
        <div>
          <Label htmlFor="title">Review Title *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Summarize your experience"
            maxLength={100}
            required
            className="mt-2"
          />
          <p className="text-xs text-muted-foreground mt-1">
            {title.length}/100 characters
          </p>
        </div>

        {/* Review Comment */}
        <div>
          <Label htmlFor="comment">Your Review *</Label>
          <Textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with this retirement village. What did you like? What could be improved?"
            rows={6}
            maxLength={2000}
            required
            className="mt-2"
          />
          <p className="text-xs text-muted-foreground mt-1">
            {comment.length}/2000 characters
          </p>
        </div>

        {/* Experience Type */}
        <div>
          <Label htmlFor="experienceType">Your Connection (Optional)</Label>
          <Select value={experienceType} onValueChange={setExperienceType}>
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Select your connection to this village" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current_resident">Current Resident</SelectItem>
              <SelectItem value="past_resident">Past Resident</SelectItem>
              <SelectItem value="family_member">Family Member of Resident</SelectItem>
              <SelectItem value="visitor">Visitor</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stay Duration (only show for residents) */}
        {(experienceType === 'current_resident' || experienceType === 'past_resident') && (
          <div>
            <Label htmlFor="stayedDuration">How Long? (Optional)</Label>
            <Select value={stayedDuration} onValueChange={setStayedDuration}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="less_than_1_year">Less than 1 year</SelectItem>
                <SelectItem value="1_2_years">1-2 years</SelectItem>
                <SelectItem value="3_5_years">3-5 years</SelectItem>
                <SelectItem value="5_plus_years">5+ years</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Submit Button */}
        <Button type="submit" disabled={loading || rating === 0} className="w-full">
          <Send className="size-4 mr-2" />
          {loading ? 'Submitting...' : 'Submit Review'}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          Your review will be published after moderation to ensure quality and authenticity
        </p>
      </form>
    </Card>
  );
}
