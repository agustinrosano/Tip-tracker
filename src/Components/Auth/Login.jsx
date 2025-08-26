import React, { useContext, useEffect, useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthProvider";
import { Loader } from "../Loader/Loader";
import { Preferences } from '@capacitor/preferences';

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false); // 🆕
  const [error, setError] = useState(null);
  const [Load, setLoad] = useState(false);

  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    // 🟢 Chequea si hay sesión guardada
    const checkRememberedUser = async () => {
      const { value } = await Preferences.get({ key: "rememberedUser" });
      if (value) {
        const userData = JSON.parse(value);
        await login(userData);
        navigate("/dashboard");
      }
    };
    checkRememberedUser();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoad(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      // Guardar sesión si se tildó "recordar"
      if (remember) {
        await Preferences.set({
          key: "rememberedUser",
          value: JSON.stringify(userCredential.user),
        });
      }

      await login(userCredential.user);
      navigate("/dashboard");
    } catch (err) {
      setError("Email o contraseña incorrectos");
    } finally {
      setLoad(false);
    }
  };

  if (Load) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-rose-50">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 via-rose-200 to-white p-6 flex flex-col justify-center items-center">
      <div className="w-full max-w-md bg-rose-50 border border-rose-200 p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-center text-rose-700 mb-4">Tip-Tracker</h2>
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
          <label className="flex items-center text-sm text-gray-600">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="mr-2"
            />
            Recordar usuario
          </label>
          <button type="submit" className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-2 rounded-md shadow">
            Iniciar sesión
          </button>
        </form>
        <p className="text-sm text-center text-gray-600 mt-4">
          ¿No tenés cuenta? <Link to="/signup" className="text-rose-600 hover:underline">Registrate</Link>
        </p>
      </div>
      <footer className="mt-6 text-sm text-rose-400 text-center">© 2025 bubbaRossi</footer>
    </div>
  );
}
