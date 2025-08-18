import { NextRequest, NextResponse } from 'next/server';
import { getDocumentById, updateDocument, deleteDocument } from '@/utils/documentService';
import { DocumentUpdateRequest, ApiResponse } from '@/types/document';

// GET /api/documents/[id] - Get specific document
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const document = getDocumentById(params.id);

    if (!document) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Document not found'
      };
      return NextResponse.json(response, { status: 404 });
    }

    const response: ApiResponse<typeof document> = {
      success: true,
      data: document
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching document:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to fetch document'
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// PUT /api/documents/[id] - Update document
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body: DocumentUpdateRequest = await request.json();

    // Check if document exists
    const existingDocument = getDocumentById(params.id);
    if (!existingDocument) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Document not found'
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Validate category if provided
    if (body.category) {
      const validCategories = ['HR', 'IT', 'Company', 'Department', 'Finance', 'Legal'];
      if (!validCategories.includes(body.category)) {
        const response: ApiResponse<null> = {
          success: false,
          error: `Invalid category. Must be one of: ${validCategories.join(', ')}`
        };
        return NextResponse.json(response, { status: 400 });
      }
    }

    const updatedDocument = updateDocument(params.id, body);

    if (!updatedDocument) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to update document'
      };
      return NextResponse.json(response, { status: 500 });
    }

    const response: ApiResponse<typeof updatedDocument> = {
      success: true,
      data: updatedDocument,
      message: 'Document updated successfully'
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error updating document:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to update document'
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// DELETE /api/documents/[id] - Delete document
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if document exists
    const existingDocument = getDocumentById(params.id);
    if (!existingDocument) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Document not found'
      };
      return NextResponse.json(response, { status: 404 });
    }

    const success = deleteDocument(params.id);

    if (!success) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to delete document'
      };
      return NextResponse.json(response, { status: 500 });
    }

    const response: ApiResponse<null> = {
      success: true,
      message: 'Document deleted successfully'
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error deleting document:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to delete document'
    };
    return NextResponse.json(response, { status: 500 });
  }
} 