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

export async function PUT(request, { params }) {
  try {
    const ownerId = await requireUserId();
    const { id } = params;
    await connectToDatabase();

    const body = await parseRequestBody(request);
    const update = { ...body };
    if (body.quantityPurchased !== undefined)
      update.quantityPurchased = Number(body.quantityPurchased);
    if (body.cost !== undefined) update.cost = Number(body.cost);
    if (body.purchaseDate) update.purchaseDate = new Date(body.purchaseDate);

    const feed = await Feed.findOneAndUpdate({ _id: id, ownerId }, update, {
      new: true,
    });
    if (!feed) return errorResponse("Feed not found", 404);

    return jsonResponse({ data: feed });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(_request, { params }) {
  try {
    const ownerId = await requireUserId();
    const { id } = params;
    await connectToDatabase();

    const feed = await Feed.findOneAndDelete({ _id: id, ownerId });
    if (!feed) return errorResponse("Feed not found", 404);

    return jsonResponse({ data: { id } });
  } catch (error) {
    return errorResponse(error);
  }
}
