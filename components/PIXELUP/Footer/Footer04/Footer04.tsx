/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Marquee from "react-fast-marquee";
import Image from "next/image";
import MailchimpForm from "@/components/Core/MailChimp/MailchimpForm";
import axios from "axios";
import { mainMenuConfig, socialConfig } from "@/app/config/menulinks";

export default function Footer() {
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [collections, setCollections] = useState<any[]>([]);

  // Filtrar los enlaces del menú que son visibles
  const menuItems = mainMenuConfig.showInFooter
    ? mainMenuConfig.links.filter((link) => link.isVisible)
    : [];

  // Filtrar los enlaces de redes sociales que son visibles
  const socialItems = socialConfig.showInFooter
    ? socialConfig.links.filter((link) => link.isVisible)
    : [];

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
    <footer className="bg-primary flex items-center justify-center w-full">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
        <div className="xl:grid xl:grid-cols-12 xl:gap-8">
          <div className="xl:col-span-2 space-y-8">
            <img
              alt={process.env.NEXT_PUBLIC_NOMBRE_TIENDA}
              className="h-40 object-cover mx-auto"
              src={process.env.NEXT_PUBLIC_LOGO_COLOR}
            />
          </div>
          <div className="block md:hidden col-span-2 lg:col-span-3 ml-auto md:mt-10 lg:mt-0 mt-8 text-secondary">
            <div className="max-w-md mx-auto w-full px-4 lg:px-0">
              <h3 className="text-sm font-bold tracking-wider uppercase justify-center text-center">
                Suscríbete al newsletter y entérate de novedades y descuentos
                especiales
              </h3>
              <MailchimpForm />
            </div>
          </div>
          <div className="text-center lg:text-left xl:col-span-6 mt-6 md:mt-12 grid grid-cols gap-8 xl:mt-0 mx-12">
            <div className="md:grid md:grid-cols-3 md:gap-16 text-secondary">
              <div>
                <ul className="mt-4 space-y-2">
                  {menuItems.map((item, index) => (
                    <li key={index}>
                      <Link
                        href={item.path}
                        className="text-base hover:underline uppercase"
                      >
                        {item.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {collections.length > 0 && (
                <div>
                  <ul className="mt-4 space-y-2">
                    {collections.map((collection) => (
                      <li key={collection.id}>
                        <Link
                          href={`/tienda/colecciones/${collection.id}`}
                          className="text-base hover:underline uppercase"
                        >
                          {collection.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div>
                <ul className="mt-4 space-y-2">
                  <li>
                    <button
                      className="hover:underline text-base font-medium"
                      onClick={() => setShowModal(true)}
                    >
                      TALLAS
                    </button>
                  </li>
                  <li>
                    <a
                      className="text-base hover:underline "
                      href="/"
                    >
                      NOSOTROS
                    </a>
                  </li>
                  <li>
                    <a
                      className="text-base hover:underline "
                      target="_blank"
                      href={process.env.NEXT_PUBLIC_WHATSAPP_LINK}
                    >
                      CONTACTO
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="hidden md:block col-span-2 lg:col-span-3 lg:flex ml-auto md:mt-10 lg:mt-0 mt-8 text-secondary">
            <div className="max-w-md mx-auto w-full px-4 lg:px-0">
              <h3 className="text-sm font-bold tracking-wider uppercase justify-center text-center">
                Suscríbete al newsletter y entérate de novedades y descuentos
                especiales
              </h3>
              <MailchimpForm />
            </div>
          </div>
        </div>
        {/* Redes sociales y compañia registrada */}
        <div className="mt-8 border-t border-gray-100 pt-8 md:ml-0 ml-4">
          <div className="sm:flex sm:justify-between">
            <p className="text-xs text-gray-200">
              &copy; {new Date().getFullYear()}{" "}
              {process.env.NEXT_PUBLIC_NOMBRE_TIENDA} | All rights reserved.
            </p>

            {socialConfig.showInFooter && (
              <ul className="col-span-2 flex justify-start gap-6 lg:col-span-5 lg:justify-end md:mt-0 mt-4">
                {socialItems.map((social, index) => (
                  <li key={index}>
                    <a
                      href={social.url}
                      rel="noreferrer"
                      target="_blank"
                      className="text-secondary transition hover:opacity-35"
                    >
                      <span className="sr-only">{social.platform}</span>
                      {social.icon}
                    </a>
                  </li>
                ))}
              </ul>
            )}
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
    </footer>
  );
}
