#!/usr/bin/env node

// Load environment variables from .env file
import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import { DocumentClient } from './utils/documentClient.js';
import { createAuthMiddleware } from './utils/tokenVerifier.js';

const app = express();
const PORT = process.env.PORT || 3002;

// Create document client
const documentClient = new DocumentClient(
  process.env.DOCUMENT_DATABASE_URL || 'http://localhost:3001/api'
);

// Middleware
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? [process.env.VERCEL_URL, process.env.DOCUMENT_DATABASE_URL].filter((url): url is string => Boolean(url))
  : ['http://localhost:3000', 'http://localhost:3001'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());

// MCP Server Info - Required by MCP Specification
app.get('/info', (req, res) => {
  res.json({
    name: 'atko-document-server',
    version: '1.0.0',
    description: 'MCP Server for Atko Internal Document Database',
    capabilities: {
      tools: ['search_documents', 'create_document']
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    documentDatabase: 'connected'
  });
});

// Create auth middleware
const authMiddleware = createAuthMiddleware();

// MCP Tools endpoint - Streamable HTTP implementation (Protected)
app.post('/tools/call', authMiddleware, async (req, res) => {
  try {
    const { tool, arguments: toolArgs } = req.body;

    console.log(`📧 MCP Tool Call: ${tool}`, toolArgs);

    switch (tool) {
      case 'search_documents':
        return await handleSearchDocuments(toolArgs, res);
      
      case 'create_document':
        return await handleCreateDocument(toolArgs, res);
      
      default:
        return res.status(400).json({
          error: 'Unknown tool',
          message: `Tool '${tool}' is not supported. Available tools: search_documents, create_document`
        });
    }
  } catch (error) {
    console.error('❌ MCP Tool Call Error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Tool: search_documents
async function handleSearchDocuments(args: any, res: express.Response) {
  try {
    const { query, category, author, tags, limit = 10 } = args;

    // Validate required parameters
    if (!query && !category && !author && !tags) {
      return res.status(400).json({
        error: 'Missing parameters',
        message: 'At least one search parameter (query, category, author, or tags) is required'
      });
    }

    const searchParams = {
      q: query,
      category,
      author,
      tags: Array.isArray(tags) ? tags : (tags ? [tags] : undefined),
      limit: Math.min(limit, 50) // Cap at 50 results
    };

    const documents = await documentClient.searchDocuments(searchParams);

    res.json({
      tool: 'search_documents',
      result: {
        success: true,
        count: documents.length,
        documents: documents.map(doc => ({
          id: doc.id,
          title: doc.title,
          content: doc.content.substring(0, 500) + (doc.content.length > 500 ? '...' : ''),
          category: doc.category,
          author: doc.author,
          tags: doc.tags,
          createdDate: doc.createdDate,
          updatedDate: doc.updatedDate
        }))
      }
    });
  } catch (error) {
    console.error('❌ Search Documents Error:', error);
    res.status(500).json({
      error: 'Search failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Tool: create_document
async function handleCreateDocument(args: any, res: express.Response) {
  try {
    const { title, content, category, author, tags, isPublic = true } = args;

    // Validate required parameters
    if (!title || !content || !category || !author) {
      return res.status(400).json({
        error: 'Missing required parameters',
        message: 'title, content, category, and author are required'
      });
    }

    // Validate category
    const validCategories = ['HR', 'IT', 'Company', 'Department', 'Finance', 'Legal'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        error: 'Invalid category',
        message: `Category must be one of: ${validCategories.join(', ')}`
      });
    }

    const documentData = {
      title,
      content,
      category,
      author,
      tags: Array.isArray(tags) ? tags : (tags ? [tags] : []),
      isPublic
    };

    const newDocument = await documentClient.createDocument(documentData);

    res.status(201).json({
      tool: 'create_document',
      result: {
        success: true,
        document: {
          id: newDocument.id,
          title: newDocument.title,
          content: newDocument.content.substring(0, 500) + (newDocument.content.length > 500 ? '...' : ''),
          category: newDocument.category,
          author: newDocument.author,
          tags: newDocument.tags,
          createdDate: newDocument.createdDate,
          version: newDocument.version
        }
      }
    });
  } catch (error) {
    console.error('❌ Create Document Error:', error);
    res.status(500).json({
      error: 'Document creation failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// List available tools
app.get('/tools', (req, res) => {
  res.json({
    tools: [
      {
        name: 'search_documents',
        description: 'Search for documents in the Atko internal document database',
        parameters: {
          query: { type: 'string', description: 'Search query text', required: false },
          category: { type: 'string', description: 'Document category (HR, IT, Company, Department, Finance, Legal)', required: false },
          author: { type: 'string', description: 'Document author', required: false },
          tags: { type: 'array', description: 'Array of tags to search for', required: false },
          limit: { type: 'number', description: 'Maximum number of results (default: 10, max: 50)', required: false }
        }
      },
      {
        name: 'create_document',
        description: 'Create a new document in the Atko internal document database',
        parameters: {
          title: { type: 'string', description: 'Document title', required: true },
          content: { type: 'string', description: 'Document content', required: true },
          category: { type: 'string', description: 'Document category (HR, IT, Company, Department, Finance, Legal)', required: true },
          author: { type: 'string', description: 'Document author', required: true },
          tags: { type: 'array', description: 'Array of tags', required: false },
          isPublic: { type: 'boolean', description: 'Whether document is public (default: true)', required: false }
        }
      }
    ]
  });
});

// Error handler
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ Server Error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: error.message || 'Unknown error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Endpoint ${req.method} ${req.path} not found`
  });
});

async function main() {
  // Test connection to document database
  console.log('🔗 Testing connection to document database...');
  const isConnected = await documentClient.testConnection();
  
  if (!isConnected) {
    const dbUrl = process.env.DOCUMENT_DATABASE_URL || 'http://localhost:3001/api';
    console.error(`❌ Failed to connect to document database at ${dbUrl}`);
    console.error('💡 Make sure the internal-document-database is running and accessible');
    process.exit(1);
  }
  
  console.log('✅ Connected to document database successfully');

  // Start HTTP server
  app.listen(PORT, () => {
    console.log('🚀 Atko Document Server MCP ready');
    console.log(`📡 HTTP Server listening on port ${PORT}`);
    console.log('🔗 Endpoints:');
    console.log(`   • GET  http://localhost:${PORT}/info - Server info`);
    console.log(`   • GET  http://localhost:${PORT}/health - Health check`);
    console.log(`   • GET  http://localhost:${PORT}/tools - List available tools`);
    console.log(`   • POST http://localhost:${PORT}/tools/call - Execute MCP tools`);
    console.log('');
    console.log('📚 Available MCP tools:');
    console.log('   • search_documents - Search for documents');
    console.log('   • create_document - Create new documents');
    console.log('');
    console.log('💡 This server implements the MCP Streamable HTTP protocol');
    console.log('   Ready for integration with the Employee Assistant');
  });
}

main().catch((error) => {
  console.error('❌ Server startup error:', error);
  process.exit(1);
}); 