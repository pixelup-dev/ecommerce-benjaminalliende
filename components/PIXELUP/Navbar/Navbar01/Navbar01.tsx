/* eslint-disable @next/next/no-img-element */
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import Buscador from "@/components/Core/Buscador/Buscador";
import CartCanvas from "@/components/Core/CartCanva/CartCanvas";
import axios from "axios";
import { getCookie } from "cookies-next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import DropdownAdmin from "@/components/Core/Dropdown/DropdownAdmin/DropdownAdmin";
import DropdownUser from "@/components/Core/Dropdown/DropdownUser/DropdownUser";
import DropdownUserMobile from "@/components/Core/Dropdown/DropdownUser/DropdownUserMobile";
import DropdownAdminMobile from "@/components/Core/Dropdown/DropdownAdmin/DropdownAdminMobile";
import { mainMenuConfig, layoutConfig } from "@/app/config/menulinks";
import { slugify } from "@/app/utils/slugify";
import { useLogo } from "@/context/LogoContext";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isCategoriesVisible, setIsCategoriesVisible] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  const [dropdownTimeout, setDropdownTimeout] = useState<NodeJS.Timeout | null>(
    null
  );
  const { theme, setTheme } = useTheme();
  const [productosIniciales, setProductosIniciales] = useState([]);
  const pathname = usePathname();
  const { logo } = useLogo();

  const Logo = logo?.mainImage?.url || process.env.NEXT_PUBLIC_LOGO_COLOR;
  const AdminToken = getCookie("AdminTokenAuth");
  const ClientToken = getCookie("ClientTokenAuth");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [collections, setCollections] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  // Filtrar los enlaces del menú que son visibles
  const menuItems = mainMenuConfig.showInNavbar
    ? mainMenuConfig.links.filter((link) => link.isVisible)
    : [];

  // Obtener las configuraciones de colores del menú
  const menuColor = mainMenuConfig.menuColor || "red-500";
  const activeFontWeight = mainMenuConfig.activeFontWeight || "font-bold";

  // Clases de color para el menú
  const activeColorClass = `text-${menuColor}`;
  const hoverColorClass = `hover:text-${menuColor}`;

  const excludedIds = `${process.env.NEXT_PUBLIC_BANNER_NAVBAR}`;
  const filteredCollections = collections
    .filter((collection) => !excludedIds.includes(collection.id))
    .sort((a, b) => a.title.localeCompare(b.title));

  const filteredCategories = categories
    .filter((category) => category.statusCode === "ACTIVE")
    .sort((a, b) => a.name.localeCompare(b.name));

  // Función para verificar si una ruta está activa
  const isActive = (path: string) => {
    if (!pathname) return false;

    // Verificar si es la ruta exacta
    if (pathname === path) return true;

    // Caso especial para la tienda
    if (
      path === "/tienda" &&
      pathname.startsWith("/tienda") &&
      !pathname.includes("/tienda/colecciones")
    )
      return true;

    // Caso especial para colecciones
    if (
      path.includes("/colecciones") &&
      pathname.includes("/tienda/colecciones")
    )
      return true;

    // Verificar si es una subruta (para otros casos)
    if (
      path !== "/" &&
      pathname.startsWith(path) &&
      !pathname.includes("/tienda/colecciones")
    )
      return true;

    return false;
  };

  const fetchCollections = async () => {
    try {
      const siteid = process.env.NEXT_PUBLIC_API_URL_SITEID || "";
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/collections?pageNumber=1&pageSize=50&siteId=${siteid}`
      );
      setCollections(response.data.collections);
    } catch (error) {
      console.error("Error fetching collections:", error);
      setError(error as Error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const siteid = process.env.NEXT_PUBLIC_API_URL_SITEID || "";
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/product-types?pageNumber=1&pageSize=50&siteId=${siteid}`
      );
      setCategories(response.data.productTypes);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setError(error as Error);
    }
  };

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

  useEffect(() => {
    fetchCollections();
  }, []);

  useEffect(() => {
    fetchCategories();
  }, []);

  // Limpiar el timeout cuando el componente se desmonte
  useEffect(() => {
    return () => {
      if (dropdownTimeout) {
        clearTimeout(dropdownTimeout);
      }
    };
  }, [dropdownTimeout]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  const toggleCategoriesVisibility = () => {
    setIsCategoriesVisible(!isCategoriesVisible);
  };

  const handleDropdownEnter = (index: number) => {
    if (dropdownTimeout) {
      clearTimeout(dropdownTimeout);
      setDropdownTimeout(null);
    }
    setActiveDropdown(index);
  };

  const handleDropdownLeave = () => {
    const timeout = setTimeout(() => {
      setActiveDropdown(null);
    }, 300); // 300ms de retraso antes de cerrar
    setDropdownTimeout(timeout as NodeJS.Timeout);
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-lg relative">
      {/* Barra principal de navegación */}
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`flex items-center ${
            layoutConfig.logoCentered
              ? "justify-between relative"
              : "justify-between"
          } min-h-24 py-4`}
        >
          {/* Menú principal - versión escritorio */}
          <div
            className={`hidden lg:flex ${
              layoutConfig.logoCentered
                ? "order-1 justify-start w-1/3"
                : "order-2 flex-grow justify-center"
            }`}
          >
            <ul className="flex flex-col md:flex-row md:space-x-8 uppercase">
              {menuItems.map((item, index) => {
                // Si es un menú desplegable de colecciones
                if (item.isDropdown && item.dropdownType === "collections") {
                  // Solo mostrar el menú de colecciones si hay colecciones disponibles
                  if (filteredCollections.length === 0) {
                    return null;
                  }
                  
                  return (
                    <li
                      key={index}
                      className="relative"
                      onMouseEnter={() => handleDropdownEnter(index)}
                      onMouseLeave={handleDropdownLeave}
                    >
                      <p
                        className={`cursor-pointer text-base font-medium flex items-center ${hoverColorClass} ${
                          pathname.includes("/tienda/colecciones")
                            ? `${activeColorClass} ${activeFontWeight}`
                            : ""
                        }`}
                      >
                        {item.title}
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
                      {/* Área de padding invisible para facilitar la navegación al submenú */}
                      <div className="absolute h-4 w-full left-0 top-full"></div>
                      <ul
                        className={`absolute uppercase left-0 w-64 z-50 bg-white dark:bg-gray-800  dark:border-gray-700 shadow-lg rounded-md py-2 mt-4 transition-all duration-300 ${
                          activeDropdown === index
                            ? "opacity-100 visible"
                            : "opacity-0 invisible"
                        }`}
                      >
                        {filteredCollections.length > 0 &&
                          filteredCollections.map((collection) => {
                            const collectionPath = `/tienda/colecciones/${slugify(
                              collection.title
                            )}`;
                            return (
                              <li
                                key={collection.id}
                                className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 ${
                                  pathname === collectionPath
                                    ? "bg-gray-100 dark:bg-gray-600"
                                    : ""
                                }`}
                              >
                                <Link
                                  href={collectionPath}
                                  className={`flex items-center px-4 py-2 text-sm ${hoverColorClass} ${
                                    pathname === collectionPath
                                      ? `${activeColorClass} font-medium`
                                      : ""
                                  }`}
                                >
                                  <span className="mr-2">
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
                                  {collection.title}
                                </Link>
                              </li>
                            );
                          })}
                      </ul>
                    </li>
                  );
                }
                // Si es un menú desplegable de categorías
                if (item.isDropdown && item.dropdownType === "categories") {
                  return (
                    <li
                      key={index}
                      className="relative"
                      onMouseEnter={() => handleDropdownEnter(index)}
                      onMouseLeave={handleDropdownLeave}
                    >
                      <p
                        className={`cursor-pointer text-base font-medium flex items-center ${hoverColorClass} ${
                          pathname.includes("categoria=")
                            ? `${activeColorClass} ${activeFontWeight}`
                            : ""
                        }`}
                      >
                        {item.title}
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
                      {/* Área de padding invisible para facilitar la navegación al submenú */}
                      <div className="absolute h-4 w-full left-0 top-full"></div>
                      <ul
                        className={`absolute uppercase left-0 w-64 z-50 bg-white dark:bg-gray-800  dark:border-gray-700 shadow-lg rounded-md py-2 mt-4 transition-all duration-300 ${
                          activeDropdown === index
                            ? "opacity-100 visible"
                            : "opacity-0 invisible"
                        }`}
                      >
                        {filteredCategories.length > 0 &&
                          filteredCategories.map((category) => {
                            const categoryPath = `/tienda?categoria=${slugify(
                              category.name
                            )}`;
                            return (
                              <li
                                key={category.id}
                                className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 ${
                                  pathname.includes(
                                    `categoria=${slugify(category.name)}`
                                  )
                                    ? "bg-gray-100 dark:bg-gray-600"
                                    : ""
                                }`}
                              >
                                <Link
                                  href={categoryPath}
                                  className={`flex items-center px-4 py-2 text-sm ${hoverColorClass} ${
                                    pathname.includes(
                                      `categoria=${slugify(category.name)}`
                                    )
                                      ? `${activeColorClass} font-medium`
                                      : ""
                                  }`}
                                  onClick={() => {
                                    setIsOpen(false);
                                    // Scroll hacia la sección de productos después de la navegación
                                    setTimeout(() => {
                                      const productSection =
                                        document.querySelector(
                                          ".product-grid-section"
                                        );
                                      if (productSection) {
                                        productSection.scrollIntoView({
                                          behavior: "smooth",
                                        });
                                      }
                                    }, 100);
                                  }}
                                >
                                  <span className="mr-2">
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
                                  {category.name}
                                </Link>
                              </li>
                            );
                          })}
                        {/* Enlace "Ver todos" al final del dropdown */}
                        <li className="border-t border-gray-200 dark:border-gray-600 mt-2 pt-2">
                          <Link
                            href="/tienda"
                            className={`flex items-center px-4 py-2 text-sm ${hoverColorClass} font-medium`}
                            onClick={() => {
                              setIsOpen(false);
                              // Scroll hacia la sección de productos después de la navegación
                              setTimeout(() => {
                                const productSection = document.querySelector(
                                  ".product-grid-section"
                                );
                                if (productSection) {
                                  productSection.scrollIntoView({
                                    behavior: "smooth",
                                  });
                                }
                              }, 100);
                            }}
                          >
                            <span className="mr-2">
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
                            Ver todos
                          </Link>
                        </li>
                      </ul>
                    </li>
                  );
                }
                // Si es un enlace normal
                return (
                  <li
                    key={index}
                    className={
                      isActive(item.path)
                        ? `${activeColorClass} ${activeFontWeight}`
                        : ""
                    }
                  >
                    <Link
                      href={item.path}
                      className={`text-base font-medium ${hoverColorClass} ${
                        isActive(item.path) ? activeColorClass : ""
                      }`}
                    >
                      {item.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Logo - puede estar centrado o a la izquierda según la configuración */}
          <div
            className={`flex items-center gap-6 min-w-[150px] ${
              layoutConfig.logoCentered
                ? "lg:order-2 lg:absolute lg:left-1/2 lg:transform lg:-translate-x-1/2 order-1 flex-grow justify-center"
                : "order-1"
            }`}
          >
            <div className="flex-shrink-0 pr-4">
              <Link href="/">
                <img
                  className="w-auto max-h-16 max-w-[100px] object-contain"
                  src={Logo}
                  alt={process.env.NEXT_PUBLIC_NOMBRE_TIENDA}
                />
              </Link>
            </div>
          </div>

          {/* Botones de acción - versión escritorio */}
          <div
            className={`hidden lg:flex items-center gap-4 ${
              layoutConfig.logoCentered
                ? "order-3 w-1/3 justify-end"
                : "order-3"
            }`}
          >
            <div className="hidden lg:flex">
              <Buscador productosIniciales={productosIniciales} />
            </div>
            <div className="hidden lg:flex">
              <CartCanvas />
            </div>
            <div className="hidden lg:flex">
              {AdminToken ? (
                <DropdownAdmin />
              ) : ClientToken ? (
                <DropdownUser />
              ) : (
                !AdminToken && (
                  <Link href="/tienda/login">
                    <div className="py-1 px-3 bg-primary uppercase text-xs hover:bg-secondary hover:text-primary rounded-md text-white">
                      Login
                    </div>
                  </Link>
                )
              )}
            </div>
          </div>

          {/* Botones de acción - versión móvil */}
          <div
            className={`flex lg:hidden items-center gap-4 order-2 justify-end`}
          >
            <div className="flex items-center">
              <Buscador productosIniciales={productosIniciales} />
            </div>
            <div className="self-center">
              <CartCanvas />
            </div>
            <div className="self-center">
              {AdminToken ? (
                <DropdownAdmin />
              ) : ClientToken ? (
                <DropdownUser />
              ) : (
                !AdminToken && (
                  <Link href="/tienda/login">
                    <div className="py-1 px-2 bg-primary uppercase text-xs hover:bg-secondary hover:text-primary rounded-md text-white">
                      Login
                    </div>
                  </Link>
                )
              )}
            </div>
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
        </div>
      </div>

      {/* Menú móvil */}
      <div
        className={`fixed inset-0 z-50 bg-white dark:bg-gray-800 overflow-y-auto ${
          isOpen ? "block" : "hidden"
        }`}
      >
        <div className="flex justify-end px-4 py-2">
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
        <div className="pt-2 pb-6 space-y-1 px-6 text-3xl">
          <div className="flex-shrink-0 flex justify-center items-center">
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
            >
              <img
                className="w-auto max-h-14 mb-6"
                src={Logo}
                alt={process.env.NEXT_PUBLIC_NOMBRE_TIENDA}
              />
            </Link>
          </div>

          <ul className="flex flex-col space-y-1 pb-4">
            {menuItems.map((item, index) => {
              // Si es un menú desplegable de colecciones en versión móvil
              if (item.isDropdown && item.dropdownType === "collections") {
                // Solo mostrar el menú de colecciones si hay colecciones disponibles
                if (filteredCollections.length === 0) {
                  return null;
                }
                
                return (
                  <li
                    key={index}
                    className={`${
                      pathname.includes("/tienda/colecciones")
                        ? `${activeColorClass} ${activeFontWeight}`
                        : ""
                    }`}
                  >
                    <button
                      className={`relative flex items-center justify-between w-full py-3 px-4 text-left text-base font-medium uppercase border-b border-gray-100 dark:border-gray-700 ${
                        pathname.includes("/tienda/colecciones")
                          ? activeColorClass
                          : "text-gray-900 dark:text-white"
                      } ${hoverColorClass}`}
                      onClick={toggleVisibility}
                    >
                      <span>{item.title}</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className={`size-5 transition-transform duration-200 ${
                          isVisible ? "rotate-180" : ""
                        }`}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m19.5 8.25-7.5 7.5-7.5-7.5"
                        />
                      </svg>
                    </button>
                    
                    {/* Submenú de colecciones */}
                    {isVisible && (
                      <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
                        <ul className="py-2">
                          {filteredCollections.map((collection) => {
                            const collectionPath = `/tienda/colecciones/${slugify(
                              collection.title
                            )}`;
                            return (
                              <li
                                key={collection.id}
                                className={`${
                                  pathname === collectionPath
                                    ? "bg-gray-100 dark:bg-gray-700"
                                    : ""
                                }`}
                              >
                                <Link
                                  href={collectionPath}
                                  className={`flex items-center px-8 py-2 text-sm font-medium ${
                                    pathname === collectionPath
                                      ? activeColorClass
                                      : "text-gray-700 dark:text-gray-300"
                                  } ${hoverColorClass}`}
                                  onClick={() => setIsOpen(false)}
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="size-4 mr-2"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="m8.25 4.5 7.5 7.5-7.5 7.5"
                                    />
                                  </svg>
                                  {collection.title}
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                  </li>
                );
              }
              
              // Si es un menú desplegable de categorías en versión móvil
              if (item.isDropdown && item.dropdownType === "categories") {
                return (
                  <li
                    key={index}
                    className={`${
                      pathname.includes("categoria=")
                        ? `${activeColorClass} ${activeFontWeight}`
                        : ""
                    }`}
                  >
                    <button
                      className={`relative flex items-center justify-between w-full py-3 px-4 text-left text-base font-medium uppercase border-b border-gray-100 dark:border-gray-700 ${
                        pathname.includes("categoria=")
                          ? activeColorClass
                          : "text-gray-900 dark:text-white"
                      } ${hoverColorClass}`}
                      onClick={toggleCategoriesVisibility}
                    >
                      <span>{item.title}</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className={`size-5 transition-transform duration-200 ${
                          isCategoriesVisible ? "rotate-180" : ""
                        }`}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m19.5 8.25-7.5 7.5-7.5-7.5"
                        />
                      </svg>
                    </button>
                    
                    {/* Submenú de categorías */}
                    {isCategoriesVisible && (
                      <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
                        <ul className="py-2">
                          {filteredCategories.map((category) => {
                            const categoryPath = `/tienda?categoria=${slugify(
                              category.name
                            )}`;
                            return (
                              <li
                                key={category.id}
                                className={`${
                                  pathname.includes(
                                    `categoria=${slugify(category.name)}`
                                  )
                                    ? "bg-gray-100 dark:bg-gray-700"
                                    : ""
                                }`}
                              >
                                <Link
                                  href={categoryPath}
                                  className={`flex items-center px-8 py-2 text-sm font-medium ${
                                    pathname.includes(
                                      `categoria=${slugify(category.name)}`
                                    )
                                      ? activeColorClass
                                      : "text-gray-700 dark:text-gray-300"
                                  } ${hoverColorClass}`}
                                  onClick={() => {
                                    setIsOpen(false);
                                    // Scroll hacia la sección de productos después de la navegación
                                    setTimeout(() => {
                                      const productSection = document.querySelector(
                                        ".product-grid-section"
                                      );
                                      if (productSection) {
                                        productSection.scrollIntoView({
                                          behavior: "smooth",
                                        });
                                      }
                                    }, 100);
                                  }}
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="size-4 mr-2"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="m8.25 4.5 7.5 7.5-7.5 7.5"
                                    />
                                  </svg>
                                  {category.name}
                                </Link>
                              </li>
                            );
                          })}
                          
                          {/* Enlace "Ver todos" al final del dropdown móvil */}
                          <li className="border-t border-gray-200 dark:border-gray-600 mt-2 pt-2">
                            <Link
                              href="/tienda"
                              className={`flex items-center px-8 py-2 text-sm font-medium ${hoverColorClass}`}
                              onClick={() => {
                                setIsOpen(false);
                                // Scroll hacia la sección de productos después de la navegación
                                setTimeout(() => {
                                  const productSection = document.querySelector(
                                    ".product-grid-section"
                                  );
                                  if (productSection) {
                                    productSection.scrollIntoView({
                                      behavior: "smooth",
                                    });
                                  }
                                }, 100);
                              }}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="size-4 mr-2"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                                />
                              </svg>
                              Ver todos
                            </Link>
                          </li>
                        </ul>
                      </div>
                    )}
                  </li>
                );
              }
              
              // Si es un enlace normal en versión móvil
              return (
                <li
                  key={index}
                  className={
                    isActive(item.path)
                      ? `${activeColorClass} ${activeFontWeight}`
                      : ""
                  }
                >
                  <Link
                    href={item.path}
                    className={`block py-3 px-4 text-base font-medium uppercase border-b border-gray-100 dark:border-gray-700 ${
                      isActive(item.path) 
                        ? activeColorClass 
                        : "text-gray-900 dark:text-white"
                    } ${hoverColorClass}`}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.title}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="w-full py-4 flex flex-col items-center mt-4">
            <div className="w-full flex justify-center items-center mb-4">
              {AdminToken ? (
                <DropdownAdminMobile toggleMenu={toggleMenu} />
              ) : ClientToken ? (
                <DropdownUserMobile toggleMenu={toggleMenu} />
              ) : (
                !AdminToken && (
                  <section className="flex">
                    <div>
                      <Link href="/tienda/login">
                        <div className="py-1 px-2 bg-primary uppercase text-xs hover:bg-secondary hover:text-primary rounded-md m-1 text-white">
                          Login
                        </div>
                      </Link>
                    </div>
                    <div>
                      <Link
                        className="p-2 hidden bg-primary uppercase text-xs hover:bg-secondary hover:text-primary rounded-md m-1 text-white"
                        href="/tienda/register"
                      >
                        Registrarse
                      </Link>
                    </div>
                  </section>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
