/* eslint-disable @next/next/no-img-element */

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Marquee from "react-fast-marquee";
import Image from "next/image";
import axios from "axios";

interface Footer03Props {
  Footer03Data: {
    titulo: string;
    subtitulo: string;
    parrafo: string;
    img: string;
  };
}

const Footer03: React.FC<Footer03Props> = ({ Footer03Data }) => {
  const { titulo, subtitulo, parrafo, img } = Footer03Data;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [collections, setCollections] = useState<any[]>([]);
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
  return (
    <div className="bg-background text-primary p-16 shadow-2xl border-t border-foreground/10">
      <div className="flex flex-col">
        <div className="flex justify-between items-start flex-wrap text-left mb-8 ">
          <div className="flex flex-col items-start justify-center mr-8">
            <img
              src={process.env.NEXT_PUBLIC_LOGO_COLOR}
              alt={process.env.NEXT_PUBLIC_NOMBRE_TIENDA}
              className="h-40"
            />
          </div>

          <div className="w-36 m-4 flex flex-col ">
            <h4 className="text-sm leading-4 mb-2 font-bold">Useful Links</h4>
            <a
              href="#"
              className=" hover:underline"
            >
              <p>Inicio</p>
            </a>
            <a
              href="#"
              className=" hover:underline"
            >
              <p>Contacto</p>
            </a>
            <a
              href="#"
              className=" hover:underline"
            >
              <p>Tallas</p>
            </a>
            <a
              href="#"
              className=" hover:underline"
            >
              <p>Cuentas</p>
            </a>
          </div>

          {/*           <div className="w-36 m-4 flex flex-col ">
            <h4 className="text-m leading-4 mb-2 font-bold">Tienda</h4>
            <a
              href="#"
              className=" hover:underline"
            >
              <p>Anillos</p>
            </a>
            <a
              href="#"
              className=" hover:underline"
            >
              <p>Aros</p>
            </a>
            <a
              href="#"
              className=" hover:underline"
            >
              <p>Colgantes</p>
            </a>
            <a
              href="#"
              className=" hover:underline"
            >
              <p>Pulseras</p>
            </a>
          </div> */}

          {collections.length > 0 && (
            <div className="w-36 m-4 flex flex-col">
              <h4 className="text-m leading-4 mb-2 font-bold">Colecciones</h4>
              <ul className="">
                {collections.map((collection) => (
                  <li key={collection.id}>
                    <Link
                      href={`/tienda/colecciones/${collection.id}`}
                      className="hover:underline"
                    >
                      <p> {collection.title}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="w-36 m-4 flex flex-col ">
            <h4 className="text-m leading-4 mb-2 font-bold">Colecciones</h4>
            <a
              href="#"
              className=" hover:underline"
            >
              <p>Cosmos</p>
            </a>
            <a
              href="#"
              className=" hover:underline"
            >
              <p>Diosa Madre</p>
            </a>
            <a
              href="#"
              className="hover:underline"
            >
              <p>Sagradas</p>
            </a>
            <a
              href="#"
              className="hover:underline"
            >
              <p>Serpiente Tribus</p>
            </a>
            <a
              href="#"
              className="hover:underline"
            >
              <p>Sellos</p>
            </a>
          </div>

          <div className="w-72 m-4 flex flex-col  items-center">
            <h4 className="text-m font-bold leading-4 mb-2">
              Síguenos en nuestras redes sociales
            </h4>
            <div className="flex justify-center space-x-6 mt-4">
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
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                  />
                  <path d="M19.13 5.09C15.22 9.14 10 10.44 2.25 10.94" />
                  <path d="M21.75 12.84c-6.62-1.41-12.14 1-16.38 6.32" />
                  <path d="M8.56 2.75c4.37 6 6 9.42 8 17.72" />
                </svg>
              </a>
              <a
                className="hover:text-secondary relative p-2 inline-flex items-center justify-center bg-primary hover:bg-secondary rounded-full"
                href={process.env.NEXT_PUBLIC_WHATSAPP}
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
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                </svg>
              </a>
              <a
                className="hover:text-secondary relative p-2 inline-flex items-center justify-center bg-primary hover:bg-secondary rounded-full"
                href={process.env.NEXT_PUBLIC_YOUTUBE}
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
                  <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
                  <path d="m10 15 5-3-5-3z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="flex justify-between mt-1">
          <div>
            <p>&copy; {new Date().getFullYear()} {process.env.NEXT_PUBLIC_NOMBRE_TIENDA}. All rights reserved.</p>
          </div>
          <div className="flex">
            <a href="#">
              <div>
                <p className="text-sm leading-4 ml-8 font-semibold">
                  Privacy Policy
                </p>
              </div>
            </a>
            <a href="#">
              <div>
                <p className="text-sm leading-4 ml-8 font-semibold">
                  Terms of Use
                </p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer03;
