import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate, Link } from "react-router-dom";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      localStorage.setItem("user", JSON.stringify(userCredential.user));
      navigate("/dashboard");
    } catch (err) {
      setError("Error al crear la cuenta: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 via-rose-200 to-white p-6 flex flex-col justify-center items-center">
      <div className="w-full max-w-md bg-rose-50 border border-rose-200 p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-center text-rose-700 mb-4">Registrarse</h2>
        {error && <div className="text-red-500 text-sm text-center mb-2">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-rose-300 rounded-md focus:ring-2 focus:ring-rose-400"
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-rose-300 rounded-md focus:ring-2 focus:ring-rose-400"
          />
          <input
            type="password"
            placeholder="Confirmar contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-2 border border-rose-300 rounded-md focus:ring-2 focus:ring-rose-400"
          />
          <button type="submit" className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-2 rounded-md shadow">
            Crear cuenta
          </button>
        </form>
        <p className="text-sm text-center text-gray-600 mt-4">
          ¿Ya tenés cuenta? <Link to="/login" className="text-rose-600 hover:underline">Iniciar sesión</Link>
        </p>
      </div>
      <footer className="mt-6 text-sm text-rose-400 text-center">
        © 2025 bubbaRossi
      </footer>
    </div>
  );
}