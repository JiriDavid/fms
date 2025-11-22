"use client";

import { useEffect, useState } from "react";
import { format, isPast } from "date-fns";
import Link from "next/link";
import Card from "@/components/Card";
import Table from "@/components/Table";

const statusBadges = {
  pending: "bg-amber-100 text-amber-700",
  in_progress: "bg-primary-100 text-primary-700",
  completed: "bg-primary-200 text-primary-800",
};

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({
    totalTasks: 0,
    pendingTasks: 0,
    inProgressTasks: 0,
    completedTasks: 0,
    overdueTasks: 0,
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  async function fetchTasks() {
    const response = await fetch("/api/tasks");
    if (response.ok) {
      const payload = await response.json();
      const tasksData = payload.data || [];
      setTasks(tasksData);

      // Calculate stats
      const totalTasks = tasksData.length;
      const pendingTasks = tasksData.filter(
        (task) => task.status === "pending"
      ).length;
      const inProgressTasks = tasksData.filter(
        (task) => task.status === "in_progress"
      ).length;
      const completedTasks = tasksData.filter(
        (task) => task.status === "completed"
      ).length;
      const overdueTasks = tasksData.filter(
        (task) =>
          task.dueDate &&
          isPast(new Date(task.dueDate)) &&
          task.status !== "completed"
      ).length;

      setStats({
        totalTasks,
        pendingTasks,
        inProgressTasks,
        completedTasks,
        overdueTasks,
      });
    }
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
      {/* Header Section */}
      <header className="flex flex-wrap items-center justify-between gap-6">
        <div>
          <p className="text-sm uppercase tracking-wide text-primary-600 font-medium">
            Operations Management
          </p>
          <h1 className="text-3xl font-bold text-slate-900">Task Management</h1>
          <p className="text-slate-600 mt-1">
            Track daily operations, assignments, and task completion across your
            farm
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/tasks/new"
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
            Create Task
          </Link>
        </div>
      </header>

      {/* Statistics Cards */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <Card>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100">
              <svg
                className="h-6 w-6 text-slate-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Total Tasks</p>
              <p className="text-2xl font-bold text-slate-900">
                {stats.totalTasks}
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
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Pending</p>
              <p className="text-2xl font-bold text-slate-900">
                {stats.pendingTasks}
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
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">In Progress</p>
              <p className="text-2xl font-bold text-slate-900">
                {stats.inProgressTasks}
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
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Completed</p>
              <p className="text-2xl font-bold text-slate-900">
                {stats.completedTasks}
              </p>
            </div>
          </div>
        </Card>

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
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Overdue</p>
              <p className="text-2xl font-bold text-slate-900">
                {stats.overdueTasks}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tasks Table */}
      <section>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            Task Overview
          </h2>
          <p className="text-sm text-slate-600">
            Manage and track all farm operations and assignments
          </p>
        </div>

        <div className="overflow-x-auto">
          <Table
            columns={[
              {
                header: "Task",
                accessor: "title",
                cell: (row) => (
                  <div>
                    <p className="font-semibold text-slate-800">{row.title}</p>
                    {row.description && (
                      <p className="text-xs text-slate-500 line-clamp-2">
                        {row.description}
                      </p>
                    )}
                  </div>
                ),
              },
              {
                header: "Due Date",
                accessor: "dueDate",
                cell: (row) =>
                  row.dueDate ? (
                    <span
                      className={
                        isPast(new Date(row.dueDate)) &&
                        row.status !== "completed"
                          ? "text-rose-500 font-medium"
                          : ""
                      }
                    >
                      {format(new Date(row.dueDate), "MMM dd, yyyy")}
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
                      {row.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
                        >
                          {tag}
                        </span>
                      ))}
                      {row.tags.length > 2 && (
                        <span className="text-xs text-slate-500">
                          +{row.tags.length - 2} more
                        </span>
                      )}
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
                  <div className="flex gap-2 text-sm">
                    {row.status !== "completed" && (
                      <button
                        className="text-green-600 hover:text-green-700 font-medium"
                        onClick={() => updateStatus(row._id, "completed")}
                      >
                        Complete
                      </button>
                    )}
                    {row.status === "pending" && (
                      <button
                        className="text-blue-600 hover:text-blue-700"
                        onClick={() => updateStatus(row._id, "in_progress")}
                      >
                        Start
                      </button>
                    )}
                    <button
                      className="text-rose-500 hover:text-rose-700"
                      onClick={() => remove(row._id)}
                    >
                      Delete
                    </button>
                  </div>
                ),
              },
            ]}
            data={tasks.map((task) => ({ ...task, id: task._id }))}
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
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                  />
                </svg>
                <h3 className="text-lg font-medium text-slate-900 mb-2">
                  No tasks created yet
                </h3>
                <p className="text-slate-600 mb-6">
                  Start managing your farm operations by creating your first
                  task
                </p>
                <Link
                  href="/tasks/new"
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
                  Create Your First Task
                </Link>
              </div>
            }
          />
        </div>
      </section>
    </div>
  );
}
