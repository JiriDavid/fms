import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { requireUserId } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { errorResponse } from "@/lib/api-helpers";
import { toCSV } from "@/lib/csv";
import {
  getProfitAndLoss,
  getAnimalGrowth,
  getFeedConsumption,
} from "@/lib/reporting";
import UsageLog from "@/models/UsageLog";
import Feed from "@/models/Feed";

export async function GET(request, { params }) {
  try {
    const ownerId = await requireUserId();
    const { type } = params;
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    let csv = "";
    let filename = `${type}-report.csv`;

    if (type === "profit-loss") {
      const data = await getProfitAndLoss(ownerId, { startDate, endDate });
      csv = toCSV(
        [
          { metric: "Total Sales", value: data.totalSales },
          { metric: "Total Expenses", value: data.totalExpenses },
          { metric: "Profit", value: data.profit },
        ],
        ["metric", "value"]
      );
    } else if (type === "animal-growth") {
      const livestockType = searchParams.get("livestockType");
      const data = await getAnimalGrowth(ownerId, livestockType || undefined);
      const rows = data.flatMap((animal) =>
        animal.weightHistory.map((entry) => ({
          batchName: animal.batchName,
          date: entry.date,
          weightKg: entry.weightKg,
        }))
      );
      csv = toCSV(rows, ["batchName", "date", "weightKg"]);
    } else if (type === "feed-consumption") {
      const feedData = await getFeedConsumption(ownerId, UsageLog, {
        startDate,
        endDate,
      });
      const feedIds = feedData.map((item) => item._id);
      const feeds = await Feed.find({ _id: { $in: feedIds } }).lean();
      const feedLookup = feeds.reduce((acc, feed) => {
        acc[feed._id.toString()] = feed.type;
        return acc;
      }, {});
      csv = toCSV(
        feedData.map((item) => ({
          feedId: item._id,
          feedType: feedLookup[item._id?.toString()] || "Unknown",
          totalQuantity: item.totalQuantity,
          lastUsed: item.lastUsed,
        })),
        ["feedId", "feedType", "totalQuantity", "lastUsed"]
      );
    } else {
      return errorResponse("Report not found", 404);
    }

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename=${filename}`,
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
