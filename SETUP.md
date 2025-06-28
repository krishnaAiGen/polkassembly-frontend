# Setup Guide

This guide will help you set up the Polkassembly Chat Interface after cloning the repository.

## Prerequisites

- Node.js 18+ 
- npm or yarn

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

### 3. Create environment file
Create a `.env` file in the root directory and add your API configuration:

```bash
# API Configuration
# Replace with your actual API endpoint
API_BASE_URL=http://your-api-endpoint.com/query

# Examples:
# For local development: API_BASE_URL=http://localhost:8000/query
# For production: API_BASE_URL=https://your-api-domain.com/api/query
```

### 4. Run the development server
```bash
npm run dev
```

### 5. Open the application
Open [http://localhost:3000](http://localhost:3000) in your browser.

## Important Notes

- The `.env` file is not included in the repository for security reasons
- The `chat-database.json` file will be automatically created when you first use the application
- Make sure your API endpoint accepts POST requests with the structure shown below

## API Requirements

Your API should:
- Accept POST requests to the configured endpoint
- Receive JSON payload with this structure:
  ```json
  {
    "question": "How can I create proposal on Polkassembly"
  }
  ```
- Return structured response with `answer` and `sources` fields:
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
    ]
  }
  ```

For more details, see the main [README.md](./README.md) file. 