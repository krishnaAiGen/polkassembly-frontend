import { NextRequest, NextResponse } from 'next/server'
import { initializeDatabase, getConversationMessages } from '@/lib/database'
import { ensureTableExists } from '@/lib/postgres'

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    // Test database connections
    await initializeDatabase()
    
    // Test PostgreSQL (optional)
    let postgresStatus = 'disabled'
    try {
      if (process.env.DISABLE_POSTGRES !== 'true') {
        await ensureTableExists()
        postgresStatus = 'connected'
      }
    } catch (pgError) {
      console.warn('PostgreSQL health check failed:', pgError.message)
      postgresStatus = 'failed'
    }
    
    // Test external API (optional)
    let apiStatus = 'not_configured'
    let apiResponseTime = 0
    const apiUrl = process.env.API_BASE_URL
    const apiToken = process.env.POLKASSEMBLY_AI_TOKEN
    
    if (apiUrl && apiUrl !== 'https://api.example.com' && apiToken) {
      try {
        const apiStartTime = Date.now()
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            question: "health check",
            user_id: "system",
            client_ip: "127.0.0.1",
            max_chunks: 1,
            include_sources: false
          }),
          signal: AbortSignal.timeout(5000) // 5 second timeout
        })
        
        apiResponseTime = Date.now() - apiStartTime
        
        if (response.ok) {
          apiStatus = 'connected'
        } else {
          apiStatus = `failed (${response.status})`
        }
      } catch (apiError) {
        console.warn('External API health check error:', apiError.message)
        apiStatus = `error (${apiError.message})`
      }
    } else if (!apiToken) {
      apiStatus = 'missing_token'
    }
    
    const responseTime = Date.now() - startTime
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      performance: {
        acceptable: responseTime < 1000 ? '✅' : '⚠️',
        avgResponseTime: `${responseTime}ms`
      },
      services: {
        firestore: 'connected',
        postgresql: postgresStatus,
        externalAPI: {
          status: apiStatus,
          responseTime: apiResponseTime > 0 ? `${apiResponseTime}ms` : 'n/a',
          hasToken: !!apiToken,
          hasUrl: !!apiUrl && apiUrl !== 'https://api.example.com'
        }
      },
      environment: {
        nodeEnv: process.env.NODE_ENV || 'development',
        conversationHistoryLimit: process.env.CONVERSATION_HISTORY_LIMIT || '5',
        postgresDisabled: process.env.DISABLE_POSTGRES === 'true'
      }
    })
    
  } catch (error) {
    console.error('Health check failed:', error)
    
    return NextResponse.json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
