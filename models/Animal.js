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
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "AnimalCategory",
      required: true,
    },
    tagId: { type: String, required: true },
    name: { type: String },
    gender: {
      type: String,
      enum: ["male", "female", "unknown"],
      default: "unknown",
    },
    dateOfBirth: { type: Date },
    status: {
      type: String,
      enum: ["active", "sold", "deceased"],
      default: "active",
    },
    weightHistory: { type: [WeightSchema], default: [] },
    healthRecords: { type: [HealthRecordSchema], default: [] },
    purchaseDate: { type: Date },
    purchasePrice: { type: Number },
    notes: { type: String },
  },
  { timestamps: true }
);

AnimalSchema.index({ ownerId: 1, tagId: 1 }, { unique: true });

export default mongoose.models.Animal || mongoose.model("Animal", AnimalSchema);
