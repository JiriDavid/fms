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

export async function GET() {
  try {
    const ownerId = await requireUserId();
    await connectToDatabase();
    const medicines = await Medicine.find({ ownerId })
      .sort({ createdAt: -1 })
      .lean();
    return jsonResponse({ data: medicines });
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
      name,
      supplier,
      batchNumber,
      dosageInstructions,
      quantityOnHand,
      expiryDate,
    } = body;

    if (!name) return errorResponse("Name is required", 400);

    const medicine = await Medicine.create({
      ownerId,
      name,
      supplier,
      batchNumber,
      dosageInstructions,
      quantityOnHand: quantityOnHand ? Number(quantityOnHand) : 0,
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
    });

    return jsonResponse({ data: medicine }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
