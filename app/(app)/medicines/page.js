"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import Link from "next/link";
import Card from "@/components/Card";

export default function MedicinesPage() {
  const [medicines, setMedicines] = useState([]);
  const [stats, setStats] = useState({
    totalItems: 0,
    totalValue: 0,
    expiringSoon: 0,
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
      purpose: "",
      quantityPurchased: "",
      unit: "ml",
      cost: "",
      purchaseDate: "",
      expiryDate: "",
      supplier: "",
      batchNumber: "",
      dosageInstructions: "",
      notes: "",
    },
  });

  useEffect(() => {
    fetchMedicines();
  }, []);

  async function fetchMedicines() {
    const response = await fetch("/api/medicines");
    if (response.ok) {
      const payload = await response.json();
      const medicineData = payload.data || [];
      setMedicines(medicineData);

      // Calculate stats
      const totalItems = medicineData.length;
      const totalValue = medicineData.reduce(
        (sum, med) => sum + (med.cost || 0),
        0
      );
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      const expiringSoon = medicineData.filter(
        (med) => med.expiryDate && new Date(med.expiryDate) <= thirtyDaysFromNow
      ).length;

      setStats({ totalItems, totalValue, expiringSoon });
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
    setValue("purpose", medicine.purpose || "");
    setValue("quantityPurchased", medicine.quantityPurchased || "");
    setValue("unit", medicine.unit || "ml");
    setValue("cost", medicine.cost || "");
    setValue(
      "purchaseDate",
      medicine.purchaseDate
        ? format(new Date(medicine.purchaseDate), "yyyy-MM-dd")
        : ""
    );
    setValue(
      "expiryDate",
      medicine.expiryDate
        ? format(new Date(medicine.expiryDate), "yyyy-MM-dd")
        : ""
    );
    setValue("supplier", medicine.supplier || "");
    setValue("batchNumber", medicine.batchNumber || "");
    setValue("dosageInstructions", medicine.dosageInstructions || "");
    setValue("notes", medicine.notes || "");
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
      {/* Header Section */}
      <header className="flex flex-wrap items-center justify-between gap-6">
        <div>
          <p className="text-sm uppercase tracking-wide text-primary-600 font-medium">
            Medicine Inventory Management
          </p>
          <h1 className="text-3xl font-bold text-slate-900">
            Medicine Stock & Usage
          </h1>
          <p className="text-slate-600 mt-1">
            Monitor medicine inventory, expiry dates, and treatment records
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/medicines/new"
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
            Add Medicine Stock
          </Link>
        </div>
      </header>

      {/* Stats Cards */}
      <section className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
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
                  d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">
                Medicine Types
              </p>
              <p className="text-2xl font-bold text-slate-900">
                {stats.totalItems}
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

        <Card>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100">
              <svg
                className="h-6 w-6 text-amber-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">
                Expiring Soon
              </p>
              <p className="text-2xl font-bold text-slate-900">
                {stats.expiringSoon}
              </p>
            </div>
          </div>
        </Card>
      </section>

      {/* Medicine Inventory Table */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">
            Medicine Inventory
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Complete overview of all medicine stocks and their details
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Medicine Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Purpose
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Quantity
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Cost
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Expiry Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Supplier
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {medicines.length === 0 && (
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
                          d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                        />
                      </svg>
                      <h3 className="text-lg font-medium text-slate-900 mb-2">
                        No medicine inventory yet
                      </h3>
                      <p className="text-slate-600 mb-6">
                        Get started by adding your first medicine stock
                      </p>
                      <Link
                        href="/medicines/new"
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
                        Add Your First Medicine
                      </Link>
                    </div>
                  </td>
                </tr>
              )}
              {medicines.map((medicine) => {
                const isExpiringSoon =
                  medicine.expiryDate &&
                  new Date(medicine.expiryDate) <=
                    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
                const isExpired =
                  medicine.expiryDate &&
                  new Date(medicine.expiryDate) < new Date();

                return (
                  <tr
                    key={medicine._id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-4 py-4 text-sm text-slate-700">
                      <div className="font-medium text-slate-900">
                        {medicine.name}
                      </div>
                      {medicine.batchNumber && (
                        <div className="text-xs text-slate-500">
                          Batch: {medicine.batchNumber}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-700">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {medicine.purpose}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-700">
                      <span className="font-medium">
                        {medicine.quantityPurchased?.toLocaleString() || 0}
                      </span>
                      <span className="text-slate-500 ml-1">
                        {medicine.unit}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-700">
                      <span className="font-medium text-slate-900">
                        ${medicine.cost?.toFixed(2) || "0.00"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-700">
                      {medicine.expiryDate ? (
                        <span
                          className={`inline-flex items-center gap-1 ${
                            isExpired
                              ? "text-red-700 font-medium"
                              : isExpiringSoon
                              ? "text-amber-700 font-medium"
                              : "text-slate-700"
                          }`}
                        >
                          {format(
                            new Date(medicine.expiryDate),
                            "MMM dd, yyyy"
                          )}
                          {isExpired && (
                            <svg
                              className="w-4 h-4 text-red-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                              />
                            </svg>
                          )}
                          {isExpiringSoon && !isExpired && (
                            <svg
                              className="w-4 h-4 text-amber-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                              />
                            </svg>
                          )}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-700">
                      {medicine.supplier || "—"}
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-700">
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEdit(medicine)}
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
                          onClick={() => remove(medicine._id)}
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
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
