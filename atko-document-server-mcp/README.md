# Atko Document Server MCP

A **HTTP-based Model Context Protocol (MCP) server** for the Atko Internal Document Database. This server implements the [MCP Streamable HTTP transport](https://modelcontextprotocol.io/specification/2025-06-18/basic/transports#streamable-http) to enable an AI agent to search and create documents through standardized web APIs.

## 🌟 Features

### MCP Tools
- **`search_documents`** - Search for documents by query, category, author, or tags
- **`create_document`** - Create new documents in the database

### HTTP Transport
- RESTful API endpoints following MCP Streamable HTTP specification
- CORS enabled for web-based client integration
- JSON request/response format


## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- `internal-document-database` running

### Installation
```bash
npm install
npm run build
```

### Development
```bash
npm run dev    # Start with auto-reload
```

### Production
```bash
npm start      # Start the HTTP server
```

## 🔧 HTTP API Endpoints

### Server Information
```bash
GET /info
# Returns server capabilities and version info
```

### Health Check
```bash
GET /health
# Returns server health status
```

### List Available Tools
```bash
GET /tools
# Returns array of available MCP tools with parameters
```

### Execute MCP Tools
```bash
POST /tools/call
Content-Type: application/json

{
  "tool": "search_documents",
  "arguments": {
    "query": "employee benefits",
    "limit": 5
  }
}
```

## 📚 MCP Tools Reference

### search_documents
Search for documents in the Atko database.

**Parameters:**
- `query` (string, optional) - Search query text
- `category` (string, optional) - Document category (HR, IT, Company, Department, Finance, Legal)
- `author` (string, optional) - Document author
- `tags` (array, optional) - Array of tags to search for
- `limit` (number, optional) - Maximum results (default: 10, max: 50)

**Example:**
```bash
curl -X POST http://localhost:3002/tools/call \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "search_documents",
    "arguments": {
      "query": "remote work policy",
      "category": "HR",
      "limit": 3
    }
  }'
```

### create_document
Create a new document in the database.

**Parameters:**
- `title` (string, required) - Document title
- `content` (string, required) - Document content
- `category` (string, required) - Document category
- `author` (string, required) - Document author
- `tags` (array, optional) - Array of tags
- `isPublic` (boolean, optional) - Whether document is public (default: true)

**Example:**
```bash
curl -X POST http://localhost:3002/tools/call \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "create_document",
    "arguments": {
      "title": "New IT Policy",
      "content": "This document outlines the new IT security policy...",
      "category": "IT",
      "author": "IT Department",
      "tags": ["security", "policy"],
      "isPublic": true
    }
  }'
```

## 🧪 Testing

### Automated Testing
```bash
node test-mcp-http.js       # Test HTTP MCP endpoints
```

### Manual Testing
```bash
# Check server health
curl http://localhost:3002/health

# List available tools
curl http://localhost:3002/tools

# Search documents
curl -X POST http://localhost:3002/tools/call \
  -H "Content-Type: application/json" \
  -d '{"tool": "search_documents", "arguments": {"query": "benefits"}}'
```


## 🔗 MCP client Integration

A MCP client can integrate with this MCP server using standard HTTP requests:

### JavaScript Example
```javascript
const MCP_SERVER_URL = 'http://localhost:3002';

async function searchDocuments(query) {
  const response = await fetch(`${MCP_SERVER_URL}/tools/call`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tool: 'search_documents',
      arguments: { query, limit: 5 }
    })
  });
  
  const result = await response.json();
  return result.result.documents;
}

// Usage in MCP client
const documents = await searchDocuments('employee handbook');
```

### Next.js API Route Example
```typescript
// pages/api/mcp-proxy.ts
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { tool, arguments: toolArgs } = req.body;
  
  const mcpResponse = await fetch('http://localhost:3002/tools/call', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tool, arguments: toolArgs })
  });
  
  const result = await mcpResponse.json();
  res.json(result);
}
```

## 📖 MCP Specification Compliance

This server implements the [MCP Streamable HTTP transport specification](https://modelcontextprotocol.io/specification/2025-06-18/basic/transports#streamable-http):

- ✅ HTTP POST endpoint for tool execution
- ✅ JSON request/response format
- ✅ Proper error handling with HTTP status codes
- ✅ Tool discovery via `/tools` endpoint
- ✅ Server information via `/info` endpoint
- ✅ CORS support for web clients
