#!/usr/bin/env node

/**
 * Example script to analyze exported conversation data
 * Usage: node scripts/analyze-conversations.js <exported-json-file>
 */

const fs = require('fs');
const path = require('path');

function analyzeConversations(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    process.exit(1);
  }

  console.log(`📊 Analyzing conversations from: ${filePath}`);
  
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  // Use simplified format if available, otherwise extract from full format
  const pairs = data.queryResponsePairs || 
    data.conversations?.flatMap(conv => 
      conv.queryResponsePairs?.map(pair => ({
        userId: conv.userId,
        conversationId: conv.conversationId,
        conversationTitle: conv.title,
        ...pair
      })) || []
    ) || [];

  if (pairs.length === 0) {
    console.log('⚠️  No query-response pairs found in the data');
    return;
  }

  console.log('\n📈 CONVERSATION ANALYSIS REPORT');
  console.log('=' .repeat(50));

  // Basic Statistics
  const totalPairs = pairs.length;
  const uniqueUsers = [...new Set(pairs.map(p => p.userId))];
  const uniqueConversations = [...new Set(pairs.map(p => p.conversationId))];
  
  console.log(`\n📊 BASIC STATISTICS:`);
  console.log(`   Total Query-Response Pairs: ${totalPairs}`);
  console.log(`   Unique Users: ${uniqueUsers.length}`);
  console.log(`   Unique Conversations: ${uniqueConversations.length}`);
  console.log(`   Average Pairs per User: ${(totalPairs / uniqueUsers.length).toFixed(1)}`);
  console.log(`   Average Pairs per Conversation: ${(totalPairs / uniqueConversations.length).toFixed(1)}`);

  // User Activity Analysis
  console.log(`\n👥 USER ACTIVITY:`);
  const userActivity = {};
  pairs.forEach(pair => {
    if (!userActivity[pair.userId]) {
      userActivity[pair.userId] = { pairs: 0, conversations: new Set() };
    }
    userActivity[pair.userId].pairs++;
    userActivity[pair.userId].conversations.add(pair.conversationId);
  });

  Object.entries(userActivity)
    .sort(([,a], [,b]) => b.pairs - a.pairs)
    .forEach(([userId, stats]) => {
      console.log(`   ${userId}: ${stats.pairs} pairs across ${stats.conversations.size} conversations`);
    });

  // Query Length Analysis
  console.log(`\n📝 QUERY ANALYSIS:`);
  const queryLengths = pairs.map(p => p.query.length);
  const avgQueryLength = queryLengths.reduce((sum, len) => sum + len, 0) / queryLengths.length;
  const maxQueryLength = Math.max(...queryLengths);
  const minQueryLength = Math.min(...queryLengths);
  
  console.log(`   Average Query Length: ${avgQueryLength.toFixed(1)} characters`);
  console.log(`   Shortest Query: ${minQueryLength} characters`);
  console.log(`   Longest Query: ${maxQueryLength} characters`);

  // Response Analysis
  console.log(`\n🤖 RESPONSE ANALYSIS:`);
  const responsesWithContent = pairs.filter(p => p.response && p.response.trim());
  const responseLengths = responsesWithContent.map(p => p.response.length);
  
  if (responseLengths.length > 0) {
    const avgResponseLength = responseLengths.reduce((sum, len) => sum + len, 0) / responseLengths.length;
    const maxResponseLength = Math.max(...responseLengths);
    const minResponseLength = Math.min(...responseLengths);
    
    console.log(`   Responses with Content: ${responsesWithContent.length} / ${totalPairs}`);
    console.log(`   Average Response Length: ${avgResponseLength.toFixed(1)} characters`);
    console.log(`   Shortest Response: ${minResponseLength} characters`);
    console.log(`   Longest Response: ${maxResponseLength} characters`);
  }

  // Sources Analysis
  console.log(`\n🔗 SOURCES ANALYSIS:`);
  const pairsWithSources = pairs.filter(p => p.sources && p.sources.length > 0);
  const totalSources = pairs.reduce((sum, p) => sum + (p.sources?.length || 0), 0);
  
  console.log(`   Responses with Sources: ${pairsWithSources.length} / ${totalPairs} (${(pairsWithSources.length/totalPairs*100).toFixed(1)}%)`);
  console.log(`   Total Sources Provided: ${totalSources}`);
  
  if (totalSources > 0) {
    console.log(`   Average Sources per Response: ${(totalSources / totalPairs).toFixed(1)}`);
    
    // Source type analysis
    const sourceTypes = {};
    pairs.forEach(pair => {
      pair.sources?.forEach(source => {
        const type = source.source_type || 'unknown';
        sourceTypes[type] = (sourceTypes[type] || 0) + 1;
      });
    });
    
    console.log(`   Source Types:`);
    Object.entries(sourceTypes)
      .sort(([,a], [,b]) => b - a)
      .forEach(([type, count]) => {
        console.log(`     ${type}: ${count} (${(count/totalSources*100).toFixed(1)}%)`);
      });
  }

  // Follow-up Questions Analysis
  console.log(`\n❓ FOLLOW-UP QUESTIONS:`);
  const pairsWithFollowUps = pairs.filter(p => p.followUpQuestions && p.followUpQuestions.length > 0);
  const totalFollowUps = pairs.reduce((sum, p) => sum + (p.followUpQuestions?.length || 0), 0);
  
  console.log(`   Responses with Follow-ups: ${pairsWithFollowUps.length} / ${totalPairs} (${(pairsWithFollowUps.length/totalPairs*100).toFixed(1)}%)`);
  console.log(`   Total Follow-up Questions: ${totalFollowUps}`);
  
  if (totalFollowUps > 0) {
    console.log(`   Average Follow-ups per Response: ${(totalFollowUps / totalPairs).toFixed(1)}`);
  }

  // Most Common Topics (simple keyword analysis)
  console.log(`\n🏷️  COMMON TOPICS (Top Keywords):`);
  const keywords = {};
  pairs.forEach(pair => {
    const words = pair.query.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3 && !['what', 'how', 'when', 'where', 'why', 'who', 'can', 'will', 'would', 'could', 'should', 'does', 'did', 'have', 'has', 'had', 'is', 'are', 'was', 'were', 'been', 'being', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between', 'among', 'under', 'over'].includes(word));
    
    words.forEach(word => {
      keywords[word] = (keywords[word] || 0) + 1;
    });
  });
  
  Object.entries(keywords)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .forEach(([word, count]) => {
      console.log(`   "${word}": mentioned ${count} times`);
    });

  // Time Analysis (if timestamps are available)
  const pairsWithTimestamps = pairs.filter(p => p.timestamp);
  if (pairsWithTimestamps.length > 0) {
    console.log(`\n⏰ TIME ANALYSIS:`);
    const timestamps = pairsWithTimestamps.map(p => new Date(p.timestamp));
    const earliestDate = new Date(Math.min(...timestamps));
    const latestDate = new Date(Math.max(...timestamps));
    
    console.log(`   Date Range: ${earliestDate.toLocaleDateString()} to ${latestDate.toLocaleDateString()}`);
    console.log(`   Time Span: ${Math.ceil((latestDate - earliestDate) / (1000 * 60 * 60 * 24))} days`);
    
    // Activity by hour
    const hourlyActivity = {};
    timestamps.forEach(date => {
      const hour = date.getHours();
      hourlyActivity[hour] = (hourlyActivity[hour] || 0) + 1;
    });
    
    console.log(`   Most Active Hours:`);
    Object.entries(hourlyActivity)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .forEach(([hour, count]) => {
        console.log(`     ${hour}:00 - ${parseInt(hour)+1}:00: ${count} queries`);
      });
  }

  console.log('\n✅ Analysis complete!');
}

// Main execution
const args = process.argv.slice(2);

if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
  console.log(`
📊 Conversation Analysis Script

Usage:
  node scripts/analyze-conversations.js <exported-json-file>

Examples:
  node scripts/analyze-conversations.js conversations-export-1234567890.json
  node scripts/analyze-conversations.js conversations-export-1234567890-simplified.json

This script analyzes exported conversation data and provides:
  - Basic statistics (users, conversations, pairs)
  - User activity patterns
  - Query and response analysis
  - Sources and follow-up questions usage
  - Common topics and keywords
  - Time-based activity patterns
`);
  process.exit(0);
}

const filePath = args[0];
analyzeConversations(filePath);
