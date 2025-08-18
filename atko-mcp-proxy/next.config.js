/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      // Auth server routes - must come first to avoid conflicts
      {
        source: '/mcp/auth/:path*',
        destination: `${process.env.MCP_AUTH_SERVER_URL || 'https://documents-mcp-auth.vercel.app'}/:path*`
      },
      // Resource server routes  
      {
        source: '/mcp/:path*',
        destination: `${process.env.MCP_RESOURCE_SERVER_URL || 'https://documents-mcp-resource.vercel.app'}/:path*`
      }
    ];
  },
  
  async headers() {
    return [
      {
        source: '/mcp/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*'
          },
          {
            key: 'Access-Control-Allow-Methods', 
            value: 'GET, POST, PUT, DELETE, OPTIONS'
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization'
          }
        ]
      }
    ];
  }
};

module.exports = nextConfig; 