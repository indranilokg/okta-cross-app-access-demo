# Atko Internal Document Database

A simple API-based document management system for Atko Corporation's internal documents. This system provides REST APIs for reading and editing documents stored in a JSON file, with no authentication required initially.

## 📋 Prerequisites

- Node.js 18+ 
- npm

## 🛠️ Installation

1. **Clone and navigate to the project:**
   ```bash
   cd internal-document-database
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Access the application:**
   - Web Interface: http://localhost:3001
   - API Base URL: http://localhost:3001/api

## 📚 API Endpoints

### Documents

#### GET /api/documents
Get all documents with optional filtering.

**Query Parameters:**
- `category` (optional): Filter by category
- `author` (optional): Filter by author
- `limit` (optional): Number of results to return
- `offset` (optional): Number of results to skip

**Example:**
```bash
curl "http://localhost:3001/api/documents?category=HR&limit=5"
```

#### GET /api/documents/search
Search documents by various criteria.

**Query Parameters:**
- `q` (optional): Search query for title, content, or tags
- `category` (optional): Filter by category
- `author` (optional): Filter by author
- `tags` (optional): Comma-separated list of tags
- `limit` (optional): Number of results to return
- `offset` (optional): Number of results to skip

**Example:**
```bash
curl "http://localhost:3001/api/documents/search?q=benefits&category=HR"
```

#### GET /api/documents/[id]
Get a specific document by ID.

**Example:**
```bash
curl "http://localhost:3001/api/documents/emp-handbook-2024"
```

#### POST /api/documents
Create a new document.

**Request Body:**
```json
{
  "title": "Document Title",
  "content": "Document content...",
  "category": "HR",
  "author": "Author Name",
  "tags": ["tag1", "tag2"],
  "isPublic": true,
  "allowedEditors": ["editor1", "editor2"]
}
```

**Example:**
```bash
curl -X POST "http://localhost:3001/api/documents" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "New Policy Document",
    "content": "This is the content of the new policy...",
    "category": "HR",
    "author": "HR Department"
  }'
```

#### PUT /api/documents/[id]
Update an existing document.

**Request Body:**
```json
{
  "title": "Updated Title",
  "content": "Updated content...",
  "category": "IT",
  "tags": ["updated", "tags"]
}
```

**Example:**
```bash
curl -X PUT "http://localhost:3001/api/documents/emp-handbook-2024" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Employee Handbook 2024",
    "content": "Updated handbook content..."
  }'
```

#### DELETE /api/documents/[id]
Delete a document.

**Example:**
```bash
curl -X DELETE "http://localhost:3001/api/documents/emp-handbook-2024"
```

### Categories

#### GET /api/categories
Get all available document categories.

**Example:**
```bash
curl "http://localhost:3001/api/categories"
```

## 📄 Document Schema

```typescript
interface Document {
  id: string;                    // Unique document identifier
  title: string;                 // Document title
  content: string;               // Document content
  category: 'HR' | 'IT' | 'Company' | 'Department' | 'Finance' | 'Legal';
  author: string;                // Document author
  createdDate: string;           // ISO date string
  updatedDate: string;           // ISO date string
  tags: string[];                // Array of tags
  version: number;               // Version number
  isPublic: boolean;             // Public/private flag
  allowedEditors?: string[];     // Array of allowed editors
}
```

## 🎯 Sample Documents

The system comes pre-loaded with sample Atko Corporation documents:

- **Employee Handbook 2024** (HR)
- **Employee Benefits Guide 2024** (HR)
- **Remote Work Policy** (HR)
- **IT Security Policy** (IT)
- **Software Installation Guide** (IT)
- **Expense Reimbursement Policy** (Finance)
- **Engineering Best Practices** (Department)
- **Atko Mission and Values** (Company)


## 📝 License

This project is part of the Atko Cross-App Access demo and is for demonstration purposes only.
