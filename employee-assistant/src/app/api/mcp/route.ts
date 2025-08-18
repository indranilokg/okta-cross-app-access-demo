// src/app/api/mcp/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { mcpClient } from '@/utils/mcpClient';

export async function POST(request: NextRequest) {
  try {
    const { tool, arguments: toolArgs } = await request.json();

    if (!tool) {
      return NextResponse.json(
        { error: 'Tool name is required' },
        { status: 400 }
      );
    }

    console.log(`🔧 MCP API: Calling tool ${tool}`, toolArgs);

    const result = await mcpClient.callTool(tool, toolArgs);
    
    console.log(`✅ MCP API: Tool ${tool} completed successfully`);
    return NextResponse.json(result);

  } catch (error) {
    console.error('❌ MCP API error:', error);
    return NextResponse.json(
      { 
        error: 'MCP tool call failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET endpoint to list available tools and check connection
export async function GET() {
  try {
    // Check connection first
    const isConnected = await mcpClient.checkConnection();
    
    if (!isConnected) {
      return NextResponse.json(
        { 
          error: 'MCP server not available',
          connected: false,
          message: `Make sure the MCP server is running at ${process.env.MCP_SERVER_URL || 'http://localhost:3002'}`
        },
        { status: 503 }
      );
    }

    // Get available tools
    const tools = await mcpClient.getAvailableTools();
    
    return NextResponse.json({
      connected: true,
      server: process.env.MCP_SERVER_URL || 'http://localhost:3002',
      ...tools
    });

  } catch (error) {
    console.error('❌ MCP connection check failed:', error);
    return NextResponse.json(
      { 
        error: 'Failed to connect to MCP server',
        connected: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 