# Atko Cross-App Access Demo

A comprehensive demonstration of cross-application access using Okta's ID-JAG (Identity Assertion for JWT Access Grant) tokens with MCP (Model Context Protocol) integration. This project showcases secure document management across multiple applications with dual deployment support for both Vercel and AWS Lambda.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Employee      │    │   Internal      │    │   MCP Services  │
│   Assistant     │◄──►│   Document      │◄──►│   (Vercel or    │
│   (Next.js)     │    │   Database      │    │    Lambda)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                                              │
         │                                              │
         ▼                                              ▼
┌─────────────────┐                          ┌─────────────────┐
│   Okta ID-JAG   │                          │   MCP Auth      │
│   Token Flow    │                          │   (Vercel or    │
│                 │                          │    Lambda)      │
└─────────────────┘                          └─────────────────┘
```

## 🚀 Deployment Options

### **Dual Deployment Architecture**

This project supports **both Vercel and AWS Lambda deployments** simultaneously:

#### **Vercel Deployment (Existing)**
- **MCP Server**: Express.js server on Vercel
- **MCP Auth**: OAuth server on Vercel  
- **MCP Proxy**: Next.js proxy for unified routing
- **Employee Assistant**: Next.js app on Vercel

#### **Lambda Deployment (AWS SAM)**
- **MCP Server**: Lambda function with API Gateway
- **MCP Auth**: Lambda authorizer for token validation
- **Employee Assistant**: Next.js app (can connect to either deployment)

## 📁 Project Structure

```
okta-cross-app-access-demo/
├── employee-assistant/           # Next.js app with chat interface
├── internal-document-database/   # Document storage API
├── atko-document-server-mcp/     # MCP server (Vercel + Lambda)
├── atko-document-server-mcp-auth/ # MCP auth (Vercel + Lambda)
├── atko-mcp-proxy/              # Routing proxy (Vercel only)
└── README.md
```

## 🔧 Quick Start

Choose your deployment platform:

### **Vercel Deployment**
For easy setup and development, see [README-VERCEL.md](./README-VERCEL.md)

### **AWS Lambda Deployment**
For production and cost optimization, see [README-AWS.md](./README-AWS.md)

### **Prerequisites**
- Node.js 18+
- Okta Developer Account
- OpenAI API Key
- Vercel Account (for Vercel deployment) or AWS Account (for Lambda deployment)

## 🔐 Authentication Flow

### **Vercel Mode**
1. User authenticates with Okta
2. Employee Assistant exchanges ID token for ID-JAG token
3. ID-JAG token exchanged for MCP access token via auth server
4. MCP calls made with access token

### **Lambda Mode**
1. User authenticates with Okta
2. Employee Assistant exchanges ID token for ID-JAG token
3. ID-JAG token used directly (Lambda authorizer validates)
4. MCP calls made with ID-JAG token

## 📡 API Endpoints

### **MCP Server Endpoints**
- `GET /mcp/info` - Server information
- `GET /mcp/health` - Health check
- `GET /mcp/tools` - List available tools
- `POST /mcp/tools/call` - Execute MCP tools

### **MCP Auth Endpoints (Vercel only)**
- `POST /oauth/token` - Token exchange
- `GET /health` - Health check

## 🛠️ Development

### **Adding New MCP Tools**

1. **Vercel Mode**: Add to `atko-document-server-mcp/src/index.ts`
2. **Lambda Mode**: Add to `atko-document-server-mcp/src/lambda.ts`
3. **Both**: Update tool definitions in both files

### **Testing Both Deployments**

```bash
# Test Vercel deployment
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3002/mcp/health

# Test Lambda deployment
curl -H "Authorization: Bearer $TOKEN" \
  https://your-api-gateway.amazonaws.com/mcp/health
```

## 🚀 Deployment

### **Vercel Deployment**
For detailed Vercel deployment instructions, see [DEPLOYMENT-VERCEL.md](./DEPLOYMENT-VERCEL.md)

### **AWS Lambda Deployment**
For detailed AWS Lambda deployment instructions, see [DEPLOYMENT-AWS.md](./DEPLOYMENT-AWS.md)

## 🔍 Monitoring

### **Vercel**
- Vercel Dashboard for logs and metrics
- Built-in analytics and performance monitoring

### **Lambda**
- CloudWatch Logs for function execution
- CloudWatch Metrics for performance monitoring
- X-Ray for distributed tracing

## 🔒 Security

- **ID-JAG Tokens**: Secure cross-app identity assertion
- **Lambda Authorizer**: Serverless token validation
- **CORS**: Properly configured for both deployments
- **Environment Variables**: Secure configuration management

## 📚 Documentation

- [Okta ID-JAG Documentation](https://developer.okta.com/docs/guides/identity-assertion-jwt-access-grant/)
- [MCP Specification](https://modelcontextprotocol.io/)
- [AWS Lambda Documentation](https://docs.aws.amazon.com/lambda/)
- [Vercel Documentation](https://vercel.com/docs)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test both Vercel and Lambda deployments
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details. 