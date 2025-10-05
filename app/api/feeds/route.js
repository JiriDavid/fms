export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { requireUserId } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import {
  jsonResponse,
  errorResponse,
  parseRequestBody,
} from "@/lib/api-helpers";
import Feed from "@/models/Feed";

export async function GET() {
  try {
    const ownerId = await requireUserId();
    await connectToDatabase();
    const feeds = await Feed.find({ ownerId }).sort({ createdAt: -1 }).lean();
    return jsonResponse({ data: feeds });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request) {
  try {
    const ownerId = await requireUserId();
    await connectToDatabase();
    const body = await parseRequestBody(request);
    const { type, supplier, quantityKg, cost, notes } = body;
    if (!type) return errorResponse("Feed type is required", 400);

    const feed = await Feed.create({
      ownerId,
      type,
      supplier,
      quantityKg: quantityKg ? Number(quantityKg) : 0,
      cost: cost ? Number(cost) : 0,
      notes,
    });

    return jsonResponse({ data: feed }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
