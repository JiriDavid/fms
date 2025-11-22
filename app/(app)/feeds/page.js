"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import Link from "next/link";
import Card from "@/components/Card";

export default function FeedsPage() {
  const [feeds, setFeeds] = useState([]);
  const [stats, setStats] = useState({
    totalItems: 0,
    totalValue: 0,
    totalQuantity: 0,
  });
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
      unit: "kg",
      quantityPurchased: "",
      cost: "",
      purchaseDate: "",
      supplier: "",
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
      const feedData = payload.data || [];
      setFeeds(feedData);

      // Calculate stats
      const totalItems = feedData.length;
      const totalValue = feedData.reduce(
        (sum, feed) => sum + (feed.cost || 0),
        0
      );
      const totalQuantity = feedData.reduce(
        (sum, feed) => sum + (feed.quantityPurchased || 0),
        0
      );

      setStats({ totalItems, totalValue, totalQuantity });
    }
  }

  async function onSubmit(values) {
    setLoading(true);
    const payload = {
      ...values,
      quantityPurchased: values.quantityPurchased
        ? Number(values.quantityPurchased)
        : 0,
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
    setValue("name", feed.name || "");
    setValue("unit", feed.unit || "kg");
    setValue("quantityPurchased", feed.quantityPurchased || "");
    setValue("cost", feed.cost || "");
    setValue(
      "purchaseDate",
      feed.purchaseDate ? format(new Date(feed.purchaseDate), "yyyy-MM-dd") : ""
    );
    setValue("supplier", feed.supplier || "");
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
      {/* Header Section */}
      <header className="flex flex-wrap items-center justify-between gap-6">
        <div>
          <p className="text-sm uppercase tracking-wide text-primary-600 font-medium">
            Feed Inventory Management
          </p>
          <h1 className="text-3xl font-bold text-slate-900">
            Feed Stock & Usage
          </h1>
          <p className="text-slate-600 mt-1">
            Monitor feed inventory, costs, and consumption patterns
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/feeds/new"
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
            Add Feed Stock
          </Link>
        </div>
      </header>

      {/* Stats Cards */}
      <section className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
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
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Feed Types</p>
              <p className="text-2xl font-bold text-slate-900">
                {stats.totalItems}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
              <svg
                className="h-6 w-6 text-green-600"
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
              <p className="text-sm font-medium text-slate-600">
                Total Quantity
              </p>
              <p className="text-2xl font-bold text-slate-900">
                {stats.totalQuantity.toLocaleString()}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
              <svg
                className="h-6 w-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Total Value</p>
              <p className="text-2xl font-bold text-slate-900">
                ${stats.totalValue.toFixed(2)}
              </p>
            </div>
          </div>
        </Card>
      </section>

      {/* Feed Inventory Table */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">
            Feed Inventory
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Complete overview of all feed stocks and their details
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Feed Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Supplier
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Quantity
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Unit Cost
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Total Cost
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Purchase Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {feeds.length === 0 && (
                <tr>
                  <td
                    className="px-4 py-6 text-center text-sm text-slate-500"
                    colSpan={7}
                  >
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
                          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                        />
                      </svg>
                      <h3 className="text-lg font-medium text-slate-900 mb-2">
                        No feed inventory yet
                      </h3>
                      <p className="text-slate-600 mb-6">
                        Get started by adding your first feed stock
                      </p>
                      <Link
                        href="/feeds/new"
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
                        Add Your First Feed
                      </Link>
                    </div>
                  </td>
                </tr>
              )}
              {feeds.map((feed) => (
                <tr
                  key={feed._id}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="px-4 py-4 text-sm text-slate-700">
                    <div className="font-medium text-slate-900">
                      {feed.name}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-700">
                    {feed.supplier || "—"}
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-700">
                    <span className="font-medium">
                      {feed.quantityPurchased?.toLocaleString() || 0}
                    </span>
                    <span className="text-slate-500 ml-1">{feed.unit}</span>
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-700">
                    $
                    {(feed.cost / feed.quantityPurchased)?.toFixed(2) || "0.00"}
                    /{feed.unit}
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-700">
                    <span className="font-medium text-slate-900">
                      ${feed.cost?.toFixed(2) || "0.00"}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-700">
                    {feed.purchaseDate
                      ? format(new Date(feed.purchaseDate), "MMM dd, yyyy")
                      : "—"}
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-700">
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(feed)}
                        className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-md transition-colors"
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
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                        Edit
                      </button>
                      <button
                        onClick={() => remove(feed._id)}
                        className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
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
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
