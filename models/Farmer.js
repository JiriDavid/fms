import mongoose, { Schema } from "mongoose";

const FarmerSchema = new Schema(
  {
    ownerId: { type: String, index: true, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    farmName: {
      type: String,
      required: true,
      trim: true,
      default: "My Farm",
    },
    location: {
      type: String,
      required: true,
      trim: true,
      default: "Not set",
    },
    contactNumber: { type: String, trim: true },
    description: { type: String, trim: true },
  },
  { timestamps: true }
);

export default mongoose.models.Farmer || mongoose.model("Farmer", FarmerSchema);
