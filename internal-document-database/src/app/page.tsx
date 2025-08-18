'use client';

import { useState, useEffect } from 'react';
import { Document } from '@/types/document';

export default function Home() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState<string[]>([]);

  // Fetch documents on component mount
  useEffect(() => {
    fetchDocuments();
    fetchCategories();
  }, []);

  // Fetch all documents
  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/documents');
      const data = await response.json();
      
      if (data.success) {
        setDocuments(data.data.documents);
      } else {
        console.error('Failed to fetch documents:', data.error);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      
      if (data.success) {
        setCategories(data.data.categories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // Search documents
  const searchDocuments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      if (selectedCategory) params.append('category', selectedCategory);
      
      const response = await fetch(`/api/documents/search?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setDocuments(data.data.documents);
      } else {
        console.error('Failed to search documents:', data.error);
      }
    } catch (error) {
      console.error('Error searching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchDocuments();
  };

  // Clear search and show all documents
  const clearSearch = () => {
    setSearchQuery('');
    setSelectedCategory('');
    fetchDocuments();
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Atko Internal Document Database
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Search and manage company documents
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">API Status: <span className="text-green-600 font-medium">Active</span></p>
              <p className="text-xs text-gray-400">No authentication required</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Search Documents</h2>
          
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                  Search Query
                </label>
                <input
                  type="text"
                  id="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by title, content, or tags..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  id="category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-end space-x-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Search
                </button>
                <button
                  type="button"
                  onClick={clearSearch}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Clear
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Results Section */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Documents ({documents.length})
            </h2>
          </div>

          {loading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading documents...</p>
            </div>
          ) : documents.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-gray-500">No documents found.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {documents.map((document) => (
                <div key={document.id} className="p-6 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {document.title}
                      </h3>
                      <p className="text-gray-600 mb-3 line-clamp-3">
                        {document.content.substring(0, 200)}...
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Category: {document.category}</span>
                        <span>Author: {document.author}</span>
                        <span>Created: {formatDate(document.createdDate)}</span>
                        <span>Version: {document.version}</span>
                      </div>
                      {document.tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {document.tags.map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        document.isPublic 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {document.isPublic ? 'Public' : 'Private'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* API Information */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-4">API Endpoints</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium text-blue-800">GET /api/documents</p>
              <p className="text-blue-700">Get all documents with optional filtering</p>
            </div>
            <div>
              <p className="font-medium text-blue-800">GET /api/documents/search</p>
              <p className="text-blue-700">Search documents by query, category, author, or tags</p>
            </div>
            <div>
              <p className="font-medium text-blue-800">GET /api/documents/[id]</p>
              <p className="text-blue-700">Get a specific document by ID</p>
            </div>
            <div>
              <p className="font-medium text-blue-800">POST /api/documents</p>
              <p className="text-blue-700">Create a new document</p>
            </div>
            <div>
              <p className="font-medium text-blue-800">PUT /api/documents/[id]</p>
              <p className="text-blue-700">Update an existing document</p>
            </div>
            <div>
              <p className="font-medium text-blue-800">DELETE /api/documents/[id]</p>
              <p className="text-blue-700">Delete a document</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
