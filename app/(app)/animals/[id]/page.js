import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { connectToDatabase } from "@/lib/mongodb";
import Animal from "@/models/Animal";
import AnimalCategory from "@/models/AnimalCategory";
import AnimalDetailForm from "@/components/animals/AnimalDetailForm";

export const dynamic = "force-dynamic";

export default async function AnimalDetailPage({ params }) {
  const { id } = params;
  const { userId } = auth();
  if (!userId) redirect("/sign-in");

  await connectToDatabase();
  const animalDoc = await Animal.findOne({ _id: id, ownerId: userId })
    .populate("categoryId", "name")
    .lean();

  if (!animalDoc) {
    notFound();
  }

  const categories = await AnimalCategory.find({ ownerId: userId })
    .sort({ name: 1 })
    .lean();

  return (
    <AnimalDetailForm
      animal={JSON.parse(JSON.stringify(animalDoc))}
      categories={JSON.parse(JSON.stringify(categories))}
    />
  );
}
