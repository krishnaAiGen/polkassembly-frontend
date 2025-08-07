'use client'

import { useState, useRef, useEffect } from 'react'
import { Message, Source } from '@/types/chat'
import MessageBubble from './MessageBubble'
import TypingIndicator from './TypingIndicator'
import ThinkingAnimation from './ThinkingAnimation'
import Mascot from './Mascot';
import { MascotGif } from '../lib/mascots';
import React from 'react'; // Added missing import

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
  const [abortController, setAbortController] = useState<AbortController | null>(null)
  const [isUserScrolling, setIsUserScrolling] = useState(false)
  const [mascotType, setMascotType] = useState<'welcome' | 'loading' | 'error' | 'taskdone' | null>('welcome');
  const [hasUserStartedTyping, setHasUserStartedTyping] = useState(false);
  const [totalStats, setTotalStats] = useState<{totalConversations: number, totalUsers: number} | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Create display name from normalized username
  const displayName = currentUser.charAt(0).toUpperCase() + currentUser.slice(1)

  // Fetch total statistics on component mount
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats');
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setTotalStats({
              totalConversations: data.totalConversations,
              totalUsers: data.totalUsers
            });
          }
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };

    fetchStats();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const isNearBottom = () => {
    const container = messagesContainerRef.current
    if (!container) return true
    
    const { scrollTop, scrollHeight, clientHeight } = container
    // Consider "near bottom" if within 100px of the bottom
    return scrollHeight - scrollTop - clientHeight < 100
  }

  const handleScroll = () => {
    if (!isNearBottom()) {
      setIsUserScrolling(true)
    } else {
      setIsUserScrolling(false)
    }
  }

  useEffect(() => {
    const container = messagesContainerRef.current
    if (container) {
      container.addEventListener('scroll', handleScroll)
      return () => container.removeEventListener('scroll', handleScroll)
    }
  }, [])

  useEffect(() => {
    // Only auto-scroll if user hasn't manually scrolled up
    if (!isUserScrolling) {
      scrollToBottom()
    }
  }, [messages, streamingMessage, isUserScrolling])

  // This effect will now just be for the error mascot's timed removal
  useEffect(() => {
    if (mascotType === 'error') {
      const timer = setTimeout(() => {
        setMascotType(null);
      }, 5000); // Error mascot disappears after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [mascotType]);

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

  const handleStopGeneration = () => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
    }
    setIsLoading(false);

    if (streamingMessage) {
      // Finalize the partially streamed message and add it to the history
      const finalMessage: Message = {
        ...streamingMessage,
        isStreaming: false,
      };
      onNewMessage(finalMessage);
    }
    
    setStreamingMessage(null); // Clear the streaming message state
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputText(value);
    
    // Only hide mascot on first keystroke, not every keystroke
    if (!hasUserStartedTyping && value.length > 0) {
      setHasUserStartedTyping(true);
      if (mascotType === 'welcome' || mascotType === 'taskdone') {
        setMascotType(null);
      }
    }
  };

  // Memoize the messages rendering to prevent unnecessary re-renders
  const renderedMessages = React.useMemo(() => {
    return messages.map((message) => (
      <MessageBubble 
        key={message.id} 
        message={message} 
        onFollowUpClick={handleFollowUpClick}
      />
    ));
  }, [messages]);

  const renderedStreamingMessage = React.useMemo(() => {
    if (!streamingMessage) return null;
    return (
      <div className="flex justify-start mb-4">
        <div className="max-w-[70%] order-1">
          <MessageBubble 
            message={streamingMessage} 
            isStreaming={true} 
            onFollowUpClick={handleFollowUpClick}
          />
          {/* Stop button positioned at the bottom of the streaming message */}
          <div className="flex justify-start mt-2">
            <button
              onClick={handleStopGeneration}
              className="w-8 h-8 bg-primary-500 hover:bg-primary-600 rounded-full flex items-center justify-center transition-colors flex-shrink-0 shadow-md"
              title="Stop generation"
            >
              <div className="w-3 h-3 bg-white" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0% 100%)' }}></div>
            </button>
          </div>
        </div>
      </div>
    );
  }, [streamingMessage, handleStopGeneration]);

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
    setHasUserStartedTyping(false); // Reset for next conversation
    
    setIsLoading(true);
    setMascotType('loading'); // Show loading mascot

    // Create abort controller for this request
    const controller = new AbortController()
    setAbortController(controller)

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
        }),
        signal: controller.signal
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
        let firstChunkReceived = false;
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          if (!firstChunkReceived) {
            firstChunkReceived = true;
            setMascotType(null); // Hide loading mascot immediately
          }

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
                  setMascotType('taskdone'); // Show taskdone mascot
                  setTimeout(() => setMascotType(null), 3000); // Show for 3 seconds
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
      
      // Don't show error message if request was aborted
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Request was aborted')
        return
      }
      
      const errorMessage: Message = {
        id: generateMessageId(),
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'ai',
        timestamp: Date.now()
      }
      onNewMessage(errorMessage)
      setMascotType('error'); // Show error mascot
      setTimeout(() => setMascotType(null), 5000); // Show for 5 seconds
    } finally {
      console.log('Setting isLoading to false')
      setIsLoading(false)
      setAbortController(null) // Clean up the controller
      // Ensure loading mascot is hidden even if the request fails before streaming
      if (mascotType === 'loading') {
        setMascotType(null);
      }
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
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>Welcome, {displayName}!</span>
                <span className="bg-primary-100 text-primary-700 text-xs px-2 py-1 rounded-full font-medium">
                  {Math.ceil(messages.length / 2) + (streamingMessage ? 1 : 0)} conversations
                </span>
                {totalStats && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>🎉</span>
                    <span>{totalStats.totalConversations} total conversations</span>
                    <span>•</span>
                    <span>{totalStats.totalUsers} users</span>
                  </div>
                )}
              </div>
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
      <div 
        ref={messagesContainerRef}
        className="flex-1 bg-white/60 backdrop-blur-sm p-4 overflow-y-auto chat-scroll"
      >
        <div className="space-y-4">
          {renderedMessages}
          
          {mascotType && mascotType !== 'loading' && (
             <Mascot type={mascotType} />
          )}

          {/* Show loading mascot ONLY before streaming starts */}
          {isLoading && !streamingMessage && (
             <Mascot type="loading" onStop={handleStopGeneration} />
          )}

          {/* Show streaming message with its own stop button */}
          {renderedStreamingMessage}
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
            onChange={handleInputChange}
            placeholder="Type your message..."
            className="flex-1 px-4 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all duration-200 text-gray-900 placeholder-gray-500 bg-white"
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