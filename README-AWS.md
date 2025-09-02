# Atko MCP - AWS Lambda Deployment Guide

A comprehensive guide for deploying the Atko MCP services to AWS Lambda using AWS SAM with cross-application access using Okta's ID-JAG tokens.

## 🏗️ AWS Lambda Architecture

```mermaid
graph TB
    subgraph "Frontend Applications"
        EA[Employee Assistant<br/>Next.js AI Chat]
        DD[Document Database<br/>External REST API]
    end

    subgraph "MCP Services (Lambda)"
        MCP_LAMBDA[MCP Document Server<br/>Lambda Function]
        MCP_AUTH[MCP Auth Server<br/>Lambda Authorizer]
    end

    subgraph "AWS Infrastructure"
        API_GW[API Gateway<br/>Consolidated Gateway]
        LAMBDA[Lambda Functions<br/>Serverless Compute]
        CLOUDWATCH[CloudWatch<br/>Logs & Metrics]
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
    EA -->|ID-JAG Token| API_GW
    API_GW -->|Authorized Request| MCP_LAMBDA
    MCP_LAMBDA -->|Document Operations| DD
    EA -->|Chat Requests| OPENAI
    MCP_AUTH -->|Token Verification| OKTA
    API_GW -->|Auth Check| MCP_AUTH

    style EA fill:#e3f2fd,stroke:#1976d2,stroke-width:2px,color:#000000
    style DD fill:#e3f2fd,stroke:#1976d2,stroke-width:2px,color:#000000
    style MCP_LAMBDA fill:#fff3e0,stroke:#ff9800,stroke-width:2px,color:#000000
    style MCP_AUTH fill:#fff3e0,stroke:#ff9800,stroke-width:2px,color:#000000
    style API_GW fill:#e8f5e8,stroke:#4caf50,stroke-width:2px,color:#000000
    style LAMBDA fill:#e8f5e8,stroke:#4caf50,stroke-width:2px,color:#000000
    style CLOUDWATCH fill:#e8f5e8,stroke:#4caf50,stroke-width:2px,color:#000000
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
    participant API_GW as API Gateway
    participant AUTH as Lambda Authorizer
    participant MCP as MCP Lambda
    participant DD as Document Database

    User->>EA: Login with Okta
    EA->>Okta: Authenticate user
    Okta-->>EA: Return ID Token
    EA->>SDK: Exchange ID Token for ID-JAG
    SDK->>Okta: Token Exchange Request
    Okta-->>SDK: ID-JAG Token
    SDK-->>EA: ID-JAG Token
    EA->>API_GW: Request with ID-JAG Token
    API_GW->>AUTH: Authorize Request
    AUTH->>Okta: Verify ID-JAG Token
    Okta-->>AUTH: Token Valid
    AUTH-->>API_GW: Authorization Granted
    API_GW->>MCP: Forward Request
    MCP->>DD: Document Operations
    DD-->>MCP: Document Data
    MCP-->>API_GW: MCP Response
    API_GW-->>EA: HTTP Response
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
  - **Lambda deployment mode** support
- **Port**: 3000 (development)
- **Deployment**: Any platform (connects to Lambda)

### 📚 **Document Database** (`internal-document-database/`)
**Purpose**: REST API for company document management
- **Technology**: Next.js 15, TypeScript, JSON file storage
- **Features**:
  - CRUD operations for documents
  - Category-based organization
  - Search functionality
  - Tag-based filtering
- **Port**: 3001 (development)
- **Deployment**: External (Vercel or other platform)

### 🔐 **MCP Auth Server** (`atko-document-server-mcp-auth/`)
**Purpose**: Lambda authorizer for MCP access token validation
- **Technology**: AWS Lambda, TypeScript, Jose JWT
- **Features**:
  - **Okta ID-JAG token verification**
  - MCP access token generation
  - **Cross-app authorization enforcement**
  - **Secure token validation** for API Gateway
- **Runtime**: Node.js 18.x
- **Deployment**: AWS Lambda (separate from main MCP server)

### 🛠️ **MCP Document Server** (`atko-document-server-mcp/`)
**Purpose**: MCP server for document operations
- **Technology**: AWS Lambda, TypeScript, MCP SDK
- **Features**:
  - Document search via MCP tools
  - Document creation via MCP tools
  - JWT access token verification
  - HTTP transport implementation via API Gateway
- **Runtime**: Node.js 18.x
- **Deployment**: AWS Lambda with API Gateway

### ☁️ **AWS Infrastructure**
**Purpose**: Serverless infrastructure for MCP services
- **Technology**: AWS SAM, CloudFormation, API Gateway, Lambda
- **Features**:
  - **Consolidated API Gateway** with authorizer
  - **Serverless Lambda functions** for scalability
  - **CloudWatch monitoring** and logging
  - **IAM role management** for security
- **Deployment**: AWS CloudFormation via SAM

## 🚀 Deployment Architecture

```mermaid
graph LR
    subgraph "AWS Lambda Infrastructure"
        API_GW[API Gateway<br/>Consolidated Gateway]
        MCP_LAMBDA[MCP Document Server<br/>Lambda Function]
        MCP_AUTH[MCP Auth Server<br/>Lambda Authorizer]
        CLOUDWATCH[CloudWatch<br/>Logs & Metrics]
    end

    subgraph "External Applications"
        EA[Employee Assistant<br/>Next.js App]
        DD[Document Database<br/>External API]
    end

    subgraph "External Services"
        OKTA[Okta Identity Provider]
        OPENAI[OpenAI API]
    end

    EA -->|ID-JAG Token| API_GW
    API_GW -->|Auth Check| MCP_AUTH
    MCP_AUTH -->|Token Verification| OKTA
    API_GW -->|Authorized Request| MCP_LAMBDA
    MCP_LAMBDA -->|Document API| DD
    EA -->|Chat API| OPENAI
    MCP_LAMBDA -->|Logs| CLOUDWATCH
    MCP_AUTH -->|Logs| CLOUDWATCH

    style API_GW fill:#e8f5e8,stroke:#4caf50,stroke-width:2px,color:#000000
    style MCP_LAMBDA fill:#fff3e0,stroke:#ff9800,stroke-width:2px,color:#000000
    style MCP_AUTH fill:#fff3e0,stroke:#ff9800,stroke-width:2px,color:#000000
    style CLOUDWATCH fill:#e8f5e8,stroke:#4caf50,stroke-width:2px,color:#000000
    style EA fill:#e3f2fd,stroke:#1976d2,stroke-width:2px,color:#000000
    style DD fill:#e3f2fd,stroke:#1976d2,stroke-width:2px,color:#000000
    style OKTA fill:#f3e5f5,stroke:#9c27b0,stroke-width:2px,color:#000000
    style OPENAI fill:#f3e5f5,stroke:#9c27b0,stroke-width:2px,color:#000000
```

## 🔧 Prerequisites

- Node.js 18+
- Git
- AWS Account
- AWS CLI installed and configured
- AWS SAM CLI installed
- Okta Developer Account
- OpenAI API Key

## 🚀 Quick Start

### **1. Install Dependencies**
```bash
# Install AWS CLI
brew install awscli

# Install AWS SAM CLI
brew install aws-sam-cli

# Configure AWS credentials
aws configure
```

### **2. Clone and Setup**
```bash
git clone <repository-url>
cd okta-cross-app-access-demo
```

### **3. Configure Environment Variables**

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
MCP_DEPLOYMENT_MODE=lambda

# Lambda Deployment
MCP_LAMBDA_URL=https://your-api-gateway.amazonaws.com/prod/mcp
```

### **4. Set AWS Environment Variables**
```bash
export DOCUMENT_DATABASE_URL="https://your-document-database.vercel.app/api"
export JWT_SECRET="your-long-random-jwt-secret-here"
export OKTA_ISSUER="https://your-domain.okta.com"
export ID_JAG_AUDIENCE="https://your-domain.com"
```

### **5. Deploy Using SAM Script**
```bash
# Deploy both MCP server and auth services
./deploy-sam.sh
```

## 🧪 Testing

### **Local Testing**
```bash
# Test Lambda functions locally
cd atko-document-server-mcp
sam local start-api

cd ../atko-document-server-mcp-auth
sam local invoke McpAuthorizerFunction --event events/authorizer-event.json
```

### **Production Testing**
```bash
# Test all endpoints (all require authentication)
curl -H "Authorization: Bearer YOUR_ID_JAG_TOKEN" \
  https://your-api-gateway.amazonaws.com/prod/mcp/health

curl -H "Authorization: Bearer YOUR_ID_JAG_TOKEN" \
  https://your-api-gateway.amazonaws.com/prod/mcp/tools/call \
  -d '{"tool":"search_documents","arguments":{"query":"test"}}'
```

## 🔍 Monitoring

### **CloudWatch Logs**
```bash
# List Lambda log groups
aws logs describe-log-groups --log-group-name-prefix '/aws/lambda/atko-document-server-mcp'

# View MCP server logs
aws logs tail /aws/lambda/atko-document-server-mcp-McpServerFunction-* --follow

# View authorizer logs
aws logs tail /aws/lambda/atko-document-server-mcp-aut-McpAuthorizerFunction-* --follow
```

### **CloudWatch Metrics**
- Function invocation count
- Duration and error rates
- Throttling metrics
- Concurrent execution

### **X-Ray Tracing**
- Distributed tracing for request flows
- Performance analysis
- Error tracking

## 🔒 Security

- **ID-JAG Tokens**: Secure cross-app identity assertion
- **Lambda Authorizer**: Serverless token validation
- **IAM Roles**: Minimal required permissions
- **API Gateway**: HTTPS enforcement and CORS management
- **Environment Variables**: Secure configuration management

## 🛠️ Development

### **Adding New MCP Tools**
1. Add tool logic to `atko-document-server-mcp/src/lambda.ts`
2. Update tool definitions in the `/tools` endpoint
3. Test locally with `sam local start-api`

### **Local Development**
```bash
# Build and test locally
cd atko-document-server-mcp
npm run build:lambda
sam build
sam local start-api

# Test authorizer locally
cd ../atko-document-server-mcp-auth
npm run build:lambda
sam build
sam local invoke McpAuthorizerFunction --event events/authorizer-event.json
```

### **Manual Deployment**
```bash
# Deploy MCP Document Server
cd atko-document-server-mcp
npm run build:lambda
sam build
sam deploy --guided

# Deploy MCP Auth Server
cd ../atko-document-server-mcp-auth
npm run build:lambda
sam build
sam deploy --guided
```

## 📊 Performance & Cost

### **Lambda Settings**
- **Memory**: 512MB (adjust based on needs)
- **Timeout**: 30 seconds (adjust based on external API calls)
- **Concurrency**: Set limits if needed

### **API Gateway Settings**
- **Caching**: Enable for static responses
- **Throttling**: Set rate limits
- **Compression**: Enable for large responses

### **Cost Optimization**
```bash
# Monitor Lambda costs
aws ce get-cost-and-usage \
  --time-period Start=2024-01-01,End=2024-01-31 \
  --granularity MONTHLY \
  --metrics BlendedCost \
  --group-by Type=DIMENSION,Key=SERVICE
```

## 📚 Resources

- [Okta Cross App Access](https://help.okta.com/oie/en-us/content/topics/apps/apps-cross-app-access.htm)
- [MCP Specification](https://modelcontextprotocol.io/)
- [AWS Lambda Documentation](https://docs.aws.amazon.com/lambda/)
- [AWS SAM Documentation](https://docs.aws.amazon.com/serverless-application-model/)
- [API Gateway Documentation](https://docs.aws.amazon.com/apigateway/)
