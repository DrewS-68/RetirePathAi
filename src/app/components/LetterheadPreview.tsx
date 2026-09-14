import { LogoHeaderRight } from './LogoHeaderRight';
import { Download } from 'lucide-react';
import { Button } from './ui/button';

export function LetterheadPreview() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h2 className="font-semibold text-blue-900 mb-2">📄 Letterhead Preview</h2>
          <p className="text-blue-800 text-sm mb-2">
            This is your RetirePath letterhead. To save it for your Word template:
          </p>
          <ul className="text-blue-800 text-sm space-y-1 list-disc list-inside">
            <li><strong>Right-click on the logo image</strong> below and select "Save Image As..." to download the logo</li>
            <li><strong>Take a screenshot</strong> of the entire header section</li>
            <li><strong>Copy the text</strong> manually: "RetirePath" and "Your Journey to the Perfect Retirement Village"</li>
          </ul>
        </div>

        {/* Letterhead Preview - White Background for clean export */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <LogoHeaderRight />
        </div>

        {/* Sample Letter Preview */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <LogoHeaderRight />
          
          <div className="p-8 space-y-4">
            <p className="text-sm text-gray-600">
              [Date]
            </p>
            
            <p className="text-sm text-gray-600">
              [Recipient Name]<br />
              [Address Line 1]<br />
              [Address Line 2]
            </p>

            <p className="text-sm text-gray-900">
              Dear [Recipient],
            </p>

            <p className="text-sm text-gray-900">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </p>

            <p className="text-sm text-gray-900">
              Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
            </p>

            <p className="text-sm text-gray-900">
              Sincerely,
            </p>

            <p className="text-sm text-gray-900 mt-8">
              [Your Name]<br />
              [Your Title]<br />
              RetirePath
            </p>
          </div>
        </div>

        {/* Back Button */}
        <div className="text-center">
          <Button
            onClick={() => window.history.back()}
            variant="outline"
          >
            ← Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
