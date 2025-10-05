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
    const { date, buyer, items = [], notes } = body;

    if (!date || !buyer) {
      return errorResponse("Date and buyer are required", 400);
    }

    const normalizedItems = (Array.isArray(items) ? items : [items]).map(
      (item) => ({
        animalId: item.animalId || undefined,
        description: item.description || "Animal sale",
        amount: Number(item.amount || item.price || 0),
      })
    );

    const totalAmount = normalizedItems.reduce(
      (sum, item) => sum + (item.amount || 0),
      0
    );

    const clerkUser = await getCurrentUser();
    const farmer = await ensureFarmerProfile({
      ownerId,
      email: clerkUser?.emailAddresses?.[0]?.emailAddress,
    });

    const sale = await Sale.create({
      ownerId,
      farmerId: farmer._id,
      date: new Date(date),
      buyer,
      items: normalizedItems,
      totalAmount,
      notes,
    });

    await logActivity({
      ownerId,
      farmerId: farmer._id,
      type: "sale",
      message: `Recorded sale to ${buyer} ($${totalAmount.toFixed(2)}).`,
      relatedEntityId: sale._id,
    });

    return jsonResponse({ data: sale }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
