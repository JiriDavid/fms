export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { requireUserId } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import {
  jsonResponse,
  errorResponse,
  parseRequestBody,
} from "@/lib/api-helpers";
import Task from "@/models/Task";

export async function PUT(request, { params }) {
  try {
    const ownerId = await requireUserId();
    const { id } = params;
    await connectToDatabase();

    const body = await parseRequestBody(request);
    const update = { ...body };
    if (body.dueDate) update.dueDate = new Date(body.dueDate);

    const task = await Task.findOneAndUpdate({ _id: id, ownerId }, update, {
      new: true,
    });
    if (!task) return errorResponse("Task not found", 404);

    return jsonResponse({ data: task });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(_request, { params }) {
  try {
    const ownerId = await requireUserId();
    const { id } = params;
    await connectToDatabase();

    const task = await Task.findOneAndDelete({ _id: id, ownerId });
    if (!task) return errorResponse("Task not found", 404);

    return jsonResponse({ data: { id } });
  } catch (error) {
    return errorResponse(error);
  }
}
