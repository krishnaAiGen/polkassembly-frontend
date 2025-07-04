'use client'

interface ThinkingAnimationProps {
  isVisible: boolean
}

export default function ThinkingAnimation({ isVisible }: ThinkingAnimationProps) {
  if (!isVisible) return null

  return (
    <div className="flex items-center space-x-3 p-4">
      {/* Classic thin circular spinner (arc only) */}
      <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
        <defs>
          <linearGradient id="spinner-gradient" x1="0" y1="0" x2="24" y2="24">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
        </defs>
        <circle
          cx="12"
          cy="12"
          r="10"
          fill="none"
          stroke="#e0e0e0"
          strokeWidth="3"
        />
        <path
          d="M12 2a10 10 0 0 1 10 10"
          fill="none"
          stroke="url(#spinner-gradient)"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
      <span className="text-sm text-gray-700 font-medium">Thinking…</span>
    </div>
  )
} 