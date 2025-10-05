export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { requireUserId } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { jsonResponse, errorResponse } from "@/lib/api-helpers";
import { getFeedConsumption } from "@/lib/reporting";
import UsageLog from "@/models/UsageLog";
import Feed from "@/models/Feed";

export async function GET(request) {
  try {
    const ownerId = await requireUserId();
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const data = await getFeedConsumption(ownerId, UsageLog, {
      startDate,
      endDate,
    });

    const feedIds = data.map((item) => item._id);
    const feeds = await Feed.find({ _id: { $in: feedIds } }).lean();
    const feedLookup = feeds.reduce((acc, feed) => {
      acc[feed._id.toString()] = feed.type;
      return acc;
    }, {});

    const result = data.map((item) => ({
      feedId: item._id,
      feedType: feedLookup[item._id?.toString()] || "Unknown",
      totalQuantity: item.totalQuantity,
      lastUsed: item.lastUsed,
    }));

    return jsonResponse({ data: result });
  } catch (error) {
    return errorResponse(error);
  }
}
