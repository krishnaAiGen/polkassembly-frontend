import { NextRequest, NextResponse } from 'next/server'
import { initializeDatabase, saveUserMessage } from '@/lib/database'
import { Message, BackendApiResponse } from '@/types/chat'

// Function to create streaming response
function createStreamResponse(text: string, sources?: any[]) {
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

// Function to filter sources based on web search settings
function filterSources(sources: any[]): any[] {
  const webSearchEnabled = process.env.WEB_SEARCH_ENABLED === 'true'
  
  if (!webSearchEnabled) {
    // Filter out web search results
    return sources.filter(source => 
      source.source_type !== 'web_search' && 
      source.source_type !== 'web' &&
      source.source_type !== 'search'
    )
  }
  
  return sources
}

// Function to modify response text if web search results were filtered
function modifyResponseForWebSearch(text: string, originalSources: any[], filteredSources: any[]): string {
  const webSearchEnabled = process.env.WEB_SEARCH_ENABLED === 'true'
  
  if (!webSearchEnabled && originalSources.length > filteredSources.length) {
    // Some sources were filtered out (likely web search results)
    const webSearchCount = originalSources.length - filteredSources.length
    
    if (filteredSources.length === 0) {
      // All sources were web search, replace with custom message
      return "I couldn't find specific documentation or reliable sources for that query in our knowledge base. You might want to check the official Polkadot documentation or Polkassembly platform directly for the most up-to-date information."
    } else {
      // Some sources remain, just add a note
      return text + "\n\nNote: Some additional web search results were filtered out to focus on verified sources."
    }
  }
  
  return text
}

// Function to call external API
async function callExternalAPI(message: string): Promise<{ text: string, sources?: any[] }> {
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
    
    return { text, sources: mockSources }
  }

  try {
    // Call your configured API with the correct format
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add any required headers for your API
      },
      body: JSON.stringify({
        question: message  // Changed from "message" to "question"
      })
    })

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`)
    }

    const data: BackendApiResponse = await response.json()
    const originalSources = data.sources || []
    
    // Filter sources based on web search settings
    const filteredSources = filterSources(originalSources)
    
    // Modify response text if needed
    const responseText = data.answer || "I received your message but couldn't generate a proper response."
    const modifiedText = modifyResponseForWebSearch(responseText, originalSources, filteredSources)
    
    return { 
      text: modifiedText,
      sources: filteredSources
    }
    
  } catch (error) {
    console.error('External API error:', error)
    return { 
      text: "I'm having trouble connecting to the external service right now. Please try again later.",
      sources: []
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

    // Save user message to database
    const userMessage: Message = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      text: message,
      sender: 'user',
      timestamp: Date.now()
    }
    
    await saveUserMessage(normalizedUsername, userMessage)

    // Get AI response from external API
    const { text: aiResponseText, sources } = await callExternalAPI(message)
    
    // Save AI response to database
    const aiMessage: Message = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      text: aiResponseText,
      sender: 'ai',
      timestamp: Date.now(),
      sources: sources
    }
    
    await saveUserMessage(normalizedUsername, aiMessage)

    // Return streaming response
    return createStreamResponse(aiResponseText, sources)
    
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process chat message' },
      { status: 500 }
    )
  }
} 