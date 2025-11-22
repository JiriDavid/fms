/*
  Migration script to create expense records for existing animals with purchase costs.
  Run with: `node .migrate-animals.js`
  Make sure you have MONGODB_URI set in your environment.
*/

import "dotenv/config";
import { connectToDatabase } from "./lib/mongodb.js";
import Animal from "./models/Animal.js";
import Expense from "./models/Expense.js";
import Farmer from "./models/Farmer.js";

async function migrateAnimalExpenses() {
  if (!process.env.MONGODB_URI) {
    console.error(
      "MONGODB_URI is required. Please create .env.local (see .env.example).\n"
    );
    process.exit(1);
  }

  await connectToDatabase();
  console.log("Connected to MongoDB");

  // Find all animals with purchase costs > 0
  const animalsWithCosts = await Animal.find({
    purchaseCost: { $gt: 0 }
  }).lean();

  console.log(`Found ${animalsWithCosts.length} animals with purchase costs`);

  // Check which animals already have expense records
  const animalIds = animalsWithCosts.map(a => a._id);
  const existingExpenses = await Expense.find({
    livestockBatchId: { $in: animalIds },
    category: "Livestock"
  }).select('livestockBatchId').lean();

  const existingExpenseIds = new Set(
    existingExpenses.map(e => e.livestockBatchId.toString())
  );

  // Filter to animals that don't have expense records
  const animalsNeedingExpenses = animalsWithCosts.filter(
    animal => !existingExpenseIds.has(animal._id.toString())
  );

  console.log(`${animalsNeedingExpenses.length} animals need expense records created`);

  if (animalsNeedingExpenses.length === 0) {
    console.log("No migration needed!");
    process.exit(0);
  }

  // Group by ownerId to get farmers
  const ownerIds = [...new Set(animalsNeedingExpenses.map(a => a.ownerId))];
  const farmers = await Farmer.find({ ownerId: { $in: ownerIds } }).lean();
  const farmerMap = farmers.reduce((acc, f) => {
    acc[f.ownerId] = f;
    return acc;
  }, {});

  // Create expense records
  const expensesToCreate = animalsNeedingExpenses.map(animal => {
    const farmer = farmerMap[animal.ownerId];
    if (!farmer) {
      console.warn(`No farmer found for ownerId: ${animal.ownerId}, skipping animal: ${animal.batchName}`);
      return null;
    }

    return {
      ownerId: animal.ownerId,
      farmerId: farmer._id,
      category: "Livestock",
      description: `Purchase of ${animal.batchName} (${animal.livestockType})`,
      amount: animal.purchaseCost,
      date: animal.acquisitionDate,
      livestockBatchId: animal._id,
      notes: `Acquisition cost for ${animal.quantity} ${animal.livestockType}${animal.quantity > 1 ? 's' : ''}`,
    };
  }).filter(Boolean);

  if (expensesToCreate.length > 0) {
    await Expense.insertMany(expensesToCreate);
    console.log(`Created ${expensesToCreate.length} expense records`);
  }

  console.log("Migration completed!");
  process.exit(0);
}

migrateAnimalExpenses().catch((error) => {
  console.error("Migration failed", error);
  process.exit(1);
});