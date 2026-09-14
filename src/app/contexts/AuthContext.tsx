import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSupabaseClient } from '../utils/supabase/client';
import { projectId, publicAnonKey } from '../utils/supabase/info';

const supabase = getSupabaseClient();

interface User {
  id: string;
  email: string;
  name: string;
  membershipTier: 'free' | 'premium' | 'family';
  membershipExpiresAt?: string | null;
  subscriptionDuration?: number;
  legalAcknowledgedAt?: string | null;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string, membershipTier?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  hasFeatureAccess: (feature: string) => boolean;
  acknowledgeLegal: () => Promise<void>;
  needsLegalAcknowledgment: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (token: string) => {
    try {
      console.log('🔍 Fetching user profile with token...');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/user/profile`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      console.log('📥 Profile response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Profile data received:', data.profile);
        setUser(data.profile);
        return true; // Success
      } else {
        const errorData = await response.text();
        console.error('❌ Failed to fetch user profile:', response.status, errorData);
        return false; // Failed
      }
    } catch (error) {
      console.error('❌ Error fetching user profile:', error);
      return false; // Failed
    }
  };

  const fetchUserProfileWithFallback = async (token: string) => {
    const success = await fetchUserProfile(token);
    
    if (!success) {
      console.log('⚠️ Profile fetch failed, using auth session data as fallback...');
      // Fallback: Get user info from Supabase auth session
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser(token);
        
        if (authUser) {
          const fallbackUser = {
            id: authUser.id,
            email: authUser.email || '',
            name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
            membershipTier: (authUser.user_metadata?.membershipTier || 'free') as 'free' | 'premium' | 'family',
            legalAcknowledgedAt: authUser.user_metadata?.legalAcknowledgedAt || null
          };
          setUser(fallbackUser);
          console.log('✅ Using fallback user data:', fallbackUser);
        }
      } catch (fallbackError) {
        console.error('❌ Fallback also failed:', fallbackError);
      }
    }
  };

  const checkSession = async () => {
    try {
      console.log('🔍 checkSession: Starting session check...');
      
      // Create a timeout promise that resolves after 20 seconds
      const timeoutPromise = new Promise((resolve) => {
        setTimeout(() => {
          console.log('⏰ Auth check timeout - continuing without auth (this is normal on slow connections)');
          resolve(null);
        }, 3000); // Reduced from 20000 to 3000ms for faster loading
      });
      
      // Race between getting the session and the timeout
      const sessionPromise = supabase.auth.getSession();
      const result = await Promise.race([sessionPromise, timeoutPromise]);
      
      // If timeout won, result will be null
      if (!result) {
        console.log('✅ App loaded without authentication (timeout)');
        return;
      }
      
      const { data: { session } } = result as any;
      
      console.log('🔍 checkSession: Session retrieved:', {
        hasSession: !!session,
        hasAccessToken: !!session?.access_token,
        userId: session?.user?.id
      });
      
      if (session?.access_token) {
        console.log('✅ checkSession: Valid session found, setting access token');
        setAccessToken(session.access_token);
        
        // Use session data directly instead of fetching from backend
        // This prevents infinite loading if backend is slow/down
        const authUser = session.user;
        if (authUser) {
          const fallbackUser = {
            id: authUser.id,
            email: authUser.email || '',
            name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
            membershipTier: (authUser.user_metadata?.membershipTier || 'free') as 'free' | 'premium' | 'family',
            legalAcknowledgedAt: authUser.user_metadata?.legalAcknowledgedAt || null
          };
          setUser(fallbackUser);
          console.log('✅ Using session user data:', fallbackUser);
        }
      } else {
        console.log('⚠️ checkSession: No valid session found');
      }
    } catch (error) {
      console.error('❌ checkSession: Error checking session:', error);
    } finally {
      console.log('🏁 checkSession: Setting loading to false');
      setLoading(false);
    }
  };

  useEffect(() => {
    let subscription: any = null;
    let isTabVisible = true;
    let lastFetchTime = 0; // Track when we last fetched profile to prevent spam
    const FETCH_DEBOUNCE_MS = 1000; // Only fetch profile once per second max
    
    // Track tab visibility to prevent operations when tab is in background
    const handleVisibilityChange = () => {
      isTabVisible = !document.hidden;
      // Only log in development if needed
      // console.log(`🔄 Tab visibility changed: ${isTabVisible ? 'visible' : 'hidden'}`);
    };
    
    const initAuth = async () => {
      try {
        await checkSession();

        const { data: authData } = supabase.auth.onAuthStateChange(async (event, session) => {
          try {
            // Skip auth state changes when tab is not visible to prevent accumulation
            if (!isTabVisible) {
              // Silently skip - only uncomment for debugging
              // console.log('⏸️ Skipping auth state change - tab not visible');
              return;
            }
            
            // CRITICAL: Debounce profile fetching to prevent infinite loops
            const now = Date.now();
            const shouldFetchProfile = (now - lastFetchTime) > FETCH_DEBOUNCE_MS;
            
            if (session?.access_token) {
              setAccessToken(session.access_token);
              
              // Only fetch profile if enough time has passed since last fetch
              if (shouldFetchProfile) {
                lastFetchTime = now;
                await fetchUserProfileWithFallback(session.access_token);
              }
            } else {
              setUser(null);
              setAccessToken(null);
            }
            setLoading(false);
          } catch (error) {
            console.error('Error in auth state change handler:', error);
            setLoading(false);
          }
        });
        
        // Store subscription so cleanup can access it
        subscription = authData.subscription;
      } catch (error) {
        console.error('Error initializing auth:', error);
        setLoading(false);
      }
    };

    initAuth();
    
    // Listen for tab visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup function that React can actually call
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      if (subscription) {
        try {
          subscription.unsubscribe();
          console.log('✅ Auth subscription cleaned up');
        } catch (error) {
          console.error('Error unsubscribing from auth:', error);
        }
      }
    };
  }, []);

  const signUp = async (email: string, password: string, name: string, membershipTier = 'free') => {
    try {
      console.log('📝 Starting sign up process for:', email);
      
      // Try backend signup first
      try {
        console.log('🔄 Calling backend signup endpoint...');
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/signup`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${publicAnonKey}`,
            },
            body: JSON.stringify({ email, password, name, membershipTier }),
          }
        );

        const data = await response.json();
        console.log('📥 Backend signup response:', response.status, data);

        if (response.ok) {
          console.log('✅ Backend signup successful, now signing in...');
          // Backend signup succeeded, now sign in
          await signIn(email, password);
          return;
        } else {
          console.error('❌ Backend signup failed:', data);
          throw new Error(data.error || 'Signup failed');
        }
      } catch (backendError: any) {
        console.error('❌ Backend signup error:', backendError);
        
        // If it's a "Failed to fetch" error, use direct Supabase signup as fallback
        if (backendError.message === 'Failed to fetch' || backendError.name === 'TypeError') {
          console.log('🔄 Backend unavailable, using direct Supabase signup...');
          
          // Fallback: Direct Supabase signup (when backend is unavailable)
          const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                name: name,
                membershipTier: membershipTier
              }
            }
          });

          if (authError) {
            console.error('❌ Direct signup error:', authError);
            throw authError;
          }

          console.log('✅ Direct signup successful');

          if (authData.session?.access_token) {
            setAccessToken(authData.session.access_token);
            // Create user object from auth data
            const newUser = {
              id: authData.user!.id,
              email: authData.user!.email!,
              name: name,
              membershipTier: membershipTier as 'free' | 'premium' | 'family'
            };
            setUser(newUser);
            console.log('✅ User set:', newUser);
          }
          return;
        }
        
        // Re-throw other errors
        throw backendError;
      }
    } catch (error) {
      console.error('❌ Signup error:', error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting to sign in with email:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('Sign in response:', { data, error });

      if (error) {
        console.error('Supabase auth error:', error);
        throw error;
      }

      if (data.session?.access_token) {
        console.log('Sign in successful, setting access token');
        setAccessToken(data.session.access_token);
        await fetchUserProfileWithFallback(data.session.access_token);
      }
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setAccessToken(null);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const refreshProfile = async () => {
    if (accessToken) {
      await fetchUserProfileWithFallback(accessToken);
    }
  };

  const hasFeatureAccess = (feature: string): boolean => {
    if (!user) return false;

    // 🧪 TESTING MODE: Bypass paywall for testing
    // Remove or comment out these lines when you're ready to enforce membership
    // For now, all logged-in users get full access to test features
    return true;

    // Uncomment the code below when you want to enforce membership tiers:
    /*
    const accessRules = {
      free: ['home-valuation', 'resources', 'guides'],
      premium: ['home-valuation', 'resources', 'guides', 'contract-review', 'village-matcher', 'progress-tracker', 'family-guide'],
      family: ['home-valuation', 'resources', 'guides', 'contract-review', 'village-matcher', 'progress-tracker', 'family-guide']
    };

    return accessRules[user.membershipTier]?.includes(feature) || false;
    */
  };

  const acknowledgeLegal = async () => {
    if (!user || !accessToken) return;

    try {
      console.log('📝 Acknowledging legal disclaimer...');
      
      // Try backend first
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8/user/acknowledge-legal`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ userId: user.id }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          setUser({
            ...user,
            legalAcknowledgedAt: data.legalAcknowledgedAt
          });
          console.log('✅ Legal acknowledgment saved via backend');
          return;
        } else {
          console.error('❌ Backend legal acknowledgment failed:', response.status);
          throw new Error('Backend failed');
        }
      } catch (backendError) {
        console.error('❌ Backend error:', backendError);
        
        // Fallback: Update user metadata directly in Supabase auth
        console.log('🔄 Using fallback: updating user metadata directly...');
        
        const timestamp = new Date().toISOString();
        const { error } = await supabase.auth.updateUser({
          data: {
            legalAcknowledgedAt: timestamp
          }
        });

        if (error) {
          console.error('❌ Fallback failed:', error);
          throw error;
        }

        setUser({
          ...user,
          legalAcknowledgedAt: timestamp
        });
        console.log('✅ Legal acknowledgment saved via fallback');
      }
    } catch (error) {
      console.error('❌ Error acknowledging legal:', error);
      throw error;
    }
  };

  const needsLegalAcknowledgment = (): boolean => {
    return !user?.legalAcknowledgedAt;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        loading,
        signUp,
        signIn,
        signOut,
        refreshProfile,
        hasFeatureAccess,
        acknowledgeLegal,
        needsLegalAcknowledgment,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // During hot module reload or initial mount, context might not be ready
    // Return a safe default instead of throwing
    console.warn('⚠️ useAuth called before AuthProvider initialized - this can happen during hot reload');
    return {
      user: null,
      accessToken: null,
      loading: true,
      signUp: async () => {},
      signIn: async () => {},
      signOut: async () => {},
      refreshProfile: async () => {},
      hasFeatureAccess: () => false,
      acknowledgeLegal: async () => {},
      needsLegalAcknowledgment: () => false,
    } as AuthContextType;
  }
  return context;
}