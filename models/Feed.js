import mongoose, { Schema } from "mongoose";

const FeedSchema = new Schema(
  {
    ownerId: { type: String, index: true, required: true },
    name: { type: String, required: true },
    unit: { type: String, required: true, default: "kg" },
    quantityPurchased: { type: Number, required: true, min: 0 },
    cost: { type: Number, required: true, min: 0 },
    purchaseDate: { type: Date, required: true },
    supplier: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);

FeedSchema.index({ ownerId: 1, name: 1 });

export default mongoose.models.Feed || mongoose.model("Feed", FeedSchema);
