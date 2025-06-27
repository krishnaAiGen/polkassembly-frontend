'use client'

export default function TypingIndicator() {
  return (
    <div className="flex justify-start mb-4">
      <div className="flex items-center space-x-3">
        {/* AI Avatar */}
        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center">
          <div className="w-4 h-4 bg-white rounded-sm"></div>
        </div>
        
        {/* Typing animation */}
        <div className="bg-white/90 backdrop-blur-sm border border-primary-100 px-4 py-3 rounded-2xl">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
          </div>
        </div>
      </div>
    </div>
  )
} 