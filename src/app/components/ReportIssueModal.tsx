import { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { X, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface ReportIssueModalProps {
  villageId: string;
  villageName: string;
  onClose: () => void;
}

export function ReportIssueModal({ villageId, villageName, onClose }: ReportIssueModalProps) {
  const [issueType, setIssueType] = useState('');
  const [description, setDescription] = useState('');
  const [reporterEmail, setReporterEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const issueTypes = [
    { value: 'broken_website', label: 'Website link is broken or incorrect' },
    { value: 'outdated_info', label: 'Information is outdated' },
    { value: 'incorrect_pricing', label: 'Pricing information is incorrect' },
    { value: 'incorrect_contact', label: 'Contact details are wrong' },
    { value: 'incorrect_location', label: 'Location or address is wrong' },
    { value: 'missing_info', label: 'Missing important information' },
    { value: 'inappropriate', label: 'Inappropriate or spam content' },
    { value: 'other', label: 'Other issue' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!issueType || !description.trim()) {
      setError('Please select an issue type and provide a description');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/issue-reports/submit`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            villageId,
            villageName,
            issueType,
            description: description.trim(),
            reporterEmail: reporterEmail.trim() || undefined,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit report');
      }

      setSuccess(true);
      
      // Close modal after 2 seconds
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: any) {
      console.error('Error submitting issue report:', err);
      setError(err.message || 'Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <Card className="max-w-md w-full p-6 text-center">
          <CheckCircle2 className="size-12 text-emerald-600 mx-auto mb-4" />
          <h3 className="text-xl mb-2">Report Submitted!</h3>
          <p className="text-muted-foreground">
            Thank you for helping us keep our village information accurate and up-to-date.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-6 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="size-5 text-orange-600" />
              <h2 className="text-2xl">Report an Issue</h2>
            </div>
            <p className="text-muted-foreground">
              Help us improve by reporting incorrect or outdated information about <span className="font-medium">{villageName}</span>
            </p>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="flex-shrink-0"
          >
            <X className="size-5" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Issue Type */}
          <div>
            <label className="block font-medium mb-2">
              What type of issue are you reporting? <span className="text-red-600">*</span>
            </label>
            <div className="space-y-2">
              {issueTypes.map((type) => (
                <label
                  key={type.value}
                  className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                    issueType === type.value
                      ? 'border-emerald-600 bg-emerald-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="issueType"
                    value={type.value}
                    checked={issueType === type.value}
                    onChange={(e) => setIssueType(e.target.value)}
                    className="w-4 h-4 text-emerald-600"
                  />
                  <span>{type.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block font-medium mb-2">
              Please describe the issue in detail <span className="text-red-600">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide as much detail as possible to help us fix the issue..."
              rows={5}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
              required
            />
            <p className="text-sm text-muted-foreground mt-1">
              {description.length}/500 characters
            </p>
          </div>

          {/* Email (Optional) */}
          <div>
            <label className="block font-medium mb-2">
              Your email (optional)
            </label>
            <input
              type="email"
              value={reporterEmail}
              onChange={(e) => setReporterEmail(e.target.value)}
              placeholder="email@example.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
            />
            <p className="text-sm text-muted-foreground mt-1">
              We'll only use this to follow up if needed
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1"
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              disabled={submitting || !issueType || !description.trim()}
            >
              {submitting ? 'Submitting...' : 'Submit Report'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
