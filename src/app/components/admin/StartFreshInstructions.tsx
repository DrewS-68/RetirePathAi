import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { CheckCircle, AlertCircle } from 'lucide-react';

export function StartFreshInstructions() {
  return (
    <Card className="border-4 border-blue-500 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-900">
          <CheckCircle className="size-6" />
          🎯 START FRESH - Simple 3-Step Process
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-white rounded-lg border-2 border-blue-300 p-4">
          <h3 className="font-bold text-lg mb-3 text-blue-900">Here's the clean start you need:</h3>
          
          <div className="space-y-4">
            {/* Step 1 */}
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h4 className="font-bold text-blue-900 mb-1">Get Your Master CSV (ALL 510 Villages)</h4>
                <p className="text-sm text-gray-700 mb-2">
                  Use the purple <strong>"VIC Full Database Export"</strong> card below:
                </p>
                <ul className="text-xs space-y-1 text-gray-700 ml-4">
                  <li>• Click <strong>"Check & Export ALL VIC Operators"</strong></li>
                  <li>• Download the <strong className="text-green-600">GREEN button: "✅ Download WITH Operators"</strong> (this will have 425+ villages)</li>
                  <li>• This is your MASTER CSV with ALL current operator data</li>
                </ul>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h4 className="font-bold text-blue-900 mb-1">Get Villages That Need Scraping</h4>
                <p className="text-sm text-gray-700 mb-2">
                  From the same purple card, download the <strong className="text-red-600">RED button: "🎯 Download WITHOUT Operators - TO SCRAPE"</strong>
                </p>
                <p className="text-xs text-blue-600 bg-blue-100 p-2 rounded">
                  This gives you the 85 villages that need operator scraping.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h4 className="font-bold text-blue-900 mb-1">Scrape Those 85 Villages</h4>
                <p className="text-sm text-gray-700 mb-2">
                  Scroll down to the <strong>"Operator Scraper"</strong> tool at the bottom and scrape the 85 villages.
                </p>
                <p className="text-xs text-blue-600 bg-blue-100 p-2 rounded">
                  The database will update automatically as you scrape.
                </p>
              </div>
            </div>
          </div>

          {/* Current State */}
          <div className="mt-4 pt-4 border-t border-blue-200">
            <p className="text-sm text-gray-700">
              <strong>Current database:</strong> 510 total VIC villages
            </p>
            <p className="text-sm text-gray-700">
              <strong>Villages with operators:</strong> ~425 (includes the 23 you just saw + others)
            </p>
            <p className="text-sm text-gray-700">
              <strong>Villages needing scraping:</strong> ~85
            </p>
          </div>
        </div>

        {/* Warning */}
        <div className="bg-yellow-50 border border-yellow-300 rounded p-3 flex items-start gap-2">
          <AlertCircle className="size-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-yellow-800">
            <strong>Note:</strong> The green "Import Missing Operators" card is for a different workflow. 
            Just use the purple "VIC Full Database Export" card for both CSVs!
          </div>
        </div>
      </CardContent>
    </Card>
  );
}