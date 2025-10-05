import mongoose, { Schema } from "mongoose";

const SaleItemSchema = new Schema(
  {
    animalId: { type: Schema.Types.ObjectId, ref: "Animal" },
    description: { type: String },
    amount: { type: Number, required: true },
  },
  { _id: false }
);

const SaleSchema = new Schema(
  {
    ownerId: { type: String, index: true, required: true },
    farmerId: { type: Schema.Types.ObjectId, ref: "Farmer", required: true },
    date: { type: Date, required: true },
    buyer: { type: String, required: true },
    items: { type: [SaleItemSchema], default: [] },
    totalAmount: { type: Number, required: true },
    notes: { type: String },
  },
  { timestamps: true }
);

SaleSchema.index({ ownerId: 1, date: -1 });

export default mongoose.models.Sale || mongoose.model("Sale", SaleSchema);
