"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Card from "@/components/Card";

export default function NewSalePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [livestockBatches, setLivestockBatches] = useState([]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      productSold: "",
      quantity: "",
      unitPrice: "",
      totalAmount: "",
      saleDate: new Date().toISOString().slice(0, 10),
      buyer: "",
      livestockBatchId: "",
      notes: "",
    },
  });

  const quantity = watch("quantity");
  const unitPrice = watch("unitPrice");

  // Auto-calculate total amount
  useEffect(() => {
    const qty = Number(quantity) || 0;
    const price = Number(unitPrice) || 0;
    const total = qty * price;
    setValue("totalAmount", total.toFixed(2));
  }, [quantity, unitPrice, setValue]);

  // Auto-fill from URL parameters
  useEffect(() => {
    const batchId = searchParams.get("batchId");
    const batchName = searchParams.get("batchName");
    const livestockType = searchParams.get("livestockType");

    if (batchId && batchName && livestockType) {
      setValue("livestockBatchId", batchId);
      setValue("productSold", `${livestockType} - ${batchName}`);
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
      productSold: values.productSold,
      quantity: Number(values.quantity),
      unitPrice: Number(values.unitPrice),
      totalAmount: Number(values.totalAmount),
      saleDate: values.saleDate,
      buyer: values.buyer,
      livestockBatchId: values.livestockBatchId || undefined,
      notes: values.notes,
    };

    const response = await fetch("/api/sales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      router.push("/sales");
    } else {
      const error = await response.json();
      alert(error?.error || "Failed to record sale");
    }
    setLoading(false);
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <header className="flex items-center gap-4">
        <Link
          href="/sales"
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
          <h1 className="text-3xl font-bold text-slate-900">Record New Sale</h1>
          <p className="text-slate-600 mt-1">
            Enter details for a new livestock or product sale
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
              htmlFor="productSold"
            >
              Product Sold *
            </label>
            <input
              id="productSold"
              placeholder="e.g. Live broiler chickens"
              className="w-full rounded-lg border border-slate-200 px-4 py-2.5 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 transition-colors"
              {...register("productSold", {
                required: "Product sold is required",
              })}
            />
            {errors.productSold && (
              <p className="text-xs text-rose-500">
                {errors.productSold.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label
              className="block text-sm font-medium text-slate-700"
              htmlFor="quantity"
            >
              Quantity *
            </label>
            <input
              id="quantity"
              type="number"
              step="0.01"
              min="0"
              placeholder="50"
              className="w-full rounded-lg border border-slate-200 px-4 py-2.5 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 transition-colors"
              {...register("quantity", {
                required: "Quantity is required",
                validate: (value) =>
                  Number(value) > 0 || "Quantity must be greater than 0",
              })}
            />
            {errors.quantity && (
              <p className="text-xs text-rose-500">{errors.quantity.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label
              className="block text-sm font-medium text-slate-700"
              htmlFor="unitPrice"
            >
              Unit Price (USD) *
            </label>
            <input
              id="unitPrice"
              type="number"
              step="0.01"
              min="0"
              placeholder="5.50"
              className="w-full rounded-lg border border-slate-200 px-4 py-2.5 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 transition-colors"
              {...register("unitPrice", {
                required: "Unit price is required",
                validate: (value) =>
                  Number(value) >= 0 || "Unit price must be positive",
              })}
            />
            {errors.unitPrice && (
              <p className="text-xs text-rose-500">
                {errors.unitPrice.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label
              className="block text-sm font-medium text-slate-700"
              htmlFor="totalAmount"
            >
              Total Amount (USD)
            </label>
            <input
              id="totalAmount"
              type="number"
              step="0.01"
              readOnly
              className="w-full rounded-lg border border-slate-100 bg-slate-50 px-4 py-2.5 text-slate-600"
              {...register("totalAmount")}
            />
            <p className="text-xs text-slate-500">
              Auto-calculated from quantity × unit price
            </p>
          </div>

          <div className="space-y-2">
            <label
              className="block text-sm font-medium text-slate-700"
              htmlFor="saleDate"
            >
              Sale Date *
            </label>
            <input
              id="saleDate"
              type="date"
              className="w-full rounded-lg border border-slate-200 px-4 py-2.5 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 transition-colors"
              {...register("saleDate", { required: "Sale date is required" })}
            />
            {errors.saleDate && (
              <p className="text-xs text-rose-500">{errors.saleDate.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label
              className="block text-sm font-medium text-slate-700"
              htmlFor="buyer"
            >
              Buyer
            </label>
            <input
              id="buyer"
              placeholder="e.g. Local butcher"
              className="w-full rounded-lg border border-slate-200 px-4 py-2.5 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 transition-colors"
              {...register("buyer")}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label
              className="block text-sm font-medium text-slate-700"
              htmlFor="livestockBatchId"
            >
              From Batch (Optional)
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
              Link this sale to a specific livestock batch for profitability
              tracking
            </p>
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
              placeholder="Payment method, delivery details, quality notes, etc."
              className="w-full rounded-lg border border-slate-200 px-4 py-2.5 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 transition-colors"
              {...register("notes")}
            />
          </div>

          <div className="md:col-span-2 flex justify-end gap-3 pt-4">
            <Link
              href="/sales"
              className="rounded-lg border border-slate-200 px-6 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-primary-300 transition-colors"
            >
              {loading ? "Recording Sale..." : "Record Sale"}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}
