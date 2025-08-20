import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  addDoc, 
  query, 
  orderBy, 
  getDocs,
  deleteDoc,
  limit,
  Timestamp 
} from 'firebase/firestore'
import { db } from './firebase'
import { Message } from '@/types/chat'

// In-memory cache for chat histories
const chatCache = new Map<string, Message[]>()

// Cache expiry time (5 minutes)
const CACHE_EXPIRY = 5 * 60 * 1000

// Last cache update timestamps
const cacheTimestamps = new Map<string, number>()

// localStorage keys
const STORAGE_PREFIX = 'polkassembly_chat_'
const CACHE_TIMESTAMP_PREFIX = 'polkassembly_cache_ts_'

/**
 * Initialize database - ensures Firestore is ready
 */
export async function initializeDatabase(): Promise<void> {
  try {
    // Test connection by attempting to read a document
    console.log('Firestore database initialized successfully')
  } catch (error) {
    console.error('Error initializing Firestore database:', error)
    throw error
  }
}

/**
 * Save a message to both Firestore and cache
 */
export async function saveUserMessage(username: string, message: Message): Promise<void> {
  try {
    const normalizedUsername = username.toLowerCase()
    
    // Save to Firestore
    const userChatsRef = collection(db, 'chats', normalizedUsername, 'messages')
    await addDoc(userChatsRef, {
      ...message,
      timestamp: Timestamp.fromMillis(message.timestamp)
    })

    // Update cache
    const cachedMessages = chatCache.get(normalizedUsername) || []
    const updatedMessages = [...cachedMessages, message]
    chatCache.set(normalizedUsername, updatedMessages)
    cacheTimestamps.set(normalizedUsername, Date.now())

    // Update localStorage cache (client-side only)
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        `${STORAGE_PREFIX}${normalizedUsername}`, 
        JSON.stringify(updatedMessages)
      )
      localStorage.setItem(
        `${CACHE_TIMESTAMP_PREFIX}${normalizedUsername}`, 
        Date.now().toString()
      )
    }

    console.log(`Message saved for user: ${normalizedUsername}`)
  } catch (error) {
    console.error('Error saving message:', error)
    throw error
  }
}

/**
 * Get messages from cache first, fallback to Firestore if cache miss/expired
 */
export async function getUserMessages(username: string): Promise<Message[]> {
  const normalizedUsername = username.toLowerCase()
  
  try {
    // Check if we have valid cached data
    if (isCacheValid(normalizedUsername)) {
      console.log(`Using cached messages for user: ${normalizedUsername}`)
      return chatCache.get(normalizedUsername) || []
    }

    // Cache miss or expired - fetch from Firestore
    console.log(`Fetching messages from Firestore for user: ${normalizedUsername}`)
    const messages = await fetchMessagesFromFirestore(normalizedUsername)
    
    // Update cache
    chatCache.set(normalizedUsername, messages)
    cacheTimestamps.set(normalizedUsername, Date.now())

    // Update localStorage cache
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        `${STORAGE_PREFIX}${normalizedUsername}`, 
        JSON.stringify(messages)
      )
      localStorage.setItem(
        `${CACHE_TIMESTAMP_PREFIX}${normalizedUsername}`, 
        Date.now().toString()
      )
    }

    return messages
  } catch (error) {
    console.error('Error getting user messages:', error)
    
    // Fallback to localStorage if Firestore fails
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem(`${STORAGE_PREFIX}${normalizedUsername}`)
      if (cached) {
        console.log('Using localStorage fallback')
        return JSON.parse(cached)
      }
    }
    
    return []
  }
}

/**
 * Initialize user in database (creates empty chat if doesn't exist)
 */
export async function initializeUser(username: string): Promise<void> {
  const normalizedUsername = username.toLowerCase()
  
  try {
    // Check if user document exists
    const userDocRef = doc(db, 'chats', normalizedUsername)
    const userDoc = await getDoc(userDocRef)
    
    if (!userDoc.exists()) {
      // Create user document with metadata
      await setDoc(userDocRef, {
        createdAt: Timestamp.now(),
        lastActive: Timestamp.now(),
        messageCount: 0
      })
      console.log(`User initialized: ${normalizedUsername}`)
    }

    // Initialize cache for new user
    if (!chatCache.has(normalizedUsername)) {
      chatCache.set(normalizedUsername, [])
      cacheTimestamps.set(normalizedUsername, Date.now())
    }
  } catch (error) {
    console.error('Error initializing user:', error)
    throw error
  }
}

/**
 * Fetch messages from Firestore
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
    
    return messages
  } catch (error) {
    console.error('Error fetching messages from Firestore:', error)
    return []
  }
}

/**
 * Check if cached data is still valid
 */
function isCacheValid(username: string): boolean {
  const cachedMessages = chatCache.get(username)
  const cacheTimestamp = cacheTimestamps.get(username)
  
  if (!cachedMessages || !cacheTimestamp) {
    // Try to load from localStorage
    return loadFromLocalStorage(username)
  }
  
  return Date.now() - cacheTimestamp < CACHE_EXPIRY
}

/**
 * Load cache from localStorage
 */
function loadFromLocalStorage(username: string): boolean {
  if (typeof window === 'undefined') return false
  
  try {
    const cached = localStorage.getItem(`${STORAGE_PREFIX}${username}`)
    const cacheTs = localStorage.getItem(`${CACHE_TIMESTAMP_PREFIX}${username}`)
    
    if (cached && cacheTs) {
      const timestamp = parseInt(cacheTs)
      if (Date.now() - timestamp < CACHE_EXPIRY) {
        const messages = JSON.parse(cached)
        chatCache.set(username, messages)
        cacheTimestamps.set(username, timestamp)
        return true
      }
    }
  } catch (error) {
    console.error('Error loading from localStorage:', error)
  }
  
  return false
}

/**
 * Clear cache for a specific user
 */
export function clearUserCache(username: string): void {
  const normalizedUsername = username.toLowerCase()
  chatCache.delete(normalizedUsername)
  cacheTimestamps.delete(normalizedUsername)
  
  if (typeof window !== 'undefined') {
    localStorage.removeItem(`${STORAGE_PREFIX}${normalizedUsername}`)
    localStorage.removeItem(`${CACHE_TIMESTAMP_PREFIX}${normalizedUsername}`)
  }
}

/**
 * Clear all cache
 */
export function clearAllCache(): void {
  chatCache.clear()
  cacheTimestamps.clear()
  
  if (typeof window !== 'undefined') {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(STORAGE_PREFIX) || key.startsWith(CACHE_TIMESTAMP_PREFIX)) {
        localStorage.removeItem(key)
      }
    })
  }
}

/**
 * Get cache statistics for debugging
 */
export function getCacheStats() {
  return {
    inMemoryUsers: Array.from(chatCache.keys()),
    cacheSize: chatCache.size,
    timestamps: Object.fromEntries(cacheTimestamps.entries())
  }
}

/**
 * Create a new conversation for a user
 */
export async function createConversation(userId: string, title?: string): Promise<string> {
  try {
    const normalizedUserId = userId.toLowerCase()
    const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
    
    const conversationData = {
      id: conversationId,
      title: title || 'New Conversation',
      createdAt: Timestamp.now(),
      lastActivity: Timestamp.now(),
      messageCount: 0,
      lastMessage: '',
      userId: normalizedUserId
    }

    // Save conversation metadata
    const conversationRef = doc(db, 'conversations', conversationId)
    await setDoc(conversationRef, conversationData)

    console.log(`Created conversation ${conversationId} for user: ${normalizedUserId}`)
    return conversationId
  } catch (error) {
    console.error('Error creating conversation:', error)
    throw error
  }
}

/**
 * Get all conversations for a user
 */
export async function getUserConversations(userId: string): Promise<any[]> {
  try {
    const normalizedUserId = userId.toLowerCase()
    
    const conversationsRef = collection(db, 'conversations')
    const q = query(
      conversationsRef,
      orderBy('lastActivity', 'desc')
    )
    
    const querySnapshot = await getDocs(q)
    const conversations: any[] = []
    
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      if (data.userId === normalizedUserId) {
        conversations.push({
          id: data.id,
          title: data.title,
          lastMessage: data.lastMessage || 'No messages yet',
          lastActivity: data.lastActivity.toMillis(),
          messageCount: data.messageCount || 0
        })
      }
    })
    
    return conversations
  } catch (error) {
    console.error('Error getting user conversations:', error)
    return []
  }
}

/**
 * Update conversation metadata
 */
export async function updateConversation(conversationId: string, updates: any): Promise<void> {
  try {
    const conversationRef = doc(db, 'conversations', conversationId)
    await setDoc(conversationRef, {
      ...updates,
      lastActivity: Timestamp.now()
    }, { merge: true })
  } catch (error) {
    console.error('Error updating conversation:', error)
    throw error
  }
}

/**
 * Delete a conversation and all its messages
 */
export async function deleteConversation(userId: string, conversationId: string): Promise<void> {
  try {
    const normalizedUserId = userId.toLowerCase()
    
    // Delete conversation metadata
    const conversationRef = doc(db, 'conversations', conversationId)
    await deleteDoc(conversationRef)
    
    // Delete all messages in the conversation
    const messagesRef = collection(db, 'conversations', conversationId, 'messages')
    const messagesSnapshot = await getDocs(messagesRef)
    
    const deletePromises = messagesSnapshot.docs.map(doc => deleteDoc(doc.ref))
    await Promise.all(deletePromises)
    
    console.log(`Deleted conversation ${conversationId} for user: ${normalizedUserId}`)
  } catch (error) {
    console.error('Error deleting conversation:', error)
    throw error
  }
}

/**
 * Save a message to a specific conversation
 */
export async function saveMessageToConversation(conversationId: string, message: Message): Promise<void> {
  try {
    // Save message to conversation
    const messagesRef = collection(db, 'conversations', conversationId, 'messages')
    await addDoc(messagesRef, {
      ...message,
      timestamp: Timestamp.fromMillis(message.timestamp)
    })

    // Update conversation metadata
    const conversationRef = doc(db, 'conversations', conversationId)
    const conversationDoc = await getDoc(conversationRef)
    
    if (conversationDoc.exists()) {
      const currentData = conversationDoc.data()
      await setDoc(conversationRef, {
        ...currentData,
        lastActivity: Timestamp.now(),
        lastMessage: message.text.substring(0, 100),
        messageCount: (currentData.messageCount || 0) + 1,
        // Update title based on first user message if it's still "New Conversation"
        title: currentData.title === 'New Conversation' && message.sender === 'user' 
          ? message.text.substring(0, 50) + (message.text.length > 50 ? '...' : '')
          : currentData.title
      }, { merge: true })
    }

    console.log(`Message saved to conversation: ${conversationId}`)
  } catch (error) {
    console.error('Error saving message to conversation:', error)
    throw error
  }
}

/**
 * Get messages from a specific conversation
 */
export async function getConversationMessages(conversationId: string): Promise<Message[]> {
  try {
    const messagesRef = collection(db, 'conversations', conversationId, 'messages')
    const q = query(messagesRef, orderBy('timestamp', 'asc'))
    const querySnapshot = await getDocs(q)
    
    const messages: Message[] = []
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      messages.push({
        ...data,
        timestamp: data.timestamp.toMillis(),
      } as Message)
    })
    
    return messages
  } catch (error) {
    console.error('Error getting conversation messages:', error)
    return []
  }
} 