# Setup Guide

This guide will help you set up the Polkassembly Chat Interface with Firestore integration after cloning the repository.

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Firebase project (for Firestore database)

## Installation Steps

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd polkassembly-frontend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use existing one
3. Enable Firestore Database:
   - Go to Firestore Database
   - Click "Create database"
   - Choose "Start in test mode" for development
   - Select your preferred location
4. Get your Firebase configuration:
   - Go to Project Settings (gear icon)
   - Scroll down to "Your apps" section
   - Click on "Web" app or create one
   - Copy the config object

### 4. Create environment file
Create a `.env` file in the root directory and add your configuration:

```bash
# API Configuration
# Replace with your actual API endpoint
API_BASE_URL=http://your-api-endpoint.com/query

# Firebase Configuration (required for Firestore)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id_here

# Examples:
# For local development: API_BASE_URL=http://localhost:8000/query
# For production: API_BASE_URL=https://your-api-domain.com/api/query
```

### 5. Run the development server
```bash
npm run dev
```

### 6. Open the application
Open [http://localhost:3000](http://localhost:3000) in your browser.

## New Features

### Firestore Integration
- Chat messages are now stored in Firestore instead of local JSON files
- Better scalability and reliability
- Real-time synchronization capabilities

### Smart Caching System
- **Initial Load**: Fetches chat history from Firestore once per session
- **In-Memory Cache**: Fast access to recently accessed chats
- **localStorage Persistence**: Chat history persists across browser sessions
- **Cache Expiry**: Automatic refresh after 5 minutes
- **Optimized Performance**: Reduces Firestore reads and improves response time

### Cache Behavior
1. **First login**: Loads from Firestore → saves to cache
2. **Subsequent access**: Uses cache if valid (< 5 minutes old)
3. **New messages**: Updates both Firestore and cache immediately
4. **Browser refresh**: Uses localStorage cache if available
5. **Cache expiry**: Automatically refreshes from Firestore

## Important Notes

- The `.env` file is not included in the repository for security reasons
- Firebase security rules should be configured for production use
- Chat data is automatically cached for better performance
- Cache can be cleared manually via browser developer tools

## API Requirements

Your API should:
- Accept POST requests to the configured endpoint
- Receive JSON payload with this structure:
  ```json
  {
    "question": "How can I create proposal on Polkassembly"
  }
  ```
- Return structured response with all available fields:
  ```json
  {
    "answer": "Your response text here...",
    "sources": [
      {
        "title": "Source Title",
        "url": "https://example.com",
        "source_type": "polkadot_wiki",
        "similarity_score": 0.85
      }
    ],
    "follow_up_questions": [
      "How do I vote on proposals?",
      "What are the proposal requirements?"
    ],
    "confidence": 0.85,
    "context_used": true,
    "model_used": "gpt-4",
    "chunks_used": 5,
    "processing_time_ms": 1250,
    "timestamp": "2024-01-15T10:30:45.123Z",
    "search_method": "hybrid_search"
  }
  ```

## Troubleshooting

### Firebase Issues
- Ensure all Firebase environment variables are correctly set
- Check that Firestore is enabled in your Firebase project
- Verify your Firebase security rules allow read/write operations

### Cache Issues
- Clear browser localStorage if you encounter cache-related problems
- Check browser console for cache-related error messages
- Cache statistics can be viewed in browser developer tools

For more details, see the main [README.md](./README.md) file. 