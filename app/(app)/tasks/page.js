"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { format, isPast } from "date-fns";
import Card from "@/components/Card";
import Table from "@/components/Table";

const statusBadges = {
  pending: "bg-amber-100 text-amber-700",
  in_progress: "bg-primary-100 text-primary-700",
  completed: "bg-primary-200 text-primary-800",
};

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
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
    fetchTasks();
  }, []);

  async function fetchTasks() {
    const response = await fetch("/api/tasks");
    if (response.ok) {
      const payload = await response.json();
      setTasks(payload.data || []);
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
      reset();
      fetchTasks();
    } else {
      const error = await response.json();
      alert(error?.error || "Failed to create task");
    }
    setLoading(false);
  }

  async function updateStatus(id, status) {
    const response = await fetch(`/api/tasks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (response.ok) {
      fetchTasks();
    }
  }

  async function remove(id) {
    if (!confirm("Delete this task?")) return;
    const response = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    if (response.ok) {
      fetchTasks();
    }
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-wide text-primary-600">
            Operations
          </p>
          <h1 className="text-3xl font-semibold text-slate-800">Daily tasks</h1>
          <p className="text-sm text-slate-500">
            Assign feeding, vaccination, and inspection work to your team.
          </p>
        </div>
      </header>

      <Card title="Create a task">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid gap-4 text-sm md:grid-cols-2"
        >
          <div className="space-y-2 md:col-span-2">
            <label className="font-semibold text-slate-700" htmlFor="title">
              Title
            </label>
            <input
              id="title"
              className="w-full rounded-lg border border-slate-200 px-4 py-2 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
              {...register("title", { required: "Title is required" })}
            />
            {errors.title && (
              <p className="text-xs text-rose-500">{errors.title.message}</p>
            )}
          </div>
          <div className="space-y-2 md:col-span-2">
            <label
              className="font-semibold text-slate-700"
              htmlFor="description"
            >
              Description
            </label>
            <textarea
              id="description"
              rows={3}
              className="w-full rounded-lg border border-slate-200 px-4 py-2 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
              {...register("description")}
            />
          </div>
          <div className="space-y-2">
            <label className="font-semibold text-slate-700" htmlFor="dueDate">
              Due date
            </label>
            <input
              id="dueDate"
              type="date"
              className="w-full rounded-lg border border-slate-200 px-4 py-2 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
              {...register("dueDate")}
            />
          </div>
          <div className="space-y-2">
            <label
              className="font-semibold text-slate-700"
              htmlFor="assigneeId"
            >
              Assignee (Clerk ID)
            </label>
            <input
              id="assigneeId"
              placeholder="user_123"
              className="w-full rounded-lg border border-slate-200 px-4 py-2 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
              {...register("assigneeId")}
            />
            <p className="text-xs text-slate-400">
              Optional: assign to another Clerk user in your organisation.
            </p>
          </div>
          <div className="space-y-2">
            <label
              className="font-semibold text-slate-700"
              htmlFor="relatedAnimalId"
            >
              Related animal ID
            </label>
            <input
              id="relatedAnimalId"
              placeholder="Paste animal ObjectId"
              className="w-full rounded-lg border border-slate-200 px-4 py-2 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
              {...register("relatedAnimalId")}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="font-semibold text-slate-700" htmlFor="tags">
              Tags (comma separated)
            </label>
            <input
              id="tags"
              placeholder="vaccination, morning"
              className="w-full rounded-lg border border-slate-200 px-4 py-2 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
              {...register("tags")}
            />
          </div>
          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="rounded-full bg-primary-600 px-6 py-2 font-semibold text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-primary-300"
            >
              {loading ? "Saving..." : "Create task"}
            </button>
          </div>
        </form>
      </Card>

      <Table
        columns={[
          {
            header: "Title",
            accessor: "title",
            cell: (row) => (
              <div>
                <p className="font-semibold text-slate-800">{row.title}</p>
                {row.description && (
                  <p className="text-xs text-slate-500">{row.description}</p>
                )}
              </div>
            ),
          },
          {
            header: "Due",
            accessor: "dueDate",
            cell: (row) =>
              row.dueDate ? (
                <span
                  className={
                    isPast(new Date(row.dueDate)) && row.status !== "completed"
                      ? "text-rose-500"
                      : ""
                  }
                >
                  {format(new Date(row.dueDate), "MMM dd")}
                </span>
              ) : (
                "—"
              ),
          },
          {
            header: "Tags",
            accessor: "tags",
            cell: (row) =>
              row.tags && row.tags.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {row.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              ) : (
                "—"
              ),
          },
          {
            header: "Status",
            accessor: "status",
            cell: (row) => (
              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                  statusBadges[row.status]
                }`}
              >
                {row.status.replace("_", " ")}
              </span>
            ),
          },
          {
            header: "Actions",
            accessor: "actions",
            cell: (row) => (
              <div className="flex gap-3 text-sm">
                {row.status !== "completed" && (
                  <button
                    className="link"
                    onClick={() => updateStatus(row._id, "completed")}
                  >
                    Mark complete
                  </button>
                )}
                {row.status === "pending" && (
                  <button
                    className="text-primary-600"
                    onClick={() => updateStatus(row._id, "in_progress")}
                  >
                    Start
                  </button>
                )}
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
        data={tasks.map((task) => ({ ...task, id: task._id }))}
        emptyMessage="No tasks yet. Create one above."
      />
    </div>
  );
}
