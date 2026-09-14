import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Lock, Crown } from 'lucide-react';
import { MembershipPlans } from './MembershipPlans';

interface FeatureGateProps {
  feature: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function FeatureGate({ feature, children, fallback }: FeatureGateProps) {
  const { user, hasFeatureAccess, loading } = useAuth();
  const [showPlans, setShowPlans] = useState(false);

  // Debug logging
  console.log('🚪 FeatureGate render:', {
    feature,
    loading,
    hasUser: !!user,
    userId: user?.id,
    userName: user?.name
  });

  // Wait for auth to finish loading before showing "Sign In Required"
  if (loading) {
    console.log('⏳ FeatureGate: Still loading auth...');
    return (
      <div className="text-center py-12 px-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2D6A4F] mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!user) {
    console.log('🔒 FeatureGate: No user - showing sign in required');
    return (
      <>
        <div className="text-center py-12 px-4">
          <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-[#1B4332] mb-2">Sign In Required</h3>
          <p className="text-gray-600 mb-6">
            Please sign in to access this feature
          </p>
          <button
            onClick={() => setShowPlans(true)}
            className="bg-[#2D6A4F] text-white px-6 py-3 rounded-lg hover:bg-[#1B4332] transition-colors"
          >
            Get Started
          </button>
        </div>
        {showPlans && <MembershipPlans onClose={() => setShowPlans(false)} />}
      </>
    );
  }

  if (!hasFeatureAccess(feature)) {
    console.log('👑 FeatureGate: User lacks feature access - showing premium gate');
    return (
      <>
        {fallback || (
          <div className="text-center py-12 px-4 bg-gradient-to-br from-[#D8F3DC] to-[#B7E4C7] rounded-lg">
            <Crown className="w-16 h-16 text-[#2D6A4F] mx-auto mb-4" />
            <h3 className="text-[#1B4332] mb-2">Premium Feature</h3>
            <p className="text-gray-700 mb-6">
              Upgrade to Premium or Family plan to access this feature
            </p>
            <button
              onClick={() => setShowPlans(true)}
              className="bg-[#2D6A4F] text-white px-6 py-3 rounded-lg hover:bg-[#1B4332] transition-colors"
            >
              View Plans
            </button>
          </div>
        )}
        {showPlans && <MembershipPlans onClose={() => setShowPlans(false)} />}
      </>
    );
  }

  console.log('✅ FeatureGate: Access granted - rendering children');
  return <>{children}</>;
}