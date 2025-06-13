import React, { useState, useEffect } from "react";
import { auth, db } from "../Components/firebase";
import {
  collection,
  getDocs,
} from "firebase/firestore";
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

      const byDay = {};
      const byMonth = {};

      filtered.forEach((tip) => {
        const date = new Date(tip.date);
        const day = date.toLocaleDateString("es-AR", { weekday: "short" });
        const month = date.toLocaleDateString("es-AR", { month: "short" });
        byDay[day] = (byDay[day] || 0) + Number(tip.amount);
        byMonth[month] = (byMonth[month] || 0) + Number(tip.amount);
      });

      setWeekly(Object.entries(byDay).map(([day, total]) => ({ day, total })));
      setMonthly(Object.entries(byMonth).map(([month, total]) => ({ month, total })));
      setFilteredTips(filtered);
    };

    loadData();
  }, [filter, selectedMonth]);

  return (
    <div className="space-y-10 p-4">
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
              <option value="month">Este mes</option>
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

      <section>
        <h2 className="text-xl font-bold text-rose-700 mb-2">Total por día de la semana</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={weekly}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="total" fill="#f43f5e" />
          </BarChart>
        </ResponsiveContainer>
      </section>

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
    </div>
  );
}
