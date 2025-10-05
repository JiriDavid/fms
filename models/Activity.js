import mongoose, { Schema } from "mongoose";

const ActivitySchema = new Schema(
  {
    ownerId: { type: String, index: true, required: true },
    farmerId: { type: Schema.Types.ObjectId, ref: "Farmer", required: true },
    type: {
      type: String,
      enum: [
        "task",
        "sale",
        "expense",
        "health",
        "note",
        "feed",
        "inventory",
        "finance",
      ],
      default: "note",
    },
    message: { type: String, required: true },
    relatedEntityId: { type: Schema.Types.ObjectId },
    meta: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

ActivitySchema.index({ ownerId: 1, createdAt: -1 });

export default mongoose.models.Activity ||
  mongoose.model("Activity", ActivitySchema);
