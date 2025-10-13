import { Pool, PoolClient } from 'pg'

// PostgreSQL connection pool
let pool: Pool | null = null

// Initialize PostgreSQL connection pool
function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      host: process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT || '5432'),
      database: process.env.POSTGRES_DATABASE || 'polkassembly',
      user: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD || '',
      ssl: process.env.POSTGRES_SSL === 'false' ? false : { 
        rejectUnauthorized: false
      },
      max: 20, // Maximum number of clients in the pool
      idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
      connectionTimeoutMillis: 10000, // Increased timeout for remote connections
    })
  }
  return pool
}

// Get table name based on environment
function getTableName(): string {
  const env = process.env.NODE_ENV || 'development'
  return env === 'production' ? 'klara_qa_prod' : 'klara_qa_dev'
}

// Get feedback table name based on environment
function getFeedbackTableName(): string {
  const env = process.env.NODE_ENV || 'development'
  return env === 'production' ? 'klara_feedback_prod' : 'klara_feedback_dev'
}

// Check if table exists and create if it doesn't
export async function ensureTableExists(): Promise<void> {
  // Skip if PostgreSQL is disabled
  if (process.env.DISABLE_POSTGRES === 'true') {
    console.log('PostgreSQL logging disabled via DISABLE_POSTGRES=true')
    return
  }
  const pool = getPool()
  const tableName = getTableName()
  
  try {
    const client: PoolClient = await pool.connect()
    
    try {
      // Check if table exists
      const checkTableQuery = `
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        );
      `
      
      const result = await client.query(checkTableQuery, [tableName])
      const tableExists = result.rows[0].exists
      
      if (!tableExists) {
        console.log(`Creating table: ${tableName}`)
        
        // Create table with required columns
        const createTableQuery = `
          CREATE TABLE ${tableName} (
            id SERIAL PRIMARY KEY,
            timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            query TEXT NOT NULL,
            response TEXT NOT NULL,
            status VARCHAR(50) DEFAULT 'success',
            user_id VARCHAR(255),
            conversation_id VARCHAR(255),
            response_time_ms INTEGER,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );
        `
        
        await client.query(createTableQuery)
        
        // Create indexes for better performance
        const createIndexes = [
          `CREATE INDEX idx_${tableName}_timestamp ON ${tableName} (timestamp);`,
          `CREATE INDEX idx_${tableName}_user_id ON ${tableName} (user_id);`,
          `CREATE INDEX idx_${tableName}_conversation_id ON ${tableName} (conversation_id);`,
          `CREATE INDEX idx_${tableName}_status ON ${tableName} (status);`
        ]
        
        for (const indexQuery of createIndexes) {
          await client.query(indexQuery)
        }
        
        console.log(`Table ${tableName} created successfully with indexes`)
      } else {
        console.log(`Table ${tableName} already exists`)
      }
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error ensuring table exists:', error)
    throw error
  }
}

// Create feedback table if it doesn't exist
export async function ensureFeedbackTableExists(): Promise<void> {
  // Skip if PostgreSQL is disabled
  if (process.env.DISABLE_POSTGRES === 'true') {
    console.log('PostgreSQL feedback table creation disabled via DISABLE_POSTGRES=true')
    return
  }
  
  const pool = getPool()
  const tableName = getFeedbackTableName()
  
  try {
    const client = await pool.connect()
    
    try {
      // Check if table exists
      const tableExistsQuery = `
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        );
      `
      
      const result = await client.query(tableExistsQuery, [tableName])
      const tableExists = result.rows[0].exists
      
      if (!tableExists) {
        console.log(`Creating table: ${tableName}`)
        
        const createTableQuery = `
          CREATE TABLE ${tableName} (
            id SERIAL PRIMARY KEY,
            first_name VARCHAR(100) NOT NULL,
            last_name VARCHAR(100) NOT NULL,
            email VARCHAR(255) NOT NULL,
            company VARCHAR(255),
            feedback_text TEXT,
            user_id VARCHAR(100),
            conversation_id VARCHAR(100),
            message_id VARCHAR(100),
            rating INTEGER CHECK (rating >= 1 AND rating <= 5),
            feedback_type VARCHAR(50) DEFAULT 'form_submission',
            query_text TEXT,
            response_text TEXT,
            timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );
        `
        
        await client.query(createTableQuery)
        
        // Create indexes for better performance
        const createIndexes = [
          `CREATE INDEX idx_${tableName}_timestamp ON ${tableName} (timestamp);`,
          `CREATE INDEX idx_${tableName}_email ON ${tableName} (email);`,
          `CREATE INDEX idx_${tableName}_user_id ON ${tableName} (user_id);`,
          `CREATE INDEX idx_${tableName}_conversation_id ON ${tableName} (conversation_id);`,
          `CREATE INDEX idx_${tableName}_rating ON ${tableName} (rating);`
        ]
        
        for (const indexQuery of createIndexes) {
          await client.query(indexQuery)
        }
        
        console.log(`Feedback table ${tableName} created successfully with indexes`)
      } else {
        console.log(`Feedback table ${tableName} already exists`)
      }
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error ensuring feedback table exists:', error)
    throw error
  }
}

// Log query-response pair to PostgreSQL
export async function logQueryResponse(data: {
  query: string
  response: string
  status?: string
  userId?: string
  conversationId?: string
  responseTimeMs?: number
}): Promise<void> {
  // Skip if PostgreSQL is disabled
  if (process.env.DISABLE_POSTGRES === 'true') {
    return
  }
  const pool = getPool()
  const tableName = getTableName()
  
  try {
    const client: PoolClient = await pool.connect()
    
    try {
      const insertQuery = `
        INSERT INTO ${tableName} (
          query, 
          response, 
          status, 
          user_id, 
          conversation_id, 
          response_time_ms,
          timestamp
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, timestamp;
      `
      
      const values = [
        data.query,
        data.response,
        data.status || 'success',
        data.userId || null,
        data.conversationId || null,
        data.responseTimeMs || null,
        new Date()
      ]
      
      const result = await client.query(insertQuery, values)
      const insertedRow = result.rows[0]
      
      console.log(`Logged Q&A to ${tableName} - ID: ${insertedRow.id}, Timestamp: ${insertedRow.timestamp}`)
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error logging query-response to PostgreSQL:', error)
    // Don't throw error to avoid breaking the chat flow
    // Just log the error and continue
  }
}

// Save feedback data to PostgreSQL
export async function saveFeedback(data: {
  firstName: string
  lastName: string
  email: string
  company?: string
  feedbackText?: string
  userId?: string
  conversationId?: string
  messageId?: string
  rating?: number
  feedbackType?: string
  queryText?: string
  responseText?: string
}): Promise<void> {
  if (process.env.DISABLE_POSTGRES === 'true') {
    return
  }
  
  const pool = getPool()
  const tableName = getFeedbackTableName()
  
  try {
    const client = await pool.connect()
    
    try {
      const insertQuery = `
        INSERT INTO ${tableName} (
          first_name, last_name, email, company, feedback_text, 
          user_id, conversation_id, message_id, rating, feedback_type, 
          query_text, response_text, timestamp
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING id, timestamp;
      `
      
      const values = [
        data.firstName,
        data.lastName,
        data.email,
        data.company || null,
        data.feedbackText || null,
        data.userId || null,
        data.conversationId || null,
        data.messageId || null,
        data.rating || null,
        data.feedbackType || 'form_submission',
        data.queryText || null,
        data.responseText || null,
        new Date()
      ]
      
      const result = await client.query(insertQuery, values)
      const insertedRow = result.rows[0]
      
      console.log(`Feedback saved to ${tableName} - ID: ${insertedRow.id}, Timestamp: ${insertedRow.timestamp}`)
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error saving feedback to PostgreSQL:', error)
    throw error // Throw error for feedback form to handle
  }
}

// Get recent query-response logs (for debugging/analytics)
export async function getRecentLogs(limit: number = 10): Promise<any[]> {
  const pool = getPool()
  const tableName = getTableName()
  
  try {
    const client: PoolClient = await pool.connect()
    
    try {
      const selectQuery = `
        SELECT 
          id,
          timestamp,
          query,
          response,
          status,
          user_id,
          conversation_id,
          response_time_ms,
          created_at
        FROM ${tableName}
        ORDER BY timestamp DESC
        LIMIT $1;
      `
      
      const result = await client.query(selectQuery, [limit])
      return result.rows
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error fetching recent logs:', error)
    return []
  }
}

// Close the connection pool (useful for cleanup)
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end()
    pool = null
    console.log('PostgreSQL connection pool closed')
  }
}

// Test database connection
export async function testConnection(): Promise<boolean> {
  try {
    const pool = getPool()
    const client = await pool.connect()
    
    try {
      const result = await client.query('SELECT NOW() as current_time')
      console.log('PostgreSQL connection successful:', result.rows[0].current_time)
      return true
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('PostgreSQL connection failed:', error)
    return false
  }
}
