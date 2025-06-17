import React, { useContext, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate,useLocation } from "react-router-dom";
import Login from "./Components/Auth/Login";
import Signup from "./Components/Auth/Signup";
import Dashboard from "./Components/Dashboard";
import Layout from "./Components/Layout";
import Analytics from "./Components/Analytics";
import { Toaster } from "react-hot-toast";
import { AuthContext, AuthProvider } from "./context/AuthProvider";
import PrivateRoute from "./context/PrivateRoute";
import usePushNotifications from "./Components/hooks/usePushNotifications";

function AppRoutes() {
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  usePushNotifications()
  
   useEffect(() => {
    const user = localStorage.getItem("user");
    const isLoginRoute = location.pathname === "/login";

    if (!user && !isLoginRoute) {
      navigate("/login");
    }
    // Si hay usuario, no hacemos nada aquí para no interrumpir la navegación
  }, [location.pathname, navigate]);


  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-rose-50">
        <p className="text-rose-700 font-semibold text-xl">Cargando...</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/" element={<Layout />}>
        <Route
          path="dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="analytics"
          element={
            <PrivateRoute>
              <Analytics />
            </PrivateRoute>
          }
        />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#fff1f2",
              color: "#881337",
              border: "1px solid #fda4af",
              fontSize: "0.875rem",
            },
            success: { icon: "✅" },
            error: { icon: "❌" },
          }}
        />
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
