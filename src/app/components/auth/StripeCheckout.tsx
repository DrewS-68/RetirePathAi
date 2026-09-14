import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { projectId } from '../../utils/supabase/info';
import { Loader2 } from 'lucide-react';

interface StripeCheckoutProps {
  membershipTier: 'premium' | 'family';
  duration: 1 | 3 | 6;
  amount: number;
  onCancel: () => void;
}

export function StripeCheckout({ membershipTier, duration, amount, onCancel }: StripeCheckoutProps) {
  const { accessToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleCheckout = async () => {
    if (!accessToken) {
      setError('Please sign in to continue');
      return;
    }

    if (!agreedToTerms) {
      setError('Please confirm you understand the subscription terms');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/create-checkout-session`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ 
            membershipTier,
            duration,
            amount 
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      setError(err.message || 'Failed to initiate checkout');
      setLoading(false);
    }
  };

  return (
    <div className="py-6">
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600 mb-2">You're subscribing to:</p>
        <p className="text-xl font-bold text-[#1B4332]">
          {membershipTier === 'premium' ? 'Premium' : 'Family'} - {duration} {duration === 1 ? 'Month' : 'Months'}
        </p>
        <p className="text-2xl font-bold text-[#2D6A4F] mt-2">${amount}</p>
        <p className="text-xs text-gray-500 mt-1">One-time payment, no auto-renewal</p>
      </div>

      {/* Clear Expiration Notice */}
      <div className="mb-6 p-4 bg-amber-50 border-2 border-amber-300 rounded-lg">
        <h4 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
          <span className="text-xl">⚠️</span>
          Important: Subscription Expiration
        </h4>
        <p className="text-sm text-amber-900 mb-3">
          Your subscription will <strong>automatically expire and end</strong> after {duration} {duration === 1 ? 'month' : 'months'} from today. 
          This is <strong>not</strong> an ongoing subscription.
        </p>
        <div className="bg-white/50 p-3 rounded border border-amber-200 text-sm text-amber-900 space-y-1">
          <p><strong>✓</strong> You will be charged ${amount} today (one-time payment)</p>
          <p><strong>✓</strong> You will have {duration} {duration === 1 ? 'month' : 'months'} of access</p>
          <p><strong>✓</strong> Your subscription will expire on <strong>{new Date(Date.now() + duration * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</strong></p>
          <p><strong>✓</strong> No automatic renewal or future charges</p>
          <p><strong>✓</strong> You can purchase a new subscription anytime before or after expiration</p>
        </div>
      </div>

      {/* Confirmation Checkbox */}
      <label className="flex items-start gap-3 mb-6 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
        <input
          type="checkbox"
          checked={agreedToTerms}
          onChange={(e) => setAgreedToTerms(e.target.checked)}
          className="mt-1 w-5 h-5 text-[#2D6A4F] border-gray-300 rounded focus:ring-[#2D6A4F] cursor-pointer"
        />
        <span className="text-sm text-gray-700">
          I understand that this is a <strong>one-time payment of ${amount}</strong> for <strong>{duration} {duration === 1 ? 'month' : 'months'} of access</strong>, 
          and my subscription will <strong>automatically expire</strong> after this period with no future charges.
        </span>
      </label>

      <p className="text-gray-700 mb-6 text-sm text-center">
        You'll be redirected to Stripe to complete your payment securely.
      </p>

      <div className="flex gap-3 justify-center">
        <button
          onClick={onCancel}
          disabled={loading}
          className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={handleCheckout}
          disabled={loading || !agreedToTerms}
          className="px-6 py-3 bg-[#2D6A4F] text-white rounded-lg hover:bg-[#1B4332] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? 'Redirecting...' : 'Continue to Payment'}
        </button>
      </div>
    </div>
  );
}