import { Database } from 'bun:sqlite';
import { DB_PATH } from '../constants';
import type { Order } from '../types/Order';


export class OrdersSQLite {
    private db: Database;

    constructor() {
        this.db = new Database(DB_PATH);
        this.initializeTable();
    }

    /**
     * Initialize the orders table
     */
    initializeTable(): void {
        this.db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId TEXT, -- Add this column
      userName TEXT,
      email TEXT,
      phone TEXT,
      device TEXT,
      price REAL,
      shippingCost REAL,
      department TEXT,
      city TEXT,
      address TEXT,
      estimatedDeliveryDays INTEGER,
      requiresHumanIntervention INTEGER NOT NULL DEFAULT 0
    );
    CREATE INDEX IF NOT EXISTS idx_order_userId ON orders(userId);
    CREATE INDEX IF NOT EXISTS idx_order_email ON orders(email);
  `);
    }

    /**
     * Create a new order
     */
    createOrder(order: Omit<Order, 'id'>): number | bigint {
        const stmt = this.db.prepare(`
    INSERT INTO orders (
      userId, userName, email, phone, device, price, 
      shippingCost, department, city, address, 
      estimatedDeliveryDays, requiresHumanIntervention
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

        const result = stmt.run(
            order.userId ?? null, // Include userId here
            order.userName ?? null,
            order.email ?? null,
            order.phone ?? null,
            order.device ?? null,
            order.price ?? null,
            order.shippingCost ?? null,
            order.department ?? null,
            order.city ?? null,
            order.address ?? null,
            order.estimatedDeliveryDays ?? null,
            order.requiresHumanIntervention ? 1 : 0
        );

        return result.lastInsertRowid;
    }

    /**
     * Get an order by its autoincremental ID
     */
    getById(id: number): Order | null {
        const stmt = this.db.prepare(`SELECT * FROM orders WHERE id = ?`);
        const row = stmt.get(id) as any;

        if (!row) return null;

        return {
            ...row,
            requiresHumanIntervention: Boolean(row.requiresHumanIntervention),
        };
    }

    /**
     * Update human intervention status
     */
    setHumanIntervention(id: number, required: boolean): void {
        const stmt = this.db.prepare(`
      UPDATE orders SET requiresHumanIntervention = ? WHERE id = ?
    `);
        stmt.run(required ? 1 : 0, id);
    }

    /**
     * Returns the existing order for a userId, 
     * or creates a new one if none exists.
     */
    getOrCreateByUserId(userId: string, defaultData: Omit<Order, 'id' | 'userId'>): Order {
        // 1. Check for existing order
        const existing = this.db.prepare(`SELECT * FROM orders WHERE userId = ? LIMIT 1`).get(userId) as any;

        if (existing) {
            return {
                ...existing,
                requiresHumanIntervention: Boolean(existing.requiresHumanIntervention),
            };
        }

        // 2. If not found, create it
        const newOrderId = this.createOrder({
            userId,
            ...defaultData
        });

        // 3. Return the newly created order
        // (Cast to number because lastInsertRowid can be number | bigint)
        const newOrder = this.getById(Number(newOrderId));

        if (!newOrder) {
            throw new Error("Failed to retrieve order after creation");
        }

        return newOrder;
    }

    /**
   * Updates an order with partial data.
   * @param id The autoincremental ID of the order
   * @param data Partial object containing the fields to update
   */
    updateOrder(id: number, data: Partial<Omit<Order, 'id'>>): void {
        const entries = Object.entries(data);

        if (entries.length === 0) return;

        // Map fields to SQL syntax and handle boolean conversion for SQLite
        const setClause = entries
            .map(([key]) => `${key} = ?`)
            .join(', ');

        const values = entries.map(([key, value]) => {
            // Special case: convert boolean to 0/1 for SQLite
            if (key === 'requiresHumanIntervention') {
                return value ? 1 : 0;
            }
            return value ?? null;
        });

        const stmt = this.db.prepare(`
      UPDATE orders 
      SET ${setClause} 
      WHERE id = ?
    `);

        stmt.run(...values, id);
    }

    text(order: Order): string {

        return `
[ORDER_DATA]
ID: ${order.id}
UserID: ${order.userId}
Status: ${order.requiresHumanIntervention ? 'REQUIRES_INTERVENTION' : 'AUTO_PROCESSED'}
Customer: ${order.userName || 'N/A'}
Contact: ${order.email || 'N/A'} | ${order.phone || 'N/A'}
Product: ${order.device || 'N/A'}
Financials: Price=${order.price}, Shipping=${order.shippingCost}, Total=${(order.price || 0) + (order.shippingCost || 0)}
Location: ${order.address}, ${order.city}, ${order.department}
Delivery: ${order.estimatedDeliveryDays} days
[/ORDER_DATA]
  `.trim();
    }

    /**
     * Close the database connection
     */
    close(): void {
        this.db.close();
    }
}