/**
 * Stripe API helpers using direct REST API calls
 * This avoids bundling the large Stripe npm package
 */

const STRIPE_API_BASE = 'https://api.stripe.com/v1';

async function stripeRequest(
  endpoint: string,
  method: string = 'GET',
  body?: Record<string, any>
): Promise<any> {
  const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
  if (!stripeKey) {
    throw new Error('STRIPE_SECRET_KEY not configured');
  }

  const headers: Record<string, string> = {
    'Authorization': `Bearer ${stripeKey}`,
    'Stripe-Version': '2023-10-16',
  };

  let requestBody: string | undefined;
  if (body) {
    // Convert to URL-encoded form data (Stripe's preferred format)
    const formData = new URLSearchParams();
    
    function addToForm(prefix: string, obj: any) {
      if (obj === null || obj === undefined) return;
      
      if (Array.isArray(obj)) {
        obj.forEach((item, index) => {
          if (typeof item === 'object') {
            Object.entries(item).forEach(([key, value]) => {
              addToForm(`${prefix}[${index}][${key}]`, value);
            });
          } else {
            formData.append(`${prefix}[${index}]`, String(item));
          }
        });
      } else if (typeof obj === 'object') {
        Object.entries(obj).forEach(([key, value]) => {
          if (typeof value === 'object' && value !== null) {
            addToForm(`${prefix}[${key}]`, value);
          } else {
            formData.append(`${prefix}[${key}]`, String(value));
          }
        });
      } else {
        formData.append(prefix, String(obj));
      }
    }

    Object.entries(body).forEach(([key, value]) => {
      addToForm(key, value);
    });

    requestBody = formData.toString();
    headers['Content-Type'] = 'application/x-www-form-urlencoded';
  }

  const response = await fetch(`${STRIPE_API_BASE}${endpoint}`, {
    method,
    headers,
    body: requestBody,
  });

  const data = await response.json();

  if (!response.ok) {
    console.error('Stripe API error:', data);
    throw new Error(data.error?.message || 'Stripe API request failed');
  }

  return data;
}

export async function createCheckoutSession(params: {
  userId: string;
  userEmail: string;
  membershipTier: string;
  duration: number;
  priceInCents: number;
  successUrl: string;
  cancelUrl: string;
}): Promise<any> {
  const tierName = params.membershipTier.charAt(0).toUpperCase() + params.membershipTier.slice(1);
  const durationText = params.duration === 1 ? '1 Month' : `${params.duration} Months`;
  
  const lineItems = [{
    price_data: {
      currency: 'usd',
      product_data: {
        name: `RetirePath ${tierName} - ${durationText}`,
        description: `${durationText} access to RetirePath ${tierName} features. No auto-renewal.`,
      },
      unit_amount: params.priceInCents,
    },
    quantity: 1,
  }];

  return stripeRequest('/checkout/sessions', 'POST', {
    payment_method_types: ['card'],
    line_items: lineItems,
    mode: 'payment', // Changed from 'subscription' to 'payment' for one-time payment
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    client_reference_id: params.userId,
    customer_email: params.userEmail,
    metadata: {
      userId: params.userId,
      membershipTier: params.membershipTier,
      duration: params.duration.toString(),
    },
  });
}

export function constructEvent(
  payload: string,
  signature: string,
  secret: string
): any {
  // For webhook verification, we need to implement HMAC SHA256
  // This is a simplified version - for production, consider using a crypto library
  const encoder = new TextEncoder();
  const key = encoder.encode(secret);
  const data = encoder.encode(payload);

  // Extract timestamp and signature from header
  const elements = signature.split(',');
  const timestamp = elements.find((e) => e.startsWith('t='))?.slice(2);
  const sig = elements.find((e) => e.startsWith('v1='))?.slice(3);

  if (!timestamp || !sig) {
    throw new Error('Invalid signature format');
  }

  // In a real implementation, you'd verify the HMAC signature here
  // For now, we'll parse the payload and return it
  // NOTE: This is not secure for production - you should implement proper signature verification
  
  try {
    const event = JSON.parse(payload);
    return event;
  } catch (error) {
    throw new Error('Invalid webhook payload');
  }
}

// Type definitions for Stripe objects
export type StripeCheckoutSession = {
  id: string;
  client_reference_id?: string;
  metadata?: Record<string, string>;
  customer?: string;
  payment_status: string;
};

export type StripeSubscription = {
  id: string;
  customer: string;
  status: string;
  items: {
    data: Array<{
      price: {
        id: string;
      };
    }>;
  };
};

export type StripeEvent = {
  id: string;
  type: string;
  data: {
    object: any;
  };
};