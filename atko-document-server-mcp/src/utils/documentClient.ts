import axios, { AxiosInstance } from 'axios';
import { Document, DocumentSearchParams, DocumentCreateRequest, ApiResponse } from '../types/document.js';

export class DocumentClient {
  private client: AxiosInstance;
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:3001/api') {
    this.baseUrl = baseUrl;
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Search documents with various criteria
   */
  async searchDocuments(params: DocumentSearchParams): Promise<Document[]> {
    try {
      const response = await this.client.get<ApiResponse<{ documents: Document[] }>>('/documents/search', {
        params,
      });

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to search documents');
      }

      return response.data.data?.documents || [];
    } catch (error) {
      console.error('Error searching documents:', error);
      throw new Error(`Failed to search documents: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get all documents with optional filtering
   */
  async getAllDocuments(params?: {
    category?: string;
    author?: string;
    limit?: number;
    offset?: number;
  }): Promise<Document[]> {
    try {
      const response = await this.client.get<ApiResponse<{ documents: Document[] }>>('/documents', {
        params,
      });

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to get documents');
      }

      return response.data.data?.documents || [];
    } catch (error) {
      console.error('Error getting documents:', error);
      throw new Error(`Failed to get documents: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get a specific document by ID
   */
  async getDocument(id: string): Promise<Document> {
    try {
      const response = await this.client.get<ApiResponse<Document>>(`/documents/${id}`);

      if (!response.data.success) {
        throw new Error(response.data.error || 'Document not found');
      }

      return response.data.data!;
    } catch (error) {
      console.error('Error getting document:', error);
      throw new Error(`Failed to get document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create a new document
   */
  async createDocument(document: DocumentCreateRequest): Promise<Document> {
    try {
      const response = await this.client.post<ApiResponse<Document>>('/documents', document);

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to create document');
      }

      return response.data.data!;
    } catch (error) {
      console.error('Error creating document:', error);
      throw new Error(`Failed to create document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get all available categories
   */
  async getCategories(): Promise<string[]> {
    try {
      const response = await this.client.get<ApiResponse<{ categories: string[] }>>('/categories');

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to get categories');
      }

      return response.data.data?.categories || [];
    } catch (error) {
      console.error('Error getting categories:', error);
      throw new Error(`Failed to get categories: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Test the connection to the document database
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.client.get<ApiResponse<any>>('/documents');
      return response.data.success;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }
} 