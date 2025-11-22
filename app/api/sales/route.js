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
import Sale from "@/models/Sale";
import Animal from "@/models/Animal";

export async function GET(request) {
  try {
    const ownerId = await requireUserId();
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    const filter = { ownerId };
    if (start || end) {
      filter.date = {};
      if (start) filter.date.$gte = new Date(start);
      if (end) filter.date.$lte = new Date(end);
    }

    const sales = await Sale.find(filter).sort({ date: -1 }).lean();
    return jsonResponse({ data: sales });
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
      productSold,
      quantity,
      unitPrice,
      totalAmount,
      saleDate,
      buyer,
      livestockBatchId,
      notes,
    } = body;

    if (
      !productSold ||
      !quantity ||
      unitPrice === undefined ||
      !totalAmount ||
      !saleDate
    ) {
      return errorResponse(
        "Product sold, quantity, unit price, total amount, and sale date are required",
        400
      );
    }

    const clerkUser = await getCurrentUser();
    const farmer = await ensureFarmerProfile({
      ownerId,
      email: clerkUser?.emailAddresses?.[0]?.emailAddress,
    });

    // Validate livestockBatchId if provided
    if (livestockBatchId) {
      const animal = await Animal.findOne({ _id: livestockBatchId, ownerId });
      if (!animal) {
        return errorResponse("Livestock batch not found", 404);
      }
    }

    const sale = await Sale.create({
      ownerId,
      farmerId: farmer._id,
      productSold,
      quantity: Number(quantity),
      unitPrice: Number(unitPrice),
      totalAmount: Number(totalAmount),
      saleDate: new Date(saleDate),
      buyer: buyer || undefined,
      livestockBatchId: livestockBatchId || undefined,
      notes,
    });

    await logActivity({
      ownerId,
      farmerId: farmer._id,
      type: "sale",
      message: `Recorded sale of ${quantity} ${productSold} for $${totalAmount.toFixed(
        2
      )}.`,
      relatedEntityId: sale._id,
    });

    return jsonResponse({ data: sale }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
