# Klara - AI-Powered Governance Assistant

Klara is an AI chatbot built for the Polkadot and Kusama governance ecosystem, integrated with Polkassembly. It helps users query on-chain data, explore governance insights, and understand the entire proposal and voting process—all in natural language.

## Features

- 🧠 **AI-Powered Governance Assistant**: Natural language queries about Polkadot/Kusama governance
- 🔐 **Web3 Authentication**: Secure wallet-based authentication (Polkadot.js, SubWallet, Talisman)
- 💬 **Real-time Chat**: Token-by-token streaming responses with conversation management
- 🗳️ **Governance Data Querying**: Access proposals, referenda, voting data, and treasury information
- 📊 **Voting Analysis**: Deep analysis of voter behavior and governance participation
- 💾 **Dual Database Support**: Firestore for conversations + PostgreSQL for analytics
- 🎨 **Beautiful UI**: Polkassembly-inspired design with responsive layout
- ☁️ **Production Ready**: Optimized for serverless deployment

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Firebase project (for Firestore)
- PostgreSQL database (optional, for analytics)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd polkassembly-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Copy the example env file
cp .env.example .env.local

# Edit .env.local with your configuration
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Configuration

### Environment Variables

Create a `.env.local` file with the following variables:

```bash
# API Configuration
API_BASE_URL=https://your-klara-api-endpoint.com
POLKASSEMBLY_AI_TOKEN=your_api_token_here

# Firebase Configuration (Required)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# PostgreSQL Configuration (Optional - for analytics)
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DATABASE=polkassembly
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
POSTGRES_SSL=false
DISABLE_POSTGRES=false

# Application Settings
NODE_ENV=development
CONVERSATION_HISTORY_LIMIT=5
JWT_SECRET=your_jwt_secret_key
```

### Database Setup

**Firestore (Required)**: Used for storing conversations and user data
- Set up a Firebase project and enable Firestore
- Configure the Firebase environment variables

**PostgreSQL (Optional)**: Used for analytics and query logging
- Set up PostgreSQL database
- Tables are automatically created on first run
- Set `DISABLE_POSTGRES=true` to disable PostgreSQL features

## Usage

### Getting Started with Klara

1. **Connect Wallet**: Use Polkadot.js, SubWallet, or Talisman to authenticate
2. **Start Chatting**: Ask questions about Polkadot/Kusama governance in natural language
3. **Manage Conversations**: Create new conversations or continue existing ones
4. **Explore Data**: Query proposals, referenda, voting patterns, and treasury information

### Example Queries

- "Show me all active referenda on Polkadot"
- "Who voted 'nay' on referendum 300?"
- "List treasury proposals above 100,000 DOT"
- "Find all bounties created in 2024"
- "Show voting power analysis for recent referenda"

## Project Structure

```
src/
├── app/                           # Next.js app directory
│   ├── api/                      # API routes
│   │   ├── auth/wallet/          # Wallet authentication
│   │   ├── chat/                 # Chat endpoint with streaming
│   │   ├── chat-history/         # Chat history retrieval
│   │   ├── conversations/        # Conversation management
│   │   ├── conversation-messages/# Message retrieval
│   │   ├── feedback/             # User feedback collection
│   │   ├── health/               # Health check endpoint
│   │   ├── init-user/            # User initialization
│   │   └── stats/                # Statistics endpoint
│   ├── feedback/                 # Feedback page
│   ├── guide/                    # User guide page
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Main page
├── components/                   # React components
│   ├── ChatInterface.tsx         # Main chat interface
│   ├── ConversationSidebar.tsx  # Conversation management
│   ├── LoginForm.tsx             # Wallet login form
│   ├── MessageBubble.tsx         # Individual message display
│   ├── FeedbackForm.tsx          # User feedback form
│   ├── Mascot.tsx               # AI mascot component
│   └── WalletsUI/               # Wallet UI components
├── lib/                          # Utility functions
│   ├── authService.ts            # Authentication service
│   ├── chatCache.ts              # Chat caching
│   ├── database.ts               # Firestore operations
│   ├── postgres.ts               # PostgreSQL operations
│   ├── firebase.ts               # Firebase configuration
│   └── walletService.ts          # Wallet integration
├── hooks/                        # Custom React hooks
└── types/                        # TypeScript definitions
    ├── chat.ts                   # Chat-related types
    └── wallet.ts                 # Wallet-related types
```

## Development

### Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run export-conversations` - Export conversations from Firestore
- `npm run analyze-conversations` - Analyze conversation data
- `npm run test-auth` - Test wallet authentication
- `npm run create-feedback-table` - Create PostgreSQL feedback table
- `npm run update-feedback-table` - Update PostgreSQL feedback table

### Adding New Features

1. **New API Endpoints**: Add routes in `src/app/api/`
2. **New Components**: Add in `src/components/`
3. **Database Operations**: Extend `src/lib/database.ts` (Firestore) or `src/lib/postgres.ts` (PostgreSQL)
4. **Wallet Integration**: Extend `src/lib/walletService.ts`
5. **Types**: Update `src/types/` files

## Deployment

### Vercel (Recommended)
```bash
npm run build
```
Then deploy to Vercel. The application is pre-configured for serverless deployment.

### Environment Setup for Production
1. Set up Firebase project with Firestore
2. Configure PostgreSQL database (optional)
3. Set all required environment variables
4. Deploy to your preferred platform

### Other Platforms
The application works on any platform that supports Next.js. Ensure all environment variables are properly configured.

## Core Capabilities

### Governance Data Querying
- **Proposal Lookup**: Fetch proposals or referenda by ID or title
- **Filter by Type**: Supports ReferendumV2, Treasury, Fellowship, Bounty, ChildBounty
- **Filter by Network**: Switch between Polkadot and Kusama networks
- **Status Filtering**: Retrieve proposals by status (Deciding, DecisionDepositPlaced, etc.)
- **Date-Based Search**: Query by specific dates, months, or years
- **Text Search**: Search in titles or content

### Voting Data Analysis
- **Voter Information**: Retrieve details of individual voters and their activity
- **Voting Power**: Analyze balance and conviction using conviction_vote data
- **Delegation Tracking**: Identify delegated votes and delegation relationships
- **Vote Decisions**: Filter by aye, nay, or abstain
- **Conviction Analysis**: Analyze lock periods and conviction multipliers
- **Top Voters**: Rank voters by voting power

## License

This project is licensed under the MIT License.