'use client'

import { Message } from '@/types/chat'

interface MessageBubbleProps {
  message: Message
  isStreaming?: boolean
}

export default function MessageBubble({ message, isStreaming = false }: MessageBubbleProps) {
  const isUser = message.sender === 'user'
  const hasLinks = message.sources && message.sources.length > 0
  
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const getSourceIcon = (sourceType: string) => {
    switch (sourceType) {
      case 'polkadot_wiki':
        return '📚'
      case 'polkassembly':
        return '🏛️'
      default:
        return '🔗'
    }
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[70%] ${isUser ? 'order-2' : 'order-1'}`}>
        <div
          className={`px-4 py-3 rounded-2xl ${
            isUser
              ? 'bg-gradient-to-r from-primary-600 to-pink-600 text-white'
              : 'bg-white/90 backdrop-blur-sm text-gray-800 border border-primary-100'
          }`}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.text}
            {isStreaming && (
              <span className="inline-block w-2 h-4 bg-current opacity-75 ml-1 animate-pulse">
                |
              </span>
            )}
          </p>
          
          {/* Sources/Links Section */}
          {hasLinks && !isUser && (
            <div className="mt-3 pt-3 border-t border-primary-100">
              <p className="text-xs font-medium text-gray-600 mb-2">📖 Related Sources:</p>
              <div className="space-y-2">
                {message.sources!.map((source, index) => (
                  <div key={index} className="bg-primary-50 rounded-lg p-2 border border-primary-100">
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start space-x-2 text-xs hover:text-primary-700 transition-colors group"
                    >
                      <span className="text-sm">{getSourceIcon(source.source_type)}</span>
                      <div className="flex-1">
                        <div className="font-medium text-gray-800 group-hover:text-primary-700 line-clamp-2">
                          {source.title}
                        </div>
                        <div className="text-gray-500 truncate mt-1">
                          {source.url}
                        </div>
                        <div className="mt-1">
                          <span className="text-gray-400 capitalize">
                            {source.source_type.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                      <div className="text-primary-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </div>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className={`text-xs text-gray-500 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
          {formatTime(message.timestamp)}
        </div>
      </div>
      
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex-shrink-0 ${isUser ? 'order-1 mr-3' : 'order-2 ml-3'}`}>
        {isUser ? (
          <div className="w-full h-full bg-gradient-to-br from-primary-400 to-pink-400 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-medium">U</span>
          </div>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center">
            <div className="w-4 h-4 bg-white rounded-sm"></div>
          </div>
        )}
      </div>
    </div>
  )
} 