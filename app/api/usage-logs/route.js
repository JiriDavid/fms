export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { requireUserId } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import {
  jsonResponse,
  errorResponse,
  parseRequestBody,
} from "@/lib/api-helpers";
import { logActivity } from "@/lib/activity";
import UsageLog from "@/models/UsageLog";
import Animal from "@/models/Animal";

export async function GET(request) {
  try {
    const ownerId = await requireUserId();
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const animalId = searchParams.get("animalId");

    const filter = { ownerId };
    if (animalId) filter.animalId = animalId;

    const logs = await UsageLog.find(filter)
      .populate("animalId", "tagId name")
      .populate("medicineId", "name")
      .populate("feedId", "type")
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
    const { animalId, medicineId, feedId, quantity, unit, date, notes } = body;

    if (!animalId || (!medicineId && !feedId)) {
      return errorResponse("Animal and medicineId or feedId are required", 400);
    }

    const log = await UsageLog.create({
      ownerId,
      animalId,
      medicineId: medicineId || undefined,
      feedId: feedId || undefined,
      quantity: Number(quantity),
      unit: unit || "kg",
      date: date ? new Date(date) : new Date(),
      notes,
    });

    const animal = await Animal.findById(animalId);
    await logActivity({
      ownerId,
      farmerId: animal?.farmerId,
      type: "inventory",
      message: `Logged usage for ${animal?.tagId || "animal"}.`,
      relatedEntityId: log._id,
    });

    return jsonResponse({ data: log }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
