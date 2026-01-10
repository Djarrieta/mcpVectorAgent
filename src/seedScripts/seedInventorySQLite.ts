import { Database } from "bun:sqlite";
import { DB_PATH } from "../constants";

const TABLE_NAME = "inventory";

// Sample phone models for the phone_reference field
const phoneModels = [
  "iPhone 15 Pro",
  "iPhone 15",
  "iPhone 14",
  "Samsung Galaxy S23",
  "Samsung Galaxy S22",
  "Google Pixel 8",
  "Xiaomi Redmi Note 12",
];

function seedInventorySQLite() {
  try {
    console.log(`Connecting to SQLite database at ${DB_PATH}...`);
    const db = new Database(DB_PATH);

    // 1. Reset Table
    const tableExists = db
      .prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`)
      .get(TABLE_NAME);

    if (tableExists) {
      console.log(`Table ${TABLE_NAME} already exists. Dropping for fresh seed...`);
      db.prepare(`DROP TABLE IF EXISTS ${TABLE_NAME}`).run();
    }

    // 2. Create Table (Updated schema: no description, added phone_reference)
    console.log(`Creating table ${TABLE_NAME}...`);
    db.run(`
      CREATE TABLE ${TABLE_NAME} (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL CHECK(type IN ('case', 'skin')),
        phone_reference TEXT NOT NULL,
        price REAL NOT NULL,
        stock INTEGER NOT NULL DEFAULT 0,
        nextRefill TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
    db.run(`CREATE INDEX IF NOT EXISTS idx_product_type ON ${TABLE_NAME}(type);`);

    // 3. Prepare Data
    const inventoryData: any[] = [];
    
    phoneModels.forEach((model) => {
      // Add a 'case' for each model
      inventoryData.push({
        type: "case",
        phoneReference: model,
        price: Math.floor(Math.random() * (60000 - 35000) + 35000), // COP range
        stock: Math.floor(Math.random() * 20),
        nextRefill: Math.random() > 0.7 ? new Date(Date.now() + 604800000).toISOString() : null,
      });

      // Add a 'skin' for each model
      inventoryData.push({
        type: "skin",
        phoneReference: model,
        price: Math.floor(Math.random() * (30000 - 15000) + 15000), // COP range
        stock: Math.floor(Math.random() * 15),
        nextRefill: null,
      });
    });

    // 4. Insert Data in a Transaction
    const insert = db.prepare(`
      INSERT INTO ${TABLE_NAME} (type, phone_reference, price, stock, nextRefill) 
      VALUES (?, ?, ?, ?, ?)
    `);

    const insertMany = db.transaction((items) => {
      for (const item of items) {
        insert.run(
          item.type,
          item.phoneReference,
          item.price,
          item.stock,
          item.nextRefill
        );
      }
    });

    console.log(`Inserting ${inventoryData.length} items...`);
    insertMany(inventoryData);

    // 5. Success Summary
    const sampleData = db.prepare(`SELECT * FROM ${TABLE_NAME} LIMIT 5`).all();

    console.log("✓ Inventory seed completed successfully!");
    console.log("\nSample data:");
    sampleData.forEach((row: any) => {
      console.log(
        `  [${row.type.toUpperCase()}] ${row.phone_reference}: $${row.price} - Stock: ${row.stock}`
      );
    });

    db.close();
  } catch (error) {
    console.error("Error seeding Inventory:", error);
    process.exit(1);
  }
}

seedInventorySQLite();