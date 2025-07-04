import { NextRequest, NextResponse } from 'next/server'
import { initializeDatabase, saveUserMessage } from '@/lib/database'
import { Message, BackendApiResponse } from '@/types/chat'

// Function to create streaming response
function createStreamResponse(text: string, sources?: any[], followUpQuestions?: string[]) {
  const encoder = new TextEncoder()
  
  const stream = new ReadableStream({
    async start(controller) {
      // Simulate token-by-token streaming like ChatGPT
      const words = text.split(' ')
      
      for (let i = 0; i < words.length; i++) {
        const chunk = i === 0 ? words[i] : ' ' + words[i]
        
        const data = JSON.stringify({ content: chunk })
        controller.enqueue(encoder.encode(`data: ${data}\n\n`))
        
        // Add delay to simulate real streaming
        await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100))
      }
      
      // Send sources if available
      if (sources && sources.length > 0) {
        const sourcesData = JSON.stringify({ sources: sources })
        controller.enqueue(encoder.encode(`data: ${sourcesData}\n\n`))
      }
      
      // Send follow-up questions if available
      if (followUpQuestions && followUpQuestions.length > 0) {
        const followUpData = JSON.stringify({ followUpQuestions: followUpQuestions })
        controller.enqueue(encoder.encode(`data: ${followUpData}\n\n`))
      }
      
      // Send completion signal
      controller.enqueue(encoder.encode('data: [DONE]\n\n'))
      controller.close()
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}

// Function to call external API
async function callExternalAPI(message: string, userId: string, clientIP: string): Promise<{ text: string, sources?: any[], followUpQuestions?: string[], remainingRequests?: number }> {
  const apiUrl = process.env.API_BASE_URL
  
  if (!apiUrl || apiUrl === 'https://api.example.com') {
    // Fallback response when no real API is configured
    const responses = [
      "I understand you're asking about Polkadot governance. This is a powerful ecosystem for decentralized decision-making.",
      "That's an interesting question about blockchain governance. The Polkadot network uses a sophisticated democracy system.",
      "Thanks for your query! The governance mechanisms in Polkadot include referenda, council elections, and treasury proposals.",
      "Great question! The Polkassembly platform helps community members participate in governance discussions and voting.",
      "I'd be happy to help you understand more about decentralized governance systems and how they work in practice."
    ]
    
    const text = responses[Math.floor(Math.random() * responses.length)] + 
           ` You mentioned: "${message}". This relates to important aspects of blockchain governance and community participation.`
    
    // Add some mock sources for fallback
    const mockSources = [
      {
        title: "Polkadot Governance Overview",
        url: "https://wiki.polkadot.network/docs/learn-governance",
        source_type: "polkadot_wiki",
        similarity_score: 0.85
      },
      {
        title: "Polkassembly Platform Guide",
        url: "https://polkassembly.io/about",
        source_type: "polkassembly",
        similarity_score: 0.78
      }
    ]
    
    // Add mock follow-up questions
    const mockFollowUpQuestions = [
      "How do I participate in Polkadot governance?",
      "What are the different types of proposals in Polkadot?",
      "How does the voting mechanism work?"
    ]
    
    return { 
      text, 
      sources: mockSources, 
      followUpQuestions: mockFollowUpQuestions, 
      remainingRequests: 10 
    }
  }

  try {
    // Call your configured API
    // Request body matching backend API specification
    const requestBody = {
      question: message,           // Required: 1-500 characters
      user_id: userId,            // Required: 1-100 characters
      client_ip: clientIP,        // Required: 7-45 characters
      max_chunks: 5,              // Optional: 1-10, default: 5
      include_sources: true,      // Optional: default: true
      custom_prompt: undefined    // Optional: custom system prompt
    }
    
    console.log('Sending request to backend:', JSON.stringify(requestBody, null, 2))
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add any required headers for your API
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      // Try to get error details from response
      let errorDetails = ''
      try {
        const errorResponse = await response.text()
        errorDetails = ` - Response: ${errorResponse}`
      } catch (e) {
        errorDetails = ' - Could not read error response'
      }
      
      console.error(`Backend API error - Status: ${response.status}${errorDetails}`)
      throw new Error(`API responded with status: ${response.status}${errorDetails}`)
    }

    const data: BackendApiResponse = await response.json()
    
    console.log('Backend response received:', {
      answer_length: data.answer?.length || 0,
      sources_count: data.sources?.length || 0,
      follow_up_count: data.follow_up_questions?.length || 0,
      remaining_requests: data.remaining_requests,
      confidence: data.confidence,
      processing_time: data.processing_time_ms
    })
    
    // Return response exactly as received from backend
    return { 
      text: data.answer || "I received your message but couldn't generate a proper response.",
      sources: data.sources || [],
      followUpQuestions: data.follow_up_questions || [],
      remainingRequests: data.remaining_requests || 0
    }
    
  } catch (error) {
    console.error('External API error:', error)
    return { 
      text: "I'm having trouble connecting to the external service right now. Please try again later.",
      sources: [],
      followUpQuestions: [],
      remainingRequests: 10
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    // Ensure database exists
    await initializeDatabase()
    
    const { message, username, history } = await request.json()
    
    if (!message || !username) {
      return NextResponse.json(
        { success: false, error: 'Message and username are required' },
        { status: 400 }
      )
    }

    // Normalize username to lowercase
    const normalizedUsername = username.trim().toLowerCase()

    // Get client IP for backend tracking
    let clientIP = request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown'
    
    // Ensure IP meets backend validation (7-45 characters)
    // Handle IPv6 localhost (::1) and other short IPs
    if (clientIP === '::1' || clientIP === '127.0.0.1' || clientIP.length < 7) {
      clientIP = '127.0.0.1'  // Use IPv4 localhost instead
    }
    
    // If still too short, use a fallback
    if (clientIP.length < 7) {
      clientIP = '192.168.1.100'  // Fallback IP that meets requirements
    }

    // Save user message to database
    const userMessage: Message = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      text: message,
      sender: 'user',
      timestamp: Date.now()
    }
    
    await saveUserMessage(normalizedUsername, userMessage)

    // Get AI response from external API
    const { text: aiResponseText, sources, followUpQuestions, remainingRequests } = await callExternalAPI(message, normalizedUsername, clientIP)
    
    // Log web search sources to terminal if present
    if (sources && sources.length > 0) {
      console.log('Web search sources returned:', JSON.stringify(sources, null, 2));
    }
    
    // Log rate limit info for monitoring
    console.log(`Chat request - User: ${normalizedUsername}, IP: ${clientIP}, Remaining: ${remainingRequests || 'unknown'}`)
    
    // Add rate limit warning if remaining requests is low
    let finalResponseText = aiResponseText
    if (remainingRequests !== undefined && remainingRequests < 5) {
      finalResponseText += '\n\n⚠️ **Warning**: You are approaching the usage limit. You have ' + remainingRequests + ' requests remaining this minute. Please slow down to avoid being blocked.'
    }

    // Save AI response to database
    const aiMessage: Message = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      text: finalResponseText,
      sender: 'ai',
      timestamp: Date.now(),
      sources: sources,
      followUpQuestions: followUpQuestions
    }
    
    await saveUserMessage(normalizedUsername, aiMessage)

    // Return streaming response
    return createStreamResponse(finalResponseText, sources, followUpQuestions)
    
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process chat message' },
      { status: 500 }
    )
  }
} 