import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DocumentClient } from './utils/documentClient.js';

// Create document client
const documentClient = new DocumentClient(
  process.env.DOCUMENT_DATABASE_URL || 'http://localhost:3001/api'
);

// Lambda handler for API Gateway
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    console.log('🚀 Lambda handler started');
    console.log('📡 Request path:', event.path);
    console.log('🔧 Request method:', event.httpMethod);
    
    const path = event.path;
    const method = event.httpMethod;
    const headers = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    };

    // Handle CORS preflight
    if (method === 'OPTIONS') {
      return {
        statusCode: 200,
        headers,
        body: ''
      };
    }

    // Route requests based on path
    if (path === '/mcp/info' && method === 'GET') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          name: 'atko-document-server',
          version: '1.0.0',
          description: 'MCP Server for Atko Internal Document Database (Lambda)',
          capabilities: {
            tools: ['search_documents', 'create_document']
          }
        })
      };
    }

    if (path === '/mcp/health' && method === 'GET') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          status: 'healthy',
          timestamp: new Date().toISOString(),
          environment: 'lambda',
          documentDatabase: process.env.DOCUMENT_DATABASE_URL ? 'configured' : 'not configured'
        })
      };
    }

    if (path === '/mcp/tools' && method === 'GET') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
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
        })
      };
    }

    if (path === '/mcp/tools/call' && method === 'POST') {
      // Get user info from Lambda Authorizer context
      const requestContext = event.requestContext;
      const authorizer = requestContext.authorizer;
      
      if (!authorizer || !authorizer.userId || authorizer.verified !== 'true') {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({
            error: 'access_denied',
            error_description: 'User not authorized by Lambda Authorizer'
          })
        };
      }

      const userId = authorizer.userId;
      console.log(`✅ User authorized by Lambda Authorizer: ${userId}`);

      // Parse request body
      const body = JSON.parse(event.body || '{}');
      const { tool, arguments: toolArgs } = body;

      console.log(`📧 MCP Tool Call: ${tool}`, toolArgs);

      switch (tool) {
        case 'search_documents':
          return await handleSearchDocuments(toolArgs, headers);
        
        case 'create_document':
          return await handleCreateDocument(toolArgs, headers);
        
        default:
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({
              error: 'Unknown tool',
              message: `Tool '${tool}' is not supported. Available tools: search_documents, create_document`
            })
          };
      }
    }

    // 404 for unknown paths
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({
        error: 'Not found',
        message: `Endpoint ${method} ${path} not found`
      })
    };

  } catch (error) {
    console.error('❌ Lambda handler error:', error);
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace'
      })
    };
  }
};

// Tool: search_documents
async function handleSearchDocuments(args: any, headers: any): Promise<APIGatewayProxyResult> {
  try {
    console.log('🔍 Starting document search with args:', args);
    const { query, category, author, tags, limit = 10 } = args;

    // Validate required parameters
    if (!query && !category && !author && !tags) {
      console.log('❌ Missing search parameters');
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Missing parameters',
          message: 'At least one search parameter (query, category, author, or tags) is required'
        })
      };
    }

    // Check if document database is configured
    if (!process.env.DOCUMENT_DATABASE_URL) {
      console.log('❌ Document database URL not configured');
      return {
        statusCode: 503,
        headers,
        body: JSON.stringify({
          error: 'Service unavailable',
          message: 'Document database URL not configured'
        })
      };
    }

    console.log('📡 Document database URL:', process.env.DOCUMENT_DATABASE_URL);

    const searchParams = {
      q: query,
      category,
      author,
      tags: Array.isArray(tags) ? tags : (tags ? [tags] : undefined),
      limit: Math.min(limit, 50) // Cap at 50 results
    };

    console.log('🔍 Search parameters:', searchParams);
    console.log('📡 Calling documentClient.searchDocuments...');

    const documents = await documentClient.searchDocuments(searchParams);
    
    console.log(`✅ Document search completed successfully. Found ${documents.length} documents`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
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
      })
    };
  } catch (error) {
    console.error('❌ Search Documents Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Search failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
}

// Tool: create_document
async function handleCreateDocument(args: any, headers: any): Promise<APIGatewayProxyResult> {
  try {
    const { title, content, category, author, tags, isPublic = true } = args;

    // Validate required parameters
    if (!title || !content || !category || !author) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Missing required parameters',
          message: 'title, content, category, and author are required'
        })
      };
    }

    // Check if document database is configured
    if (!process.env.DOCUMENT_DATABASE_URL) {
      return {
        statusCode: 503,
        headers,
        body: JSON.stringify({
          error: 'Service unavailable',
          message: 'Document database URL not configured'
        })
      };
    }

    // Validate category
    const validCategories = ['HR', 'IT', 'Company', 'Department', 'Finance', 'Legal'];
    if (!validCategories.includes(category)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Invalid category',
          message: `Category must be one of: ${validCategories.join(', ')}`
        })
      };
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

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({
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
      })
    };
  } catch (error) {
    console.error('❌ Create Document Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Document creation failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
}
