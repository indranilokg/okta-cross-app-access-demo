# Atko MCP - Vercel Deployment Guide

A comprehensive guide for deploying the Atko MCP services to Vercel with cross-application access using Okta's ID-JAG tokens.

## 🏗️ Vercel Architecture

```mermaid
graph TB
    subgraph "Frontend Applications"
        EA[Employee Assistant<br/>Next.js AI Chat]
        DD[Document Database<br/>Next.js REST API]
    end

    subgraph "MCP Services"
        MCP_PROXY[MCP Proxy<br/>Next.js Router]
        MCP_AUTH[MCP Auth Server<br/>Express.js OAuth]
        MCP_RESOURCE[MCP Document Server<br/>Express.js MCP]
    end

    subgraph "External Services"
        OKTA[Okta Identity Provider]
        OPENAI[OpenAI API]
    end

    subgraph "SDK"
        CAA_SDK[atko-cross-app-access-sdk<br/>ID-JAG Token Exchange]
    end

    EA -->|ID Token| CAA_SDK
    CAA_SDK -->|ID-JAG Token| OKTA
    EA -->|ID-JAG Token| MCP_AUTH
    MCP_AUTH -->|MCP Access Token| MCP_RESOURCE
    MCP_RESOURCE -->|Document Operations| DD
    EA -->|Chat Requests| OPENAI
    EA -->|MCP Calls| MCP_PROXY
    MCP_PROXY -->|Route /mcp/*| MCP_RESOURCE
    MCP_PROXY -->|Route /mcp/auth/*| MCP_AUTH

    style EA fill:#e3f2fd,stroke:#1976d2,stroke-width:2px,color:#000000
    style DD fill:#e3f2fd,stroke:#1976d2,stroke-width:2px,color:#000000
    style MCP_PROXY fill:#fff3e0,stroke:#ff9800,stroke-width:2px,color:#000000
    style MCP_AUTH fill:#fff3e0,stroke:#ff9800,stroke-width:2px,color:#000000
    style MCP_RESOURCE fill:#fff3e0,stroke:#ff9800,stroke-width:2px,color:#000000
    style OKTA fill:#f3e5f5,stroke:#9c27b0,stroke-width:2px,color:#000000
    style OPENAI fill:#f3e5f5,stroke:#9c27b0,stroke-width:2px,color:#000000
    style CAA_SDK fill:#e8f5e8,stroke:#4caf50,stroke-width:2px,color:#000000
```

## 🔐 Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant EA as Employee Assistant
    participant SDK as CAA SDK
    participant Okta
    participant MCP_AUTH as MCP Auth Server
    participant MCP_RESOURCE as MCP Document Server
    participant DD as Document Database

    User->>EA: Login with Okta
    EA->>Okta: Authenticate user
    Okta-->>EA: Return ID Token
    EA->>SDK: Exchange ID Token for ID-JAG
    SDK->>Okta: Token Exchange Request
    Okta-->>SDK: ID-JAG Token
    SDK-->>EA: ID-JAG Token
    EA->>MCP_AUTH: Present ID-JAG Token
    MCP_AUTH->>MCP_AUTH: Verify ID-JAG Token
    MCP_AUTH-->>EA: MCP Access Token
    EA->>MCP_RESOURCE: Use MCP Access Token
    MCP_RESOURCE->>MCP_RESOURCE: Verify Access Token
    MCP_RESOURCE->>DD: Document Operations
    DD-->>MCP_RESOURCE: Document Data
    MCP_RESOURCE-->>EA: MCP Response
    EA-->>User: AI Response with Document Context
```

## 📦 Service Descriptions

### 🎯 **Employee Assistant** (`employee-assistant/`)
**Purpose**: AI-powered chat interface for employee assistance with document access
- **Technology**: Next.js 15, React 19, NextAuth.js, OpenAI API
- **Features**: 
  - **Okta authentication** with **ID-JAG token exchange**
  - AI chat with document context
  - Document search and creation via MCP
  - Real-time ID-JAG token display
  - **Cross-app access** to document database
- **Port**: 3000 (development)
- **Deployment**: Vercel

### 📚 **Document Database** (`internal-document-database/`)
**Purpose**: REST API for company document management
- **Technology**: Next.js 15, TypeScript, JSON file storage
- **Features**:
  - CRUD operations for documents
  - Category-based organization
  - Search functionality
  - Tag-based filtering
- **Port**: 3001 (development)
- **Deployment**: Vercel

### 🔐 **MCP Auth Server** (`atko-document-server-mcp-auth/`)
**Purpose**: OAuth 2.0 authorization server for MCP access
- **Technology**: Express.js, TypeScript, Jose JWT
- **Features**:
  - **Okta ID-JAG token verification**
  - MCP access token issuance
  - **Cross-app authorization enforcement**
  - **Secure token exchange** between applications
- **Port**: 3003 (development)
- **Deployment**: Vercel

### 🛠️ **MCP Document Server** (`atko-document-server-mcp/`)
**Purpose**: MCP server for document operations
- **Technology**: Express.js, TypeScript, MCP SDK
- **Features**:
  - Document search via MCP tools
  - Document creation via MCP tools
  - JWT access token verification
  - HTTP transport implementation
- **Port**: 3002 (development)
- **Deployment**: Vercel

### 🔗 **MCP Proxy** (`atko-mcp-proxy/`)
**Purpose**: Unified routing for MCP services
- **Technology**: Next.js, Vercel Rewrites
- **Features**:
  - Path-based routing to backend services
  - CORS header management
  - Environment-based backend URL configuration
- **Deployment**: Vercel

### 📦 **CAA SDK** (`atko-cross-app-access-sdk/`)
**Purpose**: **Cross-app access** ID-JAG token exchange and verification
- **Technology**: TypeScript, Axios, Jose JWT
- **Features**:
  - **Okta ID token to ID-JAG token exchange**
  - **Cross-app authorization** token verification
  - RFC 8693 compliant implementation
  - **Secure inter-application communication**
- **Distribution**: NPM package

## 🚀 Deployment Architecture

```mermaid
graph LR
    subgraph "Vercel Projects"
        EA_V[Employee Assistant<br/>vercel.app]
        DD_V[Document Database<br/>vercel.app]
        MCP_AUTH_V[MCP Auth Server<br/>documents-mcp-auth.vercel.app]
        MCP_RESOURCE_V[MCP Document Server<br/>documents-mcp-resource.vercel.app]
        MCP_PROXY_V[MCP Proxy<br/>vercel.app]
    end

    subgraph "Custom Domain (Optional)"
        CUSTOM[your-mcp-domain.com]
    end

    subgraph "External Services"
        OKTA[Okta Identity Provider]
        OPENAI[OpenAI API]
    end

    EA_V -->|ID-JAG Exchange| OKTA
    EA_V -->|Chat API| OPENAI
    EA_V -->|MCP Calls| MCP_PROXY_V
    MCP_PROXY_V -->|/mcp/*| MCP_RESOURCE_V
    MCP_PROXY_V -->|/mcp/auth/*| MCP_AUTH_V
    MCP_RESOURCE_V -->|Document API| DD_V
    MCP_AUTH_V -->|Token Verification| OKTA

    CUSTOM -.->|Optional Routing| MCP_PROXY_V

    style EA_V fill:#e3f2fd,stroke:#1976d2,stroke-width:2px,color:#000000
    style DD_V fill:#e3f2fd,stroke:#1976d2,stroke-width:2px,color:#000000
    style MCP_AUTH_V fill:#fff3e0,stroke:#ff9800,stroke-width:2px,color:#000000
    style MCP_RESOURCE_V fill:#fff3e0,stroke:#ff9800,stroke-width:2px,color:#000000
    style MCP_PROXY_V fill:#fff3e0,stroke:#ff9800,stroke-width:2px,color:#000000
    style CUSTOM fill:#f3e5f5,stroke:#9c27b0,stroke-width:2px,color:#000000
```

## 🔧 Prerequisites

- Node.js 18+
- Git
- Vercel Account
- Okta Developer Account
- OpenAI API Key

## 🚀 Quick Start

### **1. Install Dependencies**
```bash
# Clone the repository
git clone <repository-url>
cd okta-cross-app-access-demo

# Install dependencies for each service
cd employee-assistant && npm install && cd ..
cd internal-document-database && npm install && cd ..
cd atko-document-server-mcp && npm install && cd ..
cd atko-document-server-mcp-auth && npm install && cd ..
cd atko-mcp-proxy && npm install && cd ..
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
MCP_SERVER_URL=https://your-mcp-server.vercel.app
MCP_AUTH_SERVER_URL=https://your-mcp-auth-server.vercel.app
```

### **3. Deploy to Vercel**

For detailed deployment instructions, see [DEPLOYMENT-VERCEL.md](./DEPLOYMENT-VERCEL.md)

## 🧪 Testing

### **Local Testing**
```bash
# Start all services locally
cd employee-assistant && npm run dev &
cd internal-document-database && npm run dev &
cd atko-document-server-mcp && npm run dev &
cd atko-document-server-mcp-auth && npm run dev &
cd atko-mcp-proxy && npm run dev &
```

### **Production Testing**
```bash
# Test MCP server health
curl https://your-mcp-server.vercel.app/mcp/health

# Test MCP auth server
curl https://your-mcp-auth-server.vercel.app/health

# Test MCP tool call
curl -H "Authorization: Bearer YOUR_MCP_ACCESS_TOKEN" \
  https://your-mcp-server.vercel.app/mcp/tools/call \
  -d '{"tool":"search_documents","arguments":{"query":"test"}}'
```

## 🔍 Monitoring

### **Vercel Dashboard**
- Function execution logs
- Performance metrics
- Error tracking
- Deployment status

### **Application Logs**
- Next.js application logs
- Express.js server logs
- MCP tool execution logs

## 🔒 Security

- **ID-JAG Tokens**: Secure cross-app identity assertion
- **JWT Verification**: Token validation using Jose library
- **CORS**: Properly configured for cross-origin requests
- **Environment Variables**: Secure configuration management

## 🛠️ Development

### **Adding New MCP Tools**
1. Add tool logic to `atko-document-server-mcp/src/index.ts`
2. Update tool definitions in the `/tools` endpoint
3. Test locally with `npm run dev`

### **Local Development**
```bash
# Build and test locally
cd atko-document-server-mcp
npm run build
npm run dev

# Test auth server locally
cd ../atko-document-server-mcp-auth
npm run build
npm run dev
```

## 📚 Resources

- [Okta ID-JAG Documentation](https://developer.okta.com/docs/guides/identity-assertion-jwt-access-grant/)
- [MCP Specification](https://modelcontextprotocol.io/)
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Express.js Documentation](https://expressjs.com/)
