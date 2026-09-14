import { Card } from './ui/card';
import { UserData } from '../App';
import { 
  Home,
  Hammer,
  Camera,
  TrendingUp,
  Users,
  FileText,
  Calendar,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

interface SellingGuideProps {
  userData: UserData | null;
}

export function SellingGuide({ userData }: SellingGuideProps) {
  const needsToSell = userData?.homeOwnership === 'yes-sell';

  return (
    <div className="space-y-8">
      {/* Personalized Alert */}
      {needsToSell && (
        <Alert>
          <AlertCircle className="size-4" />
          <AlertDescription>
            Since you're planning to sell your home to fund your move, timing will be crucial. 
            We recommend starting the preparation process 3-6 months before you want to move.
          </AlertDescription>
        </Alert>
      )}

      {/* Introduction */}
      <Card className="p-6">
        <h2 className="mb-4">Selling Your Home: A Complete Guide</h2>
        <p className="text-muted-foreground mb-4">
          Selling your home is a significant step in transitioning to retirement village life. 
          Whether you're downsizing after decades in a family home or selling an investment property, 
          proper preparation and timing are essential to maximize your sale price and minimize stress.
        </p>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="mb-2">Average Timeline</h4>
            <p className="text-sm text-muted-foreground">
              3-6 months from preparation to settlement
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="mb-2">Typical Costs</h4>
            <p className="text-sm text-muted-foreground">
              2-4% of sale price in fees and expenses
            </p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <h4 className="mb-2">Success Factor</h4>
            <p className="text-sm text-muted-foreground">
              Preparation and presentation matter most
            </p>
          </div>
        </div>
      </Card>

      {/* Timeline Coordination */}
      <Card className="p-6 bg-amber-50">
        <div className="flex gap-4">
          <Calendar className="size-6 text-amber-600 flex-shrink-0" />
          <div>
            <h3 className="mb-2">Timing Your Sale with Your Move</h3>
            <p className="text-muted-foreground mb-4">
              One of the biggest challenges is coordinating the sale of your home with your retirement village move-in date.
            </p>
            <div className="space-y-2 text-sm">
              <p><strong>Option 1: Sell First, Move Later</strong></p>
              <p className="text-muted-foreground ml-4">
                Sell your home and arrange temporary accommodation if needed. This reduces financial pressure 
                and gives you time to settle into the village without rushing.
              </p>
              <p className="mt-3"><strong>Option 2: Conditional Settlement</strong></p>
              <p className="text-muted-foreground ml-4">
                Negotiate a longer settlement period (90-120 days) to give you time to move. 
                This is often acceptable to buyers, especially investors.
              </p>
              <p className="mt-3"><strong>Option 3: Bridge Financing</strong></p>
              <p className="text-muted-foreground ml-4">
                Use bridge financing to secure your retirement village unit while your home is still selling. 
                Consult with a financial advisor about this option.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Step-by-Step Process */}
      <div>
        <h2 className="mb-6">Step-by-Step Selling Process</h2>

        {/* Step 1 */}
        <Card className="p-6 mb-4">
          <div className="flex items-start gap-4">
            <div className="bg-green-600 text-white rounded-full size-12 flex items-center justify-center flex-shrink-0">
              1
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Hammer className="size-5 text-green-600" />
                <h3>Prepare Your Property</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                First impressions matter. A well-presented home sells faster and for more money.
              </p>
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="mb-2">Repairs & Maintenance</h4>
                  <div className="space-y-2 text-sm">
                    <p className="flex items-center gap-2">
                      <CheckCircle className="size-4 text-green-600" />
                      Fix leaky taps, broken tiles, and damaged fixtures
                    </p>
                    <p className="flex items-center gap-2">
                      <CheckCircle className="size-4 text-green-600" />
                      Repair cracks in walls and ceilings
                    </p>
                    <p className="flex items-center gap-2">
                      <CheckCircle className="size-4 text-green-600" />
                      Ensure all doors and windows open smoothly
                    </p>
                    <p className="flex items-center gap-2">
                      <CheckCircle className="size-4 text-green-600" />
                      Service air conditioning and heating systems
                    </p>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="mb-2">Cleaning & Presentation</h4>
                  <div className="space-y-2 text-sm">
                    <p className="flex items-center gap-2">
                      <CheckCircle className="size-4 text-green-600" />
                      Deep clean every room, including carpets
                    </p>
                    <p className="flex items-center gap-2">
                      <CheckCircle className="size-4 text-green-600" />
                      Declutter and remove personal items
                    </p>
                    <p className="flex items-center gap-2">
                      <CheckCircle className="size-4 text-green-600" />
                      Fresh paint in neutral colors if needed
                    </p>
                    <p className="flex items-center gap-2">
                      <CheckCircle className="size-4 text-green-600" />
                      Enhance curb appeal: mow lawns, trim hedges, clean gutters
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Step 2 */}
        <Card className="p-6 mb-4">
          <div className="flex items-start gap-4">
            <div className="bg-green-600 text-white rounded-full size-12 flex items-center justify-center flex-shrink-0">
              2
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Users className="size-5 text-green-600" />
                <h3>Choose the Right Real Estate Agent</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                A good agent can make a significant difference to your sale price and experience.
              </p>
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <h4>What to Look For:</h4>
                <div className="space-y-2 text-sm">
                  <p className="flex items-center gap-2">
                    <CheckCircle className="size-4 text-green-600" />
                    <span><strong>Local Experience:</strong> Agent knows your area and market</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <CheckCircle className="size-4 text-green-600" />
                    <span><strong>Recent Sales:</strong> Check their recent sales in similar properties</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <CheckCircle className="size-4 text-green-600" />
                    <span><strong>Communication:</strong> Responsive and keeps you informed</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <CheckCircle className="size-4 text-green-600" />
                    <span><strong>Marketing Plan:</strong> Clear strategy for promoting your property</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <CheckCircle className="size-4 text-green-600" />
                    <span><strong>Competitive Commission:</strong> Typically 1.5-3% depending on location</span>
                  </p>
                </div>
                <Alert className="mt-4">
                  <AlertCircle className="size-4" />
                  <AlertDescription>
                    <strong>Tip:</strong> Interview 3-4 agents before making your decision. Compare their market appraisals and marketing strategies.
                  </AlertDescription>
                </Alert>
              </div>
            </div>
          </div>
        </Card>

        {/* Step 3 */}
        <Card className="p-6 mb-4">
          <div className="flex items-start gap-4">
            <div className="bg-green-600 text-white rounded-full size-12 flex items-center justify-center flex-shrink-0">
              3
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="size-5 text-green-600" />
                <h3>Set the Right Price</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Pricing is crucial. Too high and you won't attract buyers; too low and you lose money.
              </p>
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="mb-2">Pricing Strategies:</h4>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p><strong>Market Value Pricing</strong></p>
                      <p className="text-muted-foreground">
                        Price at the true market value based on recent comparable sales. 
                        This attracts serious buyers and typically results in a sale within 4-8 weeks.
                      </p>
                    </div>
                    <div>
                      <p><strong>Slight Premium Pricing</strong></p>
                      <p className="text-muted-foreground">
                        Price 5-10% above market value with room to negotiate. 
                        Works in strong markets but may result in longer selling time.
                      </p>
                    </div>
                    <div>
                      <p><strong>Competitive Pricing</strong></p>
                      <p className="text-muted-foreground">
                        Price slightly below market to create urgency and potentially attract multiple offers. 
                        Can work well in slow markets.
                      </p>
                    </div>
                  </div>
                </div>
                <Alert>
                  <AlertCircle className="size-4" />
                  <AlertDescription>
                    <strong>Remember:</strong> The market determines value, not your emotional attachment or what you need for your retirement village entry.
                  </AlertDescription>
                </Alert>
              </div>
            </div>
          </div>
        </Card>

        {/* Step 4 */}
        <Card className="p-6 mb-4">
          <div className="flex items-start gap-4">
            <div className="bg-green-600 text-white rounded-full size-12 flex items-center justify-center flex-shrink-0">
              4
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Camera className="size-5 text-green-600" />
                <h3>Marketing Your Property</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Effective marketing reaches the right buyers and showcases your property's best features.
              </p>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <h4 className="mb-2">Essential Marketing Elements:</h4>
                <p className="flex items-center gap-2">
                  <CheckCircle className="size-4 text-green-600" />
                  Professional photography and possibly drone footage
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle className="size-4 text-green-600" />
                  Well-written property description highlighting key features
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle className="size-4 text-green-600" />
                  Listing on major property websites (realestate.com.au, Domain, etc.)
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle className="size-4 text-green-600" />
                  "For Sale" sign with agent contact details
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle className="size-4 text-green-600" />
                  Social media promotion and email to agent's database
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle className="size-4 text-green-600" />
                  Open homes or private inspections
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Step 5 */}
        <Card className="p-6 mb-4">
          <div className="flex items-start gap-4">
            <div className="bg-green-600 text-white rounded-full size-12 flex items-center justify-center flex-shrink-0">
              5
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Home className="size-5 text-green-600" />
                <h3>Conducting Inspections</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                First impressions during inspections are critical to securing a sale.
              </p>
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <h4>Before Each Inspection:</h4>
                <div className="space-y-2 text-sm">
                  <p className="flex items-center gap-2">
                    <CheckCircle className="size-4 text-green-600" />
                    Open all curtains and blinds for natural light
                  </p>
                  <p className="flex items-center gap-2">
                    <CheckCircle className="size-4 text-green-600" />
                    Turn on lights in darker rooms
                  </p>
                  <p className="flex items-center gap-2">
                    <CheckCircle className="size-4 text-green-600" />
                    Create pleasant ambiance (soft music, fresh flowers)
                  </p>
                  <p className="flex items-center gap-2">
                    <CheckCircle className="size-4 text-green-600" />
                    Remove pets during inspections
                  </p>
                  <p className="flex items-center gap-2">
                    <CheckCircle className="size-4 text-green-600" />
                    Let your agent conduct the tour - avoid being present if possible
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Step 6 */}
        <Card className="p-6 mb-4">
          <div className="flex items-start gap-4">
            <div className="bg-green-600 text-white rounded-full size-12 flex items-center justify-center flex-shrink-0">
              6
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="size-5 text-green-600" />
                <h3>Negotiating & Accepting an Offer</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                When offers come in, your agent will guide you through negotiation and acceptance.
              </p>
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="mb-2">Evaluating Offers:</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Price:</strong> Not just the offer amount, but also terms and conditions</p>
                    <p><strong>Conditions:</strong> Fewer conditions mean lower risk of deal falling through</p>
                    <p><strong>Settlement Period:</strong> When the buyer wants to settle (important for your timing)</p>
                    <p><strong>Deposit:</strong> Larger deposits show serious intent (typically 10%)</p>
                    <p><strong>Finance Clause:</strong> Pre-approved buyers are lower risk</p>
                  </div>
                </div>
                <Alert>
                  <AlertCircle className="size-4" />
                  <AlertDescription>
                    <strong>Tip:</strong> Don't automatically accept the highest offer. Consider the terms and the buyer's ability to complete the sale.
                  </AlertDescription>
                </Alert>
              </div>
            </div>
          </div>
        </Card>

        {/* Step 7 */}
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="bg-green-600 text-white rounded-full size-12 flex items-center justify-center flex-shrink-0">
              7
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="size-5 text-green-600" />
                <h3>Settlement Process</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                The final step is settlement, where ownership transfers to the buyer.
              </p>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <p className="flex items-center gap-2">
                  <CheckCircle className="size-4 text-green-600" />
                  Your solicitor/conveyancer handles the legal paperwork
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle className="size-4 text-green-600" />
                  Buyer's deposit held in trust until settlement
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle className="size-4 text-green-600" />
                  Final property inspection by buyer before settlement
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle className="size-4 text-green-600" />
                  Settlement day: funds transferred, you hand over keys
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle className="size-4 text-green-600" />
                  You receive sale proceeds minus agent fees and legal costs
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Costs to Consider */}
      <Card className="p-6">
        <h3 className="mb-4">Expected Selling Costs</h3>
        <div className="space-y-3">
          <div className="flex justify-between p-3 bg-gray-50 rounded">
            <span>Real Estate Agent Commission</span>
            <span>1.5-3% of sale price</span>
          </div>
          <div className="flex justify-between p-3 bg-gray-50 rounded">
            <span>Legal/Conveyancing Fees</span>
            <span>$800 - $2,500</span>
          </div>
          <div className="flex justify-between p-3 bg-gray-50 rounded">
            <span>Marketing Costs</span>
            <span>$500 - $5,000</span>
          </div>
          <div className="flex justify-between p-3 bg-gray-50 rounded">
            <span>Styling/Photography</span>
            <span>$500 - $3,000</span>
          </div>
          <div className="flex justify-between p-3 bg-gray-50 rounded">
            <span>Pre-sale Repairs/Improvements</span>
            <span>$1,000 - $10,000+</span>
          </div>
          <div className="flex justify-between p-3 bg-blue-50 rounded">
            <span><strong>Estimated Total</strong></span>
            <span><strong>2-4% of sale price + repairs</strong></span>
          </div>
        </div>
      </Card>
    </div>
  );
}
