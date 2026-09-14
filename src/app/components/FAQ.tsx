import { Card } from './ui/card';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from './ui/accordion';
import { HelpCircle, DollarSign, FileCheck, Home, Shield, Users, Clock } from 'lucide-react';

export function FAQ() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-3">
        <HelpCircle className="size-16 mx-auto text-blue-600" />
        <h1 className="text-4xl font-bold">Frequently Asked Questions</h1>
        <p className="text-lg text-muted-foreground">
          Common questions about RetirePath, our tools, and retirement villages
        </p>
      </div>

      {/* About RetirePath */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="size-6 text-blue-600" />
          <h2 className="text-2xl font-bold">About RetirePath</h2>
        </div>
        
        <Accordion type="single" collapsible className="space-y-2">
          <AccordionItem value="what-is-retirepath">
            <AccordionTrigger className="text-left">
              What is RetirePath?
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              RetirePath is a comprehensive software platform that helps Australian retirees research, compare, and transition to retirement villages. 
              We provide intelligent tools for contract analysis, home valuation, village matching, and planning your entire retirement village journey. 
              We're completely independent and not affiliated with any retirement village operators or real estate agencies.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="how-much">
            <AccordionTrigger className="text-left">
              How much does RetirePath cost?
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              <p className="mb-3">RetirePath offers three membership tiers:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Free:</strong> Access to educational resources, retirement guides, and our Home Value Estimator Tool</li>
                <li><strong>Essential ($29/month):</strong> All free features plus Contract Analyzer Tool, Village Finder Tool, and Progress Tracker (1, 3, or 6-month plans available)</li>
                <li><strong>Premium ($49/month):</strong> All Essential features plus AI-powered contract analysis, priority support, and advanced comparison tools (1, 3, or 6-month plans available)</li>
              </ul>
              <p className="mt-3">All plans are one-time payments with no auto-renewal. We also offer a 7-day money-back guarantee if you're not satisfied.</p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="auto-renewal">
            <AccordionTrigger className="text-left">
              Will my subscription automatically renew?
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              No! RetirePath subscriptions are one-time payments and do not automatically renew. When your subscription period ends (1, 3, or 6 months), 
              your access to premium features will expire, but you'll never be charged again unless you choose to purchase a new subscription. 
              This gives you complete control over your spending.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="refund-policy">
            <AccordionTrigger className="text-left">
              What is your refund policy?
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              We offer a 7-day money-back guarantee on all memberships. If you're not satisfied within 7 days of purchase, simply email 
              support@retirepath.com.au with "Refund Request" in the subject line, and we'll process a full refund—no questions asked. 
              Refunds are returned to your original payment method within 5-10 business days.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="is-retirepath-affiliated">
            <AccordionTrigger className="text-left">
              Are you affiliated with retirement village operators?
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              No. RetirePath is completely independent. We are not affiliated with any retirement village operators, aged care providers, 
              or real estate agencies. We don't receive commissions or referral fees when you choose a village. Our only goal is to provide 
              accurate information and helpful tools to assist your decision-making process.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="data-accuracy">
            <AccordionTrigger className="text-left">
              How accurate is your village data?
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              We take data accuracy extremely seriously. Our directory includes nearly 2,000 retirement villages that have been verified through 
              official operator websites, direct contact with village management, and industry associations. We prioritize quality over quantity. 
              If you notice incorrect information, please report it to support@retirepath.com.au and we'll investigate and correct it within 2-3 business days.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Contract Analyzer Tool */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <FileCheck className="size-6 text-green-600" />
          <h2 className="text-2xl font-bold">Contract Analyzer Tool</h2>
        </div>
        
        <Accordion type="single" collapsible className="space-y-2">
          <AccordionItem value="contract-analyzer-what">
            <AccordionTrigger className="text-left">
              What does the Contract Analyzer Tool do?
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              The Contract Analyzer Tool helps you understand and compare key terms from retirement village contracts. You can input details like 
              entry costs, exit fees, Deferred Management Fees (DMF), ongoing costs, and capital gains arrangements. The tool calculates total costs, 
              compares multiple contracts side-by-side, and highlights potential concerns. However, <strong>this is NOT legal advice</strong>—always 
              consult a solicitor experienced in retirement village law before signing any contract.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="contract-analyzer-accuracy">
            <AccordionTrigger className="text-left">
              How accurate is the Contract Analyzer?
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              The Contract Analyzer's accuracy depends entirely on the accuracy of the information you input. It performs mathematical calculations 
              based on your data and highlights areas that commonly cause issues in retirement village contracts. However, it cannot interpret complex 
              legal language, understand contract nuances, or predict future market conditions. <strong>This tool is NOT a substitute for professional 
              legal advice.</strong> Use it to prepare better questions for your solicitor.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="contract-analyzer-legal-advice">
            <AccordionTrigger className="text-left">
              Does the Contract Analyzer provide legal advice?
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              <strong>No.</strong> The Contract Analyzer Tool does NOT provide legal advice. It's an informational tool that helps you organize contract 
              details and perform calculations. We are not lawyers, and nothing produced by this tool should be considered legal advice. You must consult 
              a qualified solicitor experienced in retirement village law before making any contract decisions. Our tool is designed to help you understand 
              what questions to ask your lawyer, not to replace professional legal advice.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="contract-upload">
            <AccordionTrigger className="text-left">
              Can I upload my contract PDF for automatic analysis?
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              Premium members can upload contract PDFs, and our AI will attempt to extract key information automatically. However, this feature is 
              experimental and may miss important details or misinterpret complex clauses. <strong>You must review all extracted information carefully 
              and verify it against your actual contract.</strong> Never rely solely on automated extraction—always read your full contract thoroughly 
              and consult a solicitor.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Home Value Estimator */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Home className="size-6 text-orange-600" />
          <h2 className="text-2xl font-bold">Home Value Estimator Tool</h2>
        </div>
        
        <Accordion type="single" collapsible className="space-y-2">
          <AccordionItem value="home-estimator-what">
            <AccordionTrigger className="text-left">
              What is the Home Value Estimator Tool?
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              The Home Value Estimator provides an automated estimate of your property's value based on location, property features, and regional market data. 
              It also calculates potential selling proceeds after agent fees and costs. <strong>This is NOT a professional property valuation</strong>—it's 
              an algorithmic estimate to help you plan. Always get a proper appraisal from a licensed real estate agent or valuer before making selling decisions.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="home-estimator-accuracy">
            <AccordionTrigger className="text-left">
              How accurate is the Home Value Estimator?
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              The Home Value Estimator's accuracy varies significantly depending on location, property type, and market conditions. It may be off by 
              10-30% or more in some cases. The estimate is generated by AI using general market data and property characteristics—it cannot account for 
              unique features, renovations, property condition, or local market nuances. <strong>Do not make selling decisions based on this estimate alone.</strong> 
              Get a professional appraisal from a licensed real estate agent who can physically inspect your property.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="home-estimator-free">
            <AccordionTrigger className="text-left">
              Is the Home Value Estimator free to use?
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              Yes! The Home Value Estimator Tool is available to all users, including free members. You don't need a paid subscription to use this tool. 
              However, premium members get access to more detailed breakdowns and additional features.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Village Finder */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Users className="size-6 text-purple-600" />
          <h2 className="text-2xl font-bold">Village Finder Tool</h2>
        </div>
        
        <Accordion type="single" collapsible className="space-y-2">
          <AccordionItem value="village-finder-what">
            <AccordionTrigger className="text-left">
              How does the Village Finder Tool work?
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              The Village Finder Tool asks about your preferences (location, budget, care needs, lifestyle amenities) and matches you with suitable 
              retirement villages from our database of nearly 2,000 verified villages. It considers factors like proximity to family, healthcare facilities, 
              care level requirements, and desired amenities. The tool provides personalized recommendations, but you should always visit villages in person 
              and conduct your own research before making any decisions.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="how-many-villages">
            <AccordionTrigger className="text-left">
              How many villages are in your database?
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              RetirePath's database includes nearly 2,000 retirement villages across Australia that have been verified for accuracy. We prioritize 
              quality over quantity—every village listing has been checked for correct contact information, amenities, and facility details. If you can't 
              find a specific village, you can notify us or the village operator can submit their information through our "List Your Village" form.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="missing-village">
            <AccordionTrigger className="text-left">
              What if the village I'm interested in isn't listed?
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              While we've verified nearly 2,000 villages, some may not yet be in our database. If you can't find a village you're interested in, 
              please email support@retirepath.com.au with the village name and location. We'll investigate and add it to our database (typically within 
              5-7 business days). Alternatively, village operators can submit their information directly through our "List Your Village" form.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Retirement Villages General */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Clock className="size-6 text-teal-600" />
          <h2 className="text-2xl font-bold">Retirement Villages (General)</h2>
        </div>
        
        <Accordion type="single" collapsible className="space-y-2">
          <AccordionItem value="retirement-vs-aged-care">
            <AccordionTrigger className="text-left">
              What's the difference between a retirement village and aged care?
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              <strong>Retirement villages</strong> are for independent living with optional support services. You typically own or have rights to your unit, 
              maintain your independence, and can access services as needed (meals, cleaning, social activities). <strong>Aged care facilities</strong> 
              (nursing homes) provide 24/7 care for people who need daily assistance with personal care, medication, or medical needs. Many people transition 
              from a retirement village to aged care when their health needs increase significantly.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="can-i-get-money-back">
            <AccordionTrigger className="text-left">
              Can I get my money back if I leave a retirement village?
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              It depends on your contract type. In most cases, you receive back your entry payment (also called "ingoing contribution" or "entry fee") 
              minus the Deferred Management Fee (DMF) and any other agreed fees or charges. The DMF typically increases the longer you stay, up to a maximum 
              cap (often 25-30% of the entry payment). Some contracts also deduct capital losses or share capital gains. <strong>Your specific contract 
              determines what you get back—this is why having a solicitor review your contract is essential.</strong>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="how-long-to-sell">
            <AccordionTrigger className="text-left">
              How long does it take to sell my unit when I want to leave?
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              This varies significantly. Some villages have waiting lists and units sell quickly (within weeks or a few months). Others can take 12+ months, 
              especially in regional areas or during market downturns. Your contract should specify who is responsible for marketing the unit (the village 
              or you), what happens if the unit doesn't sell quickly, and whether you continue paying fees until it sells. <strong>This is a critical contract 
              term to review with your solicitor.</strong>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="pension-impact">
            <AccordionTrigger className="text-left">
              Will living in a retirement village affect my Age Pension?
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              It can. Your entry payment may be treated as an asset by Centrelink, potentially reducing your Age Pension entitlement. The impact depends on 
              the contract type, entry payment amount, and your other assets. Some contracts are more Centrelink-friendly than others. <strong>You must consult 
              a financial advisor familiar with Centrelink rules</strong> to understand the specific impact on your Age Pension before committing to a retirement 
              village. RetirePath cannot provide financial advice on pension implications.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="what-is-dmf">
            <AccordionTrigger className="text-left">
              What is a Deferred Management Fee (DMF)?
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              The Deferred Management Fee (DMF), also called a "departure fee" or "deferred fee," is a fee charged when you leave a retirement village. 
              It's typically calculated as a percentage of your entry payment or the resale price, and increases the longer you stay (e.g., 3% per year up 
              to a maximum of 30%). The DMF compensates the village operator for providing facilities, services, and maintaining the village. <strong>DMF 
              structures vary significantly between villages and can dramatically affect how much money you get back—always compare DMF terms when evaluating villages.</strong>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Technical & Security */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="size-6 text-red-600" />
          <h2 className="text-2xl font-bold">Privacy & Security</h2>
        </div>
        
        <Accordion type="single" collapsible className="space-y-2">
          <AccordionItem value="data-security">
            <AccordionTrigger className="text-left">
              Is my personal information secure?
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              Yes. RetirePath uses industry-standard security measures including encrypted data storage (via Supabase), secure payment processing (via Stripe), 
              and HTTPS encryption for all data transmission. We never store your credit card details—all payment information is handled securely by Stripe. 
              However, no online system is 100% secure. Please review our Privacy Policy for full details on how we collect, use, and protect your information.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="data-sharing">
            <AccordionTrigger className="text-left">
              Do you sell or share my data?
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              <strong>No, we do not sell your personal information.</strong> We may share information with service providers who help operate our platform 
              (payment processing, data hosting, etc.), but only as necessary to provide our services. We do not share your data with retirement village 
              operators, marketing companies, or third parties for advertising purposes. See our Privacy Policy for complete details on information sharing.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="delete-account">
            <AccordionTrigger className="text-left">
              Can I delete my account and data?
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              Yes. You have the right to request deletion of your account and personal information. Email support@retirepath.com.au with "Delete My Account" 
              in the subject line, and we'll process your request within 5 business days. Note that we may retain some information as required by law 
              (e.g., transaction records for tax purposes). For privacy-related requests, you can also email privacy@retirepath.com.au.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Support */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <DollarSign className="size-6 text-blue-600" />
          <h2 className="text-2xl font-bold">Support & Help</h2>
        </div>
        
        <Accordion type="single" collapsible className="space-y-2">
          <AccordionItem value="how-to-contact">
            <AccordionTrigger className="text-left">
              How do I contact support?
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              You can contact our support team at <strong>support@retirepath.com.au</strong>. We aim to respond within 1-2 business days 
              (Premium members receive priority support with faster response times). For general inquiries, you can also email info@retirepath.com.au. 
              For urgent issues affecting your paid subscription, please include "URGENT" in the subject line.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="technical-issues">
            <AccordionTrigger className="text-left">
              What if I'm having technical issues?
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              If you encounter technical problems (login issues, payment errors, tools not working), please email support@retirepath.com.au with a 
              detailed description of the issue including:
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>What you were trying to do</li>
                <li>What happened (error messages, unexpected behavior)</li>
                <li>Which browser and device you're using</li>
                <li>Screenshots (if possible)</li>
              </ul>
              <p className="mt-2">We'll investigate and help resolve the issue as quickly as possible.</p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="report-incorrect-data">
            <AccordionTrigger className="text-left">
              How do I report incorrect village information?
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              If you notice incorrect or outdated information about a retirement village in our directory, please email support@retirepath.com.au with:
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>The name and location of the village</li>
                <li>Which information is incorrect</li>
                <li>The correct information (if you know it)</li>
                <li>Source of the correct information (if available)</li>
              </ul>
              <p className="mt-2">We investigate all reports and typically update our database within 2-3 business days.</p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Still Have Questions */}
      <Card className="p-8 text-center bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
        <h3 className="text-xl font-bold mb-3">Still Have Questions?</h3>
        <p className="text-muted-foreground mb-6">
          Can't find the answer you're looking for? We're here to help!
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a 
            href="mailto:support@retirepath.com.au" 
            className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Email Support
          </a>
          <a 
            href="#about" 
            className="inline-flex items-center justify-center px-6 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
          >
            Learn More About Us
          </a>
        </div>
      </Card>
    </div>
  );
}
