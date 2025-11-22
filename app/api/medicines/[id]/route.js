export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { requireUserId } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import {
  jsonResponse,
  errorResponse,
  parseRequestBody,
} from "@/lib/api-helpers";
import Medicine from "@/models/Medicine";

export async function PUT(request, { params }) {
  try {
    const ownerId = await requireUserId();
    const { id } = params;
    await connectToDatabase();

    const body = await parseRequestBody(request);
    const update = {
      ...body,
    };
    if (body.quantityPurchased !== undefined) {
      update.quantityPurchased = Number(body.quantityPurchased);
    }
    if (body.cost !== undefined) {
      update.cost = Number(body.cost);
    }
    if (body.purchaseDate) {
      update.purchaseDate = new Date(body.purchaseDate);
    }
    if (body.expiryDate) {
      update.expiryDate = new Date(body.expiryDate);
    }

    const medicine = await Medicine.findOneAndUpdate(
      { _id: id, ownerId },
      update,
      {
        new: true,
      }
    );
    if (!medicine) return errorResponse("Medicine not found", 404);

    return jsonResponse({ data: medicine });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(_request, { params }) {
  try {
    const ownerId = await requireUserId();
    const { id } = params;
    await connectToDatabase();

    const medicine = await Medicine.findOneAndDelete({ _id: id, ownerId });
    if (!medicine) return errorResponse("Medicine not found", 404);

    return jsonResponse({ data: { id } });
  } catch (error) {
    return errorResponse(error);
  }
}
