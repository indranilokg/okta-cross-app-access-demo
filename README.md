# Atko Cross-App Access (CAA) with Okta

A comprehensive implementation of Okta **[Cross-App Access (CAA)](https://www.okta.com/newsroom/press-releases/okta-introduces-cross-app-access-to-help-secure-ai-agents-in-the/)** using [OAuth 2.1 Identity Assertion Authorization Grant (ID-JAG)](https://datatracker.ietf.org/doc/draft-parecki-oauth-identity-assertion-authz-grant/) with Model Context Protocol (MCP). This project demonstrates secure cross-application authorization patterns where multiple applications can securely access each other's resources using Okta as the central identity provider.

## 🏗️ Architecture Overview

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

## 🔧 Key Technologies

- **Frontend**: Next.js 15, React 19, TypeScript
- **Backend**: Express.js, Node.js, TypeScript
- **Identity Provider**: **Okta** (Central authentication and authorization)
- **Cross-App Access**: **[OAuth 2.1 ID-JAG](https://datatracker.ietf.org/doc/draft-parecki-oauth-identity-assertion-authz-grant/)** (Identity Assertion Authorization Grant)
- **AI**: OpenAI API, Model Context Protocol (MCP)
- **Deployment**: Vercel
- **Security**: JWT, Jose library, CORS

## 🎯 Cross-App Access Use Cases

1. **Employee Self-Service**: AI-powered assistance for company policies and procedures
2. **Document Management**: Secure access to company documents via AI chat
3. **Cross-App Authorization**: Secure token exchange between applications using Okta [ID-JAG](https://datatracker.ietf.org/doc/draft-parecki-oauth-identity-assertion-authz-grant/)
4. **MCP Integration**: Standardized AI tool calling for document operations
5. **Okta Identity Federation**: Centralized identity management across multiple applications
6. **Secure Service-to-Service Communication**: Applications securely access each other's APIs

## 📋 Prerequisites

- Node.js 18+
- Okta Developer Account
- OpenAI API Key
- Vercel Account (for deployment)

## 🚀 Quick Start

1. **Clone the repository**
2. **Configure Okta application** for [ID-JAG](https://datatracker.ietf.org/doc/draft-parecki-oauth-identity-assertion-authz-grant/) token exchange
3. **Set up environment variables** for each service
4. **Deploy services** to Vercel
5. **Test the cross-app access flow**

## 📄 License

MIT License - see individual service directories for details.

## 🤝 Contributing

This is an internal Atko Corporation project demonstrating Okta **cross-app access patterns** using **OAuth 2.1 [ID-JAG](https://datatracker.ietf.org/doc/draft-parecki-oauth-identity-assertion-authz-grant/)** with Model Context Protocol (MCP) for secure inter-application communication. 