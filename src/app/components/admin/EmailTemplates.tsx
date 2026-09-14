import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Copy, CheckCircle, Building2, Home, Users, Mail } from 'lucide-react';
import { Textarea } from '../ui/textarea';

interface TemplateVariable {
  key: string;
  label: string;
  placeholder: string;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables: TemplateVariable[];
  category: 'operator' | 'agent' | 'follow-up';
}

const EMAIL_TEMPLATES: EmailTemplate[] = [
  // OPERATOR TEMPLATES
  {
    id: 'operator-initial',
    name: 'Initial Cold Outreach to Operators',
    subject: 'Free Listing for [VILLAGE_NAME] on RetirePath - Australia\'s Retirement Village Platform',
    body: `Dear [CONTACT_NAME],

I hope this email finds you well. My name is Drew Smith, and I'm reaching out from RetirePath (www.retirepath.com.au) - a comprehensive digital platform helping Australian retirees find and compare retirement villages.

We're building Australia's most complete retirement village directory, and I'd love to include [VILLAGE_NAME] in our database at no cost to you.

**What is RetirePath?**
RetirePath is a free platform where retirees and their families can:
- Search and compare retirement villages across Australia
- Analyze contract structures and costs
- Read verified resident reviews
- Book tours directly with villages
- Access educational resources about retirement living

**Why List with RetirePath?**
✅ **Completely FREE** - No listing fees, no commissions
✅ **Qualified Leads** - Connect with retirees actively searching for villages
✅ **Enhanced Profiles** - Showcase your amenities, photos, and unique features
✅ **Tour Bookings** - Receive tour requests directly from interested families
✅ **Review Management** - Build trust through verified resident reviews

**Current Reach:**
- 2,355+ villages listed across Australia
- 87+ operators already registered
- Growing database of active users searching for retirement accommodation

**Next Steps:**
You can add [VILLAGE_NAME] yourself in just 5 minutes at: https://www.retirepath.com.au/#operator

Or, if you prefer, I'm happy to add your village(s) on your behalf - just reply with your village details.

I'd also be delighted to schedule a brief call to show you the platform and discuss how RetirePath can help [VILLAGE_NAME] reach more qualified prospects.

Thank you for your time, and I look forward to featuring [VILLAGE_NAME] on RetirePath.

Warm regards,

Drew Smith
RetirePath
📧 drew@retirepath.com.au
📱 0422 208 230
🌐 www.retirepath.com.au

Your retirement village transition guide

RetirePath acknowledges the Traditional Custodians of Country throughout Australia and recognises their continuing connection to land, waters and culture. We pay our respects to Elders past and present.`,
    variables: [
      { key: 'CONTACT_NAME', label: 'Contact Name', placeholder: 'Village Manager' },
      { key: 'VILLAGE_NAME', label: 'Village Name', placeholder: 'Sunrise Retirement Village' },
    ],
    category: 'operator',
  },
  {
    id: 'operator-followup',
    name: 'Follow-Up (7-10 Days After Initial)',
    subject: 'Re: Free Listing for [VILLAGE_NAME] on RetirePath',
    body: `Hi [CONTACT_NAME],

I wanted to follow up on my previous email about listing [VILLAGE_NAME] on RetirePath at no cost.

I understand you're busy, so I'll keep this brief:

**Quick Stats:**
- RetirePath now features 2,355+ villages across Australia
- Free listing with enhanced profile (photos, amenities, contact details)
- Direct tour booking requests from qualified leads
- No fees, no commissions, no catches

**It takes 5 minutes to list your village:** https://www.retirepath.com.au/#operator

Many operators in [STATE] have already joined, including [EXAMPLE_OPERATOR_1] and [EXAMPLE_OPERATOR_2]. I'd hate for [VILLAGE_NAME] to miss out on this opportunity to reach retirees actively searching for their next home.

Would you like me to add your village on your behalf? Just reply with basic details (address, contact info, amenities) and I'll handle the rest.

Looking forward to hearing from you.

Best regards,

Drew Smith
RetirePath
📧 drew@retirepath.com.au
📱 0422 208 230`,
    variables: [
      { key: 'CONTACT_NAME', label: 'Contact Name', placeholder: 'Village Manager' },
      { key: 'VILLAGE_NAME', label: 'Village Name', placeholder: 'Sunrise Retirement Village' },
      { key: 'STATE', label: 'State', placeholder: 'NSW' },
      { key: 'EXAMPLE_OPERATOR_1', label: 'Example Operator 1', placeholder: 'Aveo Group' },
      { key: 'EXAMPLE_OPERATOR_2', label: 'Example Operator 2', placeholder: 'Lendlease' },
    ],
    category: 'follow-up',
  },
  {
    id: 'operator-multivillage',
    name: 'Multi-Village Operator (Larger Groups)',
    subject: 'Partnership Opportunity: List All [OPERATOR_NAME] Villages on RetirePath',
    body: `Dear [CONTACT_NAME],

I'm reaching out to discuss a partnership opportunity between RetirePath and [OPERATOR_NAME] to showcase your portfolio of retirement villages across Australia.

**About RetirePath:**
RetirePath (www.retirepath.com.au) is Australia's comprehensive retirement village platform, helping retirees find, compare, and transition to retirement villages. We're building the most complete national directory - and we'd love to feature all [OPERATOR_NAME] villages.

**What We Offer (100% Free):**
✅ Enhanced listings for all your villages
✅ Bulk upload support (we can add all your properties at once)
✅ Direct tour booking system
✅ Verified resident reviews
✅ Analytics dashboard to track interest and inquiries
✅ Featured placement opportunities for premium visibility

**Current Platform Stats:**
- 2,355+ villages listed nationally
- 87+ operators registered
- Growing user base of retirees actively searching
- Coverage across all Australian states and territories

**Partnership Benefits for [OPERATOR_NAME]:**
- **Centralized Management** - Update all your villages from one dashboard
- **Lead Generation** - Receive tour requests from qualified prospects
- **Brand Visibility** - Showcase your full portfolio to retirees and families
- **Market Intelligence** - See what features retirees are searching for
- **Competitive Advantage** - Be discoverable where retirees are searching

**Next Steps:**
I'd love to schedule a 15-minute call to:
1. Show you the RetirePath platform
2. Discuss how we can feature all [OPERATOR_NAME] villages
3. Explore potential partnership opportunities

Are you available for a brief call this week or next? I'm flexible with timing.

Alternatively, you can explore our operator dashboard at: https://www.retirepath.com.au/#operator

Thank you for considering this opportunity. I believe RetirePath can be a valuable channel for [OPERATOR_NAME] to connect with your ideal residents.

Warm regards,

Drew Smith
Founder, RetirePath
📧 drew@retirepath.com.au
📱 0422 208 230
🌐 www.retirepath.com.au`,
    variables: [
      { key: 'CONTACT_NAME', label: 'Contact Name', placeholder: 'Partnership Manager' },
      { key: 'OPERATOR_NAME', label: 'Operator Name', placeholder: 'Aveo Group' },
    ],
    category: 'operator',
  },
  {
    id: 'operator-gap-analysis',
    name: 'Gap Analysis - Missing Operators',
    subject: 'We\'d Love to Feature [VILLAGE_NAME] on RetirePath',
    body: `Dear [CONTACT_NAME],

I'm reaching out from RetirePath because [VILLAGE_NAME] is registered with [STATE] Fair Trading as a retirement village, but isn't yet listed on our platform.

RetirePath (www.retirepath.com.au) is Australia's leading retirement village directory, helping retirees find and compare villages across the country. We'd love to add [VILLAGE_NAME] to ensure families searching in [SUBURB] can discover your community.

**Why This Matters:**
Retirees are increasingly searching online to research retirement villages before making contact. If [VILLAGE_NAME] isn't listed on RetirePath, you may be missing opportunities to connect with qualified prospects.

**What We Offer (Completely Free):**
✅ Enhanced village profile with photos and amenities
✅ Direct tour booking requests from interested families
✅ No listing fees or commissions - ever
✅ Operator dashboard to manage your listing
✅ Verified resident reviews to build trust

**Quick Action:**
List your village in 5 minutes: https://www.retirepath.com.au/#operator

Or reply to this email, and I'll add [VILLAGE_NAME] on your behalf.

Many villages in [SUBURB]/[STATE] are already benefiting from RetirePath - I'd hate for [VILLAGE_NAME] to be left out.

Looking forward to featuring your village.

Best regards,

Drew Smith
RetirePath
📧 drew@retirepath.com.au
📱 0422 208 230`,
    variables: [
      { key: 'CONTACT_NAME', label: 'Contact Name', placeholder: 'Village Manager' },
      { key: 'VILLAGE_NAME', label: 'Village Name', placeholder: 'Sunset Gardens' },
      { key: 'STATE', label: 'State', placeholder: 'Victoria' },
      { key: 'SUBURB', label: 'Suburb', placeholder: 'Geelong' },
    ],
    category: 'operator',
  },
  // AGENT TEMPLATES
  {
    id: 'agent-initial',
    name: 'Initial Outreach to Real Estate Agents',
    subject: 'Partner with RetirePath - Help Your Downsizing Clients Transition to Retirement Living',
    body: `Dear [AGENT_NAME],

My name is Drew Smith, and I'm reaching out to introduce RetirePath - a platform that could add significant value to your clients who are downsizing and considering retirement villages.

**The Opportunity:**
Many of your clients selling family homes are transitioning to retirement villages. RetirePath helps them navigate this complex journey - and we'd love to partner with agents like you who specialize in downsizing and seniors' property.

**What is RetirePath?**
RetirePath (www.retirepath.com.au) is Australia's comprehensive retirement village platform offering:
- Village Matcher: Find suitable retirement villages based on preferences
- Contract Analyzer: Compare contract costs and structures
- Home Valuation Estimator: Estimate property values for downsizing
- Progress Tracker: Manage the entire transition process
- Educational Resources: Guides for selling homes and transitioning

**How This Benefits Your Business:**
✅ **Referral Opportunities** - We send qualified downsizing leads to trusted agents
✅ **Value-Added Service** - Provide clients with retirement planning resources
✅ **Lead Generation** - Get listed as a preferred agent for retiree home sales
✅ **Professional Network** - Connect with retirement village operators
✅ **Client Retention** - Help clients through their full transition journey

**Featured Agent Program:**
We're building a network of trusted real estate agents who specialize in downsizing and seniors' property transactions. Featured agents receive:
- Profile listing on RetirePath with contact details
- Priority referrals from users selling their homes
- Access to our agent dashboard
- Co-marketing opportunities

**Next Steps:**
I'd love to schedule a brief 10-minute call to:
1. Show you the RetirePath platform
2. Discuss how we can send downsizing leads your way
3. Explore partnership opportunities

Are you available for a quick call this week?

Alternatively, you can explore RetirePath at: https://www.retirepath.com.au

Thank you for your time, and I look forward to connecting.

Best regards,

Drew Smith
RetirePath
📧 drew@retirepath.com.au
📱 0422 208 230
🌐 www.retirepath.com.au`,
    variables: [
      { key: 'AGENT_NAME', label: 'Agent Name', placeholder: 'Sarah Johnson' },
    ],
    category: 'agent',
  },
  {
    id: 'agent-referral',
    name: 'Agent Lead Referral Program',
    subject: 'RetirePath Agent Partner Program - Get Qualified Downsizing Leads',
    body: `Hi [AGENT_NAME],

Are you looking for more qualified leads from retirees downsizing and selling their family homes?

**The Challenge:**
Retirees transitioning to retirement villages need to sell their current homes - but finding the right agent who understands their unique needs can be difficult.

**The Solution:**
RetirePath (www.retirepath.com.au) connects retirees with trusted agents who specialize in downsizing and seniors' property sales.

**How It Works:**
1. Retirees use our Home Valuation tool and retirement planning platform
2. When they're ready to sell, they request agent referrals
3. We connect them with featured agents in their local area (like you!)
4. You receive qualified leads with contact details
5. You help them sell and transition smoothly

**What You Get (Free Membership):**
✅ Qualified leads from retirees ready to downsize
✅ Agent profile on RetirePath with your specialty areas
✅ Access to our agent dashboard
✅ Contact details of interested sellers
✅ No upfront fees - standard commission when you close

**Current Platform Stats:**
- 2,355+ retirement villages listed
- Growing user base planning retirement transitions
- Active users researching villages and home values
- National coverage across Australia

**Featured Agent Requirements:**
- Experience with downsizing clients and seniors
- Knowledge of local retirement village market
- Commitment to client care and ethical service
- Available to take referrals in your service area

**Interested?**
Reply to this email or call me at 0422 208 230 to get set up as a Featured Agent on RetirePath.

Let's help more Australian retirees transition smoothly to their next chapter.

Best regards,

Drew Smith
RetirePath
📧 drew@retirepath.com.au
📱 0422 208 230
🌐 www.retirepath.com.au`,
    variables: [
      { key: 'AGENT_NAME', label: 'Agent Name', placeholder: 'Sarah Johnson' },
    ],
    category: 'agent',
  },
  {
    id: 'agent-followup',
    name: 'Follow-Up to Agents',
    subject: 'Re: RetirePath Agent Partnership - Quick Question',
    body: `Hi [AGENT_NAME],

I wanted to quickly follow up on my email about the RetirePath Agent Partner Program.

**In Short:**
We send qualified downsizing leads (retirees selling family homes) to trusted local agents at no cost to you.

**Quick Question:**
Are you currently taking on downsizing clients in [SUBURB]/[AREA]?

If yes, I'd love to add you as a Featured Agent on RetirePath so we can start sending leads your way.

It takes just 5 minutes to set up - reply with:
- Your service areas
- Your specialty (downsizing, seniors, family homes, etc.)
- Preferred contact method for leads

Looking forward to partnering with you.

Best regards,

Drew Smith
RetirePath
📧 drew@retirepath.com.au
📱 0422 208 230`,
    variables: [
      { key: 'AGENT_NAME', label: 'Agent Name', placeholder: 'Sarah Johnson' },
      { key: 'SUBURB', label: 'Suburb', placeholder: 'Parramatta' },
      { key: 'AREA', label: 'Area', placeholder: 'Western Sydney' },
    ],
    category: 'follow-up',
  },
  {
    id: 'agent-specialist',
    name: 'Specialists in Downsizing/Seniors',
    subject: 'RetirePath Sees You Specialize in Downsizing - Let\'s Partner',
    body: `Dear [AGENT_NAME],

I came across your profile and noticed you specialize in helping seniors and retirees downsize - exactly the demographic RetirePath serves!

**About RetirePath:**
We're Australia's leading retirement village platform, helping retirees find villages, analyze contracts, value their homes, and plan their transition. Thousands of retirees use RetirePath each month - and many need trusted agents to sell their family homes.

**Perfect Fit:**
Your expertise in [SPECIALIZATION] makes you an ideal partner for RetirePath's Featured Agent Program.

**What We Offer:**
✅ Exclusive leads: Retirees in [AREA] ready to sell
✅ Pre-qualified prospects: They've already planned their next move
✅ Zero cost: No fees unless you close the sale
✅ Featured profile: Showcase your experience on our platform

**This Week's Leads:**
We currently have users in [SUBURB]/[AREA] using our Home Valuation tool who'll soon need agent services. I'd love to connect them with you.

**Quick Setup:**
Reply with your service areas and I'll get you listed as a Featured Agent today.

Or call me directly: 0422 208 230

Let's work together to help more retirees transition smoothly.

Best regards,

Drew Smith
RetirePath
📧 drew@retirepath.com.au
📱 0422 208 230
🌐 www.retirepath.com.au`,
    variables: [
      { key: 'AGENT_NAME', label: 'Agent Name', placeholder: 'Sarah Johnson' },
      { key: 'SPECIALIZATION', label: 'Specialization', placeholder: 'downsizing and seniors\' property' },
      { key: 'AREA', label: 'Area', placeholder: 'Western Sydney' },
      { key: 'SUBURB', label: 'Suburb', placeholder: 'Parramatta' },
    ],
    category: 'agent',
  },
];

export function EmailTemplates() {
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [copiedSubject, setCopiedSubject] = useState(false);
  const [copiedBody, setCopiedBody] = useState(false);

  const handleTemplateSelect = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    // Initialize variables with empty strings
    const initialVars: Record<string, string> = {};
    template.variables.forEach(v => {
      initialVars[v.key] = '';
    });
    setVariables(initialVars);
    setCopiedSubject(false);
    setCopiedBody(false);
  };

  const replaceVariables = (text: string) => {
    let result = text;
    if (selectedTemplate) {
      selectedTemplate.variables.forEach(v => {
        const value = variables[v.key] || `[${v.key}]`;
        result = result.replace(new RegExp(`\\[${v.key}\\]`, 'g'), value);
      });
    }
    return result;
  };

  const copyToClipboard = async (text: string, type: 'subject' | 'body') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'subject') {
        setCopiedSubject(true);
        setTimeout(() => setCopiedSubject(false), 2000);
      } else {
        setCopiedBody(true);
        setTimeout(() => setCopiedBody(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const operatorTemplates = EMAIL_TEMPLATES.filter(t => t.category === 'operator');
  const agentTemplates = EMAIL_TEMPLATES.filter(t => t.category === 'agent');
  const followUpTemplates = EMAIL_TEMPLATES.filter(t => t.category === 'follow-up');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2">Email Templates</h2>
        <p className="text-muted-foreground">
          Professional email templates for operator and agent outreach campaigns.
        </p>
      </div>

      <Tabs defaultValue="operators" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="operators">
            <Building2 className="size-4 mr-2" />
            Operators ({operatorTemplates.length})
          </TabsTrigger>
          <TabsTrigger value="agents">
            <Home className="size-4 mr-2" />
            Agents ({agentTemplates.length})
          </TabsTrigger>
          <TabsTrigger value="follow-ups">
            <Mail className="size-4 mr-2" />
            Follow-Ups ({followUpTemplates.length})
          </TabsTrigger>
        </TabsList>

        {/* Operator Templates */}
        <TabsContent value="operators" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {operatorTemplates.map(template => (
              <Card
                key={template.id}
                className={`p-4 cursor-pointer transition-all ${
                  selectedTemplate?.id === template.id
                    ? 'border-green-500 border-2 bg-green-50'
                    : 'hover:border-green-300'
                }`}
                onClick={() => handleTemplateSelect(template)}
              >
                <h3 className="mb-2">{template.name}</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {template.variables.length} variables to customize
                </p>
                <p className="text-sm">
                  <strong>Subject:</strong> {template.subject}
                </p>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Agent Templates */}
        <TabsContent value="agents" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {agentTemplates.map(template => (
              <Card
                key={template.id}
                className={`p-4 cursor-pointer transition-all ${
                  selectedTemplate?.id === template.id
                    ? 'border-green-500 border-2 bg-green-50'
                    : 'hover:border-green-300'
                }`}
                onClick={() => handleTemplateSelect(template)}
              >
                <h3 className="mb-2">{template.name}</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {template.variables.length} variables to customize
                </p>
                <p className="text-sm">
                  <strong>Subject:</strong> {template.subject}
                </p>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Follow-Up Templates */}
        <TabsContent value="follow-ups" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {followUpTemplates.map(template => (
              <Card
                key={template.id}
                className={`p-4 cursor-pointer transition-all ${
                  selectedTemplate?.id === template.id
                    ? 'border-green-500 border-2 bg-green-50'
                    : 'hover:border-green-300'
                }`}
                onClick={() => handleTemplateSelect(template)}
              >
                <h3 className="mb-2">{template.name}</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {template.variables.length} variables to customize
                </p>
                <p className="text-sm">
                  <strong>Subject:</strong> {template.subject}
                </p>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Template Preview and Customization */}
      {selectedTemplate && (
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-green-50">
          <h3 className="mb-4">Customize Template: {selectedTemplate.name}</h3>

          {/* Variable Inputs */}
          {selectedTemplate.variables.length > 0 && (
            <div className="mb-6 p-4 bg-white rounded-lg border">
              <h4 className="mb-3">Fill in Variables</h4>
              <div className="grid md:grid-cols-2 gap-4">
                {selectedTemplate.variables.map(variable => (
                  <div key={variable.key}>
                    <Label htmlFor={variable.key}>{variable.label}</Label>
                    <Input
                      id={variable.key}
                      value={variables[variable.key] || ''}
                      onChange={(e) =>
                        setVariables({ ...variables, [variable.key]: e.target.value })
                      }
                      placeholder={variable.placeholder}
                      className="mt-2"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Subject Line */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <Label>Email Subject</Label>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(replaceVariables(selectedTemplate.subject), 'subject')}
              >
                {copiedSubject ? (
                  <>
                    <CheckCircle className="size-4 mr-2 text-green-600" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="size-4 mr-2" />
                    Copy Subject
                  </>
                )}
              </Button>
            </div>
            <Input
              value={replaceVariables(selectedTemplate.subject)}
              readOnly
              className="bg-white"
            />
          </div>

          {/* Email Body */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Email Body</Label>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(replaceVariables(selectedTemplate.body), 'body')}
              >
                {copiedBody ? (
                  <>
                    <CheckCircle className="size-4 mr-2 text-green-600" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="size-4 mr-2" />
                    Copy Body
                  </>
                )}
              </Button>
            </div>
            <Textarea
              value={replaceVariables(selectedTemplate.body)}
              readOnly
              className="min-h-[500px] font-mono text-sm bg-white"
            />
          </div>

          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm">
              <strong>💡 Pro Tip:</strong> Fill in the variables above, then click "Copy Subject" and "Copy Body" 
              to paste directly into your email client (Outlook, Gmail, etc.). Any unfilled variables will show as [VARIABLE_NAME] 
              so you can fill them in manually later.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
