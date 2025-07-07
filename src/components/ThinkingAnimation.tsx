'use client'

import { useState, useEffect } from 'react'

interface ThinkingAnimationProps {
  isVisible: boolean
}

export default function ThinkingAnimation({ isVisible }: ThinkingAnimationProps) {
  const [dots, setDots] = useState('')

  useEffect(() => {
    if (!isVisible) {
      setDots('')
      return
    }

    const interval = setInterval(() => {
      setDots(prev => {
        if (prev.length >= 3) {
          return ''
        }
        return prev + '.'
      })
    }, 500)

    return () => clearInterval(interval)
  }, [isVisible])

  if (!isVisible) return null

  return (
    <div className="flex justify-start mb-4">
      <div className="max-w-[70%] order-1">
        <div className="px-4 py-3 rounded-2xl bg-white/90 backdrop-blur-sm text-gray-800 border border-primary-100">
          <span className="text-sm text-gray-700 font-medium">
            Thinking{dots}
          </span>
        </div>
      </div>
      
      {/* AI Avatar */}
      <div className="w-8 h-8 rounded-full flex-shrink-0 order-2 ml-3">
        <div className="w-full h-full bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center">
          <div className="w-4 h-4 bg-white rounded-sm"></div>
        </div>
      </div>
    </div>
  )
} 