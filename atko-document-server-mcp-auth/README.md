# Atko MCP Authorization Server

A secure authorization server designed for MCP (Model Context Protocol) cross-app access using **ID-JAG (Identity Assertion Authorization Grant)** tokens exclusively.

## Overview

This authorization server **only accepts ID-JAG tokens** generated from Okta, verifies them using Okta's public keys, and issues MCP access tokens for authenticated document operations.

## Features

### ✅ **ID-JAG Token Only Support**
- **SDK Integration**: Uses `atko-cross-app-access-sdk@beta` for proper ID-JAG token verification
- **Audience Validation**: Validates tokens with audience `http://localhost:5001`
- **Enhanced Security**: Cryptographic verification using Okta JWKS

### ✅ **Secure Cross-App Access**
- **No Legacy Support**: Only accepts ID-JAG tokens for maximum security
- **Enforced Flow**: Clients must use proper cross-app authorization
- **Audience Scoping**: Tokens must have correct audience claim

### ✅ **Security & Verification**
- **JWT Verification**: Uses Okta's public keys for signature validation
- **Issuer Validation**: Ensures tokens come from trusted Okta org
- **Expiration Checking**: Automatic validation of token lifetime
- **Secure Signing**: MCP access tokens signed with HMAC SHA-256

## API Endpoints

### POST `/oauth/token`

Exchange ID-JAG tokens for MCP access tokens.

#### Request (ID-JAG Token Required)
```json
{
  "id_jag_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Error for Legacy Tokens
```json
{
  "error": "invalid_request",
  "error_description": "id_jag_token is required. Legacy ID tokens are no longer supported."
}
```

#### Response
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "scope": "documents:read documents:write",
  "subject": "00u1rsjejbueuQNhB1d7",
  "token_type_processed": "ID-JAG"
}
```

### GET `/health`
Health check endpoint with supported token information.

```json
{
  "status": "ok",
  "service": "atko-mcp-auth-server",
  "timestamp": "2024-01-15T10:00:00.000Z",
  "supported_tokens": ["ID-JAG"],
  "audience": "http://localhost:5001"
}
```

## Configuration

### Environment Variables
Create a `.env` file in the project root with the following variables:

```bash
# Okta Configuration
OKTA_ISSUER=https://your-domain.oktapreview.com
ID_JAG_AUDIENCE=http://localhost:5001

# Server Configuration  
PORT=3003
JWT_SECRET=your-secret-key-for-mcp-tokens
```

### ID-JAG Token Requirements
- **Issuer**: Must match `OKTA_ISSUER`
- **Audience**: Must be `http://localhost:5001`
- **Signature**: Must be verifiable with Okta's public keys
- **Expiration**: Must not be expired
- **Format**: Must be valid ID-JAG token format

## Installation & Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment**
   Create a `.env` file based on `env.local.template` with your actual values.

3. **Build TypeScript**
   ```bash
   npm run build
   ```

4. **Start Server**
   ```bash
   npm run dev
   ```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the project root with the following variables:

```bash
# Server Configuration
PORT=3003

# Okta Configuration
OKTA_ISSUER=https://your-domain.oktapreview.com

# ID-JAG Configuration
ID_JAG_AUDIENCE=http://localhost:5001

# JWT Secret for signing MCP access tokens (shared with MCP Document Server)
JWT_SECRET=your-secret-key-for-mcp-tokens

# Node Environment
NODE_ENV=development
```

**Important**: The `JWT_SECRET` must match the one used in the MCP Document Server for token verification to work properly.

## Testing

### Comprehensive Test
```bash
npm run test:id-jag
```

This test:
1. ✅ Generates ID-JAG token using SDK
2. ✅ Verifies auth server accepts ID-JAG tokens  
3. ✅ Confirms legacy ID tokens are rejected
4. ✅ Tests SDK-based token verification
5. ✅ Validates proper audience handling

### Manual Testing

#### ID-JAG Token Flow (Only Supported)
```bash
# Generate ID-JAG token first using the SDK
curl -X POST http://localhost:3003/oauth/token \
  -H "Content-Type: application/json" \
  -d '{"id_jag_token": "YOUR_ID_JAG_TOKEN"}'
```


## Architecture

### Secure Token Flow
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ Client App      │    │ ID-JAG Exchange  │    │ MCP Auth Server │
│                 │    │ (Okta)           │    │ (ID-JAG Only)   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
        │                        │                        │
        │ 1. ID Token            │                        │
        ├────────────────────────▶                        │
        │ 2. ID-JAG Token        │                        │
        ◀────────────────────────┤                        │
        │ 3. ID-JAG Token        │                        │
        ├─────────────────────────────────────────────────▶
        │                        │   🔍 SDK Verification  │
        │                        │   ✅ Audience Check   │
        │                        │   ❌ Legacy Rejected  │
        │ 4. MCP Access Token    │                        │
        ◀─────────────────────────────────────────────────┤
```


### Key SDK Dependency
- **`atko-cross-app-access-sdk@beta`** - ID-JAG token verification
