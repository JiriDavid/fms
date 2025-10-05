import Activity from "@/models/Activity";

export async function logActivity({
  ownerId,
  farmerId,
  type,
  message,
  relatedEntityId,
  meta,
}) {
  if (!ownerId || !farmerId) return null;
  try {
    return await Activity.create({
      ownerId,
      farmerId,
      type,
      message,
      relatedEntityId,
      meta,
    });
  } catch (error) {
    console.error("Failed to log activity", error);
    return null;
  }
}
