/* eslint-disable @next/next/no-img-element */
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import ThemeToggler from "@/components/Core/Theme/ThemeToggler";
import Buscador from "@/components/Core/Buscador/Buscador";
import CartCanvas from "@/components/Core/CartCanva/CartCanvas";
import axios from "axios";
import { getCookie } from "cookies-next";
import Link from "next/link";
import DropdownAdmin from "@/components/Core/Dropdown/DropdownAdmin/DropdownAdmin";
import DropdownUser from "@/components/Core/Dropdown/DropdownUser/DropdownUser";
import DropdownUserMobile from "@/components/Core/Dropdown/DropdownUser/DropdownUserMobile";
import DropdownAdminMobile from "@/components/Core/Dropdown/DropdownAdmin/DropdownAdminMobile";
import { slugify } from "@/app/utils/slugify";
import { useRevalidation } from "@/app/Context/RevalidationContext";
import { useNavbar } from "@/app/Context/NavbarContext";
import { useAuth } from "@/app/Context/AuthContext";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  const [isVisible1, setIsVisible1] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const Logo = process.env.NEXT_PUBLIC_LOGO_COLOR;
  const LogoMobile = process.env.NEXT_PUBLIC_LOGO_COLORMOBILE;
  const [productosIniciales, setProductosIniciales] = useState([]);
  const { setShouldRevalidate } = useRevalidation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [pathname, setPathname] = useState("");
  const { isAdmin, isClient } = useAuth();
  const router = useRouter();
  const { productTypes, collections } = useNavbar();

  useEffect(() => {
    // Este efecto solo se ejecutará en el cliente
    if (typeof window !== "undefined") {
      setPathname(window.location.pathname);
    }
  }, []);

  // Filtramos las colecciones excluidas
  const excludedIds = `${process.env.NEXT_PUBLIC_BANNER_NAVBAR}`;
  const filteredCollections = collections
    .filter((collection) => !excludedIds.includes(collection.id))
    .sort((a, b) => a.title.localeCompare(b.title));

  // Cargar productos iniciales
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const productsData = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/products?pageNumber=1&pageSize=50&siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
          { next: { revalidate: 3600 } }
        ).then((res) => res.json());

        if (productsData.code === 0) {
          setProductosIniciales(productsData.products);
        }
      } catch (error) {
        console.error("Error loading initial data:", error);
      }
    };

    loadInitialData();
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleKeydown = (event: any) => {
    if (event.key === "Escape") {
      setShowModal(false);
    }
  };

  useEffect(() => {
    if (showModal) {
      window.addEventListener("keydown", handleKeydown);
    } else {
      window.removeEventListener("keydown", handleKeydown);
    }
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [showModal]);

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };
  const toggleVisibility1 = () => {
    setIsVisible1(!isVisible1);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      setPathname(window.location.pathname);
    }
  }, []);

  // Modificar la función de navegación de categorías
  const handleCategoryClick = (productType: any) => {
    const categorySlug = slugify(productType.name);
    setShouldRevalidate(true);
    router.push(`/tienda?categoria=${categorySlug}`);
  };

  return (
    <nav className="bg-white shadow-lg relative">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:hidden grid grid-cols-3 items-center h-32">
          {/* Columna izquierda - Buscar y Login */}
          <div className="flex items-center justify-start">
            {/* Botón de menú en mobile */}
            <div className="-mr-2 flex lg:hidden">
              <button
                onClick={toggleMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-900 dark:text-white hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none focus:text-gray-600 dark:focus:text-gray-300"
                aria-label="Main menu"
                aria-expanded="false"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="#4D4D4D"
                  className="size-8"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12"
                  />
                </svg>
              </button>
            </div>
          </div>
          {/* Columna central - Logo */}
          <div className="flex justify-center">
            <Link href="/">
              <img
                className="h-24 w-24"
                src={LogoMobile}
                alt={process.env.NEXT_PUBLIC_NOMBRE_TIENDA}
              />
            </Link>
          </div>

          {/* Columna derecha - Botón de menú en mobile y menú en desktop */}
          <div className="flex items-center justify-end gap-2">
            <div>
              <Buscador productosIniciales={productosIniciales} />
            </div>
            <div className=" lg:flex">
              <CartCanvas />
            </div>
            <div className="hidden lg:flex pl-2">
              {isAdmin ? (
                <DropdownAdmin />
              ) : isClient ? (
                <DropdownUser />
              ) : (
                <div className="flex">
                  <Link href="/tienda/login">
                    <div className="py-1 px-2 bg-primary uppercase text-xs hover:bg-secondary hover:text-primary rounded-md m-1 text-white">
                      Login
                    </div>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="hidden lg:grid grid-cols-12 items-center h-32">
          {/* Columna izquierda - Botón de menú en mobile y menú en desktop */}
          <div className="flex items-center justify-start col-span-5">
            {/* Botón de menú en mobile */}
            <div className="-mr-2 flex lg:hidden">
              <button
                onClick={toggleMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-900 dark:text-white hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none focus:text-gray-600 dark:focus:text-gray-300"
                aria-label="Main menu"
                aria-expanded="false"
              >
                <svg
                  className="h-8 w-8"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16m-7 6h7"
                  />
                </svg>
              </button>
            </div>

            {/* Menú en desktop */}
            <div className="hidden lg:block mt-20">
              <ul className="flex flex-col md:flex-row md:space-x-4">
                <li
                  className={pathname === "/" ? "text-primary" : "text-primary"}
                >
                  <Link
                    href="/"
                    className="text-base font-semibold"
                  >
                    HOME
                  </Link>
                </li>
                {/*             <li className={pathname === "/tienda" ? "text-primary" : ""}>
              <Link
                href="/tienda"
                className="hover:text-primary text-base font-medium"
              >
                Tienda
              </Link>
            </li> */}
                {collections.length > 0 && (
                  <li className="group relative">
                    <div className="text-primary cursor-pointer text-base font-semibold flex items-center">
                      <Link href="/tienda">TIENDA</Link>

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
                    <ul className="hidden absolute left-0 w-48 z-50 bg-white  border-gray-200 rounded-md shadow-lg group-hover:block">
                      {productTypes.map((productType: any) => (
                        <li
                          key={productType.id}
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
                          <button
                            onClick={() => handleCategoryClick(productType)}
                            className="font-semibold uppercase text-primary text-base text-[15px] block"
                          >
                            {productType.name}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </li>
                )}
                {collections.length > 0 && (
                  <li className="group relative">
                    <p className="font-semibold text-primary cursor-pointer text-base flex items-center">
                      COLECCIONES
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
                    </p>
                    <ul className="hidden absolute left-0 w-48 z-50 bg-white  border-gray-200 rounded-md shadow-lg group-hover:block">
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
                            href={`/tienda/colecciones/${slugify(
                              collection.title
                            )}`}
                            className="font-semibold uppercase text-primary text-base text-[15px] block"
                          >
                            {collection.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </li>
                )}
                <li
                  className={
                    pathname === "/blog" ? "text-primary" : "text-primary"
                  }
                >
                  <Link
                    href="/blog"
                    className="font-semibold text-primary text-base"
                  >
                    BLOG
                  </Link>
                </li>
                <li
                  className={
                    pathname ===
                    "https://api.whatsapp.com/send?phone=+56962365458&text=Hola!%20Te%20has%20contactado%20con%20Pixelup."
                      ? "text-primary"
                      : ""
                  }
                >
                  <Link
                    href="https://api.whatsapp.com/send?phone=+56962365458&text=Hola!%20Te%20has%20contactado%20con%20Pixelup."
                    target="_blank"
                    className="font-semibold text-primary text-base"
                  >
                    CONTACTO
                  </Link>
                </li>
                <li
                  className={
                    pathname === "/componentes-pixelup" ? "text-primary" : "text-primary"
                  }
                >
                  <Link
                    href="/componentes-pixelup"
                    className="font-semibold text-primary text-base"
                  >
                    COMPONENTES
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Columna central - Logo */}
          <div className="flex justify-center col-span-2">
            <Link href="/">
              <img
                className="h-24 w-24"
                src={Logo}
                alt={process.env.NEXT_PUBLIC_NOMBRE_TIENDA}
              />
            </Link>
          </div>

          {/* Columna derecha - Buscar y Login */}

          <div className="mt-20 flex items-center justify-end gap-2 col-span-5">
            <div>
              <Buscador productosIniciales={productosIniciales} />
            </div>
            <div className="hidden lg:flex">
              <CartCanvas />
            </div>
            <div className="hidden lg:flex pl-2">
              {isAdmin ? (
                <DropdownAdmin />
              ) : isClient ? (
                <DropdownUser />
              ) : (
                <div className="flex">
                  <Link href="/tienda/login">
                    <div className="py-1 px-2 bg-primary uppercase text-xs hover:bg-secondary hover:text-primary rounded-md m-1 text-white">
                      Login
                    </div>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Menu desplegable en mobile */}
      <div
        className={`fixed inset-0 z-50 bg-white overflow-auto dark:bg-gray-800 transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-end p-4">
          <button
            onClick={toggleMenu}
            className="text-gray-900 dark:text-white hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"
          >
            <svg
              className="h-8 w-8"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="pt-2 pb-3 space-y-1 px-6 text-3xl ">
          <div className="flex-shrink-0 flex justify-center items-center mb-8">
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
            >
              <img
                className="w-40"
                src={LogoMobile}
                alt={process.env.NEXT_PUBLIC_NOMBRE_TIENDA}
              />
            </Link>
          </div>

          <ul className="flex flex-col text-center pb-8">
            <li
              className={` ${
                pathname === "/" ? "text-primary" : "text-primary"
              }`}
            >
              <Link
                href="/"
                className="hover:text-primary text-base font-medium"
                onClick={() => setIsOpen(false)}
              >
                HOME 1
              </Link>
            </li>
            {/*             <li className={pathname === "/tienda" ? "text-primary" : ""}>
                <Link
                  href="/tienda"
                  className="hover:text-primary text-base font-medium"
                >
                  TIENDA
                </Link>
              </li> */}
            <li
              className={`${
                pathname === "/" ? "text-primary" : "text-primary"
              }`}
            >
              <button
                className="relative items-center justify-center hover:text-primary text-base font-medium"
                onClick={toggleVisibility}
              >
                TIENDA
                <div
                  className="absolute"
                  style={{ top: "3px", left: "65px" }}
                >
                  {isVisible ? (
                    <div>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="size-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m4.5 15.75 7.5-7.5 7.5 7.5"
                        />
                      </svg>
                    </div>
                  ) : (
                    <div>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="size-4 "
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m19.5 8.25-7.5 7.5-7.5-7.5"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              </button>
            </li>
            {isVisible && (
              <div className="border-b border-t pb-2 mt-2">
                {collections.length > 0 && (
                  <ul className="flex flex-col space-y-1 text-center ">
                    {productTypes.map((productType: any) => (
                      <li
                        key={productType.id}
                        className={`${
                          pathname ===
                          `/tienda?categoria=${slugify(productType.name)}`
                            ? "text-primary"
                            : "text-primary"
                        }`}
                      >
                        <Link
                          href={`/tienda?categoria=${slugify(
                            productType.name
                          )}`}
                          className="hover:text-primary text-base font-medium uppercase"
                          onClick={() => setIsOpen(false)}
                        >
                          {productType.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
                <li
                  className={`mt-2 ${
                    pathname === `/tienda` ? "text-primary" : "text-primary"
                  }`}
                >
                  <Link
                    href="/tienda"
                    className="text-primary text-base font-medium uppercase"
                  >
                    Ver Todos
                  </Link>
                </li>
              </div>
            )}

            <li
              className={`${
                pathname === "/" ? "text-primary" : "text-primary"
              }`}
            >
              <button
                className="relative items-center justify-center hover:text-primary text-base font-medium"
                onClick={toggleVisibility1}
              >
                COLECCIONES
                <div
                  className="absolute"
                  style={{ top: "3px", left: "121px" }}
                >
                  {isVisible1 ? (
                    <div>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="size-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m4.5 15.75 7.5-7.5 7.5 7.5"
                        />
                      </svg>
                    </div>
                  ) : (
                    <div>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="size-4 "
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m19.5 8.25-7.5 7.5-7.5-7.5"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              </button>
            </li>
            {isVisible1 && (
              <div className="border-b border-t pb-2 mt-2">
                {collections.length > 0 && (
                  <ul className="flex flex-col space-y-1 text-center ">
                    {filteredCollections.map((collection) => (
                      <li
                        key={collection.id}
                        className={`${
                          pathname === "/tienda" ? "text-primary" : ""
                        }`}
                      >
                        <Link
                          href={`/tienda/colecciones/${slugify(
                            collection.title
                          )}`}
                          className="text-primary text-base font-medium uppercase"
                          onClick={() => setIsOpen(false)}
                        >
                          {collection.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            <li
                  className={
                    pathname === "/componentes-pixelup" ? "text-primary" : "text-primary"
                  }
                >
                  <Link
                    href="/componentes-pixelup"
                    className="font-semibold text-primary text-base"
                  >
                    COMPONENTES
                  </Link>
                </li>
            <li
              className={
                pathname ===
                "https://api.whatsapp.com/send?phone=+56962365458&text=Hola!%20Te%20has%20contactado%20con%20Pixelup."
                  ? "text-primary"
                  : "text-primary"
              }
            >
              <Link
                href="https://api.whatsapp.com/send?phone=+56962365458&text=Hola!%20Te%20has%20contactado%20con%20Pixelup."
                target="_blank"
                className="hover:text-primary text-base font-medium uppercase"
              >
                CONTACTO
              </Link>
            </li>
          </ul>

          <div className="w-full py-4 flex  items-center">
            <div className="w-full flex justify-center items-center mb-4">
              {isAdmin ? (
                <DropdownAdminMobile toggleMenu={toggleMenu} />
              ) : isClient ? (
                <DropdownUserMobile toggleMenu={toggleMenu} />
              ) : (
                <div className="flex">
                  <Link href="/tienda/login">
                    <div className="py-1 px-2 bg-primary uppercase text-xs hover:bg-secondary hover:text-primary rounded-md m-1 text-white">
                      Login
                    </div>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmación */}
      {showModal && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm z-50"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white p-6 rounded-lg shadow-lg relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-2 right-4 text-4xl"
            >
              &times;
            </button>
            <img
              src="/img/Tabladetallas/TabladeTallas.webp"
              alt="Tabla de Tallas"
              className="max-w-full max-h-full object-contain"
              style={{ maxWidth: "80vw", maxHeight: "80vh" }}
            />
          </div>
        </div>
      )}
    </nav>
  );
}
