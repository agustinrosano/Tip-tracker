import React, { useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Components/Auth/Login";
import Signup from "./Components/Auth/Signup";
import Dashboard from "./Components/Dashboard"; // luego creamos esto
import Layout from "./Components/Layout";
import Analytics from "./Components/Analytics";
import { Toaster } from "react-hot-toast";
import { AuthContext, AuthProvider } from "./context/AuthProvider";
import PrivateRoute from "./context/PrivateRoute";

function App() {
  // const userTwo = localStorage.getItem("user");

  // console.log(userTwo.uid)
  // const  context = useContext(AuthContext);
  // console.log(context)



  return (
    <AuthProvider>
      <Router>
        <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "#fff1f2", // rosa claro (equivalente a bg-rose-50)
                color: "#881337",      // texto rosa oscuro (equivalente a text-rose-800)
                border: "1px solid #fda4af", // borde soft rosa
                fontSize: "0.875rem",
              },
              success: {
                icon: '✅',
              },
              error: {
                icon: '❌',
              },
            }}
          />
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
      </Router>
    </AuthProvider>
  );
}

export default App;
