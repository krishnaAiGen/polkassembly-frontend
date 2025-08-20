'use client'

import React, { useState, useEffect } from 'react';
import AddressInline from './AddressInline';

interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  lastActivity: number;
  messageCount: number;
}

interface ConversationSidebarProps {
  currentUser: string;
  activeConversationId: string | null;
  onConversationSelect: (conversationId: string) => void;
  onNewConversation: () => void;
  onLogout: () => void;
  refreshTrigger?: number; // Add trigger to refresh conversations
}

export default function ConversationSidebar({ 
  currentUser, 
  activeConversationId, 
  onConversationSelect, 
  onNewConversation,
  onLogout,
  refreshTrigger
}: ConversationSidebarProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Check if currentUser is a wallet address
  const isWalletAddress = currentUser.length > 20 || currentUser.includes('0x') || /\d/.test(currentUser);
  const displayName = isWalletAddress 
    ? `${currentUser.slice(0, 6)}...${currentUser.slice(-6)}`
    : currentUser.charAt(0).toUpperCase() + currentUser.slice(1);

  useEffect(() => {
    if (currentUser) {
      loadConversations();
    }
  }, [currentUser]);

  // Refresh conversations when refreshTrigger changes
  useEffect(() => {
    if (currentUser && refreshTrigger) {
      loadConversations();
    }
  }, [refreshTrigger, currentUser]);

  const loadConversations = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Filter out conversations with zero messages
          const filteredConversations = (data.conversations || []).filter(
            (conv: Conversation) => conv.messageCount > 0
          );
          setConversations(filteredConversations);
        }
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const truncateText = (text: string, maxLength: number = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="w-80 bg-white/90 backdrop-blur-sm border-r border-primary-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-primary-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-pink-500 rounded-full flex items-center justify-center">
              <div className="w-5 h-5 bg-white rounded-full"></div>
            </div>
            <div>
              <h2 className="font-medium text-sm text-gray-800">Klara</h2>
              <p className="text-xs text-gray-500">
                {isWalletAddress ? (
                  <AddressInline address={currentUser} iconSize={10} textClassName="text-gray-500" />
                ) : (
                  <span>{displayName}</span>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="text-gray-400 hover:text-red-500 transition-colors p-1"
            title="Logout"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>

        {/* New Chat Button */}
        <button
          onClick={onNewConversation}
          className="w-full bg-gradient-to-r from-primary-600 to-pink-600 hover:from-primary-700 hover:to-pink-700 text-white py-2 px-3 rounded-md transition-all duration-200 flex items-center justify-center space-x-2"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="font-medium text-sm">New Chat</span>
        </button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-3 text-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600 mx-auto mb-2"></div>
            <p className="text-xs text-gray-600">Loading...</p>
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-3 text-center">
            <div className="text-gray-400 mb-2">
              <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-xs text-gray-600 mb-1">No chats yet</p>
            <p className="text-xs text-gray-500">Start a new chat!</p>
          </div>
        ) : (
          <div className="py-2">
            {conversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => onConversationSelect(conversation.id)}
                className={`w-full text-left px-3 py-2 hover:bg-gray-100 transition-colors ${
                  activeConversationId === conversation.id
                    ? 'bg-gray-100'
                    : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-normal text-gray-800 text-sm truncate leading-tight">
                      {conversation.title}
                    </h3>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-2 border-t border-gray-200">
        <div className="text-xs text-gray-400 text-center">
          <p className="text-xs">Klara AI Assistant</p>
          <p className="text-xs">Polkassembly Chat</p>
        </div>
      </div>
    </div>
  );
}
