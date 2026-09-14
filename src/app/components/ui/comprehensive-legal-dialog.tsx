import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './dialog';
import { Button } from './button';
import { Checkbox } from './checkbox';
import { AlertTriangle, FileCheck, DollarSign, MapPin, Shield } from 'lucide-react';

interface ComprehensiveLegalDialogProps {
  open: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export function ComprehensiveLegalDialog({ 
  open, 
  onAccept,
  onDecline 
}: ComprehensiveLegalDialogProps) {
  const [acknowledged, setAcknowledged] = useState(false);

  const handleAccept = () => {
    if (acknowledged) {
      onAccept();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onDecline()}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Shield className="size-6 text-blue-600" />
            Important Legal Notices & Disclaimers
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Main Warning */}
          <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded">
            <div className="flex gap-3">
              <AlertTriangle className="size-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p className="text-sm">
                  <strong>RetirePath is an information platform ONLY.</strong> We do NOT provide legal, financial, 
                  real estate, or professional advice of any kind.
                </p>
                <p className="text-sm">
                  All tools and information are for general guidance and educational purposes. You MUST consult 
                  qualified professionals before making any decisions.
                </p>
              </div>
            </div>
          </div>

          {/* Tool-Specific Disclaimers */}
          <div className="space-y-4">
            <h3 className="flex items-center gap-2">
              <FileCheck className="size-5 text-blue-600" />
              Contract Analyzer Tool
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
              <p><strong>This tool is NOT legal advice and should NOT replace professional legal review.</strong></p>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                <li>AI analysis may contain errors, omissions, or inaccuracies</li>
                <li>Risk scores are automated estimates, not professional assessments</li>
                <li>Contract interpretation requires qualified legal expertise</li>
                <li>You MUST have all retirement village contracts reviewed by a solicitor experienced in retirement living law</li>
                <li>Do not sign any contract without independent legal advice</li>
              </ul>
            </div>

            <h3 className="flex items-center gap-2">
              <DollarSign className="size-5 text-green-600" />
              Home Value Estimator Tool
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
              <p><strong>This tool is NOT a professional property valuation.</strong></p>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                <li>Estimates are automated and may be significantly inaccurate</li>
                <li>AI cannot assess property condition, improvements, or local market factors</li>
                <li>Do NOT make financial decisions based solely on this estimate</li>
                <li>You MUST obtain a professional valuation from a licensed valuer</li>
                <li>Consult a financial advisor regarding proceeds, tax implications, and retirement planning</li>
                <li>Speak to real estate agents experienced in your local market</li>
              </ul>
            </div>

            <h3 className="flex items-center gap-2">
              <MapPin className="size-5 text-purple-600" />
              Village Finder Tool
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
              <p><strong>Village matches are suggestions only, not recommendations or endorsements.</strong></p>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                <li>Matching algorithm is based on general criteria, not comprehensive assessment</li>
                <li>We do not verify village information, quality, or suitability</li>
                <li>You MUST visit villages, speak with residents, and conduct thorough due diligence</li>
                <li>Village information may be outdated or incomplete</li>
                <li>Financial analysis is illustrative only - obtain professional financial advice</li>
              </ul>
            </div>
          </div>

          {/* General Disclaimers */}
          <div className="bg-blue-50 p-4 rounded-lg space-y-3 text-sm">
            <h4>General Limitations</h4>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li><strong>No Professional Relationship:</strong> Using RetirePath does not create any professional-client relationship</li>
              <li><strong>No Liability:</strong> We are not liable for decisions you make based on information from this platform</li>
              <li><strong>Information Accuracy:</strong> We do not guarantee accuracy, completeness, or currency of any information</li>
              <li><strong>Third-Party Content:</strong> Village information, links, and resources are not vetted or endorsed by us</li>
              <li><strong>State Laws Vary:</strong> Retirement village laws differ by state/territory - seek local advice</li>
              <li><strong>AI Limitations:</strong> All AI tools have inherent limitations and can produce incorrect results</li>
            </ul>
          </div>

          {/* Professional Advice Section */}
          <div className="bg-amber-50 border-l-4 border-amber-600 p-4 rounded">
            <h4 className="mb-2">You MUST Consult These Professionals:</h4>
            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
              <li><strong>Solicitor:</strong> Experienced in retirement village law to review all contracts</li>
              <li><strong>Financial Advisor:</strong> For financial planning, tax implications, and investment advice</li>
              <li><strong>Accountant:</strong> For tax advice and financial structuring</li>
              <li><strong>Licensed Valuer:</strong> For accurate property valuation</li>
              <li><strong>Real Estate Agent:</strong> Experienced in your local market</li>
              <li><strong>Medical Professionals:</strong> For health and aged care planning</li>
            </ul>
          </div>

          {/* Acknowledgment Checkbox */}
          <div className="border-t pt-4">
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <Checkbox
                id="acknowledge"
                checked={acknowledged}
                onCheckedChange={(checked) => setAcknowledged(checked === true)}
                className="mt-1"
              />
              <label 
                htmlFor="acknowledge" 
                className="text-sm cursor-pointer flex-1 select-none"
              >
                <strong>I acknowledge and understand that:</strong>
                <ul className="list-disc pl-5 mt-2 space-y-1 text-muted-foreground">
                  <li>RetirePath does NOT provide professional advice of any kind</li>
                  <li>All tools are for information purposes only and may contain errors</li>
                  <li>I MUST consult qualified professionals before making any decisions</li>
                  <li>I will NOT rely solely on RetirePath for legal, financial, or real estate decisions</li>
                  <li>RetirePath is not liable for any decisions I make based on information from this platform</li>
                </ul>
              </label>
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={onDecline}
          >
            I Do Not Accept
          </Button>
          <Button
            onClick={handleAccept}
            disabled={!acknowledged}
            className="bg-primary hover:bg-primary/90"
          >
            I Understand & Accept
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}