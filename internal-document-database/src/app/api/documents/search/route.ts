import { NextRequest, NextResponse } from 'next/server';
import { searchDocuments } from '@/utils/documentService';
import { DocumentSearchParams, ApiResponse } from '@/types/document';

// GET /api/documents/search - Search documents
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const searchParamsObj: DocumentSearchParams = {
      q: searchParams.get('q') || undefined,
      category: searchParams.get('category') || undefined,
      author: searchParams.get('author') || undefined,
      tags: searchParams.get('tags') ? searchParams.get('tags')!.split(',') : undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined
    };

    const documents = searchDocuments(searchParamsObj);

    const response: ApiResponse<{
      documents: typeof documents;
      total: number;
      searchParams: DocumentSearchParams;
    }> = {
      success: true,
      data: {
        documents,
        total: documents.length,
        searchParams: searchParamsObj
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error searching documents:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to search documents'
    };
    return NextResponse.json(response, { status: 500 });
  }
} 