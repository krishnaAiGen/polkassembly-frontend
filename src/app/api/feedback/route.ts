import { NextRequest, NextResponse } from 'next/server'
import { ensureFeedbackTableExists, saveFeedback } from '@/lib/postgres'

export async function POST(request: NextRequest) {
  try {
    // Ensure feedback table exists
    await ensureFeedbackTableExists()
    
    const body = await request.json()
    const { 
      firstName, 
      lastName, 
      email, 
      company, 
      feedbackText, 
      userId, 
      conversationId, 
      messageId, 
      rating 
    } = body
    
    // Validate required fields
    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        { success: false, error: 'First name, last name, and email are required' },
        { status: 400 }
      )
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email address' },
        { status: 400 }
      )
    }
    
    // Save feedback to database
    await saveFeedback({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      company: company?.trim() || undefined,
      feedbackText: feedbackText?.trim() || undefined,
      userId: userId || undefined,
      conversationId: conversationId || undefined,
      messageId: messageId || undefined,
      rating: rating || undefined
    })
    
    return NextResponse.json({
      success: true,
      message: 'Thank you for your feedback! We appreciate your input.'
    })
    
  } catch (error) {
    console.error('Feedback submission error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to submit feedback. Please try again later.' 
      },
      { status: 500 }
    )
  }
}
