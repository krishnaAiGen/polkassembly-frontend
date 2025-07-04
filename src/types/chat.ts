export interface Source {
  title: string
  url: string
  source_type: string
  similarity_score: number
}

export interface Message {
  id: string
  text: string
  sender: 'user' | 'ai'
  timestamp: number
  isStreaming?: boolean
  sources?: Source[]
  followUpQuestions?: string[]
}

export interface ChatData {
  [username: string]: Message[]
}

export interface ApiResponse {
  success: boolean
  data?: any
  error?: string
}

export interface StreamingResponse {
  content: string
  done: boolean
}

export interface BackendApiRequest {
  question: string           // Required: 1-500 characters
  user_id: string           // Required: 1-100 characters  
  client_ip: string         // Required: 7-45 characters
  max_chunks?: number       // Optional: 1-10, default: 5
  include_sources?: boolean // Optional: default: true
  custom_prompt?: string    // Optional: custom system prompt
}

export interface BackendApiResponse {
  answer: string                    // AI-generated response
  sources: Source[]                 // Array of source documents
  follow_up_questions: string[]     // Array of suggested questions
  remaining_requests: number        // Rate limit remaining count
  confidence: number                // 0.0-1.0 confidence score
  context_used: boolean             // Whether document context was used
  model_used: string                // AI model name (e.g., "gpt-3.5-turbo")
  chunks_used: number               // Number of document chunks used
  processing_time_ms: number        // Response time in milliseconds
  timestamp: string                 // ISO timestamp
  search_method: string             // Method: "local_knowledge", "web_search", etc.
} 