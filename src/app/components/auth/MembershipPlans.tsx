import React, { useState } from 'react';
import { Check, X } from 'lucide-react';
import { SignUp } from './SignUp';
import { StripeIntegrationGuide } from './StripeIntegrationGuide';
import { StripeCheckout } from './StripeCheckout';
import { useAuth } from '../../contexts/AuthContext';

interface MembershipPlansProps {
  onClose: () => void;
}

export function MembershipPlans({ onClose }: MembershipPlansProps) {
  const { user } = useAuth();
  const [showSignUp, setShowSignUp] = useState(false);
  const [selectedTier, setSelectedTier] = useState('');
  const [selectedDuration, setSelectedDuration] = useState<1 | 3 | 6>(1);
  const [showCheckout, setShowCheckout] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Get started with basic features',
      features: [
        'Home Value Estimator',
        'Educational Resources',
        'Retirement Village Guides',
        'Selling Process Guide',
      ],
      notIncluded: [
        'Contract Analyzer',
        'Village Matcher',
        'Progress Tracker',
        'Family Communication Guide',
      ],
      buttonText: 'Get Started Free',
      buttonClass: 'bg-gray-600 hover:bg-gray-700',
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '$19',
      period: 'per month',
      description: 'Full access to all features',
      popular: true,
      features: [
        'Everything in Free',
        'Contract Analyzer with Risk Scoring',
        'Risk Scoring & Alerts',
        'Village Matcher',
        'Progress Tracker',
        'Family Communication Guide',
        'Lifetime Cost Calculations',
        'Inheritance Projections',
        'Priority Support',
      ],
      notIncluded: [],
      buttonText: 'Start Premium',
      buttonClass: 'bg-[#2D6A4F] hover:bg-[#1B4332]',
    },
    {
      id: 'family',
      name: 'Family',
      price: '$39',
      period: 'per month',
      description: 'For families making decisions together',
      features: [
        'Everything in Premium',
        'Up to 5 family member accounts',
        'Shared document access',
        'Collaborative notes',
        'Family decision tracking',
      ],
      notIncluded: [],
      buttonText: 'Start Family Plan',
      buttonClass: 'bg-[#2D6A4F] hover:bg-[#1B4332]',
    },
  ];

  const handleSelectPlan = (planId: string) => {
    // If free tier, just sign up
    if (planId === 'free') {
      setSelectedTier(planId);
      setShowSignUp(true);
      return;
    }

    // If user is not logged in, show sign up first
    if (!user) {
      setSelectedTier(planId);
      setShowSignUp(true);
      return;
    }

    // If user is logged in and selecting premium/family, show checkout
    setSelectedTier(planId);
    setShowCheckout(true);
  };

  if (showSignUp) {
    return (
      <SignUp
        onClose={onClose}
        onSwitchToLogin={() => {
          setShowSignUp(false);
          onClose();
        }}
        preselectedTier={selectedTier}
      />
    );
  }

  if (showCheckout) {
    const selectedPlan = plans.find(p => p.id === selectedTier);
    
    // Calculate pricing based on tier and duration
    const getPricing = (tier: string, duration: 1 | 3 | 6) => {
      const prices = {
        premium: {
          1: { total: 19, perMonth: 19, savings: 0 },
          3: { total: 51, perMonth: 17, savings: 6 },
          6: { total: 95, perMonth: 15.83, savings: 19 }
        },
        family: {
          1: { total: 39, perMonth: 39, savings: 0 },
          3: { total: 105, perMonth: 35, savings: 12 },
          6: { total: 195, perMonth: 32.50, savings: 39 }
        }
      };
      return prices[tier as 'premium' | 'family'][duration];
    };

    const currentPricing = getPricing(selectedTier, selectedDuration);
    
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-lg w-full p-6 relative max-h-[90vh] overflow-y-auto">
          <button
            onClick={() => setShowCheckout(false)}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>

          <h2 className="text-[#1B4332] mb-2">Subscribe to {selectedPlan?.name}</h2>
          <p className="text-gray-600 mb-6 text-sm">
            Choose your subscription length. No auto-renewal - you control when to extend.
          </p>

          {/* Duration Selection */}
          <div className="space-y-3 mb-6">
            {[1, 3, 6].map((duration) => {
              const pricing = getPricing(selectedTier, duration as 1 | 3 | 6);
              const isSelected = selectedDuration === duration;
              
              return (
                <button
                  key={duration}
                  onClick={() => setSelectedDuration(duration as 1 | 3 | 6)}
                  className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
                    isSelected
                      ? 'border-[#2D6A4F] bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[#1B4332]">
                          {duration} {duration === 1 ? 'Month' : 'Months'}
                        </span>
                        {pricing.savings > 0 && (
                          <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded-full">
                            Save ${pricing.savings}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        ${pricing.perMonth.toFixed(2)}/month
                        {pricing.savings > 0 && (
                          <span className="text-green-600 ml-1">
                            ({Math.round((pricing.savings / (duration * (pricing.perMonth + pricing.savings / duration))) * 100)}% off)
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-[#1B4332]">${pricing.total}</p>
                      <p className="text-xs text-gray-500">one-time</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Benefits reminder */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-900">
              <strong>✓ No auto-renewal</strong> - Your subscription expires after {selectedDuration} {selectedDuration === 1 ? 'month' : 'months'} unless you choose to extend it.
            </p>
          </div>

          <StripeCheckout
            membershipTier={selectedTier as 'premium' | 'family'}
            duration={selectedDuration}
            amount={currentPricing.total}
            onCancel={() => setShowCheckout(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-6xl w-full p-8 my-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center mb-8">
          <h2 className="text-[#1B4332] mb-2">Choose Your Plan</h2>
          <p className="text-gray-600 mb-2">
            Select the plan that best fits your needs.
          </p>
          <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-2 inline-block">
            ✓ One-time payment • No auto-renewal • Save up to 17% with longer plans
          </p>
        </div>

        {/* Stripe Integration Notice */}
        <div className="mb-8">
          <StripeIntegrationGuide />
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative border rounded-lg p-6 ${
                plan.popular
                  ? 'border-[#2D6A4F] shadow-lg scale-105'
                  : 'border-gray-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-[#2D6A4F] text-white px-4 py-1 rounded-full text-sm">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-[#1B4332] mb-2">{plan.name}</h3>
                <div className="mb-2">
                  <span className="text-4xl text-[#1B4332]">{plan.price}</span>
                  <span className="text-gray-600 text-sm">/{plan.period}</span>
                </div>
                <p className="text-sm text-gray-600">{plan.description}</p>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </li>
                ))}
                {plan.notIncluded.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 opacity-50">
                    <X className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-500 line-through">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSelectPlan(plan.id)}
                className={`w-full ${plan.buttonClass} text-white py-3 rounded-lg transition-colors`}
              >
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center text-sm text-gray-600">
          <p>
            All plans include a 14-day free trial. No credit card required to start.
          </p>
          <p className="mt-2">
            Questions? Contact us at support@retirepath.ai
          </p>
        </div>
      </div>
    </div>
  );
}