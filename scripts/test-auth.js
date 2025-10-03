#!/usr/bin/env node

const https = require('https')
const http = require('http')

// Load environment variables
require('dotenv').config()

const API_URL = process.env.API_BASE_URL || 'http://localhost:8000'
const API_TOKEN = process.env.POLKASSEMBLY_AI_TOKEN
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000'

console.log('🔐 Testing Authentication Setup')
console.log('================================')

// Test 1: Check if token is configured
console.log('\n1. Checking environment variables:')
console.log(`   API_BASE_URL: ${API_URL}`)
console.log(`   POLKASSEMBLY_AI_TOKEN: ${API_TOKEN ? '✅ Configured' : '❌ Missing'}`)

if (!API_TOKEN) {
  console.log('\n❌ POLKASSEMBLY_AI_TOKEN is not set in your .env file')
  console.log('   Please add: POLKASSEMBLY_AI_TOKEN=your_token_here')
  process.exit(1)
}

// Test 2: Test direct backend API call
console.log('\n2. Testing direct backend API call:')
testBackendAPI()

// Test 3: Test frontend health endpoint
console.log('\n3. Testing frontend health endpoint:')
testFrontendHealth()

function testBackendAPI() {
  const isHttps = API_URL.startsWith('https')
  const client = isHttps ? https : http
  
  const requestData = JSON.stringify({
    question: "What is Polkadot governance?",
    user_id: "test_user",
    client_ip: "127.0.0.1",
    max_chunks: 1,
    include_sources: false
  })

  const url = new URL(API_URL)
  const options = {
    hostname: url.hostname,
    port: url.port || (isHttps ? 443 : 80),
    path: url.pathname,
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(requestData)
    }
  }

  const req = client.request(options, (res) => {
    console.log(`   Status: ${res.statusCode}`)
    console.log(`   Headers: ${JSON.stringify(res.headers, null, 2)}`)
    
    let data = ''
    res.on('data', (chunk) => {
      data += chunk
    })
    
    res.on('end', () => {
      if (res.statusCode === 200) {
        console.log('   ✅ Backend API authentication successful')
        try {
          const response = JSON.parse(data)
          console.log(`   Response preview: ${response.answer?.substring(0, 100)}...`)
        } catch (e) {
          console.log('   Response (raw):', data.substring(0, 200))
        }
      } else {
        console.log('   ❌ Backend API authentication failed')
        console.log('   Response:', data)
      }
    })
  })

  req.on('error', (error) => {
    console.log('   ❌ Backend API request failed:', error.message)
  })

  req.setTimeout(10000, () => {
    req.destroy()
    console.log('   ⏰ Backend API request timeout')
  })

  req.write(requestData)
  req.end()
}

function testFrontendHealth() {
  const isHttps = FRONTEND_URL.startsWith('https')
  const client = isHttps ? https : http
  
  const req = client.get(`${FRONTEND_URL}/api/health`, (res) => {
    let data = ''
    res.on('data', (chunk) => {
      data += chunk
    })
    
    res.on('end', () => {
      console.log(`   Status: ${res.statusCode}`)
      
      if (res.statusCode === 200) {
        try {
          const health = JSON.parse(data)
          console.log('   ✅ Frontend health check successful')
          console.log(`   Services:`)
          console.log(`     - Firestore: ${health.services?.firestore || 'unknown'}`)
          console.log(`     - PostgreSQL: ${health.services?.postgresql || 'unknown'}`)
          console.log(`     - External API: ${health.services?.externalAPI?.status || 'unknown'}`)
          console.log(`     - Has Token: ${health.services?.externalAPI?.hasToken ? '✅' : '❌'}`)
          console.log(`     - Response Time: ${health.responseTime}`)
        } catch (e) {
          console.log('   Response:', data)
        }
      } else {
        console.log('   ❌ Frontend health check failed')
        console.log('   Response:', data)
      }
    })
  })
  
  req.on('error', (error) => {
    console.log('   ❌ Frontend health check failed:', error.message)
  })
  
  req.setTimeout(10000, () => {
    req.destroy()
    console.log('   ⏰ Frontend health check timeout')
  })
}
