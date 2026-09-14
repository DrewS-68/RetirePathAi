import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

interface OnboardingState {
  hasSeenWelcomeTour: boolean;
  hasSeenVillageMatcher: boolean;
  hasSeenContractAnalyzer: boolean;
  hasSeenHomeValuation: boolean;
  hasSeenDirectory: boolean;
  completedSteps: string[];
}

interface OnboardingContextType {
  onboardingState: OnboardingState;
  markStepComplete: (step: string) => void;
  markToolSeen: (tool: keyof OnboardingState) => void;
  resetOnboarding: () => void;
  shouldShowWelcomeTour: () => boolean;
  shouldShowToolTip: (tool: string) => boolean;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

const DEFAULT_STATE: OnboardingState = {
  hasSeenWelcomeTour: false,
  hasSeenVillageMatcher: false,
  hasSeenContractAnalyzer: false,
  hasSeenHomeValuation: false,
  hasSeenDirectory: false,
  completedSteps: [],
};

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [onboardingState, setOnboardingState] = useState<OnboardingState>(DEFAULT_STATE);

  // Load onboarding state from localStorage on mount
  useEffect(() => {
    if (user?.id) {
      const storageKey = `retirepath_onboarding_${user.id}`;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          setOnboardingState(JSON.parse(saved));
        } catch (error) {
          console.error('Failed to parse onboarding state:', error);
        }
      }
    } else {
      // Reset to default when no user
      setOnboardingState(DEFAULT_STATE);
    }
  }, [user?.id]);

  // Save onboarding state to localStorage whenever it changes
  useEffect(() => {
    if (user?.id) {
      const storageKey = `retirepath_onboarding_${user.id}`;
      localStorage.setItem(storageKey, JSON.stringify(onboardingState));
    }
  }, [onboardingState, user?.id]);

  const markStepComplete = (step: string) => {
    setOnboardingState(prev => ({
      ...prev,
      completedSteps: [...new Set([...prev.completedSteps, step])],
    }));
  };

  const markToolSeen = (tool: keyof OnboardingState) => {
    setOnboardingState(prev => ({
      ...prev,
      [tool]: true,
    }));
  };

  const resetOnboarding = () => {
    setOnboardingState(DEFAULT_STATE);
    if (user?.id) {
      const storageKey = `retirepath_onboarding_${user.id}`;
      localStorage.removeItem(storageKey);
    }
  };

  const shouldShowWelcomeTour = () => {
    return user && !onboardingState.hasSeenWelcomeTour;
  };

  const shouldShowToolTip = (tool: string) => {
    return !onboardingState.completedSteps.includes(tool);
  };

  return (
    <OnboardingContext.Provider
      value={{
        onboardingState,
        markStepComplete,
        markToolSeen,
        resetOnboarding,
        shouldShowWelcomeTour,
        shouldShowToolTip,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
}