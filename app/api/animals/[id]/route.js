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

    const animal = await Animal.findOne({ _id: id, ownerId })
      .populate("categoryId", "name")
      .lean();

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
      tagId,
      name,
      categoryId,
      gender,
      status,
      dateOfBirth,
      purchaseDate,
      purchasePrice,
      notes,
      weightHistory = [],
      healthRecords = [],
      activityMessage,
    } = body;

    const animal = await Animal.findOne({ _id: id, ownerId });
    if (!animal) {
      return errorResponse("Animal not found", 404);
    }

    if (categoryId) {
      const category = await AnimalCategory.findOne({
        _id: categoryId,
        ownerId,
      });
      if (!category) {
        return errorResponse("Category not found", 404);
      }
      animal.categoryId = categoryId;
    }

    Object.assign(animal, {
      tagId: tagId ?? animal.tagId,
      name,
      gender: gender ?? animal.gender,
      status: status ?? animal.status,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : animal.dateOfBirth,
      purchaseDate: purchaseDate ? new Date(purchaseDate) : animal.purchaseDate,
      purchasePrice:
        purchasePrice === undefined || purchasePrice === null
          ? animal.purchasePrice
          : Number(purchasePrice),
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
    if (error.code === 11000) {
      return errorResponse("Tag already exists for this farm", 409);
    }
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
