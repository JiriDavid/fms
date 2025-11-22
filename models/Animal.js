import mongoose, { Schema } from "mongoose";

const WeightSchema = new Schema(
  {
    date: { type: Date, required: true },
    weightKg: { type: Number, required: true },
  },
  { _id: false }
);

const HealthRecordSchema = new Schema(
  {
    date: { type: Date, required: true },
    type: {
      type: String,
      enum: ["vaccination", "illness", "treatment", "other"],
      required: true,
    },
    description: { type: String, required: true },
    administeredBy: { type: String },
  },
  { _id: false }
);

const AnimalSchema = new Schema(
  {
    ownerId: { type: String, index: true, required: true },
    farmerId: { type: Schema.Types.ObjectId, ref: "Farmer", required: true },
    livestockType: {
      type: String,
      required: true,
      enum: [
        "Chicken",
        "Duck",
        "Turkey",
        "Goose",
        "Quail",
        "Pigeon",
        "Pig",
        "Sheep",
        "Cattle",
        "Goat",
        "Rabbit",
        "Horse",
        "Donkey",
        "Other",
      ],
    },
    breed: { type: String, required: true },
    batchName: { type: String, required: true },
    quantity: { type: Number, default: 1, min: 1 },
    acquisitionDate: { type: Date, required: true },
    purchaseCost: { type: Number, required: true, min: 0 },
    costType: {
      type: String,
      enum: ["per_unit", "total"],
      default: "total",
    },
    purpose: {
      type: String,
      required: true,
      enum: [
        "Broiler",
        "Layer",
        "Breeder",
        "Meat",
        "Milk",
        "Wool",
        "Work",
        "Breeding",
        "Other",
      ],
    },
    location: { type: String, required: true },
    status: {
      type: String,
      enum: ["active", "sold", "deceased"],
      default: "active",
    },
    weightHistory: { type: [WeightSchema], default: [] },
    healthRecords: { type: [HealthRecordSchema], default: [] },
    notes: { type: String },
  },
  { timestamps: true }
);

AnimalSchema.index({ ownerId: 1, batchName: 1 }, { unique: true });

export default mongoose.models.Animal || mongoose.model("Animal", AnimalSchema);
