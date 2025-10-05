import mongoose, { Schema } from "mongoose";

const AnimalCategorySchema = new Schema(
  {
    ownerId: { type: String, index: true, required: true },
    name: { type: String, required: true },
    description: { type: String },
  },
  { timestamps: true }
);

AnimalCategorySchema.index({ ownerId: 1, name: 1 }, { unique: true });

export default mongoose.models.AnimalCategory ||
  mongoose.model("AnimalCategory", AnimalCategorySchema);
