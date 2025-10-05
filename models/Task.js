import mongoose, { Schema } from "mongoose";

const TaskSchema = new Schema(
  {
    ownerId: { type: String, index: true, required: true },
    farmerId: { type: Schema.Types.ObjectId, ref: "Farmer", required: true },
    title: { type: String, required: true },
    description: { type: String },
    dueDate: { type: Date },
    assigneeId: { type: String },
    status: {
      type: String,
      enum: ["pending", "in_progress", "completed"],
      default: "pending",
    },
    relatedAnimalId: { type: Schema.Types.ObjectId, ref: "Animal" },
    tags: { type: [String], default: [] },
  },
  { timestamps: true }
);

TaskSchema.index({ ownerId: 1, status: 1 });

export default mongoose.models.Task || mongoose.model("Task", TaskSchema);
