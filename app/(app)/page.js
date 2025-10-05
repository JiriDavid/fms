import Link from "next/link";
import Card from "@/components/Card";

const features = [
  {
    title: "Track every animal",
    description:
      "Keep weight, health, and lifecycle records in one place for goats, cattle, pigs, and poultry.",
  },
  {
    title: "Inventory that updates itself",
    description:
      "Monitor feed and medicine inventory with usage logs tied to individual animals.",
  },
  {
    title: "Insights that drive profit",
    description:
      "Understand sales, expenses, and profitability with ready-to-export reports.",
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col gap-16">
      <section className="grid gap-10 rounded-3xl bg-gradient-to-r from-primary-600 via-primary-500 to-primary-700 px-8 py-16 text-white shadow-xl lg:grid-cols-2 lg:items-center">
        <div className="space-y-6">
          <p className="inline-flex items-center rounded-full bg-white/10 px-4 py-2 text-sm font-semibold uppercase tracking-wide">
            Farming Management System (MVP)
          </p>
          <h1 className="text-4xl font-bold sm:text-5xl">
            Modern tools to grow healthier herds and profitable farms.
          </h1>
          <p className="text-lg text-slate-100">
            FarmTrack combines Clerk authentication, MongoDB, and data-rich
            dashboards to give hardworking farmers the clarity they need
            day-to-day.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/sign-up"
              className="rounded-full bg-white px-6 py-3 text-base font-semibold text-primary-700 shadow-md hover:bg-slate-100"
            >
              Create free account
            </Link>
            <Link
              href="/sign-in"
              className="rounded-full border border-white/70 px-6 py-3 text-base font-semibold text-white hover:bg-white/10"
            >
              Sign in
            </Link>
          </div>
        </div>
        <div className="grid gap-6 text-sm text-slate-100">
          <Card
            title="Farmers love the clarity"
            description="Simple dashboards, mobile-ready forms, and meaningful alerts keep teams in sync."
          >
            <ul className="space-y-3 text-slate-600">
              <li className="flex items-center gap-3 rounded-xl bg-white/90 px-4 py-3 text-sm text-slate-800">
                <span className="text-2xl">🐄</span>
                <span>Track herd health milestones in seconds.</span>
              </li>
              <li className="flex items-center gap-3 rounded-xl bg-white/90 px-4 py-3 text-sm text-slate-800">
                <span className="text-2xl">🧮</span>
                <span>
                  Automatically sum sales vs. expenses for instant
                  profitability.
                </span>
              </li>
              <li className="flex items-center gap-3 rounded-xl bg-white/90 px-4 py-3 text-sm text-slate-800">
                <span className="text-2xl">🌾</span>
                <span>
                  Keep feed and medicine inventory accurate and auditable.
                </span>
              </li>
            </ul>
          </Card>
        </div>
      </section>
      <section className="space-y-8">
        <h2 className="text-2xl font-semibold text-slate-800">
          Why FarmTrack?
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <Card
              key={feature.title}
              title={feature.title}
              description={feature.description}
            >
              <p className="text-sm text-slate-600">
                {feature.description} Empower your team with structured
                workflows, shareable dashboards, and exportable reports.
              </p>
            </Card>
          ))}</div>
      </section>
    </div>
  );
}
