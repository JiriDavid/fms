export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { requireUserId } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import {
  jsonResponse,
  errorResponse,
  parseRequestBody,
} from "@/lib/api-helpers";
import Sale from "@/models/Sale";

export async function PUT(request, { params }) {
  try {
    const ownerId = await requireUserId();
    const { id } = params;
    await connectToDatabase();
    const body = await parseRequestBody(request);
    const { date, buyer, items, notes } = body;

    const update = {};
    if (date) update.date = new Date(date);
    if (buyer) update.buyer = buyer;
    if (notes !== undefined) update.notes = notes;
    if (items) {
      const normalizedItems = items.map((item) => ({
        animalId: item.animalId || undefined,
        description: item.description,
        amount: Number(item.amount),
      }));
      update.items = normalizedItems;
      update.totalAmount = normalizedItems.reduce(
        (sum, item) => sum + (item.amount || 0),
        0
      );
    }

    const sale = await Sale.findOneAndUpdate({ _id: id, ownerId }, update, {
      new: true,
    });
    if (!sale) return errorResponse("Sale not found", 404);

    return jsonResponse({ data: sale });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(_request, { params }) {
  try {
    const ownerId = await requireUserId();
    const { id } = params;
    await connectToDatabase();

    const sale = await Sale.findOneAndDelete({ _id: id, ownerId });
    if (!sale) return errorResponse("Sale not found", 404);

    return jsonResponse({ data: { id } });
  } catch (error) {
    return errorResponse(error);
  }
}
