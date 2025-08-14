/* eslint-disable @next/next/no-img-element */
"use client";
import React from "react";
import { useLogo } from "@/context/LogoContext";

interface FooterPreviewProps {
  config: any;
  selectedTemplate: string;
}

// Íconos de redes sociales para el footer
const FooterInstagramIcon = ({ color }: { color: string }) => (
  <svg
    className="w-5 h-5"
    fill={color}
    viewBox="0 0 24 24"
  >
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

const FooterFacebookIcon = ({ color }: { color: string }) => (
  <svg
    className="w-5 h-5"
    fill={color}
    viewBox="0 0 24 24"
  >
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const FooterWhatsAppIcon = ({ color }: { color: string }) => (
  <svg
    className="w-5 h-5"
    fill={color}
    viewBox="0 0 24 24"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
  </svg>
);

const FooterLinkedInIcon = ({ color }: { color: string }) => (
  <svg
    className="w-5 h-5"
    fill={color}
    viewBox="0 0 24 24"
  >
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const FooterTikTokIcon = ({ color }: { color: string }) => (
  <svg
    className="w-5 h-5"
    fill={color}
    viewBox="0 0 24 24"
  >
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
  </svg>
);

// Función para obtener el ícono de red social
const getSocialNetworkIcon = (networkName: string, color: string) => {
  switch (networkName.toLowerCase()) {
    case "instagram":
      return <FooterInstagramIcon color={color} />;
    case "facebook":
      return <FooterFacebookIcon color={color} />;
    case "whatsapp":
      return <FooterWhatsAppIcon color={color} />;
    case "linkedin":
      return <FooterLinkedInIcon color={color} />;
    case "tiktok":
      return <FooterTikTokIcon color={color} />;
    default:
      return <FooterInstagramIcon color={color} />;
  }
};

// Función helper para obtener el estilo de fondo
const getBackgroundStyle = (config: any) => {
  if (config.backgroundImage?.enabled && config.backgroundImage?.url) {
    return {
      backgroundImage: `url(${config.backgroundImage.url})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      position: "relative" as const,
    };
  }
  return {
    backgroundColor: config.backgroundColor,
  };
};

// Componente de overlay para imagen de fondo
const BackgroundOverlay = ({ config }: { config: any }) => {
  if (
    !config.backgroundImage?.enabled ||
    !config.backgroundImage?.url ||
    !config.backgroundImage?.overlay?.enabled
  ) {
    return null;
  }

  return (
    <div
      className="absolute inset-0"
      style={{
        backgroundColor: config.backgroundColor, // Usar el color de fondo como overlay
        opacity: config.backgroundImage.overlay.opacity,
        zIndex: 1,
      }}
    />
  );
};

// Función para obtener el estilo del logo basada en logoSize (píxeles)
const getLogoStyle = (logoSize: number = 64) => {
  // logoSize ahora es directamente el valor en píxeles de altura
  // El ancho máximo será proporcional (altura * 2)
  const maxWidth = Math.round(logoSize * 2);
  return {
    height: `${logoSize}px`,
    maxWidth: `${maxWidth}px`,
  };
};

// Componente de vista previa para Footer02 (Moderno)
const Footer02Preview = ({ config, logo }: { config: any; logo: any }) => (
  <div
    className="p-4"
    style={getBackgroundStyle(config)}
  >
    <BackgroundOverlay config={config} />

    <div className="relative z-10">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Logo y Descripción */}
          {(config.showLogo || config.showDescription) && (
            <div className="lg:col-span-4">
              {config.showLogo && (
                <img
                  alt={process.env.NEXT_PUBLIC_NOMBRE_TIENDA}
                  className="object-contain mb-2"
                  style={getLogoStyle(config.logoSize)}
                  src={
                    logo?.mainImage?.url || process.env.NEXT_PUBLIC_LOGO_COLOR
                  }
                />
              )}
              {config.showDescription && config.description && (
                <p
                  className="text-xs leading-relaxed mb-3 max-w-[300px]"
                  style={{ color: config.textColor }}
                >
                  {config.description}
                </p>
              )}
            </div>
          )}

          {/* Contenido principal */}
          <div
            className={
              config.showLogo || config.showDescription
                ? "lg:col-span-8"
                : "lg:col-span-12"
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Enlaces del Menú Principal */}
              {config.showMenuLinks && config.menuItems && (
                <div>
                  <h3
                    className="text-sm font-semibold mb-2"
                    style={{ color: config.textColor }}
                  >
                    Navegación
                  </h3>
                  <ul className="space-y-1">
                    {config.menuItems.map((item: any, index: number) => (
                      <li key={index}>
                        <a
                          href={item.path}
                          className="text-xs hover:underline transition-colors block"
                          style={{ color: config.textColor }}
                        >
                          {item.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Enlaces Personalizados */}
              {config.showLinks && config.customLinks && (
                <div>
                  <h3
                    className="text-sm font-semibold mb-2"
                    style={{ color: config.textColor }}
                  >
                    Enlaces Útiles
                  </h3>
                  <ul className="space-y-1">
                    {config.customLinks
                      .filter((link: any) => link.enabled)
                      .map((link: any, index: number) => (
                        <li key={index}>
                          <a
                            href={link.url}
                            className="text-xs hover:underline transition-colors block"
                            style={{ color: config.textColor }}
                          >
                            {link.title}
                          </a>
                        </li>
                      ))}
                  </ul>
                </div>
              )}

              {/* Colecciones */}
              {config.showCollections &&
                config.collections &&
                config.collections.length > 0 && (
                  <div>
                    <h3
                      className="text-sm font-semibold mb-2"
                      style={{ color: config.textColor }}
                    >
                      Colecciones
                    </h3>
                    <ul className="space-y-1">
                      {config.collections
                        .slice(0, 3)
                        .map((collection: any, index: number) => (
                          <li key={collection.id || index}>
                            <a
                              href={`/tienda/colecciones/${
                                collection.slug ||
                                collection.title
                                  .toLowerCase()
                                  .replace(/\s+/g, "-")
                              }`}
                              className="text-xs hover:underline transition-colors block"
                              style={{ color: config.textColor }}
                            >
                              {collection.title}
                            </a>
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
            </div>
          </div>
        </div>

        {/* Copyright y Redes Sociales */}
        <div
          className="mt-4 pt-3 border-t"
          style={{ borderTopColor: config.accentColor }}
        >
          <div className="flex flex-col sm:flex-row sm:justify-between items-center gap-2">
            <p
              className="text-xs"
              style={{ color: config.textColor }}
            >
              © {new Date().getFullYear()}{" "}
              {process.env.NEXT_PUBLIC_NOMBRE_TIENDA || "Mi Tienda"} | Todos los
              derechos reservados.
            </p>

            {/* Redes Sociales */}
            {config.showSocial &&
              config.socialNetworks &&
              config.socialNetworks.some((network: any) => network.enabled) && (
                <div className="flex gap-3">
                  {config.socialNetworks
                    .filter((network: any) => network.enabled)
                    .map((network: any, index: number) => (
                      <a
                        key={index}
                        href={network.url}
                        className="p-2 rounded-full hover:bg-white hover:bg-opacity-10 transition-colors"
                        style={{ color: config.accentColor }}
                        title={network.name}
                      >
                        {getSocialNetworkIcon(network.name, config.accentColor)}
                      </a>
                    ))}
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Componente de vista previa para Footer03 (Minimalista)
const Footer03Preview = ({ config, logo }: { config: any; logo: any }) => (
  <div
    className="p-4"
    style={getBackgroundStyle(config)}
  >
    <BackgroundOverlay config={config} />

    <div className="relative z-10">
      <div className="max-w-4xl mx-auto text-center">
        {/* Logo y Descripción */}
        {(config.showLogo || config.showDescription) && (
          <div className="mb-3 text-center">
            {config.showLogo && (
              <img
                alt={process.env.NEXT_PUBLIC_NOMBRE_TIENDA}
                className="object-contain mx-auto mb-2"
                style={getLogoStyle(config.logoSize)}
                src={logo?.mainImage?.url || process.env.NEXT_PUBLIC_LOGO_COLOR}
              />
            )}
            {config.showDescription && config.description && (
              <p
                className="text-xs max-w-md mx-auto"
                style={{ color: config.textColor }}
              >
                {config.description}
              </p>
            )}
          </div>
        )}

        {/* Navegación organizada en secciones */}
        <div
          className={`mb-6 space-y-4 ${
            !(config.showLogo || config.showDescription) ? "pt-4" : ""
          }`}
        >
          {/* Enlaces del Menú Principal - Primera fila */}
          {config.showMenuLinks && config.menuItems && (
            <div className="text-center mb-4">
              <h4
                className="text-xs font-medium uppercase tracking-wider mb-2 opacity-70"
                style={{ color: config.textColor }}
              >
                Navegación
              </h4>
              <div className="flex flex-wrap justify-center gap-4">
                {config.menuItems.map((item: any, index: number) => (
                  <a
                    key={index}
                    href={item.path}
                    className="text-xs hover:underline transition-colors"
                    style={{ color: config.textColor }}
                  >
                    {item.title}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Enlaces Personalizados y Colecciones - Segunda fila */}
          <div className="flex flex-col sm:flex-row justify-center gap-6 sm:gap-8">
            {/* Enlaces Personalizados */}
            {config.showLinks &&
              config.customLinks &&
              config.customLinks.filter((link: any) => link.enabled).length >
                0 && (
                <div className="text-center">
                  <h4
                    className="text-xs font-medium uppercase tracking-wider mb-2 opacity-70"
                    style={{ color: config.textColor }}
                  >
                    Enlaces
                  </h4>
                  <div className="space-y-1">
                    {config.customLinks
                      .filter((link: any) => link.enabled)
                      .map((link: any, index: number) => (
                        <div key={index}>
                          <a
                            href={link.url}
                            className="text-xs hover:underline transition-colors block"
                            style={{ color: config.textColor }}
                          >
                            {link.title}
                          </a>
                        </div>
                      ))}
                  </div>
                </div>
              )}

            {/* Colecciones */}
            {config.showCollections &&
              config.collections &&
              config.collections.length > 0 && (
                <div className="text-center">
                  <h4
                    className="text-xs font-medium uppercase tracking-wider mb-2 opacity-70"
                    style={{ color: config.textColor }}
                  >
                    Colecciones
                  </h4>
                  <div className="space-y-1">
                    {config.collections
                      .slice(0, 4)
                      .map((collection: any, index: number) => (
                        <div key={collection.id || index}>
                          <a
                            href={`/tienda/colecciones/${
                              collection.slug ||
                              collection.title
                                .toLowerCase()
                                .replace(/\s+/g, "-")
                            }`}
                            className="text-xs hover:underline transition-colors block"
                            style={{ color: config.textColor }}
                          >
                            {collection.title}
                          </a>
                        </div>
                      ))}
                  </div>
                </div>
              )}
          </div>
        </div>

        {/* Copyright y Redes Sociales */}
        <div
          className="pt-4 mt-4 border-t"
          style={{ borderTopColor: config.accentColor }}
        >
          <div className="flex flex-col sm:flex-row sm:justify-between items-center gap-2">
            <p
              className="text-xs"
              style={{ color: config.textColor }}
            >
              © {new Date().getFullYear()}{" "}
              {process.env.NEXT_PUBLIC_NOMBRE_TIENDA || "Mi Tienda"} | Todos los
              derechos reservados.
            </p>

            {/* Redes Sociales */}
            {config.showSocial &&
              config.socialNetworks &&
              config.socialNetworks.some((network: any) => network.enabled) && (
                <div className="flex gap-3">
                  {config.socialNetworks
                    .filter((network: any) => network.enabled)
                    .map((network: any, index: number) => (
                      <a
                        key={index}
                        href={network.url}
                        className="p-2 rounded-full hover:bg-white hover:bg-opacity-10 transition-colors"
                        style={{ color: config.accentColor }}
                        title={network.name}
                      >
                        {getSocialNetworkIcon(network.name, config.accentColor)}
                      </a>
                    ))}
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default function FooterPreview({
  config,
  selectedTemplate,
}: FooterPreviewProps) {
  const { logo } = useLogo();

  const renderPreview = () => {
    switch (selectedTemplate) {
      case "Footer02":
        return (
          <Footer02Preview
            config={config}
            logo={logo}
          />
        );
      case "Footer03":
        return (
          <Footer03Preview
            config={config}
            logo={logo}
          />
        );
      default:
        return (
          <Footer02Preview
            config={config}
            logo={logo}
          />
        );
    }
  };

  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{
        backgroundColor:
          config.backgroundImage?.enabled && config.backgroundImage?.url
            ? "transparent"
            : config.backgroundColor,
      }}
    >
      {renderPreview()}
    </div>
  );
}
