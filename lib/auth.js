import { auth, currentUser } from "@clerk/nextjs/server";

export async function getAuth() {
  return auth();
}

export async function getCurrentUser() {
  try {
    return await currentUser();
  } catch (error) {
    console.error("Failed to fetch Clerk user", error);
    return null;
  }
}

export async function requireUserId() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized: Clerk userId missing.");
  }
  return userId;
}
