import { Card } from './ui/card';
import { CheckCircle, Heart, Shield, Users, Zap, Target } from 'lucide-react';

export function About() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">About RetirePath</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Empowering Australian retirees with intelligent tools and comprehensive guidance for their retirement village journey.
        </p>
      </div>

      {/* Mission Statement */}
      <Card className="p-8 bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
        <div className="flex items-start gap-4">
          <Target className="size-12 text-blue-600 flex-shrink-0 mt-1" />
          <div>
            <h2 className="text-2xl font-bold mb-3">Our Mission</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              To make the retirement village decision-making process transparent, accessible, and stress-free for all Australians. 
              We believe that choosing where to spend your retirement years should be empowering, not overwhelming.
            </p>
          </div>
        </div>
      </Card>

      {/* The Problem We Solve */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Why RetirePath Exists</h2>
        <Card className="p-6">
          <div className="space-y-4 text-muted-foreground">
            <p>
              Transitioning to a retirement village is one of the biggest decisions you'll make in your later years. 
              It affects your lifestyle, finances, healthcare, and family relationships. Yet, the process is often:
            </p>
            <ul className="space-y-2 ml-6">
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-1">•</span>
                <span><strong>Confusing:</strong> Retirement village contracts are complex, with terms like "Deferred Management Fees," "entry contributions," and "capital gains sharing" that most people don't understand</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-1">•</span>
                <span><strong>Overwhelming:</strong> With hundreds of villages across Australia, each offering different amenities, care levels, and contracts, comparison is nearly impossible</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-1">•</span>
                <span><strong>Time-consuming:</strong> Researching villages, attending open days, reviewing contracts, selling your home, decluttering, and coordinating the move takes months or even years</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-1">•</span>
                <span><strong>Stressful:</strong> The combination of financial uncertainty, emotional attachment to your home, and concern about making the "wrong" choice creates significant anxiety</span>
              </li>
            </ul>
            <p className="pt-2">
              <strong>RetirePath was created to change this.</strong> We bring together comprehensive village data, intelligent analysis tools, 
              and educational resources in one place—making the process clearer, faster, and more confident.
            </p>
          </div>
        </Card>
      </div>

      {/* Our Values */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Our Values</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="p-6">
            <div className="flex items-start gap-3">
              <Shield className="size-8 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-2">Transparency First</h3>
                <p className="text-sm text-muted-foreground">
                  We're completely independent and not affiliated with any retirement village operators or real estate agencies. 
                  Our only goal is to help you make the best decision for your circumstances.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start gap-3">
              <Heart className="size-8 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-2">Empathy & Understanding</h3>
                <p className="text-sm text-muted-foreground">
                  We understand that retirement decisions aren't just financial—they're deeply personal and emotional. 
                  Our tools and resources are designed with compassion and respect for your journey.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start gap-3">
              <Zap className="size-8 text-yellow-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-2">Innovation & Technology</h3>
                <p className="text-sm text-muted-foreground">
                  We leverage artificial intelligence and data analysis to simplify complex information—but we're clear about 
                  the limitations of technology and always recommend professional advice for major decisions.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start gap-3">
              <Users className="size-8 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-2">Community Focus</h3>
                <p className="text-sm text-muted-foreground">
                  Your feedback shapes our platform. We actively listen to users and village operators to continuously 
                  improve our tools, data accuracy, and educational content.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* What Makes Us Different */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">What Makes RetirePath Different</h2>
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="size-5 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold mb-1">Quality Over Quantity</h4>
                <p className="text-sm text-muted-foreground">
                  We've meticulously verified nearly 2,000 retirement villages across Australia. We prioritize accuracy over having 
                  every single village listed. If a village is missing, users and operators can notify us for addition.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="size-5 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold mb-1">No "Advice" Claims</h4>
                <p className="text-sm text-muted-foreground">
                  We're clear about what our tools are—and aren't. Our Contract Analyzer Tool is not legal advice. 
                  Our Home Value Estimator is not a professional valuation. We provide information to help you ask better questions 
                  and make more informed decisions with professional guidance.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="size-5 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold mb-1">Comprehensive Approach</h4>
                <p className="text-sm text-muted-foreground">
                  Most platforms focus on just one aspect—finding a village, or selling your home, or understanding contracts. 
                  RetirePath covers the entire journey: from initial research and home valuation, through contract analysis and 
                  decluttering timelines, to family communication guides.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="size-5 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold mb-1">Accessible Pricing</h4>
                <p className="text-sm text-muted-foreground">
                  We offer flexible membership options (1, 3, or 6 months) with no auto-renewal—you're never locked into ongoing subscriptions. 
                  Many tools are available on the free tier, and premium features are priced to be accessible for retirees on fixed incomes.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="size-5 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold mb-1">Built for Retirees</h4>
                <p className="text-sm text-muted-foreground">
                  Our interface is designed with older Australians in mind—large text, clear navigation, minimal jargon, 
                  and accessibility features for users with disabilities. We test with real retirees to ensure usability.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Our Commitment to Accuracy */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Our Commitment to Data Accuracy</h2>
        <Card className="p-6 border-blue-200 bg-blue-50">
          <div className="space-y-3 text-muted-foreground">
            <p>
              <strong className="text-foreground">We take data accuracy seriously.</strong> All retirement village information in our directory 
              has been verified through multiple sources including:
            </p>
            <ul className="space-y-2 ml-6">
              <li>• Official village operator websites and documentation</li>
              <li>• Direct contact with village management</li>
              <li>• Industry associations and regulatory bodies</li>
              <li>• Regular audits and updates to ensure information remains current</li>
            </ul>
            <p className="pt-2">
              If you notice incorrect or outdated information, please report it to <strong>support@retirepath.com.au</strong>. 
              We investigate and correct issues promptly—typically within 2-3 business days.
            </p>
          </div>
        </Card>
      </div>

      {/* What We're NOT */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">What We're NOT</h2>
        <Card className="p-6 border-amber-200 bg-amber-50">
          <div className="space-y-3">
            <p className="text-muted-foreground">
              <strong className="text-foreground">To be absolutely clear:</strong>
            </p>
            <ul className="space-y-2 ml-6 text-muted-foreground">
              <li>❌ We are <strong>not lawyers</strong> and do not provide legal advice about contracts</li>
              <li>❌ We are <strong>not financial advisors</strong> and do not provide financial advice</li>
              <li>❌ We are <strong>not real estate agents</strong> and do not provide property valuations</li>
              <li>❌ We are <strong>not affiliated</strong> with any retirement village operators or agencies</li>
              <li>❌ We do <strong>not receive commissions</strong> from villages when you sign up</li>
            </ul>
            <p className="text-muted-foreground pt-2">
              <strong className="text-foreground">We are an independent information platform</strong> that helps you research, 
              compare, and understand your options—but you should always consult qualified professionals before making final decisions.
            </p>
          </div>
        </Card>
      </div>

      {/* Get in Touch */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Get in Touch</h2>
        <Card className="p-6">
          <div className="space-y-4">
            <p className="text-muted-foreground">
              We'd love to hear from you! Whether you have questions, feedback, or suggestions for improvement, 
              please don't hesitate to reach out.
            </p>
            
            <div className="grid md:grid-cols-2 gap-4 pt-4">
              <div>
                <h4 className="font-semibold mb-2">General Inquiries</h4>
                <p className="text-sm text-muted-foreground">
                  <strong>Email:</strong> <a href="mailto:info@retirepath.com.au" className="text-blue-600 hover:underline">info@retirepath.com.au</a>
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Customer Support</h4>
                <p className="text-sm text-muted-foreground">
                  <strong>Email:</strong> <a href="mailto:support@retirepath.com.au" className="text-blue-600 hover:underline">support@retirepath.com.au</a>
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Village Operators</h4>
                <p className="text-sm text-muted-foreground">
                  Want to add or update your village listing? 
                  <br />
                  <a href="#list-village" className="text-blue-600 hover:underline">Submit your information here</a>
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Feedback & Suggestions</h4>
                <p className="text-sm text-muted-foreground">
                  <strong>Email:</strong> <a href="mailto:feedback@retirepath.com.au" className="text-blue-600 hover:underline">feedback@retirepath.com.au</a>
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Final Note */}
      <div className="text-center py-8 border-t">
        <p className="text-muted-foreground italic">
          RetirePath is proudly Australian-owned and operated. We're here to support you through one of life's most important transitions.
        </p>
      </div>
    </div>
  );
}
