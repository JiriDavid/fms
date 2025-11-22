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

  const animals = await Animal.insertMany([
    {
      ownerId,
      farmerId: farmer._id,
      livestockType: "Chicken",
      breed: "Rhode Island Red",
      batchName: "Broiler Batch 2025-001",
      quantity: 50,
      acquisitionDate: daysAgo(45),
      purchaseCost: 60,
      costType: "per_unit",
      purpose: "Broiler",
      location: "Coop A",
      status: "active",
      weightHistory: [
        { date: daysAgo(40), weightKg: 0.8 },
        { date: daysAgo(20), weightKg: 1.4 },
        { date: daysAgo(5), weightKg: 1.9 },
      ],
      healthRecords: [],
    },
    {
      ownerId,
      farmerId: farmer._id,
      livestockType: "Chicken",
      breed: "Leghorn",
      batchName: "Layer Batch 2025-002",
      quantity: 100,
      acquisitionDate: daysAgo(30),
      purchaseCost: 1500,
      costType: "total",
      purpose: "Layer",
      location: "Coop B",
      status: "active",
      weightHistory: [],
      healthRecords: [],
    },
    {
      ownerId,
      farmerId: farmer._id,
      livestockType: "Pig",
      breed: "Large White",
      batchName: "Weaner Pigs 2025-003",
      quantity: 20,
      acquisitionDate: daysAgo(60),
      purchaseCost: 800,
      costType: "total",
      purpose: "Meat",
      location: "Pig Pen 1",
      status: "active",
      weightHistory: [
        { date: daysAgo(50), weightKg: 15 },
        { date: daysAgo(30), weightKg: 35 },
        { date: daysAgo(10), weightKg: 55 },
      ],
      healthRecords: [],
    },
    {
      ownerId,
      farmerId: farmer._id,
      livestockType: "Sheep",
      breed: "Merino",
      batchName: "Lamb Flock 2025-004",
      quantity: 15,
      acquisitionDate: daysAgo(90),
      purchaseCost: 1200,
      costType: "total",
      purpose: "Wool",
      location: "Sheep Pasture A",
      status: "active",
      weightHistory: [],
      healthRecords: [],
    },
    {
      ownerId,
      farmerId: farmer._id,
      livestockType: "Cattle",
      breed: "Friesian",
      batchName: "Dairy Herd 2025-005",
      quantity: 8,
      acquisitionDate: daysAgo(120),
      purchaseCost: 4800,
      costType: "total",
      purpose: "Milk",
      location: "Barn A",
      status: "active",
      weightHistory: [],
      healthRecords: [],
    },
    {
      ownerId,
      farmerId: farmer._id,
      livestockType: "Goat",
      breed: "Saanen",
      batchName: "Dairy Goats 2025-006",
      quantity: 12,
      acquisitionDate: daysAgo(75),
      purchaseCost: 960,
      costType: "total",
      purpose: "Milk",
      location: "Goat Shed",
      status: "active",
      weightHistory: [],
      healthRecords: [],
    },
    {
      ownerId,
      farmerId: farmer._id,
      livestockType: "Rabbit",
      breed: "New Zealand White",
      batchName: "Meat Rabbits 2025-007",
      quantity: 30,
      acquisitionDate: daysAgo(45),
      purchaseCost: 450,
      costType: "total",
      purpose: "Meat",
      location: "Rabbit Hutch",
      status: "active",
      weightHistory: [],
      healthRecords: [],
    },
  ]);

  // Create expense records for animals with purchase costs
  const animalExpenses = animals
    .filter(animal => animal.purchaseCost > 0)
    .map(animal => ({
      ownerId,
      farmerId: farmer._id,
      category: "Livestock",
      description: `Purchase of ${animal.batchName} (${animal.livestockType})`,
      amount: animal.purchaseCost,
      date: animal.acquisitionDate,
      livestockBatchId: animal._id,
      notes: `Acquisition cost for ${animal.quantity} ${animal.livestockType}${animal.quantity > 1 ? 's' : ''}`,
    }));

  if (animalExpenses.length > 0) {
    await Expense.insertMany(animalExpenses);
  }

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
      notes: "Morning feeding for broiler batch",
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
      notes: "Evening ration for layer batch",
    },
  ]);

  await Sale.insertMany([
    {
      ownerId,
      farmerId: farmer._id,
      date: daysAgo(10),
      buyer: "Sunrise Butchery",
      items: [
        {
          animalId: animals[0]._id,
          description: "Broiler chickens",
          amount: 220,
        },
      ],
      totalAmount: 220,
      notes: "Sold 20 broiler chickens",
    },
    {
      ownerId,
      farmerId: farmer._id,
      date: daysAgo(40),
      buyer: "Local Market",
      items: [{ description: "Egg supply", amount: 540 }],
      totalAmount: 540,
      notes: "Weekly egg collection from layers",
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
      title: "Vaccinate broiler batch",
      description: "Administer Newcastle vaccine to broiler batch",
      dueDate: daysAgo(-2),
      status: "completed",
      relatedAnimalId: animals[0]._id,
      tags: ["health", "vaccination"],
    },
    {
      ownerId,
      farmerId: farmer._id,
      title: "Weigh broiler batch",
      description: "Record weights for broiler batch 2025-001",
      dueDate: daysAgo(-1),
      status: "pending",
      relatedAnimalId: animals[0]._id,
      tags: ["weight", "broilers"],
    },
  ]);

  await Activity.insertMany([
    {
      ownerId,
      farmerId: farmer._id,
      type: "health",
      message: "Recorded vaccination for broiler batch.",
      relatedEntityId: animals[0]._id,
    },
    {
      ownerId,
      farmerId: farmer._id,
      type: "sale",
      message: "Logged sale of broiler chickens for $220.",
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
