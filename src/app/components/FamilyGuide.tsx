import { Card } from './ui/card';
import { Users, Heart, MessageCircle } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

export function FamilyGuide() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="mb-2">Guide for Family Members</h2>
        <p className="text-muted-foreground">
          A comprehensive guide to help your children and family understand your retirement village decision
        </p>
      </div>

      <Alert>
        <MessageCircle className="size-4" />
        <AlertDescription>
          <strong>For Families:</strong> This page explains what your parent/family member is considering, 
          what it means financially, and how you can support them through this important life transition.
        </AlertDescription>
      </Alert>

      {/* Understanding Retirement Villages */}
      <Card className="p-6">
        <h3 className="mb-4">What is a Retirement Village?</h3>
        <div className="space-y-4 text-sm">
          <p>
            A retirement village is a residential community designed for people aged 55+. It's NOT aged care - 
            residents live independently in their own home but with added support, amenities, and social opportunities.
          </p>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="mb-2">What It Is:</h4>
              <ul className="space-y-1 text-muted-foreground list-disc list-inside">
                <li>Independent living in a private unit</li>
                <li>Community of similar-aged people</li>
                <li>Shared amenities (pool, gym, gardens)</li>
                <li>Social activities and events</li>
                <li>Emergency call system</li>
                <li>Often on-site manager</li>
              </ul>
            </div>
            
            <div className="p-4 bg-amber-50 rounded-lg">
              <h4 className="mb-2">What It's Not:</h4>
              <ul className="space-y-1 text-muted-foreground list-disc list-inside">
                <li>Not aged care or nursing home</li>
                <li>Not 24/7 medical supervision</li>
                <li>Not giving up independence</li>
                <li>Not "being put in a home"</li>
                <li>Not a sign of declining ability</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>

      {/* Financial Explanation */}
      <Card className="p-6">
        <h3 className="mb-4">Understanding the Financial Model</h3>
        <p className="text-sm text-muted-foreground mb-4">
          This is often confusing for families. Here's how retirement village finances typically work:
        </p>
        
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="mb-2">The Entry Payment</h4>
            <p className="text-sm text-muted-foreground mb-2">
              Your parent pays an "entry price" (often $300k-$800k) to move in. This is NOT purchasing the property 
              in most cases - it's more like a long-term license to live there.
            </p>
            <p className="text-sm">
              <strong>Think of it like:</strong> A refundable deposit that they get back (minus fees) when they leave.
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="mb-2">Monthly Service Fees</h4>
            <p className="text-sm text-muted-foreground mb-2">
              Typically $400-$800/month covers maintenance, amenities, insurance, and village management. 
              Similar to body corporate fees.
            </p>
            <p className="text-sm">
              <strong>This money:</strong> Is not refundable - it's for ongoing services, like paying rent for amenities and support.
            </p>
          </div>

          <div className="p-4 bg-amber-50 rounded-lg">
            <h4 className="mb-2">Deferred Management Fee (DMF) - The Confusing Part</h4>
            <p className="text-sm text-muted-foreground mb-2">
              This is the village operator's profit. It's usually a percentage of the entry price that builds up over time. 
              For example: 5% per year, capped at 30% after 6 years.
            </p>
            <p className="text-sm mb-2">
              <strong>Example:</strong> Entry price $500,000. After 6 years, DMF = $150,000. Your parent's refund = $350,000.
            </p>
            <p className="text-sm">
              <strong>Important:</strong> This isn't lost money - your parent got housing, community, and peace of mind for those 6 years.
            </p>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="mb-2">What Happens When They Leave (or Pass Away)</h4>
            <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
              <li>The village markets the unit to a new resident</li>
              <li>Once sold (typically 6-18 months), the DMF is deducted</li>
              <li>The remaining amount is refunded to your parent (or their estate)</li>
              <li>If there's capital gain, it might be shared (check the contract)</li>
            </ol>
          </div>
        </div>
      </Card>

      {/* Different Models */}
      <Card className="p-6">
        <h3 className="mb-4">Different Ownership Models Explained</h3>
        <div className="space-y-3">
          <div className="p-4 border-l-4 border-blue-500 bg-blue-50">
            <h4 className="mb-2">Loan/License (Most Common - 80%)</h4>
            <p className="text-sm text-muted-foreground mb-2">
              Your parent has a right to occupy, not ownership. They get a refund when they leave minus the DMF.
            </p>
            <p className="text-sm"><strong>For inheritance:</strong> You'll receive the refund minus DMF and exit fees. Amount depends on how long they stayed.</p>
          </div>

          <div className="p-4 border-l-4 border-green-500 bg-green-50">
            <h4 className="mb-2">Freehold/Strata Title (10%)</h4>
            <p className="text-sm text-muted-foreground mb-2">
              Your parent actually owns the property. No DMF.
            </p>
            <p className="text-sm"><strong>For inheritance:</strong> You inherit the full property value. Best for estate preservation.</p>
          </div>

          <div className="p-4 border-l-4 border-purple-500 bg-purple-50">
            <h4 className="mb-2">Leasehold (5%)</h4>
            <p className="text-sm text-muted-foreground mb-2">
              Your parent leases for a fixed term (often 99 years). Similar to loan/license.
            </p>
            <p className="text-sm"><strong>For inheritance:</strong> Refund minus DMF, similar to loan/license model.</p>
          </div>

          <div className="p-4 border-l-4 border-orange-500 bg-orange-50">
            <h4 className="mb-2">Rental (5%)</h4>
            <p className="text-sm text-muted-foreground mb-2">
              Your parent rents month-to-month. Low entry cost but no refund.
            </p>
            <p className="text-sm"><strong>For inheritance:</strong> Nothing returned. But they preserved their capital during their lifetime.</p>
          </div>
        </div>
      </Card>

      {/* What This Means for You */}
      <Card className="p-6 bg-purple-50 border-purple-200">
        <h3 className="mb-4">What This Means for Your Inheritance</h3>
        <div className="space-y-4 text-sm">
          <Alert>
            <Heart className="size-4" />
            <AlertDescription>
              <strong>Important Context:</strong> Many adult children worry about their inheritance. 
              Remember: this is your parent's money to use for their quality of life. A retirement village 
              might be the best thing for their happiness, health, and independence.
            </AlertDescription>
          </Alert>

          <div className="p-4 bg-white rounded-lg">
            <h4 className="mb-2">Be Realistic About Numbers:</h4>
            <ul className="space-y-2 text-muted-foreground list-disc list-inside">
              <li>If your parent stays 10 years, expect 20-40% of entry price to go to fees</li>
              <li>Monthly fees are never refunded - that's $50k-$100k over 10 years</li>
              <li>But compare this to: home maintenance, rates, insurance they'd pay anyway</li>
              <li>Factor in: their quality of life, safety, community, and your peace of mind</li>
            </ul>
          </div>

          <div className="p-4 bg-white rounded-lg">
            <h4 className="mb-2">Example Scenario:</h4>
            <div className="space-y-1 text-muted-foreground">
              <p>• Your parent's home sells for: $800,000</p>
              <p>• Retirement village entry: $600,000</p>
              <p>• Remaining capital: $200,000 (invested for income)</p>
              <p>• After 10 years in village:</p>
              <p className="ml-4">- DMF paid: $180,000 (30% of $600k)</p>
              <p className="ml-4">- Monthly fees paid: $72,000 ($600/month)</p>
              <p className="ml-4">- Refund received: $420,000</p>
              <p className="ml-4">- Plus remaining capital: $200,000</p>
              <p><strong>• Total to estate: ~$620,000</strong></p>
            </div>
            <p className="mt-3 text-sm">
              Yes, $180k went to fees. But your parent had a great 10 years in a supportive community. That's priceless.
            </p>
          </div>
        </div>
      </Card>

      {/* How to Support Them */}
      <Card className="p-6">
        <h3 className="mb-4">How You Can Support Your Parent</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h4 className="mb-3">Do's:</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>✅ Visit villages with them</li>
              <li>✅ Ask questions at tours</li>
              <li>✅ Help review contracts with their solicitor</li>
              <li>✅ Understand the financial model</li>
              <li>✅ Support their decision if it makes them happy</li>
              <li>✅ Help with the move and downsizing</li>
              <li>✅ Visit them regularly once they move</li>
              <li>✅ Get excited about their new chapter</li>
            </ul>
          </div>
          
          <div>
            <h4 className="mb-3">Don'ts:</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>❌ Make it about your inheritance</li>
              <li>❌ Treat it like they're giving up</li>
              <li>❌ Compare it to aged care</li>
              <li>❌ Rush them into a decision</li>
              <li>❌ Pressure them to stay in family home</li>
              <li>❌ Dismiss their concerns about maintaining a large home</li>
              <li>❌ Make them feel guilty about the costs</li>
              <li>❌ Ignore their desire for community and security</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Questions to Discuss */}
      <Card className="p-6">
        <h3 className="mb-4">Important Questions to Discuss Together</h3>
        <div className="space-y-4">
          <div>
            <h4 className="mb-2">About Their Needs:</h4>
            <ul className="space-y-1 text-sm text-muted-foreground list-disc list-inside">
              <li>What are you finding difficult about your current home?</li>
              <li>What activities and amenities are important to you?</li>
              <li>How important is being close to family?</li>
              <li>What are your health concerns for the future?</li>
              <li>Do you want to preserve capital or focus on lifestyle?</li>
            </ul>
          </div>

          <div>
            <h4 className="mb-2">About the Contract:</h4>
            <ul className="space-y-1 text-sm text-muted-foreground list-disc list-inside">
              <li>What type of tenure is it? (Freehold, loan/license, etc.)</li>
              <li>What's the DMF rate and cap?</li>
              <li>What's included in monthly fees?</li>
              <li>How are capital gains shared?</li>
              <li>What happens if you need to move to aged care?</li>
              <li>How long does it typically take to resell units?</li>
            </ul>
          </div>

          <div>
            <h4 className="mb-2">About Estate Planning:</h4>
            <ul className="space-y-1 text-sm text-muted-foreground list-disc list-inside">
              <li>Have you updated your will?</li>
              <li>Who has power of attorney?</li>
              <li>Have you discussed wishes with your solicitor?</li>
              <li>Do we understand the refund timeline?</li>
              <li>Who will manage the estate when the time comes?</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Red Flags for Families */}
      <Card className="p-6 bg-red-50 border-red-200">
        <h3 className="mb-4">Red Flags to Watch For</h3>
        <p className="text-sm text-muted-foreground mb-4">
          If you notice these issues, encourage your parent to seek additional legal advice or consider other villages:
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h4 className="mb-2 text-red-700">Financial Red Flags:</h4>
            <ul className="space-y-1 text-sm">
              <li>🚩 DMF over 40%</li>
              <li>🚩 0% capital gain sharing</li>
              <li>🚩 Unclear fee increase clauses</li>
              <li>🚩 Very high exit fees</li>
              <li>🚩 Entry price well above local market</li>
            </ul>
          </div>
          
          <div>
            <h4 className="mb-2 text-red-700">Process Red Flags:</h4>
            <ul className="space-y-1 text-sm">
              <li>🚩 Pressure to sign quickly</li>
              <li>🚩 Reluctance to answer questions</li>
              <li>🚩 No independent legal advice recommended</li>
              <li>🚩 Can't speak to current residents</li>
              <li>🚩 Vague contract terms</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Resources for Families */}
      <Card className="p-6">
        <h3 className="mb-4">How RetirePath Can Help Your Family</h3>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <MessageCircle className="size-5 text-blue-600 mt-0.5 shrink-0" />
            <div>
              <h4 className="mb-1">Family Discussion Topics</h4>
              <p className="text-sm text-muted-foreground">
                Use the guides throughout RetirePath to structure family conversations. The Village Guide 
                explains different ownership models, and the Contract Review tool shows real financial impacts.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Heart className="size-5 text-blue-600 mt-0.5 shrink-0" />
            <div>
              <h4 className="mb-1">Contract Review Together</h4>
              <p className="text-sm text-muted-foreground">
                Add multiple contracts to the Contract Review section and compare them side-by-side. 
                Download the comparison report to share with siblings and discuss as a family.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Users className="size-5 text-blue-600 mt-0.5 shrink-0" />
            <div>
              <h4 className="mb-1">Understanding Their Decision</h4>
              <p className="text-sm text-muted-foreground">
                Review the Retirement Guide section together to understand why retirement village living 
                may be the right choice. It covers safety, social connection, and maintaining independence.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Heart className="size-5 text-blue-600 mt-0.5 shrink-0" />
            <div>
              <h4 className="mb-1">Estate Planning Considerations</h4>
              <p className="text-sm text-muted-foreground">
                Use the Contract Review's inheritance calculator to understand the long-term financial 
                impact. Share these projections with your family's financial advisor or estate planner.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Final Message */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h3 className="mb-3">A Final Note for Families</h3>
        <p className="text-sm text-muted-foreground mb-3">
          Your parent moving to a retirement village is often one of the best decisions they can make for their 
          later years. Yes, there are costs involved, and yes, it might affect your inheritance. But consider:
        </p>
        <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside mb-3">
          <li>They'll be safer with emergency call systems</li>
          <li>They'll be happier with an active social life</li>
          <li>They'll be healthier with access to activities and support</li>
          <li>You'll have peace of mind knowing they're in a community</li>
          <li>They'll maintain independence far longer than in a large, lonely house</li>
        </ul>
        <p className="text-sm">
          <strong>Remember:</strong> The goal isn't to maximize inheritance - it's to maximize their quality of life 
          in their retirement years. Support them in making the choice that's right for them.
        </p>
      </Card>
    </div>
  );
}