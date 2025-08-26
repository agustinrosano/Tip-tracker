import React, { useEffect, useState } from "react";

export default function CalendarioRango({ value, onApply, onClear }) {
  const today = new Date();
  const [open, setOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(
    (value?.startDate || today).getMonth()
  );
  const [currentYear, setCurrentYear] = useState(
    (value?.startDate || today).getFullYear()
  );
  const [startDate, setStartDate] = useState(value?.startDate || null);
  const [endDate, setEndDate] = useState(value?.endDate || null);

  useEffect(() => {
    setStartDate(value?.startDate || null);
    setEndDate(value?.endDate || null);
  }, [value?.startDate, value?.endDate]);

  const getDaysInMonth = (month, year) => {
    const date = new Date(year, month, 1);
    const days = [];
    while (date.getMonth() === month) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return days;
  };

  const stripTime = (d) => {
    const nd = new Date(d);
    nd.setHours(0, 0, 0, 0);
    return nd;
  };

  const isSameDay = (d1, d2) =>
    !!d1 && !!d2 && d1.toDateString() === d2.toDateString();

  const isInRange = (date) => startDate && endDate && date >= startDate && date <= endDate;

  const handleDayClick = (date) => {
    if (!startDate || (startDate && endDate)) {
      setStartDate(date);
      setEndDate(null);
    } else if (date < startDate) {
      setStartDate(date);
    } else {
      setEndDate(date);
    }
  };

  const apply = () => {
    if (startDate && endDate) onApply?.({ startDate, endDate });
    setOpen(false);
  };

  const clear = () => {
    setStartDate(null);
    setEndDate(null);
    onClear?.();
  };

  const setPreset = (preset) => {
    const now = new Date();
    if (preset === "today") {
      const d = stripTime(now);
      setStartDate(d);
      setEndDate(d);
    }
    if (preset === "thisWeek") {
      const start = getStartOfWeek(now);
      const end = getEndOfWeek(now);
      setStartDate(start);
      setEndDate(end);
    }
    if (preset === "thisMonth") {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      setStartDate(start);
      setEndDate(end);
    }
  };

  // helpers de semana (lunes a domingo)
  const getStartOfWeek = (d) => {
    const date = stripTime(d);
    const day = date.getDay();
    const diff = day === 0 ? -6 : 1 - day; // mover a lunes
    date.setDate(date.getDate() + diff);
    return date;
  };
  const getEndOfWeek = (d) => {
    const start = getStartOfWeek(d);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return end;
  };

  const days = getDaysInMonth(currentMonth, currentYear);
  const firstDay = new Date(currentYear, currentMonth, 1).getDay(); // 0=Dom

  return (
    <div className="relative inline-block">
      <button
        className="px-3 py-2 rounded-lg border border-rose-300 text-rose-600 hover:bg-rose-50"
        onClick={() => setOpen((o) => !o)}
      >
        {startDate && endDate
          ? `${startDate.toLocaleDateString()} → ${endDate.toLocaleDateString()}`
          : "Elegir rango"}
      </button>

      {open && (
        <div className="absolute z-50 mt-2 md:right-0 w-[22rem] bg-white rounded-xl shadow-xl border border-rose-200 p-3">

          <div className="flex items-center justify-between mb-2">
            <div className="flex gap-2">
              <button onClick={() => setPreset("today")} className="text-xs px-2 py-1 border rounded hover:bg-rose-50">Hoy</button>
              <button onClick={() => setPreset("thisWeek")} className="text-xs px-2 py-1 border rounded hover:bg-rose-50">Esta semana</button>
              <button onClick={() => setPreset("thisMonth")} className="text-xs px-2 py-1 border rounded hover:bg-rose-50">Este mes</button>
            </div>
            <button onClick={clear} className="text-xs px-2 py-1 border rounded hover:bg-rose-50">Limpiar</button>
          </div>

          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => {
                if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear((y) => y - 1); }
                else setCurrentMonth((m) => m - 1);
              }}
              className="text-rose-500 font-bold"
            >←</button>
            <h2 className="text-sm font-semibold text-rose-700">
              {new Date(currentYear, currentMonth).toLocaleDateString("es-AR", { month: "long", year: "numeric" })}
            </h2>
            <button
              onClick={() => {
                if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear((y) => y + 1); }
                else setCurrentMonth((m) => m + 1);
              }}
              className="text-rose-500 font-bold"
            >→</button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-[11px] text-center text-rose-600 font-semibold mb-1">
            {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((d) => <div key={d}>{d}</div>)}
          </div>

          <div className="grid grid-cols-7 gap-1 text-sm">
            {Array(firstDay).fill("").map((_, i) => <div key={`empty-${i}`} />)}
            {days.map((date) => {
              const selected = isSameDay(date, startDate) || isSameDay(date, endDate);
              const inRange = isInRange(date);
              return (
                <button
                  key={date.toISOString()}
                  onClick={() => handleDayClick(stripTime(date))}
                  className={`rounded-md p-1 border transition-colors ${
                    selected ? "bg-rose-500 text-white border-rose-500" :
                    inRange ? "bg-rose-100 text-rose-700 border-rose-200" :
                    "hover:bg-rose-50 border-rose-200"}`}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between mt-3">
            <div className="text-[11px] text-rose-500">
              {startDate && endDate ? `Desde: ${startDate.toLocaleDateString()} — Hasta: ${endDate.toLocaleDateString()}` : "Seleccioná un rango"}
            </div>
            <button onClick={apply} disabled={!startDate || !endDate} className="px-3 py-1 rounded-md bg-rose-600 text-white disabled:opacity-50">Aplicar</button>
          </div>
        </div>
      )}
    </div>
  );
}