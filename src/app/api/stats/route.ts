import { NextResponse } from 'next/server'
import { initializeDatabase } from '@/lib/database'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export async function GET() {
  try {
    await initializeDatabase()
    
    // Get all users (collections under 'chats')
    const chatsRef = collection(db, 'chats')
    const userSnapshots = await getDocs(chatsRef)
    
    let totalConversations = 0
    let totalUsers = 0
    
    // Count messages for each user
    for (const userDoc of userSnapshots.docs) {
      totalUsers++
      const messagesRef = collection(db, 'chats', userDoc.id, 'messages')
      const messagesSnapshot = await getDocs(messagesRef)
      
      // Count conversations (pairs of user + AI messages)
      const messageCount = messagesSnapshot.size
      const userConversations = Math.ceil(messageCount / 2)
      totalConversations += userConversations
    }
    
    return NextResponse.json({
      success: true,
      totalConversations,
      totalUsers
    })
    
  } catch (error) {
    console.error('Stats API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
} 