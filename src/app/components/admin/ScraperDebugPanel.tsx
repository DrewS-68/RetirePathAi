import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';

interface ScraperDebugPanelProps {
  villages: any[];
  operators: string[];
  results: any[];
  scraping: boolean;
}

export function ScraperDebugPanel({ villages, operators, results, scraping }: ScraperDebugPanelProps) {
  // Calculate if button should be disabled
  const buttonDisabled = scraping || 
    (results.length === 0 && (villages.length === 0 || operators.length === 0)) || 
    (results.length > 0 && operators.length === 0);

  return (
    <Card className="border-2 border-yellow-400 bg-yellow-50">
      <CardHeader>
        <CardTitle className="text-yellow-900 flex items-center gap-2">
          🐛 Scraper Debug Panel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <strong>Villages loaded:</strong> 
            <Badge className={villages.length > 0 ? 'bg-green-600 ml-2' : 'bg-red-600 ml-2'}>
              {villages.length}
            </Badge>
          </div>
          
          <div>
            <strong>Operators loaded:</strong> 
            <Badge className={operators.length > 0 ? 'bg-green-600 ml-2' : 'bg-red-600 ml-2'}>
              {operators.length}
            </Badge>
          </div>
          
          <div>
            <strong>Results saved:</strong> 
            <Badge className={results.length > 0 ? 'bg-blue-600 ml-2' : 'bg-gray-600 ml-2'}>
              {results.length}
            </Badge>
          </div>
          
          <div>
            <strong>Scraping active:</strong> 
            <Badge className={scraping ? 'bg-orange-600 ml-2' : 'bg-gray-600 ml-2'}>
              {scraping ? 'YES' : 'NO'}
            </Badge>
          </div>
        </div>

        <div className="mt-4 p-3 bg-white border border-yellow-300 rounded">
          <div className="font-semibold text-yellow-900 mb-2">Button Status:</div>
          <div className={`p-2 rounded ${buttonDisabled ? 'bg-red-100 text-red-900' : 'bg-green-100 text-green-900'}`}>
            {buttonDisabled ? '🔴 DISABLED' : '🟢 ENABLED'}
          </div>
          
          {buttonDisabled && (
            <div className="mt-2 text-xs text-red-700">
              <div className="font-semibold">Why disabled:</div>
              <ul className="list-disc ml-4 mt-1">
                {scraping && <li>Currently scraping</li>}
                {results.length === 0 && villages.length === 0 && <li>No villages loaded (upload blue CSV)</li>}
                {results.length === 0 && operators.length === 0 && <li>No operators loaded (upload purple CSV)</li>}
                {results.length > 0 && operators.length === 0 && <li>Resuming but no operators (upload purple CSV)</li>}
              </ul>
            </div>
          )}
        </div>

        {villages.length > 0 && (
          <div className="mt-3 p-2 bg-white border rounded text-xs">
            <div className="font-semibold mb-1">First 3 villages:</div>
            <pre className="text-[10px] overflow-x-auto">
              {JSON.stringify(villages.slice(0, 3), null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
