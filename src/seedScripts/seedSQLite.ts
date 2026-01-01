import { Database } from "bun:sqlite";

const DB_PATH = "./sqlite.db";
const TABLE_NAME = "shipping_costs";

// Colombian cities
const colombianCities = [
  "Bogotá",
  "Medellín",
  "Cali",
  "Barranquilla",
  "Cartagena",
  "Cúcuta",
  "Bucaramanga",
  "Santa Marta",
  "Manizales",
  "Pereira",
  "Armenia",
  "Ibagué",
  "Villavicencio",
  "Tuluá",
  "Popayán",
  "Pasto",
  "Quibdó",
  "Montería",
  "Sincelejo",
  "Valledupar",
];

function getRandomShippingCost(): number {
  return Math.floor(Math.random() * (50000 - 5000 + 1)) + 5000;
}

function seed() {
  try {
    console.log(`Connecting to SQLite database at ${DB_PATH}...`);
    const db = new Database(DB_PATH);

    // Check if table exists and drop it
    const tableExists = db
      .prepare(
        `SELECT name FROM sqlite_master WHERE type='table' AND name=?`
      )
      .get(TABLE_NAME);

    if (tableExists) {
      console.log(`Table ${TABLE_NAME} already exists. Dropping...`);
      db.prepare(`DROP TABLE IF EXISTS ${TABLE_NAME}`).run();
    }

    // Create table with city and shipping cost
    console.log(`Creating table ${TABLE_NAME}...`);
    db.prepare(
      `
      CREATE TABLE ${TABLE_NAME} (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        city TEXT NOT NULL,
        shipping_cost_cop INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `
    ).run();

    // Prepare insert statement
    const insert = db.prepare(
      `INSERT INTO ${TABLE_NAME} (city, shipping_cost_cop) VALUES (?, ?)`
    );

    // Insert all cities with random shipping costs
    console.log(`Adding ${colombianCities.length} cities to table...`);

    const insertMany = db.transaction((cities: string[]) => {
      for (const city of cities) {
        insert.run(city, getRandomShippingCost());
      }
    });

    insertMany(colombianCities);

    // Get sample data
    const sampleData = db
      .prepare(`SELECT * FROM ${TABLE_NAME} LIMIT 5`)
      .all();

    console.log("✓ Seed completed successfully!");
    console.log("\nTable details:");
    console.log(`- Name: ${TABLE_NAME}`);
    console.log(`- Cities: ${colombianCities.length}`);
    console.log("\nSample data:");
    sampleData.forEach((row: any) => {
      console.log(`  ${row.city}: ${row.shipping_cost_cop} COP`);
    });

    db.close();
  } catch (error) {
    console.error("Error seeding SQLite:", error);
    process.exit(1);
  }
}

seed();
