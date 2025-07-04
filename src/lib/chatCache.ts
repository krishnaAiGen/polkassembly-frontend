'use client'

import { Message } from '@/types/chat'

// In-memory cache for chat histories (client-side)
const clientChatCache = new Map<string, Message[]>()

// Cache expiry time (5 minutes)
const CACHE_EXPIRY = 5 * 60 * 1000

// Last cache update timestamps
const clientCacheTimestamps = new Map<string, number>()

// localStorage keys
const STORAGE_PREFIX = 'polkassembly_chat_'
const CACHE_TIMESTAMP_PREFIX = 'polkassembly_cache_ts_'

/**
 * Client-side cache manager for chat messages
 */
export class ChatCacheManager {
  
  /**
   * Get messages from cache first, then from API if needed
   */
  static async getCachedMessages(username: string): Promise<Message[]> {
    const normalizedUsername = username.toLowerCase()
    
    // Check if we have valid cached data
    if (this.isCacheValid(normalizedUsername)) {
      console.log(`Using cached messages for user: ${normalizedUsername}`)
      return clientChatCache.get(normalizedUsername) || []
    }

    // Try to load from localStorage first
    if (this.loadFromLocalStorage(normalizedUsername)) {
      console.log(`Loaded messages from localStorage for user: ${normalizedUsername}`)
      return clientChatCache.get(normalizedUsername) || []
    }

    // Cache miss - need to fetch from API
    console.log(`Cache miss for user: ${normalizedUsername}, fetching from API`)
    try {
      const response = await fetch(`/api/chat-history?user=${normalizedUsername}`)
      if (response.ok) {
        const data = await response.json()
        const messages = data.messages || []
        
        // Update cache
        this.setCachedMessages(normalizedUsername, messages)
        return messages
      }
    } catch (error) {
      console.error('Error fetching from API:', error)
    }

    return []
  }

  /**
   * Set messages in cache and localStorage
   */
  static setCachedMessages(username: string, messages: Message[]): void {
    const normalizedUsername = username.toLowerCase()
    
    // Update in-memory cache
    clientChatCache.set(normalizedUsername, messages)
    clientCacheTimestamps.set(normalizedUsername, Date.now())

    // Update localStorage
    try {
      localStorage.setItem(
        `${STORAGE_PREFIX}${normalizedUsername}`, 
        JSON.stringify(messages)
      )
      localStorage.setItem(
        `${CACHE_TIMESTAMP_PREFIX}${normalizedUsername}`, 
        Date.now().toString()
      )
    } catch (error) {
      console.error('Error saving to localStorage:', error)
    }
  }

  /**
   * Add a new message to cache
   */
  static addMessageToCache(username: string, message: Message): void {
    const normalizedUsername = username.toLowerCase()
    const currentMessages = clientChatCache.get(normalizedUsername) || []
    const updatedMessages = [...currentMessages, message]
    
    this.setCachedMessages(normalizedUsername, updatedMessages)
  }

  /**
   * Check if cached data is still valid
   */
  static isCacheValid(username: string): boolean {
    const cachedMessages = clientChatCache.get(username)
    const cacheTimestamp = clientCacheTimestamps.get(username)
    
    if (!cachedMessages || !cacheTimestamp) {
      return false
    }
    
    return Date.now() - cacheTimestamp < CACHE_EXPIRY
  }

  /**
   * Load cache from localStorage
   */
  static loadFromLocalStorage(username: string): boolean {
    try {
      const cached = localStorage.getItem(`${STORAGE_PREFIX}${username}`)
      const cacheTs = localStorage.getItem(`${CACHE_TIMESTAMP_PREFIX}${username}`)
      
      if (cached && cacheTs) {
        const timestamp = parseInt(cacheTs)
        if (Date.now() - timestamp < CACHE_EXPIRY) {
          const messages = JSON.parse(cached)
          clientChatCache.set(username, messages)
          clientCacheTimestamps.set(username, timestamp)
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
  static clearUserCache(username: string): void {
    const normalizedUsername = username.toLowerCase()
    clientChatCache.delete(normalizedUsername)
    clientCacheTimestamps.delete(normalizedUsername)
    
    try {
      localStorage.removeItem(`${STORAGE_PREFIX}${normalizedUsername}`)
      localStorage.removeItem(`${CACHE_TIMESTAMP_PREFIX}${normalizedUsername}`)
    } catch (error) {
      console.error('Error clearing localStorage:', error)
    }
  }

  /**
   * Clear all cache
   */
  static clearAllCache(): void {
    clientChatCache.clear()
    clientCacheTimestamps.clear()
    
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(STORAGE_PREFIX) || key.startsWith(CACHE_TIMESTAMP_PREFIX)) {
          localStorage.removeItem(key)
        }
      })
    } catch (error) {
      console.error('Error clearing localStorage:', error)
    }
  }

  /**
   * Get cache statistics for debugging
   */
  static getCacheStats() {
    return {
      inMemoryUsers: Array.from(clientChatCache.keys()),
      cacheSize: clientChatCache.size,
      timestamps: Object.fromEntries(clientCacheTimestamps.entries()),
      localStorageKeys: Object.keys(localStorage).filter(key => 
        key.startsWith(STORAGE_PREFIX) || key.startsWith(CACHE_TIMESTAMP_PREFIX)
      )
    }
  }

  /**
   * Force refresh cache from API
   */
  static async refreshCache(username: string): Promise<Message[]> {
    const normalizedUsername = username.toLowerCase()
    this.clearUserCache(normalizedUsername)
    return this.getCachedMessages(normalizedUsername)
  }
} 