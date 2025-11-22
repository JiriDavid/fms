"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Card from "@/components/Card";

export default function NewTaskPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [livestockBatches, setLivestockBatches] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: "",
      description: "",
      dueDate: "",
      assigneeId: "",
      relatedAnimalId: "",
      tags: "",
    },
  });

  useEffect(() => {
    fetchLivestockBatches();
  }, []);

  async function fetchLivestockBatches() {
    const response = await fetch("/api/animals");
    if (response.ok) {
      const payload = await response.json();
      setLivestockBatches(payload.data || []);
    }
  }

  async function onSubmit(values) {
    setLoading(true);
    const payload = {
      ...values,
      tags: values.tags ? values.tags.split(",").map((tag) => tag.trim()) : [],
    };
    const response = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (response.ok) {
      router.push("/tasks");
    } else {
      const error = await response.json();
      alert(error?.error || "Failed to create task");
    }
    setLoading(false);
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <header className="flex items-center gap-4">
        <Link
          href="/tasks"
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </Link>
        <div>
          <p className="text-sm uppercase tracking-wide text-primary-600 font-medium">
            Operations Management
          </p>
          <h1 className="text-3xl font-bold text-slate-900">Create New Task</h1>
          <p className="text-slate-600 mt-1">
            Add a new task to track farm operations and assignments
          </p>
        </div>
      </header>

      {/* Form Card */}
      <Card>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid gap-6 text-sm md:grid-cols-2"
        >
          <div className="space-y-2 md:col-span-2">
            <label
              className="block text-sm font-medium text-slate-700"
              htmlFor="title"
            >
              Task Title *
            </label>
            <input
              id="title"
              placeholder="e.g. Morning feeding for broiler batch A"
              className="w-full rounded-lg border border-slate-200 px-4 py-2.5 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 transition-colors"
              {...register("title", { required: "Task title is required" })}
            />
            {errors.title && (
              <p className="text-xs text-rose-500">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2 md:col-span-2">
            <label
              className="block text-sm font-medium text-slate-700"
              htmlFor="description"
            >
              Description
            </label>
            <textarea
              id="description"
              rows={4}
              placeholder="Detailed instructions, requirements, or notes for this task"
              className="w-full rounded-lg border border-slate-200 px-4 py-2.5 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 transition-colors"
              {...register("description")}
            />
          </div>

          <div className="space-y-2">
            <label
              className="block text-sm font-medium text-slate-700"
              htmlFor="dueDate"
            >
              Due Date
            </label>
            <input
              id="dueDate"
              type="date"
              className="w-full rounded-lg border border-slate-200 px-4 py-2.5 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 transition-colors"
              {...register("dueDate")}
            />
          </div>

          <div className="space-y-2">
            <label
              className="block text-sm font-medium text-slate-700"
              htmlFor="assigneeId"
            >
              Assignee (Clerk ID)
            </label>
            <input
              id="assigneeId"
              placeholder="user_123"
              className="w-full rounded-lg border border-slate-200 px-4 py-2.5 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 transition-colors"
              {...register("assigneeId")}
            />
            <p className="text-xs text-slate-500">
              Optional: assign to another Clerk user in your organization
            </p>
          </div>

          <div className="space-y-2 md:col-span-2">
            <label
              className="block text-sm font-medium text-slate-700"
              htmlFor="relatedAnimalId"
            >
              Related Livestock Batch
            </label>
            <select
              id="relatedAnimalId"
              className="w-full rounded-lg border border-slate-200 px-4 py-2.5 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 transition-colors"
              {...register("relatedAnimalId")}
            >
              <option value="">Select batch (optional)</option>
              {livestockBatches.map((batch) => (
                <option key={batch._id} value={batch._id}>
                  {batch.batchName} ({batch.livestockType})
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-500">
              Link this task to a specific livestock batch for better
              organization
            </p>
          </div>

          <div className="space-y-2 md:col-span-2">
            <label
              className="block text-sm font-medium text-slate-700"
              htmlFor="tags"
            >
              Tags (comma separated)
            </label>
            <input
              id="tags"
              placeholder="vaccination, morning, urgent"
              className="w-full rounded-lg border border-slate-200 px-4 py-2.5 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 transition-colors"
              {...register("tags")}
            />
            <p className="text-xs text-slate-500">
              Add tags to categorize and filter tasks
            </p>
          </div>

          <div className="md:col-span-2 flex justify-end gap-3 pt-4">
            <Link
              href="/tasks"
              className="rounded-lg border border-slate-200 px-6 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-primary-300 transition-colors"
            >
              {loading ? "Creating Task..." : "Create Task"}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}
