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
    const {
      category,
      description,
      amount,
      date,
      livestockBatchId,
      supplier,
      notes,
    } = body;

    if (!category || !description || amount === undefined || !date) {
      return errorResponse(
        "Category, description, amount, and date are required",
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

    const expense = await Expense.create({
      ownerId,
      farmerId: farmer._id,
      category,
      description,
      amount: Number(amount),
      date: new Date(date),
      livestockBatchId: livestockBatchId || undefined,
      supplier: supplier || undefined,
      notes,
    });

    await logActivity({
      ownerId,
      farmerId: farmer._id,
      type: "expense",
      message: `Recorded ${category} expense: ${description} ($${Number(
        amount
      ).toFixed(2)}).`,
      relatedEntityId: expense._id,
    });

    return jsonResponse({ data: expense }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
