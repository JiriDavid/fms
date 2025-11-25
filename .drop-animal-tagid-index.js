/*
  Migration script to drop the old unique index on ownerId and tagId for the Animal collection.
  Run with: `node .drop-animal-tagid-index.js`
  Make sure you have MONGODB_URI set in your environment.
*/

import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

// Now import after dotenv is configured
import { connectToDatabase } from "./lib/mongodb.js";

async function dropAnimalTagIdIndex() {
  console.log("MONGODB_URI:", process.env.MONGODB_URI ? "Set" : "Not set");
  console.log("MONGODB_URI value:", process.env.MONGODB_URI);
  console.log(
    "CLERK_SECRET_KEY:",
    process.env.CLERK_SECRET_KEY ? "Set" : "Not set"
  );

  if (!process.env.MONGODB_URI) {
    console.error(
      "MONGODB_URI is required. Please create .env.local (see .env.example).\n"
    );
    process.exit(1);
  }

  await connectToDatabase();
  console.log("Connected to MongoDB");

  try {
    // Drop the old unique index on ownerId and tagId
    const Animal = (await import("./models/Animal.js")).default;
    await Animal.collection.dropIndex({ ownerId: 1, tagId: 1 });
    console.log("Dropped old unique index on ownerId and tagId");

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

dropAnimalTagIdIndex().catch((error) => {
  console.error("Migration failed", error);
  process.exit(1);
});
