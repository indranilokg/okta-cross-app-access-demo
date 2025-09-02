# AWS Lambda Deployment Guide

Step-by-step guide for deploying Atko MCP services to AWS Lambda using AWS SAM.

## 📋 Prerequisites

- [ ] Node.js 18+ installed
- [ ] Git installed
- [ ] AWS account created
- [ ] AWS CLI installed (`brew install awscli`)
- [ ] AWS SAM CLI installed (`brew install aws-sam-cli`)
- [ ] AWS credentials configured (`aws configure`)
- [ ] Okta developer account
- [ ] OpenAI API key

## 🚀 Deployment Steps

### **Step 1: Configure AWS Credentials**

```bash
# Configure AWS CLI
aws configure

# Enter your AWS credentials:
# AWS Access Key ID: YOUR_ACCESS_KEY
# AWS Secret Access Key: YOUR_SECRET_KEY
# Default region name: us-east-1
# Default output format: json
```

### **Step 2: Set Environment Variables**

```bash
# Set required environment variables
export DOCUMENT_DATABASE_URL="https://your-document-database.vercel.app/api"
export JWT_SECRET="your-long-random-jwt-secret-here"
export OKTA_ISSUER="https://your-domain.okta.com"
export ID_JAG_AUDIENCE="https://your-domain.com"
```

### **Step 3: Deploy MCP Services**

```bash
# Deploy both MCP server and auth services
./deploy-sam.sh
```

**Expected Output:**
```
✅ MCP Auth Server deployed successfully
✅ MCP Document Server deployed successfully
🎉 SAM Deployment Complete!

📋 Deployment Summary:
======================
🛠️  MCP Document Server:
   URL: https://your-api-gateway.amazonaws.com/mcp

🔐 MCP Auth Server (Lambda Authorizer):
   Deployed as Lambda function
```

### **Step 4: Configure Employee Assistant**

Update your Employee Assistant environment variables:

```bash
# Set deployment mode to Lambda
MCP_DEPLOYMENT_MODE=lambda

# Set Lambda URL (replace with your actual URL)
MCP_LAMBDA_URL=https://your-api-gateway.amazonaws.com/prod/mcp
```

## 🧪 Testing Deployment

### **Health Checks**
```bash
# Test MCP server health (Protected API - Auth Required)
curl -H "Authorization: Bearer YOUR_ID_JAG_TOKEN" \
  https://your-api-gateway.amazonaws.com/prod/mcp/health

# Test MCP server info (Protected API - Auth Required)
curl -H "Authorization: Bearer YOUR_ID_JAG_TOKEN" \
  https://your-api-gateway.amazonaws.com/prod/mcp/info

# Test MCP tools list (Protected API - Auth Required)
curl -H "Authorization: Bearer YOUR_ID_JAG_TOKEN" \
  https://your-api-gateway.amazonaws.com/prod/mcp/tools
```

### **Authentication Test**
```bash
# Test MCP tool call (Protected API - Auth Required)
curl -H "Authorization: Bearer YOUR_ID_JAG_TOKEN" \
  https://your-api-gateway.amazonaws.com/prod/mcp/tools/call \
  -d '{"tool":"search_documents","arguments":{"query":"test"}}'
```

### **API Architecture**

Your deployment uses a single consolidated API Gateway for optimal security:

- **🔐 Protected API**: `https://your-api-gateway.amazonaws.com/prod/mcp`
  - ID-JAG token authentication required for ALL endpoints
  - Endpoints: `/health`, `/info`, `/tools`, `/tools/call`, all other MCP endpoints
  - Used for all MCP operations with consistent security

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
1. Go to [CloudWatch Console](https://console.aws.amazon.com/cloudwatch/)
2. Navigate to **Metrics** → **Lambda**
3. View:
   - Invocation count
   - Duration
   - Error rate
   - Throttling

### **API Gateway Monitoring**
1. Go to [API Gateway Console](https://console.aws.amazon.com/apigateway/)
2. Select your API
3. Check:
   - **Monitoring**: Request/response metrics
   - **Logs**: Access logs
   - **Stages**: Deployment status

## 🔒 Security Checklist

- [ ] AWS credentials are properly configured
- [ ] IAM roles have minimal required permissions
- [ ] Environment variables are set securely
- [ ] Lambda authorizer is working correctly
- [ ] CORS is properly configured in API Gateway
- [ ] HTTPS is enforced
- [ ] No secrets in code repository

## 🚨 Troubleshooting

### **Common Issues**

#### **Deployment Failures**
```bash
# Check CloudFormation stack status
aws cloudformation describe-stacks --stack-name atko-document-server-mcp

# View deployment events
aws cloudformation describe-stack-events --stack-name atko-document-server-mcp
```

#### **Permission Errors**
```bash
# Check IAM user permissions
aws iam get-user

# Check if user can create CloudFormation stacks
aws cloudformation list-stacks
```

#### **Function Errors**
```bash
# Test Lambda function directly
aws lambda invoke --function-name atko-document-server-mcp-McpServerFunction-* \
  --payload '{"path":"/mcp/health","httpMethod":"GET"}' response.json

# View function configuration
aws lambda get-function --function-name atko-document-server-mcp-McpServerFunction-*
```

#### **API Gateway Issues**
```bash
# Check API Gateway logs
aws logs describe-log-groups --log-group-name-prefix '/aws/apigateway'

# Test API Gateway endpoint
curl -v https://your-api-gateway.amazonaws.com/mcp/health
```

### **Debug Commands**
```bash
# View SAM deployment info
sam info

# Check Lambda function status
aws lambda list-functions --query 'Functions[?contains(FunctionName, `atko-document-server-mcp`)]'

# View API Gateway APIs
aws apigateway get-rest-apis
```

## 📊 Performance Optimization

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

## 🔄 Updates and Rollbacks

### **Update Deployment**
```bash
# Deploy updates
sam deploy

# Deploy with guided mode for parameter changes
sam deploy --guided
```

### **Rollback Deployment**
```bash
# Rollback to previous version
aws cloudformation rollback-stack --stack-name atko-mcp-document-server

# Or manually rollback using CloudFormation console
```

### **Delete Deployment**
```bash
# Delete CloudFormation stack
aws cloudformation delete-stack --stack-name atko-mcp-document-server

# Wait for deletion to complete
aws cloudformation wait stack-delete-complete --stack-name atko-mcp-document-server
```

## 🛠️ Local Development

### **Local Testing**
```bash
# Test Lambda functions locally
cd atko-document-server-mcp
sam local start-api

# Test authorizer locally
cd ../atko-document-server-mcp-auth
sam local invoke McpAuthorizerFunction --event events/authorizer-event.json
```

### **Local Build**
```bash
# Build SAM application
sam build

# Test build locally
sam local invoke McpServerFunction --event events/api-event.json
```

## 📚 Resources

- [AWS SAM Documentation](https://docs.aws.amazon.com/serverless-application-model/)
- [AWS Lambda Documentation](https://docs.aws.amazon.com/lambda/)
- [API Gateway Documentation](https://docs.aws.amazon.com/apigateway/)
- [CloudWatch Documentation](https://docs.aws.amazon.com/cloudwatch/)
- [AWS CLI Documentation](https://docs.aws.amazon.com/cli/)

## 💰 Cost Estimation

### **Lambda Costs**
- **Free Tier**: 1M requests/month, 400,000 GB-seconds/month
- **Additional**: $0.20 per 1M requests, $0.0000166667 per GB-second

### **API Gateway Costs**
- **Free Tier**: 1M API calls/month
- **Additional**: $3.50 per million API calls

### **CloudWatch Costs**
- **Free Tier**: 5GB data ingestion/month
- **Additional**: $0.50 per GB ingested

---

**Next**: For Vercel deployment, see [DEPLOYMENT-VERCEL.md](./DEPLOYMENT-VERCEL.md)
