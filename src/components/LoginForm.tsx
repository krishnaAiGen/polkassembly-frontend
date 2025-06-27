'use client'

import { useState } from 'react'

interface LoginFormProps {
  onLogin: (username: string) => void
}

export default function LoginForm({ onLogin }: LoginFormProps) {
  const [username, setUsername] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim()) return

    setIsLoading(true)
    
    // Convert username to lowercase for consistency
    const normalizedUsername = username.trim().toLowerCase()
    
    try {
      // Initialize user in database if not exists
      await fetch('/api/init-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: normalizedUsername })
      })
      
      onLogin(normalizedUsername)
    } catch (error) {
      console.error('Login error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 w-full max-w-md border border-primary-200">
        {/* Logo area */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center">
            <div className="w-8 h-8 bg-white rounded-full"></div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-pink-600 bg-clip-text text-transparent">
            Polkassembly
          </h1>
          <p className="text-gray-600 mt-2">The Ultimate Hub for Polkadot Governance</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              Enter your name to start chatting
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all duration-200 text-gray-900 placeholder-gray-500 bg-white"
              placeholder="Your name..."
              required
              disabled={isLoading}
            />
            {username && (
              <p className="text-xs text-gray-500 mt-1">
                Will be saved as: <span className="font-medium">{username.trim().toLowerCase()}</span>
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={!username.trim() || isLoading}
            className="w-full bg-gradient-to-r from-primary-600 to-pink-600 text-white py-3 px-4 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:from-primary-700 hover:to-pink-700 transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-lg"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Connecting...
              </div>
            ) : (
              'Start Chatting'
            )}
          </button>
        </form>

        {/* Decorative elements */}
        <div className="absolute -top-4 -right-4 w-8 h-8 bg-primary-300 rounded-full opacity-30"></div>
        <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-pink-300 rounded-full opacity-30"></div>
      </div>
    </div>
  )
} 