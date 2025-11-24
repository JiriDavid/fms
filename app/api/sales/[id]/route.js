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
    const {
      productSold,
      quantity,
      unitPrice,
      totalAmount,
      saleDate,
      buyer,
      livestockBatchId,
      notes,
    } = body;

    const update = {};
    if (productSold) update.productSold = productSold;
    if (quantity !== undefined) update.quantity = Number(quantity);
    if (unitPrice !== undefined) update.unitPrice = Number(unitPrice);
    if (totalAmount !== undefined) update.totalAmount = Number(totalAmount);
    if (saleDate) update.saleDate = new Date(saleDate);
    if (buyer !== undefined) update.buyer = buyer;
    if (livestockBatchId !== undefined)
      update.livestockBatchId = livestockBatchId;
    if (notes !== undefined) update.notes = notes;

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
