"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import Card from "@/components/Card";
import Table from "@/components/Table";

const defaultCategories = [
  "Feed",
  "Medicine",
  "Labor",
  "Maintenance",
  "Transport",
  "Utilities",
];

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      date: new Date().toISOString().slice(0, 10),
      category: "Feed",
      amount: "",
      notes: "",
    },
  });

  useEffect(() => {
    fetchExpenses();
  }, []);

  async function fetchExpenses() {
    const response = await fetch("/api/expenses");
    if (response.ok) {
      const payload = await response.json();
      setExpenses(payload.data || []);
    }
  }

  async function onSubmit(values) {
    setLoading(true);
    const payload = {
      date: values.date,
      category: values.category,
      amount: Number(values.amount),
      notes: values.notes,
    };
    const response = await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (response.ok) {
      reset({
        date: new Date().toISOString().slice(0, 10),
        category: values.category,
        amount: "",
        notes: "",
      });
      fetchExpenses();
    } else {
      const error = await response.json();
      alert(error?.error || "Failed to record expense");
    }
    setLoading(false);
  }

  async function remove(id) {
    if (!confirm("Delete this expense?")) return;
    const response = await fetch(`/api/expenses/${id}`, { method: "DELETE" });
    if (response.ok) {
      fetchExpenses();
    } else {
      const error = await response.json();
      alert(error?.error || "Failed to delete expense");
    }
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-wide text-primary-600">
            Finance
          </p>
          <h1 className="text-3xl font-semibold text-slate-800">Expenses</h1>
          <p className="text-sm text-slate-500">
            Log operating costs to keep your profit & loss accurate.
          </p>
        </div>
      </header>

      <Card title="Record an expense">
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
            <label className="font-semibold text-slate-700" htmlFor="category">
              Category
            </label>
            <select
              id="category"
              className="w-full rounded-lg border border-slate-200 px-4 py-2 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
              {...register("category", { required: "Category is required" })}
            >
              {defaultCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-xs text-rose-500">{errors.category.message}</p>
            )}
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
                  Number(value) >= 0 || "Amount must be positive",
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
              {loading ? "Saving..." : "Record expense"}
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
          { header: "Category", accessor: "category" },
          {
            header: "Amount",
            accessor: "amount",
            cell: (row) => `$${Number(row.amount || 0).toFixed(2)}`,
          },
          {
            header: "Notes",
            accessor: "notes",
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
        data={expenses.map((expense) => ({ ...expense, id: expense._id }))}
        emptyMessage="No expenses recorded yet."
      />
    </div>
  );
}
