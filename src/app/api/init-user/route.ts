import { NextRequest, NextResponse } from 'next/server'
import { initializeDatabase, initializeUser } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    // Ensure database exists
    await initializeDatabase()
    
    const { username } = await request.json()
    
    if (!username || typeof username !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Username is required' },
        { status: 400 }
      )
    }

    // Normalize username to lowercase
    const normalizedUsername = username.trim().toLowerCase()

    await initializeUser(normalizedUsername)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Init user error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to initialize user' },
      { status: 500 }
    )
  }
} 