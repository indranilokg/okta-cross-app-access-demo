#!/bin/bash

# Atko MCP SAM Deployment Script
# This script deploys both MCP server and auth services using AWS SAM

set -e

echo "🚀 Starting Atko MCP SAM Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    print_error "AWS CLI is not installed. Please install it first."
    exit 1
fi

# Check if SAM CLI is installed
if ! command -v sam &> /dev/null; then
    print_error "AWS SAM CLI is not installed. Please install it first:"
    echo "brew install aws-sam-cli"
    exit 1
fi

# Check if required environment variables are set
print_status "Checking environment variables..."

REQUIRED_VARS=(
    "DOCUMENT_DATABASE_URL"
    "JWT_SECRET"
    "OKTA_ISSUER"
    "ID_JAG_AUDIENCE"
)

MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        MISSING_VARS+=("$var")
    fi
done

if [ ${#MISSING_VARS[@]} -ne 0 ]; then
    print_error "Missing required environment variables:"
    for var in "${MISSING_VARS[@]}"; do
        echo "  - $var"
    done
    echo ""
    echo "Please set these variables in your environment or .env file"
    exit 1
fi

print_success "All required environment variables are set"

# Deploy MCP Document Server
print_status "Deploying MCP Document Server..."
cd atko-document-server-mcp

# Install dependencies
print_status "Installing dependencies..."
npm install

# Build for Lambda
print_status "Building for Lambda..."
npm run build:lambda

# Build SAM application
print_status "Building SAM application..."
sam build

# Deploy to AWS
print_status "Deploying to AWS Lambda..."
sam deploy --guided --parameter-overrides \
    DocumentDatabaseUrl="$DOCUMENT_DATABASE_URL" \
    JwtSecret="$JWT_SECRET" \
    OktaIssuer="$OKTA_ISSUER" \
    IdJagAudience="$ID_JAG_AUDIENCE"

# Get the deployed URL
SERVER_URL=$(aws cloudformation describe-stacks --stack-name atko-mcp-document-server --query 'Stacks[0].Outputs[?OutputKey==`McpApiUrl`].OutputValue' --output text 2>/dev/null || echo "https://your-api-gateway.amazonaws.com/mcp")

print_success "MCP Document Server deployed successfully"
print_status "Server URL: $SERVER_URL"

cd ..

# Deploy MCP Auth Server
print_status "Deploying MCP Auth Server..."
cd atko-document-server-mcp-auth

# Install dependencies
print_status "Installing dependencies..."
npm install

# Build for Lambda
print_status "Building for Lambda..."
npm run build:lambda

# Build SAM application
print_status "Building SAM application..."
sam build

# Deploy to AWS
print_status "Deploying to AWS Lambda..."
sam deploy --guided --parameter-overrides \
    JwtSecret="$JWT_SECRET" \
    OktaIssuer="$OKTA_ISSUER" \
    IdJagAudience="$ID_JAG_AUDIENCE"

print_success "MCP Auth Server deployed successfully"

cd ..

# Create deployment summary
echo ""
print_success "🎉 SAM Deployment Complete!"
echo ""
echo "📋 Deployment Summary:"
echo "======================"
echo "🛠️  MCP Document Server:"
echo "   URL: $SERVER_URL"
echo ""
echo "🔐 MCP Auth Server (Lambda Authorizer):"
echo "   Deployed as Lambda function"
echo ""
echo "🔧 Next Steps:"
echo "=============="
echo "1. Update your Employee Assistant environment variables:"
echo "   MCP_DEPLOYMENT_MODE=lambda"
echo "   MCP_LAMBDA_URL=$SERVER_URL"
echo ""
echo "2. Test the deployment:"
echo "   curl -H 'Authorization: Bearer YOUR_ID_JAG_TOKEN' $SERVER_URL/health"
echo ""
echo "3. Monitor logs in CloudWatch:"
echo "   aws logs describe-log-groups --log-group-name-prefix '/aws/lambda/atko-mcp'"
echo ""
print_success "Deployment completed successfully! 🚀"
