import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ensureDefaultCategories } from "@/lib/categories";
import { connectToDatabase } from "@/lib/mongodb";
import Animal from "@/models/Animal";
import AnimalCategory from "@/models/AnimalCategory";
import Card from "@/components/Card";
import Table from "@/components/Table";

export const dynamic = "force-dynamic";

async function getAnimals(ownerId) {
  await connectToDatabase();
  const animals = await Animal.find({ ownerId })
    .populate("categoryId", "name")
    .sort({ createdAt: -1 })
    .lean();
  return animals.map((animal) => ({
    id: animal._id.toString(),
    tagId: animal.tagId,
    name: animal.name || "—",
    category: animal.categoryId?.name || "Uncategorised",
    status: animal.status,
    gender: animal.gender,
    createdAt: animal.createdAt,
  }));
}

async function getCategories(ownerId) {
  await connectToDatabase();
  await ensureDefaultCategories(ownerId);
  const categories = await AnimalCategory.find({ ownerId })
    .sort({ name: 1 })
    .lean();
  return categories.map((category) => ({
    id: category._id.toString(),
    name: category.name,
  }));
}

export default async function AnimalsPage() {
  const { userId } = auth();
  if (!userId) redirect("/sign-in");

  const [animals, categories] = await Promise.all([
    getAnimals(userId),
    getCategories(userId),
  ]);

  return (
    <div className="space-y-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-wide text-primary-600">
            Animals
          </p>
          <h1 className="text-3xl font-semibold text-slate-800">
            Manage your herd
          </h1>
          <p className="text-sm text-slate-500">
            Track lifecycle, health, and performance of every animal.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/animals/new"
            className="rounded-full bg-primary-600 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-primary-700"
          >
            Add animal
          </Link>
          <Link
            href="/dashboard"
            className="rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            Back to dashboard
          </Link>
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card title="Categories" description="Organise your herd">
          <ul className="space-y-3 text-sm text-slate-600">
            {categories.map((category) => (
              <li
                key={category.id}
                className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-4 py-2"
              >
                <span>{category.name}</span>
                <Link href={`/api/categories/${category.id}`} className="link">
                  API
                </Link>
              </li>
            ))}
            {categories.length === 0 && (
              <li>
                We&apos;ve created starter categories for you automatically. Add
                more via the API as needed.
              </li>
            )}
          </ul>
          <p className="mt-4 text-xs text-slate-400">
            Use POST /api/categories to add or rename categories (see README for
            sample payload).
          </p>
        </Card>
        <div className="lg:col-span-2">
          <Table
            columns={[
              { header: "Tag", accessor: "tagId" },
              { header: "Name", accessor: "name" },
              { header: "Category", accessor: "category" },
              { header: "Status", accessor: "status" },
              {
                header: "Actions",
                accessor: "actions",
                cell: (row) => (
                  <div className="flex gap-3">
                    <Link href={`/animals/${row.id}`} className="link">
                      View & edit
                    </Link>
                    <Link
                      href={`/api/animals/${row.id}`}
                      className="text-xs text-slate-400 underline"
                    >
                      API
                    </Link>
                  </div>
                ),
              },
            ]}
            data={animals}
            emptyMessage="No animals yet. Add your first animal to get started."
          />
        </div>
      </section>
    </div>
  );
}
