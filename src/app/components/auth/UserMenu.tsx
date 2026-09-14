import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { User, LogOut, Crown, ChevronDown, Calendar, AlertCircle } from 'lucide-react';

export function UserMenu() {
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  const tierColors = {
    free: 'text-gray-600',
    premium: 'text-[#2D6A4F]',
    family: 'text-[#74C69D]',
  };

  const tierLabels = {
    free: 'Free',
    premium: 'Premium',
    family: 'Family',
  };

  // Calculate days until expiration
  const getDaysUntilExpiration = () => {
    if (!user.membershipExpiresAt || user.membershipTier === 'free') return null;
    
    const expirationDate = new Date(user.membershipExpiresAt);
    const now = new Date();
    const diffTime = expirationDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const daysRemaining = getDaysUntilExpiration();

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <div className="w-8 h-8 bg-[#2D6A4F] rounded-full flex items-center justify-center text-white">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div className="hidden md:block text-left">
          <div className="text-sm text-gray-900">{user.name}</div>
          <div className={`text-xs ${tierColors[user.membershipTier]} flex items-center gap-1`}>
            {user.membershipTier !== 'free' && <Crown className="w-3 h-3" />}
            {tierLabels[user.membershipTier]}
          </div>
        </div>
        <ChevronDown className="w-4 h-4 text-gray-500" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="text-sm text-gray-900">{user.name}</div>
              <div className="text-xs text-gray-500">{user.email}</div>
              <div className={`text-xs mt-1 ${tierColors[user.membershipTier]} flex items-center gap-1`}>
                {user.membershipTier !== 'free' && <Crown className="w-3 h-3" />}
                {tierLabels[user.membershipTier]} Member
              </div>
              {daysRemaining !== null && (
                <div className={`text-xs mt-2 p-2 rounded flex items-center gap-1 ${
                  daysRemaining <= 7 
                    ? 'bg-red-50 text-red-700 border border-red-200' 
                    : daysRemaining <= 30
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-blue-50 text-blue-700 border border-blue-200'
                }`}>
                  {daysRemaining <= 7 ? <AlertCircle className="w-3 h-3" /> : <Calendar className="w-3 h-3" />}
                  <span>
                    {daysRemaining <= 0 ? 'Expired' : `Expires in ${daysRemaining} ${daysRemaining === 1 ? 'day' : 'days'}`}
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={async () => {
                await signOut();
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </>
      )}
    </div>
  );
}
