"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import Link from "next/link";
import Card from "@/components/Card";
import Table from "@/components/Table";

const defaultCategories = [
  "Feed",
  "Medicine",
  "Labor",
  "Maintenance",
  "Transport",
  "Utilities",
  "Equipment",
  "Veterinary",
  "Marketing",
  "Insurance",
  "Other",
];

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [livestockBatches, setLivestockBatches] = useState([]);
  const [stats, setStats] = useState({
    totalExpenses: 0,
    totalAmount: 0,
    averageExpense: 0,
    topCategory: "None",
  });

  useEffect(() => {
    fetchExpenses();
    fetchLivestockBatches();
  }, []);

  async function fetchExpenses() {
    const response = await fetch("/api/expenses");
    if (response.ok) {
      const payload = await response.json();
      const expensesData = payload.data || [];
      setExpenses(expensesData);

      // Calculate stats
      const totalAmount = expensesData.reduce(
        (sum, expense) => sum + (expense.amount || 0),
        0
      );
      const averageExpense =
        expensesData.length > 0 ? totalAmount / expensesData.length : 0;

      // Find top category
      const categoryTotals = expensesData.reduce((acc, expense) => {
        acc[expense.category] =
          (acc[expense.category] || 0) + (expense.amount || 0);
        return acc;
      }, {});
      const topCategory =
        Object.entries(categoryTotals).sort(([, a], [, b]) => b - a)[0]?.[0] ||
        "None";

      setStats({
        totalExpenses: expensesData.length,
        totalAmount,
        averageExpense,
        topCategory,
      });
    }
  }

  async function fetchLivestockBatches() {
    const response = await fetch("/api/animals");
    if (response.ok) {
      const payload = await response.json();
      setLivestockBatches(payload.data || []);
    }
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
      {/* Header Section */}
      <header className="flex flex-wrap items-center justify-between gap-6">
        <div>
          <p className="text-sm uppercase tracking-wide text-primary-600 font-medium">
            Financial Management
          </p>
          <h1 className="text-3xl font-bold text-slate-900">Expense Records</h1>
          <p className="text-slate-600 mt-1">
            Track operating costs and expenses for accurate profit & loss
            analysis
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/expenses/new"
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Record Expense
          </Link>
        </div>
      </header>

      {/* Statistics Cards */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">
                Total Expenses
              </p>
              <p className="text-2xl font-bold text-slate-900">
                {stats.totalExpenses}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
              <svg
                className="h-6 w-6 text-orange-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Total Amount</p>
              <p className="text-2xl font-bold text-slate-900">
                ${stats.totalAmount.toFixed(2)}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-100">
              <svg
                className="h-6 w-6 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Avg Expense</p>
              <p className="text-2xl font-bold text-slate-900">
                ${stats.averageExpense.toFixed(2)}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100">
              <svg
                className="h-6 w-6 text-indigo-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Top Category</p>
              <p className="text-2xl font-bold text-slate-900">
                {stats.topCategory}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Expenses Table */}
      <section>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            Expense History
          </h2>
          <p className="text-sm text-slate-600">
            Detailed view of all recorded expenses
          </p>
        </div>

        <div className="overflow-x-auto">
          <Table
            columns={[
              {
                header: "Date",
                accessor: "date",
                cell: (row) => {
                  if (!row.date) return "—";
                  try {
                    const date = new Date(row.date);
                    if (isNaN(date.getTime())) return "Invalid Date";
                    return format(date, "MMM dd, yyyy");
                  } catch (error) {
                    return "Invalid Date";
                  }
                },
              },
              { header: "Category", accessor: "category" },
              { header: "Description", accessor: "description" },
              {
                header: "Amount",
                accessor: "amount",
                cell: (row) => `$${Number(row.amount || 0).toFixed(2)}`,
              },
              {
                header: "Batch",
                accessor: "livestockBatchId",
                cell: (row) => {
                  if (!row.livestockBatchId) return "—";
                  const batch = livestockBatches.find(
                    (b) => b._id === row.livestockBatchId
                  );
                  return batch
                    ? `${batch.batchName} (${batch.livestockType})`
                    : "Unknown";
                },
              },
              { header: "Supplier", accessor: "supplier" },
              {
                header: "Actions",
                accessor: "actions",
                cell: (row) => (
                  <button
                    className="text-rose-500 hover:text-rose-700"
                    onClick={() => remove(row._id)}
                  >
                    Delete
                  </button>
                ),
              },
            ]}
            data={expenses.map((expense) => ({ ...expense, id: expense._id }))}
            emptyMessage={
              <div className="text-center py-12">
                <svg
                  className="w-12 h-12 mx-auto text-slate-400 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <h3 className="text-lg font-medium text-slate-900 mb-2">
                  No expenses recorded yet
                </h3>
                <p className="text-slate-600 mb-6">
                  Start recording your operating costs and expenses to track
                  profitability
                </p>
                <Link
                  href="/expenses/new"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  Record Your First Expense
                </Link>
              </div>
            }
          />
        </div>
      </section>
    </div>
  );
}
