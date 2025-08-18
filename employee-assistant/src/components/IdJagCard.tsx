'use client';

import { useState } from 'react';

interface IdJagCardProps {
  idJagToken: string | null;
}

export default function IdJagCard({ idJagToken }: IdJagCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [decodedToken, setDecodedToken] = useState<any>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const decodeToken = (token: string) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding ID-JAG token:', error);
      return null;
    }
  };

  const handleToggle = () => {
    if (!decodedToken && idJagToken) {
      setDecodedToken(decodeToken(idJagToken));
    }
    setIsExpanded(!isExpanded);
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  // Don't render the card if no ID-JAG token is available
  if (!idJagToken) return null;

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm w-full">
      <button
        onClick={handleToggle}
        className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <span className="font-medium text-gray-900">ID-JAG Token Details</span>
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Cross-App Access</span>
        </div>
        <svg
          className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isExpanded && (
        <div className="px-4 pb-4 space-y-4">
          {/* Decoded Token - Shown First */}
          {decodedToken && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-700">Decoded ID-JAG Token</h4>
                <button
                  onClick={() => copyToClipboard(JSON.stringify(decodedToken, null, 2), 'decoded')}
                  className="flex items-center space-x-1 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
                >
                  {copiedField === 'decoded' ? (
                    <>
                      <svg className="w-3 h-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-green-600">Copied!</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <div className="bg-blue-50 rounded-md p-3 max-h-64 overflow-y-auto">
                <pre className="text-xs text-gray-800 whitespace-pre-wrap">
                  {JSON.stringify(decodedToken, null, 2)}
                </pre>
              </div>

            </div>
          )}
          
          {/* Raw Token */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-700">Raw ID-JAG Token</h4>
              <button
                onClick={() => copyToClipboard(idJagToken, 'raw')}
                className="flex items-center space-x-1 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
              >
                {copiedField === 'raw' ? (
                  <>
                    <svg className="w-3 h-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-green-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <div className="bg-blue-50 rounded-md p-3 max-h-32 overflow-y-auto">
              <code className="text-xs text-gray-800 break-all">{idJagToken}</code>
            </div>
          </div>

          {/* Architecture Diagram */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
              <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              ID-JAG Token Flow Architecture
            </h4>
            
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 text-xs">
              {/* Flow Steps */}
              <div className="grid grid-cols-1 gap-3 mb-4">
                                 {/* Step 1: Employee Assistant */}
                 <div className="flex items-center space-x-3">
                   <div className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                   <div className="bg-white rounded-lg p-2 flex-1 shadow-sm border border-green-200 min-w-0">
                     <div className="font-medium text-green-800">Employee Assistant</div>
                     <div className="text-green-600">Starts with Okta ID Token</div>
                   </div>
                   <div className="text-gray-400 flex-shrink-0">→</div>
                 </div>

                                 {/* Step 2: SDK */}
                 <div className="flex items-center space-x-3">
                   <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                   <div className="bg-white rounded-lg p-2 flex-1 shadow-sm border border-blue-200 min-w-0">
                     <div className="font-medium text-blue-800">Cross-App Access SDK</div>
                     <div className="text-blue-600">📞 Broker/Client - Requests ID-JAG</div>
                   </div>
                                      <div className="text-gray-400 flex-shrink-0">→</div>
                 </div>

                 {/* Step 3: Okta */}
                 <div className="flex items-center space-x-3">
                   <div className="flex-shrink-0 w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                   <div className="bg-white rounded-lg p-2 flex-1 shadow-sm border border-purple-200 min-w-0">
                     <div className="font-medium text-purple-800">🏢 Okta Authorization Server</div>
                     <div className="text-purple-600">🎯 **GENERATES** ID-JAG Token</div>
                   </div>
                   <div className="text-gray-400 flex-shrink-0">→</div>
                 </div>

                 {/* Step 4: MCP Auth */}
                 <div className="flex items-center space-x-3">
                   <div className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold">4</div>
                   <div className="bg-white rounded-lg p-2 flex-1 shadow-sm border border-orange-200 min-w-0">
                     <div className="font-medium text-orange-800">MCP Auth Server</div>
                     <div className="text-orange-600">🛡️ Verifier - Validates ID-JAG</div>
                   </div>
                   <div className="text-gray-400 flex-shrink-0">→</div>
                 </div>

                 {/* Step 5: MCP Document Server */}
                 <div className="flex items-center space-x-3">
                   <div className="flex-shrink-0 w-8 h-8 bg-teal-500 text-white rounded-full flex items-center justify-center text-xs font-bold">5</div>
                   <div className="bg-white rounded-lg p-2 flex-1 shadow-sm border border-teal-200 min-w-0">
                     <div className="font-medium text-teal-800">MCP Document Server</div>
                     <div className="text-teal-600">📚 Protected Resources</div>
                   </div>
                 </div>
              </div>

                             {/* Token Flow Visualization */}
               <div className="border-t border-blue-200 pt-3 mt-3">
                 <div className="flex items-center justify-between text-xs flex-wrap gap-2">
                   <div className="bg-green-100 text-green-700 px-2 py-1 rounded font-mono text-center min-w-0">ID Token</div>
                   <div className="text-gray-400 flex-shrink-0">→</div>
                   <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded font-mono font-bold text-center min-w-0">ID-JAG Token</div>
                   <div className="text-gray-400 flex-shrink-0">→</div>
                   <div className="bg-orange-100 text-orange-700 px-2 py-1 rounded font-mono text-center min-w-0">MCP Access Token</div>
                   <div className="text-gray-400 flex-shrink-0">→</div>
                   <div className="bg-teal-100 text-teal-700 px-2 py-1 rounded text-center min-w-0">🔓 Protected Tools</div>
                 </div>
               </div>

              {/* Key Insight */}
              <div className="bg-purple-100 border border-purple-200 rounded-lg p-2 mt-3">
                <div className="flex items-center space-x-2">
                  <div className="text-purple-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="text-purple-800 text-xs">
                    <span className="font-semibold">Key:</span> Only Okta generates the actual ID-JAG token. Your application components just request, verify, and use it.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 