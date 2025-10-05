export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { requireUserId } from "@/lib/auth";
import { ensureDefaultCategories } from "@/lib/categories";
import { connectToDatabase } from "@/lib/mongodb";
import {
  jsonResponse,
  errorResponse,
  parseRequestBody,
} from "@/lib/api-helpers";
import AnimalCategory from "@/models/AnimalCategory";

export async function GET() {
  try {
    const ownerId = await requireUserId();
    await connectToDatabase();
    await ensureDefaultCategories(ownerId);

    const categories = await AnimalCategory.find({ ownerId })
      .sort({ name: 1 })
      .lean();
    return jsonResponse({ data: categories });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request) {
  try {
    const ownerId = await requireUserId();
    await connectToDatabase();
    const body = await parseRequestBody(request);
    const { name, description } = body;
    if (!name) return errorResponse("Name is required", 400);

    const category = await AnimalCategory.create({
      ownerId,
      name,
      description,
    });
    return jsonResponse({ data: category }, { status: 201 });
  } catch (error) {
    if (error.code === 11000) {
      return errorResponse("Category already exists", 409);
    }
    return errorResponse(error);
  }
}
