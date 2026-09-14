import React from 'react';

export function SocialMediaDocument() {
  return (
    <div className="prose max-w-none">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">RetirePath</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Social Media Strategy & Setup Guide</h2>
        <p className="text-sm text-gray-500 mt-2">Last Updated: January 24, 2026</p>
      </div>

      <hr className="my-8" />

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4 text-blue-600">Platform Priorities</h2>
        
        <div className="bg-blue-50 border-l-4 border-blue-600 p-6 mb-6">
          <h3 className="font-bold mb-3">Target Audiences:</h3>
          <ul className="space-y-2 text-sm">
            <li><strong>Primary:</strong> Retirees (65-80 years) - Active on Facebook & YouTube</li>
            <li><strong>Secondary:</strong> Adult Children (35-55 years) - Facebook, Instagram, LinkedIn</li>
            <li><strong>Tertiary:</strong> Village Operators - LinkedIn, Professional Facebook groups</li>
          </ul>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border-2 border-yellow-500 rounded-lg p-4 bg-yellow-50">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🥇</span>
              <h3 className="font-bold text-lg">Priority 1: Facebook</h3>
            </div>
            <p className="text-sm mb-2"><strong>Why:</strong> 72% of Australians 65+ use Facebook regularly</p>
            <p className="text-sm mb-2"><strong>Create:</strong> Business Page + Community Group</p>
            <p className="text-sm mb-2"><strong>Post:</strong> 3-5 times per week</p>
            <p className="text-sm"><strong>Time:</strong> 10-15 hrs/month</p>
          </div>

          <div className="border-2 border-gray-400 rounded-lg p-4 bg-gray-50">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🥈</span>
              <h3 className="font-bold text-lg">Priority 2: YouTube</h3>
            </div>
            <p className="text-sm mb-2"><strong>Why:</strong> 2nd largest search engine, educational content</p>
            <p className="text-sm mb-2"><strong>Create:</strong> RetirePath Australia channel</p>
            <p className="text-sm mb-2"><strong>Post:</strong> 2-4 videos per month</p>
            <p className="text-sm"><strong>Time:</strong> 20-30 hrs/month</p>
          </div>

          <div className="border-2 border-orange-600 rounded-lg p-4 bg-orange-50">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🥉</span>
              <h3 className="font-bold text-lg">Priority 3: LinkedIn</h3>
            </div>
            <p className="text-sm mb-2"><strong>Why:</strong> Reach village operators (B2B)</p>
            <p className="text-sm mb-2"><strong>Create:</strong> Company Page + Personal Profile</p>
            <p className="text-sm mb-2"><strong>Post:</strong> 2-3 times per week</p>
            <p className="text-sm"><strong>Time:</strong> 5-8 hrs/month</p>
          </div>

          <div className="border-2 border-purple-500 rounded-lg p-4 bg-purple-50">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">📸</span>
              <h3 className="font-bold text-lg">Priority 4: Instagram</h3>
            </div>
            <p className="text-sm mb-2"><strong>Why:</strong> Reach adult children helping parents</p>
            <p className="text-sm mb-2"><strong>Create:</strong> @retirepath_au</p>
            <p className="text-sm mb-2"><strong>Post:</strong> 3-4 per week + daily stories</p>
            <p className="text-sm"><strong>Time:</strong> 8-12 hrs/month</p>
          </div>
        </div>
      </section>

      <section className="mb-12 print:break-before-page">
        <h2 className="text-2xl font-bold mb-4 text-green-600">Quick Setup Checklist</h2>
        
        <div className="space-y-6">
          <div className="border-l-4 border-green-500 pl-4">
            <h3 className="font-semibold mb-3">Before Creating Accounts:</h3>
            <ul className="space-y-2 text-sm ml-4">
              <li className="flex items-start gap-2">
                <span className="text-green-600">□</span>
                <span>Check handle availability across all platforms (@RetirePath or @RetirePathAU)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600">□</span>
                <span>Prepare logo (PNG transparent, multiple sizes: 800x800, 300x300, 170x170)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600">□</span>
                <span>Create cover images for each platform</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600">□</span>
                <span>Write bio variations (50, 150, 250 characters)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600">□</span>
                <span>Prepare first 10 posts (written and designed)</span>
              </li>
            </ul>
          </div>

          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="font-semibold mb-3">Facebook Setup (2 hours):</h3>
            <ol className="space-y-2 text-sm list-decimal list-inside ml-4">
              <li>Create Business Page at facebook.com/pages/create</li>
              <li>Add profile (170x170) and cover photo (820x312)</li>
              <li>Complete About section with keywords</li>
              <li>Add "Sign Up" call-to-action button</li>
              <li>Create Community Group (private)</li>
              <li>Post welcome message and first 3 posts</li>
            </ol>
          </div>

          <div className="border-l-4 border-red-500 pl-4">
            <h3 className="font-semibold mb-3">YouTube Setup (3 hours):</h3>
            <ol className="space-y-2 text-sm list-decimal list-inside ml-4">
              <li>Create channel: "RetirePath Australia"</li>
              <li>Add profile (800x800) and banner (2560x1440)</li>
              <li>Write channel description (see full guide for template)</li>
              <li>Create 5 playlists (Tours, Contracts, Downsizing, etc.)</li>
              <li>Record channel trailer (2 minutes)</li>
              <li>Upload first 2-3 videos</li>
            </ol>
          </div>

          <div className="border-l-4 border-purple-500 pl-4">
            <h3 className="font-semibold mb-3">LinkedIn Setup (1 hour):</h3>
            <ol className="space-y-2 text-sm list-decimal list-inside ml-4">
              <li>Create Company Page at linkedin.com/company/setup/new</li>
              <li>Add logo (300x300) and cover (1128x191)</li>
              <li>Write company description with keywords</li>
              <li>Post launch announcement</li>
              <li>Connect with industry contacts</li>
            </ol>
          </div>

          <div className="border-l-4 border-orange-500 pl-4">
            <h3 className="font-semibold mb-3">Instagram Setup (2 hours):</h3>
            <ol className="space-y-2 text-sm list-decimal list-inside ml-4">
              <li>Create business account: @retirepath_au</li>
              <li>Add profile photo (320x320) and bio (150 chars)</li>
              <li>Set up Linktree with multiple links</li>
              <li>Create 6 story highlights with covers</li>
              <li>Post first 9 grid posts (plan cohesive look)</li>
            </ol>
          </div>
        </div>
      </section>

      <section className="mb-12 print:break-before-page">
        <h2 className="text-2xl font-bold mb-4 text-purple-600">Weekly Content Strategy</h2>
        
        <div className="bg-gray-100 rounded-lg p-6 mb-6">
          <h3 className="font-semibold mb-4">Daily Themes:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="border-l-4 border-blue-500 pl-3">
              <strong>Monday:</strong> Motivational/Success Stories
            </div>
            <div className="border-l-4 border-green-500 pl-3">
              <strong>Tuesday:</strong> Educational Tips
            </div>
            <div className="border-l-4 border-yellow-500 pl-3">
              <strong>Wednesday:</strong> Feature Spotlight
            </div>
            <div className="border-l-4 border-orange-500 pl-3">
              <strong>Thursday:</strong> Expert Content/Interviews
            </div>
            <div className="border-l-4 border-red-500 pl-3">
              <strong>Friday:</strong> Engagement/Community Q&A
            </div>
            <div className="border-l-4 border-purple-500 pl-3">
              <strong>Saturday:</strong> Village Showcase/Tours
            </div>
            <div className="border-l-4 border-gray-500 pl-3">
              <strong>Sunday:</strong> Planning Tools/Checklists
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="font-semibold mb-3">Content Ideas (Top 20):</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <ul className="space-y-1">
              <li>✅ Retirement planning tips</li>
              <li>✅ Village spotlight videos</li>
              <li>✅ Contract red flags to watch</li>
              <li>✅ Decluttering timelines</li>
              <li>✅ Success stories from users</li>
              <li>✅ Live Q&A sessions</li>
              <li>✅ "10 Questions to Ask" lists</li>
              <li>✅ Cost breakdowns explained</li>
              <li>✅ Virtual village tours</li>
              <li>✅ Expert interviews (lawyers, planners)</li>
            </ul>
            <ul className="space-y-1">
              <li>✅ Downsizing before/after</li>
              <li>✅ Day in the life at villages</li>
              <li>✅ Platform tutorials</li>
              <li>✅ State-by-state guides</li>
              <li>✅ Amenities comparisons</li>
              <li>✅ User testimonials</li>
              <li>✅ Industry news commentary</li>
              <li>✅ FAQ explainers</li>
              <li>✅ Weekend inspiration posts</li>
              <li>✅ Behind-the-scenes content</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mb-12 print:break-before-page">
        <h2 className="text-2xl font-bold mb-4 text-red-600">Essential Free Tools</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border rounded-lg p-4">
            <h3 className="font-bold mb-2">Design & Graphics</h3>
            <ul className="text-sm space-y-1">
              <li><strong>Canva</strong> (canva.com) - Templates, video editing</li>
              <li><strong>Unsplash</strong> - Free stock photos</li>
              <li><strong>Pexels</strong> - Free videos</li>
            </ul>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="font-bold mb-2">Video Creation</h3>
            <ul className="text-sm space-y-1">
              <li><strong>CapCut</strong> - Easy mobile editing</li>
              <li><strong>DaVinci Resolve</strong> - Pro editing (free)</li>
              <li><strong>OBS Studio</strong> - Screen recording</li>
            </ul>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="font-bold mb-2">Scheduling</h3>
            <ul className="text-sm space-y-1">
              <li><strong>Meta Business Suite</strong> - FB & IG (FREE!)</li>
              <li><strong>Buffer</strong> - 3 profiles free</li>
              <li><strong>Later</strong> - 30 posts/month free</li>
            </ul>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="font-bold mb-2">Analytics</h3>
            <ul className="text-sm space-y-1">
              <li><strong>Facebook Insights</strong> - Native analytics</li>
              <li><strong>Instagram Insights</strong> - Native analytics</li>
              <li><strong>YouTube Analytics</strong> - Native analytics</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4 text-orange-600">First 3 Months Goals</h2>
        
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-sm font-semibold mb-1">Facebook</p>
              <p className="text-3xl font-bold text-blue-600">500-1K</p>
              <p className="text-xs text-gray-600">page likes</p>
            </div>
            <div>
              <p className="text-sm font-semibold mb-1">Instagram</p>
              <p className="text-3xl font-bold text-purple-600">300-500</p>
              <p className="text-xs text-gray-600">followers</p>
            </div>
            <div>
              <p className="text-sm font-semibold mb-1">YouTube</p>
              <p className="text-3xl font-bold text-red-600">100-300</p>
              <p className="text-xs text-gray-600">subscribers</p>
            </div>
            <div>
              <p className="text-sm font-semibold mb-1">LinkedIn</p>
              <p className="text-3xl font-bold text-blue-800">200-500</p>
              <p className="text-xs text-gray-600">followers</p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-300">
            <h3 className="font-bold mb-3">Time Investment:</h3>
            <ul className="text-sm space-y-2">
              <li><strong>Week 1:</strong> Setup all accounts (8 hours total)</li>
              <li><strong>Weeks 2-12:</strong> 4-6 hours/week for content creation and engagement</li>
              <li><strong>Total:</strong> ~60-70 hours over 3 months</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4 text-gray-700">Important Compliance Notes</h2>
        
        <div className="bg-yellow-50 border-l-4 border-yellow-600 p-6">
          <ul className="text-sm space-y-2">
            <li>✅ Always get written permission for testimonials and photos</li>
            <li>✅ Include "Not financial/legal advice" disclaimers</li>
            <li>✅ Only use licensed stock photos or authorized village images</li>
            <li>✅ Add alt text to all images for accessibility</li>
            <li>✅ Captions on all videos (seniors-friendly)</li>
            <li>✅ Disclose paid partnerships (#ad, #sponsored)</li>
            <li>✅ Never share user data publicly</li>
            <li>✅ Respond to negative comments professionally (don't delete unless abusive)</li>
          </ul>
        </div>
      </section>

      <div className="text-center text-sm text-gray-500 mt-12 pt-6 border-t">
        <p className="font-semibold">RetirePath Social Media Strategy</p>
        <p>For full detailed guide with setup instructions, see complete documentation</p>
      </div>
    </div>
  );
}
