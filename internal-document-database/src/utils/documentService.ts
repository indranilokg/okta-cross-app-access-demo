import fs from 'fs';
import path from 'path';
import { Document, DocumentSearchParams, DocumentCreateRequest, DocumentUpdateRequest } from '@/types/document';

const DOCUMENTS_FILE = path.join(process.cwd(), 'src', 'data', 'documents.json');

// Ensure the data directory exists
const ensureDataDirectory = () => {
  const dataDir = path.dirname(DOCUMENTS_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
};

// Read documents from JSON file
export const readDocuments = (): Document[] => {
  try {
    ensureDataDirectory();
    if (!fs.existsSync(DOCUMENTS_FILE)) {
      // Initialize with empty array if file doesn't exist
      fs.writeFileSync(DOCUMENTS_FILE, JSON.stringify({ documents: [] }, null, 2));
      return [];
    }
    
    const fileContent = fs.readFileSync(DOCUMENTS_FILE, 'utf-8');
    const data = JSON.parse(fileContent);
    return data.documents || [];
  } catch (error) {
    console.error('Error reading documents:', error);
    return [];
  }
};

// Write documents to JSON file
export const writeDocuments = (documents: Document[]): boolean => {
  try {
    ensureDataDirectory();
    const data = { documents };
    fs.writeFileSync(DOCUMENTS_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing documents:', error);
    return false;
  }
};

// Generate unique ID
export const generateId = (): string => {
  return `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Search documents
export const searchDocuments = (params: DocumentSearchParams): Document[] => {
  const documents = readDocuments();
  let filtered = documents;

  // Search by query
  if (params.q) {
    const query = params.q.toLowerCase();
    filtered = filtered.filter(doc => 
      doc.title.toLowerCase().includes(query) ||
      doc.content.toLowerCase().includes(query) ||
      doc.tags.some(tag => tag.toLowerCase().includes(query))
    );
  }

  // Filter by category
  if (params.category) {
    filtered = filtered.filter(doc => doc.category === params.category);
  }

  // Filter by author
  if (params.author) {
    filtered = filtered.filter(doc => doc.author.toLowerCase().includes(params.author!.toLowerCase()));
  }

  // Filter by tags
  if (params.tags && params.tags.length > 0) {
    filtered = filtered.filter(doc => 
      params.tags!.some(tag => doc.tags.includes(tag))
    );
  }

  // Apply pagination
  const offset = params.offset || 0;
  const limit = params.limit || filtered.length;
  
  return filtered.slice(offset, offset + limit);
};

// Get document by ID
export const getDocumentById = (id: string): Document | null => {
  const documents = readDocuments();
  return documents.find(doc => doc.id === id) || null;
};

// Create new document
export const createDocument = (docData: DocumentCreateRequest): Document | null => {
  const documents = readDocuments();
  
  const newDocument: Document = {
    id: generateId(),
    title: docData.title,
    content: docData.content,
    category: docData.category,
    author: docData.author,
    createdDate: new Date().toISOString(),
    updatedDate: new Date().toISOString(),
    tags: docData.tags || [],
    version: 1,
    isPublic: docData.isPublic ?? true,
    allowedEditors: docData.allowedEditors || []
  };

  documents.push(newDocument);
  
  if (writeDocuments(documents)) {
    return newDocument;
  }
  
  return null;
};

// Update document
export const updateDocument = (id: string, updates: DocumentUpdateRequest): Document | null => {
  const documents = readDocuments();
  const index = documents.findIndex(doc => doc.id === id);
  
  if (index === -1) {
    return null;
  }

  const updatedDocument: Document = {
    ...documents[index],
    ...updates,
    updatedDate: new Date().toISOString(),
    version: documents[index].version + 1
  };

  documents[index] = updatedDocument;
  
  if (writeDocuments(documents)) {
    return updatedDocument;
  }
  
  return null;
};

// Delete document
export const deleteDocument = (id: string): boolean => {
  const documents = readDocuments();
  const filtered = documents.filter(doc => doc.id !== id);
  
  if (filtered.length === documents.length) {
    return false; // Document not found
  }
  
  return writeDocuments(filtered);
};

// Get all categories
export const getCategories = (): string[] => {
  const documents = readDocuments();
  const categories = new Set(documents.map(doc => doc.category));
  return Array.from(categories).sort();
};

// Get all tags
export const getAllTags = (): string[] => {
  const documents = readDocuments();
  const tags = new Set(documents.flatMap(doc => doc.tags));
  return Array.from(tags).sort();
}; 