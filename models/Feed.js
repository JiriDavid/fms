import mongoose, { Schema } from "mongoose";

const FeedSchema = new Schema(
  {
    ownerId: { type: String, index: true, required: true },
    type: { type: String, required: true },
    supplier: { type: String },
    quantityKg: { type: Number, default: 0 },
    cost: { type: Number, default: 0 },
    notes: { type: String },
  },
  { timestamps: true }
);

FeedSchema.index({ ownerId: 1, type: 1 });

export default mongoose.models.Feed || mongoose.model("Feed", FeedSchema);
