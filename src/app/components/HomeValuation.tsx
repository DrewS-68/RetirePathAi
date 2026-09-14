import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Disclaimer } from './ui/disclaimer';
import { Checkbox } from './ui/checkbox';
import { UserData } from '../App';
import { 
  Home,
  TrendingUp,
  DollarSign,
  MapPin,
  Calendar,
  Bed,
  Bath,
  Square,
  Search,
  AlertCircle,
  UserCheck,
  AlertTriangle
} from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { AgentReferralForm } from './AgentReferralForm';

interface PropertyData {
  address: string;
  suburb: string;
  state: string;
  postcode: string;
  bedrooms: number;
  bathrooms: number;
  carSpaces: number;
  landSize: number;
  propertyType: string;
}

interface SaleData {
  address: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  carSpaces: number;
  landSize: number;
  soldDate: string;
  distance: string;
}

interface HomeValuationProps {
  userData: UserData | null;
}

// Smart valuation calculator
function calculatePropertyValue(property: PropertyData): {
  estimatedValue: number;
  estimatedRange: { low: number; high: number };
  marketTrend: string;
  daysOnMarket: number;
  suburbMedian: number;
} {
  // Base values by state (reflecting Australian market differences)
  const stateMultipliers: { [key: string]: number } = {
    'NSW': 1.35,  // Sydney premium
    'VIC': 1.15,  // Melbourne
    'QLD': 0.95,  // Brisbane/Gold Coast
    'WA': 0.90,   // Perth
    'SA': 0.75,   // Adelaide
    'TAS': 0.65,  // Hobart
    'ACT': 1.25,  // Canberra
    'NT': 0.80,   // Darwin
  };

  // Property type multipliers
  const typeMultipliers: { [key: string]: number } = {
    'house': 1.0,
    'townhouse': 0.75,
    'apartment': 0.65,
    'villa': 0.70,
  };

  // Base calculation
  let baseValue = 400000; // Starting point
  
  // Add value for bedrooms
  baseValue += property.bedrooms * 120000;
  
  // Add value for bathrooms
  baseValue += property.bathrooms * 80000;
  
  // Add value for car spaces
  baseValue += property.carSpaces * 45000;
  
  // Add value for land size (significant for houses)
  if (property.propertyType === 'house' || property.propertyType === 'townhouse') {
    baseValue += (property.landSize / 100) * 35000;
  } else {
    // Apartments/villas - land matters less
    baseValue += (property.landSize / 100) * 8000;
  }

  // Apply state multiplier
  const stateMultiplier = stateMultipliers[property.state] || 1.0;
  baseValue *= stateMultiplier;

  // Apply property type multiplier
  const typeMultiplier = typeMultipliers[property.propertyType] || 1.0;
  baseValue *= typeMultiplier;

  // Round to nearest $5,000
  const estimatedValue = Math.round(baseValue / 5000) * 5000;

  // Calculate range (±6-8%)
  const rangeLow = Math.round((estimatedValue * 0.92) / 5000) * 5000;
  const rangeHigh = Math.round((estimatedValue * 1.08) / 5000) * 5000;

  // Market trend (slight positive bias for most Australian markets in 2024-2025)
  const trends = ['+2.8%', '+3.2%', '+3.5%', '+4.1%', '+2.3%', '+1.8%'];
  const marketTrend = trends[Math.floor(Math.random() * trends.length)];

  // Days on market (property type dependent)
  const daysRanges: { [key: string]: number[] } = {
    'house': [28, 35],
    'townhouse': [32, 42],
    'apartment': [38, 48],
    'villa': [35, 45],
  };
  const range = daysRanges[property.propertyType] || [30, 40];
  const daysOnMarket = Math.floor(Math.random() * (range[1] - range[0] + 1)) + range[0];

  // Suburb median (slightly below estimated value)
  const suburbMedian = Math.round((estimatedValue * 0.95) / 10000) * 10000;

  return {
    estimatedValue,
    estimatedRange: { low: rangeLow, high: rangeHigh },
    marketTrend,
    daysOnMarket,
    suburbMedian,
  };
}

// Generate realistic comparable sales
function generateComparableSales(property: PropertyData, estimatedValue: number): SaleData[] {
  const sales: SaleData[] = [];
  const streetNames = [
    'Oak', 'Maple', 'Pine', 'Cedar', 'Birch', 'Elm', 'Willow', 'Ash',
    'Park', 'Garden', 'Hill', 'Valley', 'Lake', 'River', 'Bay', 'Ridge'
  ];
  const streetTypes = ['Street', 'Avenue', 'Road', 'Court', 'Lane', 'Drive', 'Crescent', 'Place'];

  // Generate 5 comparable sales
  for (let i = 0; i < 5; i++) {
    const streetName = streetNames[Math.floor(Math.random() * streetNames.length)];
    const streetType = streetTypes[Math.floor(Math.random() * streetTypes.length)];
    const streetNumber = Math.floor(Math.random() * 90) + 10;

    // Vary bedrooms slightly (±1)
    const bedroomVariation = Math.floor(Math.random() * 3) - 1;
    const bedrooms = Math.max(1, property.bedrooms + bedroomVariation);

    // Vary bathrooms slightly
    const bathroomVariation = Math.random() > 0.5 ? 0 : (Math.random() > 0.5 ? 1 : -1);
    const bathrooms = Math.max(1, property.bathrooms + bathroomVariation);

    // Vary car spaces
    const carVariation = Math.random() > 0.5 ? 0 : (Math.random() > 0.5 ? 1 : -1);
    const carSpaces = Math.max(0, property.carSpaces + carVariation);

    // Vary land size (±50-100 sqm)
    const landVariation = Math.floor(Math.random() * 100) - 50;
    const landSize = Math.max(50, property.landSize + landVariation);

    // Calculate price based on differences from main property
    let priceAdjustment = 1.0;
    priceAdjustment += (bedrooms - property.bedrooms) * 0.08;
    priceAdjustment += (bathrooms - property.bathrooms) * 0.05;
    priceAdjustment += (carSpaces - property.carSpaces) * 0.03;
    priceAdjustment += ((landSize - property.landSize) / property.landSize) * 0.15;

    // Add some randomness (±5%)
    priceAdjustment *= (0.95 + Math.random() * 0.10);

    const price = Math.round((estimatedValue * priceAdjustment) / 5000) * 5000;

    // Generate sold date (last 3-6 months)
    const daysAgo = Math.floor(Math.random() * 150) + 30;
    const soldDate = new Date();
    soldDate.setDate(soldDate.getDate() - daysAgo);

    // Distance from property (0.2km - 1.5km)
    const distance = (Math.random() * 1.3 + 0.2).toFixed(1);

    sales.push({
      address: `${streetNumber} ${streetName} ${streetType}`,
      price,
      bedrooms,
      bathrooms,
      carSpaces,
      landSize,
      soldDate: soldDate.toISOString().split('T')[0],
      distance: `${distance} km`,
    });
  }

  // Sort by price
  sales.sort((a, b) => b.price - a.price);

  return sales;
}

export function HomeValuation({ userData }: HomeValuationProps) {
  const [propertyData, setPropertyData] = useState<PropertyData>({
    address: '',
    suburb: '',
    state: 'NSW',
    postcode: '',
    bedrooms: 3,
    bathrooms: 2,
    carSpaces: 2,
    landSize: 600,
    propertyType: 'house',
  });

  const [showResults, setShowResults] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAgentForm, setShowAgentForm] = useState(false);
  const [hasAcknowledged, setHasAcknowledged] = useState(false);
  const [calculationResults, setCalculationResults] = useState<{
    estimatedValue: number;
    estimatedRange: { low: number; high: number };
    marketTrend: string;
    daysOnMarket: number;
    suburbMedian: number;
    recentSales: SaleData[];
  } | null>(null);

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    // Simulate API call
    setTimeout(() => {
      const results = calculatePropertyValue(propertyData);
      const sales = generateComparableSales(propertyData, results.estimatedValue);
      
      setCalculationResults({
        ...results,
        recentSales: sales,
      });
      
      setIsAnalyzing(false);
      setShowResults(true);
    }, 2000);
  };

  const calculateSellingCosts = (price: number) => {
    const agentCommission = price * 0.025; // 2.5%
    const marketing = 2500;
    const legal = 1500;
    const total = agentCommission + marketing + legal;
    return {
      agentCommission,
      marketing,
      legal,
      total,
      netProceeds: price - total
    };
  };

  const costs = calculationResults ? calculateSellingCosts(calculationResults.estimatedValue) : null;

  return (
    <div className="space-y-8">
        <div>
          <h2 className="mb-2">Home Value Estimator</h2>
          <p className="text-muted-foreground">
            Get an algorithmic estimate of your home's value based on property features and regional market data. This is for informational purposes only.
          </p>
        </div>

      {/* ⚠️ CRITICAL WARNING DISCLAIMER - Must acknowledge before using tool */}
      {!hasAcknowledged ? (
        <Card className="p-6 border-amber-200 bg-amber-50">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="size-8 text-amber-600 flex-shrink-0 mt-1" />
              <div className="space-y-3 flex-1">
                <h3 className="text-lg font-semibold text-amber-900">⚠️ IMPORTANT: THIS IS NOT A PROFESSIONAL PROPERTY VALUATION</h3>
                
                <div className="bg-white p-4 rounded border border-amber-200 space-y-3">
                  <p className="text-sm font-semibold text-amber-900">
                    This estimate:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                    <li><strong>Is generated by AI</strong> and may be significantly inaccurate</li>
                    <li><strong>Does NOT use real market data</strong> or live property sales</li>
                    <li><strong>Cannot assess</strong> property condition, improvements, or local market factors</li>
                    <li><strong>Is NOT a substitute</strong> for a licensed property valuer</li>
                    <li><strong>Does NOT constitute</strong> financial advice</li>
                  </ul>
                </div>

                <div className="bg-red-50 border border-red-300 p-4 rounded space-y-2">
                  <p className="text-sm font-semibold text-red-900">
                    ⚠️ DO NOT USE THIS ESTIMATE FOR:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-red-900">
                    <li>Setting a sale price for your property</li>
                    <li>Making financial decisions or securing loans</li>
                    <li>Legal, tax, or insurance purposes</li>
                    <li>Calculating capital gains tax</li>
                  </ul>
                </div>

                <div className="bg-green-50 border border-green-300 p-4 rounded space-y-2">
                  <p className="text-sm font-semibold text-green-900">
                    ✅ YOU MUST:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-green-900">
                    <li>Obtain a professional valuation from a <strong>licensed property valuer</strong></li>
                    <li>Get appraisals from <strong>2-3 local real estate agents</strong> who inspect your property</li>
                    <li>Consult a <strong>financial advisor</strong> regarding proceeds, tax implications, and retirement planning</li>
                  </ul>
                </div>

                <div className="flex items-start gap-3 p-4 bg-white rounded border border-gray-200 mt-4">
                  <Checkbox
                    id="acknowledge-valuation-tool"
                    checked={hasAcknowledged}
                    onCheckedChange={(checked) => setHasAcknowledged(checked === true)}
                    className="mt-1"
                  />
                  <label 
                    htmlFor="acknowledge-valuation-tool" 
                    className="text-sm cursor-pointer flex-1 select-none"
                  >
                    <strong>I understand and acknowledge that:</strong>
                    <ul className="list-disc pl-5 mt-2 space-y-1 text-muted-foreground">
                      <li>This is NOT a professional property valuation</li>
                      <li>The estimate may be significantly inaccurate</li>
                      <li>I MUST obtain professional valuations before making decisions</li>
                      <li>This does NOT constitute financial advice</li>
                      <li>RetirePath is not liable for decisions I make based on this estimate</li>
                    </ul>
                  </label>
                </div>

                <Button 
                  onClick={() => setHasAcknowledged(true)}
                  disabled={!hasAcknowledged}
                  className="w-full bg-amber-600 hover:bg-amber-700"
                >
                  I Understand - Continue to Estimator
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ) : (
        <>
      {/* Secondary Disclaimer (after acknowledgment) */}
      <Disclaimer variant="warning" title="Valuation Disclaimer">
        <p className="mb-2">
          <strong>This is an algorithmic estimate only and is NOT based on live market data or professional property valuation.</strong> The estimate is calculated using property features (bedrooms, bathrooms, land size, location) and general market assumptions. It should not be used for any official purpose including:
        </p>
        <ul className="list-disc pl-5 mb-2 space-y-1">
          <li>Setting a sale price for your property</li>
          <li>Making financial decisions or securing loans</li>
          <li>Legal, tax, or insurance purposes</li>
          <li>Calculating capital gains tax</li>
        </ul>
        <p className="mb-2">
          <strong>This tool does NOT use real recent sales data or live property APIs.</strong> The "comparable sales" shown are algorithmically generated examples, not actual sold properties. 
        </p>
        <p className="mb-2">
          For an accurate market appraisal, we strongly recommend obtaining written valuations from at least 2-3 licensed real estate agents who have inspected your property in person. Property values are influenced by many factors including condition, presentation, unique features, views, street appeal, current market conditions, and local demand.
        </p>
        <p>
          RetirePath accepts no liability for any decisions made based on these estimates. Actual sale prices may vary significantly from estimated values.
        </p>
      </Disclaimer>

      {/* Property Details Form */}
      <Card className="p-6">
        <h3 className="mb-4">Tell Us About Your Property</h3>
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="address">Street Address</Label>
              <Input
                id="address"
                value={propertyData.address}
                onChange={(e) => setPropertyData({ ...propertyData, address: e.target.value })}
                placeholder="e.g., 123 Main Street"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="suburb">Suburb/City</Label>
              <Input
                id="suburb"
                value={propertyData.suburb}
                onChange={(e) => setPropertyData({ ...propertyData, suburb: e.target.value })}
                placeholder="e.g., Springfield"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="state">State</Label>
              <Select
                value={propertyData.state}
                onValueChange={(value) => setPropertyData({ ...propertyData, state: value })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NSW">New South Wales</SelectItem>
                  <SelectItem value="VIC">Victoria</SelectItem>
                  <SelectItem value="QLD">Queensland</SelectItem>
                  <SelectItem value="WA">Western Australia</SelectItem>
                  <SelectItem value="SA">South Australia</SelectItem>
                  <SelectItem value="TAS">Tasmania</SelectItem>
                  <SelectItem value="ACT">Australian Capital Territory</SelectItem>
                  <SelectItem value="NT">Northern Territory</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="postcode">Postcode</Label>
              <Input
                id="postcode"
                value={propertyData.postcode}
                onChange={(e) => setPropertyData({ ...propertyData, postcode: e.target.value })}
                placeholder="e.g., 2000"
                className="mt-2"
                maxLength={4}
              />
            </div>

            <div>
              <Label htmlFor="propertyType">Property Type</Label>
              <Select
                value={propertyData.propertyType}
                onValueChange={(value) => setPropertyData({ ...propertyData, propertyType: value })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="house">House</SelectItem>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="townhouse">Townhouse</SelectItem>
                  <SelectItem value="villa">Villa/Unit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="bedrooms">Bedrooms</Label>
              <Input
                id="bedrooms"
                type="number"
                value={propertyData.bedrooms}
                onChange={(e) => setPropertyData({ ...propertyData, bedrooms: parseInt(e.target.value) || 0 })}
                className="mt-2"
                min="1"
                max="10"
              />
            </div>

            <div>
              <Label htmlFor="bathrooms">Bathrooms</Label>
              <Input
                id="bathrooms"
                type="number"
                value={propertyData.bathrooms}
                onChange={(e) => setPropertyData({ ...propertyData, bathrooms: parseInt(e.target.value) || 0 })}
                className="mt-2"
                min="1"
                max="6"
              />
            </div>

            <div>
              <Label htmlFor="carSpaces">Car Spaces</Label>
              <Input
                id="carSpaces"
                type="number"
                value={propertyData.carSpaces}
                onChange={(e) => setPropertyData({ ...propertyData, carSpaces: parseInt(e.target.value) || 0 })}
                className="mt-2"
                min="0"
                max="6"
              />
            </div>

            <div>
              <Label htmlFor="landSize">Land Size (sqm)</Label>
              <Input
                id="landSize"
                type="number"
                value={propertyData.landSize}
                onChange={(e) => setPropertyData({ ...propertyData, landSize: parseInt(e.target.value) || 0 })}
                className="mt-2"
                placeholder="600"
                min="50"
                max="5000"
              />
            </div>
          </div>

          <Button 
            onClick={handleAnalyze} 
            className="w-full" 
            size="lg"
            disabled={!propertyData.address || !propertyData.suburb || !propertyData.postcode || isAnalyzing}
          >
            {isAnalyzing ? (
              <>Analyzing Property...</>
            ) : (
              <>
                <Search className="size-4 mr-2" />
                Calculate Estimated Value
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Results */}
      {showResults && calculationResults && (
        <>
          {/* Valuation Estimate */}
          <Card className="p-6 bg-gradient-to-br from-green-50 to-blue-50">
            <div className="text-center mb-6">
              <p className="text-muted-foreground mb-2">Algorithmic Estimated Value</p>
              <div className="text-5xl mb-2">${calculationResults.estimatedValue.toLocaleString()}</div>
              <p className="text-sm text-muted-foreground">
                Estimated range: ${calculationResults.estimatedRange.low.toLocaleString()} - ${calculationResults.estimatedRange.high.toLocaleString()}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg text-center">
                <TrendingUp className="size-6 text-green-600 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-1">Market Trend (12 months)</p>
                <p className="text-green-600">{calculationResults.marketTrend}</p>
              </div>
              <div className="bg-white p-4 rounded-lg text-center">
                <Calendar className="size-6 text-blue-600 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-1">Average Days on Market</p>
                <p>{calculationResults.daysOnMarket} days</p>
              </div>
              <div className="bg-white p-4 rounded-lg text-center">
                <DollarSign className="size-6 text-purple-600 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-1">Estimated Suburb Median</p>
                <p>${calculationResults.suburbMedian.toLocaleString()}</p>
              </div>
            </div>
          </Card>

          {/* AI Analysis */}
          <Card className="p-6 bg-blue-50 border-blue-200">
            <div className="flex gap-4">
              <div className="bg-blue-600 text-white rounded-full size-10 flex items-center justify-center flex-shrink-0">
                AI
              </div>
              <div className="flex-1">
                <h3 className="mb-3">Algorithmic Analysis</h3>
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>Property Profile:</strong> Your {propertyData.propertyType} in {propertyData.suburb}, {propertyData.state} features {propertyData.bedrooms} bedrooms, {propertyData.bathrooms} bathrooms, and {propertyData.landSize}sqm of land. Based on these characteristics and regional pricing patterns, we've calculated an estimated value.
                  </p>
                  <p>
                    <strong>Key Value Drivers:</strong> The {propertyData.landSize}sqm land size and {propertyData.bedrooms} bedroom configuration are attractive features. Properties with {propertyData.carSpaces} car spaces are in demand in suburban areas.
                  </p>
                  <p>
                    <strong>Best Time to Sell:</strong> Generally, spring and early summer see increased buyer activity in Australian property markets. Consider timing your sale for September-November for optimal results.
                  </p>
                  <p>
                    <strong>Recommendation:</strong> To achieve the higher end of the estimated range (${calculationResults.estimatedRange.high.toLocaleString()}), consider minor cosmetic improvements, professional styling, and excellent presentation. Well-presented properties typically achieve 8-12% above average comparable homes.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Important Notice About Comparables */}
          <Alert className="border-amber-300 bg-amber-50">
            <AlertCircle className="size-4 text-amber-600" />
            <AlertDescription>
              <strong>Important:</strong> The "comparable sales" shown below are <strong>algorithmically generated examples</strong> based on your property features. They are NOT real sold properties. For actual recent sales data in your area, please consult with local real estate agents or use Domain.com.au / realestate.com.au.
            </AlertDescription>
          </Alert>

          {/* Recent Comparable Sales */}
          <div>
            <h3 className="mb-4">Example Comparable Properties in Your Area</h3>
            <p className="text-sm text-muted-foreground mb-4">
              These are algorithmically generated examples showing what similar properties might sell for, not actual sales records.
            </p>
            <div className="space-y-3">
              {calculationResults.recentSales.map((sale, index) => (
                <Card key={index} className="p-4 hover:shadow-lg transition-shadow">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="mb-1">{sale.address}</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="size-4" />
                            <span>{sale.distance} away</span>
                            <span>•</span>
                            <Calendar className="size-4" />
                            <span>Sold {new Date(sale.soldDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl">${sale.price.toLocaleString()}</div>
                        </div>
                      </div>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Bed className="size-4" />
                          <span>{sale.bedrooms}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Bath className="size-4" />
                          <span>{sale.bathrooms}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Home className="size-4" />
                          <span>{sale.carSpaces}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Square className="size-4" />
                          <span>{sale.landSize}m²</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Selling Costs Breakdown */}
          {costs && (
            <Card className="p-6">
              <h3 className="mb-4">Estimated Selling Costs</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Based on the estimated value of ${calculationResults.estimatedValue.toLocaleString()}
              </p>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div>
                    <p>Real Estate Agent Commission</p>
                    <p className="text-sm text-muted-foreground">2.5% of sale price</p>
                  </div>
                  <p>${costs.agentCommission.toLocaleString()}</p>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div>
                    <p>Marketing & Advertising</p>
                    <p className="text-sm text-muted-foreground">Photography, listings, signage</p>
                  </div>
                  <p>${costs.marketing.toLocaleString()}</p>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div>
                    <p>Legal & Conveyancing</p>
                    <p className="text-sm text-muted-foreground">Solicitor fees</p>
                  </div>
                  <p>${costs.legal.toLocaleString()}</p>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded border-2 border-green-200">
                  <div>
                    <p><strong>Estimated Net Proceeds</strong></p>
                    <p className="text-sm text-muted-foreground">After all selling costs</p>
                  </div>
                  <p className="text-xl"><strong>${costs.netProceeds.toLocaleString()}</strong></p>
                </div>
              </div>
              <Alert className="mt-4">
                <AlertCircle className="size-4" />
                <AlertDescription className="text-sm">
                  This estimate doesn't include any pre-sale repairs or improvements. Consider setting aside an additional $5,000-$15,000 for property preparation.
                </AlertDescription>
              </Alert>
            </Card>
          )}

          {/* Next Steps */}
          <Card className="p-6 bg-purple-50 border-purple-200">
            <h3 className="mb-4">Recommended Next Steps</h3>
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="bg-purple-600 text-white rounded-full size-6 flex items-center justify-center flex-shrink-0 text-sm">
                  1
                </div>
                <div>
                  <p><strong>Get Professional Appraisals</strong></p>
                  <p className="text-sm text-muted-foreground">
                    Contact 2-3 local agents for in-person appraisals. Their valuations will be based on actual recent sales and current market conditions.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="bg-purple-600 text-white rounded-full size-6 flex items-center justify-center flex-shrink-0 text-sm">
                  2
                </div>
                <div>
                  <p><strong>Research Actual Recent Sales</strong></p>
                  <p className="text-sm text-muted-foreground">
                    Visit Domain.com.au or realestate.com.au to see what properties have actually sold for in your suburb
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="bg-purple-600 text-white rounded-full size-6 flex items-center justify-center flex-shrink-0 text-sm">
                  3
                </div>
                <div>
                  <p><strong>Prepare Your Property</strong></p>
                  <p className="text-sm text-muted-foreground">
                    Review our selling guide for tips on repairs, decluttering, and presentation
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="bg-purple-600 text-white rounded-full size-6 flex items-center justify-center flex-shrink-0 text-sm">
                  4
                </div>
                <div>
                  <p><strong>Time Your Sale</strong></p>
                  <p className="text-sm text-muted-foreground">
                    Coordinate with your retirement village move-in date for a smooth transition
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Market Insights */}
          <Card className="p-6">
            <h3 className="mb-4">Market Insights for {propertyData.suburb}</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="mb-3">Typical Buyer Demographics</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">First Home Buyers</span>
                    <span>35%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Families Upgrading</span>
                    <span>28%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Investors</span>
                    <span>22%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Downsizers</span>
                    <span>15%</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="mb-3">Popular Features</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Outdoor Living Space</span>
                    <span className="text-green-600">High demand</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Off-street Parking</span>
                    <span className="text-green-600">High demand</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Updated Kitchen</span>
                    <span className="text-green-600">High demand</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Home Office Space</span>
                    <span className="text-orange-600">Medium demand</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Agent Referral CTA */}
          <Card className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-shrink-0">
                <div className="bg-white bg-opacity-20 rounded-full p-4">
                  <UserCheck className="size-12" />
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-white mb-2">Need Help Selling Your Home?</h3>
                <p className="text-blue-100 text-sm">
                  We'll connect you with a trusted real estate agent who specializes in helping retirees downsize and transition to retirement living. No obligation, completely free service.
                </p>
              </div>
              <div className="flex-shrink-0">
                <Button 
                  size="lg"
                  onClick={() => setShowAgentForm(true)}
                  className="bg-white text-blue-600 hover:bg-blue-50"
                >
                  Get Agent Referral
                </Button>
              </div>
            </div>
          </Card>
        </>
      )}

      {/* Agent Referral Form Modal */}
      {showAgentForm && calculationResults && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="max-w-2xl w-full my-8">
            <AgentReferralForm 
              source="home_valuation"
              estimatedValue={calculationResults.estimatedValue}
              postcode={propertyData.postcode}
              onClose={() => setShowAgentForm(false)}
              onSuccess={() => {
                setShowAgentForm(false);
              }}
            />
          </div>
        </div>
      )}
      </>
      )}
    </div>
  );
}