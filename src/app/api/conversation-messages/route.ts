import { NextRequest, NextResponse } from 'next/server';
import { getConversationMessages } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const { conversationId } = await request.json();

    if (!conversationId) {
      return NextResponse.json(
        { success: false, error: 'Conversation ID is required' },
        { status: 400 }
      );
    }

    const messages = await getConversationMessages(conversationId);
    
    return NextResponse.json({
      success: true,
      messages: messages
    });
  } catch (error) {
    console.error('Conversation messages API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
