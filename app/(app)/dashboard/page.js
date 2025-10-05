import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { connectToDatabase } from "@/lib/mongodb";
import { ensureFarmerProfile } from "@/lib/farmers";
import Animal from "@/models/Animal";
import AnimalCategory from "@/models/AnimalCategory";
import Sale from "@/models/Sale";
import Expense from "@/models/Expense";
import Activity from "@/models/Activity";
import Task from "@/models/Task";
import Card from "@/components/Card";
import ChartCard from "@/components/ChartCard";
import Table from "@/components/Table";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

async function getDashboardData(ownerId) {
  await connectToDatabase();

  const [
    totalAnimals,
    categories,
    monthlySales,
    monthlyExpenses,
    recentActivities,
    herdTrend,
    salesTrend,
    upcomingTasks,
  ] = await Promise.all([
    Animal.countDocuments({ ownerId }),
    Animal.aggregate([
      { $match: { ownerId } },
      { $group: { _id: "$categoryId", count: { $sum: 1 } } },
      { $limit: 5 },
    ]),
    Sale.aggregate([
      {
        $match: {
          ownerId,
          date: { $gte: new Date(new Date().setDate(1)) },
        },
      },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]),
    Expense.aggregate([
      {
        $match: {
          ownerId,
          date: { $gte: new Date(new Date().setDate(1)) },
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Activity.find({ ownerId }).sort({ createdAt: -1 }).limit(6).lean(),
    Animal.aggregate([
      { $match: { ownerId } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 12 },
    ]),
    Sale.aggregate([
      { $match: { ownerId } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$date" } },
          total: { $sum: "$totalAmount" },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 12 },
    ]),
    Task.find({
      ownerId,
      status: { $ne: "completed" },
      dueDate: { $gte: new Date() },
    })
      .sort({ dueDate: 1 })
      .limit(5)
      .lean(),
  ]);

  const categoryIds = categories.map((item) => item._id).filter(Boolean);
  const categoryDocs = await AnimalCategory.find({
    _id: { $in: categoryIds },
  }).lean();
  const categoryLookup = categoryDocs.reduce((acc, category) => {
    acc[category._id.toString()] = category.name;
    return acc;
  }, {});

  return {
    totals: {
      animals: totalAnimals,
      monthlySales: monthlySales[0]?.total || 0,
      monthlyExpenses: monthlyExpenses[0]?.total || 0,
      monthlyProfit:
        (monthlySales[0]?.total || 0) - (monthlyExpenses[0]?.total || 0),
    },
    categories: categories.map((item) => ({
      id: item._id?.toString() || "uncategorized",
      label: categoryLookup[item._id?.toString()] || "Uncategorised",
      count: item.count,
    })),
    recentActivities,
    herdTrend: herdTrend.map((item) => ({
      date: item._id,
      count: item.count,
    })),
    salesTrend: salesTrend.map((item) => ({
      date: item._id,
      value: item.total,
    })),
    upcomingTasks,
  };
}

export default async function DashboardPage() {
  const { userId } = auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await currentUser();
  await connectToDatabase();
  await ensureFarmerProfile({
    ownerId: userId,
    email: user?.emailAddresses?.[0]?.emailAddress,
  });

  const data = await getDashboardData(userId);

  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-wide text-primary-600">
          Dashboard
        </p>
        <h1 className="text-3xl font-semibold text-slate-800">
          Welcome back{user?.firstName ? `, ${user.firstName}` : ""} 👋
        </h1>
        <p className="text-sm text-slate-500">
          Overview of your farm performance, herd health, inventory, and
          finances.
        </p>
      </header>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <Card title="Total animals" description="Across all categories">
          <p className="text-4xl font-bold text-slate-800">
            {data.totals.animals}
          </p>
        </Card>
        <Card title="Animals by category" description="Top 5 categories">
          <ul className="space-y-2 text-sm text-slate-600">
            {data.categories.map((category) => (
              <li
                key={category.id}
                className="flex items-center justify-between"
              >
                <span>{category.label}</span>
                <span className="font-semibold text-slate-800">
                  {category.count}
                </span>
              </li>
            ))}
            {data.categories.length === 0 && (
              <li>No categories yet. Add your first animal!</li>
            )}
          </ul>
        </Card>
        <Card title="Sales this month" description="Gross revenue">
          <p className="text-4xl font-bold text-primary-600">
            ${data.totals.monthlySales.toFixed(2)}
          </p>
        </Card>
        <Card title="Profit this month" description="Sales minus expenses">
          <p
            className={`text-4xl font-bold ${
              data.totals.monthlyProfit >= 0
                ? "text-primary-600"
                : "text-rose-600"
            }`}
          >
            ${data.totals.monthlyProfit.toFixed(2)}
          </p>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <ChartCard
          title="Herd size over time"
          description="Track herd growth month-over-month"
          data={data.herdTrend}
          dataKey="count"
          xKey="date"
          chartType="area"
        />
        <ChartCard
          title="Sales trend"
          description="Monthly revenue trend"
          data={data.salesTrend}
          dataKey="value"
          xKey="date"
          chartType="line"
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card
          title="Recent activity"
          description="Latest tasks, sales, expenses, and notes"
        >
          <ul className="space-y-4 text-sm text-slate-600">
            {data.recentActivities.map((activity) => (
              <li
                key={activity._id}
                className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
              >
                <p className="font-semibold text-slate-800">
                  {activity.type.toUpperCase()}
                </p>
                <p>{activity.message}</p>
                <p className="text-xs text-slate-500">
                  {format(new Date(activity.createdAt), "MMM dd, yyyy p")}
                </p>
              </li>
            ))}
            {data.recentActivities.length === 0 && (
              <li>
                No activity yet. Start by adding animals or logging tasks.
              </li>
            )}
          </ul>
        </Card>
        <Card title="Quick links">
          <Table
            columns={[
              { header: "Action", accessor: "label" },
              {
                header: "",
                accessor: "cta",
                cell: (row) => (
                  <a href={row.href} className="link font-semibold">
                    {row.cta}
                  </a>
                ),
              },
            ]}
            data={[
              {
                id: "animals",
                label: "Register a new animal",
                cta: "Add",
                href: "/animals/new",
              },
              {
                id: "sale",
                label: "Log a sale",
                cta: "Record",
                href: "/sales",
              },
              {
                id: "task",
                label: "Assign a daily task",
                cta: "Plan",
                href: "/tasks",
              },
            ]}
          />
        </Card>
        <Card title="Upcoming tasks" description="Next 5 due tasks">
          <ul className="space-y-3 text-sm text-slate-600">
            {data.upcomingTasks.map((task) => (
              <li
                key={task._id}
                className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
              >
                <div>
                  <p className="font-semibold text-slate-800">{task.title}</p>
                  <p className="text-xs text-slate-500">
                    Due {format(new Date(task.dueDate), "MMM dd")}
                  </p>
                </div>
                <span
                  className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                    task.status === "completed"
                      ? "bg-primary-200 text-primary-800"
                      : task.status === "in_progress"
                      ? "bg-primary-100 text-primary-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {task.status.replace("_", " ")}
                </span>
              </li>
            ))}
            {data.upcomingTasks.length === 0 && (
              <li>No upcoming tasks. Create one to stay on track!</li>
            )}
          </ul>
        </Card>
      </section>
    </div>
  );
}
