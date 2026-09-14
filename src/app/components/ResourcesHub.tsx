import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Printer, X, FileText, Calendar, Scale, Share2, TrendingUp, CheckSquare } from 'lucide-react';
import { SocialMediaDocument } from './resource-docs/SocialMediaDoc';
import { SEOGuideDocument } from './resource-docs/SEOGuideDoc';
import { SEOChecklistDocument } from './resource-docs/SEOChecklistDoc';
import { SEOPromptsDocument } from './resource-docs/SEOPromptsDoc';

type DocumentType = 
  | 'launch-schedule'
  | 'legal-checklist'
  | 'social-media'
  | 'seo-guide'
  | 'seo-checklist'
  | 'seo-prompts';

interface ResourcesHubProps {
  onClose?: () => void;
  initialDocument?: DocumentType;
}

export function ResourcesHub({ onClose, initialDocument }: ResourcesHubProps) {
  const [activeDocument, setActiveDocument] = useState<DocumentType | null>(initialDocument || null);

  const handlePrint = () => {
    window.print();
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      // If no onClose handler, go back in browser history
      window.history.back();
    }
  };

  const documents = [
    {
      id: 'launch-schedule' as DocumentType,
      title: 'Launch Schedule & To-Do List',
      description: 'Comprehensive action plan for launching RetirePath',
      icon: Calendar,
      color: 'blue',
    },
    {
      id: 'legal-checklist' as DocumentType,
      title: 'Legal Checklist Before Launch',
      description: 'Essential legal compliance requirements',
      icon: Scale,
      color: 'red',
    },
    {
      id: 'social-media' as DocumentType,
      title: 'Social Media Strategy',
      description: 'Platform setup and content strategy',
      icon: Share2,
      color: 'purple',
    },
    {
      id: 'seo-guide' as DocumentType,
      title: 'SEO Strategy Guide',
      description: 'Long-term SEO vs. paid advertising comparison',
      icon: TrendingUp,
      color: 'green',
    },
    {
      id: 'seo-checklist' as DocumentType,
      title: 'SEO Quick Start Checklist',
      description: 'Actionable SEO tasks to implement today',
      icon: CheckSquare,
      color: 'orange',
    },
    {
      id: 'seo-prompts' as DocumentType,
      title: 'SEO ChatGPT Prompts',
      description: 'AI prompts for content creation',
      icon: FileText,
      color: 'indigo',
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 overflow-y-auto">
      <div className="min-h-screen p-4 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full my-8">
          {/* Header - Hidden when printing */}
          <div className="flex justify-between items-center p-6 border-b print:hidden">
            <div>
              <h2 className="text-2xl font-bold">RetirePath Resources Hub</h2>
              <p className="text-gray-600 text-sm mt-1">Strategic documents and guides</p>
            </div>
            <div className="flex gap-2">
              {activeDocument && (
                <>
                  <Button onClick={handlePrint} variant="default">
                    <Printer className="size-4 mr-2" />
                    Print
                  </Button>
                  <Button onClick={() => setActiveDocument(null)} variant="outline">
                    Back to List
                  </Button>
                </>
              )}
              {/* Always show close button */}
              <Button onClick={handleClose} variant="outline" size="icon">
                <X className="size-4" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 print:p-0" id="printable-resource">
            {!activeDocument ? (
              // Document Grid
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {documents.map((doc) => {
                  const Icon = doc.icon;
                  return (
                    <Card
                      key={doc.id}
                      className="p-6 cursor-pointer hover:shadow-lg transition-shadow border-l-4"
                      style={{ borderLeftColor: `var(--${doc.color}-500)` }}
                      onClick={() => setActiveDocument(doc.id)}
                    >
                      <div className={`inline-flex p-3 rounded-lg bg-${doc.color}-100 mb-4`}>
                        <Icon className={`size-6 text-${doc.color}-600`} />
                      </div>
                      <h3 className="font-semibold text-lg mb-2">{doc.title}</h3>
                      <p className="text-sm text-gray-600">{doc.description}</p>
                      <div className="mt-4">
                        <Button variant="outline" size="sm" className="w-full">
                          View Document
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              // Document Content
              <>
                {activeDocument === 'launch-schedule' && <LaunchScheduleDocument />}
                {activeDocument === 'legal-checklist' && <LegalChecklistDocument />}
                {activeDocument === 'social-media' && <SocialMediaDocument />}
                {activeDocument === 'seo-guide' && <SEOGuideDocument />}
                {activeDocument === 'seo-checklist' && <SEOChecklistDocument />}
                {activeDocument === 'seo-prompts' && <SEOPromptsDocument />}
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-resource, #printable-resource * {
            visibility: visible;
          }
          #printable-resource {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 1cm;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:p-0 {
            padding: 0;
          }
          .print\\:break-before-page {
            break-before: page;
            page-break-before: always;
          }
        }
      `}</style>
    </div>
  );
}

// Launch Schedule Document Component
function LaunchScheduleDocument() {
  return (
    <div className="prose max-w-none">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">RetirePath</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Launch Schedule & To-Do List</h2>
        <p className="text-lg text-gray-600">Comprehensive Action Plan</p>
        <p className="text-sm text-gray-500 mt-2">Created: January 17, 2026</p>
      </div>

      <hr className="my-8" />

      {/* Timeline Overview */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4 text-blue-600">Launch Timeline</h2>
        
        <div className="bg-blue-50 border-l-4 border-blue-600 p-4 mb-6">
          <p className="font-semibold text-blue-900">Target Launch: Mid-February 2026 (4 weeks from now)</p>
          <p className="text-sm text-blue-800 mt-1">Soft launch with MVP features, iterate based on user feedback</p>
        </div>

        <div className="space-y-4">
          <div className="border-l-4 border-green-500 pl-4">
            <h3 className="font-bold text-lg">Week 1: Foundation & Legal (Jan 20-26)</h3>
            <p className="text-sm text-gray-700">Business structure, insurance, legal compliance</p>
          </div>
          
          <div className="border-l-4 border-yellow-500 pl-4">
            <h3 className="font-bold text-lg">Week 2: Technical Setup (Jan 27 - Feb 2)</h3>
            <p className="text-sm text-gray-700">Domain, hosting, analytics, testing</p>
          </div>
          
          <div className="border-l-4 border-orange-500 pl-4">
            <h3 className="font-bold text-lg">Week 3: Content & Marketing (Feb 3-9)</h3>
            <p className="text-sm text-gray-700">Website content, SEO, social media setup</p>
          </div>
          
          <div className="border-l-4 border-red-500 pl-4">
            <h3 className="font-bold text-lg">Week 4: Pre-Launch (Feb 10-16)</h3>
            <p className="text-sm text-gray-700">Final testing, beta users, launch preparation</p>
          </div>
        </div>
      </section>

      {/* Week 1 Tasks */}
      <section className="mb-12 print:break-before-page">
        <h2 className="text-2xl font-bold mb-4 text-green-600">Week 1: Foundation & Legal</h2>
        
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-3">🏢 Business Structure & Registration</h3>
          <ul className="space-y-2 ml-6">
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">□</span>
              <div>
                <strong>Register business name "RetirePath"</strong>
                <p className="text-sm text-gray-600">Via ASIC Business Names Register (~$44 for 1 year)</p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">□</span>
              <div>
                <strong>Decide on business structure</strong>
                <p className="text-sm text-gray-600">Sole trader vs. Pty Ltd (consult accountant)</p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">□</span>
              <div>
                <strong>Get ABN (Australian Business Number)</strong>
                <p className="text-sm text-gray-600">Free via ABR website, instant approval</p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">□</span>
              <div>
                <strong>Register for GST if applicable</strong>
                <p className="text-sm text-gray-600">Required if turnover &gt; $75k</p>
              </div>
            </li>
          </ul>
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-3">🛡️ Insurance & Risk Management</h3>
          <ul className="space-y-2 ml-6">
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">□</span>
              <div>
                <strong>Get Professional Indemnity Insurance</strong>
                <p className="text-sm text-gray-600">$10M+ coverage for advice/recommendations (~$1,500-3,000/year)</p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">□</span>
              <div>
                <strong>Get Public Liability Insurance</strong>
                <p className="text-sm text-gray-600">$20M coverage (~$500-1,000/year)</p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">□</span>
              <div>
                <strong>Get Cyber Liability Insurance</strong>
                <p className="text-sm text-gray-600">Data breach protection (~$1,000-2,000/year)</p>
              </div>
            </li>
          </ul>
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-3">⚖️ Legal Documents & Compliance</h3>
          <ul className="space-y-2 ml-6">
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">□</span>
              <div>
                <strong>Create Privacy Policy (MANDATORY)</strong>
                <p className="text-sm text-gray-600">Must comply with Australian Privacy Act</p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">□</span>
              <div>
                <strong>Create Terms of Service</strong>
                <p className="text-sm text-gray-600">User agreement, liability limitations</p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">□</span>
              <div>
                <strong>Create Disclaimer Page</strong>
                <p className="text-sm text-gray-600">"Not financial/legal advice" disclaimers</p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">□</span>
              <div>
                <strong>Consult lawyer for final review</strong>
                <p className="text-sm text-gray-600">1-2 hour consultation (~$300-600)</p>
              </div>
            </li>
          </ul>
        </div>
      </section>

      {/* Week 2 Tasks */}
      <section className="mb-12 print:break-before-page">
        <h2 className="text-2xl font-bold mb-4 text-yellow-600">Week 2: Technical Setup</h2>
        
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-3">🌐 Domain & Hosting</h3>
          <ul className="space-y-2 ml-6">
            <li className="flex items-start gap-2">
              <span className="text-yellow-600 mt-1">□</span>
              <div>
                <strong>Purchase domain: retirepath.com.au</strong>
                <p className="text-sm text-gray-600">Via VentraIP, Crazy Domains, or Netregistry (~$15/year)</p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-600 mt-1">□</span>
              <div>
                <strong>Set up DNS records</strong>
                <p className="text-sm text-gray-600">Point domain to Supabase hosting</p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-600 mt-1">□</span>
              <div>
                <strong>Set up SSL certificate (HTTPS)</strong>
                <p className="text-sm text-gray-600">Usually automatic with modern hosting</p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-600 mt-1">□</span>
              <div>
                <strong>Configure email forwarding</strong>
                <p className="text-sm text-gray-600">info@retirepath.com.au, support@retirepath.com.au</p>
              </div>
            </li>
          </ul>
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-3">📊 Analytics & Tracking</h3>
          <ul className="space-y-2 ml-6">
            <li className="flex items-start gap-2">
              <span className="text-yellow-600 mt-1">□</span>
              <div>
                <strong>Set up Google Analytics 4</strong>
                <p className="text-sm text-gray-600">Track user behavior, conversions, traffic sources</p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-600 mt-1">□</span>
              <div>
                <strong>Set up Google Search Console</strong>
                <p className="text-sm text-gray-600">Monitor SEO performance, indexing, errors</p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-600 mt-1">□</span>
              <div>
                <strong>Configure conversion tracking</strong>
                <p className="text-sm text-gray-600">Track sign-ups, subscriptions, village inquiries</p>
              </div>
            </li>
          </ul>
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-3">🧪 Testing & QA</h3>
          <ul className="space-y-2 ml-6">
            <li className="flex items-start gap-2">
              <span className="text-yellow-600 mt-1">□</span>
              <div>
                <strong>Test all user flows</strong>
                <p className="text-sm text-gray-600">Sign-up, login, village matcher, contract review</p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-600 mt-1">□</span>
              <div>
                <strong>Test payment integration</strong>
                <p className="text-sm text-gray-600">Stripe test mode → production mode</p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-600 mt-1">□</span>
              <div>
                <strong>Mobile responsiveness testing</strong>
                <p className="text-sm text-gray-600">iPhone, Android, tablets</p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-600 mt-1">□</span>
              <div>
                <strong>Browser compatibility</strong>
                <p className="text-sm text-gray-600">Chrome, Safari, Firefox, Edge</p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-600 mt-1">□</span>
              <div>
                <strong>Performance testing</strong>
                <p className="text-sm text-gray-600">Page load speeds, database queries</p>
              </div>
            </li>
          </ul>
        </div>
      </section>

      {/* Week 3 Tasks */}
      <section className="mb-12 print:break-before-page">
        <h2 className="text-2xl font-bold mb-4 text-orange-600">Week 3: Content & Marketing</h2>
        
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-3">📝 Website Content</h3>
          <ul className="space-y-2 ml-6">
            <li className="flex items-start gap-2">
              <span className="text-orange-600 mt-1">□</span>
              <div>
                <strong>Write About Us page</strong>
                <p className="text-sm text-gray-600">Your story, mission, team</p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-600 mt-1">□</span>
              <div>
                <strong>Write FAQ page</strong>
                <p className="text-sm text-gray-600">Common questions about platform, pricing, villages</p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-600 mt-1">□</span>
              <div>
                <strong>Create Contact page</strong>
                <p className="text-sm text-gray-600">Contact form, email, phone (if applicable)</p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-600 mt-1">□</span>
              <div>
                <strong>Write homepage copy</strong>
                <p className="text-sm text-gray-600">Clear value proposition, CTA, social proof</p>
              </div>
            </li>
          </ul>
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-3">🔍 SEO Foundation</h3>
          <ul className="space-y-2 ml-6">
            <li className="flex items-start gap-2">
              <span className="text-orange-600 mt-1">□</span>
              <div>
                <strong>Optimize meta titles & descriptions</strong>
                <p className="text-sm text-gray-600">All major pages (Home, Matcher, Contract Review, etc.)</p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-600 mt-1">□</span>
              <div>
                <strong>Add schema markup</strong>
                <p className="text-sm text-gray-600">Organization, LocalBusiness, Product schemas</p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-600 mt-1">□</span>
              <div>
                <strong>Create XML sitemap</strong>
                <p className="text-sm text-gray-600">Submit to Google Search Console</p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-600 mt-1">□</span>
              <div>
                <strong>Set up robots.txt</strong>
                <p className="text-sm text-gray-600">Allow crawling of public pages</p>
              </div>
            </li>
          </ul>
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-3">📱 Social Media Setup</h3>
          <ul className="space-y-2 ml-6">
            <li className="flex items-start gap-2">
              <span className="text-orange-600 mt-1">□</span>
              <div>
                <strong>Create Facebook Business Page</strong>
                <p className="text-sm text-gray-600">Post 3-5 times per week</p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-600 mt-1">□</span>
              <div>
                <strong>Set up LinkedIn Company Page</strong>
                <p className="text-sm text-gray-600">Target adult children helping parents</p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-600 mt-1">□</span>
              <div>
                <strong>Consider Google Business Profile</strong>
                <p className="text-sm text-gray-600">If you have physical location</p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-600 mt-1">□</span>
              <div>
                <strong>Create social media content calendar</strong>
                <p className="text-sm text-gray-600">Plan first month of posts</p>
              </div>
            </li>
          </ul>
        </div>
      </section>

      {/* Week 4 Tasks */}
      <section className="mb-12 print:break-before-page">
        <h2 className="text-2xl font-bold mb-4 text-red-600">Week 4: Pre-Launch</h2>
        
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-3">🚀 Launch Preparation</h3>
          <ul className="space-y-2 ml-6">
            <li className="flex items-start gap-2">
              <span className="text-red-600 mt-1">□</span>
              <div>
                <strong>Recruit beta testers (5-10 people)</strong>
                <p className="text-sm text-gray-600">Friends, family, or target users</p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-600 mt-1">□</span>
              <div>
                <strong>Conduct beta testing</strong>
                <p className="text-sm text-gray-600">Gather feedback, identify bugs</p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-600 mt-1">□</span>
              <div>
                <strong>Fix critical bugs</strong>
                <p className="text-sm text-gray-600">Prioritize showstoppers</p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-600 mt-1">□</span>
              <div>
                <strong>Prepare launch announcement</strong>
                <p className="text-sm text-gray-600">Email, social media, press release (optional)</p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-600 mt-1">□</span>
              <div>
                <strong>Set up customer support</strong>
                <p className="text-sm text-gray-600">Email templates, FAQ updates, response protocols</p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-600 mt-1">□</span>
              <div>
                <strong>Final production environment check</strong>
                <p className="text-sm text-gray-600">Database backups, monitoring, error tracking</p>
              </div>
            </li>
          </ul>
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-3">📣 Launch Day Checklist</h3>
          <ul className="space-y-2 ml-6">
            <li className="flex items-start gap-2">
              <span className="text-red-600 mt-1">□</span>
              <div>
                <strong>Post on social media</strong>
                <p className="text-sm text-gray-600">Facebook, LinkedIn announcements</p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-600 mt-1">□</span>
              <div>
                <strong>Send launch email</strong>
                <p className="text-sm text-gray-600">To beta testers, email list (if any)</p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-600 mt-1">□</span>
              <div>
                <strong>Monitor analytics closely</strong>
                <p className="text-sm text-gray-600">Traffic, errors, user behavior</p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-600 mt-1">□</span>
              <div>
                <strong>Be ready for customer support</strong>
                <p className="text-sm text-gray-600">Respond quickly to inquiries</p>
              </div>
            </li>
          </ul>
        </div>
      </section>

      {/* Post-Launch */}
      <section className="mb-12 print:break-before-page">
        <h2 className="text-2xl font-bold mb-4 text-purple-600">Post-Launch (Ongoing)</h2>
        
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-3">📈 Growth & Marketing</h3>
          <ul className="space-y-2 ml-6">
            <li className="flex items-start gap-2">
              <span className="text-purple-600 mt-1">□</span>
              <div>
                <strong>Start content marketing</strong>
                <p className="text-sm text-gray-600">Blog posts about retirement villages, moving tips</p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-600 mt-1">□</span>
              <div>
                <strong>Build backlinks</strong>
                <p className="text-sm text-gray-600">Outreach to aged care sites, directories</p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-600 mt-1">□</span>
              <div>
                <strong>Consider Google Ads</strong>
                <p className="text-sm text-gray-600">Small budget test ($500-1000/month)</p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-600 mt-1">□</span>
              <div>
                <strong>Reach out to retirement villages</strong>
                <p className="text-sm text-gray-600">Offer to list their villages for free initially</p>
              </div>
            </li>
          </ul>
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-3">🔧 Continuous Improvement</h3>
          <ul className="space-y-2 ml-6">
            <li className="flex items-start gap-2">
              <span className="text-purple-600 mt-1">□</span>
              <div>
                <strong>Analyze user feedback</strong>
                <p className="text-sm text-gray-600">Weekly review of support tickets, reviews</p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-600 mt-1">□</span>
              <div>
                <strong>A/B test features</strong>
                <p className="text-sm text-gray-600">Pricing, CTAs, landing pages</p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-600 mt-1">□</span>
              <div>
                <strong>Add missing villages</strong>
                <p className="text-sm text-gray-600">Continue scraping and data entry</p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-600 mt-1">□</span>
              <div>
                <strong>Improve data quality</strong>
                <p className="text-sm text-gray-600">Update pricing, amenities, images</p>
              </div>
            </li>
          </ul>
        </div>
      </section>

      {/* Critical Priorities */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4 text-red-600">⚠️ CRITICAL PRIORITIES</h2>
        
        <div className="bg-red-50 border-l-4 border-red-600 p-6 mb-4">
          <h3 className="font-bold text-lg mb-3">DO THESE FIRST (Before anything else)</h3>
          <ol className="list-decimal list-inside space-y-2 ml-4">
            <li className="font-semibold">Get Professional Indemnity Insurance</li>
            <li className="font-semibold">Create Privacy Policy + Terms of Service</li>
            <li className="font-semibold">Add disclaimers throughout app</li>
            <li className="font-semibold">Lawyer review (1-2 hours minimum)</li>
          </ol>
        </div>

        <div className="bg-yellow-50 border-l-4 border-yellow-600 p-6">
          <h3 className="font-bold text-lg mb-3">HIGH PRIORITY (First 2 weeks)</h3>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Domain registration + hosting setup</li>
            <li>Final testing (all features)</li>
            <li>Analytics setup (Google Analytics + Search Console)</li>
            <li>Beta testing with 5-10 users</li>
          </ul>
        </div>
      </section>

      {/* Footer */}
      <div className="text-center text-sm text-gray-500 mt-12 pt-6 border-t">
        <p className="font-semibold">RetirePath Launch Schedule</p>
        <p>Last Updated: January 24, 2026</p>
      </div>
    </div>
  );
}

// Legal Checklist Document Component
function LegalChecklistDocument() {
  return <div className="prose max-w-none">
    <div className="text-center mb-8">
      <h1 className="text-4xl font-bold mb-2">RetirePath</h1>
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">Legal Checklist Before Launch</h2>
      <p className="text-sm text-gray-500 mt-2">Last Updated: January 24, 2026</p>
    </div>

    <div className="bg-red-50 border-l-4 border-red-600 p-6 mb-8">
      <h3 className="font-bold text-red-900 mb-2">⚠️ IMPORTANT DISCLAIMER</h3>
      <p className="text-sm text-red-800">
        This document is for informational purposes only and does not constitute legal advice. 
        You should consult with qualified Australian lawyers before launching RetirePath.
      </p>
    </div>

    <hr className="my-8" />

    <section className="mb-12">
      <h2 className="text-2xl font-bold mb-4 text-blue-600">Executive Summary</h2>
      
      <div className="bg-yellow-50 border-l-4 border-yellow-600 p-6 mb-6">
        <p className="font-bold text-lg mb-2">YES, you need legal advice before going live.</p>
        <p className="mb-4">RetirePath operates in a highly regulated space involving:</p>
        <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
          <li>Seniors (vulnerable consumers under ACCC guidelines)</li>
          <li>Contract analysis (could be construed as legal advice)</li>
          <li>Financial information (valuations, fee calculations)</li>
          <li>User data (Privacy Act 1988 compliance)</li>
          <li>Business relationships (village operators)</li>
        </ul>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="border-2 border-blue-500 rounded-lg p-4">
          <p className="font-semibold mb-1">Estimated Legal Budget:</p>
          <p className="text-2xl font-bold text-blue-600">$5,000 - $15,000</p>
        </div>
        <div className="border-2 border-orange-500 rounded-lg p-4">
          <p className="font-semibold mb-1">Timeline:</p>
          <p className="text-2xl font-bold text-orange-600">2-4 weeks</p>
        </div>
      </div>
    </section>

    <section className="mb-12 print:break-before-page">
      <h2 className="text-2xl font-bold mb-4 text-red-600">🔴 Priority 1: Disclaimers & Liability Protection</h2>
      
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-3">Why Critical:</h3>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>You're providing contract analysis without being a law firm</li>
          <li>You're providing home valuations without being licensed valuers</li>
          <li>You're serving seniors (vulnerable consumers - higher duty of care)</li>
          <li>Risk of liability claims if users rely on incorrect information</li>
        </ul>
      </div>

      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-3">What Needs Review:</h3>
        <div className="space-y-4">
          <div className="border-l-4 border-red-500 pl-4">
            <h4 className="font-semibold mb-1">1. Disclaimer Language</h4>
            <ul className="text-sm list-disc list-inside ml-4 space-y-1">
              <li>"Not legal advice" disclaimers</li>
              <li>"Not financial advice" disclaimers</li>
              <li>AI-generated content disclaimers</li>
              <li>Limitations of liability</li>
              <li>User responsibility clauses</li>
            </ul>
          </div>

          <div className="border-l-4 border-red-500 pl-4">
            <h4 className="font-semibold mb-1">2. Placement of Disclaimers</h4>
            <ul className="text-sm list-disc list-inside ml-4 space-y-1">
              <li>Where disclaimers appear (every page? pop-ups?)</li>
              <li>How prominent they need to be</li>
              <li>Whether users must acknowledge before using tools</li>
              <li>Frequency of reminders</li>
            </ul>
          </div>

          <div className="border-l-4 border-red-500 pl-4">
            <h4 className="font-semibold mb-1">3. Effectiveness of Disclaimers</h4>
            <ul className="text-sm list-disc list-inside ml-4 space-y-1">
              <li>Are your disclaimers legally enforceable in Australia?</li>
              <li>Do they actually protect you from liability?</li>
              <li>Are they clear enough for seniors to understand?</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-gray-100 border rounded-lg p-4">
        <p className="font-semibold mb-2">Lawyer Type:</p>
        <p className="text-sm mb-3">Consumer law specialist or tech/startup lawyer</p>
        <p className="font-semibold mb-2">Estimated Cost:</p>
        <p className="text-lg font-bold text-red-600">$2,000 - $4,000</p>
      </div>
    </section>

    <section className="mb-12 print:break-before-page">
      <h2 className="text-2xl font-bold mb-4 text-red-600">🔴 Priority 2: Terms of Service & Privacy Policy</h2>
      
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-3">Why Critical:</h3>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Legally required under Australian Consumer Law</li>
          <li>Privacy Act 1988 compliance mandatory</li>
          <li>Required by payment processors (Stripe)</li>
          <li>Required by hosting providers (Supabase)</li>
          <li>Protects you in disputes</li>
        </ul>
      </div>

      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-3">What Needs Review:</h3>
        <div className="space-y-4">
          <div className="border-l-4 border-red-500 pl-4">
            <h4 className="font-semibold mb-2">Terms of Service Must Include:</h4>
            <ul className="text-sm list-disc list-inside ml-4 space-y-1">
              <li>Comprehensive liability limitations</li>
              <li>Clear payment and subscription terms</li>
              <li>Intellectual property protections</li>
              <li>User conduct rules</li>
              <li>Termination clauses</li>
              <li>Dispute resolution process</li>
              <li>Governing law and jurisdiction</li>
            </ul>
          </div>

          <div className="border-l-4 border-red-500 pl-4">
            <h4 className="font-semibold mb-2">Privacy Policy Must Cover:</h4>
            <ul className="text-sm list-disc list-inside ml-4 space-y-1">
              <li>Privacy Act 1988 & Australian Privacy Principles compliance</li>
              <li>What data you collect and how it's used</li>
              <li>Third-party data sharing (Stripe, Supabase, Resend)</li>
              <li>User rights (access, correction, deletion)</li>
              <li>Data breach procedures</li>
              <li>Cookies and tracking</li>
              <li>Cross-border data transfers</li>
            </ul>
          </div>

          <div className="border-l-4 border-red-500 pl-4">
            <h4 className="font-semibold mb-2">Cookie Policy:</h4>
            <ul className="text-sm list-disc list-inside ml-4 space-y-1">
              <li>What cookies you use</li>
              <li>Consent requirements</li>
              <li>Opt-out mechanisms</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-gray-100 border rounded-lg p-4">
        <p className="font-semibold mb-2">Lawyer Type:</p>
        <p className="text-sm mb-3">Privacy lawyer or tech/startup lawyer with privacy expertise</p>
        <p className="font-semibold mb-2">Estimated Cost:</p>
        <p className="text-lg font-bold text-red-600">$1,500 - $3,000</p>
      </div>
    </section>

    <section className="mb-12 print:break-before-page">
      <h2 className="text-2xl font-bold mb-4 text-red-600">🔴 Priority 3: Australian Consumer Law</h2>
      
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-3">Key Areas of Concern:</h3>
        
        <div className="space-y-4">
          <div className="border-l-4 border-red-500 pl-4">
            <h4 className="font-semibold mb-2">1. Misleading or Deceptive Conduct (Section 18, ACL)</h4>
            <ul className="text-sm list-disc list-inside ml-4 space-y-1">
              <li>Are your marketing claims accurate?</li>
              <li>Are your AI "accuracy" claims defensible?</li>
              <li>Home valuation estimates - are disclaimers sufficient?</li>
              <li>"Risk scores" for contracts - could these mislead?</li>
            </ul>
          </div>

          <div className="border-l-4 border-red-500 pl-4">
            <h4 className="font-semibold mb-2">2. Unconscionable Conduct</h4>
            <ul className="text-sm list-disc list-inside ml-4 space-y-1">
              <li>Are your terms fair for elderly users?</li>
              <li>Is pricing transparent and reasonable?</li>
              <li>Are cancellation/refund terms fair?</li>
              <li>Do you take advantage of vulnerability?</li>
            </ul>
          </div>

          <div className="border-l-4 border-red-500 pl-4">
            <h4 className="font-semibold mb-2">3. Unfair Contract Terms</h4>
            <ul className="text-sm list-disc list-inside ml-4 space-y-1">
              <li>Do your T&Cs have unfair terms?</li>
              <li>Unilateral variation clauses</li>
              <li>Automatic renewals without notice</li>
              <li>Excessive termination fees</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-gray-100 border rounded-lg p-4">
        <p className="font-semibold mb-2">Lawyer Type:</p>
        <p className="text-sm mb-3">Consumer law specialist</p>
        <p className="font-semibold mb-2">Estimated Cost:</p>
        <p className="text-lg font-bold text-red-600">$1,500 - $3,000</p>
      </div>
    </section>

    <section className="mb-12 print:break-before-page">
      <h2 className="text-2xl font-bold mb-4 text-orange-600">🟡 Priority 4: Insurance Requirements</h2>
      
      <div className="space-y-4">
        <div className="border-2 border-orange-500 rounded-lg p-4">
          <h3 className="font-bold text-lg mb-2">1. Professional Indemnity Insurance (MANDATORY)</h3>
          <p className="text-sm mb-2"><strong>Why:</strong> You're providing advice/recommendations about contracts and valuations</p>
          <p className="text-sm mb-2"><strong>Coverage:</strong> $10M+ recommended</p>
          <p className="text-sm mb-2"><strong>Cost:</strong> $1,500-3,000/year</p>
          <p className="text-sm"><strong>Providers:</strong> AON, Gallagher, BizCover</p>
        </div>

        <div className="border-2 border-orange-500 rounded-lg p-4">
          <h3 className="font-bold text-lg mb-2">2. Public Liability Insurance</h3>
          <p className="text-sm mb-2"><strong>Coverage:</strong> $20M</p>
          <p className="text-sm mb-2"><strong>Cost:</strong> $500-1,000/year</p>
        </div>

        <div className="border-2 border-orange-500 rounded-lg p-4">
          <h3 className="font-bold text-lg mb-2">3. Cyber Liability Insurance</h3>
          <p className="text-sm mb-2"><strong>Why:</strong> Data breach protection</p>
          <p className="text-sm mb-2"><strong>Cost:</strong> $1,000-2,000/year</p>
        </div>
      </div>
    </section>

    <section className="mb-12">
      <h2 className="text-2xl font-bold mb-4 text-green-600">Action Plan Summary</h2>
      
      <div className="bg-green-50 border-l-4 border-green-600 p-6">
        <h3 className="font-bold text-lg mb-4">BEFORE LAUNCH - Must Complete:</h3>
        <ol className="list-decimal list-inside space-y-2 ml-4">
          <li className="font-semibold">Consult with consumer law/tech lawyer ($2,000-4,000)</li>
          <li className="font-semibold">Get Professional Indemnity Insurance ($1,500-3,000)</li>
          <li className="font-semibold">Have lawyer review/draft Terms of Service ($1,500-3,000)</li>
          <li className="font-semibold">Have lawyer review/draft Privacy Policy ($1,500-3,000)</li>
          <li className="font-semibold">Add comprehensive disclaimers throughout app</li>
          <li className="font-semibold">Get Public Liability Insurance ($500-1,000)</li>
          <li className="font-semibold">Get Cyber Liability Insurance ($1,000-2,000)</li>
        </ol>
        
        <div className="mt-6 pt-4 border-t border-green-600">
          <p className="font-bold text-xl">Total Estimated Cost: $8,000 - $16,000</p>
          <p className="font-bold text-xl">Timeline: 2-4 weeks</p>
        </div>
      </div>
    </section>

    <div className="text-center text-sm text-gray-500 mt-12 pt-6 border-t">
      <p className="font-semibold">RetirePath Legal Checklist</p>
      <p>This is for informational purposes only - not legal advice</p>
      <p>Consult with qualified Australian lawyers before launch</p>
    </div>
  </div>;
}

// All document components are now imported from separate files