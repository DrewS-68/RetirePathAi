import { Card } from './ui/card';
import { Button } from './ui/button';
import { UserData } from '../App';
import { 
  Building2, 
  DollarSign, 
  FileText, 
  Search, 
  Users, 
  Heart,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

interface RetirementGuideProps {
  userData: UserData | null;
}

export function RetirementGuide({ userData }: RetirementGuideProps) {
  const getPersonalizedMessage = () => {
    if (!userData) return null;

    const messages = [];
    
    if (userData.timeline === 'urgent' || userData.timeline === 'soon') {
      messages.push('Based on your timeline, we recommend starting with village tours immediately.');
    }
    
    if (userData.concerns.includes('Understanding the financial commitment')) {
      messages.push('We\'ve highlighted the financial sections to help address your concerns.');
    }

    return messages;
  };

  const personalizedMessages = getPersonalizedMessage();

  return (
    <div className="space-y-8">
      {/* Personalized Alert */}
      {personalizedMessages && personalizedMessages.length > 0 && (
        <Alert>
          <AlertCircle className="size-4" />
          <AlertDescription>
            <div className="space-y-2">
              {personalizedMessages.map((msg, idx) => (
                <p key={idx}>{msg}</p>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Introduction */}
      <Card className="p-6">
        <h2 className="mb-4">Understanding Retirement Villages</h2>
        <p className="text-muted-foreground mb-4">
          Retirement villages offer independent living with added support, amenities, and a sense of community. 
          They're designed for people aged 55+ who want to maintain their independence while having access to 
          services and social activities.
        </p>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="mb-2">Independent Living</h4>
            <p className="text-sm text-muted-foreground">
              Own or lease your unit with full independence
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="mb-2">Community Support</h4>
            <p className="text-sm text-muted-foreground">
              Access to on-site support and emergency assistance
            </p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <h4 className="mb-2">Amenities & Activities</h4>
            <p className="text-sm text-muted-foreground">
              Shared facilities and organized social programs
            </p>
          </div>
        </div>
      </Card>

      {/* Step-by-Step Process */}
      <div>
        <h2 className="mb-6">Your Step-by-Step Journey</h2>
        
        {/* Step 1 */}
        <Card className="p-6 mb-4">
          <div className="flex items-start gap-4">
            <div className="bg-blue-600 text-white rounded-full size-12 flex items-center justify-center flex-shrink-0">
              1
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Search className="size-5 text-blue-600" />
                <h3>Research & Explore Options</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Start by understanding what different retirement villages offer and what suits your lifestyle.
              </p>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <p className="flex items-center gap-2">
                  <CheckCircle className="size-4 text-green-600" />
                  Visit retirement village websites and request brochures
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle className="size-4 text-green-600" />
                  Consider location, proximity to family, and local amenities
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle className="size-4 text-green-600" />
                  List your must-haves (e.g., swimming pool, bowling green, workshop)
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle className="size-4 text-green-600" />
                  Check online reviews and testimonials
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Step 2 */}
        <Card className="p-6 mb-4">
          <div className="flex items-start gap-4">
            <div className="bg-blue-600 text-white rounded-full size-12 flex items-center justify-center flex-shrink-0">
              2
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="size-5 text-blue-600" />
                <h3>Visit & Tour Villages</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Schedule tours at multiple villages to compare and get a feel for the community.
              </p>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <p className="flex items-center gap-2">
                  <CheckCircle className="size-4 text-green-600" />
                  Book tours at 3-5 different villages for comparison
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle className="size-4 text-green-600" />
                  Visit during social activities to see community engagement
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle className="size-4 text-green-600" />
                  Talk to current residents about their experiences
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle className="size-4 text-green-600" />
                  Ask about waiting lists and availability
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Step 3 */}
        <Card className="p-6 mb-4">
          <div className="flex items-start gap-4">
            <div className="bg-blue-600 text-white rounded-full size-12 flex items-center justify-center flex-shrink-0">
              3
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="size-5 text-blue-600" />
                <h3>Understand the Costs</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Retirement village costs vary significantly. Understanding all fees is crucial.
              </p>
              <div className="space-y-4">
                <div className="bg-amber-50 p-4 rounded-lg">
                  <h4 className="mb-2">Typical Cost Components:</h4>
                  <ul className="space-y-2 text-sm">
                    <li><strong>Entry Cost:</strong> Purchase price or ingoing contribution ($200k - $1M+)</li>
                    <li><strong>Ongoing Fees:</strong> Monthly service charges ($200 - $800+)</li>
                    <li><strong>Deferred Management Fee (DMF):</strong> Percentage taken when you leave (0-30%)</li>
                    <li><strong>Exit Fees:</strong> Additional costs when vacating</li>
                    <li><strong>Optional Services:</strong> Meals, additional care, utilities</li>
                  </ul>
                </div>
                <Alert>
                  <AlertCircle className="size-4" />
                  <AlertDescription>
                    <strong>Important:</strong> Get written quotes for all costs and have them reviewed by a financial advisor or solicitor.
                  </AlertDescription>
                </Alert>
              </div>
            </div>
          </div>
        </Card>

        {/* Step 4 */}
        <Card className="p-6 mb-4">
          <div className="flex items-start gap-4">
            <div className="bg-blue-600 text-white rounded-full size-12 flex items-center justify-center flex-shrink-0">
              4
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="size-5 text-blue-600" />
                <h3>Review Contracts Carefully</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Retirement village contracts are complex legal documents that require careful review.
              </p>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <p className="flex items-center gap-2">
                  <CheckCircle className="size-4 text-green-600" />
                  Understand the tenure type (lease, license, or unit title)
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle className="size-4 text-green-600" />
                  Review the Deferred Management Fee structure
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle className="size-4 text-green-600" />
                  Check exit conditions and your capital gain share
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle className="size-4 text-green-600" />
                  Understand what happens if you need to move to aged care
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle className="size-4 text-green-600" />
                  Get independent legal advice before signing
                </p>
              </div>
              <Alert className="mt-4">
                <AlertCircle className="size-4" />
                <AlertDescription>
                  <strong>Legal Requirement:</strong> In many regions, you have a cooling-off period (typically 7-14 days) after signing.
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </Card>

        {/* Step 5 */}
        <Card className="p-6 mb-4">
          <div className="flex items-start gap-4">
            <div className="bg-blue-600 text-white rounded-full size-12 flex items-center justify-center flex-shrink-0">
              5
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="size-5 text-blue-600" />
                <h3>Make Your Decision</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                After thorough research, choose the village that best fits your needs and budget.
              </p>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <p className="flex items-center gap-2">
                  <CheckCircle className="size-4 text-green-600" />
                  Compare all villages you've visited
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle className="size-4 text-green-600" />
                  Discuss with family members
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle className="size-4 text-green-600" />
                  Ensure the financial commitment is sustainable
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle className="size-4 text-green-600" />
                  Apply for your chosen unit or join the waiting list
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Step 6 */}
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="bg-blue-600 text-white rounded-full size-12 flex items-center justify-center flex-shrink-0">
              6
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Users className="size-5 text-blue-600" />
                <h3>Prepare for the Move</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Coordinate your move with selling your current home if applicable.
              </p>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <p className="flex items-center gap-2">
                  <CheckCircle className="size-4 text-green-600" />
                  Arrange removalists or plan a downsizing sale
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle className="size-4 text-green-600" />
                  Update your address with important services
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle className="size-4 text-green-600" />
                  Connect utilities and services at the new unit
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle className="size-4 text-green-600" />
                  Attend orientation and welcome events
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Key Questions to Ask */}
      <Card className="p-6">
        <h3 className="mb-4">Essential Questions to Ask Villages</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4>Financial</h4>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>What is the total entry cost?</li>
              <li>What are the monthly service fees?</li>
              <li>How is the DMF calculated?</li>
              <li>What happens to capital gains?</li>
              <li>Are there any hidden costs?</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4>Services & Amenities</h4>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>What facilities are included?</li>
              <li>What services are available?</li>
              <li>Is there an on-site manager?</li>
              <li>What social activities are offered?</li>
              <li>Can I have pets?</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4>Healthcare</h4>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Is there emergency call assistance?</li>
              <li>Are healthcare services available?</li>
              <li>What happens if I need more care?</li>
              <li>Is there an aged care facility nearby?</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4>Exit Process</h4>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>How do I exit if needed?</li>
              <li>How long does resale typically take?</li>
              <li>Who manages the resale?</li>
              <li>What are the exit fees?</li>
              <li>When do I receive my funds?</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
