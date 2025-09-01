import { APIGatewayTokenAuthorizerEvent, APIGatewayAuthorizerResult } from 'aws-lambda';
import { verifyIdJagToken } from 'atko-cross-app-access-sdk';

// Okta configuration
const OKTA_ISSUER = process.env.OKTA_ISSUER || 'https://your-domain.okta.com';
const ID_JAG_AUDIENCE = process.env.ID_JAG_AUDIENCE || 'http://localhost:5001';

// Lambda Authorizer for API Gateway
export const authorizer = async (event: APIGatewayTokenAuthorizerEvent): Promise<APIGatewayAuthorizerResult> => {
  try {
    const token = event.authorizationToken;
    
    if (!token || !token.startsWith('Bearer ')) {
      console.log('❌ Missing or invalid authorization header');
      return generateDenyPolicy('anonymous', event.methodArn);
    }

    const accessToken = token.substring(7); // Remove 'Bearer ' prefix
    
    console.log('🔍 Verifying ID-JAG token in Lambda Authorizer...');

    // Verify ID-JAG token using SDK
    const verificationResult = await verifyIdJagToken(accessToken, {
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

    // Generate allow policy for the verified user
    return generateAllowPolicy(verificationResult.sub, event.methodArn);

  } catch (error) {
    console.error('❌ Lambda Authorizer error:', error);
    return generateDenyPolicy('anonymous', event.methodArn);
  }
};

// Generate allow policy
function generateAllowPolicy(principalId: string, resource: string): APIGatewayAuthorizerResult {
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
    context: {
      userId: principalId,
      verified: 'true'
    }
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
