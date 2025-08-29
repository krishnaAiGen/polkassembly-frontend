#!/usr/bin/env node

/**
 * Script to export all conversations and messages from Firestore
 * Usage: node scripts/export-conversations.js [--format json|csv] [--output filename]
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, connectFirestoreEmulator, collection, getDocs, doc, orderBy, query } = require('firebase/firestore');
const fs = require('fs');
const path = require('path');

// Load environment variables (try dotenv if available, otherwise use process.env directly)
try {
  require('dotenv').config();
} catch (e) {
  // dotenv not installed, use environment variables directly
  console.log('📝 Note: Install dotenv for .env file support: npm install dotenv');
}

// Validate required environment variables
const requiredEnvVars = [
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingVars.forEach(varName => console.error(`   - ${varName}`));
  console.error('\nPlease check your .env file for Firebase configuration.');
  process.exit(1);
}

// Initialize Firebase using client SDK (same as your frontend)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Command line arguments
const args = process.argv.slice(2);
const formatIndex = args.indexOf('--format');
const outputIndex = args.indexOf('--output');

const format = formatIndex !== -1 ? args[formatIndex + 1] : 'json';
const outputFile = outputIndex !== -1 ? args[outputIndex + 1] : `conversations-export-${Date.now()}`;

async function getAllConversations() {
  console.log('🔄 Fetching all conversations...');
  
  try {
    // Get all users
    const usersSnapshot = await getDocs(collection(db, 'chats'));
    const allConversations = [];
    
    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      const userData = userDoc.data();
      
      console.log(`📂 Processing user: ${userId}`);
      
      // Get all messages for this user (stored directly under user, not in conversations)
      const messagesQuery = query(
        collection(db, 'chats', userId, 'messages'),
        orderBy('timestamp', 'asc')
      );
      const messagesSnapshot = await getDocs(messagesQuery);
      
      if (messagesSnapshot.docs.length === 0) {
        console.log(`  ⚠️  No messages found for user ${userId}`);
        continue;
      }
      
      console.log(`  📨 Found ${messagesSnapshot.docs.length} messages`);
      
      const messages = [];
      const queryResponsePairs = [];
      let currentQuery = null;
      
      messagesSnapshot.docs.forEach(messageDoc => {
        const messageData = messageDoc.data();
        messages.push({
          id: messageDoc.id,
          ...messageData,
          timestamp: messageData.timestamp?.toDate?.() || messageData.timestamp
        });
        
        // Pair queries with responses
        if (messageData.sender === 'user') {
          currentQuery = {
            query: messageData.text,
            timestamp: messageData.timestamp?.toDate?.() || messageData.timestamp,
            response: null,
            sources: [],
            followUpQuestions: []
          };
        } else if (messageData.sender === 'ai' && currentQuery) {
          currentQuery.response = messageData.text;
          currentQuery.sources = messageData.sources || [];
          currentQuery.followUpQuestions = messageData.followUpQuestions || [];
          queryResponsePairs.push(currentQuery);
          currentQuery = null;
        }
      });
      
      // Create a single "conversation" per user (since messages are stored directly under user)
      allConversations.push({
        userId,
        conversationId: 'main', // Single conversation per user
        title: `${userId}'s Chat History`,
        createdAt: userData.createdAt?.toDate?.() || userData.createdAt,
        lastActive: userData.lastActive?.toDate?.() || userData.lastActive,
        messageCount: userData.messageCount || messages.length,
        messages,
        queryResponsePairs
      });
      
      console.log(`  ✅ Found ${messages.length} messages, ${queryResponsePairs.length} Q&A pairs`);
    }
    
    const totalMessages = allConversations.reduce((sum, conv) => sum + conv.messages.length, 0);
    const totalPairs = allConversations.reduce((sum, conv) => sum + conv.queryResponsePairs.length, 0);
    
    console.log(`✅ Found ${allConversations.length} users with messages (${totalMessages} total messages, ${totalPairs} Q&A pairs)`);
    return allConversations;
    
  } catch (error) {
    console.error('❌ Error fetching conversations:', error);
    throw error;
  }
}

function exportToJSON(conversations, filename) {
  const exportData = {
    exportedAt: new Date().toISOString(),
    totalConversations: conversations.length,
    totalUsers: [...new Set(conversations.map(c => c.userId))].length,
    totalMessages: conversations.reduce((sum, c) => sum + c.messages.length, 0),
    totalQueryResponsePairs: conversations.reduce((sum, c) => sum + c.queryResponsePairs.length, 0),
    conversations
  };
  
  const filePath = `${filename}.json`;
  fs.writeFileSync(filePath, JSON.stringify(exportData, null, 2));
  console.log(`📄 Exported to JSON: ${filePath}`);
  
  // Also create a simplified version with just query-response pairs
  const simplifiedData = {
    exportedAt: new Date().toISOString(),
    totalPairs: exportData.totalQueryResponsePairs,
    queryResponsePairs: conversations.flatMap(conv => 
      conv.queryResponsePairs.map(pair => ({
        userId: conv.userId,
        conversationId: conv.conversationId,
        conversationTitle: conv.title,
        ...pair
      }))
    )
  };
  
  const simplifiedPath = `${filename}-simplified.json`;
  fs.writeFileSync(simplifiedPath, JSON.stringify(simplifiedData, null, 2));
  console.log(`📄 Exported simplified version: ${simplifiedPath}`);
}

function exportToCSV(conversations, filename) {
  const csvRows = [];
  
  // CSV Headers
  csvRows.push([
    'User ID',
    'Conversation ID',
    'Conversation Title',
    'Query',
    'Response',
    'Sources Count',
    'Follow-up Questions Count',
    'Timestamp',
    'Sources (JSON)',
    'Follow-up Questions (JSON)'
  ].join(','));
  
  // CSV Data
  conversations.forEach(conv => {
    conv.queryResponsePairs.forEach(pair => {
      csvRows.push([
        `"${conv.userId}"`,
        `"${conv.conversationId}"`,
        `"${conv.title.replace(/"/g, '""')}"`,
        `"${pair.query.replace(/"/g, '""')}"`,
        `"${pair.response ? pair.response.replace(/"/g, '""') : ''}"`,
        pair.sources.length,
        pair.followUpQuestions.length,
        pair.timestamp ? new Date(pair.timestamp).toISOString() : '',
        `"${JSON.stringify(pair.sources).replace(/"/g, '""')}"`,
        `"${JSON.stringify(pair.followUpQuestions).replace(/"/g, '""')}"`
      ].join(','));
    });
  });
  
  const filePath = `${filename}.csv`;
  fs.writeFileSync(filePath, csvRows.join('\n'));
  console.log(`📊 Exported to CSV: ${filePath}`);
}

function printSummary(conversations) {
  const totalUsers = [...new Set(conversations.map(c => c.userId))].length;
  const totalMessages = conversations.reduce((sum, c) => sum + c.messages.length, 0);
  const totalPairs = conversations.reduce((sum, c) => sum + c.queryResponsePairs.length, 0);
  
  console.log('\n📊 EXPORT SUMMARY:');
  console.log(`👥 Total Users: ${totalUsers}`);
  console.log(`💬 Total Conversations: ${conversations.length}`);
  console.log(`📝 Total Messages: ${totalMessages}`);
  console.log(`🔄 Total Query-Response Pairs: ${totalPairs}`);
  
  // User breakdown
  console.log('\n👥 USER BREAKDOWN:');
  const userStats = {};
  conversations.forEach(conv => {
    if (!userStats[conv.userId]) {
      userStats[conv.userId] = { conversations: 0, pairs: 0 };
    }
    userStats[conv.userId].conversations++;
    userStats[conv.userId].pairs += conv.queryResponsePairs.length;
  });
  
  Object.entries(userStats).forEach(([userId, stats]) => {
    console.log(`  ${userId}: ${stats.conversations} conversations, ${stats.pairs} Q&A pairs`);
  });
}

async function main() {
  try {
    console.log('🚀 Starting conversation export...');
    console.log(`📋 Format: ${format}`);
    console.log(`📁 Output file: ${outputFile}`);
    
    const conversations = await getAllConversations();
    
    if (conversations.length === 0) {
      console.log('⚠️  No conversations found');
      return;
    }
    
    // Export based on format
    if (format === 'csv') {
      exportToCSV(conversations, outputFile);
    } else {
      exportToJSON(conversations, outputFile);
    }
    
    printSummary(conversations);
    
    console.log('\n✅ Export completed successfully!');
    
  } catch (error) {
    console.error('❌ Export failed:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Handle command line help
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
📋 Conversation Export Script

Usage:
  node scripts/export-conversations.js [options]

Options:
  --format json|csv    Export format (default: json)
  --output filename    Output filename (default: conversations-export-{timestamp})
  --help, -h          Show this help message

Examples:
  node scripts/export-conversations.js
  node scripts/export-conversations.js --format csv --output my-export
  node scripts/export-conversations.js --format json --output backup-$(date +%Y%m%d)

Output:
  JSON format creates two files:
    - {filename}.json: Complete export with all data
    - {filename}-simplified.json: Just query-response pairs
  
  CSV format creates one file:
    - {filename}.csv: Query-response pairs in CSV format
`);
  process.exit(0);
}

main();
