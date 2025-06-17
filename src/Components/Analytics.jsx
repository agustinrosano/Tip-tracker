import React, { useState, useEffect } from "react";
import { auth, db } from "../Components/firebase";
import { collection, getDocs } from "firebase/firestore";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Analytics() {
  const [weekly, setWeekly] = useState([]);
  const [monthly, setMonthly] = useState([]);
  const [daily, setDaily] = useState([]);
  const [filteredTips, setFilteredTips] = useState([]);
  const [filter, setFilter] = useState("day");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  useEffect(() => {
    const loadData = async () => {
      const user = auth.currentUser;
      const tipsRef = collection(db, `users/${user.uid}/tips`);
      const snapshot = await getDocs(tipsRef);
      const tips = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      const today = new Date();
      const currentDay = today.toISOString().slice(0, 10);
      const weekAgo = new Date(today);
      weekAgo.setDate(today.getDate() - 7);

      const filtered = tips.filter((tip) => {
        const date = new Date(tip.date);
        if (filter === "day") {
          return tip.date === currentDay;
        } else if (filter === "week") {
          return date >= weekAgo && date <= today;
        } else if (filter === "month") {
          return (
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
          );
        } else if (filter === "specificMonth") {
          return (
            date.getMonth() === selectedMonth &&
            date.getFullYear() === today.getFullYear()
          );
        } else {
          return true;
        }
      });

      // Ordenar tips por fecha descendente
      const sortedTips = [...filtered].sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );
      setFilteredTips(sortedTips);

      // Agrupaciones
      const byDay = {};
      const byMonth = {};
      const byFullDate = {};

      filtered.forEach((tip) => {
        const date = new Date(tip.date);

        const dayLabel = date.toLocaleDateString("es-AR", { weekday: "short" });
        const dateLabel = date.toLocaleDateString("es-AR", {
          day: "2-digit",
          month: "2-digit",
        });
        const label = `${dayLabel.charAt(0).toUpperCase() + dayLabel.slice(1)} ${dateLabel}`;

        byDay[label] = (byDay[label] || 0) + Number(tip.amount);

        const month = date.toLocaleDateString("es-AR", { month: "short" });
        byMonth[month] = (byMonth[month] || 0) + Number(tip.amount);

        byFullDate[dateLabel] = (byFullDate[dateLabel] || 0) + Number(tip.amount);
      });

      const dayOrder = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
      const sortedWeekly = Object.entries(byDay)
        .map(([label, total]) => {
          const dayPrefix = label.split(" ")[0]; // ej: "Lun"
          return { label, total, day: dayPrefix };
        })
        .sort((a, b) => dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day));
      setWeekly(sortedWeekly);

      const monthOrder = [
        "ene.", "feb.", "mar.", "abr.", "may.", "jun.",
        "jul.", "ago.", "sep.", "oct.", "nov.", "dic."
      ];
      const sortedMonthly = Object.entries(byMonth)
        .map(([month, total]) => ({ month, total }))
        .sort((a, b) => monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month));
      setMonthly(sortedMonthly);

      const sortedDaily = Object.entries(byFullDate)
        .map(([date, total]) => ({ date, total }))
        .sort((a, b) => {
          const [d1, m1] = a.date.split("/").map(Number);
          const [d2, m2] = b.date.split("/").map(Number);
          return new Date(today.getFullYear(), m1 - 1, d1) - new Date(today.getFullYear(), m2 - 1, d2);
        });
      setDaily(sortedDaily);
    };

    loadData();
  }, [filter, selectedMonth]);

  return (
    <div className="space-y-10 p-4">
      {/* Filtros */}
      <section>
        <div className="flex flex-wrap gap-2 justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-rose-700">Listado de propinas</h2>
          <div className="flex gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border border-rose-300 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-rose-400"
            >
              <option value="day">Hoy</option>
              <option value="week">Esta semana</option>
              <option value="specificMonth">Elegir mes</option>
              <option value="all">Todas</option>
            </select>
            {filter === "specificMonth" && (
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="border border-rose-300 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-rose-400"
              >
                {[...Array(12)].map((_, i) => (
                  <option key={i} value={i}>
                    {new Date(2025, i).toLocaleString("es-AR", { month: "long" })}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-auto rounded-md border border-rose-200">
          <table className="min-w-full text-sm">
            <thead className="bg-rose-100 text-rose-700">
              <tr>
                <th className="px-4 py-2 text-left">Fecha</th>
                <th className="px-4 py-2 text-left">Monto</th>
                <th className="px-4 py-2 text-left">Comentario</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-rose-100">
              {filteredTips.map((tip) => (
                <tr key={tip.id}>
                  <td className="px-4 py-2">{tip.date}</td>
                  <td className="px-4 py-2">${tip.amount}</td>
                  <td className="px-4 py-2 text-rose-600 italic">{tip.comment || "-"}</td>
                </tr>
              ))}
              {filteredTips.length === 0 && (
                <tr>
                  <td colSpan="3" className="text-center text-rose-400 py-4">
                    No se encontraron propinas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Gráfico: Día de la semana */}
      <section>
        <h2 className="text-xl font-bold text-rose-700 mb-2">Total por día de la semana</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={weekly}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="total" fill="#f43f5e" />
          </BarChart>
        </ResponsiveContainer>
      </section>

      {/* Gráfico: Mes */}
      <section>
        <h2 className="text-xl font-bold text-rose-700 mb-2">Total por mes</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthly}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="total" fill="#ec4899" />
          </BarChart>
        </ResponsiveContainer>
      </section>

      {/* Gráfico: Día (DD/MM) */}
      <section>
        <h2 className="text-xl font-bold text-rose-700 mb-2">Total por día (DD/MM)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={daily}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="total" fill="#f472b6" />
          </BarChart>
        </ResponsiveContainer>
      </section>
    </div>
  );
}
