export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { requireUserId } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { jsonResponse, errorResponse } from "@/lib/api-helpers";
import UsageLog from "@/models/UsageLog";

export async function DELETE(_request, { params }) {
  try {
    const ownerId = await requireUserId();
    const { id } = params;
    await connectToDatabase();

    const log = await UsageLog.findOneAndDelete({ _id: id, ownerId });
    if (!log) return errorResponse("Usage log not found", 404);

    return jsonResponse({ data: { id } });
  } catch (error) {
    return errorResponse(error);
  }
}
