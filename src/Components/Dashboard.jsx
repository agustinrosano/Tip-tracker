import React, { useState, useEffect } from "react";
import { auth } from "./firebase";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { PencilLine, Trash2,DollarSign  } from "lucide-react";
import {
  fetchTipsFromFirestore,
  addTipToFirestore,
  updateTipInFirestore,
  deleteTipFromFirestore,
} from "../Components/Firebase/TipServices";

export default function Dashboard() {
  const [tips, setTips] = useState([]);
  const [form, setForm] = useState({
    amount: "",
    comment: "",
    date: new Date().toISOString().slice(0, 10),
  });
  const [editingId, setEditingId] = useState(null);
  const navigate = useNavigate();

  const fetchTips = async () => {
    const data = await fetchTipsFromFirestore();
    setTips(data);
  };

  useEffect(() => {
    fetchTips();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // actualiza o crea la propina 
    const handleSubmit = async (e) => {
      e.preventDefault();
      if (editingId) {
        await updateTipInFirestore(editingId, form);
        setTips((prevTips) =>
          prevTips.map((tip) =>
            tip.id === editingId ? { ...tip, ...form } : tip
          )
        );
        setEditingId(null);
      } else {
        await addTipToFirestore(form);
        fetchTips(); // solo si es nuevo lo volvemos a pedir completo
      }
      setForm({ amount: "", comment: "", date: new Date().toISOString().slice(0, 10) });
    };


  // edita la propina 
  const handleEdit = (tip) => {
    setForm({ amount: tip.amount, comment: tip.comment, date: tip.date });
    setEditingId(tip.id);
  };

  // borra la propina
  const handleDelete = async (id) => {
    await deleteTipFromFirestore(id);
    fetchTips();
  };


  return (
      <div className="min-h-screen bg-gradient-to-br from-rose-100 via-rose-200 to-white p-4 sm:p-6">
        <div className="max-w-xl mx-auto bg-rose-50 border border-rose-200 rounded-xl shadow-lg p-6 relative">
          
          
          <h2 className="text-3xl font-bold text-rose-700 mb-1 flex items-center">
             <DollarSign className="w- h-6" />  Agregar propina
          </h2>
          <p className="text-sm text-gray-600 mb-6">Completá los datos del ingreso recibido.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Fecha</label>
              <input
                name="date"
                type="date"
                value={form.date}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-rose-300 rounded-md focus:ring-2 focus:ring-rose-400"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Monto</label>
              <input
                name="amount"
                type="number"
                placeholder="$ 0"
                value={form.amount}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-rose-300 rounded-md focus:ring-2 focus:ring-rose-400"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Comentario (opcional)</label>
              <input
                name="comment"
                type="text"
                placeholder="e.g., cliente generoso, día lluvioso..."
                value={form.comment}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-rose-300 rounded-md focus:ring-2 focus:ring-rose-400"
              />
              <p className="text-xs text-gray-500 mt-1">
                Agregá observaciones útiles. Esto puede alimentar el análisis AI en el futuro.
              </p>
            </div>

            <button type="submit" className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-2 rounded-md shadow">
              {editingId ? "Actualizar propina" : "Guardar propina"}
            </button>
          </form>

          <div className="mt-8">
            <h3 className="text-lg font-semibold text-rose-700 mb-2">Propinas recientes</h3>
                <ul className="space-y-2">
                  {tips.map((tip) => (
                    <li
                      key={tip.id}
                      className="flex justify-between items-start bg-white border border-rose-100 p-3 rounded-md shadow-sm"
                    >
                      <div>
                        <p className="text-sm text-gray-800 flex items-center gap-1 mb-1">
                          <DollarSign className="w-4 h-4 text-rose-500" />
                          <span className="font-semibold">${tip.amount}</span>
                        </p>
                        <p className="text-xs text-gray-500">
                          {(() => {
                            const raw = tip.date;
                            const date = raw?.toDate
                              ? raw.toDate()
                              : new Date(raw?.seconds ? raw.seconds * 1000 : raw);
                            return date.toLocaleDateString("es-AR");
                          })()}
                        </p>
                        {tip.comment && (
                          <p className="text-xs text-rose-600 italic mt-1">{tip.comment}</p>
                        )}
                      </div>

                      <div className="space-x-2 mt-1">
                        <button
                          onClick={() => handleEdit(tip)}
                          className="text-rose-700 hover:text-rose-900"
                        >
                          <PencilLine className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(tip.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
          </div>
        </div>
      </div>

  );
}