"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import Card from "@/components/Card";
import Table from "@/components/Table";

export default function FeedsPage() {
  const [feeds, setFeeds] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      type: "",
      supplier: "",
      quantityKg: "",
      cost: "",
      notes: "",
    },
  });

  useEffect(() => {
    fetchFeeds();
  }, []);

  async function fetchFeeds() {
    const response = await fetch("/api/feeds");
    if (response.ok) {
      const payload = await response.json();
      setFeeds(payload.data || []);
    }
  }

  async function onSubmit(values) {
    setLoading(true);
    const payload = {
      ...values,
      quantityKg: values.quantityKg ? Number(values.quantityKg) : 0,
      cost: values.cost ? Number(values.cost) : 0,
    };
    const url = editingId ? `/api/feeds/${editingId}` : "/api/feeds";
    const method = editingId ? "PUT" : "POST";
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (response.ok) {
      reset();
      setEditingId(null);
      fetchFeeds();
    } else {
      const error = await response.json();
      alert(error?.error || "Failed to save feed");
    }
    setLoading(false);
  }

  function startEdit(feed) {
    setEditingId(feed._id);
    setValue("type", feed.type || "");
    setValue("supplier", feed.supplier || "");
    setValue("quantityKg", feed.quantityKg || "");
    setValue("cost", feed.cost || "");
    setValue("notes", feed.notes || "");
  }

  async function remove(id) {
    if (!confirm("Delete this feed entry?")) return;
    const response = await fetch(`/api/feeds/${id}`, { method: "DELETE" });
    if (response.ok) {
      fetchFeeds();
    } else {
      const error = await response.json();
      alert(error?.error || "Failed to delete feed");
    }
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-wide text-primary-600">
            Inventory
          </p>
          <h1 className="text-3xl font-semibold text-slate-800">Feeds</h1>
          <p className="text-sm text-slate-500">
            Monitor nutrition costs and consumption.
          </p>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title={editingId ? "Update feed" : "Add feed"}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid gap-4 text-sm"
          >
            <div className="space-y-2">
              <label className="font-semibold text-slate-700" htmlFor="type">
                Feed type
              </label>
              <input
                id="type"
                className="rounded-lg border border-slate-200 px-4 py-2 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                {...register("type", { required: "Feed type is required" })}
              />
              {errors.type && (
                <p className="text-xs text-rose-500">{errors.type.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <label
                className="font-semibold text-slate-700"
                htmlFor="supplier"
              >
                Supplier
              </label>
              <input
                id="supplier"
                className="rounded-lg border border-slate-200 px-4 py-2 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                {...register("supplier")}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label
                  className="font-semibold text-slate-700"
                  htmlFor="quantityKg"
                >
                  Quantity (kg)
                </label>
                <input
                  id="quantityKg"
                  type="number"
                  step="0.1"
                  className="rounded-lg border border-slate-200 px-4 py-2 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                  {...register("quantityKg", {
                    validate: (value) =>
                      !value || Number(value) >= 0 || "Must be positive",
                  })}
                />
                {errors.quantityKg && (
                  <p className="text-xs text-rose-500">
                    {errors.quantityKg.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label className="font-semibold text-slate-700" htmlFor="cost">
                  Cost (USD)
                </label>
                <input
                  id="cost"
                  type="number"
                  step="0.01"
                  className="rounded-lg border border-slate-200 px-4 py-2 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                  {...register("cost", {
                    validate: (value) =>
                      !value || Number(value) >= 0 || "Must be positive",
                  })}
                />
                {errors.cost && (
                  <p className="text-xs text-rose-500">{errors.cost.message}</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <label className="font-semibold text-slate-700" htmlFor="notes">
                Notes
              </label>
              <textarea
                id="notes"
                rows={3}
                className="rounded-lg border border-slate-200 px-4 py-2 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                {...register("notes")}
              />
            </div>
            <div className="flex justify-between gap-3">
              {editingId && (
                <button
                  type="button"
                  className="rounded-full border border-slate-300 px-5 py-2 font-semibold text-slate-700 hover:bg-slate-100"
                  onClick={() => {
                    reset();
                    setEditingId(null);
                  }}
                >
                  Cancel edit
                </button>
              )}
              <button
                type="submit"
                disabled={loading}
                className="ml-auto rounded-full bg-primary-600 px-6 py-2 font-semibold text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-primary-300"
              >
                {loading ? "Saving..." : editingId ? "Update" : "Add"}
              </button>
            </div>
          </form>
        </Card>

        <Card
          title="Track usage"
          description="Create usage logs to understand feed consumption trends."
        >
          <p className="text-sm text-slate-500">
            POST to{" "}
            <code className="rounded bg-slate-100 px-1">/api/usage-logs</code>{" "}
            with <code>feedId</code> and quantity to track daily feeding. These
            records drive feed consumption reports.
          </p>
          <p className="mt-4 text-xs text-slate-400">
            See the Reports page for CSV exports.
          </p>
        </Card>
      </div>

      <Table
        columns={[
          { header: "Type", accessor: "type" },
          { header: "Supplier", accessor: "supplier" },
          {
            header: "Quantity",
            accessor: "quantityKg",
            cell: (row) => `${row.quantityKg ?? 0} kg`,
          },
          {
            header: "Cost",
            accessor: "cost",
            cell: (row) => `$${Number(row.cost || 0).toFixed(2)}`,
          },
          {
            header: "Updated",
            accessor: "updatedAt",
            cell: (row) =>
              row.updatedAt
                ? format(new Date(row.updatedAt), "MMM dd, yyyy")
                : "—",
          },
          {
            header: "Actions",
            accessor: "actions",
            cell: (row) => (
              <div className="flex gap-3 text-sm">
                <button className="link" onClick={() => startEdit(row)}>
                  Edit
                </button>
                <button
                  className="text-rose-500"
                  onClick={() => remove(row._id)}
                >
                  Delete
                </button>
              </div>
            ),
          },
        ]}
        data={feeds.map((feed) => ({ ...feed, id: feed._id }))}
        emptyMessage="No feed inventory yet."
      />
    </div>
  );
}
