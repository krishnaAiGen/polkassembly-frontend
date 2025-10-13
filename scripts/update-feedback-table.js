#!/usr/bin/env node

// Load environment variables
require('dotenv').config()

const { Pool } = require('pg')

// Get feedback table name based on environment
function getFeedbackTableName() {
  const env = process.env.NODE_ENV || 'development'
  return env === 'production' ? 'klara_feedback_prod' : 'klara_feedback_dev'
}

async function updateFeedbackTable() {
  console.log('🔄 Updating feedback table with new column...')
  console.log('================================')
  
  if (process.env.DISABLE_POSTGRES === 'true') {
    console.log('PostgreSQL is disabled via DISABLE_POSTGRES=true')
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
      // Check if feedback_type column exists
      const columnExistsQuery = `
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_name = $1 AND column_name = 'feedback_type'
        );
      `
      
      const result = await client.query(columnExistsQuery, [tableName])
      const columnExists = result.rows[0].exists
      
      if (!columnExists) {
        console.log(`Adding feedback_type column to ${tableName}...`)
        
        const addColumnQuery = `
          ALTER TABLE ${tableName} 
          ADD COLUMN feedback_type VARCHAR(50) DEFAULT 'form_submission';
        `
        
        await client.query(addColumnQuery)
        console.log(`✅ Added feedback_type column to ${tableName}`)
      } else {
        console.log(`✅ feedback_type column already exists in ${tableName}`)
      }

      // Check if query_text column exists
      const queryColumnExistsQuery = `
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_name = $1 AND column_name = 'query_text'
        );
      `
      
      const queryResult = await client.query(queryColumnExistsQuery, [tableName])
      const queryColumnExists = queryResult.rows[0].exists
      
      if (!queryColumnExists) {
        console.log(`Adding query_text column to ${tableName}...`)
        
        const addQueryColumnQuery = `
          ALTER TABLE ${tableName} 
          ADD COLUMN query_text TEXT;
        `
        
        await client.query(addQueryColumnQuery)
        console.log(`✅ Added query_text column to ${tableName}`)
      } else {
        console.log(`✅ query_text column already exists in ${tableName}`)
      }

      // Check if response_text column exists
      const responseColumnExistsQuery = `
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_name = $1 AND column_name = 'response_text'
        );
      `
      
      const responseResult = await client.query(responseColumnExistsQuery, [tableName])
      const responseColumnExists = responseResult.rows[0].exists
      
      if (!responseColumnExists) {
        console.log(`Adding response_text column to ${tableName}...`)
        
        const addResponseColumnQuery = `
          ALTER TABLE ${tableName} 
          ADD COLUMN response_text TEXT;
        `
        
        await client.query(addResponseColumnQuery)
        console.log(`✅ Added response_text column to ${tableName}`)
      } else {
        console.log(`✅ response_text column already exists in ${tableName}`)
      }
      
      // Show updated table structure
      const structureQuery = `
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = $1 
        ORDER BY ordinal_position;
      `
      
      const structureResult = await client.query(structureQuery, [tableName])
      
      console.log(`\n📋 Updated table structure for ${tableName}:`)
      console.log('Column Name          | Data Type    | Nullable | Default')
      console.log('---------------------|--------------|----------|----------')
      structureResult.rows.forEach(row => {
        const defaultVal = row.column_default ? row.column_default.substring(0, 20) : 'NULL'
        console.log(`${row.column_name.padEnd(20)} | ${row.data_type.padEnd(12)} | ${row.is_nullable.padEnd(8)} | ${defaultVal}`)
      })
      
    } finally {
      client.release()
    }
    
    await pool.end()
    
    console.log('\n🎉 Feedback table update completed!')
    console.log('\nNow you can:')
    console.log('1. Click dislike on any AI response - it will be recorded automatically')
    console.log('2. Optionally fill out the detailed feedback form')
    console.log('3. Both actions will be stored with different feedback_type values')
    
  } catch (error) {
    console.error('❌ Error updating feedback table:', error.message)
    process.exit(1)
  }
}

updateFeedbackTable()
