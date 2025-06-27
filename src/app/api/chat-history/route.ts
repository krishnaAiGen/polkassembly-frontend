import { NextRequest, NextResponse } from 'next/server'
import { initializeDatabase, getUserMessages } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    // Ensure database exists
    await initializeDatabase()
    
    const { searchParams } = new URL(request.url)
    const username = searchParams.get('user')
    
    if (!username) {
      return NextResponse.json(
        { success: false, error: 'Username is required' },
        { status: 400 }
      )
    }

    // Normalize username to lowercase
    const normalizedUsername = username.trim().toLowerCase()
    const messages = await getUserMessages(normalizedUsername)

    return NextResponse.json({ 
      success: true, 
      messages 
    })
  } catch (error) {
    console.error('Chat history error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch chat history' },
      { status: 500 }
    )
  }
} 