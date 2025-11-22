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
import Animal from "@/models/Animal";
import AnimalCategory from "@/models/AnimalCategory";
import Expense from "@/models/Expense";

export async function GET(request) {
  try {
    const ownerId = await requireUserId();
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const livestockType = searchParams.get("livestockType");
    const status = searchParams.get("status");

    const filter = { ownerId };
    if (livestockType) filter.livestockType = livestockType;
    if (status) filter.status = status;

    const animals = await Animal.find(filter).sort({ createdAt: -1 }).lean();

    return jsonResponse({ data: animals });
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
      livestockType,
      breed,
      batchName,
      quantity,
      acquisitionDate,
      purchaseCost,
      costType,
      purpose,
      location,
      notes,
    } = body;

    if (
      !livestockType ||
      !breed ||
      !batchName ||
      !acquisitionDate ||
      !purchaseCost ||
      !purpose ||
      !location
    ) {
      return errorResponse("All required fields must be provided", 400);
    }

    const clerkUser = await getCurrentUser();
    const farmer = await ensureFarmerProfile({
      ownerId,
      email: clerkUser?.emailAddresses?.[0]?.emailAddress,
    });

    if (!farmer) {
      return errorResponse("Unable to resolve farmer profile", 500);
    }

    const animal = await Animal.create({
      ownerId,
      farmerId: farmer._id,
      livestockType,
      breed,
      batchName,
      quantity: quantity ? Number(quantity) : 1,
      acquisitionDate: new Date(acquisitionDate),
      purchaseCost: Number(purchaseCost),
      costType: costType || "total",
      purpose,
      location,
      notes,
    });

    // Create expense record if purchase cost is provided
    if (Number(purchaseCost) > 0) {
      await Expense.create({
        ownerId,
        farmerId: farmer._id,
        category: "Livestock",
        description: `Purchase of ${batchName} (${livestockType})`,
        amount: Number(purchaseCost),
        date: new Date(acquisitionDate),
        livestockBatchId: animal._id,
        notes: `Acquisition cost for ${quantity || 1} ${livestockType}${quantity > 1 ? 's' : ''}`,
      });
    }

    await logActivity({
      ownerId,
      farmerId: farmer._id,
      type: "health",
      message: `Registered livestock ${batchName} (${
        quantity || 1
      } ${livestockType})${Number(purchaseCost) > 0 ? ` for $${Number(purchaseCost).toFixed(2)}` : ''}.`,
    });

    return jsonResponse({ data: animal }, { status: 201 });
  } catch (error) {
    if (error.code === 11000) {
      return errorResponse("Batch name already exists for this farm", 409);
    }
    return errorResponse(error);
  }
}
