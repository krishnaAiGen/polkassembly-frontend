'use client'

import { useState, useEffect } from 'react'
import { ChatCacheManager } from '@/lib/chatCache'

interface CacheDebugPanelProps {
  currentUser?: string | null
}

export default function CacheDebugPanel({ currentUser }: CacheDebugPanelProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [cacheStats, setCacheStats] = useState<any>(null)

  const updateStats = () => {
    try {
      const stats = ChatCacheManager.getCacheStats()
      setCacheStats(stats)
    } catch (error) {
      console.error('Error getting cache stats:', error)
    }
  }

  useEffect(() => {
    if (isVisible) {
      updateStats()
      const interval = setInterval(updateStats, 2000) // Update every 2 seconds
      return () => clearInterval(interval)
    }
  }, [isVisible])

  const handleClearUserCache = () => {
    if (currentUser) {
      ChatCacheManager.clearUserCache(currentUser)
      updateStats()
      alert(`Cache cleared for user: ${currentUser}`)
    }
  }

  const handleClearAllCache = () => {
    ChatCacheManager.clearAllCache()
    updateStats()
    alert('All cache cleared')
  }

  const handleRefreshCache = async () => {
    if (currentUser) {
      try {
        await ChatCacheManager.refreshCache(currentUser)
        updateStats()
        alert(`Cache refreshed for user: ${currentUser}`)
      } catch (error) {
        alert('Error refreshing cache')
      }
    }
  }

  // Show debug panel only in development
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isVisible ? (
        <button
          onClick={() => setIsVisible(true)}
          className="bg-gray-800 text-white px-3 py-2 rounded-lg text-xs hover:bg-gray-700 transition-colors"
        >
          🐛 Cache Debug
        </button>
      ) : (
        <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm">Cache Debug Panel</h3>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-500 hover:text-gray-700 text-lg leading-none"
            >
              ×
            </button>
          </div>

          {cacheStats && (
            <div className="space-y-2 text-xs">
              <div>
                <strong>Current User:</strong> {currentUser || 'None'}
              </div>
              <div>
                <strong>Cached Users:</strong> {cacheStats.inMemoryUsers.length}
                {cacheStats.inMemoryUsers.length > 0 && (
                  <div className="ml-2 text-gray-600">
                    {cacheStats.inMemoryUsers.join(', ')}
                  </div>
                )}
              </div>
              <div>
                <strong>localStorage Keys:</strong> {cacheStats.localStorageKeys?.length || 0}
              </div>
              <div>
                <strong>Cache Size:</strong> {cacheStats.cacheSize}
              </div>
              
              {Object.keys(cacheStats.timestamps).length > 0 && (
                <div>
                  <strong>Last Updated:</strong>
                  {Object.entries(cacheStats.timestamps).map(([user, timestamp]: [string, any]) => (
                    <div key={user} className="ml-2 text-gray-600">
                      {user}: {new Date(timestamp).toLocaleTimeString()}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col gap-2 mt-3">
            <button
              onClick={updateStats}
              className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600 transition-colors"
            >
              Refresh Stats
            </button>
            
            {currentUser && (
              <>
                <button
                  onClick={handleClearUserCache}
                  className="bg-orange-500 text-white px-3 py-1 rounded text-xs hover:bg-orange-600 transition-colors"
                >
                  Clear User Cache
                </button>
                <button
                  onClick={handleRefreshCache}
                  className="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600 transition-colors"
                >
                  Refresh from API
                </button>
              </>
            )}
            
            <button
              onClick={handleClearAllCache}
              className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600 transition-colors"
            >
              Clear All Cache
            </button>
          </div>
        </div>
      )}
    </div>
  )
} 