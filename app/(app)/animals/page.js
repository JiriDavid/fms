import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { connectToDatabase } from "@/lib/mongodb";
import Animal from "@/models/Animal";
import Card from "@/components/Card";
import Table from "@/components/Table";

export const dynamic = "force-dynamic";

async function getAnimals(ownerId) {
  await connectToDatabase();
  const animals = await Animal.find({ ownerId }).sort({ createdAt: -1 }).lean();
  return animals.map((animal) => ({
    id: animal._id.toString(),
    livestockType: animal.livestockType,
    breed: animal.breed,
    batchName: animal.batchName,
    quantity: animal.quantity || 1,
    purpose: animal.purpose,
    location: animal.location,
    status: animal.status,
    createdAt: animal.createdAt,
  }));
}

async function getLivestockStats(ownerId) {
  await connectToDatabase();

  const stats = await Animal.aggregate([
    { $match: { ownerId } },
    {
      $group: {
        _id: null,
        totalBatches: { $sum: 1 },
        totalQuantity: { $sum: "$quantity" },
        activeBatches: {
          $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] },
        },
        activeQuantity: {
          $sum: {
            $cond: [{ $eq: ["$status", "active"] }, "$quantity", 0],
          },
        },
      },
    },
  ]);

  return (
    stats[0] || {
      totalBatches: 0,
      totalQuantity: 0,
      activeBatches: 0,
      activeQuantity: 0,
    }
  );
}

export default async function AnimalsPage() {
  const { userId } = auth();
  if (!userId) redirect("/sign-in");

  const [animals, stats] = await Promise.all([
    getAnimals(userId),
    getLivestockStats(userId),
  ]);

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <header className="flex flex-wrap items-center justify-between gap-6">
        <div>
          <p className="text-sm uppercase tracking-wide text-primary-600 font-medium">
            Livestock Management
          </p>
          <h1 className="text-3xl font-bold text-slate-900">
            Your Livestock Portfolio
          </h1>
          <p className="text-slate-600 mt-1">
            Monitor and manage all your livestock batches in one place
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/animals/new"
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Add Livestock
          </Link>
        </div>
      </header>

      {/* Stats Cards */}
      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 text-center">
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 bg-primary-100 rounded-full">
            <svg
              className="w-6 h-6 text-primary-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {stats.totalBatches}
          </p>
          <p className="text-sm text-slate-600">Total Batches</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 text-center">
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 bg-green-100 rounded-full">
            <svg
              className="w-6 h-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {stats.activeBatches}
          </p>
          <p className="text-sm text-slate-600">Active Batches</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 text-center">
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 bg-blue-100 rounded-full">
            <svg
              className="w-6 h-6 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {stats.totalQuantity.toLocaleString()}
          </p>
          <p className="text-sm text-slate-600">Total Animals</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 text-center">
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 bg-purple-100 rounded-full">
            <svg
              className="w-6 h-6 text-purple-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {stats.activeQuantity.toLocaleString()}
          </p>
          <p className="text-sm text-slate-600">Active Animals</p>
        </div>
      </section>

      {/* Livestock Table */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">
            Livestock Batches
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Detailed view of all your livestock batches
          </p>
        </div>

        <div className="overflow-x-auto">
          <Table
            columns={[
              {
                header: "Batch Name",
                accessor: "batchName",
                cell: (row) => (
                  <div>
                    <div className="font-medium text-slate-900">
                      {row.batchName}
                    </div>
                    <div className="text-sm text-slate-500">{row.breed}</div>
                  </div>
                ),
              },
              {
                header: "Type",
                accessor: "livestockType",
                cell: (row) => (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                    {row.livestockType}
                  </span>
                ),
              },
              {
                header: "Quantity",
                accessor: "quantity",
                cell: (row) => (
                  <span className="font-medium text-slate-900">
                    {row.quantity.toLocaleString()}
                  </span>
                ),
              },
              {
                header: "Purpose",
                accessor: "purpose",
                cell: (row) => (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                    {row.purpose}
                  </span>
                ),
              },
              {
                header: "Location",
                accessor: "location",
                cell: (row) => (
                  <span className="text-slate-700">{row.location}</span>
                ),
              },
              {
                header: "Status",
                accessor: "status",
                cell: (row) => {
                  const statusColors = {
                    active: "bg-green-100 text-green-800",
                    sold: "bg-blue-100 text-blue-800",
                    deceased: "bg-red-100 text-red-800",
                  };
                  return (
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        statusColors[row.status] ||
                        "bg-slate-100 text-slate-800"
                      }`}
                    >
                      {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                    </span>
                  );
                },
              },
              {
                header: "Actions",
                accessor: "actions",
                cell: (row) => (
                  <div className="flex gap-2">
                    <Link
                      href={`/animals/${row.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-md transition-colors"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                      View
                    </Link>
                    <Link
                      href={`/sales?batchId=${
                        row.id
                      }&batchName=${encodeURIComponent(
                        row.batchName
                      )}&livestockType=${encodeURIComponent(
                        row.livestockType
                      )}`}
                      className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium text-green-600 hover:text-green-700 hover:bg-green-50 rounded-md transition-colors"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                        />
                      </svg>
                      Sell
                    </Link>
                    <Link
                      href={`/expenses?batchId=${
                        row.id
                      }&batchName=${encodeURIComponent(
                        row.batchName
                      )}&livestockType=${encodeURIComponent(
                        row.livestockType
                      )}`}
                      className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-md transition-colors"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z"
                        />
                      </svg>
                      Expense
                    </Link>
                  </div>
                ),
              },
            ]}
            data={animals}
            emptyMessage={
              <div className="text-center py-12">
                <svg
                  className="w-12 h-12 mx-auto text-slate-400 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
                <h3 className="text-lg font-medium text-slate-900 mb-2">
                  No livestock yet
                </h3>
                <p className="text-slate-600 mb-6">
                  Get started by adding your first livestock batch
                </p>
                <Link
                  href="/animals/new"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  Add Your First Batch
                </Link>
              </div>
            }
          />
        </div>
      </section>
    </div>
  );
}
