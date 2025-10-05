"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import Card from "@/components/Card";

const statuses = [
  { label: "Active", value: "active" },
  { label: "Sold", value: "sold" },
  { label: "Deceased", value: "deceased" },
];

export default function AnimalDetailForm({ animal, categories }) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [weightHistory, setWeightHistory] = useState(
    animal.weightHistory || []
  );
  const [healthRecords, setHealthRecords] = useState(
    animal.healthRecords || []
  );
  const [activityMessage, setActivityMessage] = useState("");

  const defaultValues = useMemo(
    () => ({
      tagId: animal.tagId,
      name: animal.name || "",
      categoryId: animal.categoryId?._id || animal.categoryId,
      gender: animal.gender || "unknown",
      status: animal.status || "active",
      dateOfBirth: animal.dateOfBirth
        ? format(new Date(animal.dateOfBirth), "yyyy-MM-dd")
        : "",
      purchaseDate: animal.purchaseDate
        ? format(new Date(animal.purchaseDate), "yyyy-MM-dd")
        : "",
      purchasePrice: animal.purchasePrice ?? "",
      notes: animal.notes || "",
    }),
    [animal]
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    values: defaultValues,
  });

  async function onSubmit(formValues) {
    setIsSaving(true);
    const payload = {
      ...formValues,
      purchasePrice: formValues.purchasePrice
        ? Number(formValues.purchasePrice)
        : null,
      weightHistory,
      healthRecords,
      activityMessage,
    };

    const response = await fetch(`/api/animals/${animal._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      router.refresh();
      setActivityMessage("");
    } else {
      const error = await response.json();
      alert(error?.error || "Failed to update animal.");
    }
    setIsSaving(false);
  }

  async function handleDelete() {
    if (!confirm("Delete this animal record? This action cannot be undone."))
      return;
    setIsDeleting(true);
    const response = await fetch(`/api/animals/${animal._id}`, {
      method: "DELETE",
    });
    if (response.ok) {
      router.push("/animals");
      router.refresh();
    } else {
      const error = await response.json();
      alert(error?.error || "Failed to delete animal.");
    }
    setIsDeleting(false);
  }

  function handleAddWeight(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const date = form.date.value;
    const weight = form.weight.value;
    if (!date || !weight) return;
    setWeightHistory((current) =>
      [...current, { date, weightKg: Number(weight) }].sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      )
    );
    form.reset();
  }

  function handleAddHealth(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const date = form.healthDate.value;
    const type = form.type.value;
    const description = form.description.value;
    if (!date || !type || !description) return;
    setHealthRecords((current) =>
      [
        ...current,
        {
          date,
          type,
          description,
          administeredBy: form.administeredBy.value || "",
        },
      ].sort((a, b) => new Date(b.date) - new Date(a.date))
    );
    form.reset();
  }

  return (
    <div className="space-y-8">
      <button className="text-sm text-slate-500" onClick={() => router.back()}>
        ← Back to animals
      </button>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-wide text-primary-600">
            Animal
          </p>
          <h1 className="text-3xl font-semibold text-slate-800">
            {animal.name || animal.tagId}
          </h1>
          <p className="text-sm text-slate-500">
            Manage lifecycle, update weight history, and log health events.
          </p>
        </div>
        <button
          onClick={() => reset()}
          className="rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
        >
          Reset changes
        </button>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid gap-6 rounded-2xl bg-white p-6 shadow-lg lg:grid-cols-2"
      >
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-800">Identity</h2>
          <div className="space-y-2">
            <label
              className="text-sm font-semibold text-slate-700"
              htmlFor="tagId"
            >
              Tag / EID
            </label>
            <input
              id="tagId"
              className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
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
              Nickname
            </label>
            <input
              id="name"
              className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
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
              className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
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
              <p className="text-xs text-rose-500">
                {errors.categoryId.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <label
              className="text-sm font-semibold text-slate-700"
              htmlFor="status"
            >
              Status
            </label>
            <select
              id="status"
              className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
              {...register("status")}
            >
              {statuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-800">Lifecycle</h2>
          <div className="space-y-2">
            <label
              className="text-sm font-semibold text-slate-700"
              htmlFor="gender"
            >
              Gender
            </label>
            <select
              id="gender"
              className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
              {...register("gender")}
            >
              <option value="unknown">Unknown</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
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
              className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
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
              className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
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
              className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
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
          <div className="space-y-2">
            <label
              className="text-sm font-semibold text-slate-700"
              htmlFor="notes"
            >
              Notes
            </label>
            <textarea
              id="notes"
              rows={4}
              className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
              {...register("notes")}
            />
          </div>
          <div className="space-y-2">
            <label
              className="text-sm font-semibold text-slate-700"
              htmlFor="activityMessage"
            >
              Activity note (optional)
            </label>
            <input
              id="activityMessage"
              placeholder="This note appears in the recent activity feed"
              className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
              value={activityMessage}
              onChange={(event) => setActivityMessage(event.target.value)}
            />
          </div>
        </div>

        <div className="lg:col-span-2 flex flex-wrap items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="rounded-full border border-rose-200 px-5 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isDeleting ? "Deleting..." : "Delete animal"}
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="rounded-full bg-primary-600 px-6 py-2 text-sm font-semibold text-white shadow hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-primary-300"
          >
            {isSaving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card
          title="Weight history"
          description="Maintain weight records for growth tracking"
        >
          <form
            onSubmit={handleAddWeight}
            className="mb-4 flex flex-wrap items-end gap-3 text-sm"
          >
            <div className="flex flex-col gap-1">
              <label
                htmlFor="weight-date"
                className="font-semibold text-slate-700"
              >
                Date
              </label>
              <input
                id="weight-date"
                name="date"
                type="date"
                className="rounded-lg border border-slate-200 px-3 py-2 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label
                htmlFor="weight-value"
                className="font-semibold text-slate-700"
              >
                Weight (kg)
              </label>
              <input
                id="weight-value"
                name="weight"
                type="number"
                step="0.1"
                className="rounded-lg border border-slate-200 px-3 py-2 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
              />
            </div>
            <button
              type="submit"
              className="mt-6 rounded-full bg-primary-600 px-4 py-2 font-semibold text-white hover:bg-primary-700"
            >
              Add entry
            </button>
          </form>
          <ul className="space-y-3 text-sm text-slate-600">
            {weightHistory.map((entry, index) => (
              <li
                key={`${entry.date}-${index}`}
                className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-4 py-2"
              >
                <span>{format(new Date(entry.date), "MMM dd, yyyy")}</span>
                <span className="font-semibold text-slate-800">
                  {entry.weightKg} kg
                </span>
              </li>
            ))}
            {weightHistory.length === 0 && <li>No weight entries yet.</li>}
          </ul>
        </Card>
        <Card
          title="Health records"
          description="Log vaccinations, illnesses, and treatments"
        >
          <form
            onSubmit={handleAddHealth}
            className="mb-4 grid gap-3 text-sm md:grid-cols-2"
          >
            <div className="flex flex-col gap-1">
              <label
                className="font-semibold text-slate-700"
                htmlFor="health-date"
              >
                Date
              </label>
              <input
                id="health-date"
                name="healthDate"
                type="date"
                className="rounded-lg border border-slate-200 px-3 py-2 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label
                className="font-semibold text-slate-700"
                htmlFor="health-type"
              >
                Type
              </label>
              <select
                id="health-type"
                name="type"
                className="rounded-lg border border-slate-200 px-3 py-2 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
              >
                <option value="vaccination">Vaccination</option>
                <option value="illness">Illness</option>
                <option value="treatment">Treatment</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="md:col-span-2 flex flex-col gap-1">
              <label
                className="font-semibold text-slate-700"
                htmlFor="health-description"
              >
                Description
              </label>
              <textarea
                id="health-description"
                name="description"
                rows={3}
                className="rounded-lg border border-slate-200 px-3 py-2 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label
                className="font-semibold text-slate-700"
                htmlFor="health-administeredBy"
              >
                Administered by
              </label>
              <input
                id="health-administeredBy"
                name="administeredBy"
                type="text"
                className="rounded-lg border border-slate-200 px-3 py-2 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
              />
            </div>
            <div className="self-end">
              <button
                type="submit"
                className="rounded-full bg-primary-600 px-4 py-2 font-semibold text-white hover:bg-primary-700"
              >
                Add record
              </button>
            </div>
          </form>
          <ul className="space-y-3 text-sm text-slate-600">
            {healthRecords.map((record, index) => (
              <li
                key={`${record.date}-${index}`}
                className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3"
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-slate-800 capitalize">
                    {record.type}
                  </p>
                  <p className="text-xs text-slate-500">
                    {format(new Date(record.date), "MMM dd, yyyy")}
                  </p>
                </div>
                <p>{record.description}</p>
                {record.administeredBy && (
                  <p className="text-xs text-slate-500">
                    Administered by: {record.administeredBy}
                  </p>
                )}
              </li>
            ))}
            {healthRecords.length === 0 && <li>No health records yet.</li>}
          </ul>
        </Card>
      </section>
    </div>
  );
}
