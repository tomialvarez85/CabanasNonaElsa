"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { MONTH_LABELS, nextMonth, prevMonth } from "@/lib/dates";

interface MonthNavProps {
  year: number;
  month: number;
}

export default function MonthNav({ year, month }: MonthNavProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function goTo(nextYear: number, nextMonthValue: number) {
    if (Number.isNaN(nextYear)) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("year", String(nextYear));
    params.set("month", String(nextMonthValue));
    router.push(`/?${params.toString()}`);
  }

  function goToday() {
    const now = new Date();
    goTo(now.getFullYear(), now.getMonth() + 1);
  }

  return (
    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-3">
      <div className="flex items-center gap-2">
        <button
          aria-label="Mes anterior"
          onClick={() => {
            const p = prevMonth(year, month);
            goTo(p.year, p.month);
          }}
          className="btn-secondary px-3"
        >
          &#8592;
        </button>
        <button
          aria-label="Mes siguiente"
          onClick={() => {
            const n = nextMonth(year, month);
            goTo(n.year, n.month);
          }}
          className="btn-secondary px-3"
        >
          &#8594;
        </button>
        <button onClick={goToday} className="btn-secondary">
          Hoy
        </button>
      </div>

      <div className="flex items-center gap-2">
        <select
          aria-label="Mes"
          value={month}
          onChange={(e) => goTo(year, parseInt(e.target.value, 10))}
          className="input-field w-auto min-h-[44px] py-2"
        >
          {MONTH_LABELS.map((label, index) => (
            <option key={label} value={index + 1}>
              {label}
            </option>
          ))}
        </select>
        <input
          aria-label="Año"
          type="number"
          value={year}
          onChange={(e) => goTo(parseInt(e.target.value, 10), month)}
          className="input-field min-h-[44px] w-24 py-2"
        />
      </div>
    </div>
  );
}
