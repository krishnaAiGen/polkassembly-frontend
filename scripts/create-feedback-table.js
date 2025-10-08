#!/usr/bin/env node

// Load environment variables
require('dotenv').config()

const { Pool } = require('pg')

// Get feedback table name based on environment
function getFeedbackTableName() {
  const env = process.env.NODE_ENV || 'development'
  return env === 'production' ? 'klara_feedback_prod' : 'klara_feedback_dev'
}

// Create feedback table if it doesn't exist
async function ensureFeedbackTableExists() {
  // Skip if PostgreSQL is disabled
  if (process.env.DISABLE_POSTGRES === 'true') {
    console.log('PostgreSQL feedback table creation disabled via DISABLE_POSTGRES=true')
    return
  }
  
  const pool = new Pool({
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    database: process.env.POSTGRES_DATABASE || 'polkassembly',
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || '',
    ssl: process.env.POSTGRES_SSL === 'false' ? false : { 
      rejectUnauthorized: false
    },
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  })
  
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
    
    await pool.end()
  } catch (error) {
    console.error('Error ensuring feedback table exists:', error)
    throw error
  }
}

async function createFeedbackTable() {
  console.log('🗄️  Creating feedback table...')
  console.log('================================')
  
  try {
    await ensureFeedbackTableExists()
    console.log('✅ Feedback table created successfully!')
    
    // Test the table by checking if it exists
    const pool = new Pool({
      host: process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT || '5432'),
      database: process.env.POSTGRES_DATABASE || 'polkassembly',
      user: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD || '',
      ssl: process.env.POSTGRES_SSL === 'false' ? false : { 
        rejectUnauthorized: false
      },
    })
    
    const tableName = getFeedbackTableName()
    
    const client = await pool.connect()
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = $1 
      ORDER BY ordinal_position;
    `, [tableName])
    
    console.log(`\n📋 Table structure for ${tableName}:`)
    console.log('Column Name          | Data Type    | Nullable')
    console.log('---------------------|--------------|----------')
    result.rows.forEach(row => {
      console.log(`${row.column_name.padEnd(20)} | ${row.data_type.padEnd(12)} | ${row.is_nullable}`)
    })
    
    client.release()
    await pool.end()
    
    console.log('\n🎉 Feedback table is ready to use!')
    console.log('\nYou can now:')
    console.log('1. Click dislike on any AI response')
    console.log('2. Fill out the feedback form')
    console.log('3. Data will be saved to PostgreSQL')
    
  } catch (error) {
    console.error('❌ Error creating feedback table:', error.message)
    process.exit(1)
  }
}

createFeedbackTable()
