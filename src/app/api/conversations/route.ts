import { NextRequest, NextResponse } from 'next/server';
import { createConversation, getUserConversations, deleteConversation } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const { userId, action, conversationId, title } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    const normalizedUserId = userId.trim().toLowerCase();

    switch (action) {
      case 'list':
      default:
        // List all conversations for the user
        return await listConversations(normalizedUserId);
      
      case 'create':
        // Create a new conversation
        return await createConversationHandler(normalizedUserId, title);
      
      case 'delete':
        // Delete a conversation
        return await deleteConversationHandler(normalizedUserId, conversationId);
    }
  } catch (error) {
    console.error('Conversations API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function listConversations(userId: string) {
  try {
    const conversations = await getUserConversations(userId);
    
    return NextResponse.json({
      success: true,
      conversations: conversations
    });
  } catch (error) {
    console.error('Error listing conversations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load conversations' },
      { status: 500 }
    );
  }
}

async function createConversationHandler(userId: string, title?: string) {
  try {
    const conversationId = await createConversation(userId, title);
    
    return NextResponse.json({
      success: true,
      conversationId: conversationId
    });
  } catch (error) {
    console.error('Error creating conversation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create conversation' },
      { status: 500 }
    );
  }
}

async function deleteConversationHandler(userId: string, conversationId: string) {
  try {
    await deleteConversation(userId, conversationId);
    
    return NextResponse.json({
      success: true
    });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete conversation' },
      { status: 500 }
    );
  }
}
