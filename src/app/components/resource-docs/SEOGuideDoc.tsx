import React from 'react';

export function SEOGuideDocument() {
  return (
    <div className="prose max-w-none">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">RetirePath</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">SEO vs. AOE Strategy Guide</h2>
        <p className="text-lg text-gray-600">Why SEO Can't Be Rushed (But You Should Start NOW)</p>
        <p className="text-sm text-gray-500 mt-2">Last Updated: January 24, 2026</p>
      </div>

      <hr className="my-8" />

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4 text-red-600">⏰ The SEO Timeline Problem</h2>
        
        <div className="bg-red-50 border-l-4 border-red-600 p-6 mb-6">
          <p className="font-bold text-lg mb-3">SEO is the ONLY marketing channel you can't rush with money</p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-semibold mb-2">You CAN Rush:</p>
              <ul className="space-y-1">
                <li>✅ Ads → Instant traffic (if you pay)</li>
                <li>✅ Email → Instant (if you have a list)</li>
                <li>✅ Social → Immediate (with followers)</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold mb-2">You CANNOT Rush:</p>
              <ul className="space-y-1">
                <li>❌ SEO → REQUIRES TIME ⏰</li>
                <li>❌ Domain authority → 12-24 months</li>
                <li>❌ Content aging → 3-6 months</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-gray-100 rounded-lg p-6">
          <h3 className="font-bold mb-3">How Long SEO Actually Takes:</h3>
          <table className="w-full text-sm">
            <thead className="bg-gray-200">
              <tr>
                <th className="text-left p-2">Action</th>
                <th className="text-left p-2">Time Required</th>
                <th className="p-2">Rushable?</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="p-2">Google discovers new site</td>
                <td className="p-2">1-2 weeks</td>
                <td className="p-2 text-center">⏰</td>
              </tr>
              <tr className="border-b">
                <td className="p-2">Google indexes pages</td>
                <td className="p-2">2-4 weeks</td>
                <td className="p-2 text-center">⏰</td>
              </tr>
              <tr className="border-b">
                <td className="p-2">Content "ages" (ranking factor)</td>
                <td className="p-2">3-6 months</td>
                <td className="p-2 text-center">⏰</td>
              </tr>
              <tr className="border-b">
                <td className="p-2">Rank on Page 1 (competitive)</td>
                <td className="p-2">6-12 months</td>
                <td className="p-2 text-center">⏰</td>
              </tr>
              <tr>
                <td className="p-2 font-semibold">Build domain authority</td>
                <td className="p-2 font-semibold">12-24 months</td>
                <td className="p-2 text-center">⏰</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-12 print:break-before-page">
        <h2 className="text-2xl font-bold mb-4 text-green-600">✅ The Compound Effect: Start NOW vs. Wait</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border-2 border-green-500 rounded-lg p-6 bg-green-50">
            <h3 className="font-bold text-lg mb-4 text-green-800">Scenario A: Start SEO NOW (3 months before launch)</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-semibold">Month 0 (Today):</p>
                <p>Set up tracking, start content</p>
              </div>
              <div>
                <p className="font-semibold">Month 1:</p>
                <p>Google discovers site, indexes pages</p>
              </div>
              <div>
                <p className="font-semibold">Month 2:</p>
                <p>Content ages, early rankings appear</p>
              </div>
              <div className="bg-green-100 p-3 rounded">
                <p className="font-semibold">Month 3 (Launch Day):</p>
                <ul className="mt-2 space-y-1">
                  <li>✅ 2,569 pages indexed</li>
                  <li>✅ 12 blog posts published</li>
                  <li>✅ Ranking for 20-50 keywords</li>
                  <li>✅ 5-20 organic visitors/day from DAY 1</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold">Month 6:</p>
                <p>✅ 50-100 visitors/day</p>
              </div>
              <div>
                <p className="font-semibold">Month 12:</p>
                <p className="text-lg font-bold text-green-700">✅ 200-500 visitors/day</p>
              </div>
            </div>
          </div>

          <div className="border-2 border-red-500 rounded-lg p-6 bg-red-50">
            <h3 className="font-bold text-lg mb-4 text-red-800">Scenario B: Wait Until Launch</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-semibold">Month 0 (Launch):</p>
                <p>Site goes live, start SEO</p>
              </div>
              <div>
                <p className="font-semibold">Month 1:</p>
                <p>Google discovers site</p>
              </div>
              <div>
                <p className="font-semibold">Month 2:</p>
                <p>Pages start indexing</p>
              </div>
              <div className="bg-red-100 p-3 rounded">
                <p className="font-semibold">Month 3:</p>
                <ul className="mt-2 space-y-1">
                  <li>❌ Still minimal traffic (5-20 visitors/day)</li>
                  <li>❌ Behind Scenario A by 3 months</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold">Month 6:</p>
                <p>❌ Just reaching where Scenario A was on Day 1</p>
              </div>
              <div>
                <p className="font-semibold">Month 12:</p>
                <p className="text-lg font-bold text-red-700">❌ 6 months behind competitors</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-blue-50 border-l-4 border-blue-600 p-6">
          <h3 className="font-bold mb-2">The Math:</h3>
          <ul className="space-y-1">
            <li><strong>Head start:</strong> 6 months advantage</li>
            <li><strong>Extra visitors in Year 1:</strong> 10,000-20,000</li>
            <li><strong>Cost to start early:</strong> $60 + 36 hours of work</li>
            <li className="text-lg font-bold text-blue-700 mt-3">ROI: Massive ✅</li>
          </ul>
        </div>
      </section>

      <section className="mb-12 print:break-before-page">
        <h2 className="text-2xl font-bold mb-4 text-purple-600">📅 3-Month Pre-Launch Roadmap</h2>
        
        <div className="space-y-6">
          <div className="border-l-4 border-blue-500 pl-6 py-2">
            <h3 className="font-bold text-lg mb-3">Week 1: Technical Setup (3 hours)</h3>
            <ul className="text-sm space-y-2">
              <li>□ Set up Google Search Console (30 mins)</li>
              <li>□ Set up Google Analytics 4 (30 mins)</li>
              <li>□ Technical SEO audit - mobile, speed, HTTPS (2 hrs)</li>
            </ul>
          </div>

          <div className="border-l-4 border-green-500 pl-6 py-2">
            <h3 className="font-bold text-lg mb-3">Week 2: Keyword Research (4 hours)</h3>
            <ul className="text-sm space-y-2">
              <li>□ Use ChatGPT to generate 100+ keywords</li>
              <li>□ Validate with Ubersuggest (free)</li>
              <li>□ Identify 20 "quick win" keywords</li>
              <li>□ Map keywords to pages</li>
            </ul>
          </div>

          <div className="border-l-4 border-yellow-500 pl-6 py-2">
            <h3 className="font-bold text-lg mb-3">Week 3: Core Pages Content (4-5 hours)</h3>
            <ul className="text-sm space-y-2">
              <li>□ Homepage (500-700 words)</li>
              <li>□ About/How It Works (400-600 words)</li>
              <li>□ Village Directory intro (300-400 words)</li>
              <li>□ Contract Review tool page (500-700 words)</li>
              <li>□ Home Valuation tool page (400-600 words)</li>
            </ul>
          </div>

          <div className="border-l-4 border-orange-500 pl-6 py-2">
            <h3 className="font-bold text-lg mb-3">Week 4: First Blog Posts (3.5 hours)</h3>
            <ul className="text-sm space-y-2">
              <li>□ "Complete Guide to Retirement Villages in Australia" (2,500 words)</li>
              <li>□ "Retirement Village Costs Explained" (1,500 words)</li>
            </ul>
          </div>

          <div className="border-l-4 border-red-500 pl-6 py-2">
            <h3 className="font-bold text-lg mb-3">Months 2-3: Consistency (Weekly Routine)</h3>
            <p className="text-sm mb-2"><strong>Every Week (3-4 hours):</strong></p>
            <ul className="text-sm space-y-2">
              <li>□ Monday: Write 1 blog post (1-2 hrs)</li>
              <li>□ Wednesday: Optimize 50-100 village pages (1-2 hrs)</li>
              <li>□ Friday: Check Google Search Console, fix errors (30 mins)</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 bg-green-50 border-2 border-green-600 rounded-lg p-6">
          <h3 className="font-bold text-lg mb-3">By Launch Day (Month 3), You'll Have:</h3>
          <div className="grid grid-cols-2 gap-4">
            <ul className="text-sm space-y-1">
              <li>✅ 12 blog posts published</li>
              <li>✅ 2,569 village pages optimized</li>
              <li>✅ 8 location pages (all states)</li>
              <li>✅ Full schema markup</li>
            </ul>
            <ul className="text-sm space-y-1">
              <li>✅ Google indexing all pages</li>
              <li>✅ Ranking for 20-50 keywords</li>
              <li>✅ Organic traffic from Day 1!</li>
              <li>✅ 6-month head start on competitors</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mb-12 print:break-before-page">
        <h2 className="text-2xl font-bold mb-4 text-blue-600">🎯 Expected Results & Timeline</h2>
        
        <div className="space-y-4">
          <div className="bg-blue-50 border rounded-lg p-4">
            <h3 className="font-bold mb-2">Month 3 (Launch Day):</h3>
            <ul className="text-sm space-y-1">
              <li>• 2,569 pages indexed</li>
              <li>• 12 blog posts published</li>
              <li>• Ranking for 20-50 keywords</li>
              <li>• <strong>5-20 visitors/day</strong></li>
            </ul>
          </div>

          <div className="bg-green-50 border rounded-lg p-4">
            <h3 className="font-bold mb-2">Month 6:</h3>
            <ul className="text-sm space-y-1">
              <li>• Ranking on Page 1 for 10+ keywords</li>
              <li>• <strong>50-100 visitors/day</strong></li>
              <li>• 5-10 leads/week from organic</li>
            </ul>
          </div>

          <div className="bg-yellow-50 border rounded-lg p-4">
            <h3 className="font-bold mb-2">Month 12:</h3>
            <ul className="text-sm space-y-1">
              <li>• Ranking on Page 1 for 50+ keywords</li>
              <li>• <strong>300-500 visitors/day</strong></li>
              <li>• 30-50 leads/week</li>
              <li>• <strong>$40,000-60,000 revenue from organic</strong></li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4 text-orange-600">💰 Budget & Tools</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border rounded-lg p-4">
            <h3 className="font-bold mb-3">Pre-Launch (Months 1-3):</h3>
            <ul className="text-sm space-y-2">
              <li>ChatGPT Plus: $20/month × 3 = <strong>$60</strong></li>
              <li>Google Search Console: <strong>FREE</strong></li>
              <li>Google Analytics: <strong>FREE</strong></li>
              <li>Ubersuggest: <strong>FREE</strong> (limited)</li>
            </ul>
            <p className="mt-4 font-bold text-lg">Total: $60</p>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="font-bold mb-3">Post-Launch (Month 4+):</h3>
            <ul className="text-sm space-y-2">
              <li>ChatGPT Plus: $20/month</li>
              <li>Ahrefs Lite: $99/month (optional)</li>
              <li>Surfer SEO: $89/month (optional)</li>
            </ul>
            <p className="mt-4 font-bold text-lg">Total: $20-208/month</p>
          </div>
        </div>

        <div className="mt-6 bg-purple-50 border-l-4 border-purple-600 p-6">
          <h3 className="font-bold mb-3">Time Investment:</h3>
          <ul className="text-sm space-y-2">
            <li><strong>Week 1:</strong> 4 hours (setup)</li>
            <li><strong>Weeks 2-12:</strong> 3-4 hours/week (content creation)</li>
            <li><strong>Total Pre-Launch:</strong> ~40-50 hours over 3 months</li>
            <li><strong>Post-Launch:</strong> 4-6 hours/week (can delegate later)</li>
          </ul>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4 text-red-600">🚨 Common Mistakes to Avoid</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-red-50 border-l-4 border-red-600 p-4">
            <h3 className="font-bold mb-3">❌ Don't Do:</h3>
            <ul className="text-sm space-y-1">
              <li>• Wait until launch to start SEO</li>
              <li>• Copy competitor content</li>
              <li>• Ignore technical SEO</li>
              <li>• Skip schema markup</li>
              <li>• Use duplicate meta descriptions</li>
              <li>• Keyword stuffing</li>
              <li>• Ignore site speed</li>
              <li>• Give up after 1 month</li>
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
              <li>• Stay consistent for 12 months</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4 text-green-600">🎬 START RIGHT NOW</h2>
        
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-8 border-2 border-green-600">
          <h3 className="font-bold text-xl mb-4">Your Next 30 Minutes:</h3>
          <ol className="space-y-3 text-sm">
            <li className="flex items-start gap-3">
              <span className="font-bold bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">1</span>
              <span><strong>Minutes 0-5:</strong> Sign up for Google Search Console</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="font-bold bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">2</span>
              <span><strong>Minutes 5-10:</strong> Sign up for Google Analytics</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="font-bold bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">3</span>
              <span><strong>Minutes 10-15:</strong> Sign up for ChatGPT Plus</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="font-bold bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">4</span>
              <span><strong>Minutes 15-30:</strong> Generate 100 keywords with ChatGPT</span>
            </li>
          </ol>
          
          <p className="mt-6 text-center font-bold text-lg text-green-700">Done! You're on your way to SEO success. ✅</p>
        </div>
      </section>

      <div className="bg-blue-50 border-2 border-blue-600 rounded-lg p-6 mb-8">
        <p className="text-center italic text-lg mb-2">"The best time to plant a tree was 20 years ago. The second best time is now."</p>
        <p className="text-center text-sm text-gray-700">The same is true for SEO. Start today.</p>
      </div>

      <div className="text-center text-sm text-gray-500 mt-12 pt-6 border-t">
        <p className="font-semibold">RetirePath SEO Strategy Guide</p>
        <p>Start 3 months before launch for maximum impact</p>
      </div>
    </div>
  );
}
