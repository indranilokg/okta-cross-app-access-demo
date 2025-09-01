import { APIGatewayTokenAuthorizerEvent, APIGatewayAuthorizerResult } from 'aws-lambda';
import { verifyIdJagToken } from 'atko-cross-app-access-sdk';
import { SignJWT } from 'jose';
import { v4 as uuidv4 } from 'uuid';

// Okta configuration
const OKTA_ISSUER = process.env.OKTA_ISSUER || 'https://your-domain.okta.com';
const ID_JAG_AUDIENCE = process.env.ID_JAG_AUDIENCE || 'http://localhost:5001';
const JWT_SECRET = process.env.JWT_SECRET || 'atko-mcp-auth-secret-key-change-in-production';

// JWT signing key
const JWT_SECRET_BYTES = new TextEncoder().encode(JWT_SECRET);

// Lambda Authorizer for API Gateway
export const authorizer = async (event: APIGatewayTokenAuthorizerEvent): Promise<APIGatewayAuthorizerResult> => {
  try {
    const token = event.authorizationToken;
    
    if (!token || !token.startsWith('Bearer ')) {
      console.log('❌ Missing or invalid authorization header');
      return generateDenyPolicy('anonymous', event.methodArn);
    }

    const idJagToken = token.substring(7); // Remove 'Bearer ' prefix
    
    console.log('🔍 Verifying ID-JAG token in Lambda Authorizer...');

    // Verify ID-JAG token using SDK
    const verificationResult = await verifyIdJagToken(idJagToken, {
      issuer: OKTA_ISSUER,
      audience: ID_JAG_AUDIENCE
    });

    if (!verificationResult.valid || !verificationResult.sub) {
      console.error('❌ ID-JAG token verification failed:', verificationResult.error);
      return generateDenyPolicy('anonymous', event.methodArn);
    }

    console.log('✅ ID-JAG token verified successfully in Lambda Authorizer');
    console.log(`  • Subject: ${verificationResult.sub}`);
    console.log(`  • Email: ${verificationResult.email}`);
    console.log(`  • Audience: ${verificationResult.aud}`);

    // Generate MCP access token (same logic as Vercel version)
    console.log('🔐 Generating MCP access token for verified user...');
    const mcpAccessToken = await generateMCPAccessToken(verificationResult.sub);

    // Generate allow policy with MCP token in context
    return generateAllowPolicy(verificationResult.sub, event.methodArn, mcpAccessToken);

  } catch (error) {
    console.error('❌ Lambda Authorizer error:', error);
    return generateDenyPolicy('anonymous', event.methodArn);
  }
};

// Generate MCP access token (same logic as Vercel version)
async function generateMCPAccessToken(sub: string): Promise<string> {
  const tokenId = uuidv4();
  const now = Math.floor(Date.now() / 1000);

  const token = await new SignJWT({
    sub,
    aud: 'atko-mcp-document-server',
    iss: 'atko-mcp-auth-server',
    jti: tokenId,
    scope: 'documents:read documents:write'
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(now)
    .setExpirationTime(now + 3600) // 1 hour
    .sign(JWT_SECRET_BYTES);

  console.log(`✅ MCP access token generated for user: ${sub}`);
  return token;
}

// Generate allow policy
function generateAllowPolicy(principalId: string, resource: string, mcpAccessToken?: string): APIGatewayAuthorizerResult {
  const context: any = {
    userId: principalId,
    verified: 'true'
  };

  // Add MCP access token to context if provided
  if (mcpAccessToken) {
    context.mcpAccessToken = mcpAccessToken;
  }

  return {
    principalId,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: 'Allow',
          Resource: resource
        }
      ]
    },
    context
  };
}

// Generate deny policy
function generateDenyPolicy(principalId: string, resource: string): APIGatewayAuthorizerResult {
  return {
    principalId,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: 'Deny',
          Resource: resource
        }
      ]
    },
    context: {
      userId: principalId,
      verified: 'false'
    }
  };
}
