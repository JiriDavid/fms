import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { connectToDatabase } from "./lib/mongodb.js";
import Medicine from "./models/Medicine.js";
import Feed from "./models/Feed.js";
import Expense from "./models/Expense.js";
import Farmer from "./models/Farmer.js";

async function migrateInventoryExpenses() {
  console.log("MONGODB_URI:", process.env.MONGODB_URI ? "Set" : "Not set");
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

  // Get all farmers
  const farmers = await Farmer.find({});
  console.log(`Found ${farmers.length} farmers`);

  let totalMedicineExpenses = 0;
  let totalFeedExpenses = 0;

  for (const farmer of farmers) {
    console.log(`Processing farmer: ${farmer.farmName} (${farmer.ownerId})`);

    // Find medicines that don't have corresponding expense records
    const medicines = await Medicine.find({
      ownerId: farmer.ownerId,
      cost: { $exists: true, $gt: 0 },
    });

    // Check which medicines already have expense records
    const existingMedicineExpenseIds = new Set();
    for (const medicine of medicines) {
      const existingExpense = await Expense.findOne({
        ownerId: farmer.ownerId,
        category: "Medicine",
        description: `Purchase of ${medicine.name}`,
        amount: medicine.cost,
      });
      if (existingExpense) {
        existingMedicineExpenseIds.add(medicine._id.toString());
      }
    }

    // Create expense records for medicines that don't have them
    const newMedicineExpenses = medicines
      .filter(
        (medicine) => !existingMedicineExpenseIds.has(medicine._id.toString())
      )
      .map((medicine) => ({
        ownerId: farmer.ownerId,
        farmerId: farmer._id,
        category: "Medicine",
        description: `Purchase of ${medicine.name}`,
        amount: medicine.cost,
        date: new Date(),
        supplier: medicine.supplier,
        notes: `Medicine purchase: ${medicine.name} (${medicine.quantityOnHand} units)`,
      }));

    if (newMedicineExpenses.length > 0) {
      await Expense.insertMany(newMedicineExpenses);
      totalMedicineExpenses += newMedicineExpenses.length;
      console.log(
        `Created ${newMedicineExpenses.length} medicine expense records for ${farmer.farmName}`
      );
    }

    // Find feeds that don't have corresponding expense records
    const feeds = await Feed.find({
      ownerId: farmer.ownerId,
      cost: { $exists: true, $gt: 0 },
    });

    // Check which feeds already have expense records
    const existingFeedExpenseIds = new Set();
    for (const feed of feeds) {
      const existingExpense = await Expense.findOne({
        ownerId: farmer.ownerId,
        category: "Feed",
        description: `Purchase of ${feed.type}`,
        amount: feed.cost,
      });
      if (existingExpense) {
        existingFeedExpenseIds.add(feed._id.toString());
      }
    }

    // Create expense records for feeds that don't have them
    const newFeedExpenses = feeds
      .filter((feed) => !existingFeedExpenseIds.has(feed._id.toString()))
      .map((feed) => ({
        ownerId: farmer.ownerId,
        farmerId: farmer._id,
        category: "Feed",
        description: `Purchase of ${feed.type}`,
        amount: feed.cost,
        date: new Date(),
        supplier: feed.supplier,
        notes: `Feed purchase: ${feed.type} (${feed.quantityKg}kg)`,
      }));

    if (newFeedExpenses.length > 0) {
      await Expense.insertMany(newFeedExpenses);
      totalFeedExpenses += newFeedExpenses.length;
      console.log(
        `Created ${newFeedExpenses.length} feed expense records for ${farmer.farmName}`
      );
    }
  }

  console.log(`Migration completed:`);
  console.log(`- Medicine expense records created: ${totalMedicineExpenses}`);
  console.log(`- Feed expense records created: ${totalFeedExpenses}`);
  console.log(
    `- Total expense records created: ${
      totalMedicineExpenses + totalFeedExpenses
    }`
  );

  process.exit(0);
}

migrateInventoryExpenses().catch((error) => {
  console.error("Migration failed", error);
  process.exit(1);
});
