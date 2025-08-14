/* eslint-disable @next/next/no-img-element */
import { useState, useEffect } from "react";
import { getCookie } from "cookies-next";
import Link from "next/link";
import DropdownAdmin from "@/components/Core/Dropdown/DropdownAdmin/DropdownAdmin";
import DropdownUser from "@/components/Core/Dropdown/DropdownUser/DropdownUser";
import DropdownUserMobile from "@/components/Core/Dropdown/DropdownUser/DropdownUserMobile";
import DropdownAdminMobile from "@/components/Core/Dropdown/DropdownAdmin/DropdownAdminMobile";

export default function Navbar03() {
  const [isOpen, setIsOpen] = useState(false); // Para controlar el menú mobile
  const [pathname, setPathname] = useState("");
  const AdminToken = getCookie("AdminTokenAuth");
  const ClientToken = getCookie("ClientTokenAuth");
  const Logo = process.env.NEXT_PUBLIC_LOGO_COLOR;

  useEffect(() => {
    if (typeof window !== "undefined") {
      setPathname(window.location.pathname);
    }
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="bg-white top-14 left-0 w-full z-20 ">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo a la izquierda */}
          <div className="flex items-center">
            <Link href="/">
              <img
                className="w-32 h-auto object-contain max-h-14"
                src={Logo}
                alt={process.env.NEXT_PUBLIC_NOMBRE_TIENDA}
              />
            </Link>
          </div>

          {/* Menú para escritorio */}
          <div className="hidden md:flex items-center space-x-8 text-dark">
            <Link
              href="/"
              className={`${
                pathname === "/" ? "text-primary" : "hover:scale-105"
              }`}
            >
              Inicio
            </Link>
            <Link
              href="/sobre-mi"
              className={`${
                pathname === "/sobre-mi" ? "text-primary" : "hover:scale-105"
              }`}
            >
              Sobre mi
            </Link>
            <ul className="list-none">
              <li className="group relative">
                <div
                  className={`flex items-center cursor-pointer ${
                    pathname === "/servicios/"
                      ? "text-primary"
                      : "hover:scale-105"
                  }`}
                >
                  Servicios
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16px"
                    height="16px"
                    className="ml-1"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M12 16a1 1 0 0 1-.71-.29l-6-6a1 1 0 0 1 1.42-1.42l5.29 5.3 5.29-5.29a1 1 0 0 1 1.41 1.41l-6 6a1 1 0 0 1-.7.29z"
                      data-name="16"
                      data-original="#000000"
                    />
                  </svg>
                </div>
                <ul className="hidden absolute left-0 w-48 z-50 bg-white  border-gray-200 rounded shadow-lg group-hover:block">
                  <li className="flex gap-2 pb-2 border-b pl-2 py-2">
                    <span className="self-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="size-3"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m8.25 4.5 7.5 7.5-7.5 7.5"
                        />
                      </svg>
                    </span>
                    <Link
                      href="/servicios/mujer"
                      className={` text-primary ${
                        pathname === "/servicios/mujer"
                          ? "text-primary"
                          : "hover:text-dark"
                      }`}
                    >
                      Marketing Digital
                    </Link>
                  </li>
                  <li className="flex gap-2 pb-2 border-b pl-2 py-2">
                    <span className="self-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="size-3"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m8.25 4.5 7.5 7.5-7.5 7.5"
                        />
                      </svg>
                    </span>
                    <Link
                      href="/servicios/empresa"
                      className={` text-primary ${
                        pathname === "/empresa"
                          ? "text-primary"
                          : "hover:text-dark"
                      }`}
                    >
                      Desarrollo Web
                    </Link>
                  </li>
                </ul>
              </li>
            </ul>
            {/* <Link
              href="/blog"
              className={`${
                pathname === "/blog" ? "text-primary" : "hover:text-gray-300"
              }`}
            >
              Blog
            </Link> */}

            <Link
              href="/chicpoint"
              className={`${
                pathname === "/chicpoint" ? "text-primary" : "hover:scale-105"
              }`}
            >
              Tienda
            </Link>
            <Link
              href="/contacto"
              className={`${
                pathname === "/contacto" ? "text-primary" : "hover:scale-105"
              }`}
            >
              Contacto
            </Link>
          </div>

          {/* Menú mobile */}
          <div className="flex md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none"
              aria-expanded="false"
            >
              <svg
                className="block h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16m-7 6h7"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Dropdown del menú para mobile */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              href="/"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                pathname === "/" ? "bg-gray-900 text-white" : "text-gray-300"
              }`}
              onClick={toggleMenu}
            >
              Inicio
            </Link>
            <Link
              href="/sobre-mi"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                pathname === "/sobre-mi"
                  ? "bg-gray-900 text-white"
                  : "text-gray-300"
              }`}
              onClick={toggleMenu}
            >
              Sobre mi
            </Link>
            <Link
              href="/blog"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                pathname === "/blog"
                  ? "bg-gray-900 text-white"
                  : "text-gray-300"
              }`}
              onClick={toggleMenu}
            >
              Blog
            </Link>
            <Link
              href="/servicios"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                pathname === "/servicios"
                  ? "bg-gray-900 text-white"
                  : "text-gray-300"
              }`}
              onClick={toggleMenu}
            >
              Servicios
            </Link>
            <Link
              href="/chicpoint"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                pathname === "/chicpoint"
                  ? "bg-gray-900 text-white"
                  : "text-gray-300"
              }`}
              onClick={toggleMenu}
            >
              ChicPoint
            </Link>
            <Link
              href="/contacto"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                pathname === "/contacto"
                  ? "bg-gray-900 text-white"
                  : "text-gray-300"
              }`}
              onClick={toggleMenu}
            >
              Contacto
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}