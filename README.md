# Atko Cross-App Access Demo

A comprehensive demonstration of **cross-application access** using Okta's **[ID-JAG (Identity Assertion for JWT Access Grant)](https://datatracker.ietf.org/doc/draft-parecki-oauth-identity-assertion-authz-grant/)** tokens with **MCP (Model Context Protocol)** integration. This project showcases secure document management across multiple applications with **dual deployment support** for both Vercel and AWS Lambda.

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

## 🚀 Deployment Options

### **Dual Deployment Architecture**

This project supports **both Vercel and AWS Lambda deployments** simultaneously:

#### **Vercel Deployment (Development/Staging)**
- **MCP Server**: Express.js server on Vercel
- **MCP Auth**: OAuth server on Vercel  
- **MCP Proxy**: Next.js proxy for unified routing
- **Employee Assistant**: Next.js app on Vercel
- **Document Database**: Next.js REST API on Vercel

#### **Lambda Deployment (Production)**
- **MCP Server**: Lambda function with API Gateway
- **MCP Auth**: Lambda authorizer for token validation
- **Employee Assistant**: Next.js app (connects to Lambda)
- **Document Database**: External REST API

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

## 🔧 Key Technologies

- **Frontend**: Next.js 15, React 19, TypeScript
- **Backend**: Express.js, Node.js, TypeScript
- **Identity Provider**: **Okta** (Central authentication and authorization)
- **Cross-App Access**: **[OAuth 2.1 ID-JAG](https://datatracker.ietf.org/doc/draft-parecki-oauth-identity-assertion-authz-grant/)** (Identity Assertion Authorization Grant)
- **AI**: OpenAI API, Model Context Protocol (MCP)
- **Deployment**: Vercel + AWS Lambda (dual deployment)
- **Security**: JWT, Jose library, CORS, Lambda Authorizers

## 🎯 Cross-App Access Use Cases

1. **Employee Self-Service**: AI-powered assistance for company policies and procedures
2. **Document Management**: Secure access to company documents via AI chat
3. **Cross-App Authorization**: Secure token exchange between applications using Okta [ID-JAG](https://datatracker.ietf.org/doc/draft-parecki-oauth-identity-assertion-authz-grant/)
4. **MCP Integration**: Standardized AI tool calling for document operations
5. **Okta Identity Federation**: Centralized identity management across multiple applications
6. **Secure Service-to-Service Communication**: Applications securely access each other's APIs

## 🚀 Quick Start

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

## 📄 License

MIT License - see individual service directories for details.

## 🤝 Contributing

This is an internal Atko Corporation project demonstrating Okta **cross-app access patterns** using **OAuth 2.1 [ID-JAG](https://datatracker.ietf.org/doc/draft-parecki-oauth-identity-assertion-authz-grant/)** with Model Context Protocol (MCP) for secure inter-application communication. 