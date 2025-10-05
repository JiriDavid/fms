"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import Card from "@/components/Card";
import Table from "@/components/Table";

export default function MedicinesPage() {
  const [medicines, setMedicines] = useState([]);
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
      name: "",
      supplier: "",
      batchNumber: "",
      quantityOnHand: "",
      dosageInstructions: "",
      expiryDate: "",
    },
  });

  useEffect(() => {
    fetchMedicines();
  }, []);

  async function fetchMedicines() {
    const response = await fetch("/api/medicines");
    if (response.ok) {
      const payload = await response.json();
      setMedicines(payload.data || []);
    }
  }

  async function onSubmit(values) {
    setLoading(true);
    const payload = {
      ...values,
      quantityOnHand: values.quantityOnHand ? Number(values.quantityOnHand) : 0,
    };
    const url = editingId ? `/api/medicines/${editingId}` : "/api/medicines";
    const method = editingId ? "PUT" : "POST";
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (response.ok) {
      reset();
      setEditingId(null);
      fetchMedicines();
    } else {
      const error = await response.json();
      alert(error?.error || "Failed to save medicine");
    }
    setLoading(false);
  }

  function startEdit(medicine) {
    setEditingId(medicine._id);
    setValue("name", medicine.name || "");
    setValue("supplier", medicine.supplier || "");
    setValue("batchNumber", medicine.batchNumber || "");
    setValue("quantityOnHand", medicine.quantityOnHand || "");
    setValue("dosageInstructions", medicine.dosageInstructions || "");
    setValue(
      "expiryDate",
      medicine.expiryDate
        ? format(new Date(medicine.expiryDate), "yyyy-MM-dd")
        : ""
    );
  }

  async function remove(id) {
    if (!confirm("Delete this medicine entry?")) return;
    const response = await fetch(`/api/medicines/${id}`, { method: "DELETE" });
    if (response.ok) {
      fetchMedicines();
    } else {
      const error = await response.json();
      alert(error?.error || "Failed to delete medicine");
    }
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-wide text-primary-600">
            Inventory
          </p>
          <h1 className="text-3xl font-semibold text-slate-800">Medicines</h1>
          <p className="text-sm text-slate-500">
            Track treatments, dosage instructions, and stock levels.
          </p>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title={editingId ? "Update medicine" : "Add medicine"}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid gap-4 text-sm"
          >
            <div className="space-y-2">
              <label className="font-semibold text-slate-700" htmlFor="name">
                Name
              </label>
              <input
                id="name"
                className="rounded-lg border border-slate-200 px-4 py-2 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                {...register("name", { required: "Name is required" })}
              />
              {errors.name && (
                <p className="text-xs text-rose-500">{errors.name.message}</p>
              )}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
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
              <div className="space-y-2">
                <label
                  className="font-semibold text-slate-700"
                  htmlFor="batchNumber"
                >
                  Batch number
                </label>
                <input
                  id="batchNumber"
                  className="rounded-lg border border-slate-200 px-4 py-2 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                  {...register("batchNumber")}
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label
                  className="font-semibold text-slate-700"
                  htmlFor="quantityOnHand"
                >
                  Quantity on hand
                </label>
                <input
                  id="quantityOnHand"
                  type="number"
                  className="rounded-lg border border-slate-200 px-4 py-2 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                  {...register("quantityOnHand", {
                    validate: (value) =>
                      !value || Number(value) >= 0 || "Must be positive",
                  })}
                />
                {errors.quantityOnHand && (
                  <p className="text-xs text-rose-500">
                    {errors.quantityOnHand.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label
                  className="font-semibold text-slate-700"
                  htmlFor="expiryDate"
                >
                  Expiry date
                </label>
                <input
                  id="expiryDate"
                  type="date"
                  className="rounded-lg border border-slate-200 px-4 py-2 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                  {...register("expiryDate")}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label
                className="font-semibold text-slate-700"
                htmlFor="dosageInstructions"
              >
                Dosage instructions
              </label>
              <textarea
                id="dosageInstructions"
                rows={3}
                className="rounded-lg border border-slate-200 px-4 py-2 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                {...register("dosageInstructions")}
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
          title="Usage log"
          description="Track which animals received which medicine via Usage Logs API."
        >
          <p className="text-sm text-slate-500">
            POST to{" "}
            <code className="rounded bg-slate-100 px-1">/api/usage-logs</code>{" "}
            including <code>animalId</code>, <code>medicineId</code>, and dosage
            to link treatments.
          </p>
          <p className="mt-4 text-xs text-slate-400">
            Tip: Run <code>node .seed.js</code> to load demo medicines and usage
            history.
          </p>
        </Card>
      </div>

      <Table
        columns={[
          { header: "Name", accessor: "name" },
          { header: "Supplier", accessor: "supplier" },
          { header: "Batch", accessor: "batchNumber" },
          {
            header: "Quantity",
            accessor: "quantityOnHand",
            cell: (row) => `${row.quantityOnHand ?? 0}`,
          },
          {
            header: "Expiry",
            accessor: "expiryDate",
            cell: (row) =>
              row.expiryDate
                ? format(new Date(row.expiryDate), "MMM dd, yyyy")
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
        data={medicines.map((item) => ({ ...item, id: item._id }))}
        emptyMessage="No medicines logged yet."
      />
    </div>
  );
}
