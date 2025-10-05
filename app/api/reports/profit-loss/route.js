export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { requireUserId } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { jsonResponse, errorResponse } from "@/lib/api-helpers";
import { getProfitAndLoss } from "@/lib/reporting";

export async function GET(request) {
  try {
    const ownerId = await requireUserId();
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const data = await getProfitAndLoss(ownerId, { startDate, endDate });
    return jsonResponse({ data });
  } catch (error) {
    return errorResponse(error);
  }
}
