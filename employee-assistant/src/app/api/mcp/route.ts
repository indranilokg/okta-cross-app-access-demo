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

 