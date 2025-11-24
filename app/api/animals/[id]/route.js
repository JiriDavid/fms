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

export async function GET(_request, { params }) {
  try {
    const ownerId = await requireUserId();
    const { id } = params;
    await connectToDatabase();

    const animal = await Animal.findOne({ _id: id, ownerId }).lean();

    if (!animal) {
      return errorResponse("Animal not found", 404);
    }

    return jsonResponse({ data: animal });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PUT(request, { params }) {
  try {
    const ownerId = await requireUserId();
    const { id } = params;
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
      weightHistory = [],
      healthRecords = [],
      activityMessage,
    } = body;

    const animal = await Animal.findOne({ _id: id, ownerId });
    if (!animal) {
      return errorResponse("Animal not found", 404);
    }

    Object.assign(animal, {
      livestockType: livestockType ?? animal.livestockType,
      breed: breed ?? animal.breed,
      batchName: batchName ?? animal.batchName,
      quantity: quantity ? Number(quantity) : animal.quantity,
      acquisitionDate: acquisitionDate
        ? new Date(acquisitionDate)
        : animal.acquisitionDate,
      purchaseCost:
        purchaseCost !== undefined ? Number(purchaseCost) : animal.purchaseCost,
      costType: costType ?? animal.costType,
      purpose: purpose ?? animal.purpose,
      location: location ?? animal.location,
      notes,
    });

    animal.weightHistory = weightHistory.map((entry) => ({
      date: entry.date,
      weightKg: Number(entry.weightKg),
    }));
    animal.healthRecords = healthRecords.map((entry) => ({
      date: entry.date,
      type: entry.type,
      description: entry.description,
      administeredBy: entry.administeredBy,
    }));

    await animal.save();

    if (activityMessage) {
      const clerkUser = await getCurrentUser();
      const farmer = await ensureFarmerProfile({
        ownerId,
        email: clerkUser?.emailAddresses?.[0]?.emailAddress,
      });
      await logActivity({
        ownerId,
        farmerId: farmer?._id,
        type: "health",
        message: activityMessage,
        relatedEntityId: animal._id,
      });
    }

    return jsonResponse({ data: animal });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(_request, { params }) {
  try {
    const ownerId = await requireUserId();
    const { id } = params;
    await connectToDatabase();

    const animal = await Animal.findOneAndDelete({ _id: id, ownerId });

    if (!animal) {
      return errorResponse("Animal not found", 404);
    }

    await logActivity({
      ownerId,
      farmerId: animal.farmerId,
      type: "health",
      message: `Deleted animal ${animal.tagId}.`,
      relatedEntityId: id,
    });

    return jsonResponse({ data: { id } });
  } catch (error) {
    return errorResponse(error);
  }
}
