"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

export default function NewFeedPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      unit: "kg",
      quantityPurchased: "",
      cost: "",
      purchaseDate: "",
      supplier: "",
      notes: "",
    },
  });

  async function onSubmit(formValues) {
    setIsSubmitting(true);
    const payload = {
      name: formValues.name,
      unit: formValues.unit,
      quantityPurchased: formValues.quantityPurchased
        ? Number(formValues.quantityPurchased)
        : 0,
      cost: formValues.cost ? Number(formValues.cost) : 0,
      purchaseDate: formValues.purchaseDate,
      supplier: formValues.supplier,
      notes: formValues.notes,
    };

    const response = await fetch("/api/feeds", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      router.push("/feeds");
      router.refresh();
    } else {
      const error = await response.json();
      alert(error?.error || "Failed to save feed. Please try again.");
    }
    setIsSubmitting(false);
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-semibold text-slate-800">Add feed</h1>
        <p className="text-sm text-slate-500">
          Register feed stock and start tracking consumption immediately.
        </p>
      </header>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid gap-6 rounded-2xl bg-white p-6 shadow-lg md:grid-cols-2"
      >
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label
              className="text-sm font-semibold text-slate-700"
              htmlFor="name"
            >
              Feed Name
            </label>
            <input
              id="name"
              type="text"
              placeholder="e.g. Premium Broiler Feed"
              className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
              {...register("name", { required: "Feed name is required" })}
            />
            {errors.name && (
              <p className="text-xs text-rose-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label
              className="text-sm font-semibold text-slate-700"
              htmlFor="unit"
            >
              Unit
            </label>
            <select
              id="unit"
              className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
              {...register("unit", { required: "Unit is required" })}
            >
              <option value="kg">Kilograms (kg)</option>
              <option value="lbs">Pounds (lbs)</option>
              <option value="tons">Tons</option>
              <option value="bags">Bags</option>
              <option value="sacks">Sacks</option>
            </select>
            {errors.unit && (
              <p className="text-xs text-rose-500">{errors.unit.message}</p>
            )}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label
              className="text-sm font-semibold text-slate-700"
              htmlFor="quantityPurchased"
            >
              Quantity Purchased
            </label>
            <input
              id="quantityPurchased"
              type="number"
              step="0.01"
              min="0"
              placeholder="1000"
              className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
              {...register("quantityPurchased", {
                required: "Quantity purchased is required",
                validate: (value) =>
                  !value ||
                  Number(value) > 0 ||
                  "Quantity must be greater than 0",
              })}
            />
            {errors.quantityPurchased && (
              <p className="text-xs text-rose-500">
                {errors.quantityPurchased.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label
              className="text-sm font-semibold text-slate-700"
              htmlFor="cost"
            >
              Total Cost (USD)
            </label>
            <input
              id="cost"
              type="number"
              step="0.01"
              min="0"
              placeholder="500.00"
              className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
              {...register("cost", {
                required: "Cost is required",
                validate: (value) =>
                  !value || Number(value) >= 0 || "Cost must be positive",
              })}
            />
            {errors.cost && (
              <p className="text-xs text-rose-500">{errors.cost.message}</p>
            )}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label
              className="text-sm font-semibold text-slate-700"
              htmlFor="purchaseDate"
            >
              Purchase Date
            </label>
            <input
              id="purchaseDate"
              type="date"
              className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
              {...register("purchaseDate", {
                required: "Purchase date is required",
              })}
            />
            {errors.purchaseDate && (
              <p className="text-xs text-rose-500">
                {errors.purchaseDate.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label
              className="text-sm font-semibold text-slate-700"
              htmlFor="supplier"
            >
              Supplier
            </label>
            <input
              id="supplier"
              type="text"
              placeholder="e.g. AgriCorp Ltd"
              className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
              {...register("supplier")}
            />
          </div>
        </div>

        <div className="md:col-span-2 space-y-2">
          <label
            className="text-sm font-semibold text-slate-700"
            htmlFor="notes"
          >
            Notes
          </label>
          <textarea
            id="notes"
            rows={4}
            placeholder="Nutritional content, storage instructions, quality notes, etc."
            className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
            {...register("notes")}
          />
        </div>

        <div className="md:col-span-2 flex items-center justify-end gap-3">
          <button
            type="button"
            className="rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            onClick={() => router.back()}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-full bg-primary-600 px-6 py-2 text-sm font-semibold text-white shadow hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-primary-300"
          >
            {isSubmitting ? "Saving..." : "Save feed"}
          </button>
        </div>
      </form>
    </div>
  );
}
