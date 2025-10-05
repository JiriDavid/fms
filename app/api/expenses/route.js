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
import Expense from "@/models/Expense";

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

    const expenses = await Expense.find(filter).sort({ date: -1 }).lean();
    return jsonResponse({ data: expenses });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request) {
  try {
    const ownerId = await requireUserId();
    await connectToDatabase();
    const body = await parseRequestBody(request);
    const { date, category, amount, notes } = body;

    if (!date || !category || amount === undefined) {
      return errorResponse("Date, category, and amount are required", 400);
    }

    const clerkUser = await getCurrentUser();
    const farmer = await ensureFarmerProfile({
      ownerId,
      email: clerkUser?.emailAddresses?.[0]?.emailAddress,
    });

    const expense = await Expense.create({
      ownerId,
      farmerId: farmer._id,
      date: new Date(date),
      category,
      amount: Number(amount),
      notes,
    });

    await logActivity({
      ownerId,
      farmerId: farmer._id,
      type: "expense",
      message: `Recorded expense ${category} ($${Number(amount).toFixed(2)}).`,
      relatedEntityId: expense._id,
    });

    return jsonResponse({ data: expense }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
