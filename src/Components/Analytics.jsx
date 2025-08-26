
import React, { useEffect, useMemo, useState } from "react";
import { auth, db } from "../Components/firebase";
import { collection, getDocs, where, query as fsQuery } from "firebase/firestore";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import CalendarioRango from "./CalendarioRango";

// Utils de fechas (sin librerías)
const stripTime = (d) => { const nd = new Date(d); nd.setHours(0,0,0,0); return nd; };
const getStartOfWeek = (d) => { const date = stripTime(d); const day = date.getDay(); const diff = day===0 ? -6 : 1-day; date.setDate(date.getDate()+diff); return date; };
const getEndOfWeek = (d) => { const start = getStartOfWeek(d); const end = new Date(start); end.setDate(start.getDate()+6); return end; };
const dateToYMD = (d) => { const yyyy=d.getFullYear(); const mm=String(d.getMonth()+1).padStart(2,"0"); const dd=String(d.getDate()).padStart(2,"0"); return `${yyyy}-${mm}-${dd}`; };
const parseTipDate = (tipDate) => { if(!tipDate) return null; if (tipDate.toDate) return tipDate.toDate(); if (tipDate instanceof Date) return tipDate; return new Date(tipDate); };
const getISOWeekKey = (d) => { const date=new Date(d); date.setHours(0,0,0,0); const thursday=new Date(date); thursday.setDate(date.getDate()+ (date.getDay()===0 ? -3 : 4-date.getDay())); const firstJan=new Date(thursday.getFullYear(),0,1); const diff=Math.round((thursday-firstJan)/86400000); const week=Math.floor((diff+firstJan.getDay()+1)/7)+1; const wk=String(week).padStart(2,"0"); return `${thursday.getFullYear()}-W${wk}`; };

export default function Analytics() {
  const [range, setRange] = useState(null); // {startDate, endDate}
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const today = new Date();
  const currentWeek = useMemo(() => ({ startDate: getStartOfWeek(today), endDate: getEndOfWeek(today) }), []);

  useEffect(() => {
    const fetchTips = async () => {
      try {
        setLoading(true);
        setError(null);
        const user = auth.currentUser;
        if (!user) throw new Error("No hay usuario autenticado");
        //const tipsRef = collection(db, `users/${user.uid}/tips`); 
        const tipsRef = collection(db, `users/2bDkDHGKGeUQobH8rd0CRDQDcrf2/tips`); 
        // Puedes optimizar por rango con where si guardás 'date' como YYYY-MM-DD o Timestamp.
        //2bDkDHGKGeUQobH8rd0CRDQDcrf2
        const snap = await getDocs(tipsRef);
        const rows = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setTips(rows);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTips();
  }, []);

  const selectedRange = range || null;

  const filtered = useMemo(() => {
    if (!selectedRange) return [];
    const start = stripTime(selectedRange.startDate);
    const end = stripTime(selectedRange.endDate);
    return tips
      .map((t) => ({ ...t, _date: parseTipDate(t.date) }))
      .filter((t) => t._date && stripTime(t._date) >= start && stripTime(t._date) <= end)
      .sort((a, b) => stripTime(a._date) - stripTime(b._date));
  }, [tips, selectedRange]);

  const currentWeekData = useMemo(() => {
    const start = currentWeek.startDate;
    const end = currentWeek.endDate;
    return tips
      .map((t) => ({ ...t, _date: parseTipDate(t.date) }))
      .filter((t) => t._date && stripTime(t._date) >= start && stripTime(t._date) <= end)
      .sort((a, b) => stripTime(a._date) - stripTime(b._date));
  }, [tips, currentWeek.startDate, currentWeek.endDate]);


  const monthlyAgg = useMemo(() => {
    if (!selectedRange) return [];
    const map = new Map(); // key => { month, total }

    for (const tip of filtered) {
      const d = stripTime(parseTipDate(tip.date));
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleDateString("es-AR", { month: "long", year: "numeric" });

      const prev = map.get(key) || { month: label, total: 0 };
      prev.total += Number(tip.amount) || 0;
      map.set(key, prev);
    }

    return Array.from(map.values()).sort((a, b) => new Date(a.month) - new Date(b.month));
  }, [filtered, selectedRange]);

  // --- Aggregations ---
const weeklyAgg = useMemo(() => {
    if (!selectedRange) return [];
    const map = new Map(); // label => { label, total, count }

    for (const tip of filtered) {
      const d = stripTime(parseTipDate(tip.date));
      const start = getStartOfWeek(d);
      const end = getEndOfWeek(d);

      const label = `${start.getDate()} ${start.toLocaleDateString("es-AR", { month: "short" })} → ${end.getDate()} ${end.toLocaleDateString("es-AR", { month: "short" })}`;

      const prev = map.get(label) || { label, total: 0, count: 0 };
      prev.total += Number(tip.amount) || 0;
      prev.count += 1;
      map.set(label, prev);
    }

    return Array.from(map.values());
  }, [filtered, selectedRange]);

const dailyAgg = useMemo(() => {
    if (!selectedRange) return [];
    const map = new Map(); // ymd => {date, total}
    for (const tip of filtered) {
      const d = stripTime(parseTipDate(tip.date));
      const key = dateToYMD(d);
      const prev = map.get(key) || { date: key, total: 0 };
      prev.total += Number(tip.amount) || 0;
      map.set(key, prev);
    }
    return Array.from(map.values()).sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [filtered, selectedRange]);

  const tableRows = selectedRange ? filtered : [];

  return (
    <div className="space-y-8 p-4">
      <header className="flex flex-wrap gap-3 items-center justify-between">
        <h1 className="text-2xl font-bold text-rose-700">Analytics de Propinas</h1>
        <div className="flex items-center gap-3">
          <CalendarioRango value={range} onApply={(r) => setRange(r)} onClear={() => setRange(null)} />
          {range && (
            <button onClick={() => setRange(null)} className="px-3 py-2 rounded-lg border border-rose-300 text-rose-600 hover:bg-rose-50">Quitar filtro</button>
          )}
        </div>
      </header>

      {error && <div className="p-3 rounded-md bg-rose-50 text-rose-700 border border-rose-200">Error: {error}</div>}
      {loading && <div className="text-rose-500">Cargando propinas…</div>}

      {/* Tabla de resultados filtrados */}
      {range && (
        <section>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-rose-700">Listado de propinas (rango seleccionado)</h2>
            <div className="text-sm text-rose-500">{range.startDate.toLocaleDateString()} → {range.endDate.toLocaleDateString()}</div>
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
                {tableRows.map((tip) => (
                  <tr key={tip.id}>
                    <td className="px-4 py-2">{parseTipDate(tip.date)?.toLocaleDateString?.() || String(tip.date)}</td>
                    <td className="px-4 py-2">${Number(tip.amount || 0).toFixed(2)}</td>
                    <td className="px-4 py-2 text-rose-600 italic">{tip.comment || "-"}</td>
                  </tr>
                ))}
                {tableRows.length === 0 && (
                  <tr>
                    <td colSpan={3} className="text-center text-rose-400 py-4">No se encontraron propinas en el rango.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Gráfico por semanas (rango): cantidad y total */}
      {range && (
        <section>
          <h2 className="text-xl font-bold text-rose-700 mb-2">Por semanas (rango) — cantidad y total</h2>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={weeklyAgg}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" name="Cantidad" fill="#f43f5e"/>
              <Bar dataKey="total" name="Total"  fill="#f43f5e"/>
            </BarChart>
          </ResponsiveContainer>
        </section>
      )}

      {/* Gráfico por días (rango) */}
      {range && (
        <section>
          <h2 className="text-xl font-bold text-rose-700 mb-2">Por día (rango seleccionado)</h2>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={dailyAgg}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total" name="Total del día"   fill="#f43f5e"/>
            </BarChart>
          </ResponsiveContainer>
        </section>
      )}


      {range && (
        <section>
          <h2 className="text-xl font-bold text-rose-700 mb-2">Por mes (rango seleccionado)</h2>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={monthlyAgg}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total" name="Total del mes" fill="#f43f5e" />
            </BarChart>
          </ResponsiveContainer>
        </section>
      )}
            {/* Gráfico fijo: Semana actual (si no hay rango seleccionado) */}
      {!range && (
        <section>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-rose-700 mb-2">Semana actual</h2>
            <div className="text-sm text-rose-500">{currentWeek.startDate.toLocaleDateString()} → {currentWeek.endDate.toLocaleDateString()}</div>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart
              data={(() => {
                const map = new Map();
                const order = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
                for (const tip of currentWeekData) {
                  const d = stripTime(parseTipDate(tip.date));
                  const label = d.toLocaleDateString("es-AR", { weekday: "short" });
                  const key = label.charAt(0).toUpperCase() + label.slice(1);
                  const prev = map.get(key) || { dia: key, total: 0 };
                  prev.total += Number(tip.amount) || 0;
                  map.set(key, prev);
                }
                return Array.from(map.values()).sort((a, b) => order.indexOf(a.dia) - order.indexOf(b.dia));
              })()}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="dia" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total" name="Total"   fill="#f43f5e"/>
            </BarChart>
          </ResponsiveContainer>
        </section>
      )}
    </div> 
  );
}