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

export interface BackendApiResponse {
  answer: string
  sources: Source[]
  confidence: number
  context_used: boolean
  model_used: string
  chunks_used: number
  processing_time_ms: number
  timestamp: string
  search_method: string
} 