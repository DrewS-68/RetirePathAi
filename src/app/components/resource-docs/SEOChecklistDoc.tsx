import React from 'react';

export function SEOChecklistDocument() {
  return (
    <div className="prose max-w-none">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">RetirePath</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">SEO Quick Start Checklist</h2>
        <p className="text-lg text-gray-600">Get Started in Under 2 Hours</p>
        <p className="text-sm text-gray-500 mt-2">Last Updated: January 24, 2026</p>
      </div>

      <hr className="my-8" />

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4 text-green-600">TODAY (30 minutes)</h2>
        
        <div className="bg-green-50 border-l-4 border-green-600 p-6 space-y-4">
          <div>
            <h3 className="font-semibold mb-2">✅ Set Up Tracking:</h3>
            <ul className="text-sm space-y-2 ml-4">
              <li>□ Go to <strong>https://search.google.com/search-console</strong></li>
              <li>□ Add property: <code>https://retirepath.com</code></li>
              <li>□ Verify ownership (DNS method)</li>
              <li>□ Submit sitemap</li>
            </ul>
          </div>

          <div>
            <ul className="text-sm space-y-2 ml-4">
              <li>□ Go to <strong>https://analytics.google.com</strong></li>
              <li>□ Create new property</li>
              <li>□ Install tracking code</li>
              <li>□ Set up conversion goals</li>
            </ul>
          </div>

          <div>
            <ul className="text-sm space-y-2 ml-4">
              <li>□ Sign up for <strong>ChatGPT Plus</strong> ($20/month)<br />
              <span className="text-gray-600">https://chat.openai.com/</span></li>
            </ul>
          </div>

          <p className="font-bold text-green-700 mt-4">✅ Done! Google is now tracking your site.</p>
        </div>
      </section>

      <section className="mb-12 print:break-before-page">
        <h2 className="text-2xl font-bold mb-4 text-blue-600">THIS WEEK (4 hours)</h2>
        
        <div className="space-y-6">
          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="font-semibold mb-3">Day 1: Keyword Research (1 hour)</h3>
            <div className="bg-blue-50 rounded p-4 mb-3">
              <p className="text-sm font-semibold mb-2">Use this ChatGPT prompt:</p>
              <p className="text-sm italic bg-white p-3 rounded border">
                "Generate 100 SEO keywords for RetirePath, an Australian retirement 
                village comparison platform. Include: 1) Informational keywords (how to, guide, what is),
                2) Transactional keywords (best, reviews, compare), 3) Location keywords 
                (Sydney, Melbourne, Brisbane), 4) Long-tail keywords. Format as CSV: Keyword, Search Intent, Competition"
              </p>
            </div>
            <ul className="text-sm space-y-2">
              <li>□ Save to Google Sheets</li>
              <li>□ Validate top 20 with Ubersuggest (free)</li>
            </ul>
          </div>

          <div className="border-l-4 border-green-500 pl-4">
            <h3 className="font-semibold mb-3">Day 2: Homepage Content (1 hour)</h3>
            <ul className="text-sm space-y-2">
              <li>□ Write 500-700 words for homepage</li>
              <li>□ Target keyword: "retirement village finder Australia"</li>
              <li>□ Include: value prop, how it works, village count</li>
              <li>□ Add meta title and description</li>
              <li>□ Use ChatGPT to help</li>
            </ul>
          </div>

          <div className="border-l-4 border-yellow-500 pl-4">
            <h3 className="font-semibold mb-3">Day 3: About Page (30 minutes)</h3>
            <ul className="text-sm space-y-2">
              <li>□ Write 400-600 words</li>
              <li>□ Target keyword: "retirement village comparison tool"</li>
              <li>□ Explain features and benefits</li>
            </ul>
          </div>

          <div className="border-l-4 border-orange-500 pl-4">
            <h3 className="font-semibold mb-3">Day 4: First Blog Post (2 hours)</h3>
            <ul className="text-sm space-y-2">
              <li>□ Recommended: "Complete Guide to Retirement Villages in Australia"</li>
              <li>□ Use ChatGPT to create outline</li>
              <li>□ Write 2,000 words</li>
              <li>□ Publish!</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 bg-blue-100 border-2 border-blue-600 rounded-lg p-4">
          <p className="font-bold">Week 1 Complete! ✅</p>
          <p className="text-sm">You have foundation pages + 1 blog post.</p>
        </div>
      </section>

      <section className="mb-12 print:break-before-page">
        <h2 className="text-2xl font-bold mb-4 text-purple-600">THIS MONTH (15 hours total)</h2>
        
        <div className="space-y-6">
          <div className="bg-gray-100 rounded-lg p-4">
            <h3 className="font-semibold mb-2">Week 1 (Already done above)</h3>
            <p className="text-sm">Homepage, About page, First blog post</p>
          </div>

          <div className="border-l-4 border-purple-500 pl-4">
            <h3 className="font-semibold mb-3">Week 2: Blog Post + Village Pages (4 hours)</h3>
            <ul className="text-sm space-y-2">
              <li>□ <strong>Monday:</strong> Write blog post #2 (2 hours)<br />
              <span className="text-gray-600">Topic: "Retirement Village Costs Explained"</span></li>
              <li>□ <strong>Wednesday:</strong> Optimize 100 village pages (2 hours)<br />
              <span className="text-gray-600">Use ChatGPT batch prompt (see SEO Prompts guide)</span><br />
              <span className="text-gray-600">Add unique meta titles and descriptions</span></li>
            </ul>
          </div>

          <div className="border-l-4 border-red-500 pl-4">
            <h3 className="font-semibold mb-3">Week 3: Blog Post + Location Page (4 hours)</h3>
            <ul className="text-sm space-y-2">
              <li>□ <strong>Monday:</strong> Write blog post #3 (2 hours)<br />
              <span className="text-gray-600">Topic: "10 Red Flags in Retirement Village Contracts"</span></li>
              <li>□ <strong>Wednesday:</strong> Create NSW location page (2 hours)<br />
              <span className="text-gray-600">"Retirement Villages in New South Wales" (800-1,000 words)</span></li>
            </ul>
          </div>

          <div className="border-l-4 border-green-500 pl-4">
            <h3 className="font-semibold mb-3">Week 4: Blog Post + Schema (4 hours)</h3>
            <ul className="text-sm space-y-2">
              <li>□ <strong>Monday:</strong> Write blog post #4 (2 hours)<br />
              <span className="text-gray-600">Topic: "How to Review a Retirement Village Contract"</span></li>
              <li>□ <strong>Wednesday:</strong> Add schema markup (2 hours)<br />
              <span className="text-gray-600">LocalBusiness schema on village pages</span><br />
              <span className="text-gray-600">FAQ schema on blog posts</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-6 bg-purple-100 border-2 border-purple-600 rounded-lg p-4">
          <p className="font-bold">Month 1 Complete! ✅</p>
          <p className="text-sm">You have 4 blog posts, optimized pages, and schema.</p>
        </div>
      </section>

      <section className="mb-12 print:break-before-page">
        <h2 className="text-2xl font-bold mb-4 text-orange-600">NEXT 3 MONTHS (Weekly Routine)</h2>
        
        <div className="bg-orange-50 border-2 border-orange-600 rounded-lg p-6">
          <h3 className="font-bold mb-4">Repeat Every Week (3-4 hours):</h3>
          
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-semibold mb-2">Monday: Blog Post (1-2 hours)</h4>
              <ul className="text-sm space-y-1">
                <li>• Write one blog post (1,500-2,000 words)</li>
                <li>• Use ChatGPT for outline + draft</li>
                <li>• Optimize for target keyword</li>
                <li>• Publish</li>
              </ul>
            </div>

            <div className="border-l-4 border-green-500 pl-4">
              <h4 className="font-semibold mb-2">Wednesday: Village Pages (1-2 hours)</h4>
              <ul className="text-sm space-y-1">
                <li>• Optimize 50-100 village pages</li>
                <li>• Add unique content</li>
                <li>• Add meta data</li>
                <li>• Add schema</li>
              </ul>
            </div>

            <div className="border-l-4 border-yellow-500 pl-4">
              <h4 className="font-semibold mb-2">Friday: Maintenance (30 minutes)</h4>
              <ul className="text-sm space-y-1">
                <li>• Check Google Search Console</li>
                <li>• Review rankings</li>
                <li>• Fix any errors</li>
                <li>• Plan next week</li>
              </ul>
            </div>

            <div className="border-l-4 border-purple-500 pl-4">
              <h4 className="font-semibold mb-2">Monthly: Location Page (2 hours)</h4>
              <ul className="text-sm space-y-1">
                <li>• Create 2 state/city pages per month</li>
                <li>• 800-1,000 words each</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-12 print:break-before-page">
        <h2 className="text-2xl font-bold mb-4 text-green-600">BY LAUNCH DAY (Month 3)</h2>
        
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-600 rounded-lg p-8">
          <h3 className="font-bold text-xl mb-4 text-center">You'll have:</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <ul className="space-y-2 text-sm">
              <li>✅ <strong>12 blog posts</strong> published</li>
              <li>✅ <strong>2,569 village pages</strong> optimized</li>
              <li>✅ <strong>8 location pages</strong> (all states)</li>
              <li>✅ <strong>Full schema markup</strong></li>
            </ul>
            <ul className="space-y-2 text-sm">
              <li>✅ <strong>Google indexing</strong> all pages</li>
              <li>✅ <strong>Ranking for 20-50 keywords</strong></li>
              <li>✅ <strong>Organic traffic from Day 1!</strong></li>
              <li>✅ <strong>6-month head start</strong></li>
            </ul>
          </div>

          <p className="text-center font-bold text-2xl text-green-700">🎉 SEO Success!</p>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4 text-blue-600">📊 Track Your Progress</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-3">Weekly Checklist:</h3>
            <ul className="text-sm space-y-2">
              <li>□ Blog posts this month: ___/4</li>
              <li>□ Village pages optimized: ___/2,569</li>
              <li>□ Location pages created: ___/8</li>
              <li>□ Backlinks earned: ___</li>
              <li>□ Keywords ranking: ___</li>
            </ul>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-3">Monthly Review:</h3>
            <ul className="text-sm space-y-2">
              <li>□ Total organic visitors: ___</li>
              <li>□ Pages indexed: ___</li>
              <li>□ Top ranking keywords: ___</li>
              <li>□ Leads from organic: ___</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4 text-purple-600">💰 Budget & Time Tracker</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 border rounded-lg p-4">
            <h3 className="font-semibold mb-3">Pre-Launch (Months 1-3):</h3>
            <ul className="text-sm space-y-2">
              <li>ChatGPT Plus: $20/month × 3 = <strong>$60</strong></li>
              <li>Google Search Console: <strong>FREE</strong></li>
              <li>Google Analytics: <strong>FREE</strong></li>
              <li>Ubersuggest: <strong>FREE</strong> (limited)</li>
            </ul>
            <p className="mt-4 font-bold text-lg">Total: $60</p>
          </div>

          <div className="bg-green-50 border rounded-lg p-4">
            <h3 className="font-semibold mb-3">Time Investment:</h3>
            <ul className="text-sm space-y-2">
              <li>Week 1: <strong>4 hours</strong></li>
              <li>Weeks 2-12: <strong>3-4 hours/week</strong></li>
              <li>Total: <strong>~40-50 hours</strong> over 3 months</li>
            </ul>
            <p className="mt-4 text-sm text-gray-600">Can reduce or delegate as site grows</p>
          </div>
        </div>
      </section>

      <section className="mb-12 print:break-before-page">
        <h2 className="text-2xl font-bold mb-4 text-orange-600">⚡ Quick Wins (Do These First)</h2>
        
        <div className="space-y-4">
          <div className="border-l-4 border-orange-500 pl-4">
            <h3 className="font-semibold">1. Add schema markup to village pages (1-2 hrs each)</h3>
            <p className="text-sm">Use generator: https://technicalseo.com/tools/schema-markup-generator/</p>
            <p className="text-sm">LocalBusiness + AggregateRating schemas</p>
          </div>

          <div className="border-l-4 border-orange-500 pl-4">
            <h3 className="font-semibold">2. Fix site speed</h3>
            <ul className="text-sm space-y-1">
              <li>• Compress images</li>
              <li>• Enable caching</li>
              <li>• Minify CSS/JS</li>
              <li>• Check: https://pagespeed.web.dev</li>
            </ul>
          </div>

          <div className="border-l-4 border-orange-500 pl-4">
            <h3 className="font-semibold">3. Create location pages for 8 states</h3>
            <p className="text-sm">Each ranks for "[state] retirement villages"</p>
            <p className="text-sm">Use AI to write in 30 mins each</p>
          </div>

          <div className="border-l-4 border-orange-500 pl-4">
            <h3 className="font-semibold">4. Add FAQ sections to blog posts</h3>
            <p className="text-sm">Answers rank in featured snippets</p>
            <p className="text-sm">Use FAQ schema</p>
          </div>

          <div className="border-l-4 border-orange-500 pl-4">
            <h3 className="font-semibold">5. Internal linking</h3>
            <ul className="text-sm space-y-1">
              <li>• Link blog posts to village pages</li>
              <li>• Link village pages to each other</li>
              <li>• 3-5 links per page</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4 text-red-600">🚨 Common Mistakes to Avoid</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-red-50 border-l-4 border-red-600 p-4">
            <h3 className="font-bold mb-3">❌ Don't Do:</h3>
            <ul className="text-sm space-y-1">
              <li>• Waiting until launch to start SEO</li>
              <li>• Copying competitor content</li>
              <li>• Ignoring technical SEO</li>
              <li>• No schema markup</li>
              <li>• Duplicate meta descriptions</li>
              <li>• Keyword stuffing</li>
              <li>• Slow site speed</li>
              <li>• Not tracking results</li>
              <li>• Giving up after 1 month</li>
            </ul>
          </div>

          <div className="bg-green-50 border-l-4 border-green-600 p-4">
            <h3 className="font-bold mb-3">✅ Do Instead:</h3>
            <ul className="text-sm space-y-1">
              <li>• Start 3 months before launch</li>
              <li>• Create unique, valuable content</li>
              <li>• Fix technical issues first</li>
              <li>• Add schema markup everywhere</li>
              <li>• Unique meta data for every page</li>
              <li>• Use keywords naturally</li>
              <li>• Optimize for speed</li>
              <li>• Track everything in GSC</li>
              <li>• Stay consistent for 12 months</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4 text-green-600">🎯 Success Metrics</h2>
        
        <div className="space-y-4">
          <div className="bg-blue-50 border rounded-lg p-4">
            <h3 className="font-bold mb-2">Month 3 (Launch Day):</h3>
            <ul className="text-sm space-y-1">
              <li>✅ 2,569 pages indexed</li>
              <li>✅ 12 blog posts published</li>
              <li>✅ Ranking for 20-50 keywords</li>
              <li>✅ <strong>5-20 visitors/day</strong></li>
            </ul>
          </div>

          <div className="bg-green-50 border rounded-lg p-4">
            <h3 className="font-bold mb-2">Month 6:</h3>
            <ul className="text-sm space-y-1">
              <li>✅ Ranking on Page 1 for 10+ keywords</li>
              <li>✅ <strong>50-100 visitors/day</strong></li>
              <li>✅ 5-10 leads/week</li>
            </ul>
          </div>

          <div className="bg-yellow-50 border rounded-lg p-4">
            <h3 className="font-bold mb-2">Month 12:</h3>
            <ul className="text-sm space-y-1">
              <li>✅ Ranking on Page 1 for 50+ keywords</li>
              <li>✅ <strong>300-500 visitors/day</strong></li>
              <li>✅ 30-50 leads/week</li>
              <li>✅ <strong>$40,000-60,000 revenue from organic</strong></li>
            </ul>
          </div>
        </div>
      </section>

      <div className="bg-blue-50 border-2 border-blue-600 rounded-lg p-6 mb-8">
        <p className="text-center font-bold text-xl mb-2">⏰ START RIGHT NOW</p>
        <p className="text-center text-gray-700 mb-4">
          3 months from now, you'll wish you started today. So start today.
        </p>
        <p className="text-center text-sm italic">"The best time to plant a tree was 20 years ago. The second best time is now."</p>
      </div>

      <div className="text-center text-sm text-gray-500 mt-12 pt-6 border-t">
        <p className="font-semibold">RetirePath SEO Quick Start Checklist</p>
        <p>Aim for 3-4 hours per week for the next 3 months</p>
        <p>By launch day, you'll be 6 months ahead of competitors!</p>
      </div>
    </div>
  );
}
