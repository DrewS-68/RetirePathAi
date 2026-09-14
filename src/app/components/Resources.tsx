import { Card } from './ui/card';
import { UserData } from '../App';
import { 
  ExternalLink,
  FileText,
  Phone,
  Calculator,
  BookOpen,
  Video
} from 'lucide-react';

interface ResourcesProps {
  userData: UserData | null;
}

export function Resources({ userData }: ResourcesProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="mb-2">Helpful Resources</h2>
        <p className="text-muted-foreground">
          Access information, contacts, and guidance to help you through your retirement village journey
        </p>
      </div>

      {/* Tools & Information */}
      <div>
        <h3 className="mb-4">Financial Planning & Tools</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="p-6">
            <div className="flex items-start gap-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Calculator className="size-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h4 className="mb-2">Cost Analysis</h4>
                <p className="text-sm text-muted-foreground">
                  Use the Contract Analyzer to calculate total costs including entry fees, 
                  ongoing charges, DMF, and exit fees for your specific contracts.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start gap-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <Calculator className="size-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h4 className="mb-2">Home Value Estimator</h4>
                <p className="text-sm text-muted-foreground">
                  Use the Home Value Estimator to get an automated estimate of your property value and potential 
                  selling proceeds after agent fees and costs.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start gap-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <FileText className="size-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h4 className="mb-2">Contract Comparison</h4>
                <p className="text-sm text-muted-foreground">
                  Add multiple contracts in the Contract Analyzer to compare costs, 
                  fees, and inheritance impacts side-by-side.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start gap-4">
              <div className="bg-orange-100 p-3 rounded-lg">
                <FileText className="size-6 text-orange-600" />
              </div>
              <div className="flex-1">
                <h4 className="mb-2">Village Matching</h4>
                <p className="text-sm text-muted-foreground">
                  Complete the Village Matcher assessment to find retirement villages that 
                  align with your health, lifestyle, and financial needs.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Educational Resources */}
      <div>
        <h3 className="mb-4">Understanding Retirement Villages</h3>
        <div className="grid md:grid-cols-1 gap-4">
          <Card className="p-6">
            <div className="flex items-start gap-4">
              <div className="bg-red-100 p-3 rounded-lg">
                <BookOpen className="size-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h4 className="mb-2">Ownership Models Explained</h4>
                <p className="text-sm text-muted-foreground">
                  Retirement villages operate under different ownership models: Loan/License (most common), 
                  Leasehold, Freehold/Strata, and Rental. Each has different financial implications, 
                  ownership rights, and exit arrangements. The Village Guide section provides detailed 
                  explanations of each model.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start gap-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <BookOpen className="size-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h4 className="mb-2">Deferred Management Fees (DMF)</h4>
                <p className="text-sm text-muted-foreground">
                  DMFs are fees charged when you leave a retirement village, typically calculated as 
                  a percentage of your entry price or exit price. They can be structured annually 
                  (accumulating each year) or upfront (set percentage regardless of time stayed). 
                  Most have caps limiting the maximum fee. Understanding DMF structure is crucial for 
                  financial planning and inheritance.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start gap-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <FileText className="size-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h4 className="mb-2">Your Rights as a Resident</h4>
                <p className="text-sm text-muted-foreground">
                  As a retirement village resident, you have legal rights including: a cooling-off 
                  period after signing, access to dispute resolution, protection from unfair contract 
                  terms, and the right to sell and leave. State laws vary, so check with your local 
                  consumer protection office for specific regulations in your area.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Important Contacts */}
      <div>
        <h3 className="mb-4">Important Contacts & Services</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="p-6">
            <h4 className="mb-4">Legal & Financial Advisors</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Phone className="size-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm"><strong>Retirement Living Council</strong></p>
                  <p className="text-sm text-muted-foreground">Industry body with resources and complaints handling</p>
                  <a href="https://www.retirementliving.org.au" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-1 mt-1">
                    Visit Website <ExternalLink className="size-3" />
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="size-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm"><strong>Financial Counselling Service</strong></p>
                  <p className="text-sm text-muted-foreground">Free, independent financial advice</p>
                  <a href="https://www.financialcounsellingaustralia.org.au" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-1 mt-1">
                    Find a Counsellor <ExternalLink className="size-3" />
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="size-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm"><strong>Legal Aid</strong></p>
                  <p className="text-sm text-muted-foreground">Free or low-cost legal advice for contract reviews</p>
                  <a href="https://www.nationallegalaid.org" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-1 mt-1">
                    Contact Legal Aid <ExternalLink className="size-3" />
                  </a>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h4 className="mb-4">Real Estate & Moving Services</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Phone className="size-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm"><strong>Retirement Downsizing Specialists</strong></p>
                  <p className="text-sm text-muted-foreground">Real estate agents specializing in senior transitions</p>
                  <a href="https://www.reia.com.au" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-1 mt-1">
                    Find an Agent <ExternalLink className="size-3" />
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="size-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm"><strong>Senior Move Managers</strong></p>
                  <p className="text-sm text-muted-foreground">Professional help with downsizing and relocation</p>
                  <a href="https://www.asamaustralia.com.au" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-1 mt-1">
                    Learn More <ExternalLink className="size-3" />
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="size-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm"><strong>Decluttering Services</strong></p>
                  <p className="text-sm text-muted-foreground">Professional assistance with sorting and downsizing belongings</p>
                  <p className="text-sm text-muted-foreground mt-1">Use the Progress Tracker to plan your decluttering timeline</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h4 className="mb-4">Government Resources</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Phone className="size-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm"><strong>Aged Care Services</strong></p>
                  <p className="text-sm text-muted-foreground">My Aged Care for information on aged care services</p>
                  <a href="https://www.myagedcare.gov.au" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-1 mt-1">
                    Visit My Aged Care <ExternalLink className="size-3" />
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="size-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm"><strong>Centrelink Age Pension</strong></p>
                  <p className="text-sm text-muted-foreground">Information on how retirement village living affects pensions</p>
                  <a href="https://www.servicesaustralia.gov.au/age-pension" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-1 mt-1">
                    Learn More <ExternalLink className="size-3" />
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="size-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm"><strong>Consumer Protection</strong></p>
                  <p className="text-sm text-muted-foreground">Your state's consumer affairs office</p>
                  <a href="https://www.accc.gov.au" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-1 mt-1">
                    Find Your State Office <ExternalLink className="size-3" />
                  </a>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h4 className="mb-4">Retirement Village Information</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Phone className="size-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm"><strong>Choice - Retirement Living</strong></p>
                  <p className="text-sm text-muted-foreground">Independent reviews and advice on retirement villages</p>
                  <a href="https://www.choice.com.au/health-and-body/healthy-ageing/retirement" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-1 mt-1">
                    Read Reviews <ExternalLink className="size-3" />
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="size-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm"><strong>Property Council of Australia</strong></p>
                  <p className="text-sm text-muted-foreground">Retirement living industry resources and information</p>
                  <a href="https://www.propertycouncil.com.au" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-1 mt-1">
                    Visit Website <ExternalLink className="size-3" />
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="size-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm"><strong>Village Matcher Tool</strong></p>
                  <p className="text-sm text-muted-foreground">Use our Village Matcher to find suitable villages</p>
                  <p className="text-sm text-muted-foreground mt-1">Complete the assessment in the Village Matcher tab</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* FAQ Section */}
      <Card className="p-6">
        <h3 className="mb-4">Frequently Asked Questions</h3>
        <div className="space-y-4">
          <div>
            <h4 className="mb-2">What's the difference between a retirement village and aged care?</h4>
            <p className="text-sm text-muted-foreground">
              Retirement villages are for independent living with optional support services. 
              Aged care facilities provide 24/7 care for those who need daily assistance. 
              Many people transition from a retirement village to aged care when their needs increase.
            </p>
          </div>
          <div>
            <h4 className="mb-2">Can I get my money back if I leave a retirement village?</h4>
            <p className="text-sm text-muted-foreground">
              It depends on your contract type. In most cases, you receive back your entry payment 
              minus the Deferred Management Fee (DMF) and any other agreed fees. The DMF typically 
              increases the longer you stay, up to a maximum cap.
            </p>
          </div>
          <div>
            <h4 className="mb-2">How long does it take to sell my unit when I want to leave?</h4>
            <p className="text-sm text-muted-foreground">
              This varies significantly. Some villages have waiting lists and units sell quickly. 
              Others can take 12+ months. Your contract should specify who is responsible for marketing 
              and what happens if the unit doesn't sell quickly.
            </p>
          </div>
          <div>
            <h4 className="mb-2">Will living in a retirement village affect my pension?</h4>
            <p className="text-sm text-muted-foreground">
              It can. Your entry payment may be treated as an asset by Centrelink, potentially affecting 
              your Age Pension. Consult a financial advisor familiar with Centrelink rules to understand 
              the specific impact on your situation.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}