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

export async function GET(request) {
  try {
    const ownerId = await requireUserId();
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");
    const status = searchParams.get("status");

    const filter = { ownerId };
    if (categoryId) filter.categoryId = categoryId;
    if (status) filter.status = status;

    const animals = await Animal.find(filter)
      .populate("categoryId", "name")
      .sort({ createdAt: -1 })
      .lean();

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
      tagId,
      categoryId,
      gender,
      dateOfBirth,
      purchaseDate,
      purchasePrice,
      status,
      name,
      notes,
    } = body;

    if (!tagId || !categoryId) {
      return errorResponse("Tag ID and categoryId are required", 400);
    }

    const category = await AnimalCategory.findOne({ _id: categoryId, ownerId });
    if (!category) {
      return errorResponse("Category not found", 404);
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
      categoryId,
      tagId,
      name,
      gender: gender || "unknown",
      status: status || "active",
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      purchaseDate: purchaseDate ? new Date(purchaseDate) : undefined,
      purchasePrice: purchasePrice ? Number(purchasePrice) : undefined,
      notes,
    });

    await logActivity({
      ownerId,
      farmerId: farmer._id,
      type: "health",
      message: `Registered animal ${tagId}${name ? ` (${name})` : ""}.`,
    });

    return jsonResponse({ data: animal }, { status: 201 });
  } catch (error) {
    if (error.code === 11000) {
      return errorResponse("Tag already exists for this farm", 409);
    }
    return errorResponse(error);
  }
}
