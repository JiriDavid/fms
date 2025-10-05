"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  AreaChart,
  Area,
} from "recharts";
import Card from "./Card";

const chartComponents = {
  line: LineChart,
  bar: BarChart,
  area: AreaChart,
};

export default function ChartCard({
  title,
  description,
  data = [],
  dataKey = "value",
  xKey = "date",
  chartType = "line",
}) {
  const Chart = chartComponents[chartType] || LineChart;

  return (
    <Card title={title} description={description}>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <Chart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey={xKey}
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip cursor={{ fill: "#f8fafc" }} />
            {chartType === "bar" && (
              <Bar dataKey={dataKey} fill="#3dac78" radius={[4, 4, 0, 0]} />
            )}
            {chartType === "line" && (
              <Line
                type="monotone"
                dataKey={dataKey}
                stroke="#3dac78"
                strokeWidth={3}
                dot={{ r: 3 }}
              />
            )}
            {chartType === "area" && (
              <Area
                type="monotone"
                dataKey={dataKey}
                stroke="#3dac78"
                fill="#b7e4c7"
                fillOpacity={0.45}
              />
            )}
          </Chart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
