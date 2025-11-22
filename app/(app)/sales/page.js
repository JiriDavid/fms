"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import Link from "next/link";
import Card from "@/components/Card";
import Table from "@/components/Table";

export default function SalesPage() {
  const [sales, setSales] = useState([]);
  const [livestockBatches, setLivestockBatches] = useState([]);
  const [stats, setStats] = useState({
    totalSales: 0,
    totalRevenue: 0,
    averagePrice: 0,
  });

  useEffect(() => {
    fetchSales();
    fetchLivestockBatches();
  }, []);

  async function fetchSales() {
    const response = await fetch("/api/sales");
    if (response.ok) {
      const payload = await response.json();
      const salesData = payload.data || [];
      setSales(salesData);

      // Calculate stats
      const totalRevenue = salesData.reduce(
        (sum, sale) => sum + (sale.totalAmount || 0),
        0
      );
      const totalQuantity = salesData.reduce(
        (sum, sale) => sum + (sale.quantity || 0),
        0
      );
      const averagePrice = totalQuantity > 0 ? totalRevenue / totalQuantity : 0;

      setStats({
        totalSales: salesData.length,
        totalRevenue,
        averagePrice,
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
      {/* Header Section */}
      <header className="flex flex-wrap items-center justify-between gap-6">
        <div>
          <p className="text-sm uppercase tracking-wide text-primary-600 font-medium">
            Financial Management
          </p>
          <h1 className="text-3xl font-bold text-slate-900">Sales Records</h1>
          <p className="text-slate-600 mt-1">
            Track all livestock and product sales with detailed revenue
            analytics
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/sales/new"
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
            Record Sale
          </Link>
        </div>
      </header>

      {/* Statistics Cards */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
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
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Total Sales</p>
              <p className="text-2xl font-bold text-slate-900">
                {stats.totalSales}
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
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">
                Total Revenue
              </p>
              <p className="text-2xl font-bold text-slate-900">
                ${stats.totalRevenue.toFixed(2)}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
              <svg
                className="h-6 w-6 text-purple-600"
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
                Avg Price/Unit
              </p>
              <p className="text-2xl font-bold text-slate-900">
                ${stats.averagePrice.toFixed(2)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Sales Table */}
      <section>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            Sales History
          </h2>
          <p className="text-sm text-slate-600">
            Detailed view of all recorded sales
          </p>
        </div>

        <div className="overflow-x-auto">
          <Table
            columns={[
              {
                header: "Date",
                accessor: "saleDate",
                cell: (row) => {
                  if (!row.saleDate) return "—";
                  try {
                    const date = new Date(row.saleDate);
                    if (isNaN(date.getTime())) return "Invalid Date";
                    return format(date, "MMM dd, yyyy");
                  } catch (error) {
                    return "Invalid Date";
                  }
                },
              },
              { header: "Product", accessor: "productSold" },
              {
                header: "Quantity",
                accessor: "quantity",
                cell: (row) => Number(row.quantity).toLocaleString(),
              },
              {
                header: "Unit Price",
                accessor: "unitPrice",
                cell: (row) => `$${Number(row.unitPrice).toFixed(2)}`,
              },
              {
                header: "Total",
                accessor: "totalAmount",
                cell: (row) => `$${Number(row.totalAmount).toFixed(2)}`,
              },
              { header: "Buyer", accessor: "buyer" },
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
            data={sales.map((sale) => ({ ...sale, id: sale._id }))}
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
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="text-lg font-medium text-slate-900 mb-2">
                  No sales recorded yet
                </h3>
                <p className="text-slate-600 mb-6">
                  Start recording your livestock and product sales to track
                  revenue
                </p>
                <Link
                  href="/sales/new"
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
                  Record Your First Sale
                </Link>
              </div>
            }
          />
        </div>
      </section>
    </div>
  );
}
