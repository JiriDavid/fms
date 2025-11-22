export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { requireUserId } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { jsonResponse, errorResponse } from "@/lib/api-helpers";
import { getAnimalGrowth } from "@/lib/reporting";

export async function GET(request) {
  try {
    const ownerId = await requireUserId();
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const livestockType = searchParams.get("livestockType");

    const data = await getAnimalGrowth(ownerId, livestockType || undefined);
    return jsonResponse({ data });
  } catch (error) {
    return errorResponse(error);
  }
}
