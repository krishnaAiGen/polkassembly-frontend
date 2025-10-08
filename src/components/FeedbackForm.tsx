'use client'

import { useState } from 'react'

interface FeedbackFormProps {
  onClose: () => void
  userId?: string
  conversationId?: string
  messageId?: string
  isDislike?: boolean
}

export default function FeedbackForm({ 
  onClose, 
  userId, 
  conversationId, 
  messageId, 
  isDislike = false 
}: FeedbackFormProps) {
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
        setTimeout(() => {
          onClose()
        }, 2000) // Close after 2 seconds
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
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 text-center">
          <div className="text-green-600 text-5xl mb-4">✓</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Thank You!</h3>
          <p className="text-gray-600">Your feedback has been submitted successfully.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Please drop your contact info*</h2>
              {isDislike && (
                <p className="text-sm opacity-90 mt-1">
                  Since you have disliked it, please provide a review here
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-2xl font-bold"
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
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
              className="w-full px-3 py-2 border-b-2 border-gray-300 focus:border-red-500 focus:outline-none bg-transparent"
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
              className="w-full px-3 py-2 border-b-2 border-gray-300 focus:border-red-500 focus:outline-none bg-transparent"
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
              className="w-full px-3 py-2 border-b-2 border-gray-300 focus:border-red-500 focus:outline-none bg-transparent"
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
              className="w-full px-3 py-2 border-b-2 border-gray-300 focus:border-red-500 focus:outline-none bg-transparent"
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
              rows={4}
              className="w-full px-3 py-2 border-2 border-gray-300 focus:border-red-500 focus:outline-none rounded-md resize-none"
              placeholder="Please share your thoughts, suggestions, or issues you encountered..."
            />
          </div>

          {/* Error Message */}
          {submitStatus === 'error' && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-red-800 text-sm">{errorMessage}</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-center pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white font-medium py-3 px-8 rounded-md transition-colors flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
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
      </div>
    </div>
  )
}
