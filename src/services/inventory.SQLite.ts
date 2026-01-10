import { Database } from 'bun:sqlite';
import { DB_PATH } from '../constants';

export type ProductType = 'case' | 'skin';

export type InventoryItem = {
  id?: number;
  type: ProductType;
  phoneReference: string; 
  price: number;
  stock: number;
  nextRefill: Date | null;
};

export class InventorySQLite {
  private db: Database;

  constructor() {
    this.db = new Database(DB_PATH);
    this.initializeTable();
  }

  /**
   * Initialize the inventory table
   */
  initializeTable(): void {
    this.db.run(`
      CREATE TABLE IF NOT EXISTS inventory (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL CHECK(type IN ('case', 'skin')),
        phone_reference TEXT NOT NULL,
        price REAL NOT NULL,
        stock INTEGER NOT NULL DEFAULT 0,
        nextRefill TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_product_type ON inventory(type);
    `);
  }

  /**
   * Add a new product to the inventory
   */
  addProduct(item: Omit<InventoryItem, 'id'>): void {
    const stmt = this.db.prepare(`
      INSERT INTO inventory (type, phone_reference, price, stock, nextRefill)
      VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run(
      item.type,
      item.phoneReference,
      item.price,
      item.stock,
      item.nextRefill ? item.nextRefill.toISOString() : null
    );
  }

  /**
   * Update stock levels and optionally the next refill date
   */
  updateStock(id: number, newStock: number, nextRefill: Date | null = null): void {
    const stmt = this.db.prepare(`
      UPDATE inventory 
      SET stock = ?, nextRefill = ? 
      WHERE id = ?
    `);
    stmt.run(newStock, nextRefill ? nextRefill.toISOString() : null, id);
  }

  /**
   * Get all inventory items
   */
  getAll(): InventoryItem[] {
    const results = this.db.query("SELECT * FROM inventory").all();
    return (results as any[]).map(row => this.mapRowToItem(row));
  }

  /**
   * Get products that are currently out of stock
   */
  getOutOfStock(): InventoryItem[] {
    const results = this.db.query("SELECT * FROM inventory WHERE stock <= 0").all();
    return (results as any[]).map(row => this.mapRowToItem(row));
  }

  /**
   * Helper to map database rows to TypeScript objects
   */
  private mapRowToItem(row: any): InventoryItem {
    return {
      id: row.id,
      type: row.type as ProductType,
      phoneReference: row.phone_reference,
      price: row.price,
      stock: row.stock,
      nextRefill: row.nextRefill ? new Date(row.nextRefill) : null,
    };
  }

  /**
   * Delete a product
   */
  deleteProduct(id: number): void {
    this.db.prepare("DELETE FROM inventory WHERE id = ?").run(id);
  }

  close(): void {
    this.db.close();
  }
}