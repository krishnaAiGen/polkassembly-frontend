# Polkassembly Chat Interface

A beautiful, modern chat interface built with Next.js, inspired by the Polkassembly design. Features real-time streaming responses, user authentication, and persistent chat history stored in a JSON database.

## Features

- 🎨 **Beautiful UI**: Purple-themed design inspired by Polkassembly
- 💬 **Real-time Chat**: Token-by-token streaming responses like ChatGPT
- 👤 **User Authentication**: Simple name-based login system
- 💾 **Persistent Storage**: JSON file-based database for chat history
- 🔗 **API Integration**: Configurable external API endpoint
- 📱 **Responsive Design**: Works on desktop and mobile devices
- ☁️ **Serverless Ready**: Compatible with Vercel, AWS Lambda, and other serverless platforms

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

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

3. Configure your API endpoint in `.env`:
```bash
# Copy the example env file
cp .env .env.local

# Edit .env.local and set your API endpoint
API_BASE_URL=https://your-api-endpoint.com
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Configuration

### API Setup

The application can be configured to use any external API by setting the `API_BASE_URL` in your `.env` file. 

If no API is configured or the API is unreachable, the application will use fallback responses related to Polkadot governance.

### Database

The application uses a simple JSON file to store user conversations:
- **Development**: The file is created in your project directory
- **Production/Serverless**: The file is created in `/tmp/chat-database.json` for compatibility with platforms like Vercel

**Note**: In serverless environments, the `/tmp` directory is ephemeral and data will be lost when the function instance is recycled. For production use, consider integrating with a persistent database like:
- PostgreSQL
- MongoDB
- Redis
- Any cloud database service

## Usage

1. **Login**: Enter your name to start chatting
2. **Chat**: Type messages and receive streaming responses
3. **History**: Your chat history is automatically saved and restored when you log back in
4. **Logout**: Click logout to switch users

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── chat/          # Chat endpoint with streaming
│   │   ├── chat-history/  # Chat history retrieval
│   │   └── init-user/     # User initialization
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main page
├── components/            # React components
│   ├── ChatInterface.tsx  # Main chat interface
│   ├── LoginForm.tsx      # Login form
│   ├── MessageBubble.tsx  # Individual message display
│   └── TypingIndicator.tsx # Typing animation
├── lib/                   # Utility functions
│   └── database.ts        # Database operations
└── types/                 # TypeScript type definitions
    └── chat.ts            # Chat-related types
```

## Development

### Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Adding New Features

1. **New API Endpoints**: Add routes in `src/app/api/`
2. **New Components**: Add in `src/components/`
3. **Database Operations**: Extend `src/lib/database.ts`
4. **Types**: Update `src/types/chat.ts`

## Deployment

### Vercel (Recommended)
```bash
npm run build
```
Then deploy to Vercel. The application is pre-configured for serverless deployment.

### Other Platforms
The application works on any platform that supports Next.js. For serverless platforms, the database automatically uses the `/tmp` directory.

## License

This project is licensed under the MIT License.