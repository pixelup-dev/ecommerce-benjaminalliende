"use client";
/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { deleteCookie, getCookie } from "cookies-next";
import { obtenerClienteID } from "@/app/utils/obtenerClienteID";
import { jwtDecode } from "jwt-decode";
import { UserData } from "@/types/UserData";

const DropdownUserMobile = ({ toggleMenu }: { toggleMenu: () => void }) => {
  const Token = getCookie("ClientTokenAuth");

  const decodeToken = Token ? jwtDecode(Token) : null;

  const [userDataInfo, setUserDataInfo] = useState<UserData>();

  useEffect(() => {
    const id = decodeToken?.sub;
    const fetchData = async () => {
      try {
        const userData = await obtenerClienteID(id, Token);

        const userDataInfo = userData.customer;
        setUserDataInfo(userDataInfo);
      } catch (error) {
        console.error("Error : " + error);
      }
    };

    fetchData();
  }, [Token, decodeToken?.sub]);

  const handleLogout = async () => {
    deleteCookie("ClientTokenAuth");
    window.location.href = "/tienda";
  };

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const trigger = useRef<any>(null);
  const dropdown = useRef<any>(null);

  useEffect(() => {
    const clickHandler = ({ target }: MouseEvent) => {
      if (!dropdown.current) return;
      if (
        !dropdownOpen ||
        dropdown.current.contains(target) ||
        trigger.current.contains(target)
      )
        return;
      setDropdownOpen(false);
    };
    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  });

  // close if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ keyCode }: KeyboardEvent) => {
      if (!dropdownOpen || keyCode !== 27) return;
      setDropdownOpen(false);
    };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  });

  return (
    <div className="w-full">
      {/* Información del usuario */}
      <div className="border-t border-gray-200 dark:border-gray-700 py-4 px-4">
        <div className="text-sm text-gray-900 dark:text-white">
          <div className="font-bold text-base mb-1">{userDataInfo?.firstname || "Usuario"}</div>
          <div className="font-medium text-gray-600 dark:text-gray-400 truncate">
            {userDataInfo?.email || "usuario@ejemplo.com"}
          </div>
        </div>
      </div>

      {/* Opciones del menú */}
      <div className="border-t border-gray-200 dark:border-gray-700">
        <ul className="py-2">
          <li>
            <Link
              href="/tienda/mi-cuenta/datos-personales"
              className="flex items-center px-4 py-3 text-base font-medium text-gray-900 dark:text-white hover:text-primary dark:hover:text-primary transition-colors duration-200"
              onClick={() => {
                setDropdownOpen(false);
                toggleMenu();
              }}
            >
              <svg
                className="size-5 mr-3 text-gray-500 dark:text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                />
              </svg>
              Mi Cuenta
            </Link>
          </li>

          <li>
            <Link
              href="/tienda/mi-cuenta/mis-pedidos"
              className="flex items-center px-4 py-3 text-base font-medium text-gray-900 dark:text-white hover:text-primary dark:hover:text-primary transition-colors duration-200"
              onClick={() => {
                setDropdownOpen(false);
                toggleMenu();
              }}
            >
              <svg
                className="size-5 mr-3 text-gray-500 dark:text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"
                />
              </svg>
              Mis Pedidos
            </Link>
          </li>
        </ul>
      </div>

      {/* Botón de logout */}
      <div className="border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-3 text-base font-medium text-gray-900 dark:text-white hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200"
        >
          <svg
            className="size-5 mr-3 text-gray-500 dark:text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15"
            />
          </svg>
          Log Out
        </button>
      </div>
    </div>
  );
};

export default DropdownUserMobile;
