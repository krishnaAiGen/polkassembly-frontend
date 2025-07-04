'use client'

import { useState, useEffect } from 'react'
import LoginForm from '@/components/LoginForm'
import ChatInterface from '@/components/ChatInterface'
import { ChatData, Message } from '@/types/chat'
import { ChatCacheManager } from '@/lib/chatCache'
import CacheDebugPanel from '@/components/CacheDebugPanel'

export default function Home() {
  const [currentUser, setCurrentUser] = useState<string | null>(null)
  const [chatData, setChatData] = useState<ChatData>({})
  const [userMessages, setUserMessages] = useState<Message[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)

  useEffect(() => {
    if (currentUser) {
      loadUserChatHistory(currentUser)
    }
  }, [currentUser])

  const loadUserChatHistory = async (username: string) => {
    setIsLoadingHistory(true)
    try {
      // Use cache manager to get messages (checks cache first, then API)
      const messages = await ChatCacheManager.getCachedMessages(username)
      setUserMessages(messages)
      console.log(`Loaded ${messages.length} messages for ${username}`)
    } catch (error) {
      console.error('Error loading chat history:', error)
      setUserMessages([])
    } finally {
      setIsLoadingHistory(false)
    }
  }

  const handleLogin = (username: string) => {
    setCurrentUser(username)
  }

  const handleLogout = () => {
    setCurrentUser(null)
    setUserMessages([])
  }

  const handleNewMessage = (message: Message) => {
    // Update local state
    setUserMessages(prev => [...prev, message])
    
    // Update cache with new message
    if (currentUser) {
      ChatCacheManager.addMessageToCache(currentUser, message)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-pink-50">
      <div className="container mx-auto px-4 py-8">
        {!currentUser ? (
          <LoginForm onLogin={handleLogin} />
        ) : (
          <>
            {isLoadingHistory ? (
              <div className="max-w-4xl mx-auto h-screen flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading your chat history...</p>
                </div>
              </div>
            ) : (
              <ChatInterface
                currentUser={currentUser}
                messages={userMessages}
                onNewMessage={handleNewMessage}
                onLogout={handleLogout}
              />
            )}
          </>
        )}
      </div>
      
      {/* Background decorative elements */}
      <div className="fixed top-20 right-20 w-4 h-4 bg-pink-500 rotate-45 opacity-20"></div>
      <div className="fixed bottom-40 left-32 w-6 h-6 bg-primary-500 rotate-45 opacity-15"></div>
      <div className="fixed top-1/3 right-1/4 w-3 h-3 bg-primary-700 rotate-45 opacity-25"></div>
      <div className="fixed bottom-20 right-1/3 w-5 h-5 bg-pink-600 rotate-45 opacity-10"></div>
      
      {/* Cache Debug Panel (development only) */}
      <CacheDebugPanel currentUser={currentUser} />
    </main>
  )
} 