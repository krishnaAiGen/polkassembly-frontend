import { NextRequest, NextResponse } from 'next/server'
import { testConnection, getRecentLogs, ensureTableExists } from '@/lib/postgres'

export async function GET(request: NextRequest) {
  try {
    // Test database connection
    const isConnected = await testConnection()
    
    if (!isConnected) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'PostgreSQL connection failed',
          message: 'Check your database configuration in .env file'
        },
        { status: 500 }
      )
    }

    // Ensure table exists
    await ensureTableExists()

    // Get recent logs (limit to 5 for testing)
    const recentLogs = await getRecentLogs(5)

    return NextResponse.json({
      success: true,
      connection: 'PostgreSQL connected successfully',
      tableStatus: 'Table exists and ready',
      recentLogs: recentLogs.map(log => ({
        id: log.id,
        timestamp: log.timestamp,
        user_id: log.user_id,
        query_preview: log.query?.substring(0, 100) + (log.query?.length > 100 ? '...' : ''),
        response_preview: log.response?.substring(0, 100) + (log.response?.length > 100 ? '...' : ''),
        status: log.status,
        response_time_ms: log.response_time_ms
      })),
      totalLogs: recentLogs.length
    })

  } catch (error) {
    console.error('PostgreSQL test error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'PostgreSQL test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
