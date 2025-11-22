import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { connectToDatabase } from "@/lib/mongodb";
import Animal from "@/models/Animal";
import AnimalDetailForm from "@/components/animals/AnimalDetailForm";

export const dynamic = "force-dynamic";

export default async function AnimalDetailPage({ params }) {
  const { id } = params;
  const { userId } = auth();
  if (!userId) redirect("/sign-in");

  await connectToDatabase();
  const animalDoc = await Animal.findOne({ _id: id, ownerId: userId })
    .lean();

  if (!animalDoc) {
    notFound();
  }

  return (
    <AnimalDetailForm
      animal={JSON.parse(JSON.stringify(animalDoc))}
    />
  );
}
