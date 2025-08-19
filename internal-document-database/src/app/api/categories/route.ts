import { NextResponse } from 'next/server';
import { getCategories } from '@/utils/documentService';
import { ApiResponse } from '@/types/document';

// GET /api/categories - Get all categories
export async function GET() {
  try {
    const categories = getCategories();

    const response: ApiResponse<{
      categories: string[];
      count: number;
    }> = {
      success: true,
      data: {
        categories,
        count: categories.length
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching categories:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to fetch categories'
    };
    return NextResponse.json(response, { status: 500 });
  }
} 