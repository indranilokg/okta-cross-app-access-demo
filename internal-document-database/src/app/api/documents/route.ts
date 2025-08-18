import { NextRequest, NextResponse } from 'next/server';
import { readDocuments, createDocument } from '@/utils/documentService';
import { DocumentCreateRequest, ApiResponse } from '@/types/document';

// GET /api/documents - Get all documents
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const author = searchParams.get('author');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined;

    const documents = readDocuments();
    let filtered = documents;

    // Apply filters
    if (category) {
      filtered = filtered.filter(doc => doc.category === category);
    }

    if (author) {
      filtered = filtered.filter(doc => 
        doc.author.toLowerCase().includes(author.toLowerCase())
      );
    }

    // Apply pagination
    const start = offset || 0;
    const end = limit ? start + limit : filtered.length;
    const paginated = filtered.slice(start, end);

    const response: ApiResponse<{
      documents: typeof paginated;
      total: number;
      limit?: number;
      offset?: number;
    }> = {
      success: true,
      data: {
        documents: paginated,
        total: filtered.length,
        limit,
        offset
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching documents:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to fetch documents'
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// POST /api/documents - Create new document
export async function POST(request: NextRequest) {
  try {
    const body: DocumentCreateRequest = await request.json();

    // Validate required fields
    if (!body.title || !body.content || !body.category || !body.author) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Missing required fields: title, content, category, and author are required'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Validate category
    const validCategories = ['HR', 'IT', 'Company', 'Department', 'Finance', 'Legal'];
    if (!validCategories.includes(body.category)) {
      const response: ApiResponse<null> = {
        success: false,
        error: `Invalid category. Must be one of: ${validCategories.join(', ')}`
      };
      return NextResponse.json(response, { status: 400 });
    }

    const newDocument = createDocument(body);

    if (!newDocument) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to create document'
      };
      return NextResponse.json(response, { status: 500 });
    }

    const response: ApiResponse<typeof newDocument> = {
      success: true,
      data: newDocument,
      message: 'Document created successfully'
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error creating document:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to create document'
    };
    return NextResponse.json(response, { status: 500 });
  }
} 