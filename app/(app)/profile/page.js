import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { connectToDatabase } from "@/lib/mongodb";
import Farmer from "@/models/Farmer";
import ProfileForm from "@/components/profile/ProfileForm";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const { userId } = auth();
  if (!userId) redirect("/sign-in");

  await connectToDatabase();
  const farmer = await Farmer.findOne({ ownerId: userId }).lean();

  return <ProfileForm farmer={JSON.parse(JSON.stringify(farmer))} />;
}
