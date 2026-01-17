import { Database } from 'bun:sqlite';
import { DB_PATH } from '../constants';

export type ChatMessage = {
  id?: number;
  userId: string;
  role: 'user' | 'assistant';
  message: string;
  timestamp: number;
};

export class ChatHistorySQLite {
  private db: Database;

  constructor() {
    this.db = new Database(DB_PATH);
    this.initializeTable();
  }

  /**
   * Initialize the chatHistory table
   */
  initializeTable(): void {
    this.db.run(`
      CREATE TABLE IF NOT EXISTS chatHistory (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('user', 'assistant')),
        message TEXT NOT NULL,
        timestamp INTEGER NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_userId ON chatHistory(userId);
    `);
  }

  /**
   * Add a new message to chat history
   * @param userId - The user ID
   * @param role - Either "user" or "assistant"
   * @param message - The message content
   * @param timestamp - The message timestamp (epoch)
   */
  addMessage(userId: string, role: 'user' | 'assistant', message: string, timestamp: number): void {
    const stmt = this.db.prepare(`
      INSERT INTO chatHistory (userId, role, message, timestamp)
      VALUES (?, ?, ?, ?)
    `);
    stmt.run(userId, role, message, timestamp);
  }

  /**
   * Get all messages for a specific user
   * @param userId - The user ID
   * @returns Array of chat history records
   */
  getByUser(userId: string): ChatMessage[] {
    const stmt = this.db.prepare(`
      SELECT id, userId, role, message, timestamp FROM chatHistory
      WHERE userId = ?
      ORDER BY timestamp ASC
    `);
    const results = stmt.all(userId);
    return results.map((row: any) => ({
      id: row.id,
      userId: row.userId,
      role: row.role as 'user' | 'assistant',
      message: row.message,
      timestamp: row.timestamp,
    }));
  }

  getByUserAsText(userId: string) {
    const conversation = this.getByUser(userId)

    return conversation.map(msg => {
      return `${msg.role === 'user' ? 'Usuario' : 'Asistente'}: ${msg.message}`;
    }).join("\n")
  }

  /**
   * Delete all messages for a specific user
   * @param userId - The user ID
   */
  deleteByUser(userId: string): void {
    const stmt = this.db.prepare(`
      DELETE FROM chatHistory WHERE userId = ?
    `);
    stmt.run(userId);
  }

  /**
   * Get the timestamp of the last message sent by a specific user
   * @param userId - The user ID
   * @returns The timestamp of the last message, or null if no message found
   */
  getLastUserMessageTimestamp(userId: string): number | null {
    const stmt = this.db.prepare(`
      SELECT timestamp FROM chatHistory
      WHERE userId = ? AND role = 'user'
      ORDER BY timestamp DESC
      LIMIT 1
    `);
    const result = stmt.get(userId) as any;
    return result ? result.timestamp : null;
  }

  /**
   * Close the database connection
   */
  close(): void {
    this.db.close();
  }
}
