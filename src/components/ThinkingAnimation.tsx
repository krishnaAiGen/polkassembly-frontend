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
      <div className="max-w-[70%]">
        <div className="px-4 py-3 rounded-2xl bg-white/90 backdrop-blur-sm text-gray-800 border border-primary-100">
          <span className="text-sm text-gray-700 font-medium">
            Thinking{dots}
          </span>
        </div>
      </div>
    </div>
  )
} 