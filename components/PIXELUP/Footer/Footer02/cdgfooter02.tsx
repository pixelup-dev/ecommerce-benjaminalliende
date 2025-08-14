/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import Marquee from "react-fast-marquee";
import Image from "next/image";
import MailchimpForm from "@/components/Core/MailChimp/MailchimpForm";
import { useState, useEffect } from "react";
import axios from "axios";

interface FooterProps {
  FooterData: {
    titulo: string;
    subtitulo: string;
    parrafo: string;
    img: string;
  };
}

const Footer: React.FC<FooterProps> = ({ FooterData }) => {
  const { titulo, subtitulo, parrafo, img } = FooterData;
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [pathname, setPathname] = useState("");
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const excludedIds = `${process.env.NEXT_PUBLIC_BANNER_NAVBAR}`;
  /*   [
    "1c0c6de9-65c9-4472-8eaa-7fc879abbd7d",
    "c89d287c-f23f-4a88-8778-cc02160469c0",
  ]; */
  const filteredCollections = collections
    .filter((collection) => !excludedIds.includes(collection.id))
    .sort((a, b) => a.title.localeCompare(b.title));

  useEffect(() => {
    if (typeof window !== "undefined") {
      setPathname(window.location.pathname);
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
      setError(error as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);


  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };


  return (
    <footer className="bg-background">
      <div className=" border-t border-gray-200"></div>
      <div className=" hidden md:block max-w-7xl  mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
        <div className="xl:grid xl:grid-cols-12 xl:gap-8 ">
          <div className="xl:col-span-2 space-y-8">
            <img
              alt={process.env.NEXT_PUBLIC_NOMBRE_TIENDA}
              className="h-40 object-cover mx-auto"
              src={process.env.NEXT_PUBLIC_LOGO_COLOR}
            />
          </div>
          <div className="justify-center text-center md:text-left xl:col-span-6 mt-12 grid grid-cols gap-8 xl:mt-0 mx-12">
            <div className="max-w-2xl md:grid md:grid-cols-2 md:gap-16 text-primary">
              <div>
                <ul className="uppercase space-y-2">
                  <li>
                    <Link
                      className="text-base hover:underline "
                      href="#"
                    >
                      Inicio
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="text-base hover:underline "
                      href="/tienda"
                    >
                      Tienda
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="text-base hover:underline "
                      href="/nosotros"
                    >
                      nosotros
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="text-base hover:underline "
                      href="/cotiza-tu-evento"
                    >
                      Cotiza tu evento
                    </Link>
                  </li>
                </ul>
              </div>
              {collections.length > 0 && (
                <div>

                  <ul className=" space-y-2 uppercase">
                    {collections.map((collection) => (
                      <li key={collection.id}>
                        <Link
                          href={`/tienda/colecciones/${collection.id}`}
                          className="text-base hover:underline"
                        >
                          {collection.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 lg:mt-0 w-full lg:w-72 flex flex-col items-center">
            <h4 className="text-base font-semibold leading-4 mb-2 uppercase">
              Síguenos en nuestras redes sociales
            </h4>
            <div className="w-full flex justify-center xl:justify-start space-x-6 mt-4">
              <a
                className="hover:text-secondary relative p-2 inline-flex items-center justify-center bg-primary hover:bg-secondary rounded-full"
                href="#"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-secondary hover:text-primary"
                >
                  <rect
                    width="20"
                    height="20"
                    x="2"
                    y="2"
                    rx="5"
                    ry="5"
                  />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line
                    x1="17.5"
                    x2="17.51"
                    y1="6.5"
                    y2="6.5"
                  />
                </svg>
              </a>
              <a
                className="hover:text-secondary relative p-2 inline-flex items-center justify-center bg-primary hover:bg-secondary rounded-full"
                href="#"
              >
                <svg
                  className="h-6 w-6 text-secondary hover:text-primary"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>
        <div className="pt-8 mt-8 border-t border-primary">
          <div className="flex justify-center space-x-6">
          </div>
          <div className="text-center text-base text-gray-500 ">
          &copy; {new Date().getFullYear()} {process.env.NEXT_PUBLIC_NOMBRE_TIENDA} | All rights reserved.
          </div>
        </div>
      </div>


      {/* MOBILE */}
      <div className="md:hidden pt-20 pb-20 space-y-1 px-6 text-3xl">
          <div className="flex-shrink-0 flex justify-center items-center">
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
            >
              <img
                className="w-48"
                src={process.env.NEXT_PUBLIC_LOGO_COLOR}
                alt={process.env.NEXT_PUBLIC_NOMBRE_TIENDA}
              />
            </Link>
          </div>

          <ul className="flex flex-col text-center pb-8">
            <li className={` ${pathname === "/" ? "text-primary" : ""}`}>
              <Link
                href="/"
                className="hover:text-primary text-base font-medium"
                onClick={() => setIsOpen(false)}
              >
                INICIO
              </Link>
            </li>
            <li className={` ${pathname === "/tienda" ? "text-primary" : ""}`}>
              <Link
                href="/tienda"
                className="hover:text-primary text-base font-medium"
                onClick={() => setIsOpen(false)}
              >
                TIENDA
              </Link>
            </li>
            <li className={`${pathname === "/" ? "text-primary" : ""}`}>
              <button
                className="relative items-center justify-center hover:text-primary text-base font-medium"
                onClick={toggleVisibility}
              >
                PRODUCTOS
                <div
                  className="absolute"
                  style={{ top: "3px", left: "121px" }}
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
                    {filteredCollections.map((collection) => (
                      <li
                        key={collection.id}
                        className={`${
                          pathname === "/tienda" ? "text-primary" : ""
                        }`}
                      >
                        <Link
                          href={`/tienda/colecciones/${collection.id}`}
                          className="hover:text-primary text-base font-medium uppercase"
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
                pathname ===
                "/tienda/colecciones/e2b1263f-7cd3-42b9-b08a-8d26e59d91d8"
                  ? "text-primary"
                  : ""
              }
            >
              <Link
                href="/tienda/colecciones/e2b1263f-7cd3-42b9-b08a-8d26e59d91d8"
                className="hover:text-primary text-base font-medium uppercase"
              >
                PROMOCIONES
              </Link>
            </li>
            <li className={pathname === "/nosotros" ? "text-primary" : ""}>
              <Link
                href="/nosotros"
                className="hover:text-primary text-base font-medium uppercase"
              >
                nosotros
              </Link>
            </li>
            <li
              className={pathname === "/cotiza-tu-evento" ? "text-primary" : ""}
            >
              <Link
                href="/cotiza-tu-evento"
                className="hover:text-primary text-base font-medium uppercase"
              >
                Cotiza Tu evento
              </Link>
            </li>
          </ul>
          <div className=" mt-8 lg:mt-0 w-full lg:w-72 flex flex-col items-center">
            <h4 className="text-base font-semibold leading-4 mb-2 uppercase">
              Síguenos en nuestras redes sociales
            </h4>
            <div className="w-full flex justify-center xl:justify-start space-x-6 mt-4">
              <a
                className="hover:text-secondary relative p-2 inline-flex items-center justify-center bg-primary hover:bg-secondary rounded-full"
                href={process.env.NEXT_PUBLIC_INSTAGRAM}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-secondary hover:text-primary"
                >
                  <rect
                    width="20"
                    height="20"
                    x="2"
                    y="2"
                    rx="5"
                    ry="5"
                  />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line
                    x1="17.5"
                    x2="17.51"
                    y1="6.5"
                    y2="6.5"
                  />
                </svg>
              </a>
              <a
                className="hover:text-secondary relative p-2 inline-flex items-center justify-center bg-primary hover:bg-secondary rounded-full"
                href={process.env.NEXT_PUBLIC_FACEBOOK}
              >
                <svg
                  className="h-6 w-6 text-secondary hover:text-primary"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>

    </footer>
  );
};

export default Footer;
