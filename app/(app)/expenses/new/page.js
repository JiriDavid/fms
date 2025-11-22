"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Card from "@/components/Card";

const defaultCategories = [
  "Feed",
  "Medicine",
  "Labor",
  "Maintenance",
  "Transport",
  "Utilities",
  "Equipment",
  "Veterinary",
  "Marketing",
  "Insurance",
  "Other",
];

export default function NewExpensePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [livestockBatches, setLivestockBatches] = useState([]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      category: "Feed",
      description: "",
      amount: "",
      date: new Date().toISOString().slice(0, 10),
      livestockBatchId: "",
      supplier: "",
      notes: "",
    },
  });

  // Auto-fill from URL parameters
  useEffect(() => {
    const batchId = searchParams.get("batchId");
    const batchName = searchParams.get("batchName");
    const livestockType = searchParams.get("livestockType");

    if (batchId && batchName && livestockType) {
      setValue("livestockBatchId", batchId);
      setValue("description", `Expense for ${livestockType} - ${batchName}`);
    }
  }, [searchParams, setValue]);

  useEffect(() => {
    fetchLivestockBatches();
  }, []);

  async function fetchLivestockBatches() {
    const response = await fetch("/api/animals");
    if (response.ok) {
      const payload = await response.json();
      setLivestockBatches(payload.data || []);
    }
  }

  async function onSubmit(values) {
    setLoading(true);
    const payload = {
      category: values.category,
      description: values.description,
      amount: Number(values.amount),
      date: values.date,
      livestockBatchId: values.livestockBatchId || undefined,
      supplier: values.supplier,
      notes: values.notes,
    };

    const response = await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      router.push("/expenses");
    } else {
      const error = await response.json();
      alert(error?.error || "Failed to record expense");
    }
    setLoading(false);
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <header className="flex items-center gap-4">
        <Link
          href="/expenses"
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </Link>
        <div>
          <p className="text-sm uppercase tracking-wide text-primary-600 font-medium">
            Financial Management
          </p>
          <h1 className="text-3xl font-bold text-slate-900">
            Record New Expense
          </h1>
          <p className="text-slate-600 mt-1">
            Enter details for a new operating cost or expense
          </p>
        </div>
      </header>

      {/* Form Card */}
      <Card>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid gap-6 text-sm md:grid-cols-2"
        >
          <div className="space-y-2">
            <label
              className="block text-sm font-medium text-slate-700"
              htmlFor="category"
            >
              Category *
            </label>
            <select
              id="category"
              className="w-full rounded-lg border border-slate-200 px-4 py-2.5 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 transition-colors"
              {...register("category", { required: "Category is required" })}
            >
              {defaultCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-xs text-rose-500">{errors.category.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label
              className="block text-sm font-medium text-slate-700"
              htmlFor="description"
            >
              Description *
            </label>
            <input
              id="description"
              placeholder="e.g. Premium broiler feed - 500kg"
              className="w-full rounded-lg border border-slate-200 px-4 py-2.5 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 transition-colors"
              {...register("description", {
                required: "Description is required",
              })}
            />
            {errors.description && (
              <p className="text-xs text-rose-500">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label
              className="block text-sm font-medium text-slate-700"
              htmlFor="amount"
            >
              Amount (USD) *
            </label>
            <input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="250.00"
              className="w-full rounded-lg border border-slate-200 px-4 py-2.5 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 transition-colors"
              {...register("amount", {
                required: "Amount is required",
                validate: (value) =>
                  Number(value) >= 0 || "Amount must be positive",
              })}
            />
            {errors.amount && (
              <p className="text-xs text-rose-500">{errors.amount.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label
              className="block text-sm font-medium text-slate-700"
              htmlFor="date"
            >
              Date *
            </label>
            <input
              id="date"
              type="date"
              className="w-full rounded-lg border border-slate-200 px-4 py-2.5 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 transition-colors"
              {...register("date", { required: "Date is required" })}
            />
            {errors.date && (
              <p className="text-xs text-rose-500">{errors.date.message}</p>
            )}
          </div>

          <div className="space-y-2 md:col-span-2">
            <label
              className="block text-sm font-medium text-slate-700"
              htmlFor="livestockBatchId"
            >
              Related Batch (Optional)
            </label>
            <select
              id="livestockBatchId"
              className="w-full rounded-lg border border-slate-200 px-4 py-2.5 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 transition-colors"
              {...register("livestockBatchId")}
            >
              <option value="">Select batch (optional)</option>
              {livestockBatches.map((batch) => (
                <option key={batch._id} value={batch._id}>
                  {batch.batchName} ({batch.livestockType})
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-500">
              Link this expense to a specific livestock batch for profitability
              tracking
            </p>
          </div>

          <div className="space-y-2">
            <label
              className="block text-sm font-medium text-slate-700"
              htmlFor="supplier"
            >
              Supplier
            </label>
            <input
              id="supplier"
              placeholder="e.g. AgriCorp Ltd"
              className="w-full rounded-lg border border-slate-200 px-4 py-2.5 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 transition-colors"
              {...register("supplier")}
            />
          </div>

          <div className="md:col-span-2 space-y-2">
            <label
              className="block text-sm font-medium text-slate-700"
              htmlFor="notes"
            >
              Notes
            </label>
            <textarea
              id="notes"
              rows={4}
              placeholder="Additional details, receipts, payment method, etc."
              className="w-full rounded-lg border border-slate-200 px-4 py-2.5 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 transition-colors"
              {...register("notes")}
            />
          </div>

          <div className="md:col-span-2 flex justify-end gap-3 pt-4">
            <Link
              href="/expenses"
              className="rounded-lg border border-slate-200 px-6 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-primary-300 transition-colors"
            >
              {loading ? "Recording Expense..." : "Record Expense"}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}
