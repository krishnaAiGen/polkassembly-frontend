# Rate Limiting Implementation

This document explains the simplified rate limiting system implemented in the Polkassembly Chat Interface.

## Overview

The rate limiting system is handled entirely by the backend. The frontend simply:

1. **Sends user ID and IP address** to the backend with each request
2. **Receives remaining request count** from the backend
3. **Shows warning messages** when requests are running low

## Request Data Sent to Backend

Your backend API receives the following data with each chat request:

```json
{
  "question": "User's question text",           // Required: 1-500 characters
  "user_id": "normalized_username",             // Required: 1-100 characters  
  "client_ip": "192.168.1.1",                   // Required: 7-45 characters
  "max_chunks": 5,                              // Optional: 1-10, default: 5
  "include_sources": true,                      // Optional: default: true
  "custom_prompt": null                         // Optional: custom system prompt
}
```

## Expected Backend Response

Your backend should return the complete response with all fields:

```json
{
  "answer": "Your response text here...",        // AI-generated response
  "sources": [                                   // Array of source documents
    {
      "title": "Source Title",                   // Source title
      "url": "https://example.com",              // Source URL
      "source_type": "polkadot_wiki",            // Type: "polkadot_wiki", "polkassembly", etc.
      "similarity_score": 0.85                   // 0.0-1.0 similarity score
    }
  ],
  "follow_up_questions": [                       // Array of suggested questions
    "How do I vote on proposals?",
    "What are the proposal requirements?"
  ],
  "remaining_requests": 7,                       // Rate limit remaining count
  "confidence": 0.85,                            // 0.0-1.0 confidence score
  "context_used": true,                          // Whether document context was used
  "model_used": "gpt-3.5-turbo",                 // AI model name
  "chunks_used": 5,                              // Number of document chunks used
  "processing_time_ms": 1250.5,                  // Response time in milliseconds
  "timestamp": "2024-01-15T10:30:45.123Z",       // ISO timestamp
  "search_method": "local_knowledge"             // Method: "local_knowledge", "web_search", etc.
}
```

## Frontend Behavior

### Warning Messages

When `remaining_requests < 5`, the frontend automatically appends a warning message to the AI response:

```
⚠️ **Warning**: You are approaching the usage limit. You have 4 requests remaining this minute. Please slow down to avoid being blocked.
```

### IP Detection

The frontend automatically detects the client IP from headers:
- `x-forwarded-for` (for proxies/CDNs)
- `x-real-ip` (for reverse proxies)
- Fallback to 'unknown' if not available

### Logging

Each request is logged with user and IP information:
```
Chat request - User: krishna, IP: 192.168.1.1, Remaining: 7
```

## Backend Implementation Responsibilities

Your backend should:

1. **Track requests per user ID and/or IP address**
2. **Implement rate limiting logic** (e.g., 10 requests per minute)
3. **Return current remaining count** in the response
4. **Handle rate limit violations** (return error responses when exceeded)

### Example Backend Logic

```python
# Example Python implementation
def handle_chat_request(question, user_id, client_ip):
    # Check rate limits for this user/IP
    remaining = check_rate_limit(user_id, client_ip)
    
    if remaining <= 0:
        return {
            "error": "Rate limit exceeded",
            "remaining_requests": 0
        }, 429
    
    # Process the question
    response = process_question(question)
    
    # Add remaining count to response
    response["remaining_requests"] = remaining
    
    return response, 200
```

## Configuration

The warning threshold is currently set to `< 5` remaining requests. You can modify this in `/src/app/api/chat/route.ts`:

```typescript
if (remainingRequests !== undefined && remainingRequests < 5) {
  // Change the "5" to your desired threshold
}
```

## Testing

To test the rate limiting:

1. **Configure your backend** to return low `remaining_requests` values
2. **Send chat messages** and watch for warning messages
3. **Check console logs** for rate limit monitoring
4. **Verify IP detection** in the logs

## Security Considerations

1. **Validate user_id** to prevent injection attacks
2. **Use trusted proxy headers** for IP detection
3. **Implement both user-based and IP-based** rate limiting
4. **Log rate limit violations** for security monitoring
5. **Consider geographic rate limiting** for additional protection

## Error Handling

The frontend gracefully handles:
- **Missing remaining_requests field** (assumes unlimited)
- **Backend connection failures** (shows fallback responses)  
- **Invalid remaining_requests values** (treats as unlimited)

## Monitoring

Console logs provide monitoring information:
- User ID for each request
- Client IP address  
- Remaining request count
- Request timing and patterns 