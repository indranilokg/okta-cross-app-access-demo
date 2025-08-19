#!/usr/bin/env node

// Load environment variables from .env file
import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import { SignJWT } from 'jose';
import { v4 as uuidv4 } from 'uuid';
import { verifyIdJagToken } from 'atko-cross-app-access-sdk';

const app = express();
const PORT = process.env.PORT || 3003;

// Okta configuration
const OKTA_ISSUER = process.env.OKTA_ISSUER || 'https://your-domain.okta.com';
const ID_JAG_AUDIENCE = process.env.ID_JAG_AUDIENCE || 'http://localhost:5001';

// Middleware
app.use(cors());
app.use(express.json());

// JWT signing key (in production, use a secure secret)
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'atko-mcp-auth-secret-key-change-in-production'
);

// In-memory storage for issued tokens (in production, use a database)
const issuedTokens = new Set<string>();

// Verify ID-JAG token using the SDK
async function verifyIdJagTokenUsingSDK(idJagToken: string): Promise<{ valid: boolean; sub?: string; email?: string; aud?: string }> {
  try {
    console.log('🔍 Using SDK to verify ID-JAG token...');
    
    // Use the SDK to verify the ID-JAG token
    const verificationResult = await verifyIdJagToken(idJagToken, {
      issuer: OKTA_ISSUER,
      audience: ID_JAG_AUDIENCE
    });

    if (verificationResult.valid) {
      console.log('✅ ID-JAG token verified via SDK:', {
        sub: verificationResult.sub,
        email: verificationResult.email,
        aud: verificationResult.aud,
        iss: verificationResult.iss,
        exp: new Date((verificationResult.exp || 0) * 1000).toISOString()
      });

      return {
        valid: true,
        sub: verificationResult.sub,
        email: verificationResult.email,
        aud: verificationResult.aud
      };
    } else {
      console.error('❌ ID-JAG token verification failed via SDK:', verificationResult.error);
      return { valid: false };
    }
  } catch (error) {
    console.error('❌ SDK ID-JAG token verification error:', error);
    return { valid: false };
  }
}

// Generate JWT access token
async function generateAccessToken(sub: string): Promise<string> {
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
    .sign(JWT_SECRET);

  issuedTokens.add(tokenId);
  return token;
}

// Verify JWT access token (used by MCP server)
export async function verifyAccessToken(token: string): Promise<{ sub: string; valid: boolean }> {
  try {
    const { jwtVerify } = await import('jose');
    const { payload } = await jwtVerify(token, JWT_SECRET);
    
    // Check if token is in our issued tokens list
    if (!issuedTokens.has(payload.jti as string)) {
      return { sub: '', valid: false };
    }

    return { 
      sub: payload.sub as string, 
      valid: true 
    };
  } catch (error) {
    console.error('Token verification failed:', error);
    return { sub: '', valid: false };
  }
}

// Authorization endpoint - only accepts ID-JAG tokens
app.post('/oauth/token', async (req, res) => {
  try {
    const { id_jag_token } = req.body;

    if (!id_jag_token) {
      return res.status(400).json({
        error: 'invalid_request',
        error_description: 'id_jag_token is required. Legacy ID tokens are no longer supported.'
      });
    }

    console.log('🔍 Verifying ID-JAG token...');

    // Verify ID-JAG token using SDK
    const tokenVerification = await verifyIdJagTokenUsingSDK(id_jag_token);
    
    if (!tokenVerification.valid || !tokenVerification.sub) {
      return res.status(401).json({
        error: 'invalid_token',
        error_description: 'Invalid or expired ID-JAG token'
      });
    }

    console.log(`🔐 Issuing MCP access token for user: ${tokenVerification.sub} (${tokenVerification.email})`);

    // Log ID-JAG token details
    try {
      // Decode the JWT payload to show ID-JAG specific fields
      const payload = JSON.parse(atob(id_jag_token.split('.')[1]));
      console.log('🎯 ID-JAG Token Details:');
      console.log(`  • JTI: ${payload.jti}`);
      console.log(`  • Audience: ${payload.aud}`);
      console.log(`  • Client ID: ${payload.client_id || 'N/A'}`);
      console.log(`  • Expires: ${new Date(payload.exp * 1000).toISOString()}`);
    } catch (e) {
      console.warn('⚠️ Could not decode ID-JAG token payload for logging');
    }

    // Generate MCP access token using the verified sub claim
    const accessToken = await generateAccessToken(tokenVerification.sub);

    res.json({
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: 3600,
      scope: 'documents:read documents:write',
      subject: tokenVerification.sub,
      token_type_processed: 'ID-JAG'
    });

  } catch (error) {
    console.error('Token generation error:', error);
    res.status(500).json({
      error: 'server_error',
      error_description: 'Failed to generate access token'
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'atko-mcp-auth-server',
    timestamp: new Date().toISOString(),
    supported_tokens: ['ID-JAG'],
    audience: ID_JAG_AUDIENCE
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Atko MCP Auth Server running on port ${PORT}`);
  console.log(`📝 POST /oauth/token - Generate access token (ID-JAG tokens only)`);
  console.log(`💚 GET /health - Health check`);
  console.log(`🎯 Expected ID-JAG audience: ${ID_JAG_AUDIENCE}`);
  console.log(`📍 Okta issuer: ${OKTA_ISSUER}`);
  console.log('⚠️  Legacy ID tokens are no longer supported');
});

export { app }; 