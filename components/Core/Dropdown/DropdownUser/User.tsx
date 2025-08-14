"use client";
/* eslint-disable @next/next/no-img-element */

import React, { useState, useEffect, useRef } from "react";
import { deleteCookie, getCookie } from "cookies-next"; // Importa getCookie para verificar si existe el token de autenticación
import { useRouter } from "next/navigation";
import Link from "next/link";
import { jwtDecode } from "jwt-decode";
import { UserData } from "@/types/UserData";
import { obtenerUsuarioPorID } from "@/app/utils/obtenerUsuarioID";

export default function Page() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const router = useRouter();
  const Token = String(getCookie("AdminTokenAuth"));
  const decodeToken = jwtDecode(Token);
  const id = decodeToken.sub;

  const [userDataInfo, setUserDataInfo] = useState<UserData>();

  useEffect(() => {
    const token = Token?.toString();

    const fetchData = async () => {
      try {
        console.log("token", token);
        const userData = await obtenerUsuarioPorID(id, token);
        console.log("userData", userData);
        const userDataInfo = userData.user;
        setUserDataInfo(userDataInfo);
      } catch (error) {
        console.error("Error al obtener el usuario: " + error);
      }
    };

    fetchData();
  }, [Token, id]);

  useEffect(() => {
    function handleClickOutside(event: any) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    // Adjuntar el controlador de eventos al documento
    document.addEventListener("mousedown", handleClickOutside);

    // Eliminar el controlador de eventos al desmontar el componente
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = async () => {
    deleteCookie("AdminTokenAuth");
    router.push("/");
  };

  return (
    <div style={{ position: "relative" }}>
      {/* Condición para mostrar el botón de inicio de sesión */}
      {!Token && (
        <Link href="/tienda/login">
          <button
            id="loginButton"
            className="text-sm bg-gray-800 rounded-full text-white md:me-0 focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
            type="button"
          >
            Login
          </button>
        </Link>
      )}

      {/* Condición para mostrar el menú de usuario si existe el token */}
      {Token && (
        <button
          id="dropdownUserAvatarButton"
          onClick={toggleDropdown}
          className="flex text-sm bg-gray-800 rounded-full md:me-0 focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
          type="button"
        >
          <span className="sr-only">Open user menu</span>
          <img
            className="w-8 h-8 rounded-full"
            src="https://i.pravatar.cc/300"
            alt="user photo"
          />
        </button>
      )}

      {/* Dropdown menu */}
      {isOpen && Token && (
        <div
          ref={dropdownRef}
          id="dropdownAvatar"
          className="absolute z-10 bg-white divide-y divide-gray-100 rounded-lg shadow w- dark:bg-gray-700 dark:divide-gray-600"
          style={{ top: "calc(100% + 5px)", right: 0 }}
        >
          <div className="px-4 py-3 text-sm text-gray-900 dark:text-white">
            <div>
              {" "}
              {userDataInfo?.firstname} {userDataInfo?.lastname}
            </div>
            <div className="font-medium truncate"> {userDataInfo?.email}</div>
          </div>
          <ul
            className="py-2 text-sm text-gray-700 dark:text-gray-200"
            aria-labelledby="dropdownUserAvatarButton"
          >
            <li>
              <a
                href="#"
                className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
              >
                Dashboard
              </a>
            </li>
            <li>
              <a
                href="#"
                className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
              >
                Settings
              </a>
            </li>
            <li>
              <a
                href="#"
                className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
              >
                Earnings
              </a>
            </li>
          </ul>
          <div className="py-2">
            <a
              href="#"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
              onClick={handleLogout}
            >
              Sign out
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
