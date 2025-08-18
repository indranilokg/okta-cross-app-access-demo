import OpenAI from 'openai';
import { mcpClient } from '@/utils/mcpClient';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  // Get user session for authentication
  const session = await getServerSession(authOptions);
  
  if (!session || !session.idToken) {
    return Response.json(
      { error: 'Authentication required' }, 
      { status: 401 }
    );
  }

  const { messages } = await req.json();
  
  // Get the last user message
  const lastMessage = messages[messages.length - 1];
  const userQuery = lastMessage.content;

  // Get MCP access token using Okta ID token
  let idJagToken: string | null = null;
  try {
    const tokenResult = await mcpClient.getAccessToken(session.idToken as string);
    idJagToken = tokenResult.idJagToken;
    console.log('🔐 MCP authentication successful for user:', session.user?.email);
  } catch (error) {
    console.error('❌ MCP authentication failed:', error);
    return Response.json(
      { error: 'Failed to authenticate with document server' }, 
      { status: 503 }
    );
  }

  // Determine if we should search for documents
  const shouldSearchDocs = shouldSearchDocuments(userQuery);
  
  let contextMessages = [...messages];
  let documentContext = '';
  
  if (shouldSearchDocs) {
    try {
      console.log('🔍 Searching documents for query:', userQuery);
      
      // Search for relevant documents
      const searchResult = await mcpClient.searchDocuments({
        query: extractSearchQuery(userQuery),
        limit: 3
      });

      if (searchResult.result?.success && searchResult.result.documents?.length > 0) {
        console.log(`📄 Found ${searchResult.result.documents.length} relevant documents`);
        
        // Add document context to the conversation
        documentContext = formatDocumentContext(searchResult.result.documents);
        contextMessages.splice(-1, 0, {
          role: 'system',
          content: `Relevant company documents found:\n\n${documentContext}\n\nUse this information to help answer the user's question. Reference the specific documents when providing information.`
        });
      } else {
        console.log('📄 No relevant documents found');
      }
    } catch (error) {
      console.error('❌ Document search failed:', error);
      // Continue without document context
    }
  }

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: `You are the Atko Employee Assistant, a helpful AI assistant for Atko Corporation employees. You have access to company documents and can help with:
        - Atko company policies and procedures
        - HR questions and employee benefits
        - IT support and technical issues
        - General workplace inquiries
        - Document search and creation

        When users ask about company policies, benefits, or procedures, you can search through our document database and provide specific information from company documents. If asked to create or save information, let them know you can help create new documents.

        Be helpful, professional, and concise. Always refer to the company as "Atko" or "Atko Corporation". When referencing document information, mention the document name for credibility.`,
      },
      ...contextMessages,
    ],
  });

  const assistantResponse = response.choices[0].message.content || '';
  
  // Check if user wants to create a document
  const documentCreationNote = await handleDocumentCreation(userQuery, assistantResponse);

  return Response.json({
    role: 'assistant',
    content: assistantResponse + documentCreationNote,
    idJagToken: idJagToken
  });
}

// Helper functions
function shouldSearchDocuments(query: string): boolean {
  const searchKeywords = [
    'policy', 'policies', 'handbook', 'benefits', 'procedure', 'guidelines',
    'document', 'documents', 'rules', 'regulations', 'company', 'atko',
    'hr', 'it', 'finance', 'legal', 'department', 'remote work', 'vacation',
    'sick leave', 'health insurance', 'dental', 'vision', 'retirement',
    '401k', 'pto', 'time off', 'overtime', 'salary', 'bonus', 'stock options'
  ];
  
  return searchKeywords.some(keyword => 
    query.toLowerCase().includes(keyword.toLowerCase())
  );
}

function extractSearchQuery(userQuery: string): string {
  // Convert to lowercase for processing
  const query = userQuery.toLowerCase();
  
  // Remove common question words and phrases
  let cleanQuery = query
    .replace(/^(what|how|when|where|why|who|which|can you|could you|please|help me|i need|i want|i'm looking for)\s+/gi, '')
    .replace(/\b(is|are|do|does|did|will|would|could|should|might|may|the|a|an|and|or|but|for|to|of|in|on|at|by|with|from)\b/gi, ' ')
    .replace(/\b(tell me about|find|search|look up|show me|explain|give me|provide|get|fetch)\b/gi, '')
    .replace(/\b(information about|details about|info about|data about)\b/gi, '')
    .replace(/\b(do we have|are there|available|existing)\b/gi, '')
    .replace(/\?/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  // Extract key business terms and concepts
  const keyTerms: string[] = [];
  
  // Look for specific document types and categories
  const documentTypes = ['policy', 'policies', 'handbook', 'manual', 'guide', 'guidelines', 'procedure', 'procedures', 'document', 'documents'];
  const departments = ['hr', 'human resources', 'it', 'engineering', 'finance', 'legal', 'security', 'marketing', 'sales'];
  const topics = ['benefits', 'vacation', 'remote work', 'pto', 'time off', 'health', 'dental', 'vision', 'retirement', '401k', 'sick leave', 'bonus', 'salary', 'stock options', 'expense', 'reimbursement', 'onboarding', 'training'];
  
  // Extract department mentions
  departments.forEach(dept => {
    if (query.includes(dept)) {
      keyTerms.push(dept);
    }
  });
  
  // Extract topic mentions
  topics.forEach(topic => {
    if (query.includes(topic)) {
      keyTerms.push(topic);
    }
  });
  
  // Extract document type mentions
  documentTypes.forEach(type => {
    if (query.includes(type)) {
      keyTerms.push(type);
    }
  });
  
  // If we found specific terms, use those
  if (keyTerms.length > 0) {
    return keyTerms.join(' ');
  }
  
  // Otherwise, return the cleaned query but limit to key words
  const words = cleanQuery.split(' ').filter(word => 
    word.length > 2 && 
    !['about', 'have', 'there', 'some', 'any', 'all', 'many', 'much', 'more', 'most', 'best', 'good', 'new', 'old'].includes(word)
  );
  
  // Return first 3-4 meaningful words
  return words.slice(0, 4).join(' ');
}

function formatDocumentContext(documents: any[]): string {
  return documents.map((doc, index) => 
    `**Document ${index + 1}: ${doc.title}** (${doc.category})\n${doc.content}\n\n---`
  ).join('\n');
}

async function handleDocumentCreation(userMessage: string, assistantResponse: string): Promise<string> {
  // Only create documents when explicitly requested - be more strict
  const explicitCreateKeywords = [
    'create document', 'create a document', 'make a document', 'new document',
    'save this as document', 'document this', 'save as document',
    'create policy', 'write policy', 'document about', 'save this'
  ];
  
  // Check if it's actually an explicit creation request
  const isExplicitCreationRequest = explicitCreateKeywords.some(keyword => 
    userMessage.toLowerCase().includes(keyword)
  );
  
  // Don't auto-create for search/information requests
  const isSearchQuery = userMessage.toLowerCase().includes('tell me') || 
                       userMessage.toLowerCase().includes('what') ||
                       userMessage.toLowerCase().includes('show me') ||
                       userMessage.toLowerCase().includes('find') ||
                       userMessage.toLowerCase().includes('search') ||
                       userMessage.toLowerCase().includes('look for') ||
                       userMessage.toLowerCase().includes('about the');
  
  // Only create if explicitly requested AND not a search query
  if (isExplicitCreationRequest && !isSearchQuery) {
    try {
      console.log('📝 User explicitly requested document creation');
      
      // Extract title from user message
      const title = extractDocumentTitle(userMessage, assistantResponse);
      
      await mcpClient.createDocument({
        title,
        content: `User Request: ${userMessage}\n\nAssistant Response: ${assistantResponse}`,
        category: 'Company',
        author: 'Employee Assistant',
        tags: ['ai-generated', 'employee-request'],
        isPublic: true
      });
      
      console.log(`✅ Document "${title}" created successfully`);
      return `\n\n📄 *Document "${title}" has been created and saved to the company database.*`;
    } catch (error) {
      console.error('❌ Document creation failed:', error);
      return '\n\n❌ *Failed to save document to database.*';
    }
  }
  
  return '';
}

function extractDocumentTitle(userMessage: string, assistantResponse?: string): string {
  // Look for explicit title patterns in user message
  let titleMatch = userMessage.match(/create (?:a )?document (?:about |on |for )?(.+?)(?:\?|$|\.)/i);
  if (titleMatch) {
    return titleMatch[1].trim();
  }
  
  // Look for "about X" patterns
  titleMatch = userMessage.match(/(?:about|on|for|regarding) (.+?)(?:\?|$|\.)/i);
  if (titleMatch) {
    return titleMatch[1].trim();
  }
  
  // Extract from assistant response if it contains structured content
  if (assistantResponse) {
    const responseMatch = assistantResponse.match(/##\s*(.+?)(?:\n|$)/);
    if (responseMatch) {
      return responseMatch[1].trim();
    }
  }
  
  // Default title with better naming
  const now = new Date();
  return `Employee Request ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
} 