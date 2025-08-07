'use client'

import { Message } from '@/types/chat';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Tooltip } from 'react-tooltip';
import AddressInline from './AddressInline';

interface MessageBubbleProps {
  message: Message
  isStreaming?: boolean
  onFollowUpClick?: (question: string) => void
  currentUser?: string
}

export default function MessageBubble({ message, isStreaming = false, onFollowUpClick, currentUser }: MessageBubbleProps) {
  const isUser = message.sender === 'user'
  const validSources = (message.sources || []).filter(s => s.url && s.url.trim() !== '')
  const hasLinks = validSources.length > 0
  const hasFollowUps = message.followUpQuestions && message.followUpQuestions.length > 0
  
  // Check if currentUser is a wallet address or username
  const isWalletAddress = currentUser && (currentUser.length > 20 || currentUser.includes('0x') || currentUser.includes('1') || currentUser.includes('2') || currentUser.includes('3') || currentUser.includes('4') || currentUser.includes('5') || currentUser.includes('6') || currentUser.includes('7') || currentUser.includes('8') || currentUser.includes('9'))
  
  // Get user display info
  const userDisplayName = currentUser ? (isWalletAddress 
    ? `${currentUser.slice(0, 6)}...${currentUser.slice(-6)}`
    : currentUser.charAt(0).toUpperCase() + currentUser.slice(1)
  ) : ''
  
  const userInitial = currentUser ? currentUser.charAt(0).toUpperCase() : 'U'
  
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

  if (hasLinks && !isUser) {
    // Log sources as JSON
    if (typeof window !== 'undefined') {
      // Only log in browser
      console.log('Web search sources:', JSON.stringify(message.sources, null, 2));
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
          {!isUser && (
             <p className="text-xs font-bold text-primary-700 mb-2">Klara</p>
          )}
          {isUser && currentUser && (
            <div className="mb-2">
              {isWalletAddress ? (
                <AddressInline address={currentUser} iconSize={14} textClassName="text-white/80 text-xs" />
              ) : (
                <span className="text-white/80 text-xs font-medium">{userDisplayName}</span>
              )}
            </div>
          )}

          {isUser ? (
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words text-white">
              {message.text}
            </p>
          ) : (
            <div className="prose prose-sm max-w-none prose-p:text-gray-800 prose-headings:text-gray-800 prose-strong:text-gray-800 prose-ul:text-gray-800 prose-ol:text-gray-800 prose-li:text-gray-800 prose-a:text-primary-600 hover:prose-a:text-primary-700">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.text}</ReactMarkdown>
              {isStreaming && <span className="streaming-cursor"></span>}
            </div>
          )}

          {/* Sources/Links Section - Horizontal Layout */}
          {hasLinks && !isUser && (
            <div className="mt-3 pt-3 border-t border-primary-100">
              <p className="text-xs font-medium text-gray-600 mb-2">📖 Sources:</p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {validSources.map((source, index) => (
                  <a
                    key={index}
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-tooltip-id={`source-tooltip-${message.id}-${index}`}
                    className="flex-shrink-0 bg-primary-50 hover:bg-primary-100 border border-primary-200 rounded-lg px-3 py-2 text-xs transition-colors group min-w-0"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">{getSourceIcon(source.source_type)}</span>
                      <div className="min-w-0">
                        <div className="font-medium text-gray-800 group-hover:text-primary-700 truncate max-w-[200px]">
                          {source.title}
                        </div>
                        <div className="text-gray-500 text-xs capitalize">
                          {source.source_type.replace('_', ' ')}
                        </div>
                      </div>
                      <svg className="w-3 h-3 text-primary-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </div>
                    <Tooltip
                      id={`source-tooltip-${message.id}-${index}`}
                      content={source.title}
                      place="top"
                      style={{
                        backgroundColor: '#1f2937',
                        color: '#ffffff',
                        borderRadius: '8px',
                        fontSize: '12px',
                        maxWidth: '300px',
                        padding: '8px 12px',
                        zIndex: 1000
                      }}
                    />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Follow-up Questions Section - Horizontal Layout */}
          {hasFollowUps && !isUser && onFollowUpClick && (
            <div className="mt-3 pt-3 border-t border-primary-100">
              <p className="text-xs font-medium text-gray-600 mb-2">💡 Questions:</p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {message.followUpQuestions!.map((question, index) => (
                  <div key={index}>
                    <button
                      onClick={() => onFollowUpClick(question)}
                      data-tooltip-id={`question-tooltip-${message.id}-${index}`}
                      className="flex-shrink-0 bg-gradient-to-r from-primary-50 to-pink-50 hover:from-primary-100 hover:to-pink-100 border border-primary-200 rounded-lg px-3 py-2 text-xs transition-all duration-200 hover:shadow-sm group"
                    >
                      <div className="flex items-center space-x-2 whitespace-nowrap">
                        <span className="text-gray-700 group-hover:text-primary-700 font-medium max-w-[250px] truncate">
                          {question}
                        </span>
                        <svg 
                          className="w-3 h-3 text-primary-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </button>
                    <Tooltip
                      id={`question-tooltip-${message.id}-${index}`}
                      content={question}
                      place="top"
                      style={{
                        backgroundColor: '#7c3aed',
                        color: '#ffffff',
                        borderRadius: '8px',
                        fontSize: '12px',
                        maxWidth: '400px',
                        padding: '8px 12px',
                        zIndex: 1000,
                        wordWrap: 'break-word',
                        whiteSpace: 'normal'
                      }}
                    />
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
      
      {/* Avatar - Only show for user */}
      {isUser && (
        <div className="w-8 h-8 rounded-full flex-shrink-0 order-1 mr-3">
          <div className="w-full h-full bg-gradient-to-br from-primary-400 to-pink-400 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-medium">{userInitial}</span>
          </div>
        </div>
      )}
    </div>
  )
}
