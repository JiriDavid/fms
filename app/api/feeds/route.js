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
import Feed from "@/models/Feed";
import Expense from "@/models/Expense";

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
    const {
      name,
      unit,
      quantityPurchased,
      cost,
      purchaseDate,
      supplier,
      notes,
    } = body;
    if (!name) return errorResponse("Feed name is required", 400);
    if (!unit) return errorResponse("Unit is required", 400);
    if (!quantityPurchased || quantityPurchased <= 0)
      return errorResponse("Valid quantity purchased is required", 400);
    if (!cost || cost < 0) return errorResponse("Valid cost is required", 400);
    if (!purchaseDate) return errorResponse("Purchase date is required", 400);

    const clerkUser = await getCurrentUser();
    const farmer = await ensureFarmerProfile({
      ownerId,
      email: clerkUser?.emailAddresses?.[0]?.emailAddress,
    });

    const feed = await Feed.create({
      ownerId,
      name,
      unit,
      quantityPurchased: Number(quantityPurchased),
      cost: Number(cost),
      purchaseDate: new Date(purchaseDate),
      supplier,
      notes,
    });

    // Create expense record for feed purchase
    if (Number(cost) > 0) {
      await Expense.create({
        ownerId,
        farmerId: farmer._id,
        category: "Feed",
        description: `Purchase of ${name} (${quantityPurchased} ${unit})`,
        amount: Number(cost),
        date: new Date(purchaseDate),
        supplier: supplier || undefined,
        notes: `Feed purchase: ${name}`,
      });
    }

    await logActivity({
      ownerId,
      farmerId: farmer._id,
      type: "inventory",
      message: `Purchased ${quantityPurchased} ${unit} of ${name} for $${Number(
        cost
      ).toFixed(2)}.`,
    });

    return jsonResponse({ data: feed }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
