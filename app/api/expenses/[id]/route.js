export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { requireUserId } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import {
  jsonResponse,
  errorResponse,
  parseRequestBody,
} from "@/lib/api-helpers";
import Expense from "@/models/Expense";

export async function PUT(request, { params }) {
  try {
    const ownerId = await requireUserId();
    const { id } = params;
    await connectToDatabase();

    const body = await parseRequestBody(request);
    const update = {};
    if (body.date) update.date = new Date(body.date);
    if (body.category) update.category = body.category;
    if (body.amount !== undefined) update.amount = Number(body.amount);
    if (body.notes !== undefined) update.notes = body.notes;

    const expense = await Expense.findOneAndUpdate(
      { _id: id, ownerId },
      update,
      { new: true }
    );
    if (!expense) return errorResponse("Expense not found", 404);

    return jsonResponse({ data: expense });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(_request, { params }) {
  try {
    const ownerId = await requireUserId();
    const { id } = params;
    await connectToDatabase();

    const expense = await Expense.findOneAndDelete({ _id: id, ownerId });
    if (!expense) return errorResponse("Expense not found", 404);

    return jsonResponse({ data: { id } });
  } catch (error) {
    return errorResponse(error);
  }
}
