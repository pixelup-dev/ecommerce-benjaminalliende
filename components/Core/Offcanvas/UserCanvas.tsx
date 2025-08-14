"use client";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import CrearUsuarioForm from "@/components/Core/Offcanvas/form/CrearUsuarioForm";

function UserCanvas({ 
  fetchData, 
  canCreateUser = true, 
  currentPlan = "", 
  userLimit = Infinity, 
  currentUserCount = 0 
}: any) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const offcanvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscKey);

    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, []);

  useEffect(() => {
    if (!offcanvasRef.current) {
      return;
    }

    if (isMenuOpen) {
      offcanvasRef.current.classList.add("translate-x-0");
    } else {
      offcanvasRef.current.classList.remove("translate-x-0");
      offcanvasRef.current.classList.add("translate-x-full");
    }
  }, [isMenuOpen]);

  const handleMenuOpen = () => {
    setIsMenuOpen(true);
  };

  const handleMenuClose = () => {
    setIsMenuOpen(false);
  };

  return (
    <div>
      <button
        onClick={canCreateUser ? handleMenuOpen : undefined}
        disabled={!canCreateUser}
        className={`ease-in-up rounded-sm px-8 py-3 text-base font-medium shadow-btn transition duration-300 md:block md:px-9 lg:px-6 xl:px-9 ${
          canCreateUser
            ? "bg-primary text-secondary hover:bg-secondary hover:text-primary hover:shadow-btn-hover"
            : "bg-gray-400 text-gray-600 cursor-not-allowed opacity-50"
        }`}
        title={!canCreateUser ? `Límite de administradores alcanzado (${currentUserCount}/${userLimit === Infinity ? '∞' : userLimit})` : "Crear Administrador"}
      >
        Crear Usuario
      </button>
      <div
        ref={offcanvasRef}
        className={`offcanvas-menu fixed z-99 bg-primary h-screen dark:border-strokedark dark:bg-form-strokedark top-20 right-0 p-6 w-2/3 md:w-[430px] ease-in-out duration-1000 shadow-md flex items-center ${
          isMenuOpen ? "" : "translate-x-full"
        }`}
      >
        <Link
          href="#"
          onClick={handleMenuClose}
          className="menu-close-btn absolute top-6 left-6"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="white"
            className="w-8 h-8"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18 18 6M6 6l12 12"
            />
          </svg>
        </Link>
        <div className="flex flex-col w-full mt-[-4rem]">
          <h1 className="text-secondary text-2xl font-bold text-center mb-8">
            Crear Nuevo Usuario
          </h1>
          {!canCreateUser ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-red-800">
                    Límite de Usuarios Alcanzado
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>Tu plan actual ({currentPlan}) permite un máximo de {userLimit === Infinity ? 'administradores ilimitados' : `${userLimit} administradores`}.</p>
                    <p className="mt-1">Actualmente tienes {currentUserCount} administradores creados.</p>
                    <div className="mt-4">
                      <h4 className="font-semibold text-red-800 mb-2">Límites de Administradores por Plan:</h4>
                      <ul className="text-sm space-y-1">
                        <li>• Plan Inicial: 1 administrador</li>
                        <li>• Plan Avanzado: 3 administradores</li>
                        <li>• Plan PRO: Administradores ilimitados</li>
                      </ul>
                    </div>
                    <div className="mt-4">
                      <a
                        href="/dashboard/suscripciones"
                        className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md transition-colors duration-200"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        Actualizar Plan
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <CrearUsuarioForm
              onClose={handleMenuClose}
              fetchData={fetchData}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default UserCanvas;
