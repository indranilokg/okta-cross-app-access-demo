import React from 'react';

export default function ProxyInfo() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            🔗 Atko MCP Proxy
          </h1>
          <p className="text-gray-600 mb-6">
            This service routes MCP requests to the appropriate backend services.
          </p>
          
          <div className="space-y-2 text-sm text-left">
            <div className="bg-blue-50 p-3 rounded">
              <strong>📡 MCP Resource Server:</strong>
              <br />
              <code className="text-blue-600">/mcp/*</code>
            </div>
            
            <div className="bg-green-50 p-3 rounded">
              <strong>🔐 MCP Auth Server:</strong>
              <br />
              <code className="text-green-600">/mcp/auth/*</code>
            </div>
          </div>
          
          <div className="mt-6 text-xs text-gray-500">
            <p>Status: ✅ Operational</p>
            <p>Routing: Vercel Rewrites</p>
          </div>
        </div>
      </div>
    </div>
  );
} 