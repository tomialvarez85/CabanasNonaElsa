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

// Colores para las barras: reutilizan los tonos de estado ya verificados
// contra el fondo oscuro (ámbar, salvia, terracota) más un marrón claro de
// respaldo. No tienen relación semántica acá, son solo para diferenciar
// cabañas en el gráfico con buen contraste.
const BAR_COLORS = ["#D6A238", "#8FA878", "#E06B3F", "#8A5A36"];

const AXIS_TEXT_COLOR = "#F5F0E6";

export default function MonthlyRevenueChart({ data, cabanaNombres }: MonthlyRevenueChartProps) {
  if (data.length === 0) {
    return <p className="text-sm text-cream/70">No hay datos para graficar en este rango.</p>;
  }

  return (
    <div className="h-72 w-full sm:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F5F0E626" />
          <XAxis dataKey="label" tick={{ fill: AXIS_TEXT_COLOR, fontSize: 12 }} />
          <YAxis
            tick={{ fill: AXIS_TEXT_COLOR, fontSize: 12 }}
            tickFormatter={(value: number) => `${Math.round(value / 1000)}k`}
          />
          <Tooltip
            formatter={(value) => formatMoney(Number(value))}
            cursor={{ fill: "#F5F0E60F" }}
            contentStyle={{
              backgroundColor: "#1A1E19",
              borderColor: "#F5F0E633",
              borderRadius: 8,
            }}
            labelStyle={{ color: AXIS_TEXT_COLOR }}
            itemStyle={{ color: AXIS_TEXT_COLOR }}
          />
          <Legend wrapperStyle={{ color: AXIS_TEXT_COLOR }} />
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
