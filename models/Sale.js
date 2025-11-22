import mongoose, { Schema } from "mongoose";

const SaleSchema = new Schema(
  {
    ownerId: { type: String, index: true, required: true },
    farmerId: { type: Schema.Types.ObjectId, ref: "Farmer", required: true },
    productSold: { type: String, required: true },
    quantity: { type: Number, required: true, min: 0 },
    unitPrice: { type: Number, required: true, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    saleDate: { type: Date, required: true },
    buyer: { type: String },
    livestockBatchId: { type: Schema.Types.ObjectId, ref: "Animal" },
    notes: { type: String },
  },
  { timestamps: true }
);

SaleSchema.index({ ownerId: 1, saleDate: -1 });
SaleSchema.index({ livestockBatchId: 1 });

export default mongoose.models.Sale || mongoose.model("Sale", SaleSchema);
