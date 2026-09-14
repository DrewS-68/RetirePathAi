import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Disclaimer } from './ui/disclaimer';
import { Checkbox } from './ui/checkbox';
import { UserData } from '../App';
import { 
  FileText,
  Upload,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  Download,
  Plus,
  X,
  AlertTriangle
} from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './ui/select';

interface ContractData {
  villageName: string;
  tenureType: 'loan-license' | 'lease' | 'freehold' | 'rental';
  entryPrice: number;
  monthlyFees: number;
  dmfRate: number;
  dmfCapYears: number;
  dmfStructure: 'annual' | 'lump-sum' | 'capped-annual' | 'fixed-percentage' | 'exit-only';
  exitFee: number;
  capitalGainShare: number;
  refundableDeposit: boolean;
  ongoingFeeIncrease: number;
}

interface UserData {
  name?: string;
  age?: number;
  timeline?: string;
  budget?: string;
}

interface ContractReviewProps {
  userData: UserData | null;
}

export function ContractReview({ userData }: ContractReviewProps) {
  const [contracts, setContracts] = useState<ContractData[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadMessage, setUploadMessage] = useState('');
  const [hasAcknowledged, setHasAcknowledged] = useState(false);
  const [formData, setFormData] = useState<ContractData>({
    villageName: '',
    tenureType: 'loan-license',
    entryPrice: 0,
    monthlyFees: 0,
    dmfRate: 0,
    dmfCapYears: 0,
    dmfStructure: 'annual',
    exitFee: 0,
    capitalGainShare: 0,
    refundableDeposit: true,
    ongoingFeeIncrease: 3,
  });

  const addContract = () => {
    if (formData.villageName && formData.entryPrice > 0) {
      setContracts([...contracts, formData]);
      setFormData({
        villageName: '',
        tenureType: 'loan-license',
        entryPrice: 0,
        monthlyFees: 0,
        dmfRate: 0,
        dmfCapYears: 0,
        dmfStructure: 'annual',
        exitFee: 0,
        capitalGainShare: 0,
        refundableDeposit: true,
        ongoingFeeIncrease: 3,
      });
      setShowAddForm(false);
    }
  };

  const removeContract = (index: number) => {
    setContracts(contracts.filter((_, i) => i !== index));
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    if (file.type !== 'application/pdf') {
      setUploadStatus('error');
      setUploadMessage('Please upload a PDF file');
      return;
    }

    // Check file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setUploadStatus('error');
      setUploadMessage('File size must be less than 10MB');
      return;
    }

    setUploadStatus('uploading');
    setUploadMessage('Analyzing your contract...');

    // Simulate PDF processing
    // In a real implementation, this would send the PDF to a backend API
    setTimeout(() => {
      setUploadStatus('error');
      setUploadMessage('PDF upload and AI extraction is coming soon! Please use Manual Entry for now.');
    }, 2000);
  };

  const downloadComparisonReport = () => {
    const reportHTML = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>RetirePath Contract Comparison Report</title>
<style>
body{font-family:Arial,sans-serif;padding:40px;max-width:1200px;margin:0 auto}
h1{color:#1B4332;border-bottom:3px solid #2D6A4F;padding-bottom:10px}
h2{color:#2D6A4F;margin-top:30px}
table{width:100%;border-collapse:collapse;margin:20px 0}
th,td{border:1px solid #ddd;padding:12px;text-align:left}
th{background-color:#2D6A4F;color:white}
tr:nth-child(even){background-color:#f9f9f9}
.highlight{background-color:#D8F3DC;font-weight:bold}
.footer{margin-top:40px;padding:20px;background-color:#f3f4f6;border-left:4px solid #2D6A4F}
.date{color:#666;font-size:14px}
@media print{body{padding:20px}.no-print{display:none}}
</style></head><body>
<h1>🏡 RetirePath Contract Comparison Report</h1>
<p class="date">Generated: ${new Date().toLocaleDateString('en-AU',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</p>
${userData?.name ? `<p><strong>Prepared for:</strong> ${userData.name}</p>` : ''}
<h2>Contract Overview</h2><table><thead><tr><th>Feature</th>
${contracts.map(c=>`<th>${c.villageName}</th>`).join('')}</tr></thead><tbody>
<tr><td><strong>Tenure Type</strong></td>${contracts.map(c=>`<td>${c.tenureType==='loan-license'?'Loan/License':c.tenureType==='freehold'?'Freehold/Strata':c.tenureType==='lease'?'Leasehold':'Rental'}</td>`).join('')}</tr>
<tr><td><strong>Entry Price</strong></td>${contracts.map(c=>`<td>$${c.entryPrice.toLocaleString()}</td>`).join('')}</tr>
<tr><td><strong>Monthly Fees</strong></td>${contracts.map(c=>`<td>$${c.monthlyFees.toLocaleString()}/month</td>`).join('')}</tr>
<tr><td><strong>DMF Rate</strong></td>${contracts.map(c=>`<td>${c.tenureType==='freehold'||c.tenureType==='rental'?'N/A':`${c.dmfRate}% per year`}</td>`).join('')}</tr>
<tr><td><strong>DMF Cap</strong></td>${contracts.map(c=>`<td>${c.tenureType==='freehold'||c.tenureType==='rental'?'N/A':`${c.dmfCapYears} years (${c.dmfRate*c.dmfCapYears}% max)`}</td>`).join('')}</tr>
<tr><td><strong>Capital Gain Share</strong></td>${contracts.map(c=>`<td>${c.capitalGainShare}% to you</td>`).join('')}</tr>
</tbody></table>
<h2>Cost Projections</h2>${[5,10,15].map(years=>`<h3>After ${years} Years</h3><table><thead><tr>
<th>Village</th><th>Entry Cost</th><th>Monthly Fees</th><th>DMF</th><th>Total Cost</th><th>Est. Refund</th>
</tr></thead><tbody>${contracts.map(contract=>{const costs=calculateTotalCost(contract,years);
return `<tr><td><strong>${contract.villageName}</strong></td><td>$${costs.entry.toLocaleString()}</td>
<td>$${costs.monthly.toLocaleString()}</td><td>$${costs.dmf.toLocaleString()}</td>
<td><strong>$${costs.total.toLocaleString()}</strong></td>
<td>${contract.tenureType==='rental'?'N/A':`$${costs.netRefund.toLocaleString()}`}</td></tr>`;}).join('')}</tbody></table>`).join('')}
<h2>Inheritance Impact (10 Year Projection)</h2><p><em>Assuming 3% annual property appreciation</em></p>
<table><thead><tr><th>Village</th><th>Base Refund</th><th>Capital Gain Share</th><th>Total to Estate</th><th>Village Receives</th>
</tr></thead><tbody>${contracts.map(contract=>{const inheritance=calculateInheritance(contract,10,3);
return `<tr><td><strong>${contract.villageName}</strong></td><td>$${inheritance.baseRefund.toLocaleString()}</td>
<td>$${inheritance.capitalGainShare?.toLocaleString()||'0'}</td>
<td class="highlight">$${inheritance.totalToEstate.toLocaleString()}</td>
<td>$${inheritance.villageReceives.toLocaleString()}</td></tr>`;}).join('')}</tbody></table>
<div class="footer"><h3>⚠️ Important Disclaimer</h3>
<p>This report is generated by RetirePath for informational purposes only. It is NOT financial or legal advice.</p>
<p><strong>You must:</strong></p><ul>
<li>Seek independent legal advice before signing any retirement village contract</li>
<li>Consult a financial advisor about your specific circumstances</li>
<li>Verify all contract details with the retirement village operator</li>
<li>Read the full contract and disclosure statement carefully</li></ul>
<p>RetirePath makes no warranties about the accuracy of calculations based on the data you provided.</p>
<p style="margin-top:20px"><strong>Generated by RetirePath</strong> - Your retirement village transition guide</p></div>
<div class="no-print" style="margin-top:30px;text-align:center">
<button onclick="window.print()" style="background-color:#2D6A4F;color:white;padding:12px 24px;border:none;border-radius:6px;font-size:16px;cursor:pointer">Print or Save as PDF</button>
</div></body></html>`;
    const reportWindow = window.open('', '_blank');
    if (reportWindow) {
      reportWindow.document.write(reportHTML);
      reportWindow.document.close();
    } else {
      alert('Please allow pop-ups to download the report');
    }
  };

  const calculateTotalCost = (contract: ContractData, years: number) => {
    // Calculate DMF based on structure
    let dmfAmount = 0;
    if (contract.tenureType === 'loan-license' || contract.tenureType === 'lease') {
      if (contract.dmfStructure === 'annual' || contract.dmfStructure === 'capped-annual') {
        const dmfYears = Math.min(years, contract.dmfCapYears || years);
        dmfAmount = contract.entryPrice * (contract.dmfRate / 100) * dmfYears;
      } else if (contract.dmfStructure === 'fixed-percentage') {
        dmfAmount = contract.entryPrice * (contract.dmfRate / 100);
      } else if (contract.dmfStructure === 'exit-only') {
        dmfAmount = contract.entryPrice * (contract.dmfRate / 100);
      }
    }
    
    // Calculate monthly fees with annual increases
    let monthlyTotal = 0;
    let currentMonthlyFee = contract.monthlyFees;
    for (let year = 0; year < years; year++) {
      monthlyTotal += currentMonthlyFee * 12;
      currentMonthlyFee *= (1 + contract.ongoingFeeIncrease / 100);
    }
    
    return {
      entry: contract.entryPrice,
      monthly: monthlyTotal,
      dmf: dmfAmount,
      exit: contract.exitFee,
      total: contract.entryPrice + monthlyTotal + dmfAmount + contract.exitFee,
      netRefund: contract.tenureType === 'rental' ? 0 : contract.entryPrice - dmfAmount - contract.exitFee
    };
  };

  const calculateInheritance = (
    contract: ContractData, 
    years: number, 
    propertyAppreciation: number = 0 // percentage increase in property value
  ) => {
    const costs = calculateTotalCost(contract, years);
    
    // Calculate new property value if there's appreciation
    const currentPropertyValue = contract.entryPrice * (1 + propertyAppreciation / 100);
    const capitalGain = currentPropertyValue - contract.entryPrice;
    const residentShareOfGain = capitalGain * (contract.capitalGainShare / 100);
    
    // Base refund (entry price minus DMF and exit fees)
    let baseRefund = costs.netRefund;
    
    // For rental model, there's no refund
    if (contract.tenureType === 'rental') {
      return {
        baseRefund: 0,
        capitalGainShare: 0,
        totalToEstate: 0,
        villageReceives: currentPropertyValue,
        propertyValue: currentPropertyValue,
        explanation: 'Rental model - no refund of entry costs'
      };
    }
    
    // For freehold, family gets full property value
    if (contract.tenureType === 'freehold') {
      return {
        baseRefund: currentPropertyValue,
        capitalGainShare: 0,
        totalToEstate: currentPropertyValue,
        villageReceives: 0,
        propertyValue: currentPropertyValue,
        explanation: 'Freehold - estate owns property outright'
      };
    }
    
    // For loan-license and lease models
    const totalToEstate = baseRefund + residentShareOfGain;
    const villageReceives = currentPropertyValue - totalToEstate;
    
    return {
      baseRefund,
      capitalGainShare: residentShareOfGain,
      totalToEstate,
      villageReceives,
      propertyValue: currentPropertyValue,
      dmfPaid: costs.dmf,
      exitFeePaid: costs.exit,
      explanation: `${contract.tenureType === 'loan-license' ? 'Loan/License' : 'Lease'} model - refund minus DMF and fees`
    };
  };

  const getBestValue = (field: keyof ContractData) => {
    if (contracts.length === 0) return null;
    
    const values = contracts.map(c => c[field] as number);
    const best = field === 'capitalGainShare' ? Math.max(...values) : Math.min(...values);
    return best;
  };

  const getComparisonIcon = (value: number, field: keyof ContractData) => {
    if (contracts.length < 2) return <Minus className="size-4 text-gray-400" />;
    
    const best = getBestValue(field);
    if (best === null) return <Minus className="size-4 text-gray-400" />;
    
    if (field === 'capitalGainShare') {
      if (value === best) return <CheckCircle className="size-4 text-green-600" />;
      if (value < best * 0.8) return <TrendingDown className="size-4 text-red-600" />;
      return <Minus className="size-4 text-orange-400" />;
    } else {
      if (value === best) return <CheckCircle className="size-4 text-green-600" />;
      if (value > best * 1.2) return <TrendingUp className="size-4 text-red-600" />;
      return <Minus className="size-4 text-orange-400" />;
    }
  };

  return (
    <div className="space-y-8">
        <div>
          <h2 className="mb-2">Contract Analyzer Tool</h2>
          <p className="text-muted-foreground">
            Analyze and compare contract details from different retirement villages. This tool helps you understand key terms and costs.
          </p>
        </div>

      {/* ⚠️ CRITICAL WARNING DISCLAIMER - Must acknowledge before using tool */}
      {!hasAcknowledged ? (
        <Card className="p-6 border-red-200 bg-red-50">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="size-8 text-red-600 flex-shrink-0 mt-1" />
              <div className="space-y-3 flex-1">
                <h3 className="text-lg font-semibold text-red-900">⚠️ IMPORTANT: THIS IS NOT LEGAL ADVICE</h3>
                
                <div className="bg-white p-4 rounded border border-red-200 space-y-3">
                  <p className="text-sm font-semibold text-red-900">
                    RetirePath:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                    <li><strong>Is NOT a law firm</strong> and does not provide legal advice</li>
                    <li><strong>Uses AI technology</strong> which may contain errors or omissions</li>
                    <li><strong>Does NOT verify</strong> the accuracy of contract terms</li>
                    <li><strong>Cannot assess</strong> your specific legal situation</li>
                  </ul>
                </div>

                <div className="bg-amber-50 border border-amber-300 p-4 rounded space-y-2">
                  <p className="text-sm font-semibold text-amber-900">
                    ⚠️ YOU MUST:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-amber-900">
                    <li>Consult a qualified <strong>solicitor experienced in retirement village law</strong> before making any decisions</li>
                    <li><strong>Do NOT sign any contract</strong> without independent legal review</li>
                    <li>Understand this analysis is for <strong>general information only</strong></li>
                  </ul>
                </div>

                <div className="flex items-start gap-3 p-4 bg-white rounded border border-gray-200 mt-4">
                  <Checkbox
                    id="acknowledge-contract-tool"
                    checked={hasAcknowledged}
                    onCheckedChange={(checked) => setHasAcknowledged(checked === true)}
                    className="mt-1"
                  />
                  <label 
                    htmlFor="acknowledge-contract-tool" 
                    className="text-sm cursor-pointer flex-1 select-none"
                  >
                    <strong>I understand and acknowledge that:</strong>
                    <ul className="list-disc pl-5 mt-2 space-y-1 text-muted-foreground">
                      <li>This tool does NOT provide legal advice</li>
                      <li>AI analysis may contain errors or be incomplete</li>
                      <li>I MUST consult a qualified solicitor before signing any contract</li>
                      <li>I will NOT rely solely on this tool for legal decisions</li>
                      <li>RetirePath is not liable for decisions I make based on this analysis</li>
                    </ul>
                  </label>
                </div>

                <Button 
                  onClick={() => setHasAcknowledged(true)}
                  disabled={!hasAcknowledged}
                  className="w-full bg-red-600 hover:bg-red-700"
                >
                  I Understand - Continue to Tool
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ) : (
        <>
      {/* Secondary Disclaimer (after acknowledgment) */}
      <Disclaimer variant="warning" title="Legal Disclaimer">
        <p className="mb-2">
          <strong>This tool provides general information and analysis only.</strong> The AI-generated contract analysis, risk assessments, and comparisons are not legal advice and should not be relied upon as a substitute for professional legal, financial, or tax advice.
        </p>
        <p className="mb-2">
          Retirement village contracts are complex legal documents with significant financial implications. We strongly recommend that you:
        </p>
        <ul className="list-disc pl-5 mb-2 space-y-1">
          <li>Have any contract reviewed by an independent solicitor experienced in retirement village law</li>
          <li>Seek financial advice from a qualified financial advisor</li>
          <li>Understand all terms, fees, and exit conditions before signing</li>
          <li>Take sufficient time to read and understand the entire contract</li>
        </ul>
        <p>
          RetirePath and its AI analysis tool accept no liability for any decisions made based on the information provided. The accuracy of analysis depends on the accuracy and completeness of information you provide.
        </p>
      </Disclaimer>

      <Tabs defaultValue="manual" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="manual">Manual Entry</TabsTrigger>
          <TabsTrigger value="upload">Upload Contract</TabsTrigger>
        </TabsList>

        <TabsContent value="manual" className="space-y-4">
          <Card className="p-6">
            {!showAddForm ? (
              <Button onClick={() => setShowAddForm(true)} className="w-full">
                <Plus className="size-4 mr-2" />
                Add Contract Details
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3>Enter Contract Details</h3>
                  <Button variant="ghost" size="sm" onClick={() => setShowAddForm(false)}>
                    <X className="size-4" />
                  </Button>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="villageName">Retirement Village Name</Label>
                    <Input
                      id="villageName"
                      value={formData.villageName}
                      onChange={(e) => setFormData({ ...formData, villageName: e.target.value })}
                      placeholder="e.g., Sunshine Gardens Retirement Village"
                      className="mt-2"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="tenureType">Ownership/Tenure Model</Label>
                    <Select
                      value={formData.tenureType}
                      onValueChange={(value) => setFormData({ ...formData, tenureType: value })}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="loan-license">Loan/License (Most Common - DMF applies)</SelectItem>
                        <SelectItem value="freehold">Freehold/Strata Title (You own the unit)</SelectItem>
                        <SelectItem value="lease">Leasehold (Fixed term lease)</SelectItem>
                        <SelectItem value="rental">Rental (Ongoing rent, no ownership)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formData.tenureType === 'loan-license' && 'You pay an ingoing contribution and receive a refund when you leave, minus DMF'}
                      {formData.tenureType === 'freehold' && 'You own the property outright - full value goes to your estate'}
                      {formData.tenureType === 'lease' && 'You lease the property for a fixed term, typically with DMF on exit'}
                      {formData.tenureType === 'rental' && 'You rent the unit - no entry cost but no refund on exit'}
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="entryPrice">
                      {formData.tenureType === 'rental' ? 'Security Deposit' : 'Entry Price / Ingoing Contribution'}
                    </Label>
                    <div className="relative mt-2">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input
                        id="entryPrice"
                        type="number"
                        value={formData.entryPrice || ''}
                        onChange={(e) => setFormData({ ...formData, entryPrice: parseFloat(e.target.value) || 0 })}
                        placeholder="450000"
                        className="pl-7"
                        disabled={formData.tenureType === 'rental'}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="monthlyFees">
                      {formData.tenureType === 'rental' ? 'Monthly Rent' : 'Monthly Service Fees'}
                    </Label>
                    <div className="relative mt-2">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input
                        id="monthlyFees"
                        type="number"
                        value={formData.monthlyFees || ''}
                        onChange={(e) => setFormData({ ...formData, monthlyFees: parseFloat(e.target.value) || 0 })}
                        placeholder="450"
                        className="pl-7"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="ongoingFeeIncrease">Annual Fee Increase</Label>
                    <div className="relative mt-2">
                      <Input
                        id="ongoingFeeIncrease"
                        type="number"
                        step="0.1"
                        value={formData.ongoingFeeIncrease || ''}
                        onChange={(e) => setFormData({ ...formData, ongoingFeeIncrease: parseFloat(e.target.value) || 0 })}
                        placeholder="3"
                        className="pr-7"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Typical: 2-4% per year</p>
                  </div>

                  {(formData.tenureType === 'loan-license' || formData.tenureType === 'lease') && (
                    <>
                      <div className="md:col-span-2">
                        <Label htmlFor="dmfStructure">DMF Calculation Structure</Label>
                        <Select
                          value={formData.dmfStructure}
                          onValueChange={(value) => setFormData({ ...formData, dmfStructure: value })}
                        >
                          <SelectTrigger className="mt-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="annual">Annual Accrual (e.g., 5% per year)</SelectItem>
                            <SelectItem value="capped-annual">Annual Accrual with Cap (e.g., 5% per year, max 30%)</SelectItem>
                            <SelectItem value="fixed-percentage">Fixed Percentage (e.g., 25% regardless of stay)</SelectItem>
                            <SelectItem value="exit-only">Exit Fee Only (charged on departure)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="dmfRate">Deferred Management Fee (% per year or total %)</Label>
                        <div className="relative mt-2">
                          <Input
                            id="dmfRate"
                            type="number"
                            step="0.5"
                            value={formData.dmfRate || ''}
                            onChange={(e) => setFormData({ ...formData, dmfRate: parseFloat(e.target.value) || 0 })}
                            placeholder="5"
                            className="pr-7"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                        </div>
                      </div>

                      {(formData.dmfStructure === 'annual' || formData.dmfStructure === 'capped-annual') && (
                        <div>
                          <Label htmlFor="dmfCapYears">DMF Cap (years)</Label>
                          <Input
                            id="dmfCapYears"
                            type="number"
                            value={formData.dmfCapYears || ''}
                            onChange={(e) => setFormData({ ...formData, dmfCapYears: parseFloat(e.target.value) || 0 })}
                            placeholder="6"
                            className="mt-2"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Max DMF: {formData.dmfRate * (formData.dmfCapYears || 0)}%
                          </p>
                        </div>
                      )}
                    </>
                  )}

                  <div>
                    <Label htmlFor="exitFee">Exit Fee (fixed amount)</Label>
                    <div className="relative mt-2">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input
                        id="exitFee"
                        type="number"
                        value={formData.exitFee || ''}
                        onChange={(e) => setFormData({ ...formData, exitFee: parseFloat(e.target.value) || 0 })}
                        placeholder="0"
                        className="pl-7"
                        disabled={formData.tenureType === 'freehold' || formData.tenureType === 'rental'}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="capitalGainShare">Your Share of Capital Gain</Label>
                    <div className="relative mt-2">
                      <Input
                        id="capitalGainShare"
                        type="number"
                        value={formData.capitalGainShare || ''}
                        onChange={(e) => setFormData({ ...formData, capitalGainShare: parseFloat(e.target.value) || 0 })}
                        placeholder="50"
                        className="pr-7"
                        disabled={formData.tenureType === 'rental'}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formData.tenureType === 'freehold' && 'Freehold: You receive 100% of gains'}
                      {formData.tenureType === 'rental' && 'Rental: No capital gain share'}
                      {(formData.tenureType === 'loan-license' || formData.tenureType === 'lease') && 'Typically 0-50%'}
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="refundableDeposit">Refundable Deposit</Label>
                    <select
                      id="refundableDeposit"
                      value={formData.refundableDeposit ? 'yes' : 'no'}
                      onChange={(e) => setFormData({ ...formData, refundableDeposit: e.target.value === 'yes' })}
                      className="mt-2"
                    >
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={addContract} className="flex-1">
                    Add Contract
                  </Button>
                  <Button variant="outline" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="upload" className="space-y-4">
          <Card className="p-6">
            <div className="text-center py-8">
              <div className="mx-auto bg-blue-100 size-16 rounded-full flex items-center justify-center mb-4">
                <Upload className="size-8 text-blue-600" />
              </div>
              <h3 className="mb-2">Upload Contract PDF</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Our AI will extract and analyze key terms from your contract
              </p>
              
              <input
                type="file"
                id="contract-upload"
                accept=".pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
              
              <label htmlFor="contract-upload">
                <Button asChild disabled={uploadStatus === 'uploading'}>
                  <span className="cursor-pointer">
                    <Upload className="size-4 mr-2" />
                    {uploadStatus === 'uploading' ? 'Analyzing...' : 'Choose File'}
                  </span>
                </Button>
              </label>

              {uploadMessage && (
                <Alert className={`mt-4 ${uploadStatus === 'error' ? 'border-red-500' : 'border-blue-500'}`}>
                  <AlertCircle className="size-4" />
                  <AlertDescription>{uploadMessage}</AlertDescription>
                </Alert>
              )}

              <p className="text-xs text-muted-foreground mt-4">
                Supported formats: PDF, up to 10MB
              </p>
              
              <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> PDF upload and AI extraction is coming soon! 
                  Please use the <strong>Manual Entry</strong> tab to add your contract details for now.
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Contract Comparison */}
      {contracts.length > 0 && (
        <>
          <div>
            <h3 className="mb-4">Contract Comparison</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 bg-gray-50">Feature</th>
                    {contracts.map((contract, index) => (
                      <th key={index} className="text-left p-3 bg-gray-50 min-w-[200px]">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="block">{contract.villageName}</span>
                            <span className="text-xs font-normal text-muted-foreground">
                              {contract.tenureType === 'loan-license' && 'Loan/License'}
                              {contract.tenureType === 'freehold' && 'Freehold'}
                              {contract.tenureType === 'lease' && 'Lease'}
                              {contract.tenureType === 'rental' && 'Rental'}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeContract(index)}
                          >
                            <X className="size-4" />
                          </Button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-3">Tenure Type</td>
                    {contracts.map((contract, index) => (
                      <td key={index} className="p-3">
                        <span className="text-sm">
                          {contract.tenureType === 'loan-license' && 'Loan/License'}
                          {contract.tenureType === 'freehold' && 'Freehold/Strata'}
                          {contract.tenureType === 'lease' && 'Leasehold'}
                          {contract.tenureType === 'rental' && 'Rental'}
                        </span>
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b bg-gray-50">
                    <td className="p-3">Entry Price</td>
                    {contracts.map((contract, index) => (
                      <td key={index} className="p-3">
                        <div className="flex items-center gap-2">
                          {getComparisonIcon(contract.entryPrice, 'entryPrice')}
                          <span>{contract.tenureType === 'rental' ? 'N/A' : `$${contract.entryPrice.toLocaleString()}`}</span>
                        </div>
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="p-3">Monthly Fees</td>
                    {contracts.map((contract, index) => (
                      <td key={index} className="p-3">
                        <div className="flex items-center gap-2">
                          {getComparisonIcon(contract.monthlyFees, 'monthlyFees')}
                          <span>${contract.monthlyFees.toLocaleString()}/month</span>
                        </div>
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b bg-gray-50">
                    <td className="p-3">DMF Rate</td>
                    {contracts.map((contract, index) => (
                      <td key={index} className="p-3">
                        <div className="flex items-center gap-2">
                          {getComparisonIcon(contract.dmfRate, 'dmfRate')}
                          <div>
                            {contract.tenureType === 'freehold' || contract.tenureType === 'rental' ? (
                              <span>N/A</span>
                            ) : (
                              <>
                                <span>{contract.dmfRate}%</span>
                                <span className="text-xs text-muted-foreground block">
                                  {contract.dmfStructure === 'annual' && 'per year'}
                                  {contract.dmfStructure === 'capped-annual' && `per year (capped)`}
                                  {contract.dmfStructure === 'fixed-percentage' && 'fixed'}
                                  {contract.dmfStructure === 'exit-only' && 'on exit'}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b bg-gray-50">
                    <td className="p-3">DMF Cap</td>
                    {contracts.map((contract, index) => (
                      <td key={index} className="p-3">
                        <div className="flex items-center gap-2">
                          {contract.tenureType !== 'freehold' && contract.tenureType !== 'rental' && 
                            getComparisonIcon(contract.dmfCapYears, 'dmfCapYears')}
                          {contract.tenureType === 'freehold' || contract.tenureType === 'rental' ? (
                            <span>N/A</span>
                          ) : (
                            <span>
                              {contract.dmfStructure === 'capped-annual' || contract.dmfStructure === 'annual' 
                                ? `${contract.dmfCapYears} years (${contract.dmfRate * contract.dmfCapYears}% max)`
                                : contract.dmfStructure === 'fixed-percentage' 
                                ? `${contract.dmfRate}% total`
                                : `${contract.dmfRate}%`}
                            </span>
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="p-3">Exit Fee</td>
                    {contracts.map((contract, index) => (
                      <td key={index} className="p-3">
                        <div className="flex items-center gap-2">
                          {getComparisonIcon(contract.exitFee, 'exitFee')}
                          <span>${contract.exitFee.toLocaleString()}</span>
                        </div>
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="p-3">Capital Gain Share</td>
                    {contracts.map((contract, index) => (
                      <td key={index} className="p-3">
                        <div className="flex items-center gap-2">
                          {getComparisonIcon(contract.capitalGainShare, 'capitalGainShare')}
                          <span>{contract.capitalGainShare}% to you</span>
                        </div>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Cost Projections */}
          <div>
            <h3 className="mb-4">Cost Projections</h3>
            <div className="grid md:grid-cols-3 gap-6">
              {[5, 10, 15].map(years => (
                <Card key={years} className="p-6">
                  <h4 className="mb-4">After {years} Years</h4>
                  {contracts.map((contract, index) => {
                    const costs = calculateTotalCost(contract, years);
                    return (
                      <div key={index} className="mb-6 last:mb-0">
                        <p className="mb-2">{contract.villageName}</p>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between text-muted-foreground">
                            <span>Monthly fees paid:</span>
                            <span>${costs.monthly.toLocaleString()}</span>
                          </div>
                          {contract.tenureType !== 'rental' && contract.tenureType !== 'freehold' && (
                            <div className="flex justify-between text-muted-foreground">
                              <span>DMF accumulated:</span>
                              <span>${costs.dmf.toLocaleString()}</span>
                            </div>
                          )}
                          {contract.exitFee > 0 && (
                            <div className="flex justify-between text-muted-foreground">
                              <span>Exit fee:</span>
                              <span>${costs.exit.toLocaleString()}</span>
                            </div>
                          )}
                          {contract.tenureType !== 'rental' && (
                            <div className="flex justify-between pt-2 border-t">
                              <span>Net refund:</span>
                              <span className="font-semibold">${costs.netRefund.toLocaleString()}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </Card>
              ))}
            </div>
          </div>

          {/* Inheritance Calculator */}
          <div>
            <h3 className="mb-4">Inheritance Calculator - What Your Children Will Receive</h3>
            <p className="text-muted-foreground mb-6">
              Calculate what will be returned to your estate (and inherited by your children/beneficiaries) 
              when you leave or pass away, under different time periods and property value scenarios.
            </p>
            
            {[
              { years: 5, appreciation: 0, label: '5 Years (No Price Change)' },
              { years: 10, appreciation: 15, label: '10 Years (15% Appreciation)' },
              { years: 15, appreciation: 30, label: '15 Years (30% Appreciation)' },
            ].map((scenario, scenarioIndex) => (
              <Card key={scenarioIndex} className="p-6 mb-6">
                <h4 className="mb-4">{scenario.label}</h4>
                <div className="space-y-6">
                  {contracts.map((contract, index) => {
                    const inheritance = calculateInheritance(contract, scenario.years, scenario.appreciation);
                    const isPositive = inheritance.totalToEstate > 0;
                    
                    return (
                      <div key={index} className="pb-6 border-b last:border-b-0">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="mb-1">{contract.villageName}</p>
                            <p className="text-xs text-muted-foreground">{inheritance.explanation}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Total to Estate</p>
                            <p className={`text-2xl ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                              ${inheritance.totalToEstate.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <div className="space-y-2">
                            <div className="bg-blue-50 p-3 rounded">
                              <p className="text-xs text-muted-foreground mb-1">Current Property Value</p>
                              <p className="font-semibold">${inheritance.propertyValue.toLocaleString()}</p>
                            </div>
                            
                            {contract.tenureType !== 'rental' && (
                              <div className="bg-green-50 p-3 rounded">
                                <p className="text-xs text-muted-foreground mb-1">Base Refund (Entry - DMF - Fees)</p>
                                <p className="font-semibold text-green-700">${inheritance.baseRefund.toLocaleString()}</p>
                              </div>
                            )}
                            
                            {contract.capitalGainShare > 0 && inheritance.capitalGainShare > 0 && (
                              <div className="bg-green-50 p-3 rounded">
                                <p className="text-xs text-muted-foreground mb-1">
                                  Your Share of Capital Gain ({contract.capitalGainShare}%)
                                </p>
                                <p className="font-semibold text-green-700">+${inheritance.capitalGainShare.toLocaleString()}</p>
                              </div>
                            )}
                          </div>
                          
                          <div className="space-y-2">
                            {inheritance.dmfPaid !== undefined && inheritance.dmfPaid > 0 && (
                              <div className="bg-red-50 p-3 rounded">
                                <p className="text-xs text-muted-foreground mb-1">DMF Paid to Village</p>
                                <p className="font-semibold text-red-700">-${inheritance.dmfPaid.toLocaleString()}</p>
                              </div>
                            )}
                            
                            {inheritance.exitFeePaid !== undefined && inheritance.exitFeePaid > 0 && (
                              <div className="bg-red-50 p-3 rounded">
                                <p className="text-xs text-muted-foreground mb-1">Exit Fee</p>
                                <p className="font-semibold text-red-700">-${inheritance.exitFeePaid.toLocaleString()}</p>
                              </div>
                            )}
                            
                            <div className="bg-orange-50 p-3 rounded">
                              <p className="text-xs text-muted-foreground mb-1">Village Receives/Keeps</p>
                              <p className="font-semibold text-orange-700">${inheritance.villageReceives.toLocaleString()}</p>
                            </div>
                          </div>
                        </div>
                        
                        <Alert className="mt-4">
                          <AlertCircle className="size-4" />
                          <AlertDescription className="text-xs">
                            {contract.tenureType === 'freehold' && 
                              'Freehold ownership means your estate receives the full property value. Your children can sell it or keep it as an investment.'}
                            {contract.tenureType === 'loan-license' && 
                              `After ${scenario.years} years, your children will inherit $${inheritance.totalToEstate.toLocaleString()}. The village keeps $${inheritance.villageReceives.toLocaleString()} (DMF + their share of gains).`}
                            {contract.tenureType === 'lease' && 
                              `Leasehold model: Your estate receives the refund minus DMF. The lease reverts to the village.`}
                            {contract.tenureType === 'rental' && 
                              'Rental model: No refund to estate. All payments are for accommodation and services only.'}
                          </AlertDescription>
                        </Alert>
                      </div>
                    );
                  })}
                </div>
              </Card>
            ))}
            
            <Alert>
              <AlertCircle className="size-4" />
              <AlertDescription>
                <strong>Important Estate Planning Notes:</strong>
                <ul className="mt-2 space-y-1 text-sm list-disc list-inside">
                  <li>Refunds can take 6-18 months after the unit is resold to a new resident</li>
                  <li>If you move to aged care, similar exit terms apply</li>
                  <li>Monthly fees paid are not refundable - these are for services and amenities</li>
                  <li>Some contracts allow early buyout options - check your specific contract</li>
                  <li>Property appreciation is not guaranteed and depends on market conditions</li>
                  <li>Consult with a financial advisor about tax implications for your estate</li>
                </ul>
              </AlertDescription>
            </Alert>
          </div>

          {/* AI Analysis */}
          <Card className="p-6 bg-blue-50 border-blue-200">
            <div className="flex gap-4">
              <div className="bg-blue-600 text-white rounded-full size-10 flex items-center justify-center flex-shrink-0">
                AI
              </div>
              <div className="flex-1">
                <h3 className="mb-3">AI Analysis & Recommendations</h3>
                <div className="space-y-3 text-sm">
                  {contracts.length >= 2 && (
                    <>
                      <div className="p-3 bg-white rounded-lg">
                        <p className="font-semibold mb-2">Tenure Model Comparison:</p>
                        {contracts.some(c => c.tenureType === 'freehold') && (
                          <p className="mb-2">
                            🏆 <strong>Best for Estate Value:</strong> {contracts.find(c => c.tenureType === 'freehold')?.villageName} (Freehold) 
                            - Your children inherit the full property value, no DMF deductions.
                          </p>
                        )}
                        {contracts.filter(c => c.tenureType === 'loan-license').length > 0 && (
                          <p className="mb-2">
                            📊 <strong>Loan/License Models:</strong> These are the most common. Your refund depends heavily on DMF structure. 
                            {contracts
                              .filter(c => c.tenureType === 'loan-license')
                              .reduce((best, current) => 
                                calculateInheritance(current, 10, 15).totalToEstate > 
                                calculateInheritance(best, 10, 15).totalToEstate ? current : best
                              ).villageName} offers the best 10-year inheritance value.
                          </p>
                        )}
                        {contracts.some(c => c.tenureType === 'rental') && (
                          <p>
                            ⚠️ <strong>Rental Model:</strong> {contracts.find(c => c.tenureType === 'rental')?.villageName} has no exit refund. 
                            Better for those who want lower upfront costs and don't need to preserve capital for children.
                          </p>
                        )}
                      </div>

                      <div className="p-3 bg-white rounded-lg">
                        <p className="font-semibold mb-2">For Your Children's Inheritance:</p>
                        <p className="mb-2">
                          <strong>Short Stay (2-5 years):</strong> {
                            contracts.reduce((best, current) => {
                              const bestInheritance = calculateInheritance(best, 5, 5).totalToEstate;
                              const currentInheritance = calculateInheritance(current, 5, 5).totalToEstate;
                              return currentInheritance > bestInheritance ? current : best;
                            }).villageName
                          } preserves the most value. Lower DMF accumulation = more to your estate.
                        </p>
                        <p className="mb-2">
                          <strong>Medium Stay (6-10 years):</strong> {
                            contracts.reduce((best, current) => {
                              const bestInheritance = calculateInheritance(best, 10, 15).totalToEstate;
                              const currentInheritance = calculateInheritance(current, 10, 15).totalToEstate;
                              return currentInheritance > bestInheritance ? current : best;
                            }).villageName
                          } offers the best balance between lifestyle costs and inheritance value.
                        </p>
                        <p>
                          <strong>Long Stay (10+ years):</strong> Once DMF caps are reached, focus shifts to capital gains sharing. {
                            contracts.reduce((best, current) => 
                              current.capitalGainShare > best.capitalGainShare ? current : best
                            ).villageName
                          } has the highest capital gain share at {
                            contracts.reduce((best, current) => 
                              current.capitalGainShare > best.capitalGainShare ? current : best
                            ).capitalGainShare
                          }%.
                        </p>
                      </div>

                      <p>
                        <strong>Overall Value Assessment:</strong> {
                          contracts.reduce((best, current) => {
                            const bestCost = calculateTotalCost(contracts[best], 10);
                            const currentCost = calculateTotalCost(current, 10);
                            return currentCost.dmf + currentCost.monthly < bestCost.dmf + bestCost.monthly ? contracts.indexOf(current) : best;
                          }, 0)
                        === 0 ? contracts[0].villageName : contracts[contracts.reduce((best, current) => {
                          const bestCost = calculateTotalCost(contracts[best], 10);
                          const currentCost = calculateTotalCost(current, 10);
                          return currentCost.dmf + currentCost.monthly < bestCost.dmf + bestCost.monthly ? contracts.indexOf(current) : best;
                        }, 0)].villageName
                        } offers the lowest total costs over a 10-year period, leaving more value for your lifestyle and estate.
                      </p>
                    </>
                  )}
                  {contracts.length === 1 && (
                    <p>Add more contracts to see comparative analysis and AI recommendations.</p>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Key Things to Watch */}
          <Card className="p-6">
            <h3 className="mb-4">Key Contract Terms to Review with Your Solicitor</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="text-sm">Financial Terms</h4>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>When and how DMF is calculated</li>
                  <li>What's included in monthly fees</li>
                  <li>How often fees can be increased</li>
                  <li>Who benefits from capital gains</li>
                  <li>Costs if you move to aged care</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm">Exit Terms</h4>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Who manages the resale</li>
                  <li>How long resales typically take</li>
                  <li>When you receive your refund</li>
                  <li>Who pays for maintenance while vacant</li>
                  <li>Your obligations during exit</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm">Rights & Restrictions</h4>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Can you rent out your unit</li>
                  <li>Can you have pets</li>
                  <li>Can you make modifications</li>
                  <li>What happens if you need more care</li>
                  <li>Dispute resolution process</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm">Services & Amenities</h4>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>What services are guaranteed</li>
                  <li>What costs extra</li>
                  <li>Access to facilities</li>
                  <li>Emergency assistance coverage</li>
                  <li>Village management arrangements</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Contract Risk Analysis */}
          {contracts.length > 0 && (
            <div>
              <h3 className="mb-4">AI Risk Assessment - Contract Red Flags</h3>
              {contracts.map((contract, index) => {
                // Calculate risk factors
                const risks = [];
                const warnings = [];
                const positives = [];
                
                // Industry benchmarks
                const industryAvg = {
                  dmfRate: 5,
                  dmfCap: 30,
                  monthlyFees: 600,
                  capitalGainShare: 25,
                  entryPrice: 500000
                };

                // Check DMF rate
                if (contract.tenureType !== 'freehold' && contract.tenureType !== 'rental') {
                  if (contract.dmfRate > 7) {
                    risks.push('DMF rate significantly above industry average (5%)');
                  } else if (contract.dmfRate > 6) {
                    warnings.push('DMF rate slightly above industry average');
                  } else if (contract.dmfRate < 4 && contract.dmfRate > 0) {
                    positives.push('DMF rate below industry average - good value');
                  }
                }

                // Check DMF cap
                const totalDmfCap = contract.dmfRate * contract.dmfCapYears;
                if (contract.tenureType === 'loan-license' || contract.tenureType === 'lease') {
                  if (totalDmfCap > 35) {
                    risks.push(`Total DMF cap of ${totalDmfCap}% is very high (industry avg: 30%)`);
                  } else if (totalDmfCap > 32) {
                    warnings.push('DMF cap slightly above industry average');
                  } else if (totalDmfCap <= 25 && totalDmfCap > 0) {
                    positives.push('Low DMF cap - better capital preservation');
                  }
                }

                // Check capital gains
                if (contract.tenureType !== 'rental') {
                  if (contract.capitalGainShare === 0 && contract.tenureType !== 'freehold') {
                    risks.push('0% capital gain sharing - you get no benefit from property appreciation');
                  } else if (contract.capitalGainShare < 20 && contract.tenureType !== 'freehold') {
                    warnings.push('Low capital gain share compared to industry average (25%)');
                  } else if (contract.capitalGainShare >= 50) {
                    positives.push('50%+ capital gain sharing - excellent for estate value');
                  }
                }

                // Check monthly fees vs entry price ratio
                if (contract.entryPrice > 0) {
                  const monthlyToEntryRatio = (contract.monthlyFees * 12) / contract.entryPrice * 100;
                  if (monthlyToEntryRatio > 2) {
                    risks.push('Monthly fees are high relative to entry price');
                  } else if (monthlyToEntryRatio < 1.2) {
                    positives.push('Monthly fees are reasonable relative to entry price');
                  }
                }

                // Check for rental trap
                if (contract.tenureType === 'rental' && contract.monthlyFees > 1200) {
                  warnings.push('High rental costs with no capital return');
                }

                // Check ongoing fee increases
                if (contract.ongoingFeeIncrease > 5) {
                  risks.push(`Annual fee increases of ${contract.ongoingFeeIncrease}% will significantly impact long-term costs`);
                } else if (contract.ongoingFeeIncrease > 4) {
                  warnings.push('Fee increases above CPI - costs will grow faster than inflation');
                } else if (contract.ongoingFeeIncrease <= 3) {
                  positives.push('Reasonable fee increase structure');
                }

                // Positive for freehold
                if (contract.tenureType === 'freehold') {
                  positives.push('Freehold ownership - you own the property outright');
                  positives.push('Maximum inheritance value for your children');
                }

                // Calculate overall risk score
                const riskScore = risks.length * 3 + warnings.length * 1.5;
                const positiveScore = positives.length * 2;
                const finalScore = Math.max(0, Math.min(100, 70 - riskScore + positiveScore));
                
                let riskLevel: 'low' | 'medium' | 'high';
                let riskColor: string;
                let riskBg: string;
                
                if (finalScore >= 70) {
                  riskLevel = 'low';
                  riskColor = 'text-green-700';
                  riskBg = 'bg-green-50 border-green-300';
                } else if (finalScore >= 50) {
                  riskLevel = 'medium';
                  riskColor = 'text-amber-700';
                  riskBg = 'bg-amber-50 border-amber-300';
                } else {
                  riskLevel = 'high';
                  riskColor = 'text-red-700';
                  riskBg = 'bg-red-50 border-red-300';
                }

                return (
                  <Card key={index} className={`p-6 mb-4 border-2 ${riskBg}`}>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="mb-1">{contract.villageName}</h4>
                        <p className="text-sm text-muted-foreground">Risk Assessment vs Industry Norms</p>
                        <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded">
                          <p className="text-xs text-orange-800">
                            <strong>⚠️ DISCLAIMER:</strong> This risk score is an automated assessment only and may not reflect actual legal or financial risks. This is NOT professional advice. Consult a qualified solicitor experienced in retirement village law for proper risk assessment.
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-3xl ${riskColor}`}>{finalScore}/100</div>
                        <div className={`text-sm uppercase tracking-wider ${riskColor}`}>
                          {riskLevel === 'low' && '🟢 LOW RISK'}
                          {riskLevel === 'medium' && '🟡 MEDIUM RISK'}
                          {riskLevel === 'high' && '🔴 HIGH RISK'}
                        </div>
                      </div>
                    </div>

                    {/* Industry Comparison */}
                    <div className="mb-4 p-4 bg-white rounded-lg">
                      <h5 className="mb-3">Industry Benchmark Comparison</h5>
                      <div className="space-y-2 text-sm">
                        {contract.tenureType !== 'freehold' && contract.tenureType !== 'rental' && (
                          <>
                            <div className="flex justify-between">
                              <span>DMF Rate:</span>
                              <span>
                                {contract.dmfRate}% vs {industryAvg.dmfRate}% avg
                                {contract.dmfRate > industryAvg.dmfRate ? ' 📈 Above' : ' 📉 Below'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Total DMF Cap:</span>
                              <span>
                                {contract.dmfRate * contract.dmfCapYears}% vs {industryAvg.dmfCap}% avg
                                {(contract.dmfRate * contract.dmfCapYears) > industryAvg.dmfCap ? ' 📈 Above' : ' 📉 Below'}
                              </span>
                            </div>
                          </>
                        )}
                        <div className="flex justify-between">
                          <span>Monthly Fees:</span>
                          <span>
                            ${contract.monthlyFees} vs ${industryAvg.monthlyFees} avg
                            {contract.monthlyFees > industryAvg.monthlyFees ? ' 📈 Above' : ' 📉 Below'}
                          </span>
                        </div>
                        {contract.tenureType !== 'rental' && (
                          <div className="flex justify-between">
                            <span>Capital Gain Share:</span>
                            <span>
                              {contract.tenureType === 'freehold' ? '100%' : `${contract.capitalGainShare}%`} vs {industryAvg.capitalGainShare}% avg
                              {(contract.tenureType === 'freehold' || contract.capitalGainShare >= industryAvg.capitalGainShare) ? ' ✅ Good' : ' ⚠️ Low'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Red Flags */}
                    {risks.length > 0 && (
                      <div className="mb-3">
                        <h5 className="text-red-700 mb-2">🔴 Critical Issues:</h5>
                        <ul className="space-y-1">
                          {risks.map((risk, i) => (
                            <li key={i} className="text-sm text-red-700 flex items-start gap-2">
                              <AlertCircle className="size-4 mt-0.5 flex-shrink-0" />
                              <span>{risk}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Warnings */}
                    {warnings.length > 0 && (
                      <div className="mb-3">
                        <h5 className="text-amber-700 mb-2">🟡 Caution Points:</h5>
                        <ul className="space-y-1">
                          {warnings.map((warning, i) => (
                            <li key={i} className="text-sm text-amber-700 flex items-start gap-2">
                              <AlertCircle className="size-4 mt-0.5 flex-shrink-0" />
                              <span>{warning}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Positives */}
                    {positives.length > 0 && (
                      <div>
                        <h5 className="text-green-700 mb-2">🟢 Positive Features:</h5>
                        <ul className="space-y-1">
                          {positives.map((positive, i) => (
                            <li key={i} className="text-sm text-green-700 flex items-start gap-2">
                              <CheckCircle className="size-4 mt-0.5 flex-shrink-0" />
                              <span>{positive}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <Alert className="mt-4">
                      <AlertCircle className="size-4" />
                      <AlertDescription className="text-xs">
                        <strong>Recommendation:</strong> {
                          riskLevel === 'low' 
                            ? 'This contract appears fair and in line with industry standards. Still seek independent legal advice before signing.'
                            : riskLevel === 'medium'
                            ? 'This contract has some concerning terms. Negotiate improvements or compare with other villages. Definitely get legal advice.'
                            : 'This contract has several red flags. We strongly recommend negotiating better terms, comparing with other options, and getting thorough legal review before proceeding.'
                        }
                      </AlertDescription>
                    </Alert>
                  </Card>
                );
              })}
            </div>
          )}

          <div className="flex justify-center">
            <Button size="lg" onClick={downloadComparisonReport}>
              <Download className="size-4 mr-2" />
              Download Comparison Report
            </Button>
          </div>
        </>
      )}

      {/* Educational Content */}
      {contracts.length === 0 && (
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="mb-4">Understanding Tenure Types</h3>
            <div className="space-y-4 text-sm">
              <div>
                <p className="font-semibold mb-1">🏠 Loan/License (Most Common - ~80% of villages)</p>
                <p className="text-muted-foreground">
                  You pay an ingoing contribution (like buying in), live there, and get a refund when you leave minus the DMF. 
                  You don't own the property but have a right to occupy it. Best for those wanting security with some capital return.
                </p>
              </div>
              <div>
                <p className="font-semibold mb-1">🏡 Freehold/Strata Title (~10% of villages)</p>
                <p className="text-muted-foreground">
                  You own the property outright (like a regular home). Full property value goes to your estate. 
                  No DMF but may have higher monthly fees. Best for preserving maximum inheritance for children.
                </p>
              </div>
              <div>
                <p className="font-semibold mb-1">📜 Leasehold (~5% of villages)</p>
                <p className="text-muted-foreground">
                  You lease the property for a fixed term (often 99 years). Similar to loan/license but with lease structure. 
                  DMF typically applies on exit.
                </p>
              </div>
              <div>
                <p className="font-semibold mb-1">🔑 Rental (~5% of villages)</p>
                <p className="text-muted-foreground">
                  You pay ongoing rent with no entry cost. No refund when you leave, but more flexible. 
                  Best for those with limited capital who want to preserve savings.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="mb-4">Understanding Deferred Management Fees</h3>
            <p className="text-sm text-muted-foreground mb-4">
              The DMF is the largest cost component in most retirement village contracts. It's typically calculated as a percentage of your entry price, accumulated over time.
            </p>
            <div className="space-y-3 text-sm">
              <div className="p-3 bg-gray-50 rounded">
                <p className="mb-1"><strong>Example - Annual Accrual:</strong></p>
                <p className="text-muted-foreground">
                  Entry price: $500,000<br />
                  DMF: 5% per year capped at 6 years (30% total)<br />
                  After 6 years: DMF = $150,000<br />
                  Refund to estate: $350,000 (minus exit fees)
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <p className="mb-1"><strong>Example - Fixed Percentage:</strong></p>
                <p className="text-muted-foreground">
                  Entry price: $500,000<br />
                  DMF: 25% fixed (regardless of stay duration)<br />
                  DMF = $125,000<br />
                  Refund to estate: $375,000
                </p>
              </div>
              <Alert>
                <AlertCircle className="size-4" />
                <AlertDescription className="text-xs">
                  <strong>Tip:</strong> Lower DMF rates aren't always better. Villages with lower DMFs often have higher monthly fees. Calculate total costs over your expected stay.
                </AlertDescription>
              </Alert>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="mb-4">Capital Gains Explained</h3>
            <p className="text-sm text-muted-foreground mb-4">
              If your unit increases in value, you may share in that gain. The percentage you receive varies significantly between contracts and tenure types.
            </p>
            <div className="space-y-3 text-sm">
              <div className="p-3 bg-gray-50 rounded">
                <p className="mb-1"><strong>Example - 50% Sharing:</strong></p>
                <p className="text-muted-foreground">
                  Entry price: $500,000<br />
                  Resale price: $600,000<br />
                  Capital gain: $100,000<br />
                  Your share (50%): $50,000<br />
                  Total refund: $350,000 + $50,000 = $400,000
                </p>
              </div>
              <Alert>
                <AlertCircle className="size-4" />
                <AlertDescription className="text-xs">
                  <strong>Important:</strong> Some contracts offer 0% capital gain sharing. In these cases, all price increases go to the village operator. This significantly affects what your children inherit.
                </AlertDescription>
              </Alert>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="mb-4">What Your Children Need to Know</h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                <strong>Timeline for Refunds:</strong> When you leave or pass away, the village must resell your unit before refunding your entry contribution. This can take 6-18 months.
              </p>
              <p>
                <strong>Ongoing Costs:</strong> Some contracts require your estate to continue paying monthly fees until the unit is resold. Others cap this at 6-12 months.
              </p>
              <p>
                <strong>Maintenance:</strong> Your estate may be responsible for maintaining the unit during the resale period.
              </p>
              <p>
                <strong>No Guarantee:</strong> Capital gains are not guaranteed. If property values fall, you may receive less than your original entry price.
              </p>
              <p>
                <strong>Tax Implications:</strong> Consult with a tax advisor - retirement village transactions can have different tax treatment than regular property sales.
              </p>
            </div>
          </Card>
        </div>
      )}
      </>
      )}
    </div>
  );
}