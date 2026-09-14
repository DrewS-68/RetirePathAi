import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Badge } from './ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Disclaimer } from './ui/disclaimer';
import {
  MapPin,
  DollarSign,
  Heart,
  Building2,
  TrendingUp,
  Users,
  Shield,
  ChevronRight,
  Sparkles,
  Activity,
  CheckCircle,
  AlertCircle,
  Star,
} from 'lucide-react';
import { getSupabaseClient } from '../utils/supabase/client';
import { Checkbox } from './ui/checkbox';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { 
  postcodeCoordinates, 
  calculateDistance,
  isPostcodeSupported,
  getSuburbFromPostcode,
  getStateFromPostcode
} from '../utils/postcodes';
import { ErrorDisplay } from './ui/error-display';
import { LoadingState } from './ui/loading-state';
import { parseApiError, logError, ErrorState } from '../utils/error-handling';

interface UserData {
  name?: string;
  age?: number;
  timeline?: string;
  budget?: string;
}

interface MatcherData {
  // Health
  healthStatus: string;
  mobilityLevel: string;
  medicalConditions: string[];
  futureCareConcern: number;
  agedCareOnSite: string; // 'required', 'preferred', 'not-important'
  
  // Lifestyle
  socialPreference: string;
  activityLevel: string;
  hobbies: string[];
  petOwnership: boolean;
  familyProximity: string;
  communitySize: string;
  preferredPostcode: string;
  
  // Financial
  availableCapital: number;
  monthlyBudget: number;
  inheritancePriority: number;
  riskTolerance: string;
}

interface VillageRecommendation {
  name: string;
  type: string;
  matchScore: number;
  location: string;
  suburb: string;
  state: string;
  postcode: string;
  distance?: number;
  entryPrice: number;
  monthlyFees: number;
  matchReasons: string[];
  features: string[];
  healthScore: number;
  lifestyleScore: number;
  financeScore: number;
}

interface VillageMatcherProps {
  userData?: UserData | null;
}

export function VillageMatcher({ userData = null }: VillageMatcherProps = {}) {
  const [step, setStep] = useState<'intro' | 'health' | 'lifestyle' | 'finance' | 'results'>('intro');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorState | null>(null);
  const [dbVillages, setDbVillages] = useState<any[]>([]);
  const [matcherData, setMatcherData] = useState<MatcherData>({
    healthStatus: 'good',
    mobilityLevel: 'independent',
    medicalConditions: [],
    futureCareConcern: 50,
    agedCareOnSite: 'preferred',
    socialPreference: 'moderate',
    activityLevel: 'active',
    hobbies: [],
    petOwnership: false,
    familyProximity: 'moderate',
    communitySize: 'medium',
    preferredPostcode: '',
    availableCapital: 500000,
    monthlyBudget: 600,
    inheritancePriority: 50,
    riskTolerance: 'moderate',
  });

  // Fetch villages from database
  useEffect(() => {
    const fetchVillages = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Create Supabase client
        const supabase = getSupabaseClient();

        // Fetch ALL approved villages using pagination
        const allVillages: any[] = [];
        let page = 0;
        const pageSize = 1000;
        let hasMore = true;

        while (hasMore) {
          const from = page * pageSize;
          const to = from + pageSize - 1;

          const { data, error: supabaseError } = await supabase
            .from('retirement_villages')
            .select('*')
            .eq('status', 'approved')
            // FILTER OUT AGED CARE: Only show retirement villages and mixed facilities
            .neq('facility_type', 'aged_care')
            // FILTER OUT UNCLASSIFIED: Only show villages with verified facility_type
            .not('facility_type', 'is', null)
            .order('name', { ascending: true })
            .range(from, to);

          if (supabaseError) {
            throw new Error(`Failed to fetch villages: ${supabaseError.message}`);
          }

          if (data && data.length > 0) {
            allVillages.push(...data);
            
            // If we got less than pageSize, we've reached the end
            if (data.length < pageSize) {
              hasMore = false;
            } else {
              page++;
            }
          } else {
            hasMore = false;
          }
        }

        setDbVillages(allVillages);
        console.log('Fetched villages:', allVillages.length);
      } catch (err) {
        console.error('Error fetching villages:', err);
        setError(parseApiError(err));
      } finally {
        setLoading(false);
      }
    };

    fetchVillages().catch((err) => {
      console.error('Initial fetch failed:', err);
      // Error is already handled in fetchVillages
    });
  }, []);

  // Convert database villages to recommendations with matching scores
  const convertToRecommendations = (dbVillages: any[]): VillageRecommendation[] => {
    // Get user's coordinates for distance calculations
    const userCoords = matcherData.preferredPostcode ? postcodeCoordinates[matcherData.preferredPostcode] : null;
    
    // FIRST PASS: Calculate distances and filter by proximity preference
    let filteredVillages = dbVillages;
    
    if (userCoords && matcherData.familyProximity) {
      // Calculate distances for all villages
      const villagesWithDistance = dbVillages.map(village => {
        const villageCoords = postcodeCoordinates[village.postcode];
        let distance: number | undefined;
        
        if (villageCoords) {
          distance = calculateDistance(
            userCoords.lat,
            userCoords.lng,
            villageCoords.lat,
            villageCoords.lng
          );
        }
        
        return { ...village, calculatedDistance: distance };
      });
      
      // FILTER based on proximity preference - this is KEY!
      if (matcherData.familyProximity === 'very') {
        // Very important - Within 10km: ONLY show villages within 15km
        // EXCLUDE villages where we can't calculate distance (no coordinates)
        const beforeCount = villagesWithDistance.length;
        filteredVillages = villagesWithDistance.filter(v => 
          v.calculatedDistance !== undefined && v.calculatedDistance <= 15
        );
        const excludedCount = beforeCount - filteredVillages.length;
        console.log(`🎯 PROXIMITY FILTER: "Very important - Within 10km" selected`);
        console.log(`📍 User postcode: ${matcherData.preferredPostcode}`);
        console.log(`✅ Showing only villages within 15km (with valid coordinates). Found: ${filteredVillages.length} villages`);
        console.log(`❌ Excluded ${excludedCount} villages (too far or no coordinates)`);
      } else if (matcherData.familyProximity === 'moderate') {
        // Moderate - Within 30km: ONLY show villages within 40km
        // EXCLUDE villages where we can't calculate distance
        filteredVillages = villagesWithDistance.filter(v => 
          v.calculatedDistance !== undefined && v.calculatedDistance <= 40
        );
        console.log(`📍 Filtered to villages within 40km (with valid coordinates). Count: ${filteredVillages.length}`);
      } else {
        // Flexible - show all, but we'll still prefer closer ones in scoring
        filteredVillages = villagesWithDistance;
      }
    }
    
    // SECOND PASS: Score the filtered villages
    return filteredVillages.map((village) => {
      // Calculate match scores based on user preferences
      let healthScore = 75;
      let lifestyleScore = 75;
      let financeScore = 75;
      const matchReasons: string[] = [];
      const features: string[] = [];
      
      // Get pre-calculated distance
      const distance = village.calculatedDistance;

      // DISTANCE/PROXIMITY SCORING - Add bonuses for close villages
      if (distance !== undefined) {
        if (distance <= 5) {
          lifestyleScore += 25;
          matchReasons.unshift(`Only ${Math.round(distance)}km away - exceptionally close!`);
        } else if (distance <= 10) {
          lifestyleScore += 20;
          matchReasons.unshift(`Only ${Math.round(distance)}km from your location - perfect proximity!`);
        } else if (distance <= 15) {
          lifestyleScore += 15;
          matchReasons.unshift(`${Math.round(distance)}km away - very close to your area`);
        } else if (distance <= 30) {
          lifestyleScore += 10;
          matchReasons.push(`${Math.round(distance)}km away - within your preferred range`);
        } else {
          matchReasons.push(`${Math.round(distance)}km from your location`);
        }
      }

      // Health scoring - Aged Care On-Site preference
      const hasAgedCare = village.care_level === 'Mixed' || village.care_level === 'Aged Care';
      
      if (matcherData.agedCareOnSite === 'required' && hasAgedCare) {
        healthScore += 20;
        matchReasons.push('On-site aged care facility allows you to age in place');
        features.push('On-site aged care');
      } else if (matcherData.agedCareOnSite === 'required' && !hasAgedCare) {
        healthScore -= 40; // Heavily penalize if required but not available
      } else if (matcherData.agedCareOnSite === 'preferred' && hasAgedCare) {
        healthScore += 15;
        matchReasons.push('On-site aged care available for future needs');
        features.push('On-site aged care');
      } else if (matcherData.agedCareOnSite === 'not-important' && !hasAgedCare) {
        healthScore += 5;
      }

      // Future care concern scoring
      if (village.care_level === 'Mixed' && matcherData.futureCareConcern >= 50) {
        healthScore += 10;
        matchReasons.push('On-site care services available for future needs');
      }
      if (village.care_level === 'Independent' && matcherData.futureCareConcern < 50) {
        healthScore += 10;
      }

      // Lifestyle scoring
      if (matcherData.petOwnership && village.pet_friendly) {
        lifestyleScore += 20;
        matchReasons.push('Pet-friendly community');
        features.push('Pets allowed');
      } else if (matcherData.petOwnership && !village.pet_friendly) {
        lifestyleScore -= 30;
      }

      // Add amenities to features
      if (village.amenities && Array.isArray(village.amenities)) {
        features.push(...village.amenities);
      }

      // Financial scoring
      const entryPrice = (village.entry_price_min + village.entry_price_max) / 2 || village.entry_price_min || 0;
      const monthlyFees = (village.monthly_fees_min + village.monthly_fees_max) / 2 || village.monthly_fees_min || 0;

      // Only score financially if pricing data exists
      if (entryPrice > 0) {
        if (entryPrice <= matcherData.availableCapital) {
          financeScore += 15;
          matchReasons.push('Entry price within your budget');
        } else {
          financeScore -= 25;
        }
      }

      if (monthlyFees > 0) {
        if (monthlyFees <= matcherData.monthlyBudget) {
          financeScore += 10;
        }
      }

      // Inheritance priority
      if (village.village_type === 'Freehold' && matcherData.inheritancePriority >= 70) {
        financeScore += 15;
        matchReasons.push('Freehold ownership - maximum inheritance protection');
      }

      // Overall match score
      const matchScore = Math.round((healthScore + lifestyleScore + financeScore) / 3);

      // Add default features
      if (village.contact_phone) features.push(`Contact: ${village.contact_phone}`);
      if (village.website) features.push('Website available');
      if (village.care_level) features.push(`Care level: ${village.care_level}`);

      return {
        name: village.name,
        type: village.village_type || 'Retirement Village',
        matchScore: Math.min(matchScore, 99),
        location: village.suburb,
        suburb: village.suburb,
        state: village.state,
        postcode: village.postcode,
        distance: distance,
        entryPrice: entryPrice,
        monthlyFees: monthlyFees,
        matchReasons: matchReasons.length > 0 ? matchReasons : ['Located in ' + village.state],
        features: features.length > 0 ? features : ['Contact village for details'],
        healthScore: Math.min(healthScore, 99),
        lifestyleScore: Math.min(lifestyleScore, 99),
        financeScore: Math.min(financeScore, 99),
      };
    });
  };

  // Get recommendations - use database if available, fallback to mock
  const getRecommendations = (): VillageRecommendation[] => {
    let recommendations: VillageRecommendation[] = [];

    // Use real database villages if available
    if (dbVillages.length > 0) {
      recommendations = convertToRecommendations(dbVillages);
    } else {
      // Fallback to mock data
      recommendations = [
        {
          name: 'Sunshine Gardens Retirement Village',
          type: 'Independent Living + Aged Care',
          matchScore: 92,
          location: 'Brighton',
          suburb: 'Brighton',
          state: 'Victoria',
          postcode: '3186',
          entryPrice: 485000,
          monthlyFees: 580,
          healthScore: 90,
          lifestyleScore: 95,
          financeScore: 91,
          matchReasons: [
            'On-site medical support aligns with your health planning needs',
            'Active social calendar matches your lifestyle preferences',
            'Entry price within your budget range',
            'Pet-friendly community',
            'Strong capital gain sharing (50%)'
          ],
          features: [
            'On-site nurse 7 days/week',
            'Adjacent aged care facility',
            'Swimming pool & gym',
            'Community garden',
            'Arts & crafts studio',
            'Pet-friendly with dog park',
            'Weekly social events',
            'Close to shopping & medical centers'
          ]
        },
        {
          name: 'Coastal Haven Village',
          type: 'Freehold Retirement Community',
          matchScore: 88,
          location: 'Frankston',
          suburb: 'Frankston',
          state: 'Victoria',
          postcode: '3199',
          entryPrice: 520000,
          monthlyFees: 520,
          healthScore: 85,
          lifestyleScore: 92,
          financeScore: 87,
          matchReasons: [
            'Freehold ownership - maximum inheritance for children',
            'Beach location ideal for active lifestyle',
            'Lower monthly fees suit your budget',
            'Strong community of active retirees',
            'Excellent facilities for hobbies'
          ],
          features: [
            'Freehold strata title',
            '5 min walk to beach',
            'Bowling green & tennis courts',
            'Workshop & hobby rooms',
            'Library & cinema room',
            'Community bus service',
            'Active walking group',
            'Emergency call system'
          ]
        },
        {
          name: 'Parkside Retirement Estate',
          type: 'Loan-License with Services',
          matchScore: 85,
          location: 'Camberwell',
          suburb: 'Camberwell',
          state: 'Victoria',
          postcode: '3124',
          entryPrice: 450000,
          monthlyFees: 650,
          healthScore: 88,
          lifestyleScore: 82,
          financeScore: 85,
          matchReasons: [
            'Lower entry price preserves more capital',
            'Close to family and medical services',
            'Medium-sized community suits your preference',
            'Good balance of independence and support',
            'Transparent DMF structure (5% pa, capped at 6 years)'
          ],
          features: [
            'DMF: 5% per year, 30% cap',
            'Next to major hospital',
            'Village manager on-site',
            'Optional meals service',
            'Heated indoor pool',
            'Billiards & card room',
            'Landscaped gardens',
            'Visitor accommodation'
          ]
        }
      ];
    }

    // Sort by distance FIRST when postcode provided, then by match score
    if (matcherData.preferredPostcode && matcherData.familyProximity === 'very') {
      // When "Very important - Within 10km", distance is ABSOLUTE priority
      return recommendations.sort((a, b) => {
        const distanceA = a.distance || 999;
        const distanceB = b.distance || 999;
        
        // Pure distance sorting - closest always wins
        if (distanceA !== distanceB) {
          return distanceA - distanceB;
        }
        
        // Only use match score as tiebreaker for same distance
        return b.matchScore - a.matchScore;
      });
    } else if (matcherData.preferredPostcode) {
      // For moderate/flexible, balance distance and match score
      return recommendations.sort((a, b) => {
        const distanceDiff = (a.distance || 999) - (b.distance || 999);
        if (Math.abs(distanceDiff) < 5) {
          // If distances are similar (within 5km), sort by match score
          return b.matchScore - a.matchScore;
        }
        return distanceDiff;
      });
    } else {
      // No postcode provided - just sort by match score
      return recommendations.sort((a, b) => b.matchScore - a.matchScore);
    }
  };

  const recommendations = getRecommendations();

  const calculateResults = () => {
    setStep('results');
  };

  const getMatchColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-orange-600';
    return 'text-gray-600';
  };

  const getMatchLabel = (score: number) => {
    if (score >= 90) return 'Excellent Match';
    if (score >= 80) return 'Great Match';
    if (score >= 70) return 'Good Match';
    return 'Fair Match';
  };

  if (step === 'intro') {
    return (
      <div className="space-y-8">
        {/* Loading State */}
        {loading && (
          <LoadingState message="Loading retirement villages from database..." />
        )}

        {/* Error State */}
        {error && (
          <ErrorDisplay
            error={error}
            onRetry={() => window.location.reload()}
            onDismiss={() => setError(null)}
          />
        )}

        <div className="text-center max-w-3xl mx-auto">
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-br from-purple-600 to-blue-600 p-4 rounded-full">
              <Sparkles className="size-12 text-white" />
            </div>
          </div>
          <h2 className="mb-4">Village Finder</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Answer a few questions about your health, lifestyle, and finances, and we'll help you find retirement villages that match your needs.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Card className="p-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-red-100 p-3 rounded-full">
                <Heart className="size-8 text-red-600" />
              </div>
            </div>
            <h3 className="mb-2">Health Assessment</h3>
            <p className="text-sm text-muted-foreground">
              We'll match you with villages that have the right level of medical support and care options
            </p>
          </Card>

          <Card className="p-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <Activity className="size-8 text-blue-600" />
              </div>
            </div>
            <h3 className="mb-2">Lifestyle Matching</h3>
            <p className="text-sm text-muted-foreground">
              Find communities with activities, amenities, and social environments that match your interests
            </p>
          </Card>

          <Card className="p-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-green-100 p-3 rounded-full">
                <DollarSign className="size-8 text-green-600" />
              </div>
            </div>
            <h3 className="mb-2">Financial Fit</h3>
            <p className="text-sm text-muted-foreground">
              Get matched with villages within your budget that align with your inheritance goals
            </p>
          </Card>
        </div>

        {/* Disclaimer */}
        <div className="max-w-3xl mx-auto">
          <Disclaimer variant="info">
            <strong>Matching Tool Disclaimer:</strong> This tool recommends retirement villages based on your responses. Recommendations are indicative only and should not be your sole basis for choosing a retirement village. Village availability, pricing, and features change frequently. We strongly recommend visiting villages in person, conducting thorough research, and seeking professional advice before making any decisions. RetirePath is not responsible for the accuracy of recommendations or any decisions based on them.
          </Disclaimer>
        </div>

        <div className="text-center">
          <Button size="lg" onClick={() => setStep('health')} className="px-8">
            Start Assessment
          </Button>
          <p className="text-sm text-muted-foreground mt-4">Takes about 5 minutes</p>
        </div>
      </div>
    );
  }

  if (step === 'health') {
    return (
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h2 className="mb-2">Health & Care Needs</h2>
          <p className="text-muted-foreground">
            Help us understand your current health and future care considerations
          </p>
        </div>

        <Card className="p-6 space-y-6">
          <div>
            <Label>Current Health Status</Label>
            <RadioGroup
              value={matcherData.healthStatus}
              onValueChange={(value) => setMatcherData({ ...matcherData, healthStatus: value })}
              className="mt-3 space-y-3"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="excellent" id="excellent" />
                <Label htmlFor="excellent">Excellent - Very active with no health concerns</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="good" id="good" />
                <Label htmlFor="good">Good - Generally healthy with minor manageable conditions</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="fair" id="fair" />
                <Label htmlFor="fair">Fair - Some health concerns requiring regular management</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="declining" id="declining" />
                <Label htmlFor="declining">Declining - Significant health issues needing regular support</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label>Mobility Level</Label>
            <RadioGroup
              value={matcherData.mobilityLevel}
              onValueChange={(value) => setMatcherData({ ...matcherData, mobilityLevel: value })}
              className="mt-3 space-y-3"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="independent" id="independent" />
                <Label htmlFor="independent">Fully independent - No mobility aids needed</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="minor-aids" id="minor-aids" />
                <Label htmlFor="minor-aids">Minor aids - Occasionally use cane or walker</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="assisted" id="assisted" />
                <Label htmlFor="assisted">Assisted - Regular use of walker or wheelchair</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="wheelchair" id="wheelchair" />
                <Label htmlFor="wheelchair">Wheelchair dependent - Full-time wheelchair use</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label className="mb-3 block">Current Medical Conditions (select all that apply)</Label>
            <div className="grid md:grid-cols-2 gap-3">
              {[
                'Arthritis',
                'Heart condition',
                'Diabetes',
                'High blood pressure',
                'Respiratory issues',
                'Vision impairment',
                'Hearing impairment',
                'Memory concerns',
                'Chronic pain',
                'None of the above'
              ].map((condition) => (
                <div key={condition} className="flex items-center space-x-2">
                  <Checkbox
                    id={condition}
                    checked={matcherData.medicalConditions.includes(condition)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setMatcherData({
                          ...matcherData,
                          medicalConditions: [...matcherData.medicalConditions, condition]
                        });
                      } else {
                        setMatcherData({
                          ...matcherData,
                          medicalConditions: matcherData.medicalConditions.filter(c => c !== condition)
                        });
                      }
                    }}
                  />
                  <Label htmlFor={condition} className="cursor-pointer">{condition}</Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label>
              How concerned are you about needing higher levels of care in the future?
            </Label>
            <div className="mt-4 px-2">
              <Slider
                value={[matcherData.futureCareConcern]}
                onValueChange={(value) => setMatcherData({ ...matcherData, futureCareConcern: value[0] })}
                min={0}
                max={100}
                step={10}
              />
              <div className="flex justify-between text-sm text-muted-foreground mt-2">
                <span>Not concerned</span>
                <span>{matcherData.futureCareConcern}%</span>
                <span>Very concerned</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-3">
              {matcherData.futureCareConcern < 30 && "We'll prioritize independent living communities"}
              {matcherData.futureCareConcern >= 30 && matcherData.futureCareConcern < 70 && "We'll look for villages with optional care services"}
              {matcherData.futureCareConcern >= 70 && "We'll prioritize villages with on-site aged care facilities"}
            </p>
          </div>

          <div>
            <Label>Future Care Planning (On-site Aged Care Availability)</Label>
            <p className="text-sm text-muted-foreground mt-1 mb-3">
              <strong>You'll be living independently in a retirement village.</strong> However, some villages also have an on-site aged care facility. This means if your care needs increase in the future, you could transition to higher care without leaving your community.
            </p>
            <RadioGroup
              value={matcherData.agedCareOnSite}
              onValueChange={(value) => setMatcherData({ ...matcherData, agedCareOnSite: value })}
              className="mt-3 space-y-3"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="required" id="required" />
                <Label htmlFor="required">Required - Must have on-site aged care for future needs</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="preferred" id="preferred" />
                <Label htmlFor="preferred">Preferred - Would like this option for peace of mind</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="not-important" id="not-important" />
                <Label htmlFor="not-important">Not important - I'll cross that bridge when I come to it</Label>
              </div>
            </RadioGroup>
          </div>
        </Card>

        <div className="flex gap-4">
          <Button variant="outline" onClick={() => setStep('intro')} className="flex-1">
            Back
          </Button>
          <Button onClick={() => setStep('lifestyle')} className="flex-1">
            Continue to Lifestyle
          </Button>
        </div>
      </div>
    );
  }

  if (step === 'lifestyle') {
    return (
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h2 className="mb-2">Lifestyle Preferences</h2>
          <p className="text-muted-foreground">
            Tell us about your interests and ideal community environment
          </p>
        </div>

        <Card className="p-6 space-y-6">
          <div>
            <Label>Social Preference</Label>
            <RadioGroup
              value={matcherData.socialPreference}
              onValueChange={(value) => setMatcherData({ ...matcherData, socialPreference: value })}
              className="mt-3 space-y-3"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="very-social" id="very-social" />
                <Label htmlFor="very-social">Very social - Love daily activities and making new friends</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="moderate" id="moderate" />
                <Label htmlFor="moderate">Moderate - Enjoy some social activities and quiet time</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="private" id="private" />
                <Label htmlFor="private">Private - Prefer independence with occasional social contact</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label>Activity Level</Label>
            <RadioGroup
              value={matcherData.activityLevel}
              onValueChange={(value) => setMatcherData({ ...matcherData, activityLevel: value })}
              className="mt-3 space-y-3"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="very-active" id="very-active" />
                <Label htmlFor="very-active">Very active - Regular exercise and physical activities</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="active" id="active" />
                <Label htmlFor="active">Active - Moderate activity and regular outings</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="sedentary" id="sedentary" />
                <Label htmlFor="sedentary">Sedentary - Prefer gentle activities and relaxation</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label className="mb-3 block">Hobbies & Interests (select all that apply)</Label>
            <div className="grid md:grid-cols-2 gap-3">
              {[
                'Swimming',
                'Walking/Hiking',
                'Golf',
                'Bowling',
                'Arts & Crafts',
                'Gardening',
                'Cooking classes',
                'Book clubs',
                'Cards/Board games',
                'Exercise classes',
                'Dancing',
                'Music/Singing',
                'Woodworking',
                'Technology/Computing'
              ].map((hobby) => (
                <div key={hobby} className="flex items-center space-x-2">
                  <Checkbox
                    id={hobby}
                    checked={matcherData.hobbies.includes(hobby)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setMatcherData({
                          ...matcherData,
                          hobbies: [...matcherData.hobbies, hobby]
                        });
                      } else {
                        setMatcherData({
                          ...matcherData,
                          hobbies: matcherData.hobbies.filter(h => h !== hobby)
                        });
                      }
                    }}
                  />
                  <Label htmlFor={hobby} className="cursor-pointer">{hobby}</Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="petOwnership">Do you have or plan to have pets?</Label>
            <Select
              value={matcherData.petOwnership ? 'yes' : 'no'}
              onValueChange={(value) => setMatcherData({ ...matcherData, petOwnership: value === 'yes' })}
            >
              <SelectTrigger className="mt-2 border-2 hover:border-blue-400 transition-colors bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes - Pet-friendly villages only</SelectItem>
                <SelectItem value="no">No - Not a priority</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="familyProximity">How important is being close to family?</Label>
            <Select
              value={matcherData.familyProximity}
              onValueChange={(value) => setMatcherData({ ...matcherData, familyProximity: value })}
            >
              <SelectTrigger className="mt-2 border-2 hover:border-blue-400 transition-colors bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="very">Very important - Within 10km</SelectItem>
                <SelectItem value="moderate">Moderate - Within 30km is fine</SelectItem>
                <SelectItem value="flexible">Flexible - Location not critical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
            <Label htmlFor="preferredPostcode" className="text-base font-semibold">Your Postcode (for proximity matching)</Label>
            <p className="text-sm text-muted-foreground mt-1 mb-3">
              📍 Enter your postcode to find villages closest to you
            </p>
            <Input
              id="preferredPostcode"
              type="text"
              value={matcherData.preferredPostcode}
              onChange={(e) => setMatcherData({ ...matcherData, preferredPostcode: e.target.value })}
              placeholder="e.g. 3000"
              className="mt-2 border-2 border-blue-300 bg-white text-lg h-12 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              maxLength={4}
            />
            {matcherData.preferredPostcode && isPostcodeSupported(matcherData.preferredPostcode) ? (
              <p className="text-sm text-green-600 mt-2 flex items-center gap-1 font-medium">
                <CheckCircle className="size-4" />
                {getSuburbFromPostcode(matcherData.preferredPostcode)}, {getStateFromPostcode(matcherData.preferredPostcode)} - we'll prioritize nearby villages
              </p>
            ) : matcherData.preferredPostcode && matcherData.preferredPostcode.length >= 3 ? (
              <p className="text-sm text-amber-600 mt-2 flex items-center gap-1">
                <AlertCircle className="size-4" />
                Postcode not in our database - results will show without distance calculations
              </p>
            ) : (
              <p className="text-sm text-muted-foreground mt-2">
                Enter your Australian postcode (e.g. 2000, 3000, 4000, 5000, 6000)
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="communitySize">Preferred Community Size</Label>
            <Select
              value={matcherData.communitySize}
              onValueChange={(value) => setMatcherData({ ...matcherData, communitySize: value })}
            >
              <SelectTrigger className="mt-2 border-2 hover:border-blue-400 transition-colors bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small (under 50 units) - Close-knit community</SelectItem>
                <SelectItem value="medium">Medium (50-150 units) - Balanced community</SelectItem>
                <SelectItem value="large">Large (150+ units) - Lots of amenities and activities</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        <div className="flex gap-4">
          <Button variant="outline" onClick={() => setStep('health')} className="flex-1">
            Back
          </Button>
          <Button onClick={() => setStep('finance')} className="flex-1">
            Continue to Finances
          </Button>
        </div>
      </div>
    );
  }

  if (step === 'finance') {
    return (
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h2 className="mb-2">Financial Situation</h2>
          <p className="text-muted-foreground">
            Help us find villages that fit your budget and financial goals
          </p>
        </div>

        <Card className="p-6 space-y-6">
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
            <Label htmlFor="availableCapital" className="text-base font-semibold">Available Capital for Entry Price</Label>
            <p className="text-sm text-muted-foreground mt-1 mb-3">
              💰 How much do you have available for the entry payment?
            </p>
            <div className="relative mt-2">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-lg">$</span>
              <Input
                id="availableCapital"
                type="number"
                value={matcherData.availableCapital}
                onChange={(e) => setMatcherData({ ...matcherData, availableCapital: parseFloat(e.target.value) || 0 })}
                className="pl-8 border-2 border-green-300 bg-white text-lg h-12 focus:border-green-500 focus:ring-2 focus:ring-green-200"
                placeholder="500000"
              />
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              This is the amount you have available from savings, home sale, etc.
            </p>
          </div>

          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
            <Label htmlFor="monthlyBudget" className="text-base font-semibold">Comfortable Monthly Budget for Fees</Label>
            <p className="text-sm text-muted-foreground mt-1 mb-3">
              📅 What can you comfortably afford each month?
            </p>
            <div className="relative mt-2">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-lg">$</span>
              <Input
                id="monthlyBudget"
                type="number"
                value={matcherData.monthlyBudget}
                onChange={(e) => setMatcherData({ ...matcherData, monthlyBudget: parseFloat(e.target.value) || 0 })}
                className="pl-8 border-2 border-green-300 bg-white text-lg h-12 focus:border-green-500 focus:ring-2 focus:ring-green-200"
                placeholder="600"
              />
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Include your pension, investments, and other income sources
            </p>
          </div>

          <div>
            <Label>
              How important is leaving an inheritance for your children?
            </Label>
            <div className="mt-4 px-2">
              <Slider
                value={[matcherData.inheritancePriority]}
                onValueChange={(value) => setMatcherData({ ...matcherData, inheritancePriority: value[0] })}
                min={0}
                max={100}
                step={10}
              />
              <div className="flex justify-between text-sm text-muted-foreground mt-2">
                <span>Not important</span>
                <span>{matcherData.inheritancePriority}%</span>
                <span>Very important</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-3">
              {matcherData.inheritancePriority < 30 && 'We\'ll focus on lifestyle value and lower fees'}
              {matcherData.inheritancePriority >= 30 && matcherData.inheritancePriority < 70 && 'We\'ll balance lifestyle costs with capital preservation'}
              {matcherData.inheritancePriority >= 70 && 'We\'ll prioritize freehold and low-DMF options'}
            </p>
          </div>

          <div>
            <Label>Financial Risk Tolerance</Label>
            <RadioGroup
              value={matcherData.riskTolerance}
              onValueChange={(value) => setMatcherData({ ...matcherData, riskTolerance: value })}
              className="mt-3 space-y-3"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="conservative" id="conservative" />
                <Label htmlFor="conservative">Conservative - Prefer lower DMF and guaranteed costs</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="moderate" id="moderate" />
                <Label htmlFor="moderate">Moderate - Balance between cost and lifestyle</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="flexible" id="flexible" />
                <Label htmlFor="flexible">Flexible - Willing to pay more for better amenities</Label>
              </div>
            </RadioGroup>
          </div>

          <Alert>
            <AlertCircle className="size-4" />
            <AlertDescription>
              <strong>Budget Summary:</strong> Based on your inputs, you can afford villages with entry prices 
              up to ${matcherData.availableCapital.toLocaleString()} and monthly fees up to ${matcherData.monthlyBudget.toLocaleString()}/month.
            </AlertDescription>
          </Alert>
        </Card>

        <div className="flex gap-4">
          <Button variant="outline" onClick={() => setStep('lifestyle')} className="flex-1">
            Back
          </Button>
          <Button onClick={calculateResults} className="flex-1">
            <Sparkles className="size-4 mr-2" />
            Get My Matches
          </Button>
        </div>
      </div>
    );
  }

  // Results view
  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-gradient-to-br from-purple-600 to-blue-600 p-4 rounded-full">
            <Sparkles className="size-12 text-white" />
          </div>
        </div>
        <h2 className="mb-2">Your Personalized Village Matches</h2>
        <p className="text-muted-foreground mb-6">
          Based on your health, lifestyle, and financial preferences, here are the retirement villages 
          that best match your needs.
          {matcherData.preferredPostcode && matcherData.familyProximity === 'very' && (
            <span className="block mt-2 text-blue-600 font-semibold">
              📍 Showing only villages within 15km of {matcherData.preferredPostcode} ({getSuburbFromPostcode(matcherData.preferredPostcode)})
              <br />
              Found {recommendations.length} nearby villages - sorted by distance
            </span>
          )}
          {matcherData.preferredPostcode && matcherData.familyProximity === 'moderate' && (
            <span className="block mt-2 text-blue-600">
              Results are sorted by proximity to your postcode ({matcherData.preferredPostcode})
            </span>
          )}
        </p>
        <Button variant="outline" onClick={() => setStep('intro')}>
          Start New Assessment
        </Button>
      </div>

      {/* No Results Warning */}
      {recommendations.length === 0 && matcherData.preferredPostcode && matcherData.familyProximity === 'very' && (
        <Alert className="border-amber-500 bg-amber-50">
          <AlertCircle className="size-4 text-amber-600" />
          <AlertDescription>
            <strong>No villages found within 15km of postcode {matcherData.preferredPostcode}</strong>
            <p className="mt-2">
              Try changing your proximity preference to "Moderate - Within 30km is fine" to see more options,
              or use a different postcode.
            </p>
          </AlertDescription>
        </Alert>
      )}

      {/* Your Priorities Summary */}
      {recommendations.length > 0 && (
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50">
        <h3 className="mb-4">Your Key Priorities</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <h4 className="mb-2 flex items-center gap-2">
              <Heart className="size-5 text-red-600" />
              Health & Care
            </h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• {matcherData.healthStatus.charAt(0).toUpperCase() + matcherData.healthStatus.slice(1)} health status</li>
              <li>• {matcherData.mobilityLevel.replace('-', ' ').charAt(0).toUpperCase() + matcherData.mobilityLevel.replace('-', ' ').slice(1)} mobility</li>
              <li>• {matcherData.futureCareConcern}% future care concern</li>
            </ul>
          </div>
          <div>
            <h4 className="mb-2 flex items-center gap-2">
              <Activity className="size-5 text-blue-600" />
              Lifestyle
            </h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• {matcherData.socialPreference.charAt(0).toUpperCase() + matcherData.socialPreference.slice(1)} social preference</li>
              <li>• {matcherData.activityLevel.charAt(0).toUpperCase() + matcherData.activityLevel.slice(1)} activity level</li>
              <li>• {matcherData.hobbies.length} selected hobbies</li>
              {matcherData.petOwnership && <li>• Pet-friendly required</li>}
              {matcherData.preferredPostcode && <li>• Postcode: {matcherData.preferredPostcode}</li>}
            </ul>
          </div>
          <div>
            <h4 className="mb-2 flex items-center gap-2">
              <DollarSign className="size-5 text-green-600" />
              Financial
            </h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• ${matcherData.availableCapital.toLocaleString()} capital</li>
              <li>• ${matcherData.monthlyBudget}/month budget</li>
              <li>• {matcherData.inheritancePriority}% inheritance priority</li>
            </ul>
          </div>
        </div>
      </Card>
      )}

      {/* Village Matches */}
      {recommendations.length > 0 && (
      <div className="space-y-6">
        {recommendations.map((village, index) => (
          <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Match Score */}
              <div className="flex flex-col items-center justify-center md:border-r md:pr-6 pb-4 md:pb-0 border-b md:border-b-0">
                <div className="relative size-32">
                  <svg className="size-32 transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="58"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-gray-200"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="58"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 58}`}
                      strokeDashoffset={`${2 * Math.PI * 58 * (1 - village.matchScore / 100)}`}
                      className={getMatchColor(village.matchScore)}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-3xl ${getMatchColor(village.matchScore)}`}>{village.matchScore}</span>
                    <span className="text-xs text-muted-foreground">Match</span>
                  </div>
                </div>
                <p className={`text-sm mt-2 ${getMatchColor(village.matchScore)}`}>
                  {getMatchLabel(village.matchScore)}
                </p>
              </div>

              {/* Village Details */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="mb-1">{village.name}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="size-4" />
                      {village.suburb}, {village.state} {village.postcode}
                      {village.distance !== undefined && (
                        <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">
                          {Math.round(village.distance)}km away
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">{village.type}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Entry Price</p>
                    <p className="text-xl">
                      {village.entryPrice > 0 ? `$${village.entryPrice.toLocaleString()}` : 'Contact for pricing'}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {village.monthlyFees > 0 ? `$${village.monthlyFees}/month` : 'Contact for pricing'}
                    </p>
                  </div>
                </div>

                {/* Match Breakdown */}
                <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Heart className="size-4 text-red-600" />
                      <span className="text-sm">Health</span>
                    </div>
                    <Progress value={village.healthScore} className="h-2 mb-1" />
                    <p className="text-sm">{village.healthScore}%</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Activity className="size-4 text-blue-600" />
                      <span className="text-sm">Lifestyle</span>
                    </div>
                    <Progress value={village.lifestyleScore} className="h-2 mb-1" />
                    <p className="text-sm">{village.lifestyleScore}%</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <DollarSign className="size-4 text-green-600" />
                      <span className="text-sm">Finance</span>
                    </div>
                    <Progress value={village.financeScore} className="h-2 mb-1" />
                    <p className="text-sm">{village.financeScore}%</p>
                  </div>
                </div>

                {/* Why This Match */}
                <div className="mb-4">
                  <h4 className="mb-2">Why This Is a Great Match For You</h4>
                  <ul className="space-y-2">
                    {village.matchReasons.map((reason, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="size-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Key Features */}
                <div>
                  <h4 className="mb-2">Key Features & Amenities</h4>
                  <div className="grid md:grid-cols-2 gap-2">
                    {village.features.map((feature, i) => (
                      <p key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                        <Star className="size-4 text-amber-500" />
                        {feature}
                      </p>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-4 pt-4 border-t">
                  <Button className="flex-1">Schedule Tour</Button>
                  <Button variant="outline" className="flex-1">Request Information</Button>
                  <Button variant="outline">Save</Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
      )}

      {/* Missing Village Alert */}
      {recommendations.length > 0 && (
      <Card className="p-6 bg-amber-50 border-amber-200">
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            <div className="bg-amber-600 text-white rounded-full p-3">
              <AlertCircle className="size-6" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="mb-2">Don't See Your Local Village?</h3>
            <p className="text-muted-foreground mb-4">
              We're actively growing our database to include smaller local operators. If you know of a retirement 
              village in your area (especially in postcode {matcherData.preferredPostcode || 'your local area'}) that's not showing up in these results, 
              please let us know!
            </p>
            <div className="flex gap-3">
              <Button variant="outline" className="bg-white">
                <Building2 className="size-4 mr-2" />
                Suggest a Village
              </Button>
              <Button variant="outline" className="bg-white">
                <Users className="size-4 mr-2" />
                I'm a Village Operator
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-3">
              💡 Smaller, local operators often provide more personalized care. Help us add them to our directory!
            </p>
          </div>
        </div>
      </Card>
      )}

      {/* Next Steps */}
      {recommendations.length > 0 && (
      <Card className="p-6 bg-purple-50 border-purple-200">
        <h3 className="mb-4">Recommended Next Steps</h3>
        <div className="space-y-3">
          <div className="flex gap-3">
            <div className="bg-purple-600 text-white rounded-full size-6 flex items-center justify-center flex-shrink-0 text-sm">
              1
            </div>
            <div>
              <p><strong>Book Village Tours</strong></p>
              <p className="text-sm text-muted-foreground">
                Schedule visits to your top 3 matches. Try to visit during social activities to see the community in action.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="bg-purple-600 text-white rounded-full size-6 flex items-center justify-center flex-shrink-0 text-sm">
              2
            </div>
            <div>
              <p><strong>Request Detailed Contract Information</strong></p>
              <p className="text-sm text-muted-foreground">
                Get full contract details and use our Contract Review tool to compare the fine print.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="bg-purple-600 text-white rounded-full size-6 flex items-center justify-center flex-shrink-0 text-sm">
              3
            </div>
            <div>
              <p><strong>Talk to Current Residents</strong></p>
              <p className="text-sm text-muted-foreground">
                Ask to speak with residents who have similar interests and backgrounds to yours.
              </p>
            </div>
          </div>
        </div>
      </Card>
      )}
    </div>
  );
}