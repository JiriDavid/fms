/*
  Seed script for FarmTrack.
  Run with: `node .seed.js`
  Make sure you have MONGODB_URI (and optional SEED_OWNER_ID / SEED_SECOND_OWNER_ID) set in your environment.
  You can copy .env.example to .env.local and adjust.
*/

import "dotenv/config";

const ownerIdPrimary = process.env.SEED_OWNER_ID || "user_demo_primary";
const ownerIdSecondary =
  process.env.SEED_SECOND_OWNER_ID || "user_demo_secondary";

import { connectToDatabase } from "./lib/mongodb.js";

const { default: Farmer } = await import("./models/Farmer.js");
const { default: AnimalCategory } = await import("./models/AnimalCategory.js");
const { default: Animal } = await import("./models/Animal.js");
const { default: Medicine } = await import("./models/Medicine.js");
const { default: Feed } = await import("./models/Feed.js");
const { default: UsageLog } = await import("./models/UsageLog.js");
const { default: Sale } = await import("./models/Sale.js");
const { default: Expense } = await import("./models/Expense.js");
const { default: Task } = await import("./models/Task.js");
const { default: Activity } = await import("./models/Activity.js");

function daysAgo(number) {
  const date = new Date();
  date.setDate(date.getDate() - number);
  return date;
}

async function seedFarmer(ownerId, farmerInput) {
  await Promise.all([
    Animal.deleteMany({ ownerId }),
    AnimalCategory.deleteMany({ ownerId }),
    Medicine.deleteMany({ ownerId }),
    Feed.deleteMany({ ownerId }),
    UsageLog.deleteMany({ ownerId }),
    Sale.deleteMany({ ownerId }),
    Expense.deleteMany({ ownerId }),
    Task.deleteMany({ ownerId }),
    Activity.deleteMany({ ownerId }),
  ]);

  const farmer = await Farmer.findOneAndUpdate({ ownerId }, farmerInput, {
    upsert: true,
    new: true,
    setDefaultsOnInsert: true,
  });

  const categories = await AnimalCategory.insertMany([
    { ownerId, name: "Cattle", description: "Dairy and beef herd" },
    { ownerId, name: "Goat", description: "Boer meat goats" },
    { ownerId, name: "Chicken", description: "Layers and broilers" },
  ]);

  const categoryByName = categories.reduce((acc, category) => {
    acc[category.name] = category._id;
    return acc;
  }, {});

  const animals = await Animal.insertMany([
    {
      ownerId,
      farmerId: farmer._id,
      categoryId: categoryByName.Cattle,
      tagId: `CAT-${ownerId.slice(-4)}-001`,
      name: "Bella",
      gender: "female",
      status: "active",
      dateOfBirth: daysAgo(800),
      purchaseDate: daysAgo(420),
      purchasePrice: 1200,
      weightHistory: [
        { date: daysAgo(365), weightKg: 380 },
        { date: daysAgo(180), weightKg: 410 },
        { date: daysAgo(30), weightKg: 435 },
      ],
      healthRecords: [
        {
          date: daysAgo(200),
          type: "vaccination",
          description: "Foot-and-mouth booster",
          administeredBy: "Dr. Singh",
        },
      ],
    },
    {
      ownerId,
      farmerId: farmer._id,
      categoryId: categoryByName.Goat,
      tagId: `GOA-${ownerId.slice(-4)}-015`,
      name: "Sprout",
      gender: "female",
      status: "active",
      dateOfBirth: daysAgo(300),
      purchaseDate: daysAgo(250),
      purchasePrice: 180,
      weightHistory: [
        { date: daysAgo(200), weightKg: 32 },
        { date: daysAgo(90), weightKg: 35 },
        { date: daysAgo(7), weightKg: 37 },
      ],
      healthRecords: [
        {
          date: daysAgo(30),
          type: "vaccination",
          description: "Clostridial vaccine",
          administeredBy: "Nurse Patel",
        },
      ],
    },
    {
      ownerId,
      farmerId: farmer._id,
      categoryId: categoryByName.Chicken,
      tagId: `CHK-${ownerId.slice(-4)}-201`,
      name: "Broiler Batch 201",
      gender: "unknown",
      status: "active",
      dateOfBirth: daysAgo(50),
      purchaseDate: daysAgo(45),
      purchasePrice: 60,
      weightHistory: [
        { date: daysAgo(40), weightKg: 0.8 },
        { date: daysAgo(20), weightKg: 1.4 },
        { date: daysAgo(5), weightKg: 1.9 },
      ],
      healthRecords: [],
    },
  ]);

  await Medicine.insertMany([
    {
      ownerId,
      name: "Ivermectin",
      supplier: "RuralVet",
      batchNumber: `IVM-${ownerId.slice(-3)}`,
      dosageInstructions: "1ml per 50kg subcutaneous",
      quantityOnHand: 6,
      expiryDate: daysAgo(-120),
    },
    {
      ownerId,
      name: "Vitamin Booster",
      supplier: "AgriHealth",
      batchNumber: `VB-${ownerId.slice(-3)}`,
      dosageInstructions: "Add 10ml per 20L water",
      quantityOnHand: 3,
      expiryDate: daysAgo(-200),
    },
  ]);

  const feeds = await Feed.insertMany([
    {
      ownerId,
      type: "Dairy concentrate",
      supplier: "NutriFarm",
      quantityKg: 200,
      cost: 420,
    },
    {
      ownerId,
      type: "Goat ration",
      supplier: "PasturePro",
      quantityKg: 85,
      cost: 160,
    },
  ]);

  await UsageLog.insertMany([
    {
      ownerId,
      farmerId: farmer._id,
      animalId: animals[0]._id,
      medicineId: null,
      feedId: feeds[0]._id,
      quantity: 12,
      unit: "kg",
      date: daysAgo(3),
      notes: "Morning feeding",
    },
    {
      ownerId,
      farmerId: farmer._id,
      animalId: animals[1]._id,
      medicineId: null,
      feedId: feeds[1]._id,
      quantity: 4,
      unit: "kg",
      date: daysAgo(2),
      notes: "Evening ration",
    },
  ]);

  await Sale.insertMany([
    {
      ownerId,
      farmerId: farmer._id,
      date: daysAgo(10),
      buyer: "Sunrise Butchery",
      items: [
        { animalId: animals[1]._id, description: "Boer goat", amount: 220 },
      ],
      totalAmount: 220,
      notes: "Delivered live weight",
    },
    {
      ownerId,
      farmerId: farmer._id,
      date: daysAgo(40),
      buyer: "Daily Dairy Co-op",
      items: [{ description: "Milk supply", amount: 540 }],
      totalAmount: 540,
      notes: "Weekly milk collection",
    },
  ]);

  await Expense.insertMany([
    {
      ownerId,
      farmerId: farmer._id,
      date: daysAgo(8),
      category: "Feed",
      amount: 180,
      notes: "Purchased dairy concentrate",
    },
    {
      ownerId,
      farmerId: farmer._id,
      date: daysAgo(5),
      category: "Medicine",
      amount: 45,
      notes: "Vitamin booster",
    },
  ]);

  await Task.insertMany([
    {
      ownerId,
      farmerId: farmer._id,
      title: "Vaccinate goat herd",
      description: "Administer clostridial booster",
      dueDate: daysAgo(-2),
      status: "completed",
      relatedAnimalId: animals[1]._id,
      tags: ["health", "vaccination"],
    },
    {
      ownerId,
      farmerId: farmer._id,
      title: "Weigh broiler batch",
      description: "Record weights for batch 201",
      dueDate: daysAgo(-1),
      status: "pending",
      relatedAnimalId: animals[2]._id,
      tags: ["weight", "broilers"],
    },
  ]);

  await Activity.insertMany([
    {
      ownerId,
      farmerId: farmer._id,
      type: "health",
      message: "Recorded vaccination for Sprout.",
      relatedEntityId: animals[1]._id,
    },
    {
      ownerId,
      farmerId: farmer._id,
      type: "sale",
      message: "Logged sale to Sunrise Butchery for $220.",
      relatedEntityId: null,
    },
    {
      ownerId,
      farmerId: farmer._id,
      type: "task",
      message: "Created task: Weigh broiler batch.",
      relatedEntityId: null,
    },
  ]);

  return farmer;
}

async function main() {
  if (!process.env.MONGODB_URI) {
    console.error(
      "MONGODB_URI is required. Please create .env.local (see .env.example).\n"
    );
    process.exit(1);
  }

  await connectToDatabase();
  console.log("Connected to MongoDB");

  const farmers = await Promise.all([
    seedFarmer(ownerIdPrimary, {
      ownerId: ownerIdPrimary,
      email: `${ownerIdPrimary}@demo.farmtrack.app`,
      farmName: "Green Pastures Farm",
      location: "Eldoret, Kenya",
      contactNumber: "+254 700 555 010",
      description: "Mixed dairy and meat operation with rotational grazing.",
    }),
    seedFarmer(ownerIdSecondary, {
      ownerId: ownerIdSecondary,
      email: `${ownerIdSecondary}@demo.farmtrack.app`,
      farmName: "Valley Poultry",
      location: "Kisumu, Kenya",
      contactNumber: "+254 701 111 222",
      description: "Broiler and layer houses supplying regional hotels.",
    }),
  ]);

  console.log(`Seeded ${farmers.length} farmer profiles.`);
  console.log(
    "Remember to map SEED_OWNER_ID env vars to Clerk user IDs for login."
  );
  process.exit(0);
}

main().catch((error) => {
  console.error("Seed failed", error);
  process.exit(1);
});
