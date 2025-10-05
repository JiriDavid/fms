export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { requireUserId } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import {
  jsonResponse,
  errorResponse,
  parseRequestBody,
} from "@/lib/api-helpers";
import AnimalCategory from "@/models/AnimalCategory";

export async function PUT(request, { params }) {
  try {
    const ownerId = await requireUserId();
    const { id } = params;
    await connectToDatabase();

    const body = await parseRequestBody(request);
    const { name, description } = body;
    if (!name) return errorResponse("Name is required", 400);

    const category = await AnimalCategory.findOneAndUpdate(
      { _id: id, ownerId },
      { name, description },
      { new: true }
    );

    if (!category) return errorResponse("Category not found", 404);

    return jsonResponse({ data: category });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(_request, { params }) {
  try {
    const ownerId = await requireUserId();
    const { id } = params;
    await connectToDatabase();

    const category = await AnimalCategory.findOneAndDelete({
      _id: id,
      ownerId,
    });
    if (!category) return errorResponse("Category not found", 404);

    return jsonResponse({ data: { id } });
  } catch (error) {
    return errorResponse(error);
  }
}
