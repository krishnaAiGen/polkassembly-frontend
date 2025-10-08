'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

export default function FeedbackPage() {
  const searchParams = useSearchParams()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    feedbackText: ''
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  // Get URL parameters
  const userId = searchParams.get('userId')
  const conversationId = searchParams.get('conversationId')
  const messageId = searchParams.get('messageId')
  const isDislike = searchParams.get('dislike') === 'true'

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMessage('')
    
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          userId,
          conversationId,
          messageId,
          rating: isDislike ? 1 : undefined // Set rating to 1 for dislike
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        setSubmitStatus('success')
        // Auto-close tab after 3 seconds
        setTimeout(() => {
          window.close()
        }, 3000)
      } else {
        setSubmitStatus('error')
        setErrorMessage(result.error || 'Failed to submit feedback')
      }
    } catch (error) {
      setSubmitStatus('error')
      setErrorMessage('Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit(e as any)
    }
  }

  if (submitStatus === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8 text-center">
          <div className="text-green-600 text-6xl mb-6">✓</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Thank You!</h1>
          <p className="text-gray-600 mb-4">Your feedback has been submitted successfully.</p>
          <p className="text-sm text-gray-500">This tab will close automatically in a few seconds...</p>
          <button
            onClick={() => window.close()}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Close Tab
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white py-8">
        <div className="max-w-2xl mx-auto px-4">
          <h1 className="text-2xl font-bold mb-2">Please drop your contact info*</h1>
          {isDislike && (
            <p className="text-sm opacity-90">
              Since you have disliked it, please provide a review here
            </p>
          )}
          <div className="mt-4 text-sm opacity-75">
            <p>🚀 Klara Feedback Form - Help us improve your experience</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* First Name */}
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                First name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                required
                className="w-full px-3 py-3 border-b-2 border-gray-300 focus:border-red-500 focus:outline-none bg-transparent text-lg text-black placeholder-gray-400"
                placeholder="Jane"
              />
            </div>

            {/* Last Name */}
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                Last name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                required
                className="w-full px-3 py-3 border-b-2 border-gray-300 focus:border-red-500 focus:outline-none bg-transparent text-lg text-black placeholder-gray-400"
                placeholder="Smith"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                required
                className="w-full px-3 py-3 border-b-2 border-gray-300 focus:border-red-500 focus:outline-none bg-transparent text-lg text-black placeholder-gray-400"
                placeholder="name@example.com"
              />
            </div>

            {/* Company */}
            <div>
              <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                Company
              </label>
              <input
                type="text"
                id="company"
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                className="w-full px-3 py-3 border-b-2 border-gray-300 focus:border-red-500 focus:outline-none bg-transparent text-lg text-black placeholder-gray-400"
                placeholder="Acme Corporation"
              />
            </div>

            {/* Feedback Text */}
            <div>
              <label htmlFor="feedbackText" className="block text-sm font-medium text-gray-700 mb-2">
                Additional Feedback
              </label>
              <textarea
                id="feedbackText"
                name="feedbackText"
                value={formData.feedbackText}
                onChange={handleInputChange}
                rows={5}
                className="w-full px-3 py-3 border-2 border-gray-300 focus:border-red-500 focus:outline-none rounded-md resize-none text-lg text-black placeholder-gray-400"
                placeholder="Please share your thoughts, suggestions, or issues you encountered..."
              />
            </div>

            {/* Error Message */}
            {submitStatus === 'error' && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-800">{errorMessage}</p>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-center pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white font-medium py-4 px-12 rounded-md transition-colors flex items-center space-x-3 text-lg"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <span>OK</span>
                    <span className="text-sm opacity-75">press Enter ↵</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Context Info (for debugging) */}
          {(userId || conversationId || messageId) && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <details className="text-sm text-gray-500">
                <summary className="cursor-pointer hover:text-gray-700">Debug Info</summary>
                <div className="mt-2 space-y-1">
                  {userId && <p>User ID: {userId}</p>}
                  {conversationId && <p>Conversation ID: {conversationId}</p>}
                  {messageId && <p>Message ID: {messageId}</p>}
                  <p>Feedback Type: {isDislike ? 'Dislike' : 'General'}</p>
                </div>
              </details>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-100 py-6">
        <div className="max-w-2xl mx-auto px-4 text-center text-sm text-gray-600">
          <p>Thank you for helping us improve Klara! Your feedback is valuable to us.</p>
        </div>
      </div>
    </div>
  )
}
