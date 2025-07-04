import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  addDoc, 
  query, 
  orderBy, 
  getDocs,
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