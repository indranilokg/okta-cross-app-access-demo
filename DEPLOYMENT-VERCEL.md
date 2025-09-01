# Vercel Deployment Guide

Step-by-step guide for deploying Atko MCP services to Vercel.

## 📋 Prerequisites

- [ ] Node.js 18+ installed
- [ ] Git installed
- [ ] Vercel account created
- [ ] Vercel CLI installed (`npm i -g vercel`)
- [ ] Okta developer account
- [ ] OpenAI API key

## 🚀 Deployment Steps

### **Step 1: Document Database**

```bash
cd internal-document-database
npm install
vercel --prod
```

**Environment Variables to set in Vercel:**
- None required (uses local JSON file)

**Expected Output:**
```
✅ Production: https://your-document-db.vercel.app
```

### **Step 2: MCP Auth Server**

```bash
cd atko-document-server-mcp-auth
npm install
vercel --prod
```

**Environment Variables to set in Vercel:**
```bash
JWT_SECRET=your-long-random-jwt-secret-here
OKTA_ISSUER=https://your-domain.okta.com
ID_JAG_AUDIENCE=https://your-domain.com
NODE_ENV=production
```

**Expected Output:**
```
✅ Production: https://your-mcp-auth.vercel.app
```

### **Step 3: MCP Document Server**

```bash
cd atko-document-server-mcp
npm install
vercel --prod
```

**Environment Variables to set in Vercel:**
```bash
DOCUMENT_DATABASE_URL=https://your-document-db.vercel.app/api
JWT_SECRET=your-long-random-jwt-secret-here
OKTA_ISSUER=https://your-domain.okta.com
ID_JAG_AUDIENCE=https://your-domain.com
NODE_ENV=production
```

**Expected Output:**
```
✅ Production: https://your-mcp-server.vercel.app
```

### **Step 4: MCP Proxy (Optional)**

```bash
cd atko-mcp-proxy
npm install
vercel --prod
```

**Environment Variables to set in Vercel:**
```bash
MCP_RESOURCE_SERVER_URL=https://your-mcp-server.vercel.app
MCP_AUTH_SERVER_URL=https://your-mcp-auth.vercel.app
```

**Expected Output:**
```
✅ Production: https://your-mcp-proxy.vercel.app
```

### **Step 5: Employee Assistant**

```bash
cd employee-assistant
npm install
vercel --prod
```

**Environment Variables to set in Vercel:**
```bash
# NextAuth Configuration
NEXTAUTH_URL=https://your-employee-assistant.vercel.app
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
ID_JAG_AUDIENCE=https://your-domain.com
ID_JAG_CLIENT_ID=your-id-jag-client-id
ID_JAG_CLIENT_SECRET=your-id-jag-client-secret

# MCP Deployment Configuration
MCP_DEPLOYMENT_MODE=vercel
MCP_SERVER_URL=https://your-mcp-server.vercel.app
MCP_AUTH_SERVER_URL=https://your-mcp-auth.vercel.app
```

**Expected Output:**
```
✅ Production: https://your-employee-assistant.vercel.app
```

## 🧪 Testing Deployment

### **Health Checks**
```bash
# Test document database
curl https://your-document-db.vercel.app/api/documents

# Test MCP server
curl https://your-mcp-server.vercel.app/mcp/health

# Test MCP auth server
curl https://your-mcp-auth.vercel.app/health

# Test employee assistant
curl https://your-employee-assistant.vercel.app
```

### **Authentication Test**
```bash
# Test MCP tool call (requires valid token)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://your-mcp-server.vercel.app/mcp/tools/call \
  -d '{"tool":"search_documents","arguments":{"query":"test"}}'
```

## 🔍 Monitoring

### **Vercel Dashboard**
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project
3. Check:
   - **Functions**: Serverless function logs
   - **Analytics**: Performance metrics
   - **Deployments**: Deployment history

### **Function Logs**
```bash
# View function logs
vercel logs

# View specific function logs
vercel logs --function=api/mcp/tools/call
```

## 🔒 Security Checklist

- [ ] JWT_SECRET is set and secure
- [ ] Okta configuration is correct
- [ ] Environment variables are set in Vercel dashboard
- [ ] CORS is properly configured
- [ ] HTTPS is enforced
- [ ] No secrets in code repository

## 🚨 Troubleshooting

### **Common Issues**

#### **Build Failures**
```bash
# Check build logs
vercel logs

# Test build locally
npm run build
```

#### **Environment Variables**
```bash
# List environment variables
vercel env ls

# Add missing variables
vercel env add VARIABLE_NAME
```

#### **Function Errors**
```bash
# View function logs
vercel logs --function=api/your-function

# Test function locally
vercel dev
```

### **Debug Commands**
```bash
# Check deployment status
vercel ls

# View project info
vercel inspect

# Pull environment variables
vercel env pull .env.local
```

## 📊 Performance Optimization

### **Vercel Settings**
- Enable **Edge Functions** for better performance
- Use **Image Optimization** for static assets
- Configure **Caching** headers

### **Function Optimization**
- Minimize bundle size
- Use tree shaking
- Optimize dependencies

## 🔄 Updates and Rollbacks

### **Deploy Updates**
```bash
# Deploy changes
vercel --prod

# Deploy to preview
vercel
```

### **Rollback Deployment**
1. Go to Vercel dashboard
2. Select project
3. Go to Deployments
4. Click on previous deployment
5. Click "Promote to Production"

## 📚 Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel CLI Documentation](https://vercel.com/docs/cli)

---

**Next**: For AWS Lambda deployment, see [DEPLOYMENT-AWS.md](./DEPLOYMENT-AWS.md)
