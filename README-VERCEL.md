# Atko MCP - Vercel Deployment Guide

A comprehensive guide for deploying the Atko MCP services to Vercel with cross-application access using Okta's ID-JAG tokens.

## 🏗️ Vercel Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Employee      │    │   Internal      │    │   MCP Services  │
│   Assistant     │◄──►│   Document      │◄──►│   (Vercel)      │
│   (Next.js)     │    │   Database      │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                                              │
         │                                              │
         ▼                                              ▼
┌─────────────────┐                          ┌─────────────────┐
│   Okta ID-JAG   │                          │   MCP Auth      │
│   Token Flow    │                          │   (Vercel)      │
│                 │                          │                 │
└─────────────────┘                          └─────────────────┘
```

## 📁 Vercel Services

- **Employee Assistant**: Next.js app with AI chat interface
- **Document Database**: REST API for document management
- **MCP Server**: Express.js server for MCP tools
- **MCP Auth Server**: OAuth server for token exchange
- **MCP Proxy**: Next.js proxy for unified routing

## 🔧 Prerequisites

- Node.js 18+
- Git
- Vercel Account
- Okta Developer Account
- OpenAI API Key

## 🚀 Quick Start

### **1. Clone and Setup**
```bash
git clone <repository-url>
cd okta-cross-app-access-demo
```

### **2. Configure Environment Variables**

#### **Employee Assistant**
```bash
cd employee-assistant
cp env.local.template .env.local
```

Edit `.env.local`:
```bash
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key-change-in-production

# OpenAI Configuration
OPENAI_API_KEY=your-openAI-API-key

# Okta Configuration
OKTA_CLIENT_ID=your-okta-client-id
NEXT_PUBLIC_OKTA_CLIENT_ID=your-okta-client-id
OKTA_CLIENT_SECRET=your-okta-client-secret
OKTA_ISSUER=https://your-domain.okta.com
OKTA_BASE_URL=https://your-domain.okta.com
NEXT_PUBLIC_OKTA_BASE_URL=https://your-domain.okta.com

# ID-JAG Configuration
ID_JAG_AUDIENCE=http://localhost:5001
ID_JAG_CLIENT_ID=your-id-jag-client-id
ID_JAG_CLIENT_SECRET=your-id-jag-client-secret

# MCP Deployment Configuration
MCP_DEPLOYMENT_MODE=vercel

# Vercel Deployment
MCP_SERVER_URL=http://localhost:3002
MCP_AUTH_SERVER_URL=http://localhost:3003
```

#### **MCP Server**
```bash
cd atko-document-server-mcp
cp env.local.template .env.local
```

#### **MCP Auth Server**
```bash
cd atko-document-server-mcp-auth
cp env.local.template .env.local
```

### **3. Deploy Services**

#### **Step 1: Deploy Document Database**
```bash
cd internal-document-database
npm install
vercel --prod
```

#### **Step 2: Deploy MCP Auth Server**
```bash
cd atko-document-server-mcp-auth
npm install
vercel --prod
```

#### **Step 3: Deploy MCP Document Server**
```bash
cd atko-document-server-mcp
npm install
vercel --prod
```

#### **Step 4: Deploy MCP Proxy (Optional)**
```bash
cd atko-mcp-proxy
npm install
vercel --prod
```

#### **Step 5: Deploy Employee Assistant**
```bash
cd employee-assistant
npm install
vercel --prod
```

### **4. Update Production URLs**

In your Vercel dashboard, update the Employee Assistant environment variables:

```bash
MCP_DEPLOYMENT_MODE=vercel
MCP_SERVER_URL=https://your-mcp-server.vercel.app
MCP_AUTH_SERVER_URL=https://your-mcp-auth-server.vercel.app
```

## 🔐 Authentication Flow

### **Vercel Mode**
1. User authenticates with Okta
2. Employee Assistant exchanges ID token for ID-JAG token
3. ID-JAG token exchanged for MCP access token via auth server
4. MCP calls made with access token

## 📡 API Endpoints

### **MCP Server Endpoints**
- `GET /mcp/info` - Server information
- `GET /mcp/health` - Health check
- `GET /mcp/tools` - List available tools
- `POST /mcp/tools/call` - Execute MCP tools

### **MCP Auth Endpoints**
- `POST /oauth/token` - Token exchange
- `GET /health` - Health check

## 🧪 Testing

### **Local Testing**
```bash
# Start all services locally
cd internal-document-database && npm run dev &
cd atko-document-server-mcp && npm run dev &
cd atko-document-server-mcp-auth && npm run dev &
cd employee-assistant && npm run dev
```

### **Production Testing**
```bash
# Test health endpoints
curl https://your-mcp-server.vercel.app/mcp/health
curl https://your-mcp-auth-server.vercel.app/health

# Test with authentication
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://your-mcp-server.vercel.app/mcp/tools/call \
  -d '{"tool":"search_documents","arguments":{"query":"test"}}'
```

## 🔍 Monitoring

### **Vercel Dashboard**
- **Functions**: View serverless function logs
- **Analytics**: Performance monitoring
- **Deployments**: Deployment history and rollbacks

### **Environment Variables**
- Manage environment variables in Vercel dashboard
- Different values for development, preview, and production

## 🛠️ Development

### **Adding New MCP Tools**
1. Add tool logic to `atko-document-server-mcp/src/index.ts`
2. Update tool definitions in the `/tools` endpoint
3. Test locally before deploying

### **Local Development**
```bash
# Start document database
cd internal-document-database && npm run dev

# Start MCP server
cd atko-document-server-mcp && npm run dev

# Start MCP auth server
cd atko-document-server-mcp-auth && npm run dev

# Start employee assistant
cd employee-assistant && npm run dev
```

## 🔒 Security

### **Environment Variables**
- Store sensitive data in Vercel environment variables
- Use different secrets for different environments
- Never commit secrets to version control

### **CORS Configuration**
- Configured in MCP proxy for cross-origin requests
- Proper headers for authentication

### **Authentication**
- JWT token validation on every request
- ID-JAG token verification
- Secure token exchange flow

## 📊 Cost Optimization

### **Vercel Pricing**
- **Hobby**: Free (limited)
- **Pro**: $20/month
- **Enterprise**: Custom pricing

### **Optimization Tips**
- Use edge functions for better performance
- Optimize bundle sizes
- Monitor function execution times

## 🚨 Troubleshooting

### **Common Issues**

#### **Build Failures**
- Check Node.js version compatibility
- Verify all dependencies are installed
- Check for TypeScript compilation errors

#### **Environment Variables**
- Ensure all required variables are set in Vercel dashboard
- Check variable names match code expectations
- Verify no typos in variable values

#### **CORS Issues**
- Verify CORS configuration in MCP proxy
- Check allowed origins in Vercel dashboard
- Test with different browsers

#### **Authentication Issues**
- Verify Okta configuration
- Check ID-JAG token exchange flow
- Validate JWT token signatures

### **Debug Commands**
```bash
# Check Vercel function logs
vercel logs

# View deployment status
vercel ls

# Check environment variables
vercel env ls
```

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Okta ID-JAG Documentation](https://developer.okta.com/docs/guides/identity-assertion-jwt-access-grant/)
- [MCP Specification](https://modelcontextprotocol.io/)

## 🤝 Support

For issues specific to Vercel deployment:
1. Check Vercel function logs
2. Verify environment variables
3. Test locally first
4. Check Vercel status page

---

**Next Steps**: For AWS Lambda deployment, see [README-AWS.md](./README-AWS.md)
