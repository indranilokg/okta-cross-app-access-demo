# Atko MCP Proxy

A Next.js-based proxy server that provides unified routing for MCP (Model Context Protocol) services. This proxy routes requests to the appropriate backend services (MCP Auth Server and MCP Document Server) based on URL patterns.

## 🌟 Features

### Unified Routing
- **Auth Routes**: `/mcp/auth/*` → MCP Auth Server
- **Resource Routes**: `/mcp/*` → MCP Document Server
- **CORS Support**: Pre-configured CORS headers for cross-origin requests

### Environment-Based Configuration
- **Production**: Routes to deployed Vercel services
- **Development**: Routes to local development servers
- **Custom Domains**: Support for custom domain routing

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Deployed MCP Auth Server and MCP Document Server

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

## 🔧 Configuration

### Environment Variables
Configure the following environment variables in your Vercel dashboard:

```bash
# Backend Service URLs
MCP_RESOURCE_SERVER_URL=https://your-mcp-document-server.vercel.app
MCP_AUTH_SERVER_URL=https://your-mcp-auth-server.vercel.app

# For Production with Custom Domain
# MCP_RESOURCE_SERVER_URL=https://your-mcp-domain.com/mcp
# MCP_AUTH_SERVER_URL=https://your-mcp-domain.com/mcp/auth

# For Local Development
# MCP_RESOURCE_SERVER_URL=http://localhost:3002
# MCP_AUTH_SERVER_URL=http://localhost:3003
```

### Routing Configuration
The proxy uses Next.js rewrites to route requests:

```javascript
// Auth server routes - must come first to avoid conflicts
{
  source: '/mcp/auth/:path*',
  destination: `${process.env.MCP_AUTH_SERVER_URL}/:path*`
},
// Resource server routes  
{
  source: '/mcp/:path*',
  destination: `${process.env.MCP_RESOURCE_SERVER_URL}/:path*`
}
```

## 📡 API Endpoints

### MCP Auth Server Routes
- **POST** `/mcp/auth/oauth/token` - Token exchange endpoint
- **GET** `/mcp/auth/health` - Health check

### MCP Document Server Routes
- **GET** `/mcp/info` - Server information
- **GET** `/mcp/health` - Health check
- **GET** `/mcp/tools` - List available tools
- **POST** `/mcp/tools/call` - Execute MCP tools

## 🔗 Integration

### Employee Assistant Integration
The Employee Assistant can now make MCP calls through this unified proxy:

```typescript
// Example MCP call through proxy
const response = await fetch('/mcp/tools/call', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  },
  body: JSON.stringify({
    tool: 'search_documents',
    arguments: { query: 'employee handbook' }
  })
});
```

### CORS Configuration
The proxy automatically adds CORS headers for cross-origin requests:
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type, Authorization`

## 🚀 Deployment

### Vercel Deployment
1. **Connect Repository**: Link your GitHub repository to Vercel
2. **Configure Environment Variables**: Set the backend service URLs in Vercel dashboard
3. **Deploy**: Vercel will automatically build and deploy the proxy

### Environment Variables in Vercel
- Go to your Vercel project dashboard
- Navigate to **Settings** → **Environment Variables**
- Add the required environment variables:
  - `MCP_RESOURCE_SERVER_URL`
  - `MCP_AUTH_SERVER_URL`

## 🔍 Troubleshooting

### Common Issues
1. **404 Errors**: Ensure backend services are deployed and accessible
2. **CORS Errors**: Verify CORS headers are properly configured
3. **Routing Issues**: Check that environment variables are set correctly

### Health Checks
Test the proxy routing:
```bash
# Test auth server routing
curl https://your-proxy-domain.vercel.app/mcp/auth/health

# Test document server routing
curl https://your-proxy-domain.vercel.app/mcp/health
```

## 📄 License

MIT License - see project root for details. 