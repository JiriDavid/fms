import mongoose, { Schema } from "mongoose";

const MedicineSchema = new Schema(
  {
    ownerId: { type: String, index: true, required: true },
    name: { type: String, required: true },
    purpose: { type: String, required: true },
    quantityPurchased: { type: Number, required: true, min: 0 },
    unit: { type: String, required: true, default: "ml" },
    cost: { type: Number, required: true, min: 0 },
    purchaseDate: { type: Date, required: true },
    expiryDate: { type: Date, required: true },
    supplier: { type: String },
    batchNumber: { type: String },
    dosageInstructions: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);

MedicineSchema.index({ ownerId: 1, name: 1, batchNumber: 1 });

export default mongoose.models.Medicine ||
  mongoose.model("Medicine", MedicineSchema);
