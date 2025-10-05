"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import Card from "@/components/Card";
import ChartCard from "@/components/ChartCard";
import Table from "@/components/Table";

const defaultRange = () => ({
  startDate: new Date(new Date().getFullYear(), 0, 1)
    .toISOString()
    .slice(0, 10),
  endDate: new Date().toISOString().slice(0, 10),
});

export default function ReportsPage() {
  const [{ startDate, endDate }, setRange] = useState(defaultRange);
  const [profitLoss, setProfitLoss] = useState({
    totalSales: 0,
    totalExpenses: 0,
    profit: 0,
  });
  const [animalGrowth, setAnimalGrowth] = useState([]);
  const [feedConsumption, setFeedConsumption] = useState([]);

  const fetchProfitLoss = useCallback(
    async (params = {}) => {
      const query = new URLSearchParams({ startDate, endDate, ...params });
      const response = await fetch(
        `/api/reports/profit-loss?${query.toString()}`
      );
      if (response.ok) {
        const payload = await response.json();
        setProfitLoss(payload.data);
      }
    },
    [startDate, endDate]
  );

  const fetchAnimalGrowth = useCallback(async (categoryId = "") => {
    const query = new URLSearchParams();
    if (categoryId) query.set("categoryId", categoryId);
    const response = await fetch(
      `/api/reports/animal-growth?${query.toString()}`
    );
    if (response.ok) {
      const payload = await response.json();
      setAnimalGrowth(payload.data || []);
    }
  }, []);

  const fetchFeedConsumption = useCallback(async () => {
    const query = new URLSearchParams({ startDate, endDate });
    const response = await fetch(
      `/api/reports/feed-consumption?${query.toString()}`
    );
    if (response.ok) {
      const payload = await response.json();
      setFeedConsumption(payload.data || []);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchProfitLoss();
    fetchAnimalGrowth();
    fetchFeedConsumption();
  }, [fetchProfitLoss, fetchAnimalGrowth, fetchFeedConsumption]);

  function handleDateChange(event) {
    setRange((range) => ({
      ...range,
      [event.target.name]: event.target.value,
    }));
  }

  const handleApply = useCallback(async () => {
    await Promise.all([fetchProfitLoss(), fetchFeedConsumption()]);
  }, [fetchProfitLoss, fetchFeedConsumption]);

  const herdChartData = useMemo(() => {
    return animalGrowth
      .flatMap((animal) =>
        animal.weightHistory.map((entry) => ({
          date: format(new Date(entry.date), "MMM dd"),
          value: entry.weightKg,
          tagId: animal.tagId,
        }))
      )
      .slice(-20);
  }, [animalGrowth]);

  const feedTableData = feedConsumption.map((feed) => ({
    ...feed,
    id: feed.feedId,
  }));

  function downloadCSV(type) {
    const query = new URLSearchParams({ startDate, endDate });
    window.open(`/api/reports/export/${type}?${query.toString()}`, "_blank");
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-wide text-primary-600">
            Insights
          </p>
          <h1 className="text-3xl font-semibold text-slate-800">
            Reports & exports
          </h1>
          <p className="text-sm text-slate-500">
            Quantify profitability, monitor growth, and optimise feed usage.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 rounded-full bg-white px-4 py-2 shadow">
          <input
            type="date"
            name="startDate"
            value={startDate}
            onChange={handleDateChange}
            className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600 focus:border-primary-400 focus:outline-none"
          />
          <span className="text-xs text-slate-500">to</span>
          <input
            type="date"
            name="endDate"
            value={endDate}
            onChange={handleDateChange}
            className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600 focus:border-primary-400 focus:outline-none"
          />
          <button
            onClick={handleApply}
            className="rounded-full bg-primary-600 px-4 py-1 text-xs font-semibold text-white hover:bg-primary-700"
          >
            Apply
          </button>
        </div>
      </header>

      <section className="grid gap-6 md:grid-cols-3">
        <Card title="Total sales" description="Selected period">
          <p className="text-3xl font-bold text-primary-600">
            ${profitLoss.totalSales.toFixed(2)}
          </p>
          <button
            onClick={() => downloadCSV("profit-loss")}
            className="mt-4 text-xs font-semibold text-primary-600"
          >
            Export profit & loss CSV
          </button>
        </Card>
        <Card title="Total expenses" description="Selected period">
          <p className="text-3xl font-bold text-rose-600">
            ${profitLoss.totalExpenses.toFixed(2)}
          </p>
        </Card>
        <Card title="Profit" description="Sales minus expenses">
          <p
            className={`text-3xl font-bold ${
              profitLoss.profit >= 0 ? "text-primary-600" : "text-rose-600"
            }`}
          >
            ${profitLoss.profit.toFixed(2)}
          </p>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <ChartCard
          title="Weight trend"
          description="Latest 20 weight entries across animals"
          data={herdChartData}
          dataKey="value"
          xKey="date"
          chartType="line"
        />
        <Card
          title="Animal growth"
          description="Pull CSV for in-depth weight analysis"
        >
          <div className="flex flex-wrap gap-3 text-sm">
            <button
              onClick={() => downloadCSV("animal-growth")}
              className="rounded-full bg-primary-600 px-4 py-2 font-semibold text-white hover:bg-primary-700"
            >
              Export growth CSV
            </button>
            <p className="text-xs text-slate-500">
              Use filters in your spreadsheet to compare cohorts and weight gain
              rates.
            </p>
          </div>
        </Card>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-800">
            Feed consumption
          </h2>
          <button
            onClick={() => downloadCSV("feed-consumption")}
            className="rounded-full border border-primary-200 px-4 py-2 text-xs font-semibold text-primary-600 hover:bg-primary-50"
          >
            Export feed CSV
          </button>
        </div>
        <Table
          columns={[
            { header: "Feed", accessor: "feedType" },
            {
              header: "Quantity",
              accessor: "totalQuantity",
              cell: (row) => `${Number(row.totalQuantity).toFixed(2)}`,
            },
            {
              header: "Last used",
              accessor: "lastUsed",
              cell: (row) =>
                row.lastUsed
                  ? format(new Date(row.lastUsed), "MMM dd, yyyy")
                  : "—",
            },
          ]}
          data={feedTableData}
          emptyMessage="No feed usage logged yet."
        />
      </section>
    </div>
  );
}
