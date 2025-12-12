'use client';

import React, { useState, useEffect } from 'react';
import LoginForm from '@/components/LoginForm';
import ChatInterface from '@/components/ChatInterface';
import ConversationSidebar from '@/components/ConversationSidebar';
import { Message } from '@/types/chat';
import { AuthService } from '@/lib/authService';
import { ChatIcon } from '@/components/Icons';

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    // Check for existing authentication on mount
    const authData = AuthService.getAuthData();
    if (authData) {
      setUser({ address: authData.address, wallet: authData.wallet });
    }
  }, []);

  useEffect(() => {
    if (user?.address && !activeConversationId) {
      // When user logs in, start a new conversation
      createNewConversation();
    }
  }, [user, activeConversationId]);

  const createNewConversation = async () => {
    if (!user?.address) return;
    
    try {
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: user.address,
          action: 'create'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setActiveConversationId(data.conversationId);
          setMessages([]);
          setRefreshTrigger(prev => prev + 1); // Trigger sidebar refresh
          console.log(`Created new conversation: ${data.conversationId}`);
        }
      }
    } catch (error) {
      console.error('Error creating new conversation:', error);
    }
  };

  const loadConversationMessages = async (conversationId: string) => {
    setIsLoadingHistory(true);
    try {
      const response = await fetch('/api/conversation-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setMessages(data.messages || []);
          console.log(`Loaded ${data.messages?.length || 0} messages for conversation ${conversationId}`);
        }
      }
    } catch (error) {
      console.error('Error loading conversation messages:', error);
      setMessages([]);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleConversationSelect = (conversationId: string) => {
    setActiveConversationId(conversationId);
    loadConversationMessages(conversationId);
  };

  const handleNewConversation = () => {
    createNewConversation();
  };

  const handleLoginSuccess = (userData: any) => {
    setUser(userData);
    setError('');
  };

  const handleLoginError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const handleNewMessage = (message: Message) => {
    // Update local state
    setMessages(prev => [...prev, message]);
  };

  const handleLogout = () => {
    setUser(null);
    setMessages([]);
    setActiveConversationId(null);
    AuthService.logout();
  };

  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-primary-50 via-white to-pink-50">
      {!user ? (
        <div className="container h-screen mx-auto px-4 py-8">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <LoginForm 
            onLoginSuccess={handleLoginSuccess}
            onLoginError={handleLoginError}
          />
        </div>
      ) : (
        <div className="h-screen flex w-full">
          {/* Sidebar */}
          <ConversationSidebar
            currentUser={user.address}
            activeConversationId={activeConversationId}
            onConversationSelect={handleConversationSelect}
            onNewConversation={handleNewConversation}
            onLogout={handleLogout}
            refreshTrigger={refreshTrigger}
          />
          
          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col">
            {isLoadingHistory ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading conversation...</p>
                </div>
              </div>
            ) : activeConversationId ? (
              <ChatInterface 
                currentUser={user.address}
                messages={messages}
                conversationId={activeConversationId}
                onNewMessage={handleNewMessage}
                onLogout={handleLogout}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <div className="mb-4 flex justify-center">
                    <ChatIcon className="w-24 h-24 text-gray-400" />
                  </div>
                  <h2 className="text-xl font-semibold mb-2">Welcome to Klara</h2>
                  <p className="mb-4">Start a new conversation to begin chatting</p>
                  <button
                    onClick={handleNewConversation}
                    className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg transition-colors"
                  >
                    Start New Conversation
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Background decorative elements */}
      <div className="fixed top-20 right-20 w-4 h-4 bg-pink-500 rotate-45 opacity-20"></div>
      <div className="fixed bottom-40 left-32 w-6 h-6 bg-primary-500 rotate-45 opacity-15"></div>
      <div className="fixed top-1/3 right-1/4 w-3 h-3 bg-primary-700 rotate-45 opacity-25"></div>
      <div className="fixed bottom-20 right-1/3 w-5 h-5 bg-pink-600 rotate-45 opacity-10"></div>
    </main>
  );
} 