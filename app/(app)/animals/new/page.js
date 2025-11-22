"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

export default function NewAnimalPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      livestockType: "",
      breed: "",
      batchName: "",
      quantity: 1,
      acquisitionDate: "",
      purchaseCost: "",
      costType: "total",
      purpose: "",
      location: "",
      notes: "",
    },
  });

  async function onSubmit(formValues) {
    setIsSubmitting(true);
    const payload = {
      livestockType: formValues.livestockType,
      breed: formValues.breed,
      batchName: formValues.batchName,
      quantity: formValues.quantity ? Number(formValues.quantity) : 1,
      acquisitionDate: formValues.acquisitionDate,
      purchaseCost: formValues.purchaseCost
        ? Number(formValues.purchaseCost)
        : 0,
      costType: formValues.costType,
      purpose: formValues.purpose,
      location: formValues.location,
      notes: formValues.notes,
    };

    const response = await fetch("/api/animals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      router.push("/animals");
      router.refresh();
    } else {
      const error = await response.json();
      alert(error?.error || "Failed to save livestock. Please try again.");
    }
    setIsSubmitting(false);
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-semibold text-slate-800">Add livestock</h1>
        <p className="text-sm text-slate-500">
          Register livestock and start tracking health data immediately.
        </p>
      </header>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid gap-6 rounded-2xl bg-white p-6 shadow-lg md:grid-cols-2"
      >
        <div className="space-y-2">
          <label
            className="text-sm font-semibold text-slate-700"
            htmlFor="livestockType"
          >
            Livestock Type
          </label>
          <select
            id="livestockType"
            className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
            {...register("livestockType", {
              required: "Livestock type is required",
            })}
          >
            <option value="">Select type</option>
            <option value="Chicken">Chicken</option>
            <option value="Duck">Duck</option>
            <option value="Turkey">Turkey</option>
            <option value="Goose">Goose</option>
            <option value="Quail">Quail</option>
            <option value="Pigeon">Pigeon</option>
            <option value="Pig">Pig</option>
            <option value="Sheep">Sheep</option>
            <option value="Cattle">Cattle</option>
            <option value="Goat">Goat</option>
            <option value="Rabbit">Rabbit</option>
            <option value="Horse">Horse</option>
            <option value="Donkey">Donkey</option>
            <option value="Other">Other</option>
          </select>
          {errors.livestockType && (
            <p className="text-xs text-rose-500">
              {errors.livestockType.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label
            className="text-sm font-semibold text-slate-700"
            htmlFor="breed"
          >
            Breed
          </label>
          <input
            id="breed"
            type="text"
            placeholder="e.g. Rhode Island Red"
            className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
            {...register("breed", { required: "Breed is required" })}
          />
          {errors.breed && (
            <p className="text-xs text-rose-500">{errors.breed.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label
            className="text-sm font-semibold text-slate-700"
            htmlFor="batchName"
          >
            Batch/Group Name
          </label>
          <input
            id="batchName"
            type="text"
            placeholder="e.g. Broiler Batch 2025-001"
            className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
            {...register("batchName", { required: "Batch name is required" })}
          />
          {errors.batchName && (
            <p className="text-xs text-rose-500">{errors.batchName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label
            className="text-sm font-semibold text-slate-700"
            htmlFor="quantity"
          >
            Quantity
          </label>
          <input
            id="quantity"
            type="number"
            min="1"
            placeholder="1"
            className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
            {...register("quantity", {
              validate: (value) =>
                !value || Number(value) >= 1 || "Quantity must be at least 1",
            })}
          />
          {errors.quantity && (
            <p className="text-xs text-rose-500">{errors.quantity.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label
            className="text-sm font-semibold text-slate-700"
            htmlFor="acquisitionDate"
          >
            Acquisition Date
          </label>
          <input
            id="acquisitionDate"
            type="date"
            className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
            {...register("acquisitionDate", {
              required: "Acquisition date is required",
            })}
          />
          {errors.acquisitionDate && (
            <p className="text-xs text-rose-500">
              {errors.acquisitionDate.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label
            className="text-sm font-semibold text-slate-700"
            htmlFor="purchaseCost"
          >
            Purchase Cost
          </label>
          <input
            id="purchaseCost"
            type="number"
            step="0.01"
            placeholder="0.00"
            className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
            {...register("purchaseCost", {
              required: "Purchase cost is required",
              validate: (value) =>
                !value || Number(value) >= 0 || "Cost must be positive",
            })}
          />
          {errors.purchaseCost && (
            <p className="text-xs text-rose-500">
              {errors.purchaseCost.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label
            className="text-sm font-semibold text-slate-700"
            htmlFor="costType"
          >
            Cost Type
          </label>
          <select
            id="costType"
            className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
            {...register("costType")}
          >
            <option value="total">Total cost</option>
            <option value="per_unit">Per unit</option>
          </select>
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
            <option value="Broiler">Broiler</option>
            <option value="Layer">Layer</option>
            <option value="Breeder">Breeder</option>
            <option value="Meat">Meat</option>
            <option value="Milk">Milk</option>
            <option value="Wool">Wool</option>
            <option value="Work">Work</option>
            <option value="Breeding">Breeding</option>
            <option value="Other">Other</option>
          </select>
          {errors.purpose && (
            <p className="text-xs text-rose-500">{errors.purpose.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label
            className="text-sm font-semibold text-slate-700"
            htmlFor="location"
          >
            Location/Housing
          </label>
          <input
            id="location"
            type="text"
            placeholder="e.g. Coop A, Pen 3"
            className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
            {...register("location", { required: "Location is required" })}
          />
          {errors.location && (
            <p className="text-xs text-rose-500">{errors.location.message}</p>
          )}
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
            placeholder="Vaccination schedule, health notes, genetic traits, etc."
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
            {isSubmitting ? "Saving..." : "Save livestock"}
          </button>
        </div>
      </form>
    </div>
  );
}
