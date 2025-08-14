/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Marquee from "react-fast-marquee";
import Image from "next/image";
import MailchimpForm from "@/components/Core/MailChimp/MailchimpForm";
import axios from "axios";
import { mainMenuConfig, socialConfig } from "@/app/config/menulinks";
import { slugify } from "@/app/utils/slugify";
import { useLogo } from "@/context/LogoContext";
import { useFooterConfig } from "@/hooks/useFooterConfig";

// Componentes de iconos SVG para redes sociales
const InstagramIcon = () => (
  <svg
    className="w-5 h-5"
    fill="currentColor"
    viewBox="0 0 24 24"
  >
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

const FacebookIcon = () => (
  <svg
    className="w-5 h-5"
    fill="currentColor"
    viewBox="0 0 24 24"
  >
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const WhatsAppIcon = () => (
  <svg
    className="w-5 h-5"
    fill="currentColor"
    viewBox="0 0 24 24"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
  </svg>
);

const LinkedInIcon = () => (
  <svg
    className="w-5 h-5"
    fill="currentColor"
    viewBox="0 0 24 24"
  >
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const TikTokIcon = () => (
  <svg
    className="w-5 h-5"
    fill="currentColor"
    viewBox="0 0 24 24"
  >
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
  </svg>
);

interface SocialNetwork {
  name: string;
  url: string;
  enabled: boolean;
  icon: React.ReactNode;
}

export default function Footer() {
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [collections, setCollections] = useState<any[]>([]);
  const [configuredSocialNetworks, setConfiguredSocialNetworks] = useState<
    SocialNetwork[]
  >([]);
  const { logo } = useLogo();
  const { config: footerConfig, loading: configLoading } = useFooterConfig();

  // Filtrar los enlaces del menú que son visibles
  const menuItems = mainMenuConfig.showInFooter
    ? mainMenuConfig.links.filter(
        (link) => link.isVisible && link.title !== "Colecciones"
      )
    : [];

  // Encontrar el enlace de colecciones
  const collectionsLink = mainMenuConfig.links.find(
    (link) => link.isDropdown && link.dropdownType === "collections"
  );

  // Función para obtener el icono correspondiente a una red social
  const getSocialNetworkIcon = (networkName: string) => {
    switch (networkName.toLowerCase()) {
      case "instagram":
        return <InstagramIcon />;
      case "facebook":
        return <FacebookIcon />;
      case "whatsapp":
        return <WhatsAppIcon />;
      case "linkedin":
        return <LinkedInIcon />;
      case "tiktok":
        return <TikTokIcon />;
      default:
        return <InstagramIcon />; // Icono por defecto
    }
  };

  // Cargar redes sociales configuradas
  const fetchSocialNetworks = async () => {
    try {
      // Usar la configuración del footer si está disponible
      if (
        footerConfig.socialNetworks &&
        footerConfig.socialNetworks.length > 0
      ) {
        const networksWithIcons = footerConfig.socialNetworks.map(
          (network: any) => ({
            ...network,
            icon: getSocialNetworkIcon(network.name),
          })
        );
        setConfiguredSocialNetworks(networksWithIcons);
        return;
      }

      // Fallback a la configuración anterior
      const contentBlockId =
        process.env.NEXT_PUBLIC_REDESSOCIALES_CONTENTBLOCK || "REDESSOCIALES";
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/content-blocks/${contentBlockId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`
      );

      if (response.data.contentBlock?.contentText) {
        const savedNetworks = JSON.parse(
          response.data.contentBlock.contentText
        );
        // Asignar los iconos correctos a las redes sociales cargadas
        const networksWithIcons = savedNetworks.map((network: any) => ({
          ...network,
          icon: getSocialNetworkIcon(network.name),
        }));
        setConfiguredSocialNetworks(networksWithIcons);
      }
    } catch (error) {
      console.error("Error cargando redes sociales configuradas:", error);
      // Si no se pueden cargar, usar las redes sociales por defecto
      setConfiguredSocialNetworks([]);
    }
  };

  // Filtrar las redes sociales configuradas que están habilitadas
  const enabledSocialNetworks = configuredSocialNetworks.filter(
    (network) => network.enabled && network.url
  );

  // Filtrar los enlaces de redes sociales que son visibles (fallback)
  const socialItems = socialConfig.showInFooter
    ? socialConfig.links.filter((link) => link.isVisible)
    : [];

  // Verificar qué secciones están disponibles
  const hasCollections = collections.length > 0 && collectionsLink;
  const hasSocial =
    enabledSocialNetworks.length > 0 ||
    (socialConfig.showInFooter && socialItems.length > 0);

  // Determinar el número de columnas para el grid
  const getGridColumns = () => {
    let count = 1; // Siempre tenemos al menos la columna de enlaces
    if (hasCollections) count++;
    if (hasSocial) count++;
    return count;
  };

  // Obtener la clase de grid basada en el número de columnas
  const getGridClass = () => {
    const columns = getGridColumns();
    switch (columns) {
      case 1:
        return "grid-cols-1";
      case 2:
        return "sm:grid-cols-2";
      case 3:
        return "sm:grid-cols-2 lg:grid-cols-3";
      default:
        return "sm:grid-cols-2 lg:grid-cols-3";
    }
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

  useEffect(() => {
    fetchCollections();
    fetchSocialNetworks();
  }, [footerConfig]);

  return (
    <footer
      className="flex items-center justify-center w-full"
      style={{ backgroundColor: footerConfig.backgroundColor }}
    >
      <div className="max-w-7xl w-full mx-auto py-16 px-6 sm:px-8 lg:py-20 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Logo y descripción */}
          {footerConfig.showLogo && (
            <div className="lg:col-span-4 flex flex-col items-center lg:items-start">
              <img
                alt={process.env.NEXT_PUBLIC_NOMBRE_TIENDA}
                className="h-40 object-fit object-contain  max-w-[150px] md:max-w-[250px]"
                src={logo?.mainImage?.url || process.env.NEXT_PUBLIC_LOGO_COLOR}
              />
              {footerConfig.description && (
                <p
                  className="mt-4 text-sm"
                  style={{ color: footerConfig.textColor }}
                >
                  {footerConfig.description}
                </p>
              )}
            </div>
          )}

          {/* Enlaces y contenido */}
          <div className={`lg:col-span-${footerConfig.showLogo ? "8" : "12"}`}>
            <div className={`grid ${getGridClass()} gap-8`}>
              {/* Enlaces del menú principal - siempre visible */}
              {footerConfig.showLinks && (
                <div className="text-center sm:text-left">
                  <h3
                    className="text-lg underline mb-6"
                    style={{ color: footerConfig.textColor }}
                  >
                    Enlaces
                  </h3>
                  <ul className="mt-4 space-y-3">
                    {footerConfig.customLinks
                      .filter((link) => link.enabled)
                      .map((link, index) => (
                        <li key={index}>
                          <Link
                            href={link.url}
                            className="text-base hover:underline uppercase"
                            style={{ color: footerConfig.textColor }}
                          >
                            {link.title}
                          </Link>
                        </li>
                      ))}
                    {/* Enlaces del menú principal como fallback */}
                    {footerConfig.customLinks.filter((link) => link.enabled)
                      .length === 0 &&
                      menuItems.map((item, index) => (
                        <li key={index}>
                          <Link
                            href={item.path}
                            className="text-base hover:underline uppercase"
                            style={{ color: footerConfig.textColor }}
                          >
                            {item.title}
                          </Link>
                        </li>
                      ))}
                  </ul>
                </div>
              )}

              {/* Colecciones - visible solo si hay colecciones */}
              {footerConfig.showCollections && hasCollections && (
                <div className="text-center sm:text-left">
                  <h3
                    className="text-lg underline mb-6"
                    style={{ color: footerConfig.textColor }}
                  >
                    {collectionsLink.title}
                  </h3>
                  <ul className="mt-4 space-y-3">
                    {collections.slice(0, 3).map((collection) => (
                      <li key={collection.id}>
                        <Link
                          href={`/tienda/colecciones/${slugify(
                            collection.title
                          )}`}
                          className="text-base hover:underline uppercase"
                          style={{ color: footerConfig.textColor }}
                        >
                          {collection.title}
                        </Link>
                      </li>
                    ))}
                    {collections.length > 3 && (
                      <li>
                        <Link
                          href="/tienda/colecciones"
                          className="text-base underline hover:no-underline uppercase"
                          style={{ color: footerConfig.textColor }}
                        >
                          Ver todas
                        </Link>
                      </li>
                    )}
                  </ul>
                </div>
              )}

              {/* Redes sociales - visible solo si hay redes sociales */}
              {footerConfig.showSocial && hasSocial && (
                <div className="text-center sm:text-left">
                  <h3
                    className="text-lg underline mb-6"
                    style={{ color: footerConfig.textColor }}
                  >
                    Síguenos
                  </h3>
                  <ul className="mt-4 space-y-4">
                    {/* Mostrar redes sociales configuradas primero */}
                    {enabledSocialNetworks.map((social, index) => (
                      <li
                        key={`configured-${index}`}
                        className="flex items-center justify-center sm:justify-start"
                      >
                        <a
                          href={social.url}
                          rel="noreferrer"
                          target="_blank"
                          className="transition-colors flex items-center"
                          style={{ color: footerConfig.accentColor }}
                        >
                          <span className="mr-2">{social.icon}</span>
                          <span className="text-base hover:underline uppercase">
                            {social.name}
                          </span>
                        </a>
                      </li>
                    ))}

                    {/* Mostrar redes sociales por defecto como fallback si no hay configuradas */}
                    {enabledSocialNetworks.length === 0 &&
                      socialItems.map((social, index) => (
                        <li
                          key={`fallback-${index}`}
                          className="flex items-center justify-center sm:justify-start"
                        >
                          <a
                            href={social.url}
                            rel="noreferrer"
                            target="_blank"
                            className="transition-colors flex items-center"
                            style={{ color: footerConfig.accentColor }}
                          >
                            <span className="mr-2">{social.icon}</span>
                            <span className="text-base hover:underline uppercase">
                              {social.platform}
                            </span>
                          </a>
                        </li>
                      ))}
                  </ul>
                </div>
              )}

              {/* Newsletter */}
              {footerConfig.showNewsletter && (
                <div className="text-center sm:text-left">
                  <h3
                    className="text-lg underline mb-4"
                    style={{ color: footerConfig.textColor }}
                  >
                    {footerConfig.newsletterTitle}
                  </h3>
                  <p
                    className="text-sm mb-4"
                    style={{ color: footerConfig.textColor }}
                  >
                    {footerConfig.newsletterDescription}
                  </p>
                  <div className="flex">
                    <input
                      type="email"
                      placeholder={footerConfig.newsletterPlaceholder}
                      className="flex-1 px-3 py-2 text-sm border rounded-l"
                    />
                    <button
                      className="px-4 py-2 text-sm text-white rounded-r"
                      style={{ backgroundColor: footerConfig.accentColor }}
                    >
                      Suscribir
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Pie de página con copyright */}
        <div className="mt-12 border-t border-gray-600 pt-8">
          <div className="flex flex-col sm:flex-row sm:justify-between items-center">
            <p
              className="text-xs text-center sm:text-left"
              style={{ color: footerConfig.textColor }}
            >
              {footerConfig.copyrightText}
            </p>

            {/* Redes sociales en versión móvil */}
            {footerConfig.showSocial && hasSocial && (
              <ul className="flex justify-center sm:justify-end gap-6 mt-4 sm:mt-0">
                {/* Mostrar redes sociales configuradas primero */}
                {enabledSocialNetworks.map((social, index) => (
                  <li key={`mobile-configured-${index}`}>
                    <a
                      href={social.url}
                      rel="noreferrer"
                      target="_blank"
                      className="transition hover:opacity-35"
                      style={{ color: footerConfig.accentColor }}
                    >
                      <span className="sr-only">{social.name}</span>
                      {social.icon}
                    </a>
                  </li>
                ))}

                {/* Mostrar redes sociales por defecto como fallback si no hay configuradas */}
                {enabledSocialNetworks.length === 0 &&
                  socialItems.map((social, index) => (
                    <li key={`mobile-fallback-${index}`}>
                      <a
                        href={social.url}
                        rel="noreferrer"
                        target="_blank"
                        className="transition hover:opacity-35"
                        style={{ color: footerConfig.accentColor }}
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

      {/* Modal de tabla de tallas */}
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
