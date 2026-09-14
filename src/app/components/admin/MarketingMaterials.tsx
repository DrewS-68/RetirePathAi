import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Download, FileText, Users, CheckSquare, Book, Presentation, Image, Mail } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  generateUltimateGuide, 
  generateMediaKit, 
  generatePitchDeck,
  generateSocialTemplates,
  generateNewsletterTemplate,
  generateOperatorWelcome
} from './marketing-materials-generators';

interface Material {
  id: string;
  title: string;
  description: string;
  type: 'pdf' | 'web' | 'template';
  audience: 'operators' | 'agents' | 'users' | 'general';
  week: 1 | 2 | 3;
  status: 'ready' | 'coming-soon';
  icon: React.ReactNode;
}

const materials: Material[] = [
  // Week 1
  {
    id: 'operator-onepager',
    title: 'Operator One-Pager',
    description: 'Quick "Why List on RetirePath?" benefits sheet for operators. Perfect for email attachments and cold outreach.',
    type: 'pdf',
    audience: 'operators',
    week: 1,
    status: 'ready',
    icon: <FileText className="size-5" />,
  },
  {
    id: 'agent-brochure',
    title: 'Agent Partnership Brochure',
    description: 'Comprehensive lead generation program overview for real estate agents specializing in downsizing.',
    type: 'pdf',
    audience: 'agents',
    week: 1,
    status: 'ready',
    icon: <Users className="size-5" />,
  },
  {
    id: 'village-checklist',
    title: 'Retirement Village Checklist',
    description: 'Free lead magnet: One-page checklist for evaluating retirement villages. Great for user engagement.',
    type: 'pdf',
    audience: 'users',
    week: 1,
    status: 'ready',
    icon: <CheckSquare className="size-5" />,
  },
  // Week 2
  {
    id: 'ultimate-guide',
    title: 'Ultimate Retirement Village Guide',
    description: '15-page comprehensive e-book covering everything retirees need to know about choosing a retirement village.',
    type: 'pdf',
    audience: 'users',
    week: 2,
    status: 'ready',
    icon: <Book className="size-5" />,
  },
  {
    id: 'media-kit',
    title: 'Media Kit',
    description: 'Press kit with company overview, statistics, screenshots, and contact information for media and partnerships.',
    type: 'pdf',
    audience: 'general',
    week: 2,
    status: 'ready',
    icon: <FileText className="size-5" />,
  },
  {
    id: 'pitch-deck',
    title: 'Pitch Deck',
    description: '10-15 slide presentation for investors, major operators, and strategic partnerships.',
    type: 'pdf',
    audience: 'general',
    week: 2,
    status: 'ready',
    icon: <Presentation className="size-5" />,
  },
  // Week 3
  {
    id: 'social-templates',
    title: 'Social Media Template Pack',
    description: '20 pre-designed social media posts for Instagram, Facebook, and LinkedIn with RetirePath branding.',
    type: 'template',
    audience: 'general',
    week: 3,
    status: 'ready',
    icon: <Image className="size-5" />,
  },
  {
    id: 'newsletter-template',
    title: 'Email Newsletter Template',
    description: 'Monthly newsletter template for user updates, new villages, tips, and industry news.',
    type: 'template',
    audience: 'general',
    week: 3,
    status: 'ready',
    icon: <Mail className="size-5" />,
  },
  {
    id: 'operator-welcome',
    title: 'Operator Welcome Kit',
    description: 'Onboarding document for new operators with platform tutorials, best practices, and optimization tips.',
    type: 'pdf',
    audience: 'operators',
    week: 3,
    status: 'ready',
    icon: <Book className="size-5" />,
  },
];

export function MarketingMaterials() {
  const [downloading, setDownloading] = useState<string | null>(null);

  const downloadMaterial = (materialId: string) => {
    setDownloading(materialId);
    
    // Generate the material based on ID
    const material = materials.find(m => m.id === materialId);
    if (!material) return;

    let htmlContent = '';
    
    switch (materialId) {
      case 'operator-onepager':
        htmlContent = generateOperatorOnePager();
        break;
      case 'agent-brochure':
        htmlContent = generateAgentBrochure();
        break;
      case 'village-checklist':
        htmlContent = generateVillageChecklist();
        break;
      case 'ultimate-guide':
        htmlContent = generateUltimateGuide();
        break;
      case 'media-kit':
        htmlContent = generateMediaKit();
        break;
      case 'pitch-deck':
        htmlContent = generatePitchDeck();
        break;
      case 'social-templates':
        htmlContent = generateSocialTemplates();
        break;
      case 'newsletter-template':
        htmlContent = generateNewsletterTemplate();
        break;
      case 'operator-welcome':
        htmlContent = generateOperatorWelcome();
        break;
    }

    // Open in new window for printing/saving as PDF
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(htmlContent);
      newWindow.document.close();
    }

    setTimeout(() => setDownloading(null), 1000);
  };

  const week1Materials = materials.filter(m => m.week === 1);
  const week2Materials = materials.filter(m => m.week === 2);
  const week3Materials = materials.filter(m => m.week === 3);

  const operatorMaterials = materials.filter(m => m.audience === 'operators');
  const agentMaterials = materials.filter(m => m.audience === 'agents');
  const userMaterials = materials.filter(m => m.audience === 'users');
  const generalMaterials = materials.filter(m => m.audience === 'general');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2">Marketing Materials Library</h2>
        <p className="text-muted-foreground">
          Professional marketing materials for operators, agents, users, and partnerships. Download, customize, and share.
        </p>
      </div>

      <Tabs defaultValue="timeline" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="operators">Operators</TabsTrigger>
          <TabsTrigger value="agents">Agents</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="general">General</TabsTrigger>
        </TabsList>

        {/* Timeline View */}
        <TabsContent value="timeline" className="space-y-8">
          {/* Week 1 */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Badge className="bg-green-600 text-white">Week 1</Badge>
              <h3>Foundation Materials</h3>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {week1Materials.map(material => (
                <MaterialCard
                  key={material.id}
                  material={material}
                  onDownload={downloadMaterial}
                  isDownloading={downloading === material.id}
                />
              ))}
            </div>
          </div>

          {/* Week 2 */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Badge className="bg-blue-600 text-white">Week 2</Badge>
              <h3>Growth & Authority</h3>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {week2Materials.map(material => (
                <MaterialCard
                  key={material.id}
                  material={material}
                  onDownload={downloadMaterial}
                  isDownloading={downloading === material.id}
                />
              ))}
            </div>
          </div>

          {/* Week 3 */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Badge className="bg-purple-600 text-white">Week 3</Badge>
              <h3>Engagement & Onboarding</h3>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {week3Materials.map(material => (
                <MaterialCard
                  key={material.id}
                  material={material}
                  onDownload={downloadMaterial}
                  isDownloading={downloading === material.id}
                />
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Operators Tab */}
        <TabsContent value="operators" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {operatorMaterials.map(material => (
              <MaterialCard
                key={material.id}
                material={material}
                onDownload={downloadMaterial}
                isDownloading={downloading === material.id}
              />
            ))}
          </div>
        </TabsContent>

        {/* Agents Tab */}
        <TabsContent value="agents" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {agentMaterials.map(material => (
              <MaterialCard
                key={material.id}
                material={material}
                onDownload={downloadMaterial}
                isDownloading={downloading === material.id}
              />
            ))}
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {userMaterials.map(material => (
              <MaterialCard
                key={material.id}
                material={material}
                onDownload={downloadMaterial}
                isDownloading={downloading === material.id}
              />
            ))}
          </div>
        </TabsContent>

        {/* General Tab */}
        <TabsContent value="general" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {generalMaterials.map(material => (
              <MaterialCard
                key={material.id}
                material={material}
                onDownload={downloadMaterial}
                isDownloading={downloading === material.id}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface MaterialCardProps {
  material: Material;
  onDownload: (id: string) => void;
  isDownloading: boolean;
}

function MaterialCard({ material, onDownload, isDownloading }: MaterialCardProps) {
  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start gap-4">
        <div className="bg-green-100 p-3 rounded-lg text-green-700">
          {material.icon}
        </div>
        <div className="flex-1">
          <h4 className="mb-2">{material.title}</h4>
          <p className="text-sm text-muted-foreground mb-4">
            {material.description}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Badge variant="outline" className="text-xs capitalize">
                {material.audience}
              </Badge>
              <Badge variant="outline" className="text-xs capitalize">
                {material.type}
              </Badge>
            </div>
            <Button
              size="sm"
              onClick={() => onDownload(material.id)}
              disabled={isDownloading}
            >
              <Download className="size-4 mr-2" />
              {isDownloading ? 'Opening...' : 'Download'}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

// Material generation functions
function generateOperatorOnePager(): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Why List on RetirePath - Operator One-Pager</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 800px;
      margin: 40px auto;
      padding: 40px;
      line-height: 1.6;
      color: #333;
    }
    .header {
      background: linear-gradient(135deg, #2D6A4F 0%, #1B4332 100%);
      color: white;
      padding: 40px;
      border-radius: 10px;
      margin-bottom: 30px;
      text-align: center;
    }
    h1 {
      margin: 0 0 10px 0;
      font-size: 32px;
    }
    .tagline {
      font-size: 18px;
      opacity: 0.9;
    }
    .section {
      margin: 30px 0;
    }
    h2 {
      color: #2D6A4F;
      border-bottom: 3px solid #2D6A4F;
      padding-bottom: 10px;
      margin-bottom: 20px;
    }
    .benefits {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
      margin: 20px 0;
    }
    .benefit-box {
      background: #F0FDF4;
      border-left: 4px solid #2D6A4F;
      padding: 20px;
      border-radius: 5px;
    }
    .benefit-box h3 {
      color: #1B4332;
      margin: 0 0 10px 0;
      font-size: 18px;
    }
    .benefit-box p {
      margin: 0;
      font-size: 14px;
      color: #666;
    }
    .stats {
      background: #1B4332;
      color: white;
      padding: 30px;
      border-radius: 10px;
      text-align: center;
      margin: 30px 0;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin-top: 20px;
    }
    .stat-item {
      padding: 20px;
    }
    .stat-number {
      font-size: 36px;
      font-weight: bold;
      color: #52B788;
    }
    .stat-label {
      font-size: 14px;
      opacity: 0.9;
      margin-top: 5px;
    }
    .cta {
      background: #52B788;
      color: white;
      padding: 30px;
      border-radius: 10px;
      text-align: center;
      margin: 30px 0;
    }
    .cta h2 {
      color: white;
      border: none;
      margin: 0 0 15px 0;
    }
    .cta-button {
      background: white;
      color: #2D6A4F;
      padding: 15px 40px;
      border-radius: 5px;
      text-decoration: none;
      display: inline-block;
      font-weight: bold;
      font-size: 18px;
      margin-top: 10px;
    }
    .footer {
      text-align: center;
      padding: 20px;
      color: #666;
      font-size: 14px;
      border-top: 2px solid #E5E7EB;
      margin-top: 40px;
    }
    ul {
      list-style: none;
      padding: 0;
    }
    ul li {
      padding: 8px 0;
      padding-left: 30px;
      position: relative;
    }
    ul li:before {
      content: "✓";
      position: absolute;
      left: 0;
      color: #52B788;
      font-weight: bold;
      font-size: 18px;
    }
    @media print {
      body { margin: 20px; padding: 20px; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🏡 Why List on RetirePath?</h1>
    <p class="tagline">Australia's Leading Retirement Village Platform</p>
  </div>

  <div class="section">
    <h2>Zero-Cost Village Listing Platform</h2>
    <p>RetirePath connects qualified retirees with retirement villages across Australia. We help your village get discovered by families actively searching for their next home.</p>
  </div>

  <div class="stats">
    <h2 style="color: white; border: none;">Our Reach</h2>
    <div class="stats-grid">
      <div class="stat-item">
        <div class="stat-number">2,355+</div>
        <div class="stat-label">Villages Listed</div>
      </div>
      <div class="stat-item">
        <div class="stat-number">87+</div>
        <div class="stat-label">Operators Registered</div>
      </div>
      <div class="stat-item">
        <div class="stat-number">100%</div>
        <div class="stat-label">Free to List</div>
      </div>
    </div>
  </div>

  <div class="section">
    <h2>Key Benefits</h2>
    <div class="benefits">
      <div class="benefit-box">
        <h3>📈 Qualified Leads</h3>
        <p>Connect with retirees who are actively searching and comparing villages in your area.</p>
      </div>
      <div class="benefit-box">
        <h3>🎯 Enhanced Visibility</h3>
        <p>Showcase your amenities, photos, and unique features to stand out from competitors.</p>
      </div>
      <div class="benefit-box">
        <h3>📅 Direct Tour Bookings</h3>
        <p>Receive tour requests directly from interested families through our platform.</p>
      </div>
      <div class="benefit-box">
        <h3>⭐ Verified Reviews</h3>
        <p>Build trust and credibility through authentic resident reviews and testimonials.</p>
      </div>
      <div class="benefit-box">
        <h3>💰 Zero Fees</h3>
        <p>No listing fees, no commissions, no hidden costs. Completely free, forever.</p>
      </div>
      <div class="benefit-box">
        <h3>📊 Analytics Dashboard</h3>
        <p>Track profile views, tour requests, and user interest in real-time.</p>
      </div>
    </div>
  </div>

  <div class="section">
    <h2>What RetirePath Offers</h2>
    <ul>
      <li><strong>Comprehensive Village Profiles</strong> - Showcase location, pricing, amenities, care services, and activities</li>
      <li><strong>Photo Galleries</strong> - Upload unlimited high-quality images of your village</li>
      <li><strong>Interactive Maps</strong> - Integrated Google Maps with street view and location details</li>
      <li><strong>Village Matcher Algorithm</strong> - Get matched with retirees whose preferences align with your offering</li>
      <li><strong>Contract Comparison Tools</strong> - Help prospects understand your contract structure transparently</li>
      <li><strong>Lead Management</strong> - Manage tour requests and inquiries from your operator dashboard</li>
      <li><strong>National Coverage</strong> - Listed alongside villages from all Australian states and territories</li>
    </ul>
  </div>

  <div class="section">
    <h2>Who Uses RetirePath?</h2>
    <div class="benefits">
      <div class="benefit-box">
        <h3>🧓 Retirees Planning Their Move</h3>
        <p>Seniors researching villages, comparing contracts, and planning their transition.</p>
      </div>
      <div class="benefit-box">
        <h3>👨‍👩‍👧‍👦 Family Members</h3>
        <p>Adult children helping parents find suitable retirement accommodation.</p>
      </div>
      <div class="benefit-box">
        <h3>💼 Financial Advisors</h3>
        <p>Professionals helping clients plan retirement transitions and understand costs.</p>
      </div>
      <div class="benefit-box">
        <h3>🏠 Real Estate Agents</h3>
        <p>Agents helping downsizing clients find their next home after selling.</p>
      </div>
    </div>
  </div>

  <div class="cta">
    <h2>Ready to Get Started?</h2>
    <p>List your village in just 5 minutes. No credit card required.</p>
    <a href="https://www.retirepath.com.au/#operator" class="cta-button">List Your Village Free →</a>
    <p style="margin-top: 20px; font-size: 14px;">Questions? Contact Drew Smith at drew@retirepath.com.au or 0422 208 230</p>
  </div>

  <div class="footer">
    <p><strong>RetirePath</strong> - Your retirement village transition guide</p>
    <p>www.retirepath.com.au | drew@retirepath.com.au | 0422 208 230</p>
    <p style="font-size: 12px; margin-top: 10px;">RetirePath acknowledges the Traditional Custodians of Country throughout Australia.</p>
  </div>

  <div class="no-print" style="text-align: center; margin: 30px 0;">
    <button onclick="window.print()" style="background: #2D6A4F; color: white; padding: 12px 30px; border: none; border-radius: 5px; font-size: 16px; cursor: pointer;">
      Print or Save as PDF
    </button>
  </div>
</body>
</html>`;
}

function generateAgentBrochure(): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>RetirePath Agent Partnership Program</title>
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
      margin-bottom: 40px;
      text-align: center;
    }
    h1 {
      margin: 0 0 15px 0;
      font-size: 36px;
    }
    .tagline {
      font-size: 20px;
      opacity: 0.95;
    }
    .section {
      margin: 40px 0;
    }
    h2 {
      color: #2D6A4F;
      border-bottom: 3px solid #2D6A4F;
      padding-bottom: 10px;
      margin-bottom: 20px;
      font-size: 28px;
    }
    .intro {
      background: #F0FDF4;
      border-left: 5px solid #52B788;
      padding: 25px;
      border-radius: 8px;
      margin: 30px 0;
      font-size: 16px;
    }
    .benefits-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 25px;
      margin: 30px 0;
    }
    .benefit-card {
      background: white;
      border: 2px solid #E5E7EB;
      border-radius: 10px;
      padding: 25px;
      transition: all 0.3s;
    }
    .benefit-card:hover {
      border-color: #52B788;
      box-shadow: 0 4px 12px rgba(45, 106, 79, 0.1);
    }
    .benefit-card h3 {
      color: #1B4332;
      margin: 0 0 15px 0;
      font-size: 20px;
    }
    .benefit-card p {
      margin: 0;
      color: #666;
      font-size: 14px;
    }
    .process {
      background: #1B4332;
      color: white;
      padding: 40px;
      border-radius: 15px;
      margin: 40px 0;
    }
    .process h2 {
      color: white;
      border-bottom-color: #52B788;
    }
    .process-steps {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 25px;
      margin-top: 30px;
    }
    .step {
      text-align: center;
    }
    .step-number {
      background: #52B788;
      color: white;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      font-weight: bold;
      margin: 0 auto 15px;
    }
    .step h3 {
      font-size: 18px;
      margin: 0 0 10px 0;
    }
    .step p {
      font-size: 14px;
      opacity: 0.9;
    }
    .stats {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      margin: 30px 0;
    }
    .stat-box {
      text-align: center;
      padding: 25px;
      background: #F0FDF4;
      border-radius: 10px;
    }
    .stat-number {
      font-size: 36px;
      font-weight: bold;
      color: #2D6A4F;
    }
    .stat-label {
      font-size: 14px;
      color: #666;
      margin-top: 8px;
    }
    .requirements {
      background: #FFF7ED;
      border-left: 5px solid #F59E0B;
      padding: 25px;
      border-radius: 8px;
      margin: 30px 0;
    }
    .requirements h3 {
      color: #92400E;
      margin-top: 0;
    }
    ul {
      margin: 15px 0;
      padding-left: 25px;
    }
    ul li {
      margin: 10px 0;
      color: #666;
    }
    .cta {
      background: linear-gradient(135deg, #52B788 0%, #2D6A4F 100%);
      color: white;
      padding: 40px;
      border-radius: 15px;
      text-align: center;
      margin: 40px 0;
    }
    .cta h2 {
      color: white;
      border: none;
      margin: 0 0 20px 0;
    }
    .cta-buttons {
      display: flex;
      gap: 20px;
      justify-content: center;
      margin-top: 25px;
    }
    .cta-button {
      background: white;
      color: #2D6A4F;
      padding: 15px 35px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: bold;
      font-size: 16px;
      display: inline-block;
    }
    .cta-button.secondary {
      background: transparent;
      border: 2px solid white;
      color: white;
    }
    .footer {
      text-align: center;
      padding: 30px;
      color: #666;
      font-size: 14px;
      border-top: 2px solid #E5E7EB;
      margin-top: 50px;
    }
    @media print {
      body { margin: 20px; padding: 20px; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🏠 RetirePath Agent Partnership Program</h1>
    <p class="tagline">Turn Downsizing Clients Into Qualified Leads</p>
  </div>

  <div class="intro">
    <p><strong>Are you a real estate agent specializing in downsizing and seniors' property?</strong></p>
    <p style="margin-top: 10px;">RetirePath connects you with pre-qualified retirees who are ready to sell their family homes and transition to retirement villages. We send leads directly to you—at zero cost.</p>
  </div>

  <div class="section">
    <h2>The Opportunity</h2>
    <p>Every year, thousands of Australian retirees downsize from family homes to retirement villages. They need:</p>
    <ul>
      <li><strong>A trusted agent</strong> who understands their unique needs</li>
      <li><strong>Expert guidance</strong> on timing their sale with their village move-in</li>
      <li><strong>Compassionate service</strong> during a major life transition</li>
      <li><strong>Local market knowledge</strong> to maximize their sale price</li>
    </ul>
    <p><strong>RetirePath helps you find these clients before they list with anyone else.</strong></p>
  </div>

  <div class="section">
    <h2>Platform Statistics</h2>
    <div class="stats">
      <div class="stat-box">
        <div class="stat-number">2,355+</div>
        <div class="stat-label">Villages Listed</div>
      </div>
      <div class="stat-box">
        <div class="stat-number">87+</div>
        <div class="stat-label">Operators</div>
      </div>
      <div class="stat-box">
        <div class="stat-number">Growing</div>
        <div class="stat-label">Active Users</div>
      </div>
      <div class="stat-box">
        <div class="stat-number">0%</div>
        <div class="stat-label">Cost to Join</div>
      </div>
    </div>
  </div>

  <div class="section">
    <h2>What You Get (Free Membership)</h2>
    <div class="benefits-grid">
      <div class="benefit-card">
        <h3>📞 Qualified Leads</h3>
        <p>Receive contact details of retirees in your area who are ready to sell their homes and have already planned their next move.</p>
      </div>
      <div class="benefit-card">
        <h3>🎯 Pre-Qualified Prospects</h3>
        <p>These aren't cold leads. They've used our platform to plan their transition, value their home, and find retirement villages.</p>
      </div>
      <div class="benefit-card">
        <h3>📍 Local Territory</h3>
        <p>Only receive leads in your service areas. We respect agent territories and never double-assign leads.</p>
      </div>
      <div class="benefit-card">
        <h3>👤 Featured Profile</h3>
        <p>Get listed as a "RetirePath Featured Agent" on our platform with your photo, bio, specialty areas, and contact details.</p>
      </div>
      <div class="benefit-card">
        <h3>📊 Lead Dashboard</h3>
        <p>Access your agent dashboard to view lead details, contact history, and manage follow-ups.</p>
      </div>
      <div class="benefit-card">
        <h3>💰 Zero Upfront Costs</h3>
        <p>No membership fees, no monthly subscriptions, no per-lead charges. Standard commission when you close the sale.</p>
      </div>
    </div>
  </div>

  <div class="process">
    <h2>How It Works</h2>
    <div class="process-steps">
      <div class="step">
        <div class="step-number">1</div>
        <h3>Sign Up Free</h3>
        <p>Create your Featured Agent profile in 5 minutes. Tell us your service areas and specialties.</p>
      </div>
      <div class="step">
        <div class="step-number">2</div>
        <h3>Receive Leads</h3>
        <p>When retirees in your area are ready to sell, we send you their contact details via email/SMS.</p>
      </div>
      <div class="step">
        <div class="step-number">3</div>
        <h3>Close Sales</h3>
        <p>Contact the lead, provide your expert service, and earn your standard commission.</p>
      </div>
    </div>
  </div>

  <div class="section">
    <h2>Ideal Lead Profile</h2>
    <p>Here's what a typical RetirePath lead looks like:</p>
    <ul>
      <li><strong>Age:</strong> 65-85 years old</li>
      <li><strong>Property Type:</strong> Family home (3-4 bedrooms, established suburbs)</li>
      <li><strong>Sale Timeline:</strong> 3-12 months (coordinated with village move-in)</li>
      <li><strong>Motivation:</strong> High (already committed to retirement village transition)</li>
      <li><strong>Financial Readiness:</strong> Using home sale proceeds to fund village entry</li>
      <li><strong>Decision Makers:</strong> Often includes adult children helping with the process</li>
    </ul>
  </div>

  <div class="section">
    <h2>Why Downsizing Leads Are Valuable</h2>
    <div class="benefits-grid">
      <div class="benefit-card">
        <h3>🏡 Higher Sale Prices</h3>
        <p>Established homes in desirable suburbs, often held for 20-40+ years with significant equity.</p>
      </div>
      <div class="benefit-card">
        <h3>⏱️ Motivated Sellers</h3>
        <p>Clear timeline and motivation to sell. They've already chosen their next home.</p>
      </div>
      <div class="benefit-card">
        <h3>🤝 Relationship Clients</h3>
        <p>Appreciate empathetic, knowledgeable agents. High likelihood of referrals to friends.</p>
      </div>
      <div class="benefit-card">
        <h3>📈 Professional Growth</h3>
        <p>Build expertise in downsizing niche. Become the go-to agent for seniors in your area.</p>
      </div>
    </div>
  </div>

  <div class="requirements">
    <h3>⭐ Featured Agent Requirements</h3>
    <ul>
      <li>Licensed real estate agent in Australia</li>
      <li>Experience with downsizing clients and/or seniors (preferred)</li>
      <li>Knowledge of local retirement village market</li>
      <li>Commitment to client care and ethical service</li>
      <li>Available to take referrals in your service area</li>
      <li>Willingness to coordinate timing with retirement village move-ins</li>
    </ul>
  </div>

  <div class="section">
    <h2>Services We Provide Your Leads</h2>
    <p>Before you receive a lead, they've already used RetirePath to:</p>
    <ul>
      <li><strong>Find retirement villages</strong> that match their preferences and budget</li>
      <li><strong>Compare contracts</strong> to understand entry costs, fees, and DMF structures</li>
      <li><strong>Estimate home value</strong> with our property valuation tool</li>
      <li><strong>Plan their transition</strong> using our progress tracker and timelines</li>
      <li><strong>Calculate net proceeds</strong> after selling costs and village entry fees</li>
    </ul>
    <p><strong>This means they're informed, prepared, and ready to act.</strong></p>
  </div>

  <div class="cta">
    <h2>Ready to Receive Downsizing Leads?</h2>
    <p style="font-size: 18px; margin-bottom: 10px;">Join the RetirePath Agent Partner Program today—completely free.</p>
    <div class="cta-buttons">
      <a href="mailto:drew@retirepath.com.au?subject=Agent Partnership Inquiry" class="cta-button">
        Apply Now
      </a>
      <a href="tel:0422208230" class="cta-button secondary">
        Call: 0422 208 230
      </a>
    </div>
    <p style="margin-top: 25px; font-size: 14px; opacity: 0.9;">
      Questions? Contact Drew Smith at drew@retirepath.com.au
    </p>
  </div>

  <div class="footer">
    <p><strong>RetirePath</strong> - Your retirement village transition guide</p>
    <p>www.retirepath.com.au | drew@retirepath.com.au | 0422 208 230</p>
    <p style="font-size: 12px; margin-top: 15px;">RetirePath acknowledges the Traditional Custodians of Country throughout Australia.</p>
  </div>

  <div class="no-print" style="text-align: center; margin: 30px 0;">
    <button onclick="window.print()" style="background: #2D6A4F; color: white; padding: 12px 30px; border: none; border-radius: 5px; font-size: 16px; cursor: pointer;">
      Print or Save as PDF
    </button>
  </div>
</body>
</html>`;
}

function generateVillageChecklist(): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Retirement Village Evaluation Checklist - RetirePath</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 850px;
      margin: 30px auto;
      padding: 30px;
      line-height: 1.5;
      color: #333;
    }
    .header {
      background: linear-gradient(135deg, #2D6A4F 0%, #1B4332 100%);
      color: white;
      padding: 30px;
      border-radius: 10px;
      margin-bottom: 30px;
      text-align: center;
    }
    h1 {
      margin: 0 0 10px 0;
      font-size: 28px;
    }
    .tagline {
      font-size: 16px;
      opacity: 0.9;
    }
    .intro {
      background: #F0FDF4;
      border-left: 4px solid #52B788;
      padding: 20px;
      margin: 25px 0;
      border-radius: 5px;
    }
    h2 {
      color: #2D6A4F;
      border-bottom: 2px solid #2D6A4F;
      padding-bottom: 8px;
      margin-top: 30px;
      margin-bottom: 15px;
      font-size: 20px;
    }
    .checklist-section {
      margin: 25px 0;
      background: white;
      border: 1px solid #E5E7EB;
      border-radius: 8px;
      padding: 20px;
    }
    .checklist-section h3 {
      color: #1B4332;
      margin: 0 0 15px 0;
      font-size: 18px;
    }
    .checklist-item {
      display: flex;
      align-items: flex-start;
      margin: 12px 0;
      padding: 8px;
      border-radius: 4px;
    }
    .checklist-item:hover {
      background: #F9FAFB;
    }
    .checkbox {
      width: 20px;
      height: 20px;
      border: 2px solid #2D6A4F;
      border-radius: 4px;
      margin-right: 12px;
      flex-shrink: 0;
      margin-top: 2px;
    }
    .checklist-item label {
      flex: 1;
      cursor: pointer;
      font-size: 14px;
    }
    .notes-section {
      margin-top: 12px;
      padding-top: 8px;
      border-top: 1px dashed #E5E7EB;
    }
    .notes-label {
      font-size: 12px;
      color: #666;
      margin-bottom: 5px;
    }
    .notes-area {
      width: 100%;
      height: 40px;
      border: 1px solid #D1D5DB;
      border-radius: 4px;
      padding: 6px;
      font-size: 12px;
      font-family: Arial, sans-serif;
    }
    .warning-box {
      background: #FFF7ED;
      border: 2px solid #F59E0B;
      border-radius: 8px;
      padding: 20px;
      margin: 25px 0;
    }
    .warning-box h3 {
      color: #92400E;
      margin: 0 0 10px 0;
      font-size: 16px;
    }
    .warning-box ul {
      margin: 10px 0;
      padding-left: 20px;
    }
    .warning-box li {
      margin: 5px 0;
      font-size: 14px;
      color: #78350F;
    }
    .footer {
      text-align: center;
      padding: 20px;
      color: #666;
      font-size: 13px;
      border-top: 2px solid #E5E7EB;
      margin-top: 40px;
    }
    @media print {
      body { margin: 15px; padding: 15px; }
      .no-print { display: none; }
      .checklist-item:hover { background: white; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>✓ Retirement Village Evaluation Checklist</h1>
    <p class="tagline">Your comprehensive guide to choosing the right retirement village</p>
  </div>

  <div class="intro">
    <p><strong>How to use this checklist:</strong></p>
    <p style="margin-top: 8px; font-size: 14px;">Use this checklist when visiting retirement villages or reviewing their information. Check off items as you gather information, and use the notes sections to record specific details. Compare multiple villages side-by-side to make an informed decision.</p>
  </div>

  <div class="checklist-section">
    <h3>📍 Location & Accessibility</h3>
    <div class="checklist-item">
      <div class="checkbox"></div>
      <label>Close to family and friends (within desired distance)</label>
    </div>
    <div class="checklist-item">
      <div class="checkbox"></div>
      <label>Convenient to medical facilities (GP, hospital, specialists)</label>
    </div>
    <div class="checklist-item">
      <div class="checkbox"></div>
      <label>Near shopping centers, supermarkets, and essential services</label>
    </div>
    <div class="checklist-item">
      <div class="checkbox"></div>
      <label>Good public transport connections or community transport available</label>
    </div>
    <div class="checklist-item">
      <div class="checkbox"></div>
      <label>Safe neighborhood with low crime rates</label>
    </div>
    <div class="notes-section">
      <div class="notes-label">Notes - Location:</div>
      <textarea class="notes-area"></textarea>
    </div>
  </div>

  <div class="checklist-section">
    <h3>🏡 Accommodation & Facilities</h3>
    <div class="checklist-item">
      <div class="checkbox"></div>
      <label>Unit size and layout meet your needs (bedrooms, storage, living space)</label>
    </div>
    <div class="checklist-item">
      <div class="checkbox"></div>
      <label>Modern kitchen and bathroom facilities</label>
    </div>
    <div class="checklist-item">
      <div class="checkbox"></div>
      <label>Adequate car parking (garage, carport, or visitor parking)</label>
    </div>
    <div class="checklist-item">
      <div class="checkbox"></div>
      <label>Private outdoor space (balcony, courtyard, or garden)</label>
    </div>
    <div class="checklist-item">
      <div class="checkbox"></div>
      <label>Safety features (handrails, emergency call buttons, level access)</label>
    </div>
    <div class="checklist-item">
      <div class="checkbox"></div>
      <label>Climate control (heating, cooling, insulation)</label>
    </div>
    <div class="notes-section">
      <div class="notes-label">Notes - Accommodation:</div>
      <textarea class="notes-area"></textarea>
    </div>
  </div>

  <div class="checklist-section">
    <h3>🏥 Care Services & Support</h3>
    <div class="checklist-item">
      <div class="checkbox"></div>
      <label>24-hour emergency call system in place</label>
    </div>
    <div class="checklist-item">
      <div class="checkbox"></div>
      <label>On-site care services available (or aged care facility nearby)</label>
    </div>
    <div class="checklist-item">
      <div class="checkbox"></div>
      <label>Home care packages can be used if needed</label>
    </div>
    <div class="checklist-item">
      <div class="checkbox"></div>
      <label>Transition pathway to higher care levels (if needed in future)</label>
    </div>
    <div class="checklist-item">
      <div class="checkbox"></div>
      <label>Medical center or visiting health professionals on-site</label>
    </div>
    <div class="notes-section">
      <div class="notes-label">Notes - Care Services:</div>
      <textarea class="notes-area"></textarea>
    </div>
  </div>

  <div class="checklist-section">
    <h3>🎯 Amenities & Activities</h3>
    <div class="checklist-item">
      <div class="checkbox"></div>
      <label>Communal facilities meet your interests (gym, pool, library, workshop, garden)</label>
    </div>
    <div class="checklist-item">
      <div class="checkbox"></div>
      <label>Regular social activities and events organized</label>
    </div>
    <div class="checklist-item">
      <div class="checkbox"></div>
      <label>Active and friendly community atmosphere</label>
    </div>
    <div class="checklist-item">
      <div class="checkbox"></div>
      <label>Restaurant or dining facilities available</label>
    </div>
    <div class="checklist-item">
      <div class="checkbox"></div>
      <label>Pet-friendly policy (if you have pets)</label>
    </div>
    <div class="notes-section">
      <div class="notes-label">Notes - Amenities:</div>
      <textarea class="notes-area"></textarea>
    </div>
  </div>

  <div class="checklist-section">
    <h3>💰 Financial & Contract Terms</h3>
    <div class="checklist-item">
      <div class="checkbox"></div>
      <label>Entry price is within your budget</label>
    </div>
    <div class="checklist-item">
      <div class="checkbox"></div>
      <label>Monthly fees are affordable and clearly explained</label>
    </div>
    <div class="checklist-item">
      <div class="checkbox"></div>
      <label>DMF (Deferred Management Fee) structure is clearly understood</label>
    </div>
    <div class="checklist-item">
      <div class="checkbox"></div>
      <label>Capital gains sharing arrangement is fair and documented</label>
    </div>
    <div class="checklist-item">
      <div class="checkbox"></div>
      <label>Exit conditions and refund timeline are acceptable</label>
    </div>
    <div class="checklist-item">
      <div class="checkbox"></div>
      <label>All fees and charges are transparent (no hidden costs)</label>
    </div>
    <div class="checklist-item">
      <div class="checkbox"></div>
      <label>Contract has been reviewed by your solicitor</label>
    </div>
    <div class="notes-section">
      <div class="notes-label">Notes - Financial:</div>
      <textarea class="notes-area"></textarea>
    </div>
  </div>

  <div class="checklist-section">
    <h3>📋 Operator & Management</h3>
    <div class="checklist-item">
      <div class="checkbox"></div>
      <label>Operator has good reputation and financial stability</label>
    </div>
    <div class="checklist-item">
      <div class="checkbox"></div>
      <label>Management is approachable and responsive to residents</label>
    </div>
    <div class="checklist-item">
      <div class="checkbox"></div>
      <label>Village is well-maintained and clean</label>
    </div>
    <div class="checklist-item">
      <div class="checkbox"></div>
      <label>Residents committee or advisory group exists</label>
    </div>
    <div class="checklist-item">
      <div class="checkbox"></div>
      <label>Complaints process is clear and fair</label>
    </div>
    <div class="notes-section">
      <div class="notes-label">Notes - Management:</div>
      <textarea class="notes-area"></textarea>
    </div>
  </div>

  <div class="checklist-section">
    <h3>🗣️ Current Residents</h3>
    <div class="checklist-item">
      <div class="checkbox"></div>
      <label>Spoke to current residents about their experience</label>
    </div>
    <div class="checklist-item">
      <div class="checkbox"></div>
      <label>Residents seem happy and satisfied</label>
    </div>
    <div class="checklist-item">
      <div class="checkbox"></div>
      <label>Community is welcoming to new residents</label>
    </div>
    <div class="checklist-item">
      <div class="checkbox"></div>
      <label>Age range and interests align with yours</label>
    </div>
    <div class="notes-section">
      <div class="notes-label">Notes - Resident Feedback:</div>
      <textarea class="notes-area"></textarea>
    </div>
  </div>

  <div class="warning-box">
    <h3>⚠️ Red Flags to Watch For</h3>
    <ul>
      <li>Operator unwilling to provide clear answers about fees or contracts</li>
      <li>High-pressure sales tactics or rush to sign contracts</li>
      <li>Significant changes to fees or terms from initial discussions</li>
      <li>Poor maintenance or cleanliness of common areas</li>
      <li>Negative feedback from multiple current residents</li>
      <li>Unclear exit process or refund timeline</li>
      <li>Contract terms that heavily favor the operator</li>
      <li>Lack of transparency about financial stability of the operator</li>
    </ul>
  </div>

  <div class="warning-box" style="background: #EFF6FF; border-color: #3B82F6;">
    <h3 style="color: #1E3A8A;">💡 Next Steps After Using This Checklist</h3>
    <ul style="color: #1E40AF;">
      <li><strong>Compare villages:</strong> Use this checklist for 2-3 different villages</li>
      <li><strong>Get legal advice:</strong> Have a solicitor review the contract before signing</li>
      <li><strong>Seek financial advice:</strong> Consult with a financial advisor about affordability</li>
      <li><strong>Visit multiple times:</strong> See the village at different times of day/week</li>
      <li><strong>Review with family:</strong> Discuss your findings with trusted family members</li>
      <li><strong>Use RetirePath:</strong> Compare contracts and costs at www.retirepath.com.au</li>
    </ul>
  </div>

  <div class="footer">
    <p><strong>RetirePath</strong> - Your retirement village transition guide</p>
    <p>Download more resources and compare villages at <strong>www.retirepath.com.au</strong></p>
    <p style="margin-top: 15px; font-size: 12px;">This checklist is for informational purposes only and does not constitute legal or financial advice.</p>
    <p style="font-size: 12px;">RetirePath acknowledges the Traditional Custodians of Country throughout Australia.</p>
  </div>

  <div class="no-print" style="text-align: center; margin: 30px 0;">
    <button onclick="window.print()" style="background: #2D6A4F; color: white; padding: 12px 30px; border: none; border-radius: 5px; font-size: 16px; cursor: pointer;">
      Print or Save as PDF
    </button>
  </div>
</body>
</html>`;
}

// Material generation functions imported from marketing-materials-generators.ts
// Week 2 and Week 3 generators now complete!
