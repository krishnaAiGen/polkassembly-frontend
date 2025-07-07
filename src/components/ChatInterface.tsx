'use client'

import { useState, useRef, useEffect } from 'react'
import { Message, Source } from '@/types/chat'
import MessageBubble from './MessageBubble'
import TypingIndicator from './TypingIndicator'
import ThinkingAnimation from './ThinkingAnimation'

interface ChatInterfaceProps {
  currentUser: string
  messages: Message[]
  onNewMessage: (message: Message) => void
  onLogout: () => void
}

export default function ChatInterface({ currentUser, messages, onNewMessage, onLogout }: ChatInterfaceProps) {
  const [inputText, setInputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [streamingMessage, setStreamingMessage] = useState<Message | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Create display name from normalized username
  const displayName = currentUser.charAt(0).toUpperCase() + currentUser.slice(1)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, streamingMessage])

  const generateMessageId = () => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9)
  }

  const handleFollowUpClick = (question: string) => {
    // Set the input text and automatically submit the follow-up question
    setInputText(question)
    
    // Small delay to ensure input is set, then submit
    setTimeout(() => {
      submitMessage(question)
    }, 100)
  }

  const submitMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return

    const userMessage: Message = {
      id: generateMessageId(),
      text: messageText.trim(),
      sender: 'user',
      timestamp: Date.now()
    }

    // Add user message
    onNewMessage(userMessage)
    setInputText('')
    
    console.log('Setting isLoading to true - thinking animation should show now')
    setIsLoading(true)

    // Don't set streaming message immediately - let thinking animation show first
    let aiMessage: Message | null = null

    try {
      console.log('Starting fetch request to backend...')
      // Send message to API with normalized username
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.text,
          username: currentUser, // currentUser is already normalized
          history: messages
        })
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      console.log('Response received, starting to read stream...')
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let accumulatedText = ''
      let sources: Source[] = []
      let followUpQuestions: string[] = []

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split('\n').filter(line => line.trim())

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6)
              if (data === '[DONE]') {
                // Streaming complete
                if (aiMessage) {
                  const finalMessage: Message = {
                    ...aiMessage,
                    text: accumulatedText,
                    isStreaming: false,
                    sources: sources.length > 0 ? sources : undefined,
                    followUpQuestions: followUpQuestions.length > 0 ? followUpQuestions : undefined
                  }
                  onNewMessage(finalMessage)
                  setStreamingMessage(null)
                }
                return
              }

              try {
                const parsed = JSON.parse(data)
                if (parsed.content) {
                  // Create AI message on first content if not exists
                  if (!aiMessage) {
                    console.log('First content received - creating streaming message (thinking animation should disappear)')
                    aiMessage = {
                      id: generateMessageId(),
                      text: '',
                      sender: 'ai',
                      timestamp: Date.now(),
                      isStreaming: true
                    }
                  }
                  
                  accumulatedText += parsed.content
                  setStreamingMessage({
                    ...aiMessage,
                    text: accumulatedText
                  })
                } else if (parsed.sources) {
                  sources = parsed.sources
                  if (aiMessage) {
                    setStreamingMessage({
                      ...aiMessage,
                      text: accumulatedText,
                      sources: sources
                    })
                  }
                } else if (parsed.followUpQuestions) {
                  followUpQuestions = parsed.followUpQuestions
                  if (aiMessage) {
                    setStreamingMessage({
                      ...aiMessage,
                      text: accumulatedText,
                      sources: sources,
                      followUpQuestions: followUpQuestions
                    })
                  }
                }
              } catch (e) {
                console.error('Error parsing streaming data:', e)
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage: Message = {
        id: generateMessageId(),
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'ai',
        timestamp: Date.now()
      }
      onNewMessage(errorMessage)
      setStreamingMessage(null)
    } finally {
      console.log('Setting isLoading to false')
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await submitMessage(inputText)
  }

  return (
    <div className="max-w-4xl mx-auto h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm rounded-t-2xl shadow-lg p-4 border-b border-primary-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-pink-500 rounded-full flex items-center justify-center">
              <div className="w-5 h-5 bg-white rounded-full"></div>
            </div>
            <div>
              <h2 className="font-semibold text-gray-800">Polkassembly Chat</h2>
              <p className="text-sm text-gray-600">Welcome, {displayName}!</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="text-gray-500 hover:text-red-500 transition-colors px-3 py-1 rounded-lg hover:bg-red-50"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 bg-white/60 backdrop-blur-sm p-4 overflow-y-auto chat-scroll">
        <div className="space-y-4">
          {messages.map((message) => (
            <MessageBubble 
              key={message.id} 
              message={message} 
              onFollowUpClick={handleFollowUpClick}
            />
          ))}
          {isLoading && !streamingMessage && (() => {
            console.log('Rendering ThinkingAnimation - isLoading:', isLoading, 'streamingMessage:', streamingMessage)
            return <ThinkingAnimation isVisible={true} />
          })()}
          {streamingMessage && (() => {
            console.log('Rendering streaming message:', streamingMessage.text.substring(0, 20) + '...')
            return (
              <MessageBubble 
                message={streamingMessage} 
                isStreaming={true} 
                onFollowUpClick={handleFollowUpClick}
              />
            )
          })()}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="bg-white/80 backdrop-blur-sm rounded-b-2xl shadow-lg p-4 border-t border-primary-200">
        <form onSubmit={handleSubmit} className="flex space-x-3">
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all duration-200 text-gray-900 placeholder-gray-500 bg-white"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="bg-gradient-to-r from-primary-600 to-pink-600 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:from-primary-700 hover:to-pink-700 transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-lg"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              'Send'
            )}
          </button>
        </form>
      </div>
    </div>
  )
} 