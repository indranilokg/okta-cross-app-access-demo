# Atko MCP - AWS Lambda Deployment Guide

A comprehensive guide for deploying the Atko MCP services to AWS Lambda using AWS SAM with cross-application access using Okta's ID-JAG tokens.

## 🏗️ AWS Lambda Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Employee      │    │   Internal      │    │   MCP Services  │
│   Assistant     │◄──►│   Document      │◄──►│   (Lambda)      │
│   (Next.js)     │    │   Database      │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                                              │
         │                                              │
         ▼                                              ▼
┌─────────────────┐                          ┌─────────────────┐
│   Okta ID-JAG   │                          │   Lambda        │
│   Token Flow    │                          │   Authorizer    │
│                 │                          │                 │
└─────────────────┘                          └─────────────────┘
```

## 📁 AWS Services

- **Employee Assistant**: Next.js app (can be deployed anywhere)
- **Document Database**: REST API (deployed separately)
- **MCP Server**: Lambda function with API Gateway
- **MCP Auth**: Lambda authorizer for token validation
- **API Gateway**: HTTP routing and CORS management

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
MCP_LAMBDA_URL=https://your-api-gateway.amazonaws.com/mcp
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

## 🔐 Authentication Flow

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

### **Lambda Authorizer**
- Automatically validates ID-JAG tokens
- No separate auth endpoints needed

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
# Test health endpoints
curl https://your-api-gateway.amazonaws.com/mcp/health

# Test with authentication
curl -H "Authorization: Bearer YOUR_ID_JAG_TOKEN" \
  https://your-api-gateway.amazonaws.com/mcp/tools/call \
  -d '{"tool":"search_documents","arguments":{"query":"test"}}'
```

## 🔍 Monitoring

### **CloudWatch Logs**
```bash
# View Lambda function logs
aws logs describe-log-groups --log-group-name-prefix '/aws/lambda/atko-mcp'

# View specific function logs
aws logs tail /aws/lambda/atko-mcp-document-server-prod-mcpServer --follow
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

## 🔒 Security

### **IAM Roles**
- Lambda execution roles with minimal permissions
- CloudWatch Logs access
- API Gateway invocation permissions

### **Environment Variables**
- Secure parameter storage in SAM templates
- NoEcho parameters for sensitive data
- Environment-specific configurations

### **Authentication**
- Lambda authorizer validates ID-JAG tokens
- No additional token exchange needed
- Direct Okta integration

### **Network Security**
- API Gateway handles CORS
- HTTPS enforcement
- Rate limiting capabilities

## 📊 Cost Optimization

### **Lambda Pricing**
- **Compute**: $0.20 per 1M requests
- **Duration**: $0.0000166667 per GB-second
- **Free Tier**: 1M requests and 400,000 GB-seconds per month

### **Optimization Tips**
- Use provisioned concurrency for consistent performance
- Optimize function memory allocation
- Implement connection pooling for external APIs
- Use Lambda layers for shared dependencies

## 🚨 Troubleshooting

### **Common Issues**

#### **Deployment Failures**
```bash
# Check CloudFormation stack status
aws cloudformation describe-stacks --stack-name atko-mcp-document-server

# View deployment events
aws cloudformation describe-stack-events --stack-name atko-mcp-document-server
```

#### **Permission Errors**
- Verify AWS credentials are configured
- Check IAM roles and policies
- Ensure CloudFormation permissions

#### **Function Timeouts**
- Increase Lambda timeout in SAM template
- Optimize function code
- Check external API response times

#### **Authentication Issues**
- Verify Okta configuration
- Check ID-JAG token format
- Validate Lambda authorizer logic

### **Debug Commands**
```bash
# Test Lambda function directly
aws lambda invoke --function-name atko-mcp-document-server-prod-mcpServer \
  --payload '{"path":"/mcp/health","httpMethod":"GET"}' response.json

# Check API Gateway logs
aws logs describe-log-groups --log-group-name-prefix '/aws/apigateway'

# View SAM deployment info
sam info
```

## 🔄 Updating Deployments

### **Update Existing Stack**
```bash
# Deploy updates
sam deploy

# Or with guided mode for parameter changes
sam deploy --guided
```

### **Rollback Deployment**
```bash
# Rollback to previous version
aws cloudformation rollback-stack --stack-name atko-mcp-document-server
```

## 📚 Additional Resources

- [AWS SAM Documentation](https://docs.aws.amazon.com/serverless-application-model/)
- [AWS Lambda Documentation](https://docs.aws.amazon.com/lambda/)
- [API Gateway Documentation](https://docs.aws.amazon.com/apigateway/)
- [CloudWatch Documentation](https://docs.aws.amazon.com/cloudwatch/)
- [Okta ID-JAG Documentation](https://developer.okta.com/docs/guides/identity-assertion-jwt-access-grant/)
- [MCP Specification](https://modelcontextprotocol.io/)

## 🤝 Support

For issues specific to AWS Lambda deployment:
1. Check CloudWatch logs
2. Verify IAM permissions
3. Test locally with SAM
4. Check AWS service status

---

**Next Steps**: For Vercel deployment, see [README-VERCEL.md](./README-VERCEL.md)
