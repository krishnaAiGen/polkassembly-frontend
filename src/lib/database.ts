import { promises as fs } from 'fs'
import path from 'path'
import { ChatData, Message } from '@/types/chat'

const DB_PATH = path.join(process.cwd(), 'chat-database.json')

export async function initializeDatabase(): Promise<void> {
  try {
    await fs.access(DB_PATH)
    console.log('Database file exists')
  } catch (error) {
    // File doesn't exist, create it
    console.log('Creating new database file')
    const initialData: ChatData = {}
    await fs.writeFile(DB_PATH, JSON.stringify(initialData, null, 2))
  }
}

export async function readDatabase(): Promise<ChatData> {
  try {
    const data = await fs.readFile(DB_PATH, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading database:', error)
    // If file doesn't exist or is corrupted, initialize and return empty data
    await initializeDatabase()
    return {}
  }
}

export async function writeDatabase(data: ChatData): Promise<void> {
  try {
    await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error('Error writing to database:', error)
    throw error
  }
}

export async function getUserMessages(username: string): Promise<Message[]> {
  const data = await readDatabase()
  return data[username] || []
}

export async function saveUserMessage(username: string, message: Message): Promise<void> {
  const data = await readDatabase()
  if (!data[username]) {
    data[username] = []
  }
  data[username].push(message)
  await writeDatabase(data)
}

export async function initializeUser(username: string): Promise<void> {
  const data = await readDatabase()
  if (!data[username]) {
    data[username] = []
    await writeDatabase(data)
  }
} 