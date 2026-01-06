import { Database } from 'bun:sqlite';
import { DB_PATH } from '../constants';

export type ChatMessage = {
  id?: number;
  userId: string;
  role: 'user' | 'assistant';
  message: string;
  date: Date;
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
        date TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_userId ON chatHistory(userId);
    `);
  }

  /**
   * Add a new message to chat history
   * @param userId - The user ID
   * @param role - Either "user" or "assistant"
   * @param message - The message content
   * @param date - The message date
   */
  addMessage(userId: string, role: 'user' | 'assistant', message: string, date: Date): void {
    const stmt = this.db.prepare(`
      INSERT INTO chatHistory (userId, role, message, date)
      VALUES (?, ?, ?, ?)
    `);
    stmt.run(userId, role, message, date.toISOString());
  }

  /**
   * Get all messages for a specific user
   * @param userId - The user ID
   * @returns Array of chat history records
   */
  getByUser(userId: string): ChatMessage[] {
    const stmt = this.db.prepare(`
      SELECT id, userId, role, message, date FROM chatHistory
      WHERE userId = ?
      ORDER BY date ASC
    `);
    const results = stmt.all(userId);
    return results.map((row: any) => ({
      id: row.id,
      userId: row.userId,
      role: row.role as 'user' | 'assistant',
      message: row.message,
      date: new Date(row.date),
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
   * Close the database connection
   */
  close(): void {
    this.db.close();
  }
}
