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

export class MCPClient {
  private baseUrl: string;
  private authServerUrl: string;
  private accessToken: string | null = null;
  private oktaBaseUrl: string;
  private audience: string;
  private clientId: string;
  private clientSecret: string;

  constructor(
    baseUrl: string = process.env.MCP_SERVER_URL || 'http://localhost:3002',
    authServerUrl: string = process.env.MCP_AUTH_SERVER_URL || 'http://localhost:3003',
    oktaBaseUrl: string = process.env.OKTA_BASE_URL || 'https://your-domain.okta.com',
    audience: string = process.env.ID_JAG_AUDIENCE || 'http://localhost:5001',
    clientId: string = process.env.ID_JAG_CLIENT_ID || 'YOUR_CLIENT_ID',
    clientSecret: string = process.env.ID_JAG_CLIENT_SECRET || 'YOUR_CLIENT_SECRET'
  ) {
    this.baseUrl = baseUrl;
    this.authServerUrl = authServerUrl;
    this.oktaBaseUrl = oktaBaseUrl;
    this.audience = audience;
    this.clientId = clientId;
    this.clientSecret = clientSecret;
  }

  // Get ID-JAG token from Okta using the SDK, then get MCP access token
  async getAccessToken(idToken: string): Promise<{ accessToken: string; idJagToken: string }> {
    try {
      console.log('🔄 Step 1: Exchanging Okta ID token for ID-JAG token...');
      
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
      console.log('🔍 Step 2: Verifying ID-JAG token...');
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

      // Step 3: Exchange ID-JAG token for MCP access token
      console.log('🔄 Step 3: Exchanging ID-JAG token for MCP access token...');
      
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
      console.log('✅ MCP access token obtained from auth server');
      console.log(`🎯 Token type processed: ${tokenData.token_type_processed}`);
      console.log('🎯 Ready to make authenticated MCP calls');
      
      return {
        accessToken: tokenData.access_token,
        idJagToken: idJagResponse.access_token
      };
    } catch (error) {
      console.error('❌ Failed to get MCP access token via ID-JAG flow:', error);
      throw new Error(`ID-JAG authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

  async checkConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return response.ok;
    } catch (error) {
      console.error('MCP connection check failed:', error);
      return false;
    }
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
}

export const mcpClient = new MCPClient(); 