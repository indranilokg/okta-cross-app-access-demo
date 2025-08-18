import { jwtVerify } from 'jose';

// JWT signing key - must match the auth server
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'atko-mcp-auth-secret-key-change-in-production'
);

// Verify JWT access token (simplified version for MCP server)
export async function verifyAccessToken(token: string): Promise<{ sub: string; valid: boolean; payload?: any }> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    
    // Basic validation
    if (!payload.sub || !payload.aud || payload.aud !== 'atko-mcp-document-server') {
      return { sub: '', valid: false };
    }

    // Check expiration (jose library handles this automatically)
    return { 
      sub: payload.sub as string, 
      valid: true,
      payload 
    };
  } catch (error) {
    console.error('Token verification failed:', error);
    return { sub: '', valid: false };
  }
}

// Middleware function for Express
export function createAuthMiddleware() {
  return async (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'access_denied',
        error_description: 'Missing or invalid authorization header'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const { sub, valid, payload } = await verifyAccessToken(token);

    if (!valid) {
      return res.status(401).json({
        error: 'access_denied',
        error_description: 'Invalid or expired access token'
      });
    }

    // Add user info to request
    req.user = { sub, payload };
    next();
  };
} 