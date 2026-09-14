import React from 'react';

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">🎉 RetirePath Test</h1>
        <p className="text-xl mb-4">If you can see this, the basic app is working!</p>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
          <h2 className="text-2xl font-bold mb-2">✅ App Loaded Successfully</h2>
          <p>This confirms:</p>
          <ul className="list-disc ml-6 mt-2">
            <li>React is working</li>
            <li>Tailwind CSS is working</li>
            <li>The build system is working</li>
          </ul>
        </div>
        
        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="font-bold text-lg mb-2">🔍 Debug Info</h3>
          <p className="font-mono text-sm">
            Time: {new Date().toISOString()}<br/>
            Window loaded: {typeof window !== 'undefined' ? 'Yes' : 'No'}
          </p>
        </div>
      </div>
    </div>
  );
}
