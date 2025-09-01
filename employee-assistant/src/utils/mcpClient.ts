// src/utils/mcpClient.ts
import { exchangeIdTokenForIdJag, verifyIdJagToken } from 'atko-cross-app-access-sdk';

export interface MCPResponse<T = any> {
  tool: string;
  result: T;
  error?: string;
}

export interface DocumentSearchParams {
  query?: string;
  category?: string;
  author?: string;
  tags?: string[];
  limit?: number;
}

export interface DocumentCreateParams {
  title: string;
  content: string;
  category: string;
  author: string;
  tags?: string[];
  isPublic?: boolean;
}

export type DeploymentMode = 'vercel' | 'lambda';

class MCPClient {
  private baseUrl: string;
  private authServerUrl: string;
  private accessToken: string | null = null;
  private idJagToken: string | null = null;
  private oktaBaseUrl: string;
  private audience: string;
  private clientId: string;
  private clientSecret: string;
  private deploymentMode: DeploymentMode;

  constructor(
    baseUrl?: string,
    authServerUrl?: string,
    oktaBaseUrl: string = process.env.OKTA_BASE_URL || 'https://your-domain.okta.com',
    audience: string = process.env.ID_JAG_AUDIENCE || 'http://localhost:5001',
    clientId: string = process.env.ID_JAG_CLIENT_ID || 'YOUR_CLIENT_ID',
    clientSecret: string = process.env.ID_JAG_CLIENT_SECRET || 'YOUR_CLIENT_SECRET'
  ) {
    // Detect deployment mode from environment (use public env var for client-side)
    this.deploymentMode = (process.env.NEXT_PUBLIC_MCP_DEPLOYMENT_MODE as DeploymentMode) || 'vercel';
    
    if (this.deploymentMode === 'lambda') {
      // Lambda deployment - direct API Gateway URL (no separate auth server needed)
      this.baseUrl = baseUrl || process.env.MCP_LAMBDA_URL || 'https://api-gateway-url.amazonaws.com/mcp';
      this.authServerUrl = ''; // Not used in Lambda mode
    } else {
      // Vercel deployment - via proxy or direct
      this.baseUrl = baseUrl || process.env.MCP_SERVER_URL || 'http://localhost:3002';
      this.authServerUrl = authServerUrl || process.env.MCP_AUTH_SERVER_URL || 'http://localhost:3003';
    }

    this.oktaBaseUrl = oktaBaseUrl;
    this.audience = audience;
    this.clientId = clientId;
    this.clientSecret = clientSecret;

    console.log(`🚀 MCP Client initialized in ${this.deploymentMode.toUpperCase()} mode`);
    console.log(`📡 Base URL: ${this.baseUrl}`);
    if (this.deploymentMode === 'vercel') {
      console.log(`🔐 Auth URL: ${this.authServerUrl}`);
    }
  }

  // Check if ID-JAG token is expired using SDK verification
  private async isIdJagTokenExpired(): Promise<boolean> {
    if (!this.idJagToken) {
      return true;
    }
    
    try {
      // Use SDK to verify ID-JAG token (this will check expiration automatically)
      const verificationResult = await verifyIdJagToken(this.idJagToken, {
        issuer: this.oktaBaseUrl,
        audience: this.audience
      });
      
      return !verificationResult.valid;
    } catch (error) {
      console.log('ID-JAG token verification failed, considering expired:', error);
      return true;
    }
  }

  // Get access token based on deployment mode (with automatic refresh)
  async getAccessToken(idToken: string): Promise<{ accessToken: string; idJagToken: string }> {
    // Check if we need to refresh tokens
    if (this.deploymentMode === 'lambda') {
      if (await this.isIdJagTokenExpired()) {
        console.log('🔄 ID-JAG token expired, generating new one...');
        return this.getAccessTokenLambda(idToken);
      } else {
        console.log('✅ Using existing valid ID-JAG token');
        return {
          accessToken: this.idJagToken!,
          idJagToken: this.idJagToken!
        };
      }
    } else {
      // For Vercel mode, always generate new MCP token from ID-JAG token
      // Let the MCP server handle MCP token validation
      console.log('🔄 Generating new MCP access token from ID-JAG token...');
      return this.getAccessTokenVercel(idToken);
    }
  }

  // Lambda mode: Use ID-JAG token directly (authorization handled by Lambda Authorizer)
  private async getAccessTokenLambda(idToken: string): Promise<{ accessToken: string; idJagToken: string }> {
    try {
      console.log('🔄 Lambda Mode: Exchanging Okta ID token for ID-JAG token...');
      
      // Step 1: Use SDK to exchange ID token for ID-JAG token
      const idJagResponse = await exchangeIdTokenForIdJag({
        subject_token: idToken,
        audience: this.audience,
        client_id: this.clientId,
        client_secret: this.clientSecret
      }, this.oktaBaseUrl);

      console.log('✅ ID-JAG token obtained successfully for Lambda mode');
      console.log('📋 ID-JAG Token Details:');
      console.log(`  • Token Type: ${idJagResponse.token_type}`);
      console.log(`  • Issued Token Type: ${idJagResponse.issued_token_type}`);
      console.log(`  • Expires In: ${idJagResponse.expires_in} seconds`);
      
      // Optional: Verify the ID-JAG token
      console.log('🔍 Verifying ID-JAG token...');
      const verificationResult = await verifyIdJagToken(idJagResponse.access_token, {
        issuer: this.oktaBaseUrl,
        audience: this.audience
      });

      if (verificationResult.valid) {
        console.log('✅ ID-JAG token verified successfully');
        console.log(`  • Subject: ${verificationResult.sub}`);
        console.log(`  • Audience: ${verificationResult.aud}`);
        console.log(`  • Issuer: ${verificationResult.iss}`);
      } else {
        console.warn('⚠️ ID-JAG token verification failed:', verificationResult.error);
      }

      // In Lambda mode, we use the ID-JAG token directly
      // The Lambda Authorizer will handle token verification
      this.accessToken = idJagResponse.access_token;
      this.idJagToken = idJagResponse.access_token;
      
      console.log('🎯 Lambda mode: Using ID-JAG token directly for API calls');
      
      return {
        accessToken: idJagResponse.access_token,
        idJagToken: idJagResponse.access_token
      };
    } catch (error) {
      console.error('❌ Failed to get ID-JAG token for Lambda mode:', error);
      throw new Error(`Lambda authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Vercel mode: Use existing auth server flow
  private async getAccessTokenVercel(idToken: string): Promise<{ accessToken: string; idJagToken: string }> {
    try {
      console.log('🔄 Vercel Mode: Exchanging Okta ID token for ID-JAG token...');
      
      // Step 1: Use SDK to exchange ID token for ID-JAG token
      const idJagResponse = await exchangeIdTokenForIdJag({
        subject_token: idToken,
        audience: this.audience,
        client_id: this.clientId,
        client_secret: this.clientSecret
      }, this.oktaBaseUrl);

      console.log('✅ ID-JAG token obtained successfully');
      console.log('📋 ID-JAG Token Details:');
      console.log(`  • Token Type: ${idJagResponse.token_type}`);
      console.log(`  • Issued Token Type: ${idJagResponse.issued_token_type}`);
      console.log(`  • Expires In: ${idJagResponse.expires_in} seconds`);
      
      // Optional: Verify the ID-JAG token
      console.log('🔍 Verifying ID-JAG token...');
      const verificationResult = await verifyIdJagToken(idJagResponse.access_token, {
        issuer: this.oktaBaseUrl,
        audience: this.audience
      });

      if (verificationResult.valid) {
        console.log('✅ ID-JAG token verified successfully');
        console.log(`  • Subject: ${verificationResult.sub}`);
        console.log(`  • Audience: ${verificationResult.aud}`);
        console.log(`  • Issuer: ${verificationResult.iss}`);
      } else {
        console.warn('⚠️ ID-JAG token verification failed:', verificationResult.error);
      }

      // Step 3: Exchange ID-JAG token for MCP access token (Vercel mode only)
      console.log('🔄 Vercel Mode: Exchanging ID-JAG token for MCP access token...');
      
      const response = await fetch(`${this.authServerUrl}/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id_jag_token: idJagResponse.access_token
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`MCP auth failed: ${errorData.error_description || response.statusText}`);
      }

      const tokenData = await response.json();
      this.accessToken = tokenData.access_token;
      this.idJagToken = idJagResponse.access_token;
      
      console.log('✅ MCP access token obtained from auth server');
      console.log(`🎯 Token type processed: ${tokenData.token_type_processed}`);
      console.log('🎯 Ready to make authenticated MCP calls');
      
      return {
        accessToken: tokenData.access_token,
        idJagToken: idJagResponse.access_token
      };
    } catch (error) {
      console.error('❌ Failed to get MCP access token via Vercel flow:', error);
      throw new Error(`Vercel authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Set access token manually (alternative to getAccessToken)
  setAccessToken(token: string) {
    this.accessToken = token;
  }

  async callTool(tool: string, toolArgs: any): Promise<MCPResponse> {
    try {
      if (!this.accessToken) {
        throw new Error('No access token available. Call getAccessToken() first.');
      }

      const response = await fetch(`${this.baseUrl}/tools/call`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.accessToken}`,
        },
        body: JSON.stringify({
          tool,
          arguments: toolArgs
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`MCP tool call failed:`, error);
      throw error;
    }
  }

  async searchDocuments(params: DocumentSearchParams): Promise<MCPResponse> {
    return this.callTool('search_documents', params);
  }

  async createDocument(params: DocumentCreateParams): Promise<MCPResponse> {
    return this.callTool('create_document', params);
  }

  async getAvailableTools(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/tools`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to get available tools:', error);
      throw error;
    }
  }

  // Get current deployment mode
  getDeploymentMode(): DeploymentMode {
    return this.deploymentMode;
  }

  // Get current URLs
  getUrls(): { baseUrl: string; authServerUrl: string } {
    return {
      baseUrl: this.baseUrl,
      authServerUrl: this.authServerUrl
    };
  }

  // Get current token information for UI display
  async getTokenInfo(): Promise<{
    hasValidToken: boolean;
    idJagToken: string | null;
    deploymentMode: DeploymentMode;
  }> {
    // Only check ID-JAG token validity - MCP server handles MCP token validation
    const isExpired = await this.isIdJagTokenExpired();
    
    return {
      hasValidToken: !isExpired,
      idJagToken: this.idJagToken,
      deploymentMode: this.deploymentMode
    };
  }

  // Force refresh tokens (useful for manual refresh)
  async refreshTokens(idToken: string): Promise<{ accessToken: string; idJagToken: string }> {
    console.log('🔄 Forcing token refresh...');
    this.accessToken = null;
    this.idJagToken = null;
    return this.getAccessToken(idToken);
  }
}

// Export the class for dynamic instantiation
export { MCPClient };

// Create a lazy singleton instance
let mcpClientInstance: MCPClient | null = null;

export const getMCPClient = (): MCPClient => {
  if (!mcpClientInstance) {
    try {
      mcpClientInstance = new MCPClient();
    } catch (error) {
      console.error('Failed to initialize MCP client:', error);
      // Return a fallback instance with default values
      mcpClientInstance = new MCPClient();
    }
  }
  return mcpClientInstance;
};

// For backward compatibility
export const mcpClient = getMCPClient(); 