/*
  Migration script to drop the unique index on batchName for the Animal collection.
  Run with: `node .drop-animal-index.js`
  Make sure you have MONGODB_URI set in your environment.
*/

import "dotenv/config";
import { connectToDatabase } from "./lib/mongodb.js";

async function dropAnimalIndex() {
  if (!process.env.MONGODB_URI) {
    console.error(
      "MONGODB_URI is required. Please create .env.local (see .env.example).\n"
    );
    process.exit(1);
  }

  await connectToDatabase();
  console.log("Connected to MongoDB");

  try {
    // Drop the old unique index on ownerId and batchName
    const Animal = (await import("./models/Animal.js")).default;
    await Animal.collection.dropIndex({ ownerId: 1, batchName: 1 });
    console.log("Dropped old unique index on ownerId and batchName");

    // Create the new non-unique index
    await Animal.collection.createIndex({ ownerId: 1, batchName: 1 });
    console.log("Created new non-unique index on ownerId and batchName");

    console.log("Migration completed successfully!");
  } catch (error) {
    if (error.code === 27) {
      console.log("Index doesn't exist or already dropped - this is fine");
    } else {
      console.error("Error during migration:", error);
      process.exit(1);
    }
  }

  process.exit(0);
}

dropAnimalIndex().catch((error) => {
  console.error("Migration failed", error);
  process.exit(1);
});
