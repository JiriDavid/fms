"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

const genders = [
  { label: "Unknown", value: "unknown" },
  { label: "Female", value: "female" },
  { label: "Male", value: "male" },
];

export default function NewAnimalPage() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      tagId: "",
      name: "",
      categoryId: "",
      gender: "unknown",
      dateOfBirth: "",
      purchaseDate: "",
      purchasePrice: "",
      notes: "",
    },
  });

  useEffect(() => {
    async function fetchCategories() {
      const response = await fetch("/api/categories");
      if (response.ok) {
        const payload = await response.json();
        setCategories(payload.data || []);
      }
    }
    fetchCategories();
  }, []);

  async function onSubmit(formValues) {
    setIsSubmitting(true);
    const payload = {
      tagId: formValues.tagId,
      name: formValues.name,
      categoryId: formValues.categoryId,
      gender: formValues.gender,
      dateOfBirth: formValues.dateOfBirth || null,
      purchaseDate: formValues.purchaseDate || null,
      purchasePrice: formValues.purchasePrice
        ? Number(formValues.purchasePrice)
        : null,
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
      alert(error?.error || "Failed to save animal. Please try again.");
    }
    setIsSubmitting(false);
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-semibold text-slate-800">Add an animal</h1>
        <p className="text-sm text-slate-500">
          Register the animal and start tracking health data immediately.
        </p>
      </header>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid gap-6 rounded-2xl bg-white p-6 shadow-lg md:grid-cols-2"
      >
        <div className="space-y-2">
          <label
            className="text-sm font-semibold text-slate-700"
            htmlFor="tagId"
          >
            Tag / EID
          </label>
          <input
            id="tagId"
            type="text"
            placeholder="e.g. G-2025-1001"
            className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
            {...register("tagId", { required: "Tag is required" })}
          />
          {errors.tagId && (
            <p className="text-xs text-rose-500">{errors.tagId.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label
            className="text-sm font-semibold text-slate-700"
            htmlFor="name"
          >
            Nickname (optional)
          </label>
          <input
            id="name"
            type="text"
            placeholder="e.g. Daisy"
            className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
            {...register("name")}
          />
        </div>

        <div className="space-y-2">
          <label
            className="text-sm font-semibold text-slate-700"
            htmlFor="categoryId"
          >
            Category
          </label>
          <select
            id="categoryId"
            className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
            {...register("categoryId", { required: "Category is required" })}
          >
            <option value="">Select category</option>
            {categories.map((category) => (
              <option
                key={category._id || category.id}
                value={category._id || category.id}
              >
                {category.name}
              </option>
            ))}
          </select>
          {errors.categoryId && (
            <p className="text-xs text-rose-500">{errors.categoryId.message}</p>
          )}
          <p className="text-xs text-slate-400">
            We&apos;ll auto-create starter categories (Cattle, Goat, Chicken) if
            you don&apos;t have any yet. Add more via POST /api/categories
            whenever you need them.
          </p>
        </div>

        <div className="space-y-2">
          <label
            className="text-sm font-semibold text-slate-700"
            htmlFor="gender"
          >
            Gender
          </label>
          <select
            id="gender"
            className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
            {...register("gender")}
          >
            {genders.map((gender) => (
              <option key={gender.value} value={gender.value}>
                {gender.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label
            className="text-sm font-semibold text-slate-700"
            htmlFor="dateOfBirth"
          >
            Date of birth
          </label>
          <input
            id="dateOfBirth"
            type="date"
            className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
            {...register("dateOfBirth")}
          />
        </div>

        <div className="space-y-2">
          <label
            className="text-sm font-semibold text-slate-700"
            htmlFor="purchaseDate"
          >
            Purchase date
          </label>
          <input
            id="purchaseDate"
            type="date"
            className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
            {...register("purchaseDate")}
          />
        </div>

        <div className="space-y-2">
          <label
            className="text-sm font-semibold text-slate-700"
            htmlFor="purchasePrice"
          >
            Purchase price (USD)
          </label>
          <input
            id="purchasePrice"
            type="number"
            step="0.01"
            className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
            {...register("purchasePrice", {
              validate: (value) =>
                !value || Number(value) >= 0 || "Price must be positive",
            })}
          />
          {errors.purchasePrice && (
            <p className="text-xs text-rose-500">
              {errors.purchasePrice.message}
            </p>
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
            {isSubmitting ? "Saving..." : "Save animal"}
          </button>
        </div>
      </form>
    </div>
  );
}
