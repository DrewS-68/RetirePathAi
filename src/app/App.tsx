import React, { useState, useEffect, useRef, startTransition } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Hero } from './components/Hero';
import { Footer } from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import { LoadingState } from './components/ui/loading-state';

// Direct imports for reliability - no lazy loading for investor demo
import { VillageMatcher } from './components/VillageMatcher';
import { VillageDirectory } from './components/VillageDirectory';
import { ContractReview } from './components/ContractReview';
import { HomeValuation } from './components/HomeValuation';
import { ProgressTracker } from './components/ProgressTracker';
import { ResourcesHub } from './components/ResourcesHub';
import { FamilyGuide } from './components/FamilyGuide';
import { RetirementGuide } from './components/RetirementGuide';
import { SellingGuide } from './components/SellingGuide';
import { About } from './components/About';
import { FAQ } from './components/FAQ';
import { AdminDashboard } from './components/AdminDashboard';

// Build version
const BUILD_VERSION = 'v1.42-proper-sliding-nav';

// Navigation tabs configuration
const NAV_TABS = [
  { id: 'village-matcher', label: 'Village Matcher' },
  { id: 'village-directory', label: 'Directory' },
  { id: 'contract-review', label: 'Contract Review' },
  { id: 'home-valuation', label: 'Home Valuation' },
  { id: 'progress-tracker', label: 'Progress Tracker' },
  { id: 'resources', label: 'Resources' },
  { id: 'family-guide', label: 'Family Guide' },
  { id: 'retirement-guide', label: 'Retirement Guide' },
  { id: 'selling-guide', label: 'Selling Guide' },
  { id: 'about', label: 'About' },
  { id: 'faq', label: 'FAQ' },
  { id: 'admin', label: '🛡️ Admin' }, // Added permanently for development
];

// Main App Component (wrapped in AuthProvider)
function AppContent() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [forceSkipAuth, setForceSkipAuth] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 });

  // Handle hash-based navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash) {
        setActiveTab(hash);
      }
    };

    // Set initial tab from hash
    handleHashChange();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Update the sliding indicator position whenever the active tab changes
  useEffect(() => {
    if (navRef.current && activeTab !== 'home') {
      const activeButton = navRef.current.querySelector(`[data-tab="${activeTab}"]`);
      if (activeButton) {
        const navRect = navRef.current.getBoundingClientRect();
        const buttonRect = activeButton.getBoundingClientRect();
        setIndicatorStyle({
          left: buttonRect.left - navRect.left,
          width: buttonRect.width,
          opacity: 1,
        });
      }
    } else {
      setIndicatorStyle({ left: 0, width: 0, opacity: 0 });
    }
  }, [activeTab]);

  // Update hash when tab changes - wrap in startTransition to handle lazy loading
  const handleTabChange = (tab: string) => {
    startTransition(() => {
      setActiveTab(tab);
      window.location.hash = tab;
      setIsMobileMenuOpen(false);
    });
  };

  // Show loading state during auth check (with max 3 second timeout)
  if (authLoading && !forceSkipAuth) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 gap-4">
        <LoadingState message="Loading RetirePath..." />
        <button
          onClick={() => setForceSkipAuth(true)}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          Skip & Continue →
        </button>
        <p className="text-xs text-gray-500">Taking too long? Click to continue without auth</p>
      </div>
    );
  }

  // Prepare visible tabs (add admin if user is authorized)
  const visibleTabs = NAV_TABS; // Admin tab is now always visible

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <button
                onClick={() => handleTabChange('home')}
                className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors"
              >
                RetirePath
              </button>

              {/* Desktop Navigation */}
              <nav className="hidden lg:block relative" ref={navRef}>
                <div className="flex items-center gap-1">
                  {visibleTabs.map((tab) => (
                    <button
                      key={tab.id}
                      data-tab={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className={`px-3 py-2 text-sm transition-colors whitespace-nowrap ${
                        activeTab === tab.id
                          ? 'text-gray-900 font-medium'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
                
                {/* Sliding indicator bar */}
                <div
                  className="absolute bottom-0 h-1 bg-blue-600 rounded-t-sm transition-all duration-300 ease-out"
                  style={{
                    left: `${indicatorStyle.left}px`,
                    width: `${indicatorStyle.width}px`,
                    opacity: indicatorStyle.opacity,
                  }}
                />
              </nav>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
              <div className="lg:hidden mt-4 pb-4 border-t border-gray-200 pt-4">
                <nav className="flex flex-col gap-2">
                  {visibleTabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className={`px-4 py-3 rounded-lg font-medium text-left transition-all ${
                        activeTab === tab.id
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 container mx-auto px-4 py-8">
          {activeTab === 'home' && <Hero onGetStarted={() => handleTabChange('village-matcher')} />}
          {activeTab === 'village-matcher' && <VillageMatcher />}
          {activeTab === 'village-directory' && <VillageDirectory />}
          {activeTab === 'contract-review' && <ContractReview />}
          {activeTab === 'home-valuation' && <HomeValuation />}
          {activeTab === 'progress-tracker' && <ProgressTracker />}
          {activeTab === 'resources' && <ResourcesHub />}
          {activeTab === 'family-guide' && <FamilyGuide />}
          {activeTab === 'retirement-guide' && <RetirementGuide />}
          {activeTab === 'selling-guide' && <SellingGuide />}
          {activeTab === 'about' && <About />}
          {activeTab === 'faq' && <FAQ />}
          {activeTab === 'admin' && <AdminDashboard />}
        </main>

        {/* Footer */}
        <Footer />

        {/* Build Version Badge */}
        <div className="fixed bottom-4 right-4 px-3 py-1 bg-gray-900 text-white text-xs rounded-full opacity-50 hover:opacity-100 transition-opacity">
          {BUILD_VERSION}
        </div>
      </div>
    </ErrorBoundary>
  );
}

// Export default with AuthProvider wrapper
export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

// TypeScript declaration for window.resilienceManager
declare global {
  interface Window {
    resilienceManager: any;
  }
}