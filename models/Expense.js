import mongoose, { Schema } from "mongoose";

const ExpenseSchema = new Schema(
  {
    ownerId: { type: String, index: true, required: true },
    farmerId: { type: Schema.Types.ObjectId, ref: "Farmer", required: true },
    date: { type: Date, required: true },
    category: { type: String, required: true },
    amount: { type: Number, required: true },
    notes: { type: String },
  },
  { timestamps: true }
);

ExpenseSchema.index({ ownerId: 1, date: -1 });

export default mongoose.models.Expense ||
  mongoose.model("Expense", ExpenseSchema);
