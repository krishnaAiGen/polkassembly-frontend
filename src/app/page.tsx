'use client'

import { useState, useEffect } from 'react'
import LoginForm from '@/components/LoginForm'
import ChatInterface from '@/components/ChatInterface'
import { ChatData, Message } from '@/types/chat'

export default function Home() {
  const [currentUser, setCurrentUser] = useState<string | null>(null)
  const [chatData, setChatData] = useState<ChatData>({})
  const [userMessages, setUserMessages] = useState<Message[]>([])

  useEffect(() => {
    if (currentUser) {
      loadUserChatHistory(currentUser)
    }
  }, [currentUser])

  const loadUserChatHistory = async (username: string) => {
    try {
      const response = await fetch(`/api/chat-history?user=${username}`)
      if (response.ok) {
        const data = await response.json()
        setUserMessages(data.messages || [])
      }
    } catch (error) {
      console.error('Error loading chat history:', error)
      setUserMessages([])
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
    setUserMessages(prev => [...prev, message])
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-pink-50">
      <div className="container mx-auto px-4 py-8">
        {!currentUser ? (
          <LoginForm onLogin={handleLogin} />
        ) : (
          <ChatInterface
            currentUser={currentUser}
            messages={userMessages}
            onNewMessage={handleNewMessage}
            onLogout={handleLogout}
          />
        )}
      </div>
      
      {/* Background decorative elements */}
      <div className="fixed top-20 right-20 w-4 h-4 bg-pink-500 rotate-45 opacity-20"></div>
      <div className="fixed bottom-40 left-32 w-6 h-6 bg-primary-500 rotate-45 opacity-15"></div>
      <div className="fixed top-1/3 right-1/4 w-3 h-3 bg-primary-700 rotate-45 opacity-25"></div>
      <div className="fixed bottom-20 right-1/3 w-5 h-5 bg-pink-600 rotate-45 opacity-10"></div>
    </main>
  )
} 