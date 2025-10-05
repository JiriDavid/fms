import mongoose, { Schema } from "mongoose";

const MedicineSchema = new Schema(
  {
    ownerId: { type: String, index: true, required: true },
    name: { type: String, required: true },
    supplier: { type: String },
    batchNumber: { type: String },
    dosageInstructions: { type: String },
    quantityOnHand: { type: Number, default: 0 },
    expiryDate: { type: Date },
  },
  { timestamps: true }
);

MedicineSchema.index({ ownerId: 1, name: 1, batchNumber: 1 });

export default mongoose.models.Medicine ||
  mongoose.model("Medicine", MedicineSchema);
