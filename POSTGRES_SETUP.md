# PostgreSQL Integration Setup

This document explains how to set up PostgreSQL logging for query-response pairs in the Klara chat application.

## 🗄️ Database Configuration

### Required Environment Variables

Add these variables to your `.env` file:

```bash
# PostgreSQL Database Configuration
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DATABASE=polkassembly
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password_here
POSTGRES_SSL=false

# Environment Configuration (affects table name)
NODE_ENV=development
# NODE_ENV=production (will use klara_qa_prod table)

# Conversation History Configuration
CONVERSATION_HISTORY_LIMIT=5
```

### Table Names

The system automatically selects the table name based on your environment:

- **Development**: `klara_qa_dev`
- **Production**: `klara_qa_prod`

## 📊 Database Schema

The system automatically creates the table with this structure:

```sql
CREATE TABLE klara_qa_dev (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    query TEXT NOT NULL,
    response TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'success',
    user_id VARCHAR(255),
    conversation_id VARCHAR(255),
    response_time_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Indexes

The following indexes are automatically created for performance:

- `idx_klara_qa_dev_timestamp` - For time-based queries
- `idx_klara_qa_dev_user_id` - For user-specific queries
- `idx_klara_qa_dev_conversation_id` - For conversation-specific queries
- `idx_klara_qa_dev_status` - For filtering by status

## 🚀 Features

### Automatic Table Management

- ✅ **Auto-detection**: Checks if table exists on startup
- ✅ **Auto-creation**: Creates table and indexes if missing
- ✅ **Environment-aware**: Uses different tables for dev/prod

### Comprehensive Logging

- ✅ **Success Logging**: Every successful query-response pair
- ✅ **Error Logging**: Failed requests with error details
- ✅ **Performance Tracking**: Response time in milliseconds
- ✅ **User Tracking**: Links to user ID and conversation ID

### Data Logged

For each query-response interaction:

| Field | Description | Example |
|-------|-------------|---------|
| `timestamp` | When the request was made | `2025-01-02 10:30:45+00` |
| `query` | User's question | `"How do I submit a proposal?"` |
| `response` | AI's response | `"To submit a proposal..."` |
| `status` | Request status | `"success"` or `"error"` |
| `user_id` | Username (normalized) | `"krishna"` |
| `conversation_id` | Conversation UUID | `"conv_abc123..."` |
| `response_time_ms` | Processing time | `1250` |

## 🔧 Setup Instructions

### 1. Install PostgreSQL

**macOS (Homebrew):**
```bash
brew install postgresql
brew services start postgresql
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 2. Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE polkassembly;

# Create user (optional)
CREATE USER klara_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE polkassembly TO klara_user;

# Exit
\q
```

### 3. Configure Environment

Create/update your `.env` file with the PostgreSQL credentials:

```bash
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DATABASE=polkassembly
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_actual_password
POSTGRES_SSL=false
NODE_ENV=development
```

### 4. Test Connection

The system will automatically test the connection and create tables on first API call. Check your logs for:

```
PostgreSQL connection successful: 2025-01-02T10:30:45.123Z
Creating table: klara_qa_dev
Table klara_qa_dev created successfully with indexes
```

## 📈 Monitoring & Analytics

### View Recent Logs

You can query the database directly:

```sql
-- Recent 10 interactions
SELECT 
    timestamp,
    user_id,
    LEFT(query, 50) as query_preview,
    status,
    response_time_ms
FROM klara_qa_dev 
ORDER BY timestamp DESC 
LIMIT 10;

-- Error analysis
SELECT 
    DATE(timestamp) as date,
    COUNT(*) as total_requests,
    COUNT(CASE WHEN status = 'error' THEN 1 END) as errors,
    AVG(response_time_ms) as avg_response_time
FROM klara_qa_dev 
GROUP BY DATE(timestamp)
ORDER BY date DESC;

-- Top users
SELECT 
    user_id,
    COUNT(*) as request_count,
    AVG(response_time_ms) as avg_response_time
FROM klara_qa_dev 
WHERE timestamp >= NOW() - INTERVAL '7 days'
GROUP BY user_id
ORDER BY request_count DESC;
```

## 🛠️ Troubleshooting

### Connection Issues

1. **Check PostgreSQL is running:**
   ```bash
   # macOS
   brew services list | grep postgresql
   
   # Linux
   sudo systemctl status postgresql
   ```

2. **Verify credentials:**
   ```bash
   psql -h localhost -U postgres -d polkassembly
   ```

3. **Check firewall/network:**
   - Ensure port 5432 is accessible
   - Check `pg_hba.conf` for authentication settings

### Common Errors

- **"relation does not exist"**: Table will be auto-created on first request
- **"password authentication failed"**: Check POSTGRES_PASSWORD in .env
- **"database does not exist"**: Create the database manually first
- **"connection refused"**: PostgreSQL service not running

## 🔒 Security Considerations

- ✅ Use strong passwords for database users
- ✅ Enable SSL in production (`POSTGRES_SSL=true`)
- ✅ Restrict database access to application servers only
- ✅ Regular backups of conversation data
- ✅ Consider data retention policies for privacy compliance

## 📊 Performance Tips

- The system uses connection pooling (max 20 connections)
- Indexes are automatically created for common queries
- Consider partitioning tables by date for large datasets
- Monitor query performance and add indexes as needed

---

The PostgreSQL integration runs automatically alongside your existing Firebase setup, providing comprehensive logging and analytics capabilities for your chat application! 🚀
