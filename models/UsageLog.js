import mongoose, { Schema } from "mongoose";

const UsageLogSchema = new Schema(
  {
    ownerId: { type: String, index: true, required: true },
    farmerId: { type: Schema.Types.ObjectId, ref: "Farmer", required: true },
    animalId: { type: Schema.Types.ObjectId, ref: "Animal" },
    medicineId: { type: Schema.Types.ObjectId, ref: "Medicine" },
    feedId: { type: Schema.Types.ObjectId, ref: "Feed" },
    quantity: { type: Number, required: true },
    unit: { type: String, default: "kg" },
    date: { type: Date, required: true },
    notes: { type: String },
  },
  { timestamps: true }
);

UsageLogSchema.index({ ownerId: 1, date: -1 });

export default mongoose.models.UsageLog ||
  mongoose.model("UsageLog", UsageLogSchema);
