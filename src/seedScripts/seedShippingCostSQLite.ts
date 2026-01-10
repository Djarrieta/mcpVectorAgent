import { Database } from "bun:sqlite";
import { DB_PATH } from "../constants";

const TABLE_NAME = "shipping_costs";

// Colombian cities with departments and estimated delivery days
const colombianCities = [
  { city: "Bogotá", department: "Cundinamarca", deliverySstimatedDays: 1 },
  { city: "Medellín", department: "Antioquia", deliverySstimatedDays: 2 },
  { city: "Cali", department: "Valle del Cauca", deliverySstimatedDays: 2 },
  { city: "Barranquilla", department: "Atlántico", deliverySstimatedDays: 3 },
  { city: "Cartagena", department: "Bolívar", deliverySstimatedDays: 3 },
  { city: "Cúcuta", department: "Norte de Santander", deliverySstimatedDays: 4 },
  { city: "Bucaramanga", department: "Santander", deliverySstimatedDays: 3 },
  { city: "Santa Marta", department: "Magdalena", deliverySstimatedDays: 3 },
  { city: "Manizales", department: "Caldas", deliverySstimatedDays: 2 },
  { city: "Pereira", department: "Risaralda", deliverySstimatedDays: 2 },
  { city: "Armenia", department: "Quindío", deliverySstimatedDays: 2 },
  { city: "Ibagué", department: "Tolima", deliverySstimatedDays: 2 },
  { city: "Villavicencio", department: "Meta", deliverySstimatedDays: 3 },
  { city: "Tuluá", department: "Valle del Cauca", deliverySstimatedDays: 2 },
  { city: "Popayán", department: "Cauca", deliverySstimatedDays: 3 },
  { city: "Pasto", department: "Nariño", deliverySstimatedDays: 4 },
  { city: "Quibdó", department: "Chocó", deliverySstimatedDays: 5 },
  { city: "Montería", department: "Córdoba", deliverySstimatedDays: 3 },
  { city: "Sincelejo", department: "Sucre", deliverySstimatedDays: 3 },
  { city: "Valledupar", department: "Cesar", deliverySstimatedDays: 3 },
];

function getRandomShippingCost(): number {
  return Math.floor(Math.random() * (50000 - 5000 + 1)) + 5000;
}

function seedShippingCostSQLite() {
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

    // Create table with city, department, shipping cost, and estimated delivery days
    console.log(`Creating table ${TABLE_NAME}...`);
    db.prepare(
      `
      CREATE TABLE ${TABLE_NAME} (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        city TEXT NOT NULL,
        department TEXT NOT NULL,
        shipping_cost_cop INTEGER NOT NULL,
        delivery_estimated_days INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `
    ).run();

    // Prepare insert statement
    const insert = db.prepare(
      `INSERT INTO ${TABLE_NAME} (city, department, shipping_cost_cop, delivery_estimated_days) VALUES (?, ?, ?, ?)`
    );

    // Insert all cities with random shipping costs
    console.log(`Adding ${colombianCities.length} cities to table...`);

    const insertMany = db.transaction((cities: typeof colombianCities) => {
      for (const cityData of cities) {
        insert.run(cityData.city, cityData.department, getRandomShippingCost(), cityData.deliverySstimatedDays);
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
      console.log(`  ${row.city} (${row.department}): ${row.shipping_cost_cop} COP - ${row.delivery_estimated_days} days`);
    });

    db.close();
  } catch (error) {
    console.error("Error seeding SQLite:", error);
    process.exit(1);
  }
}

seedShippingCostSQLite();
