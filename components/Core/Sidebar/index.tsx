/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import SidebarLinkGroup from "./SidebarLinkGroup";
import { sidebarLinks } from "../../../app/config/sidebarLinks";
import Image from "next/image";
import { UserData } from "@/types/UserData";
import { deleteCookie, getCookie } from "cookies-next";
import { jwtDecode } from "jwt-decode";
import { obtenerUsuarioPorID } from "@/app/utils/obtenerUsuarioID";
import axios from "axios";
import { useLogo } from "@/context/LogoContext";
import LogoEdit from "../LogoEdit/LogoEdit";

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (arg: boolean) => void;
}

const Sidebar = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {
  const pathname = usePathname();
  const trigger = useRef<any>(null);
  const sidebar = useRef<any>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [userDataInfo, setUserDataInfo] = useState<UserData>();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isLogoEditOpen, setIsLogoEditOpen] = useState(false);
  const router = useRouter();
  const token = getCookie("AdminTokenAuth")?.toString();
  const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null);
  const [menuEnabled, setMenuEnabled] = useState<boolean>(true);
  const { logo } = useLogo();

  useEffect(() => {
    if (!token) {
      router.push("/admin/login");
      return;
    }

    let decodedToken;
    try {
      decodedToken = jwtDecode<{ sub: string }>(token);
    } catch (error) {
      console.error("Error al decodificar el token:", error);
      router.push("/admin/login");
      return;
    }

    const userId = decodedToken.sub;

    const fetchData = async () => {
      try {
        const userData = await obtenerUsuarioPorID(userId, token);
        setUserDataInfo(userData.user);
      } catch (error) {
        console.error("Error al obtener el usuario:", error);
        router.push("/");
      }
    };

    fetchData();
  }, [token, router]);

  useEffect(() => {
    const fetchMenuOption = async () => {
      try {
        const contentBlockId = process.env.NEXT_PUBLIC_MENUOPTION_CONTENTBLOCK;
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/content-blocks/${contentBlockId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = response.data.contentBlock;
        const isEnabled = data.contentText !== "0" && data.contentText !== null;
        setMenuEnabled(isEnabled);
        if (!isEnabled) {
          setIsExpanded(true);
        }
      } catch (error) {
        console.error("Error al obtener la configuración del menú:", error);
      }
    };

    if (token) {
      fetchMenuOption();
    }
  }, [token]);

  useEffect(() => {
    if (sidebarOpen || !menuEnabled) {
      setIsExpanded(true);
    } else {
      const timer = setTimeout(() => {
        setIsExpanded(false);
        setOpenMenuIndex(null);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [sidebarOpen, menuEnabled]);

  const handleLogout = async () => {
    deleteCookie("AdminTokenAuth");
    router.push("/");
  };

  const handleLinkClick = (href: string) => {
    // Cerrar el menú en móvil
    setSidebarOpen(false);

    // Usar el router de Next.js para la navegación
    router.push(href);
  };

  useEffect(() => {
    const clickHandler = ({ target }: MouseEvent) => {
      if (!sidebar.current || !trigger.current) return;
      if (
        !sidebarOpen ||
        sidebar.current.contains(target) ||
        trigger.current.contains(target)
      )
        return;
      setSidebarOpen(false);
    };
    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  });

  useEffect(() => {
    const keyHandler = ({ key }: KeyboardEvent) => {
      if (!sidebarOpen || key !== "Escape") return;
      setSidebarOpen(false);
    };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  });

  const isAdminPixelUP = userDataInfo?.email === "hola.pixelup@gmail.com";

  // Función de utilidad para verificar si una ruta está activa
  const isRouteActive = (
    path: string,
    exact: boolean = false,
    submenuPaths: string[] = []
  ) => {
    // Normalizar las rutas eliminando el slash final si existe
    const normalizedPath = path.endsWith("/") ? path.slice(0, -1) : path;
    const normalizedPathname = pathname.endsWith("/")
      ? pathname.slice(0, -1)
      : pathname;

    // Caso especial para el dashboard
    if (
      normalizedPath === "/dashboard" &&
      normalizedPathname === "/dashboard"
    ) {
      return true;
    }

    if (exact) {
      return normalizedPathname === normalizedPath;
    }

    // Verificar si la ruta actual coincide con alguna de las rutas del submenú
    if (submenuPaths.length > 0) {
      return submenuPaths.some((submenuPath) => {
        const normalizedSubmenuPath = submenuPath.endsWith("/")
          ? submenuPath.slice(0, -1)
          : submenuPath;
        return (
          normalizedPathname === normalizedSubmenuPath ||
          normalizedPathname.startsWith(normalizedSubmenuPath + "/")
        );
      });
    }

    // Para rutas con submenu, verificamos si la ruta actual comienza con la ruta del menú
    return normalizedPathname.startsWith(normalizedPath);
  };

  const renderLink = (link: (typeof sidebarLinks)[0], index: number) => {
    if (link.isVisible === false) return null;

    if (
      (link.title === "Opciones de Cuenta" || link.title === "Creación IDs") &&
      !isAdminPixelUP
    ) {
      return null;
    }

    if (link.submenu) {
      const visibleSubmenu = link.submenu
        .filter((sublink) => sublink.isVisible !== false)
        .filter((sublink) => {
          if (
            (sublink.title === "Opciones de Cuenta" ||
              sublink.title === "Creación IDs") &&
            !isAdminPixelUP
          ) {
            return false;
          }
          return true;
        });

      if (visibleSubmenu.length === 0) return null;

      // Obtener todas las rutas del submenú
      const submenuPaths = visibleSubmenu.map((sublink) => sublink.path);

      return (
        <SidebarLinkGroup
          activeCondition={isRouteActive(link.path, false, submenuPaths)}
          isExpanded={isExpanded || isHovered}
          isOpen={openMenuIndex === index}
          setIsOpen={(open) => {
            setOpenMenuIndex(open ? index : null);
          }}
        >
          {(handleClick, open) => (
            <React.Fragment>
              <Link
                href="#"
                className={`group relative flex items-center gap-3 rounded-lg py-2.5 px-4 font-medium text-white duration-300 ease-in-out hover:bg-black/10 ${
                  isRouteActive(link.path, false, submenuPaths) &&
                  "bg-secondary/10"
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  handleClick();
                }}
              >
                <div className="min-w-max">{link.icon}</div>
                <span
                  className={`whitespace-nowrap transition-all text-[14px] duration-300 ease-in-out ${
                    !isExpanded && !isHovered
                      ? "opacity-0 -translate-x-10"
                      : "opacity-100 translate-x-0"
                  }`}
                >
                  {link.title}
                </span>
                <svg
                  className={`absolute right-4 top-1/2 -translate-y-1/2 fill-current transition-all duration-300 ease-in-out ${
                    open ? "rotate-180" : ""
                  } ${
                    !isExpanded && !isHovered
                      ? "opacity-0 -translate-x-10"
                      : "opacity-100 translate-x-0"
                  }`}
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M4.41107 6.9107C4.73651 6.58527 5.26414 6.58527 5.58958 6.9107L10.0003 11.3214L14.4111 6.91071C14.7365 6.58527 15.2641 6.58527 15.5896 6.91071C15.915 7.23614 15.915 7.76378 15.5896 8.08922L10.5896 13.0892C10.2641 13.4147 9.73651 13.4147 9.41107 13.0892L4.41107 8.08922C4.08563 7.76378 4.08563 7.23614 4.41107 6.9107Z"
                    fill=""
                  />
                </svg>
              </Link>
              <div
                className={`overflow-hidden transition-[max-height] duration-300 ease-in-out ${
                  open ? "max-h-[500px]" : "max-h-0"
                }`}
              >
                <ul className="mt-2 mb-3 flex flex-col gap-2 pl-6">
                  {visibleSubmenu.map((sublink, index) => (
                    <li key={index}>
                      <Link
                        href={sublink.path}
                        className={`group relative flex items-center gap-3 rounded-lg py-2 px-3 font-medium text-white duration-300 ease-in-out hover:bg-black/10 ${
                          isRouteActive(sublink.path, true) && "bg-black/10"
                        }`}
                        onClick={() => {
                          handleLinkClick(sublink.path);
                          setOpenMenuIndex(null);
                        }}
                      >
                        <div className="min-w-max">{sublink.icon}</div>
                        <span
                          className={`whitespace-nowrap transition-all text-[14px] duration-300 ease-in-out ${
                            !isExpanded && !isHovered
                              ? "opacity-0 -translate-x-10"
                              : "opacity-100 translate-x-0"
                          }`}
                        >
                          {sublink.title}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </React.Fragment>
          )}
        </SidebarLinkGroup>
      );
    }

    return (
      <li>
        <Link
          href={link.path}
          className={`group relative flex items-center gap-2 rounded-lg py-2 px-4 font-medium text-white duration-300 ease-in-out hover:bg-black/10 ${
            isRouteActive(link.path, true) && "bg-secondary/10"
          }`}
          onClick={() => handleLinkClick(link.path)}
        >
          <div className="min-w-max">{link.icon}</div>
          <span
            className={`whitespace-nowrap text-[14px] transition-all duration-300 ease-in-out ${
              !isExpanded && !isHovered
                ? "opacity-0 -translate-x-10"
                : "opacity-100 translate-x-0"
            }`}
          >
            {link.title}
          </span>
        </Link>
      </li>
    );
  };

  return (
    <>
      {/* Botón flotante para móvil - solo mostrar si el menú está habilitado */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed bottom-6 right-6 z-50 rounded-full bg-primary p-3 shadow-lg lg:hidden"
      >
        {sidebarOpen ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6 text-white"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6 text-white"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
            />
          </svg>
        )}
      </button>

      <aside
        ref={sidebar}
        onMouseEnter={() => menuEnabled && setIsHovered(true)}
        onMouseLeave={() => {
          if (menuEnabled) {
            const timer = setTimeout(() => {
              setIsHovered(false);
              setUserDropdownOpen(false);
              setOpenMenuIndex(null);
            }, 100);
            return () => clearTimeout(timer);
          }
        }}
        className={`fixed top-0 left-0 ${
          sidebarOpen ? "z-[99999]" : "z-40"
        } flex h-screen ${
          !menuEnabled || sidebarOpen || isExpanded || isHovered
            ? "w-[280px]"
            : "w-[60px]"
        } flex-col overflow-hidden bg-primary shadow-lg transition-all duration-300 ease-in-out lg:static lg:h-screen lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } ${
          !menuEnabled || isExpanded || isHovered
            ? "lg:w-[280px]"
            : "lg:w-[60px]"
        }`}
      >
        {/* SIDEBAR HEADER - Fixed */}
        <div
          className={`relative flex-shrink-0 flex flex-col items-center border-b border-white/10 ${
            sidebarOpen ? "block py-2" : "block"
          } lg:block ${isExpanded || isHovered ? "pb-8 pt-8" : "py-4"}`}
        >
          {/* Botón de cierre para móvil */}
          {sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 text-white lg:hidden"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}

          <div className="flex w-full items-center justify-between px-3">
            <Link
              href="/"
              target="_blank"
              className={`flex items-center ${
                isExpanded || isHovered || sidebarOpen
                  ? "w-full justify-center"
                  : ""
              }`}
            >
              <div
                className={`relative ${
                  isExpanded || isHovered || sidebarOpen
                    ? "h-20 lg:h-20"
                    : "h-10"
                } ${
                  isExpanded || isHovered || sidebarOpen
                    ? "w-[200px] lg:w-[280px]"
                    : "w-[120px]"
                }`}
              >
                <div
                  className={`absolute left-0 top-1/2 -translate-y-1/2 transition-all duration-300 ease-in-out ${
                    !isExpanded && !isHovered && !sidebarOpen
                      ? "opacity-100"
                      : "opacity-0"
                  }`}
                >
                  <img
                    src={
                      logo?.mainImage?.url ||
                      process.env.NEXT_PUBLIC_LOGO ||
                      "Logo Principal"
                    }
                    alt={
                      process.env.NEXT_PUBLIC_NOMBRE_TIENDA || "Logo Principal"
                    }
                    className="w-8 h-8 object-contain"
                  />
                </div>
                <div
                  className={`absolute ${
                    isExpanded || isHovered || sidebarOpen
                      ? "left-1/2 -translate-x-1/2"
                      : "left-0"
                  } top-1/2 -translate-y-1/2 transition-all duration-300 ease-in-out ${
                    isExpanded || isHovered || sidebarOpen
                      ? "opacity-100"
                      : "opacity-0"
                  }`}
                >
                  <div className="relative">
                    <img
                      src={
                        logo?.mainImage?.url ||
                        process.env.NEXT_PUBLIC_LOGO ||
                        "Logo Principal"
                      }
                      alt={
                        process.env.NEXT_PUBLIC_NOMBRE_TIENDA ||
                        "Logo Principal"
                      }
                      className={`object-contain ${
                        isExpanded || isHovered || sidebarOpen
                          ? "w-40 lg:w-60 scale-110"
                          : "w-60 scale-100"
                      } transition-transform duration-300`}
                    />
                    {(isExpanded || isHovered || sidebarOpen) && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          setIsLogoEditOpen(true);
                        }}
                        className="absolute bottom-0 right-0 bg-white text-black p-1 rounded-full shadow-lg hover:bg-secondary transition-colors duration-300"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-4 h-4"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </Link>

            {/* Modificar el botón de expansión para que solo sea visible si el menú está habilitado */}
            {menuEnabled && (
              <button
                ref={trigger}
                onClick={() => setIsExpanded(!isExpanded)}
                aria-controls="sidebar"
                aria-expanded={isExpanded}
                className={`block transition-all duration-300 ease-in-out lg:hidden ${
                  !isExpanded && !isHovered ? "opacity-0" : "opacity-100"
                }`}
              >
                <svg
                  className="fill-current"
                  width="20"
                  height="18"
                  viewBox="0 0 20 18"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M19 8.175H2.98748L9.36248 1.6875C9.69998 1.35 9.69998 0.825 9.36248 0.4875C9.02498 0.15 8.49998 0.15 8.16248 0.4875L0.399976 8.3625C0.0624756 8.7 0.0624756 9.225 0.399976 9.5625L8.16248 17.4375C8.31248 17.5875 8.53748 17.7 8.76248 17.7C8.98748 17.7 9.17498 17.625 9.36248 17.475C9.69998 17.1375 9.69998 16.6125 9.36248 16.275L3.02498 9.8625H19C19.45 9.8625 19.825 9.4875 19.825 9.0375C19.825 8.55 19.45 8.175 19 8.175Z"
                    fill=""
                  />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Main Content Area - Scrollable */}
        <div className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden sidebar-scroll">
          {/* Navigation Menu */}
          <div className="flex flex-1">
            <nav className="w-full pb-4 pt-8">
              <div>
                <ul className="flex flex-col">
                  {sidebarLinks
                    .filter((link) => link.isVisible !== false)
                    .filter((link) => {
                      if (
                        (link.title === "Opciones de Cuenta" ||
                          link.title === "Creación IDs") &&
                        !isAdminPixelUP
                      ) {
                        return false;
                      }
                      return true;
                    })
                    .map((link, index) => (
                      <React.Fragment key={index}>
                        {renderLink(link, index)}
                      </React.Fragment>
                    ))}
                </ul>
              </div>
            </nav>
          </div>
        </div>

        {/* User Profile Section - Fixed at bottom */}
        <div className="flex-shrink-0 border-t border-white/10">
          {/* Botón Ir a tienda */}
          <Link
            href="/tienda"
            target="_blank"
            className={`text-center justify-center mt-4 mx-auto flex items-center text-sm gap-2 rounded-lg py-1.5 px-2 font-medium text-white hover:bg-black/10 transition-all duration-300 ${
              !isExpanded && !isHovered
                ? "w-[40px] justify-center"
                : "w-[150px] border border-white "
            }`}
          >
            <span
              className={` whitespace-nowrap transition-all duration-300 ease-in-out ${
                !isExpanded && !isHovered
                  ? "opacity-0 -translate-x-10"
                  : "opacity-100 translate-x-0"
              }`}
            >
              Ir a la tienda
            </span>
          </Link>
          <button
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className={`flex items-center gap-3 ${
              !isExpanded && !isHovered
                ? "h-[48px] justify-center px-0"
                : "py-3 px-4"
            } w-full hover:bg-black/10`}
          >
            <span
              className={`rounded-full flex items-center justify-center bg-gray-200 ${
                !isExpanded && !isHovered ? "h-5 w-5" : "h-7 w-8"
              }`}
            >
              {userDataInfo?.avatarUrl ? (
                <img
                  src={userDataInfo.avatarUrl}
                  alt="Avatar"
                  className="h-full w-full rounded-full"
                />
              ) : (
                <img
                  src="/img/perfil.webp"
                  alt="Avatar"
                  className="h-full w-full rounded-full"
                />
              )}
            </span>

            {(isExpanded || isHovered) && (
              <div className="flex items-center justify-between w-full">
                <div className="flex flex-col transition-all duration-300 ease-in-out">
                  <span className="text-xs font-medium text-white">
                    {userDataInfo?.firstname} {userDataInfo?.lastname}
                  </span>
                  {!(
                    userDataInfo?.firstname === "Admin" &&
                    userDataInfo?.lastname === "PixelUP"
                  ) && (
                    <span className="text-[11px] text-white/70">
                      {userDataInfo?.email}
                    </span>
                  )}
                </div>
                <svg
                  className={`w-4 h-4 text-white transition-transform duration-300 ${
                    userDropdownOpen ? "rotate-180" : ""
                  }`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            )}
          </button>

          {(isExpanded || isHovered) && (
            <div
              className={`${
                userDropdownOpen ? "block" : "hidden"
              } py-3 px-4 bg-black/10`}
            >
              <ul className="flex flex-col gap-2.5">
                <li>
                  <Link
                    href="/dashboard/usuarios"
                    className="flex items-center gap-3 text-xs text-white hover:text-white/70 py-1"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="size-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                      />
                    </svg>
                    Configuración
                  </Link>
                </li>
                <li>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 text-xs text-white hover:text-white/70 py-1 w-full"
                  >
                    <svg
                      className="fill-current size-5"
                      width="20"
                      height="20"
                      viewBox="0 0 22 22"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M15.5375 0.618744H11.6531C10.7594 0.618744 10.0031 1.37499 10.0031 2.26874V4.64062C10.0031 5.05312 10.3469 5.39687 10.7594 5.39687C11.1719 5.39687 11.55 5.05312 11.55 4.64062V2.23437C11.55 2.16562 11.5844 2.13124 11.6531 2.13124H15.5375C16.3625 2.13124 17.0156 2.78437 17.0156 3.60937V18.3562C17.0156 19.1812 16.3625 19.8344 15.5375 19.8344H11.6531C11.5844 19.8344 11.55 19.8 11.55 19.7312V17.3594C11.55 16.9469 11.2062 16.6031 10.7594 16.6031C10.3125 16.6031 10.0031 16.9469 10.0031 17.3594V19.7312C10.0031 20.625 10.7594 21.3812 11.6531 21.3812H15.5375C17.2219 21.3812 18.5625 20.0062 18.5625 18.3562V3.64374C18.5625 1.95937 17.1875 0.618744 15.5375 0.618744Z"
                        fill=""
                      />
                      <path
                        d="M6.05001 11.7563H12.2031C12.6156 11.7563 12.9594 11.4125 12.9594 11C12.9594 10.5875 12.6156 10.2438 12.2031 10.2438H6.08439L8.21564 8.07813C8.52501 7.76875 8.52501 7.2875 8.21564 6.97812C7.90626 6.66875 7.42501 6.66875 7.11564 6.97812L3.67814 10.4844C3.36876 10.7938 3.36876 11.275 3.67814 11.5844L7.11564 15.0906C7.25314 15.2281 7.45939 15.3312 7.66564 15.3312C7.87189 15.3312 8.04376 15.2625 8.21564 15.125C8.52501 14.8156 8.52501 14.3344 8.21564 14.025L6.05001 11.7563Z"
                        fill=""
                      />
                    </svg>
                    Cerrar Sesión
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </aside>

      {/* Agregar el modal de edición de logo */}
      {isLogoEditOpen && (
        <div className="fixed inset-0 z-[99999] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 sticky top-0 bg-white pb-4">
              <h2 className="text-xl font-bold">Editar Logo</h2>
              <button
                onClick={() => setIsLogoEditOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <LogoEdit onClose={() => setIsLogoEditOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
