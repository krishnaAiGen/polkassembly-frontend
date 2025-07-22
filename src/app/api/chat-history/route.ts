import { NextRequest, NextResponse } from 'next/server'
import { initializeDatabase } from '@/lib/database'
import { 
  collection, 
  query, 
  orderBy, 
  getDocs
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Message } from '@/types/chat'

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
    
    // Always fetch fresh data from Firestore (bypass server cache)
    console.log(`Fetching fresh messages from Firestore for user: ${normalizedUsername}`)
    const messages = await fetchMessagesFromFirestore(normalizedUsername)

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

/**
 * Fetch messages directly from Firestore (no cache)
 */
async function fetchMessagesFromFirestore(username: string): Promise<Message[]> {
  try {
    const userChatsRef = collection(db, 'chats', username, 'messages')
    const q = query(userChatsRef, orderBy('timestamp', 'asc'))
    const querySnapshot = await getDocs(q)
    
    const messages: Message[] = []
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      messages.push({
        ...data,
        timestamp: data.timestamp.toMillis(), // Convert Firestore Timestamp to number
      } as Message)
    })
    
    console.log(`Found ${messages.length} messages in Firestore for user: ${username}`)
    return messages
  } catch (error) {
    console.error('Error fetching messages from Firestore:', error)
    return []
  }
} 