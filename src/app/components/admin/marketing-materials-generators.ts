// Week 2 Material Generators

export function generateUltimateGuide(): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>The Ultimate Retirement Village Guide - RetirePath</title>
  <style>
    body {
      font-family: Georgia, serif;
      max-width: 800px;
      margin: 30px auto;
      padding: 40px;
      line-height: 1.7;
      color: #1a1a1a;
    }
    .cover {
      background: linear-gradient(135deg, #2D6A4F 0%, #1B4332 100%);
      color: white;
      padding: 80px 60px;
      border-radius: 15px;
      text-align: center;
      margin-bottom: 50px;
    }
    .cover h1 {
      font-size: 42px;
      margin: 0 0 20px 0;
      font-weight: normal;
    }
    .cover .subtitle {
      font-size: 20px;
      opacity: 0.9;
      margin-bottom: 30px;
    }
    h2 {
      color: #2D6A4F;
      font-size: 28px;
      margin-top: 50px;
      margin-bottom: 20px;
      border-bottom: 3px solid #2D6A4F;
      padding-bottom: 10px;
    }
    h3 {
      color: #1B4332;
      font-size: 22px;
      margin-top: 30px;
      margin-bottom: 15px;
    }
    p {
      margin: 15px 0;
      font-size: 15px;
    }
    .intro-box {
      background: #F0FDF4;
      border-left: 5px solid #52B788;
      padding: 25px;
      margin: 30px 0;
      border-radius: 8px;
      font-style: italic;
    }
    .tip-box {
      background: #FFF7ED;
      border-left: 5px solid #F59E0B;
      padding: 20px;
      margin: 25px 0;
      border-radius: 8px;
    }
    .warning-box {
      background: #FEF2F2;
      border-left: 5px solid #EF4444;
      padding: 20px;
      margin: 25px 0;
      border-radius: 8px;
    }
    ul, ol {
      margin: 15px 0;
      padding-left: 30px;
    }
    li {
      margin: 10px 0;
    }
    .footer {
      text-align: center;
      padding: 30px;
      margin-top: 60px;
      border-top: 2px solid #E5E7EB;
      color: #666;
      font-size: 14px;
    }
    @media print {
      body { margin: 20px; padding: 20px; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="cover">
    <h1>📖 The Ultimate Retirement Village Guide</h1>
    <p class="subtitle">Everything You Need to Know About Choosing and Moving to a Retirement Village in Australia</p>
  </div>

  <div class="intro-box">
    <p><strong>Moving to a retirement village is one of the most significant decisions you'll make.</strong></p>
    <p style="margin-top: 15px;">This comprehensive 15-page guide covers understanding contracts, DMF structures, choosing the right village, planning your transition, and avoiding common pitfalls.</p>
  </div>

  <h2>Chapter 1: What is a Retirement Village?</h2>
  <p>A retirement village is a purpose-built residential development for people over 55 offering independent living units with shared amenities and social activities.</p>

  <h3>Key Characteristics:</h3>
  <ul>
    <li>Self-contained units (apartments, villas, cottages)</li>
    <li>Communal facilities (pools, gyms, libraries, workshops)</li>
    <li>Social community with organized activities</li>
    <li>Maintenance-free living</li>
    <li>24/7 emergency call systems</li>
  </ul>

  <h2>Chapter 2: Understanding the Costs</h2>
  <h3>1. Entry Contribution (Ingoing Cost)</h3>
  <p>Upfront amount ranging from $150,000 to $1,500,000+ depending on location, size, and amenities.</p>

  <h3>2. Monthly Fees</h3>
  <p>Recurring fees ($300-$1,500/month) covering maintenance, water, insurance, and facility upkeep.</p>

  <h3>3. Deferred Management Fee (DMF)</h3>
  <p>Fee paid to the operator when you leave, typically 20-40% of sale price. This is the most complex and important cost to understand.</p>

  <div class="warning-box">
    <h4>⚠️ Critical Questions to Ask:</h4>
    <ul>
      <li>What is the DMF percentage and is it capped?</li>
      <li>How are capital gains shared?</li>
      <li>Who pays for refurbishment when I leave?</li>
      <li>How long until I receive my refund?</li>
    </ul>
  </div>

  <h2>Chapter 3: Types of Contracts</h2>
  <ul>
    <li><strong>Licence to Occupy:</strong> Most common, you don't own the unit</li>
    <li><strong>Lease Agreement:</strong> Fixed term lease (e.g., 99 years)</li>
    <li><strong>Freehold/Strata Title:</strong> Full ownership, higher entry cost, no DMF</li>
  </ul>

  <h2>Chapter 4: Choosing the Right Village</h2>
  <h3>Location Checklist:</h3>
  <ul>
    <li>Close to family and friends</li>
    <li>Near medical facilities</li>
    <li>Convenient to shopping and services</li>
    <li>Good public transport access</li>
  </ul>

  <h3>Amenities That Matter:</h3>
  <ul>
    <li>Pool, gym, tennis courts for active lifestyle</li>
    <li>Community center, library for social activities</li>
    <li>Restaurant or café for convenience</li>
    <li>Pet-friendly policy if you have pets</li>
  </ul>

  <h2>Chapter 5: Questions to Ask Before Signing</h2>
  <ol>
    <li>What is the total entry price and monthly fees?</li>
    <li>What is the DMF structure and cap?</li>
    <li>How are capital gains shared?</li>
    <li>Who pays for refurbishment when I leave?</li>
    <li>How long to receive refund after leaving?</li>
    <li>Can I make modifications to my unit?</li>
    <li>What happens if my health declines?</li>
    <li>Are pets allowed?</li>
  </ol>

  <h2>Chapter 6: Legal & Financial Review</h2>
  <div class="tip-box">
    <h4>💡 This is Non-Negotiable</h4>
    <p>Engage a solicitor who specializes in retirement village law. Expect to pay $1,000-$2,500 for legal and financial advice—a tiny fraction of your entry contribution that could save you tens of thousands.</p>
  </div>

  <h2>Chapter 7: Planning Your Transition</h2>
  <h3>12 Months Before:</h3>
  <ul>
    <li>Start researching villages</li>
    <li>Attend open days and tours</li>
    <li>Get property valuation on current home</li>
  </ul>

  <h3>6 Months Before:</h3>
  <ul>
    <li>Make village selection</li>
    <li>Complete legal reviews</li>
    <li>List home for sale</li>
    <li>Start serious downsizing</li>
  </ul>

  <h3>1 Month Before:</h3>
  <ul>
    <li>Pack belongings</li>
    <li>Arrange farewell gatherings</li>
    <li>Transfer medical records</li>
  </ul>

  <h2>Chapter 8: Red Flags to Watch For</h2>
  <div class="warning-box">
    <h4>🚩 Warning Signs:</h4>
    <ul>
      <li>High-pressure sales tactics</li>
      <li>Unclear fee structures</li>
      <li>Uncapped DMF</li>
      <li>Poor maintenance of facilities</li>
      <li>Unhappy current residents</li>
      <li>Operator won't provide contract for legal review</li>
    </ul>
  </div>

  <h2>Conclusion</h2>
  <p>Moving to a retirement village is a significant life transition, but with proper research, professional advice, and careful planning, it can be one of the best decisions you make.</p>

  <div class="intro-box" style="margin-top: 40px;">
    <p><strong>Need help comparing villages and understanding contracts?</strong></p>
    <p style="margin-top: 15px;">Visit <strong>www.retirepath.com.au</strong> to access our Village Matcher, Contract Review Tool, and comprehensive platform.</p>
  </div>

  <div class="footer">
    <p><strong>RetirePath</strong> - Your retirement village transition guide</p>
    <p>www.retirepath.com.au | drew@retirepath.com.au | 0422 208 230</p>
  </div>

  <div class="no-print" style="text-align: center; margin: 40px 0;">
    <button onclick="window.print()" style="background: #2D6A4F; color: white; padding: 15px 40px; border: none; border-radius: 8px; font-size: 16px; cursor: pointer; font-weight: bold;">
      Print or Save as PDF
    </button>
  </div>
</body>
</html>`;
}

export function generateMediaKit(): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>RetirePath Media Kit 2024</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 900px;
      margin: 40px auto;
      padding: 40px;
      line-height: 1.6;
      color: #333;
    }
    .header {
      background: linear-gradient(135deg, #2D6A4F 0%, #1B4332 100%);
      color: white;
      padding: 60px;
      border-radius: 15px;
      text-align: center;
      margin-bottom: 40px;
    }
    h2 {
      color: #2D6A4F;
      border-bottom: 3px solid #2D6A4F;
      padding-bottom: 10px;
      margin-top: 50px;
      margin-bottom: 20px;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      margin: 30px 0;
    }
    .stat-box {
      background: #F0FDF4;
      border: 2px solid #52B788;
      border-radius: 10px;
      padding: 25px;
      text-align: center;
    }
    .stat-number {
      font-size: 32px;
      font-weight: bold;
      color: #2D6A4F;
    }
    ul {
      padding-left: 30px;
    }
    li {
      margin: 10px 0;
    }
    .footer {
      text-align: center;
      padding: 30px;
      margin-top: 60px;
      border-top: 2px solid #E5E7EB;
      color: #666;
      font-size: 14px;
    }
    @media print {
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>📰 RetirePath Media Kit</h1>
    <p style="font-size: 20px;">Australia's Leading Retirement Village Platform</p>
  </div>

  <h2>About RetirePath</h2>
  <p>RetirePath is Australia's comprehensive digital platform helping retirees transition to retirement villages through intelligent matching, contract analysis, and expert guidance.</p>

  <h2>Platform Statistics</h2>
  <div class="stats-grid">
    <div class="stat-box">
      <div class="stat-number">2,355+</div>
      <p>Villages Listed</p>
    </div>
    <div class="stat-box">
      <div class="stat-number">87+</div>
      <p>Operators</p>
    </div>
    <div class="stat-box">
      <div class="stat-number">100%</div>
      <p>Free to List</p>
    </div>
    <div class="stat-box">
      <div class="stat-number">7</div>
      <p>Core Tools</p>
    </div>
  </div>

  <h2>Key Features</h2>
  <ul>
    <li><strong>Village Matcher:</strong> Intelligent algorithm matching retirees with suitable villages</li>
    <li><strong>Contract Review Tool:</strong> Plain-English contract analysis and DMF calculations</li>
    <li><strong>Home Valuation Engine:</strong> Instant property valuations</li>
    <li><strong>Public Village Directory:</strong> Searchable database with maps and reviews</li>
  </ul>

  <h2>Media Contact</h2>
  <p><strong>Drew Smith</strong> - Founder & CEO</p>
  <p>Email: drew@retirepath.com.au</p>
  <p>Phone: 0422 208 230</p>
  <p>Website: www.retirepath.com.au</p>

  <div class="footer">
    <p><strong>RetirePath</strong> - Your retirement village transition guide</p>
    <p>www.retirepath.com.au</p>
  </div>

  <div class="no-print" style="text-align: center; margin: 40px 0;">
    <button onclick="window.print()" style="background: #2D6A4F; color: white; padding: 15px 40px; border: none; border-radius: 8px; cursor: pointer;">
      Print or Save as PDF
    </button>
  </div>
</body>
</html>`;
}

export function generatePitchDeck(): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>RetirePath Pitch Deck 2024</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
      color: #1a1a1a;
    }
    .slide {
      width: 100%;
      max-width: 1000px;
      margin: 0 auto 40px auto;
      min-height: 600px;
      padding: 60px;
      box-sizing: border-box;
      page-break-after: always;
      border: 2px solid #E5E7EB;
      border-radius: 15px;
      background: white;
    }
    .slide.cover {
      background: linear-gradient(135deg, #2D6A4F 0%, #1B4332 100%);
      color: white;
      display: flex;
      flex-direction: column;
      justify-content: center;
      text-align: center;
    }
    h1 {
      color: #2D6A4F;
      font-size: 42px;
      margin: 0 0 30px 0;
    }
    h2 {
      color: #1B4332;
      font-size: 28px;
      margin: 30px 0 20px 0;
    }
    ul {
      font-size: 18px;
      line-height: 1.8;
      padding-left: 30px;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      margin: 30px 0;
    }
    .stat-box {
      background: #F0FDF4;
      border: 3px solid #52B788;
      border-radius: 12px;
      padding: 25px;
      text-align: center;
    }
    .stat-number {
      font-size: 42px;
      font-weight: bold;
      color: #2D6A4F;
    }
    @media print {
      .slide { page-break-after: always; margin: 0; border: none; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>

  <!-- Slide 1: Cover -->
  <div class="slide cover">
    <h1 style="color: white;">🏡 RetirePath</h1>
    <p style="font-size: 28px;">Australia's Retirement Village Platform</p>
    <p style="font-size: 16px; margin-top: 60px;">Drew Smith, Founder & CEO | December 2024</p>
  </div>

  <!-- Slide 2: The Problem -->
  <div class="slide">
    <h1>The Problem</h1>
    <ul>
      <li><strong>Information Asymmetry:</strong> Complex contracts favor operators</li>
      <li><strong>Fragmented Listings:</strong> No single source to compare villages</li>
      <li><strong>Financial Uncertainty:</strong> Retirees don't know if they can afford entry</li>
      <li><strong>Time-Consuming:</strong> Months of research and legal review</li>
      <li><strong>Emotional Burden:</strong> Major life decision with limited support</li>
    </ul>
  </div>

  <!-- Slide 3: The Market -->
  <div class="slide">
    <h1>The Market Opportunity</h1>
    <div class="stats-grid">
      <div class="stat-box">
        <div class="stat-number">4.2M</div>
        <p>Australians Aged 65+</p>
      </div>
      <div class="stat-box">
        <div class="stat-number">184K</div>
        <p>Village Residents</p>
      </div>
      <div class="stat-box">
        <div class="stat-number">2,000+</div>
        <p>Villages</p>
      </div>
      <div class="stat-box">
        <div class="stat-number">$25B+</div>
        <p>Market Value</p>
      </div>
    </div>
  </div>

  <!-- Slide 4: The Solution -->
  <div class="slide">
    <h1>The Solution: RetirePath</h1>
    <h2>Core Features:</h2>
    <ul>
      <li><strong>Village Matcher:</strong> Intelligent matching algorithm</li>
      <li><strong>Contract Review:</strong> Plain-English analysis</li>
      <li><strong>Home Valuation:</strong> Instant property estimates</li>
      <li><strong>Progress Tracker:</strong> Transition planning</li>
      <li><strong>Public Directory:</strong> 2,355+ villages nationwide</li>
    </ul>
  </div>

  <!-- Slide 5: Traction -->
  <div class="slide">
    <h1>Traction & Milestones</h1>
    <div class="stats-grid">
      <div class="stat-box">
        <div class="stat-number">2,355+</div>
        <p>Villages Listed</p>
      </div>
      <div class="stat-box">
        <div class="stat-number">87+</div>
        <p>Operators</p>
      </div>
      <div class="stat-box">
        <div class="stat-number">100%</div>
        <p>National Coverage</p>
      </div>
      <div class="stat-box">
        <div class="stat-number">7</div>
        <p>Tools Launched</p>
      </div>
    </div>
  </div>

  <!-- Slide 6: Revenue Model -->
  <div class="slide">
    <h1>Revenue Model</h1>
    <h2>B2C Subscriptions:</h2>
    <ul>
      <li><strong>Free:</strong> Basic village search</li>
      <li><strong>Explorer ($49):</strong> Village Matcher + guides</li>
      <li><strong>Navigator ($99):</strong> Full platform access</li>
    </ul>
    <h2 style="margin-top: 40px;">B2B Lead Generation:</h2>
    <ul>
      <li>Real estate agents pay for qualified downsizing leads</li>
    </ul>
  </div>

  <!-- Slide 7: The Ask -->
  <div class="slide">
    <h1>The Ask</h1>
    <h2>Seeking: $100K-$300K Seed Funding</h2>
    <h2>Use of Funds:</h2>
    <ul>
      <li>40% Marketing & Acquisition</li>
      <li>30% Product Development</li>
      <li>20% Team Expansion</li>
      <li>10% Operations</li>
    </ul>
  </div>

  <!-- Slide 8: Contact -->
  <div class="slide">
    <div style="text-align: center; padding-top: 100px;">
      <h1>Let's Work Together</h1>
      <p style="font-size: 22px; margin: 40px 0;">Drew Smith - Founder & CEO</p>
      <p style="font-size: 18px;">📧 drew@retirepath.com.au</p>
      <p style="font-size: 18px;">📱 0422 208 230</p>
      <p style="font-size: 18px;">🌐 www.retirepath.com.au</p>
    </div>
  </div>

  <div class="no-print" style="text-align: center; margin: 40px 0;">
    <button onclick="window.print()" style="background: #2D6A4F; color: white; padding: 15px 40px; border: none; border-radius: 8px; cursor: pointer;">
      Print or Save as PDF
    </button>
  </div>
</body>
</html>`;
}

// Week 3 Material Generators

export function generateSocialTemplates(): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>RetirePath Social Media Template Pack</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 1200px;
      margin: 40px auto;
      padding: 40px;
      line-height: 1.6;
      color: #333;
    }
    .header {
      background: linear-gradient(135deg, #2D6A4F 0%, #1B4332 100%);
      color: white;
      padding: 40px;
      border-radius: 15px;
      text-align: center;
      margin-bottom: 40px;
    }
    h2 {
      color: #2D6A4F;
      border-bottom: 3px solid #2D6A4F;
      padding-bottom: 10px;
      margin-top: 40px;
      margin-bottom: 20px;
    }
    .template-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 30px;
      margin: 30px 0;
    }
    .template-card {
      background: white;
      border: 2px solid #E5E7EB;
      border-radius: 10px;
      padding: 25px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .template-card h3 {
      color: #2D6A4F;
      margin-top: 0;
      margin-bottom: 15px;
    }
    .template-content {
      background: #F9FAFB;
      border-left: 4px solid #52B788;
      padding: 15px;
      margin: 15px 0;
      border-radius: 5px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      font-size: 14px;
      line-height: 1.5;
    }
    .hashtags {
      color: #3B82F6;
      margin-top: 10px;
      font-size: 13px;
    }
    .platform-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 15px;
      font-size: 12px;
      font-weight: bold;
      margin-right: 8px;
    }
    .facebook {
      background: #1877F2;
      color: white;
    }
    .instagram {
      background: #E4405F;
      color: white;
    }
    .linkedin {
      background: #0A66C2;
      color: white;
    }
    .footer {
      text-align: center;
      padding: 30px;
      margin-top: 60px;
      border-top: 2px solid #E5E7EB;
      color: #666;
      font-size: 14px;
    }
    @media print {
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>📱 Social Media Template Pack</h1>
    <p style="font-size: 18px; margin-top: 15px;">20 Ready-to-Use Posts for RetirePath</p>
  </div>

  <p style="font-size: 16px; margin-bottom: 30px;"><strong>How to use:</strong> Copy the text, customize with your details, and post to your social channels. Images are suggested—use Canva or similar tools to create visuals with RetirePath branding (colors: #2D6A4F, #52B788).</p>

  <h2>🎯 Awareness & Education Posts</h2>
  <div class="template-grid">
    
    <div class="template-card">
      <h3>Post #1: Problem Awareness</h3>
      <span class="platform-badge facebook">Facebook</span>
      <span class="platform-badge instagram">Instagram</span>
      <div class="template-content">
        <p>📊 Did you know? 70% of retirees feel confused by retirement village contracts.</p>
        <p>Deferred Management Fees (DMF), exit costs, and complex legal terms make it hard to know what you're really paying.</p>
        <p>RetirePath translates contracts into plain English—so you can make confident decisions. 💚</p>
        <div class="hashtags">#RetirementVillage #RetirePath #Downsizing #SeniorsAustralia</div>
      </div>
    </div>

    <div class="template-card">
      <h3>Post #2: Platform Introduction</h3>
      <span class="platform-badge facebook">Facebook</span>
      <span class="platform-badge linkedin">LinkedIn</span>
      <div class="template-content">
        <p>🏡 Introducing RetirePath—Australia's first comprehensive retirement village platform.</p>
        <p>✓ Compare 2,355+ villages nationwide<br>
        ✓ Understand contracts & DMF fees<br>
        ✓ Value your home instantly<br>
        ✓ Plan your transition step-by-step</p>
        <p>Start your journey today: www.retirepath.com.au</p>
        <div class="hashtags">#RetirePath #RetirementVillage #AgedCare #Downsizing</div>
      </div>
    </div>

    <div class="template-card">
      <h3>Post #3: Statistics</h3>
      <span class="platform-badge instagram">Instagram</span>
      <span class="platform-badge facebook">Facebook</span>
      <div class="template-content">
        <p>📈 4.2 MILLION Australians are aged 65+</p>
        <p>📈 184,000 live in retirement villages</p>
        <p>📈 2,000+ villages across Australia</p>
        <p>Finding the RIGHT one shouldn't be overwhelming.</p>
        <p>RetirePath makes it simple. 💚</p>
        <div class="hashtags">#RetirementLiving #SeniorsAustralia #AgingInPlace</div>
      </div>
    </div>

    <div class="template-card">
      <h3>Post #4: DMF Explainer</h3>
      <span class="platform-badge facebook">Facebook</span>
      <span class="platform-badge linkedin">LinkedIn</span>
      <div class="template-content">
        <p>🤔 What is a Deferred Management Fee (DMF)?</p>
        <p>It's a fee paid to the village operator when you leave—typically 20-40% of the sale price.</p>
        <p>❓ Why does it exist?<br>
        ❓ Is it fair?<br>
        ❓ How can I calculate what I'll actually get back?</p>
        <p>RetirePath's Contract Review Tool answers all these questions in plain English.</p>
        <div class="hashtags">#DMF #RetirementVillage #ContractReview #RetirePath</div>
      </div>
    </div>

  </div>

  <h2>🎁 Lead Magnet Posts</h2>
  <div class="template-grid">

    <div class="template-card">
      <h3>Post #5: Free Checklist</h3>
      <span class="platform-badge facebook">Facebook</span>
      <span class="platform-badge instagram">Instagram</span>
      <div class="template-content">
        <p>📋 FREE DOWNLOAD: The Ultimate Retirement Village Checklist</p>
        <p>What to look for when visiting villages:<br>
        ✓ Location & accessibility<br>
        ✓ Amenities & activities<br>
        ✓ Financial transparency<br>
        ✓ Contract red flags</p>
        <p>Download your free checklist at www.retirepath.com.au</p>
        <div class="hashtags">#FreeDownload #RetirementVillage #Checklist</div>
      </div>
    </div>

    <div class="template-card">
      <h3>Post #6: Free Guide</h3>
      <span class="platform-badge facebook">Facebook</span>
      <span class="platform-badge linkedin">LinkedIn</span>
      <div class="template-content">
        <p>📖 NEW: The Ultimate Retirement Village Guide (15 pages, FREE)</p>
        <p>Everything you need to know about:<br>
        • Understanding costs & contracts<br>
        • Choosing the right village<br>
        • Planning your transition<br>
        • Avoiding common pitfalls</p>
        <p>Download free at www.retirepath.com.au</p>
        <div class="hashtags">#RetirementGuide #FreeResource #RetirePath</div>
      </div>
    </div>

  </div>

  <h2>💡 Tips & Advice Posts</h2>
  <div class="template-grid">

    <div class="template-card">
      <h3>Post #7: Downsizing Tip</h3>
      <span class="platform-badge facebook">Facebook</span>
      <span class="platform-badge instagram">Instagram</span>
      <div class="template-content">
        <p>🏠 Downsizing Tip: Start 12 months before your move</p>
        <p>Moving to a retirement village means letting go of belongings you've accumulated over decades.</p>
        <p>The 4-Box Method helps:<br>
        📦 Keep<br>
        💚 Donate<br>
        💰 Sell<br>
        🗑️ Trash</p>
        <p>Plan your transition at www.retirepath.com.au</p>
        <div class="hashtags">#Downsizing #DownsizingTips #RetirePath</div>
      </div>
    </div>

    <div class="template-card">
      <h3>Post #8: Questions to Ask</h3>
      <span class="platform-badge facebook">Facebook</span>
      <span class="platform-badge linkedin">LinkedIn</span>
      <div class="template-content">
        <p>❓ 5 Questions to Ask BEFORE Signing a Retirement Village Contract:</p>
        <p>1. What is the DMF percentage and is it capped?<br>
        2. How are capital gains shared?<br>
        3. Who pays for refurbishment when I leave?<br>
        4. How long until I receive my refund?<br>
        5. Can I have pets?</p>
        <p>Get all the answers at www.retirepath.com.au</p>
        <div class="hashtags">#ContractQuestions #RetirementVillage #RetirePath</div>
      </div>
    </div>

  </div>

  <h2>🎉 Success Stories & Testimonials</h2>
  <div class="template-grid">

    <div class="template-card">
      <h3>Post #9: User Success Story</h3>
      <span class="platform-badge facebook">Facebook</span>
      <span class="platform-badge instagram">Instagram</span>
      <div class="template-content">
        <p>💬 "RetirePath helped me compare 12 villages in my area and understand which contracts were truly fair. I saved months of research!" - Margaret, 72</p>
        <p>Start your journey: www.retirepath.com.au</p>
        <div class="hashtags">#Testimonial #RetirePath #HappyCustomer</div>
      </div>
    </div>

    <div class="template-card">
      <h3>Post #10: Platform Milestone</h3>
      <span class="platform-badge linkedin">LinkedIn</span>
      <span class="platform-badge facebook">Facebook</span>
      <div class="template-content">
        <p>🎉 MILESTONE: RetirePath now lists 2,355+ retirement villages across Australia!</p>
        <p>We've built the most comprehensive retirement village database in the country—100% free for operators to list, 100% transparent for retirees to search.</p>
        <p>Thank you for being part of our journey. 💚</p>
        <div class="hashtags">#Milestone #RetirePath #RetirementVillage</div>
      </div>
    </div>

  </div>

  <h2>🚀 Call-to-Action Posts</h2>
  <div class="template-grid">

    <div class="template-card">
      <h3>Post #11: Start Your Search</h3>
      <span class="platform-badge facebook">Facebook</span>
      <span class="platform-badge instagram">Instagram</span>
      <div class="template-content">
        <p>🏡 Ready to find your perfect retirement village?</p>
        <p>RetirePath helps you:<br>
        ✓ Search 2,355+ villages<br>
        ✓ Filter by location, budget, amenities<br>
        ✓ Read verified reviews<br>
        ✓ Book tours directly</p>
        <p>Start searching FREE: www.retirepath.com.au</p>
        <div class="hashtags">#RetirementVillage #VillageSearch #RetirePath</div>
      </div>
    </div>

    <div class="template-card">
      <h3>Post #12: Operator CTA</h3>
      <span class="platform-badge linkedin">LinkedIn</span>
      <span class="platform-badge facebook">Facebook</span>
      <div class="template-content">
        <p>🏢 Attention Retirement Village Operators:</p>
        <p>List your village on RetirePath—100% FREE, forever.</p>
        <p>✓ Reach qualified prospects<br>
        ✓ Receive direct tour bookings<br>
        ✓ Showcase your amenities<br>
        ✓ Build your online reputation</p>
        <p>List now: www.retirepath.com.au</p>
        <div class="hashtags">#RetirementVillageOperator #FreeListings #RetirePath</div>
      </div>
    </div>

  </div>

  <h2>📊 Educational Content</h2>
  <div class="template-grid">

    <div class="template-card">
      <h3>Post #13: Contract Types</h3>
      <span class="platform-badge facebook">Facebook</span>
      <span class="platform-badge linkedin">LinkedIn</span>
      <div class="template-content">
        <p>📝 Know the 3 main retirement village contract types:</p>
        <p>1️⃣ <strong>Licence to Occupy:</strong> You don't own, you pay DMF<br>
        2️⃣ <strong>Lease Agreement:</strong> Similar to licence, fixed term<br>
        3️⃣ <strong>Freehold/Strata:</strong> You OWN the unit, no DMF</p>
        <p>Which is right for you? Learn more at www.retirepath.com.au</p>
        <div class="hashtags">#ContractTypes #RetirementVillage #KnowYourRights</div>
      </div>
    </div>

    <div class="template-card">
      <h3>Post #14: Cost Breakdown</h3>
      <span class="platform-badge facebook">Facebook</span>
      <span class="platform-badge instagram">Instagram</span>
      <div class="template-content">
        <p>💰 Understanding Retirement Village Costs:</p>
        <p>1. <strong>Entry Contribution:</strong> $150K-$1.5M+ upfront<br>
        2. <strong>Monthly Fees:</strong> $300-$1,500/month<br>
        3. <strong>DMF:</strong> 20-40% when you leave</p>
        <p>Use RetirePath's calculator to model YOUR costs.</p>
        <div class="hashtags">#RetirementCosts #FinancialPlanning #RetirePath</div>
      </div>
    </div>

  </div>

  <h2>❤️ Emotional & Human Posts</h2>
  <div class="template-grid">

    <div class="template-card">
      <h3>Post #15: Family Perspective</h3>
      <span class="platform-badge facebook">Facebook</span>
      <span class="platform-badge instagram">Instagram</span>
      <div class="template-content">
        <p>👨‍👩‍👧‍👦 Helping your parents choose a retirement village?</p>
        <p>It's emotional. It's complex. You want to make sure they're safe, happy, and not being taken advantage of.</p>
        <p>RetirePath gives families the tools to make confident decisions together. 💚</p>
        <div class="hashtags">#FamilySupport #ElderlyCare #RetirePath</div>
      </div>
    </div>

    <div class="template-card">
      <h3>Post #16: Independence</h3>
      <span class="platform-badge facebook">Facebook</span>
      <span class="platform-badge instagram">Instagram</span>
      <div class="template-content">
        <p>🌟 Retirement villages aren't aged care facilities.</p>
        <p>They're independent living communities where you maintain your freedom, enjoy social activities, and have peace of mind knowing support is available if needed.</p>
        <p>Find your perfect fit: www.retirepath.com.au</p>
        <div class="hashtags">#IndependentLiving #RetirementVillage #AgingWell</div>
      </div>
    </div>

  </div>

  <h2>🎁 Seasonal & Timely Posts</h2>
  <div class="template-grid">

    <div class="template-card">
      <h3>Post #17: New Year Planning</h3>
      <span class="platform-badge facebook">Facebook</span>
      <span class="platform-badge instagram">Instagram</span>
      <div class="template-content">
        <p>🎊 2025 Resolution: Plan your retirement village move</p>
        <p>If you've been thinking about downsizing, this is your year.</p>
        <p>RetirePath makes it easy to:<br>
        ✓ Research villages<br>
        ✓ Compare contracts<br>
        ✓ Plan your timeline</p>
        <p>Start today: www.retirepath.com.au</p>
        <div class="hashtags">#NewYear #RetirementPlanning #2025Goals</div>
      </div>
    </div>

    <div class="template-card">
      <h3>Post #18: Spring Cleaning</h3>
      <span class="platform-badge facebook">Facebook</span>
      <span class="platform-badge instagram">Instagram</span>
      <div class="template-content">
        <p>🌸 Spring Cleaning? Perfect time to start downsizing!</p>
        <p>If you're planning a retirement village move in the next 12 months, use spring as motivation to declutter, donate, and simplify.</p>
        <p>RetirePath's Progress Tracker helps you stay on schedule. 💚</p>
        <div class="hashtags">#SpringCleaning #Downsizing #RetirePath</div>
      </div>
    </div>

  </div>

  <h2>📢 Engagement Posts</h2>
  <div class="template-grid">

    <div class="template-card">
      <h3>Post #19: Poll</h3>
      <span class="platform-badge facebook">Facebook</span>
      <span class="platform-badge instagram">Instagram</span>
      <div class="template-content">
        <p>🗳️ POLL: What's your #1 concern about retirement villages?</p>
        <p>A) Complex contracts & DMF fees<br>
        B) Finding the right location<br>
        C) Affording the entry price<br>
        D) Worried about social isolation</p>
        <p>Comment below! We're listening. 💚</p>
        <div class="hashtags">#Poll #RetirementVillage #Community</div>
      </div>
    </div>

    <div class="template-card">
      <h3>Post #20: Question</h3>
      <span class="platform-badge facebook">Facebook</span>
      <span class="platform-badge instagram">Instagram</span>
      <div class="template-content">
        <p>💬 Question: What's stopping you from starting your retirement village search?</p>
        <p>Share your concerns in the comments—we're here to help! 💚</p>
        <div class="hashtags">#AskUs #RetirementVillage #RetirePath</div>
      </div>
    </div>

  </div>

  <div class="footer">
    <p><strong>RetirePath Social Media Template Pack</strong></p>
    <p>www.retirepath.com.au | @RetirePathAU (suggested handle)</p>
    <p style="font-size: 12px; margin-top: 15px;">Customize these templates with your brand voice, add images, and schedule using your preferred social media tool.</p>
  </div>

  <div class="no-print" style="text-align: center; margin: 40px 0;">
    <button onclick="window.print()" style="background: #2D6A4F; color: white; padding: 15px 40px; border: none; border-radius: 8px; cursor: pointer;">
      Print or Save as PDF
    </button>
  </div>
</body>
</html>`;
}

export function generateNewsletterTemplate(): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>RetirePath Monthly Newsletter Template</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 600px;
      margin: 40px auto;
      padding: 20px;
      background-color: #F9FAFB;
    }
    .newsletter {
      background: white;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #2D6A4F 0%, #1B4332 100%);
      color: white;
      padding: 40px 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0 0 10px 0;
      font-size: 28px;
    }
    .header p {
      margin: 0;
      font-size: 14px;
      opacity: 0.9;
    }
    .content {
      padding: 30px;
    }
    h2 {
      color: #2D6A4F;
      font-size: 22px;
      margin-top: 30px;
      margin-bottom: 15px;
    }
    p {
      line-height: 1.6;
      color: #333;
      margin: 15px 0;
    }
    .feature-box {
      background: #F0FDF4;
      border-left: 4px solid #52B788;
      padding: 20px;
      margin: 20px 0;
      border-radius: 5px;
    }
    .button {
      display: inline-block;
      background: #2D6A4F;
      color: white;
      padding: 12px 30px;
      text-decoration: none;
      border-radius: 5px;
      margin: 10px 0;
      font-weight: bold;
    }
    .footer {
      background: #F9FAFB;
      padding: 30px;
      text-align: center;
      font-size: 12px;
      color: #666;
    }
    .divider {
      height: 2px;
      background: #E5E7EB;
      margin: 30px 0;
    }
    ul {
      padding-left: 25px;
    }
    li {
      margin: 10px 0;
    }
  </style>
</head>
<body>
  <div class="newsletter">
    <!-- Header -->
    <div class="header">
      <h1>🏡 RetirePath</h1>
      <p>Your Monthly Retirement Village Update | [MONTH YEAR]</p>
    </div>

    <!-- Main Content -->
    <div class="content">
      <p>Hi [FIRST_NAME],</p>
      <p>Welcome to this month's RetirePath newsletter! Here's what's new in the world of retirement villages and our platform.</p>

      <!-- Feature 1: New Villages -->
      <h2>🆕 Newly Listed Villages</h2>
      <p>This month, we added <strong>[NUMBER]</strong> new retirement villages to our directory:</p>
      <div class="feature-box">
        <p><strong>[Village Name], [Suburb], [State]</strong></p>
        <p>Entry from $[PRICE] | [Key amenity] | [Care level]</p>
        <p>[Brief description]</p>
        <a href="[VILLAGE_LINK]" class="button">View Village →</a>
      </div>

      <div class="divider"></div>

      <!-- Feature 2: Educational Content -->
      <h2>📖 This Month's Guide</h2>
      <p><strong>[Article Title]</strong></p>
      <p>[Brief intro to the educational content—e.g., "Understanding Deferred Management Fees can be confusing. This guide breaks down everything you need to know..."]</p>
      <a href="[ARTICLE_LINK]" class="button">Read More →</a>

      <div class="divider"></div>

      <!-- Feature 3: Tips & Advice -->
      <h2>💡 Downsizing Tip of the Month</h2>
      <div class="feature-box">
        <p><strong>[Tip Title]</strong></p>
        <p>[1-2 sentences with practical advice for retirees planning their move]</p>
      </div>

      <div class="divider"></div>

      <!-- Feature 4: Platform Updates -->
      <h2>🚀 Platform Updates</h2>
      <ul>
        <li>[Update 1 - e.g., "New search filters for pet-friendly villages"]</li>
        <li>[Update 2 - e.g., "Enhanced Contract Review Tool with DMF calculator"]</li>
        <li>[Update 3 - e.g., "Mobile app coming soon!"]</li>
      </ul>

      <div class="divider"></div>

      <!-- Feature 5: Community Spotlight -->
      <h2>⭐ Community Spotlight</h2>
      <p><strong>[Village Name]</strong> in [Location] recently [achievement/event].</p>
      <p>[Brief description of what makes this village special or noteworthy]</p>
      <a href="[VILLAGE_LINK]" class="button">Learn More →</a>

      <div class="divider"></div>

      <!-- Feature 6: Stats -->
      <h2>📊 By the Numbers</h2>
      <ul>
        <li><strong>[NUMBER]</strong> villages now listed on RetirePath</li>
        <li><strong>[NUMBER]</strong> retirees used our platform this month</li>
        <li><strong>[NUMBER]</strong> tour bookings made</li>
      </ul>

      <div class="divider"></div>

      <!-- Call to Action -->
      <h2>🎯 Haven't Started Your Search?</h2>
      <p>RetirePath helps you find, compare, and choose the perfect retirement village. Start exploring today:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://www.retirepath.com.au" class="button" style="font-size: 16px; padding: 15px 40px;">Start Your Search →</a>
      </div>

    </div>

    <!-- Footer -->
    <div class="footer">
      <p><strong>RetirePath</strong> - Your retirement village transition guide</p>
      <p>www.retirepath.com.au | drew@retirepath.com.au | 0422 208 230</p>
      <p style="margin-top: 15px;">You're receiving this email because you signed up for RetirePath updates.</p>
      <p><a href="[UNSUBSCRIBE_LINK]" style="color: #2D6A4F;">Unsubscribe</a> | <a href="[PREFERENCES_LINK]" style="color: #2D6A4F;">Update Preferences</a></p>
      <p style="margin-top: 15px; font-size: 11px;">RetirePath acknowledges the Traditional Custodians of Country throughout Australia.</p>
    </div>
  </div>

  <div style="text-align: center; margin: 40px 0; font-size: 12px; color: #666;">
    <p><strong>Instructions:</strong> Replace [PLACEHOLDERS] with actual content. Use this template monthly. Export as HTML for email platforms like Mailchimp, ConvertKit, or Resend.</p>
  </div>
</body>
</html>`;
}

export function generateOperatorWelcome(): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Operator Welcome Kit - RetirePath</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 900px;
      margin: 40px auto;
      padding: 40px;
      line-height: 1.6;
      color: #333;
    }
    .header {
      background: linear-gradient(135deg, #2D6A4F 0%, #1B4332 100%);
      color: white;
      padding: 50px;
      border-radius: 15px;
      text-align: center;
      margin-bottom: 40px;
    }
    h1 {
      color: #2D6A4F;
      font-size: 36px;
      margin: 40px 0 20px 0;
      border-bottom: 3px solid #2D6A4F;
      padding-bottom: 10px;
    }
    h2 {
      color: #1B4332;
      font-size: 26px;
      margin: 30px 0 15px 0;
    }
    h3 {
      color: #2D6A4F;
      font-size: 20px;
      margin: 25px 0 15px 0;
    }
    .welcome-box {
      background: #F0FDF4;
      border-left: 5px solid #52B788;
      padding: 25px;
      margin: 30px 0;
      border-radius: 8px;
    }
    .tip-box {
      background: #FFF7ED;
      border-left: 5px solid #F59E0B;
      padding: 20px;
      margin: 25px 0;
      border-radius: 8px;
    }
    .step-card {
      background: white;
      border: 2px solid #E5E7EB;
      border-radius: 10px;
      padding: 25px;
      margin: 20px 0;
    }
    .step-number {
      display: inline-block;
      background: #2D6A4F;
      color: white;
      width: 35px;
      height: 35px;
      border-radius: 50%;
      text-align: center;
      line-height: 35px;
      font-weight: bold;
      margin-right: 10px;
    }
    ul {
      padding-left: 30px;
    }
    li {
      margin: 10px 0;
    }
    .footer {
      text-align: center;
      padding: 30px;
      margin-top: 60px;
      border-top: 2px solid #E5E7EB;
      color: #666;
      font-size: 14px;
    }
    @media print {
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1 style="color: white; border: none; margin: 0 0 15px 0;">Welcome to RetirePath! 🏡</h1>
    <p style="font-size: 20px; margin: 0;">Operator Onboarding & Success Guide</p>
  </div>

  <div class="welcome-box">
    <p><strong>Thank you for listing your retirement village on RetirePath!</strong></p>
    <p style="margin-top: 15px;">You've joined 87+ operators and 2,355+ villages on Australia's leading retirement village platform. This guide will help you optimize your listing, attract qualified prospects, and make the most of RetirePath.</p>
  </div>

  <h1>Getting Started</h1>
  
  <div class="step-card">
    <h3><span class="step-number">1</span>Access Your Operator Dashboard</h3>
    <p>Log in at <strong>www.retirepath.com.au/operator-login</strong> using the credentials sent to your email.</p>
    <p>Your dashboard allows you to:</p>
    <ul>
      <li>View and edit your village listing</li>
      <li>Upload photos and update amenities</li>
      <li>Manage tour bookings and inquiries</li>
      <li>Track profile views and engagement</li>
    </ul>
  </div>

  <div class="step-card">
    <h3><span class="step-number">2</span>Complete Your Village Profile</h3>
    <p>A complete profile gets 3x more views than incomplete listings. Make sure you've added:</p>
    <ul>
      <li>✓ High-quality photos (at least 10 images)</li>
      <li>✓ Detailed description (200+ words)</li>
      <li>✓ Accurate pricing information</li>
      <li>✓ Full amenities list</li>
      <li>✓ Care services offered</li>
      <li>✓ Contact information (phone, email, website)</li>
    </ul>
  </div>

  <div class="step-card">
    <h3><span class="step-number">3</span>Upload High-Quality Photos</h3>
    <p>Photos are the #1 factor in attracting prospects. Include:</p>
    <ul>
      <li>Exterior shots of buildings and grounds</li>
      <li>Sample unit interiors (kitchen, bedroom, living room)</li>
      <li>Communal facilities (pool, gym, library, community center)</li>
      <li>Gardens and outdoor spaces</li>
      <li>Happy residents (with permission)</li>
    </ul>
    <div class="tip-box">
      <p><strong>💡 Photo Tips:</strong></p>
      <ul style="margin: 10px 0;">
        <li>Use natural lighting (avoid flash)</li>
        <li>Photograph on sunny days</li>
        <li>Ensure spaces are clean and staged</li>
        <li>Use landscape orientation (horizontal)</li>
        <li>Minimum resolution: 1920x1080px</li>
      </ul>
    </div>
  </div>

  <h1>Optimizing Your Listing</h1>

  <h2>Writing Your Village Description</h2>
  <p>Your description should answer:</p>
  <ul>
    <li><strong>What makes your village unique?</strong> (location, history, community vibe)</li>
    <li><strong>Who is your ideal resident?</strong> (active retirees, social butterflies, pet lovers)</li>
    <li><strong>What lifestyle do you offer?</strong> (maintenance-free, social activities, care options)</li>
    <li><strong>What are your best amenities?</strong> (pool, gym, restaurant, gardens)</li>
  </ul>

  <div class="tip-box">
    <h3>✍️ Description Template:</h3>
    <p style="font-style: italic; margin: 15px 0;">"[Village Name] is a [type] retirement village located in [suburb], just [distance] from [landmark]. Established in [year], our community of [number] residents enjoys [key amenity 1], [key amenity 2], and [key amenity 3]. We're perfect for [target resident] who values [key benefit]. Our [unique feature] sets us apart, and residents love our [popular activity/space]. With [care level] available, you can age in place with confidence. Contact us today to book a tour!"</p>
  </div>

  <h2>Pricing Transparency</h2>
  <p>Retirees value transparency. Be clear about:</p>
  <ul>
    <li><strong>Entry price range:</strong> $XXX,XXX to $X,XXX,XXX</li>
    <li><strong>Monthly fees range:</strong> $XXX to $X,XXX per month</li>
    <li><strong>DMF structure:</strong> "30% of sale price, capped at 5 years"</li>
    <li><strong>What's included:</strong> "Monthly fees cover maintenance, water, building insurance..."</li>
  </ul>

  <div class="tip-box">
    <p><strong>💡 Pro Tip:</strong> Transparent pricing builds trust. Retirees who see clear pricing are 2x more likely to book a tour.</p>
  </div>

  <h1>Managing Leads & Bookings</h1>

  <h2>Tour Bookings</h2>
  <p>When a retiree books a tour through RetirePath, you'll receive:</p>
  <ul>
    <li>📧 <strong>Email notification</strong> with prospect's name, contact info, and preferred date</li>
    <li>📊 <strong>Dashboard update</strong> showing pending bookings</li>
  </ul>

  <p><strong>Best practices for responding:</strong></p>
  <ul>
    <li>✓ Respond within 24 hours (ideally same day)</li>
    <li>✓ Confirm the tour date and time</li>
    <li>✓ Provide clear directions and parking instructions</li>
    <li>✓ Ask if they have specific questions or interests</li>
    <li>✓ Offer alternative dates if requested time doesn't work</li>
  </ul>

  <h2>Reviews & Testimonials</h2>
  <p>Positive reviews boost your credibility. Encourage residents and families to leave reviews on RetirePath.</p>
  <div class="tip-box">
    <p><strong>How to get more reviews:</strong></p>
    <ul style="margin: 10px 0;">
      <li>Ask happy residents during community events</li>
      <li>Send review requests to families after move-in</li>
      <li>Display QR code in your office linking to your RetirePath profile</li>
      <li>Respond professionally to all reviews (positive and negative)</li>
    </ul>
  </div>

  <h1>Analytics & Insights</h1>

  <p>Your Operator Dashboard includes analytics on:</p>
  <ul>
    <li><strong>Profile Views:</strong> How many retirees viewed your listing</li>
    <li><strong>Tour Bookings:</strong> Number of tours requested</li>
    <li><strong>Inquiry Messages:</strong> Direct messages from prospects</li>
    <li><strong>Search Rankings:</strong> How your village ranks in search results</li>
  </ul>

  <p><strong>Use these insights to:</strong></p>
  <ul>
    <li>Identify which photos get the most engagement</li>
    <li>Optimize your description based on click-through rates</li>
    <li>Track seasonal trends in inquiries</li>
    <li>Compare your performance to similar villages</li>
  </ul>

  <h1>Growing Your Presence</h1>

  <h2>Become a Featured Village</h2>
  <p>Featured villages appear at the top of search results and get 5x more visibility. Benefits include:</p>
  <ul>
    <li>Priority placement in search results</li>
    <li>Homepage feature rotation</li>
    <li>Highlighted badge on your listing</li>
    <li>Featured in RetirePath newsletters</li>
  </ul>
  <p><strong>Interested?</strong> Contact drew@retirepath.com.au to learn about Featured Village opportunities.</p>

  <h2>Share Your RetirePath Profile</h2>
  <p>Promote your RetirePath listing:</p>
  <ul>
    <li>Add link to your website footer and contact page</li>
    <li>Share in email signatures</li>
    <li>Post on social media (Facebook, Instagram)</li>
    <li>Include in brochures and printed materials</li>
    <li>Display QR code in your village office</li>
  </ul>

  <h1>Support & Contact</h1>

  <p>We're here to help! Contact us for:</p>
  <ul>
    <li>🤔 <strong>Technical support:</strong> Issues with dashboard or uploads</li>
    <li>💡 <strong>Optimization advice:</strong> How to improve your listing</li>
    <li>📣 <strong>Marketing opportunities:</strong> Featured placements, partnerships</li>
    <li>💬 <strong>General questions:</strong> Anything else!</li>
  </ul>

  <div class="welcome-box">
    <p><strong>Contact Us:</strong></p>
    <p style="margin-top: 15px;">
      <strong>Email:</strong> drew@retirepath.com.au<br>
      <strong>Phone:</strong> 0422 208 230<br>
      <strong>Website:</strong> www.retirepath.com.au
    </p>
  </div>

  <h1>Frequently Asked Questions</h1>

  <h3>Q: How much does it cost to list my village?</h3>
  <p><strong>A:</strong> Zero. RetirePath is 100% free for retirement village operators, forever. No listing fees, no commissions, no hidden costs.</p>

  <h3>Q: How do retirees find my village?</h3>
  <p><strong>A:</strong> Through search filters (location, budget, amenities), Village Matcher algorithm, featured placements, and organic search (Google).</p>

  <h3>Q: Can I edit my listing after it's published?</h3>
  <p><strong>A:</strong> Yes! Log into your Operator Dashboard anytime to update photos, description, pricing, or amenities.</p>

  <h3>Q: Do I have to respond to tour bookings?</h3>
  <p><strong>A:</strong> We strongly recommend responding within 24 hours. Timely responses lead to more successful conversions.</p>

  <h3>Q: What if I receive a negative review?</h3>
  <p><strong>A:</strong> All reviews must be verified. You can respond professionally to reviews, and we'll remove any that violate our guidelines (spam, offensive language, false claims).</p>

  <div class="footer">
    <p><strong>Welcome to the RetirePath family!</strong></p>
    <p>We're excited to help your village reach qualified retirees across Australia.</p>
    <p style="margin-top: 20px;"><strong>RetirePath</strong> - Your retirement village transition guide</p>
    <p>www.retirepath.com.au | drew@retirepath.com.au | 0422 208 230</p>
  </div>

  <div class="no-print" style="text-align: center; margin: 40px 0;">
    <button onclick="window.print()" style="background: #2D6A4F; color: white; padding: 15px 40px; border: none; border-radius: 8px; cursor: pointer;">
      Print or Save as PDF
    </button>
  </div>
</body>
</html>`;
}
