/* eslint-disable @next/next/no-img-element */
import { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import { getCookie } from "cookies-next";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [submenuOpen, setSubmenuOpen] = useState(false); // Estado para el submenú
  const [collections, setCollections] = useState<any[]>([]);
  const [pathname, setPathname] = useState(""); // Estado para almacenar el pathname

  useEffect(() => {
    if (typeof window !== "undefined") {
      setPathname(window.location.pathname); // Obtén el pathname del cliente
    }
  }, []);

  const fetchCollections = async () => {
    try {
      const siteid = process.env.NEXT_PUBLIC_API_URL_SITEID || "";
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/collections?pageNumber=1&pageSize=50&siteId=${siteid}`
      );
      setCollections(response.data.collections);
    } catch (error) {
      console.error("Error fetching collections:", error);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const toggleSubmenu = () => {
    setSubmenuOpen(!submenuOpen); // Alterna el estado del submenú
  };

  return (
    <nav className="bg-white relative border">
      <div className="my-5 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Fila del logo centrado */}
        <div className="flex items-center justify-center mb-4 h-24">
          <Link href="/">
            <img
              className="h-auto w-24"
              src={process.env.NEXT_PUBLIC_LOGO_COLOR || "/img/3.png"}
              alt={process.env.NEXT_PUBLIC_NOMBRE_TIENDA}
            />
          </Link>
        </div>

        {/* Menú de escritorio */}
        <div className="hidden md:flex justify-center">
          <ul className="flex flex-row space-x-4">
            <li
              className={pathname === "/" ? "text-primary" : "text-primary"}
            >
              <Link
                href="/"
                className="text-[14px] font-medium"
                onClick={() => setIsOpen(false)}
              >
                Inicio
              </Link>
            </li>
            <li
              className={
                pathname === "/nosotros" ? "text-primary" : "text-primary"
              }
            >
              <Link
                href="/nosotros"
                className="hover:text-primary text-[14px] font-medium"
                onClick={() => setIsOpen(false)}
              >
                Nosotros
              </Link>
            </li>
            {collections.length > 0 && (
              <li className="group relative">
                <p className="hover:text-primary cursor-pointer text-[14px] font-medium flex items-center">
                  Colecciones
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16px"
                    height="16px"
                    className="ml-1"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 16a1 1 0 0 1-.71-.29l-6-6a1 1 0 0 1 1.42-1.42l5.29 5.3 5.29-5.29a1 1 0 0 1 1.41 1.41l-6 6a1 1 0 0 1-.7.29z" />
                  </svg>
                </p>
                <ul className="hidden absolute left-0 w-48 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg group-hover:block">
                  {collections.map((collection) => (
                    <li
                      key={collection.id}
                      className="flex gap-2 pb-2 border-b pl-2 py-2"
                    >
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
                        href={`/tienda/colecciones/${collection.id}`}
                        className="hover:text-primary text-base text-[15px] block"
                      >
                        {collection.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            )}
            <li className="group relative ">
              <p className="hover:text-primary text-[14px] font-medium text-primary flex items-center">
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
                    fill="#22366D"
                  />
                </svg>
              </p>
              <ul className="hidden absolute left-0 w-56 z-50 bg-white  border border-gray-200 shadow-lg group-hover:block">
                <li className="flex w-auto pb-2 border-b pl-2 py-2 text-primary">
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
                    href="/asesorias/asesorias-agricolas"
                    className="text-[14px] block"
                    onClick={() => {
                      setIsOpen(false);
                      setSubmenuOpen(false);
                    }}
                  >
                    Marketing Digital
                  </Link>{" "}
                </li>
                <li className="flex w-auto pb-2 border-b pl-2 py-2 text-primary">
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
                    href="/asesorias/asesorias-veterinarias"
                    className="text-[14px]  block"
                    onClick={() => {
                      setIsOpen(false);
                      setSubmenuOpen(false);
                    }}
                  >
                    Desarrollo Web
                  </Link>{" "}
                </li>

              </ul>
            </li>
            {/*             <li className={pathname === "/articulos-y-noticias" ? "text-primary" : "text-[#22366D]"}>
              <Link href="/articulos-y-noticias" className="hover:text-primary text-base font-medium">
                Artículos y noticias
              </Link>
            </li> */}
            <li
              className={
                pathname === "/contacto" ? "text-primary" : "text-primary"
              }
            >
              <Link
                href="/contacto"
                className="hover:text-primary text-[14px] font-medium"
              >
                Contacto
              </Link>
            </li>
          </ul>
        </div>

        {/* Botón hamburguesa para móviles */}
        <div className="-mr-2 flex md:hidden items-center justify-center">
          <button
            onClick={toggleMenu}
            className="inline-flex items-center justify-center p-2 rounded-md text-gray-900 dark:text-white hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none focus:text-gray-600 dark:focus:text-gray-300"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="size-8 text-primary"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className={`md:hidden ${isOpen ? "block" : "hidden"}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 pl-4">
          <ul>
            <li
              className={`max-lg:border-b max-lg:py-2 ${
                pathname === "/" ? "text-primary" : "text-primary"
              }`}
            >
              <Link
                href="/"
                className=" text-base font-medium"
              >
                Inicio
              </Link>
            </li>
            <li
              className={`max-lg:border-b max-lg:py-2 ${
                pathname === "/nosotros" ? "text-primary" : "text-primary"
              }`}
            >
              <Link
                href="/nosotros"
                className="text-base font-medium"
              >
                Nosotros
              </Link>
            </li>
            {/* Servicios de asesoría */}
            <li className="group">
              <button
                onClick={toggleSubmenu}
                className="w-full text-left border-b cursor-pointer text-base font-medium py-2 flex items-center text-primary"
              >
                Servicios
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16px"
                  height="16px"
                  className="ml-1"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 16a1 1 0 0 1-.71-.29l-6-6a1 1 0 0 1 1.42-1.42l5.29 5.3 5.29-5.29a1 1 0 0 1 1.41 1.41l-6 6a1 1 0 0 1-.7.29z" />
                </svg>
              </button>
              {/* Submenú se despliega cuando submenuOpen es true */}
              {submenuOpen && (
                <ul className="mt-2 space-y-2 text-primary">
                  <li className="flex gap-2 pb-2 border-b pl-2">
                    <Link
                      href="/asesorias/asesorias-agricolas"
                      className=" text-base text-[15px] block"
                    >
                      Desarrollo Web
                    </Link>
                  </li>
                  <li className="flex gap-2 pb-2 border-b pl-2">
                    <Link
                      href="/asesorias/asesorias-veterinarias"
                      className="text-base text-[15px] block"
                    >
                      Marketing Digital
                    </Link>
                  </li>
                </ul>
              )}
            </li>
            {/*             <li className={`max-lg:border-b max-lg:py-2 ${pathname === "/articulos-y-noticias" ? "text-primary" : "text-[#22366D]"}`}>
              <Link href="/articulos-y-noticias" className="text-base font-medium">Artículos y noticias</Link>
            </li> */}
            <li
              className={`max-lg:py-2 ${
                pathname === "/contacto" ? "text-primary" : "text-primary"
              }`}
            >
              <Link
                href="/contacto"
                className="text-base font-medium"
              >
                Contacto
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}