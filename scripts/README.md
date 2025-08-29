# Conversation Export Script

This script exports all conversations and messages from your Firestore database, organizing them into query-response pairs.

## Setup

### 1. Environment Variables

The script uses your existing Firebase configuration from your `.env` file. Make sure you have these variables (which you should already have for your frontend):

```bash
# Firebase Configuration (same as your frontend)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

✅ **No additional setup needed!** The script uses the same Firebase client configuration as your frontend.

### 2. Install Dependencies

```bash
npm install firebase dotenv
```

## Usage

### Basic Export (JSON format)
```bash
npm run export-conversations
```

### Export to CSV
```bash
npm run export-conversations -- --format csv
```

### Custom Output Filename
```bash
npm run export-conversations -- --output my-backup-2024
```

### Combined Options
```bash
npm run export-conversations -- --format csv --output conversations-backup
```

### Direct Node.js Usage
```bash
node scripts/export-conversations.js --format json --output backup-$(date +%Y%m%d)
```

## Output Formats

### JSON Format
Creates two files:
- `{filename}.json`: Complete export with all conversation metadata
- `{filename}-simplified.json`: Just query-response pairs

### CSV Format
Creates one file:
- `{filename}.csv`: Query-response pairs in spreadsheet format

## Data Structure

### Complete JSON Export
```json
{
  "exportedAt": "2024-01-15T10:30:00.000Z",
  "totalConversations": 25,
  "totalUsers": 5,
  "totalMessages": 150,
  "totalQueryResponsePairs": 75,
  "conversations": [
    {
      "userId": "krishna",
      "conversationId": "conv_123",
      "title": "Polkadot Governance Questions",
      "createdAt": "2024-01-15T09:00:00.000Z",
      "lastActive": "2024-01-15T10:30:00.000Z",
      "messageCount": 6,
      "messages": [...],
      "queryResponsePairs": [
        {
          "query": "How do I create a proposal?",
          "response": "To create a proposal on Polkassembly...",
          "sources": [...],
          "followUpQuestions": [...],
          "timestamp": "2024-01-15T09:15:00.000Z"
        }
      ]
    }
  ]
}
```

### Simplified JSON Export
```json
{
  "exportedAt": "2024-01-15T10:30:00.000Z",
  "totalPairs": 75,
  "queryResponsePairs": [
    {
      "userId": "krishna",
      "conversationId": "conv_123",
      "conversationTitle": "Polkadot Governance Questions",
      "query": "How do I create a proposal?",
      "response": "To create a proposal on Polkassembly...",
      "sources": [...],
      "followUpQuestions": [...],
      "timestamp": "2024-01-15T09:15:00.000Z"
    }
  ]
}
```

### CSV Export
| User ID | Conversation ID | Conversation Title | Query | Response | Sources Count | Follow-up Questions Count | Timestamp | Sources (JSON) | Follow-up Questions (JSON) |
|---------|-----------------|-------------------|-------|----------|---------------|---------------------------|-----------|----------------|---------------------------|
| krishna | conv_123 | Polkadot Governance | How do I create a proposal? | To create a proposal... | 3 | 2 | 2024-01-15T09:15:00.000Z | [...] | [...] |

## Script Features

✅ **Complete Data Export**: All conversations, messages, and metadata  
✅ **Query-Response Pairing**: Automatically pairs user queries with AI responses  
✅ **Multiple Formats**: JSON and CSV export options  
✅ **Progress Tracking**: Real-time progress updates during export  
✅ **Summary Statistics**: User breakdown and conversation counts  
✅ **Error Handling**: Graceful error handling and reporting  
✅ **Flexible Output**: Custom filenames and formats  

## Use Cases

- **Data Analysis**: Analyze user queries and response quality
- **Backup**: Create backups of conversation data
- **Training Data**: Export for AI model training or fine-tuning
- **Reporting**: Generate reports on user engagement
- **Migration**: Move data to other systems
- **Research**: Study conversation patterns and user behavior

## Troubleshooting

### "Missing required environment variables"
Make sure these variables are in your `.env` file:
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`

### "Permission denied"
Ensure your Firebase project allows read access to Firestore. Check your Firestore security rules.

### "No conversations found"
Check that your Firestore database has data in the expected structure:
```
chats/{userId}/conversations/{conversationId}/messages/{messageId}
```

### Memory issues with large datasets
For very large datasets (>10k conversations), consider:
1. Running the script on a machine with more RAM
2. Modifying the script to process users in batches
3. Using the CSV format which is more memory-efficient

## Security Notes

- Never commit `firebase-service-account.json` to version control
- Store service account keys securely
- Use environment variables for production deployments
- Regularly rotate service account keys

## Support

If you encounter issues:
1. Check the Firebase Console for database structure
2. Verify service account permissions
3. Check the console output for detailed error messages
4. Ensure all dependencies are installed correctly
