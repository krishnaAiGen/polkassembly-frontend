'use client';

import React, { useState, useEffect } from 'react';
import LoginForm from '@/components/LoginForm';
import ChatInterface from '@/components/ChatInterface';
import { Message } from '@/types/chat';
import { AuthService } from '@/lib/authService';
import { ChatCacheManager } from '@/lib/chatCache';

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  useEffect(() => {
    // Check for existing authentication on mount
    const authData = AuthService.getAuthData();
    if (authData) {
      setUser({ address: authData.address, wallet: authData.wallet });
    }
  }, []);

  useEffect(() => {
    if (user?.address) {
      loadUserChatHistory(user.address);
    }
  }, [user]);

  const loadUserChatHistory = async (username: string) => {
    setIsLoadingHistory(true);
    try {
      // Use cache manager to get messages (checks cache first, then API)
      const messages = await ChatCacheManager.getCachedMessages(username);
      setMessages(messages);
      console.log(`Loaded ${messages.length} messages for ${username}`);
    } catch (error) {
      console.error('Error loading chat history:', error);
      setMessages([]);
    } finally {
      setIsLoadingHistory(false);
    }
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
    
    // Update cache with new message
    if (user?.address) {
      ChatCacheManager.addMessageToCache(user.address, message);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setMessages([]);
    AuthService.logout();
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-pink-50">
      <div className="container h-screen mx-auto px-4 py-8">
        {!user ? (
          <>
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <LoginForm 
              onLoginSuccess={handleLoginSuccess}
              onLoginError={handleLoginError}
            />
          </>
        ) : (
          <>
            {isLoadingHistory ? (
              <div className="max-w-4xl mx-auto h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading your chat history...</p>
                </div>
              </div>
            ) : (
              <ChatInterface 
                currentUser={user.address}
                messages={messages}
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
      
      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-t border-primary-100 py-2 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs text-gray-600">
            This is the beta version of Klara for testing. Please share any feedback or issues you encounter{' '}
            <a 
              href="https://form.typeform.com/to/NXegXtAO" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary-600 hover:text-primary-700 underline font-medium"
            >
              here
            </a>
            .
          </p>
        </div>
      </footer>
      
    </main>
  );
} 