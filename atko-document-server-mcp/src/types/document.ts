export interface Document {
  id: string;
  title: string;
  content: string;
  category: 'HR' | 'IT' | 'Company' | 'Department' | 'Finance' | 'Legal';
  author: string;
  createdDate: string;
  updatedDate: string;
  tags: string[];
  version: number;
  isPublic: boolean;
  allowedEditors?: string[];
}

export interface DocumentSearchParams {
  q?: string;
  category?: string;
  author?: string;
  tags?: string[];
  limit?: number;
  offset?: number;
}

export interface DocumentCreateRequest {
  title: string;
  content: string;
  category: Document['category'];
  author: string;
  tags?: string[];
  isPublic?: boolean;
  allowedEditors?: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
} 