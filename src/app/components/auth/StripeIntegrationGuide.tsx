/**
 * STRIPE INTEGRATION GUIDE
 * 
 * This component provides instructions for integrating Stripe payments.
 * To add actual payment processing, follow these steps:
 * 
 * 1. CREATE A STRIPE ACCOUNT
 *    - Sign up at https://stripe.com
 *    - Get your Publishable Key and Secret Key from the dashboard
 * 
 * 2. INSTALL STRIPE LIBRARIES
 *    - Frontend: npm install @stripe/stripe-js
 *    - Backend: Already available in Deno via npm:stripe
 * 
 * 3. ADD STRIPE KEYS TO ENVIRONMENT
 *    - In Supabase Dashboard -> Settings -> Edge Functions -> Secrets
 *    - Add: STRIPE_SECRET_KEY (your secret key)
 *    - Add: STRIPE_PUBLISHABLE_KEY (your publishable key)
 * 
 * 4. CREATE A STRIPE CHECKOUT SESSION (Backend)
 *    Add this endpoint to /supabase/functions/server/index.tsx:
 * 
 *    import Stripe from 'npm:stripe';
 * 
 *    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
 *      apiVersion: '2023-10-16',
 *    });
 * 
 *    app.post('/make-server-3bba8be8/create-checkout-session', async (c) => {
 *      const { membershipTier, userId } = await c.req.json();
 *      
 *      const prices = {
 *        premium: 2900, // $29.00 in cents
 *        family: 4900,  // $49.00 in cents
 *      };
 * 
 *      const session = await stripe.checkout.sessions.create({
 *        payment_method_types: ['card'],
 *        line_items: [
 *          {
 *            price_data: {
 *              currency: 'usd',
 *              product_data: {
 *                name: `RetirePath - ${membershipTier}`,
 *              },
 *              unit_amount: prices[membershipTier],
 *              recurring: {
 *                interval: 'month',
 *              },
 *            },
 *            quantity: 1,
 *          },
 *        ],
 *        mode: 'subscription',
 *        success_url: `${Deno.env.get('APP_URL')}/success?session_id={CHECKOUT_SESSION_ID}`,
 *        cancel_url: `${Deno.env.get('APP_URL')}/canceled`,
 *        client_reference_id: userId,
 *      });
 * 
 *      return c.json({ sessionId: session.id });
 *    });
 * 
 * 5. CREATE CHECKOUT COMPONENT (Frontend)
 *    In MembershipPlans.tsx, modify the button click to:
 * 
 *    import { loadStripe } from '@stripe/stripe-js';
 * 
 *    const stripePromise = loadStripe(process.env.STRIPE_PUBLISHABLE_KEY!);
 * 
 *    const handleCheckout = async (tier) => {
 *      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/create-checkout-session`, {
 *        method: 'POST',
 *        headers: {
 *          'Content-Type': 'application/json',
 *          'Authorization': `Bearer ${accessToken}`,
 *        },
 *        body: JSON.stringify({
 *          membershipTier: tier,
 *          userId: user.id,
 *        }),
 *      });
 * 
 *      const { sessionId } = await response.json();
 *      const stripe = await stripePromise;
 *      await stripe.redirectToCheckout({ sessionId });
 *    };
 * 
 * 6. HANDLE WEBHOOKS (Backend)
 *    Add a webhook endpoint to handle payment events:
 * 
 *    app.post('/make-server-3bba8be8/stripe-webhook', async (c) => {
 *      const sig = c.req.header('stripe-signature');
 *      const body = await c.req.text();
 * 
 *      let event;
 *      try {
 *        event = stripe.webhooks.constructEvent(
 *          body,
 *          sig,
 *          Deno.env.get('STRIPE_WEBHOOK_SECRET')!
 *        );
 *      } catch (err) {
 *        return c.json({ error: 'Webhook signature verification failed' }, 400);
 *      }
 * 
 *      // Handle the event
 *      switch (event.type) {
 *        case 'checkout.session.completed':
 *          const session = event.data.object;
 *          // Update user's membership in your database
 *          await updateUserMembership(session.client_reference_id, session.subscription);
 *          break;
 *        case 'customer.subscription.deleted':
 *          // Handle subscription cancellation
 *          break;
 *      }
 * 
 *      return c.json({ received: true });
 *    });
 * 
 * 7. CONFIGURE STRIPE WEBHOOK
 *    - In Stripe Dashboard -> Developers -> Webhooks
 *    - Add endpoint: https://[your-project].supabase.co/functions/v1/make-server-3bba8be8/stripe-webhook
 *    - Select events: checkout.session.completed, customer.subscription.deleted, etc.
 * 
 * CURRENT IMPLEMENTATION:
 * The app currently allows users to sign up and select a membership tier.
 * The tier is stored in the database, but no payment is collected.
 * Follow the steps above to add real payment processing with Stripe.
 */

import React from 'react';
import { Card } from '../ui/card';
import { CreditCard, Shield, AlertCircle } from 'lucide-react';

export function StripeIntegrationGuide() {
  return (
    <Card className="p-6 bg-blue-50 border-blue-200">
      <div className="flex items-start gap-3 mb-4">
        <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
        <div>
          <h3 className="text-blue-900 mb-2">Payment Integration Required</h3>
          <p className="text-sm text-blue-800 mb-4">
            This app currently stores membership tiers without processing payments.
            To accept real payments, integrate Stripe by following the instructions in:
          </p>
          <code className="text-xs bg-blue-100 px-2 py-1 rounded">
            /components/auth/StripeIntegrationGuide.tsx
          </code>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mt-4">
        <div className="flex items-start gap-2">
          <CreditCard className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
          <div>
            <p className="text-sm text-blue-900">Secure Payments</p>
            <p className="text-xs text-blue-700">Stripe handles all payment data securely</p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
          <div>
            <p className="text-sm text-blue-900">PCI Compliant</p>
            <p className="text-xs text-blue-700">No sensitive data stored in your app</p>
          </div>
        </div>
      </div>
    </Card>
  );
}