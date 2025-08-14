"use client";
/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { deleteCookie, getCookie } from "cookies-next";
import { obtenerUsuarioPorID } from "@/app/utils/obtenerUsuarioID";
import { jwtDecode } from "jwt-decode";
import { UserData } from "@/types/UserData";

const DropdownAdminMobile = ({ toggleMenu }: { toggleMenu: () => void }) => {
  const Token = getCookie("AdminTokenAuth");

  const decodeToken = Token ? jwtDecode(Token) : null;

  const [userDataInfo, setUserDataInfo] = useState<UserData>();

  useEffect(() => {
    const token = Token?.toString();
    const id = decodeToken?.sub;
    const fetchData = async () => {
      try {
        const userData = await obtenerUsuarioPorID(id, token);
        const userDataInfo = userData.user;
        setUserDataInfo(userDataInfo);
      } catch (error) {
        console.error("Error al obtener el usuario: " + error);
      }
    };

    fetchData();
  }, [Token, decodeToken?.sub]);

  const handleLogout = async () => {
    deleteCookie("AdminTokenAuth");
    window.location.href = "/";
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
          <div className="font-bold text-base mb-1">Admin</div>
          <div className="font-medium text-gray-600 dark:text-gray-400 truncate">
            {userDataInfo?.email || "hola.pixelup@gmail.com"}
          </div>
        </div>
      </div>

      {/* Opciones del menú */}
      <div className="border-t border-gray-200 dark:border-gray-700">
        <ul className="py-2">
          <li>
            <Link
              href="/dashboard/"
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
              Dashboard
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

export default DropdownAdminMobile;
