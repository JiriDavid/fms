export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { requireUserId, getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import {
  jsonResponse,
  errorResponse,
  parseRequestBody,
} from "@/lib/api-helpers";
import { ensureFarmerProfile } from "@/lib/farmers";
import { logActivity } from "@/lib/activity";
import UsageLog from "@/models/UsageLog";
import Animal from "@/models/Animal";

export async function GET(request) {
  try {
    const ownerId = await requireUserId();
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const livestockBatchId = searchParams.get("livestockBatchId");

    const filter = { ownerId };
    if (livestockBatchId) filter.livestockBatchId = livestockBatchId;

    const logs = await UsageLog.find(filter)
      .populate("livestockBatchId", "batchName livestockType")
      .populate("medicineId", "name")
      .populate("feedId", "name")
      .sort({ date: -1 })
      .lean();

    return jsonResponse({ data: logs });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request) {
  try {
    const ownerId = await requireUserId();
    await connectToDatabase();
    const body = await parseRequestBody(request);
    const {
      livestockBatchId,
      medicineId,
      feedId,
      quantity,
      unit,
      date,
      reason,
      notes,
    } = body;

    if (!livestockBatchId || (!medicineId && !feedId)) {
      return errorResponse(
        "Livestock batch and medicineId or feedId are required",
        400
      );
    }

    // Validate that the animal exists and belongs to the owner
    const animal = await Animal.findOne({ _id: livestockBatchId, ownerId });
    if (!animal) {
      return errorResponse("Livestock batch not found", 404);
    }

    const log = await UsageLog.create({
      ownerId,
      farmerId: animal.farmerId,
      livestockBatchId,
      medicineId: medicineId || undefined,
      feedId: feedId || undefined,
      quantity: Number(quantity),
      unit: unit || "kg",
      date: date ? new Date(date) : new Date(),
      reason: reason || undefined, // Only for medicine usage
      notes,
    });

    await logActivity({
      ownerId,
      farmerId: animal.farmerId,
      type: "inventory",
      message: `Logged usage for ${animal.batchName || "livestock batch"}.`,
      relatedEntityId: log._id,
    });

    return jsonResponse({ data: log }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
