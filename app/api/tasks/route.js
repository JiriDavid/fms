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
import Task from "@/models/Task";
import Animal from "@/models/Animal";

export async function GET(request) {
  try {
    const ownerId = await requireUserId();
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const filter = { ownerId };
    if (status) filter.status = status;

    const tasks = await Task.find(filter).sort({ createdAt: -1 }).lean();
    return jsonResponse({ data: tasks });
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
      title,
      description,
      dueDate,
      assigneeId,
      relatedAnimalId,
      tags = [],
    } = body;

    if (!title) {
      return errorResponse("Title is required", 400);
    }

    const clerkUser = await getCurrentUser();
    const farmer = await ensureFarmerProfile({
      ownerId,
      email: clerkUser?.emailAddresses?.[0]?.emailAddress,
    });

    // Validate relatedAnimalId if provided
    if (relatedAnimalId) {
      const animal = await Animal.findOne({ _id: relatedAnimalId, ownerId });
      if (!animal) {
        return errorResponse("Related livestock batch not found", 404);
      }
    }

    const task = await Task.create({
      ownerId,
      farmerId: farmer._id,
      title,
      description,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      assigneeId,
      relatedAnimalId,
      tags,
    });

    await logActivity({
      ownerId,
      farmerId: farmer._id,
      type: "task",
      message: `Created task: ${title}`,
      relatedEntityId: task._id,
    });

    return jsonResponse({ data: task }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
