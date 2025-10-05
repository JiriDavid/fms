"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import Card from "@/components/Card";
import Table from "@/components/Table";

export default function SalesPage() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      date: new Date().toISOString().slice(0, 10),
      buyer: "",
      amount: "",
      description: "",
      notes: "",
    },
  });

  useEffect(() => {
    fetchSales();
  }, []);

  async function fetchSales() {
    const response = await fetch("/api/sales");
    if (response.ok) {
      const payload = await response.json();
      setSales(payload.data || []);
    }
  }

  async function onSubmit(values) {
    setLoading(true);
    const payload = {
      date: values.date,
      buyer: values.buyer,
      notes: values.notes,
      items: [
        {
          description: values.description || "Animal sale",
          amount: Number(values.amount),
        },
      ],
    };

    const response = await fetch("/api/sales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      reset({
        date: new Date().toISOString().slice(0, 10),
        buyer: "",
        amount: "",
        description: "",
        notes: "",
      });
      fetchSales();
    } else {
      const error = await response.json();
      alert(error?.error || "Failed to record sale");
    }
    setLoading(false);
  }

  async function remove(id) {
    if (!confirm("Delete this sale?")) return;
    const response = await fetch(`/api/sales/${id}`, { method: "DELETE" });
    if (response.ok) {
      fetchSales();
    } else {
      const error = await response.json();
      alert(error?.error || "Failed to delete sale");
    }
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-wide text-primary-600">
            Finance
          </p>
          <h1 className="text-3xl font-semibold text-slate-800">Sales</h1>
          <p className="text-sm text-slate-500">
            Log sales of animals or farm products to keep profit & loss
            accurate.
          </p>
        </div>
      </header>

      <Card title="Record a sale">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid gap-4 text-sm md:grid-cols-2"
        >
          <div className="space-y-2">
            <label className="font-semibold text-slate-700" htmlFor="date">
              Date
            </label>
            <input
              id="date"
              type="date"
              className="w-full rounded-lg border border-slate-200 px-4 py-2 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
              {...register("date", { required: "Date is required" })}
            />
            {errors.date && (
              <p className="text-xs text-rose-500">{errors.date.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <label className="font-semibold text-slate-700" htmlFor="buyer">
              Buyer
            </label>
            <input
              id="buyer"
              className="w-full rounded-lg border border-slate-200 px-4 py-2 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
              {...register("buyer", { required: "Buyer is required" })}
            />
            {errors.buyer && (
              <p className="text-xs text-rose-500">{errors.buyer.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <label
              className="font-semibold text-slate-700"
              htmlFor="description"
            >
              Product / Animal(s)
            </label>
            <input
              id="description"
              placeholder="2x Boer goats"
              className="w-full rounded-lg border border-slate-200 px-4 py-2 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
              {...register("description")}
            />
          </div>
          <div className="space-y-2">
            <label className="font-semibold text-slate-700" htmlFor="amount">
              Amount (USD)
            </label>
            <input
              id="amount"
              type="number"
              step="0.01"
              className="w-full rounded-lg border border-slate-200 px-4 py-2 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
              {...register("amount", {
                required: "Amount is required",
                validate: (value) =>
                  Number(value) > 0 || "Amount must be positive",
              })}
            />
            {errors.amount && (
              <p className="text-xs text-rose-500">{errors.amount.message}</p>
            )}
          </div>
          <div className="md:col-span-2 space-y-2">
            <label className="font-semibold text-slate-700" htmlFor="notes">
              Notes
            </label>
            <textarea
              id="notes"
              rows={3}
              className="w-full rounded-lg border border-slate-200 px-4 py-2 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
              {...register("notes")}
            />
          </div>
          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="rounded-full bg-primary-600 px-6 py-2 font-semibold text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-primary-300"
            >
              {loading ? "Saving..." : "Record sale"}
            </button>
          </div>
        </form>
      </Card>

      <Table
        columns={[
          {
            header: "Date",
            accessor: "date",
            cell: (row) => format(new Date(row.date), "MMM dd, yyyy"),
          },
          { header: "Buyer", accessor: "buyer" },
          {
            header: "Total",
            accessor: "totalAmount",
            cell: (row) => `$${Number(row.totalAmount || 0).toFixed(2)}`,
          },
          {
            header: "Items",
            accessor: "items",
            cell: (row) =>
              row.items?.map((item) => item.description).join(", ") || "—",
          },
          {
            header: "Actions",
            accessor: "actions",
            cell: (row) => (
              <button className="text-rose-500" onClick={() => remove(row._id)}>
                Delete
              </button>
            ),
          },
        ]}
        data={sales.map((sale) => ({ ...sale, id: sale._id }))}
        emptyMessage="No sales recorded yet."
      />
    </div>
  );
}
