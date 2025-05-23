// Layout.jsx actualizado con logo y botón de logout en sidebar móvil
import React, { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import TipLogo from '../Assets/TipLogo.png';
import { signOut } from "firebase/auth";
import { auth } from "./firebase";

export default function Layout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navLinks = [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/analytics", label: "Análisis" },
  ];

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-rose-50">
      {/* Mobile Nav Button */}
      <div className="sm:hidden p-4 flex justify-between items-center">
        <button
          onClick={() => setSidebarOpen(true)}
          className="text-rose-700 text-2xl focus:outline-none"
        >
          ☰
        </button>
        <img src={TipLogo} alt="Tip Logo" className="w-8 h-8" />
      </div>

      {/* Sidebar para desktop */}
      <aside className="hidden sm:flex sm:w-64 bg-rose-200 text-rose-800 shadow-lg p-4 flex-col gap-6 fixed inset-y-0 left-0">
        <img src={TipLogo} alt="Tip Logo" className="w-10 h-10 mb-4" />
        <nav className="flex flex-col gap-3">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`p-2 rounded hover:bg-rose-300 ${pathname === link.to ? "bg-rose-300 font-semibold" : ""}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto text-xs text-rose-600 text-center">
          © 2025 bubbaRossi
        </div>
      </aside>

      {/* Sidebar deslizable para mobile */}
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50 sm:hidden" onClose={setSidebarOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 flex z-40">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative flex w-full max-w-xs flex-col bg-rose-100 shadow-xl p-4">
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="text-right text-rose-600 font-bold text-xl"
                >
                  ✕
                </button>
                <img src={TipLogo} alt="Tip Logo" className="w-10 h-10 mb-4" />
                <nav className="flex flex-col gap-3 mb-6">
                  {navLinks.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={() => setSidebarOpen(false)}
                      className={`p-2 rounded hover:bg-rose-200 ${pathname === link.to ? "bg-rose-300 font-semibold" : ""}`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
                <button
                  onClick={handleLogout}
                  className="mt-auto bg-rose-500 hover:bg-rose-600 text-white py-2 px-4 rounded text-sm"
                >
                  Cerrar sesión
                </button>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Main content */}
      <main className="sm:ml-64 sm:p-6">
        <Outlet />
      </main>
    </div>
  );
}
