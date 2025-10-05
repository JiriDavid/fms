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
import Farmer from "@/models/Farmer";

export async function GET() {
  try {
    const ownerId = await requireUserId();
    await connectToDatabase();

    const farmer = await Farmer.findOne({ ownerId }).lean();
    if (!farmer) {
      const clerkUser = await getCurrentUser();
      const created = await ensureFarmerProfile({
        ownerId,
        email: clerkUser?.emailAddresses?.[0]?.emailAddress,
      });
      return jsonResponse({ data: created });
    }

    return jsonResponse({ data: farmer });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PUT(request) {
  try {
    const ownerId = await requireUserId();
    await connectToDatabase();
    const body = await parseRequestBody(request);
    const { farmName, location, contactNumber, description } = body;
    if (!farmName || !location) {
      return errorResponse("Farm name and location are required", 400);
    }

    const farmer = await Farmer.findOneAndUpdate(
      { ownerId },
      { farmName, location, contactNumber, description },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return jsonResponse({ data: farmer });
  } catch (error) {
    return errorResponse(error);
  }
}
