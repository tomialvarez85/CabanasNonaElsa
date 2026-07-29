"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatMoney } from "@/lib/format";
import type { MonthlyRevenuePoint } from "@/lib/summary";

interface MonthlyRevenueChartProps {
  data: MonthlyRevenuePoint[];
  cabanaNombres: string[];
}

const BAR_COLORS = ["#26372E", "#6B4226", "#8FA878", "#D6A238"];

export default function MonthlyRevenueChart({ data, cabanaNombres }: MonthlyRevenueChartProps) {
  if (data.length === 0) {
    return <p className="text-sm text-pine/70">No hay datos para graficar en este rango.</p>;
  }

  return (
    <div className="h-72 w-full sm:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#26372E22" />
          <XAxis dataKey="label" tick={{ fill: "#26372E", fontSize: 12 }} />
          <YAxis
            tick={{ fill: "#26372E", fontSize: 12 }}
            tickFormatter={(value: number) => `${Math.round(value / 1000)}k`}
          />
          <Tooltip
            formatter={(value) => formatMoney(Number(value))}
            contentStyle={{ backgroundColor: "#F5F0E6", borderColor: "#26372E33" }}
          />
          <Legend />
          {cabanaNombres.map((nombre, index) => (
            <Bar
              key={nombre}
              dataKey={nombre}
              fill={BAR_COLORS[index % BAR_COLORS.length]}
              radius={[3, 3, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
