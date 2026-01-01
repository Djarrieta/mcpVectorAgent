import { QdrantClient } from "@qdrant/js-client-rest";

const QDRANT_URL = "http://localhost:6333";
const COLLECTION_NAME = "shipping_cost";

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

async function seed() {
  try {
    const client = new QdrantClient({ url: QDRANT_URL });

    console.log(`Connecting to Qdrant at ${QDRANT_URL}...`);

    // Check if collection exists and delete it
    try {
      await client.getCollection(COLLECTION_NAME);
      console.log(`Collection ${COLLECTION_NAME} already exists. Deleting...`);
      await client.deleteCollection(COLLECTION_NAME);
    } catch (error) {
      // Collection doesn't exist, continue
    }

    // Create collection with vector configuration
    console.log(`Creating collection ${COLLECTION_NAME}...`);
    await client.createCollection(COLLECTION_NAME, {
      vectors: {
        size: 384, // Size for embedding vectors (adjust if using different model)
        distance: "Cosine",
      },
    });

    // Prepare points with cities and shipping costs
    const points = colombianCities.map((city, index) => ({
      id: index + 1,
      vector: Array(384)
        .fill(0)
        .map(() => Math.random()), // Random vector for demo
      payload: {
        city,
        shipping_cost_cop: getRandomShippingCost(),
      },
    }));

    // Upsert points into collection
    console.log(`Adding ${points.length} cities to collection...`);
    await client.upsert(COLLECTION_NAME, {
      points,
    });

    console.log("✓ Seed completed successfully!");
    console.log("\nCollection details:");
    console.log(`- Name: ${COLLECTION_NAME}`);
    console.log(`- Cities: ${points.length}`);
    console.log("\nSample data:");
    points.slice(0, 5).forEach((point) => {
      console.log(
        `  ${point.payload.city}: ${point.payload.shipping_cost_cop} COP`
      );
    });
  } catch (error) {
    console.error("Error seeding Qdrant:", error);
    process.exit(1);
  }
}

seed();
