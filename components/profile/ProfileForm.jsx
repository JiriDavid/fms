"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

export default function ProfileForm({ farmer }) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      farmName: farmer?.farmName || "",
      location: farmer?.location || "",
      contactNumber: farmer?.contactNumber || "",
      description: farmer?.description || "",
    },
  });

  async function onSubmit(values) {
    setIsSaving(true);
    const response = await fetch("/api/farmer", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (response.ok) {
      router.refresh();
    } else {
      const error = await response.json();
      alert(error?.error || "Failed to save profile");
    }
    setIsSaving(false);
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mx-auto max-w-3xl space-y-6 rounded-2xl bg-white p-8 shadow-lg"
    >
      <div>
        <h1 className="text-3xl font-semibold text-slate-800">
          Farmer profile
        </h1>
        <p className="text-sm text-slate-500">
          Tell us about your farm to personalise dashboards and reports.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label
            className="text-sm font-semibold text-slate-700"
            htmlFor="farmName"
          >
            Farm name
          </label>
          <input
            id="farmName"
            className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
            {...register("farmName", { required: "Farm name is required" })}
          />
          {errors.farmName && (
            <p className="text-xs text-rose-500">{errors.farmName.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <label
            className="text-sm font-semibold text-slate-700"
            htmlFor="location"
          >
            Location
          </label>
          <input
            id="location"
            placeholder="City, Country"
            className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
            {...register("location", { required: "Location is required" })}
          />
          {errors.location && (
            <p className="text-xs text-rose-500">{errors.location.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <label
            className="text-sm font-semibold text-slate-700"
            htmlFor="contactNumber"
          >
            Contact number
          </label>
          <input
            id="contactNumber"
            placeholder="+1 202 555 0103"
            className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
            {...register("contactNumber")}
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <label
            className="text-sm font-semibold text-slate-700"
            htmlFor="description"
          >
            Farm description
          </label>
          <textarea
            id="description"
            rows={4}
            placeholder="What do you produce? Herd size, acreage, mission — give your team context."
            className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
            {...register("description")}
          />
        </div>
      </div>
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-full bg-primary-600 px-6 py-2 text-sm font-semibold text-white shadow hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-primary-300"
        >
          {isSaving ? "Saving..." : "Save profile"}
        </button>
      </div>
    </form>
  );
}
