import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Components/Auth/Login";
import Signup from "./Components/Auth/Signup";
import Dashboard from "./Components/Dashboard"; // luego creamos esto
import Layout from "./Components/Layout";
import Analytics from "./Components/Analytics";


function App() {
  const user = localStorage.getItem("user"); // en producción deberías usar `auth.currentUser` o context

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={<Layout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="analytics" element={<Analytics />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
