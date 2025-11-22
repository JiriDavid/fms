"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

export default function NewMedicinePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      purpose: "",
      quantityPurchased: "",
      unit: "ml",
      cost: "",
      purchaseDate: "",
      expiryDate: "",
      supplier: "",
      batchNumber: "",
      dosageInstructions: "",
      notes: "",
    },
  });

  async function onSubmit(formValues) {
    setIsSubmitting(true);
    const payload = {
      name: formValues.name,
      purpose: formValues.purpose,
      quantityPurchased: formValues.quantityPurchased
        ? Number(formValues.quantityPurchased)
        : 0,
      unit: formValues.unit,
      cost: formValues.cost ? Number(formValues.cost) : 0,
      purchaseDate: formValues.purchaseDate,
      expiryDate: formValues.expiryDate,
      supplier: formValues.supplier,
      batchNumber: formValues.batchNumber,
      dosageInstructions: formValues.dosageInstructions,
      notes: formValues.notes,
    };

    const response = await fetch("/api/medicines", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      router.push("/medicines");
      router.refresh();
    } else {
      const error = await response.json();
      alert(error?.error || "Failed to save medicine. Please try again.");
    }
    setIsSubmitting(false);
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-semibold text-slate-800">Add medicine</h1>
        <p className="text-sm text-slate-500">
          Register medicine stock and start tracking usage immediately.
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
              Medicine Name
            </label>
            <input
              id="name"
              type="text"
              placeholder="e.g. Amoxicillin Injection"
              className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
              {...register("name", { required: "Medicine name is required" })}
            />
            {errors.name && (
              <p className="text-xs text-rose-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label
              className="text-sm font-semibold text-slate-700"
              htmlFor="purpose"
            >
              Purpose
            </label>
            <select
              id="purpose"
              className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
              {...register("purpose", { required: "Purpose is required" })}
            >
              <option value="">Select purpose</option>
              <option value="Antibiotic">Antibiotic</option>
              <option value="Vaccine">Vaccine</option>
              <option value="Antiparasitic">Antiparasitic</option>
              <option value="Anti-inflammatory">Anti-inflammatory</option>
              <option value="Vitamin">Vitamin/Supplement</option>
              <option value="Electrolyte">Electrolyte</option>
              <option value="Disinfectant">Disinfectant</option>
              <option value="Other">Other</option>
            </select>
            {errors.purpose && (
              <p className="text-xs text-rose-500">{errors.purpose.message}</p>
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
              placeholder="100"
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
              htmlFor="unit"
            >
              Unit
            </label>
            <select
              id="unit"
              className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
              {...register("unit", { required: "Unit is required" })}
            >
              <option value="ml">Milliliters (ml)</option>
              <option value="l">Liters (l)</option>
              <option value="mg">Milligrams (mg)</option>
              <option value="g">Grams (g)</option>
              <option value="tablets">Tablets</option>
              <option value="capsules">Capsules</option>
              <option value="vials">Vials</option>
              <option value="bottles">Bottles</option>
              <option value="tubes">Tubes</option>
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
              htmlFor="cost"
            >
              Total Cost (USD)
            </label>
            <input
              id="cost"
              type="number"
              step="0.01"
              min="0"
              placeholder="150.00"
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
              placeholder="e.g. VetPharm Inc"
              className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
              {...register("supplier")}
            />
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
              htmlFor="expiryDate"
            >
              Expiry Date
            </label>
            <input
              id="expiryDate"
              type="date"
              className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
              {...register("expiryDate", {
                required: "Expiry date is required",
              })}
            />
            {errors.expiryDate && (
              <p className="text-xs text-rose-500">
                {errors.expiryDate.message}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label
            className="text-sm font-semibold text-slate-700"
            htmlFor="batchNumber"
          >
            Batch Number
          </label>
          <input
            id="batchNumber"
            type="text"
            placeholder="e.g. AMOX-2025-001"
            className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
            {...register("batchNumber")}
          />
        </div>

        <div className="space-y-2">
          <label
            className="text-sm font-semibold text-slate-700"
            htmlFor="dosageInstructions"
          >
            Dosage Instructions
          </label>
          <textarea
            id="dosageInstructions"
            rows={3}
            placeholder="e.g. 1ml per 10kg body weight, subcutaneous injection"
            className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
            {...register("dosageInstructions")}
          />
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
            placeholder="Storage requirements, side effects, withdrawal periods, etc."
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
            {isSubmitting ? "Saving..." : "Save medicine"}
          </button>
        </div>
      </form>
    </div>
  );
}
