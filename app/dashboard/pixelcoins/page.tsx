"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { getCookie } from "cookies-next";
import toast from "react-hot-toast";

interface CreditSummary {
  customerId: string;
  creditsBalance: number;
  creditsAboutToExpire: number;
  nearestExpirationDate: string;
  lastUpdated: string;
}

interface CreditMovement {
  id: string;
  type: string;
  amount: number;
  description: string;
  creationDate: string;
  project?: {
    id: string;
    name: string;
  };
}

const CreditChecker = () => {
  const [creditSummaries, setCreditSummaries] = useState<CreditSummary[]>([]);
  const [creditMovements, setCreditMovements] = useState<CreditMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [paginatedMovements, setPaginatedMovements] = useState<CreditMovement[]>([]);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const fetchCreditsAndMovements = async () => {
      try {
        const token = getCookie("AdminTokenAuth");
        const siteId = process.env.NEXT_PUBLIC_API_URL_SITEID;

        const [creditResponse, movementsResponse] = await Promise.all([
          axios.get(
            `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/credits?siteId=${siteId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          ),
          axios.get(
            `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/credits/movements?pageNumber=1&pageSize=50&siteId=${siteId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          ),
        ]);

        setCreditSummaries(creditResponse.data.creditSummaries || []);
        setCreditMovements(movementsResponse.data.creditMovements || []);
      } catch (error) {
        setError("Error fetching credits or movements.");
        console.error("Error fetching credits or movements:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCreditsAndMovements();
  }, []);

  useEffect(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    setPaginatedMovements(creditMovements.slice(startIndex, endIndex));
    setTotalPages(Math.ceil(creditMovements.length / pageSize));
  }, [creditMovements, currentPage, pageSize]);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const formatCLP = (amount: number) => {
    return new Intl.NumberFormat("es-CL").format(amount);
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(
        process.env.NEXT_PUBLIC_REFFERAL_CODE || ""
      );
      toast.success("¡Código copiado al portapapeles!", {
        duration: 3000,
        position: "top-center",
      });
    } catch (err) {
      toast.error("Error al copiar el código");
    }
  };

  const shareOnWhatsApp = () => {
    const text = `¡Usa mi código de referido en PixelUp!: ${process.env.NEXT_PUBLIC_REFFERAL_CODE}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const shareOnTwitter = () => {
    const text = `¡Usa mi código de referido en PixelUp!: ${process.env.NEXT_PUBLIC_REFFERAL_CODE}`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      text
    )}`;
    window.open(url, "_blank");
  };

  const shareOnFacebook = () => {
    const text = `¡Usa mi código de referido en PixelUp!: ${process.env.NEXT_PUBLIC_REFFERAL_CODE}`;

    const facebookShareUrl =
      "https://www.facebook.com/dialog/share?" +
      "app_id=966242223397117" + // Este es un app_id genérico de prueba
      "&display=popup" +
      "&href=" +
      encodeURIComponent(window.location.href) +
      "&quote=" +
      encodeURIComponent(text) +
      "&hashtag=" +
      encodeURIComponent(text);

    window.open(facebookShareUrl, "_blank");
  };

  const getMovementTypeDisplay = (type: string) => {
    const typeMap: Record<string, string> = {
      WITHDRAWAL: "CARGO",
      PAYMENT: "ABONO"
    };
    return typeMap[type] || type;
  };

  const getMovementDescriptionDisplay = (description: string) => {
    const descriptionMap: Record<string, string> = {
      "Exchange generation": "Canje PixelCoins"
    };

    // Si está en el mapa de descripciones, retorna directamente
    if (descriptionMap[description]) {
      return descriptionMap[description];
    }

    // Para el caso de Subscription commerce
    if (description.includes("Subscription commerce")) {
      // Reemplaza "Subscription commerce" por "Recompensa Suscripción" y elimina el [Order ID...]
      return description
        .replace("Subscription commerce reward", "Recompensa Suscripción")
        .replace(/\[Order ID:.*?\]/g, "")
        .trim();
    }

    return description;
  };

  return (
    <div className="min-h-screen ">
      <title>PixelCoins</title>
      <section className="mx-auto p-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">
          Mis PixelCoins
        </h1>


        {loading ? (
          <div className="bg-white p-8 rounded-lg shadow-md">
            <p className="text-gray-600">Cargando información...</p>
          </div>
        ) : error ? (
          <div className="bg-white p-8 rounded-lg shadow-md">
            <p className="text-red-500 font-medium">{error}</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Sección de Resumen */}
            {creditSummaries.length > 0 && (
              <div>
                {creditSummaries.map((summary) => (
                  <div
                    key={summary.customerId}
                    className="bg-white p-8 rounded-xl shadow-md"
                  >
                    <h2 className="text-2xl font-bold mb-2 text-gray-800">
                      Resumen de PixelCoins
                    </h2>

                    
        <div className="py-7 flex items-center p-4 mb-4 text-sm text-blue-800 border border-blue-300 rounded-lg bg-blue-50 dark:bg-gray-800 dark:text-blue-400 dark:border-blue-800" role="alert">
          <svg className="shrink-0 inline w-4 h-4 me-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"/>
          </svg>
          <span className="sr-only">Info</span>
          <div>
            <span className="font-bold">¡Importante!</span> Los PixelCoins se actualizan 1 vez al día.
          </div>
        </div>


                    {summary.creditsBalance === 0 ? (
                      <div className="flex flex-col md:flex-row gap-8">
                        <div className="flex-1 p-6 rounded-xl bg-gray-50 hover:scale-105 transition-all duration-300 border border-gray-200 shadow-sm">
                          <div className="space-y-6">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-700 mb-3">
                                Balance Actual
                              </h3>
                              <p className="text-3xl font-bold text-rosa">
                                0
                              </p>
                            </div>
                            <div>
                              <h3 className="text-sm font-medium text-gray-600">
                                Última Actualización
                              </h3>
                              <p className="text-gray-800 mt-1">
                                {new Date(summary.lastUpdated).toLocaleString()}
                              </p>
                
                            </div>
                            
                          </div>
                        </div>

                        <div className="flex-1 p-6 rounded-xl bg-gray-50 hover:scale-105 transition-all duration-300 border border-gray-200 shadow-sm">
                          <div className="space-y-6">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-700 mb-3">
                                Información de Expiración
                              </h3>
                              <div className="space-y-4">
                                <div>
                                  <p className="text-sm font-medium text-gray-600">
                                    PixelCoins por Expirar
                                  </p>
                                  <p className="text-2xl font-semibold text-dark mt-1">
                                    {formatCLP(summary.creditsAboutToExpire)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-600">
                                    Fecha de Expiración más cercana
                                  </p>
                                  <p className="text-gray-800 mt-1">
                                    {new Date(
                                      summary.nearestExpirationDate
                                    ).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col md:flex-row gap-8">
                        <div className="flex-1 p-6 rounded-xl bg-gray-50 hover:scale-105 transition-all duration-300 border border-gray-200 shadow-sm">
                          <div className="space-y-6">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-700 mb-3">
                                Balance Actual
                              </h3>
                              <p className="text-3xl font-bold text-rosa">
                                {formatCLP(summary.creditsBalance)}
                              </p>
                            </div>
                            <div>
                              <h3 className="text-sm font-medium text-gray-600">
                                Última Actualización
                              </h3>
                              <p className="text-gray-800 mt-1">
                                {new Date(summary.lastUpdated).toLocaleString()}
                              </p>
                            </div>
                            
                          </div>
                        </div>

                        <div className="flex-1 p-6 rounded-xl bg-gray-50 hover:scale-105 transition-all duration-300 border border-gray-200 shadow-sm">
                          <div className="space-y-6">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-700 mb-3">
                                Información de Expiración
                              </h3>
                              <div className="space-y-4">
                                <div>
                                  <p className="text-sm font-medium text-gray-600">
                                    PixelCoins por Expirar
                                  </p>
                                  <p className="text-2xl font-semibold text-dark mt-1">
                                    {formatCLP(summary.creditsAboutToExpire)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-600">
                                    Fecha de Expiración más cercana
                                  </p>
                                  <p className="text-gray-800 mt-1">
                                    {new Date(
                                      summary.nearestExpirationDate
                                    ).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                      </div>
                      
                    )}
                            <h1 className="text-sm text-center mt-6">
              *Si tienes más de un Sitio Web, aquí se mostrará el total de PixelCoins acomulados en todos tus sitios. 
            </h1>
                  </div>
                ))}
              </div>
            )}

            {/* Sección de Código de Referido */}
            <div className="bg-white p-8 rounded-xl shadow-md">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">
                Tu Código de Referido
              </h2>
              <div className="p-6 rounded-xl bg-gray-50 border border-gray-200 shadow-sm">
                <div className="space-y-4">
                  <p className="text-gray-600">
                    Comparte este código con tus amigos y obtén más beneficios
                  </p>
                  <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200">
                    <span className="text-xl font-bold text-rosa">
                      {process.env.NEXT_PUBLIC_REFFERAL_CODE}
                    </span>
                    <button
                      onClick={handleCopyCode}
                      className="px-4 py-2 bg-rosa text-white rounded-lg hover:bg-rosa/90 transition-colors"
                    >
                      Copiar
                    </button>
                  </div>

                  {/* Botones de compartir */}
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-600 mb-3">
                      Compartir en redes sociales:
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={shareOnWhatsApp}
                        className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                        </svg>
                        WhatsApp
                      </button>
                      <button
                        onClick={shareOnTwitter}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-400 text-white rounded-lg hover:bg-blue-500 transition-colors"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                        </svg>
                        Twitter
                      </button>
                      <button
                        onClick={shareOnFacebook}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                        Facebook
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sección de Movimientos */}
            {creditMovements.length > 0 && (
              <div className="bg-white p-4 md:p-8 rounded-xl shadow-md">
                <h2 className="text-xl md:text-2xl font-bold mb-6 text-gray-800">
                  Historial de Movimientos
                </h2>
                <div className="overflow-x-auto -mx-4 md:mx-0">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                          Tipo
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                          Descripción
                        </th>
                        <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">
                          Cantidad
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {paginatedMovements.map((movement) => (
                        <tr
                          key={movement.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {getMovementTypeDisplay(movement.type)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {getMovementDescriptionDisplay(movement.description)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700 text-right font-medium">
                            {formatCLP(movement.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div
                  aria-label="Page navigation example"
                  className="my-6 flex justify-center pt-8"
                >
                  <ul className="flex items-center -space-x-px h-10 text-base">
                    <li>
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`flex items-center justify-center px-4 h-10 leading-tight text-gray-500 bg-white border border-e-0 border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700 ${
                          currentPage === 1 ? "cursor-not-allowed" : ""
                        }`}
                      >
                        <span className="sr-only">Previous</span>
                        <svg
                          className="w-3 h-3 rtl:rotate-180"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 6 10"
                        >
                          <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 1 1 5l4 4"
                          />
                        </svg>
                      </button>
                    </li>

                    {Array.from({ length: totalPages }, (_, index) => (
                      <li key={index}>
                        <button
                          onClick={() => handlePageChange(index + 1)}
                          className={`flex items-center justify-center px-4 h-10 leading-tight text-gray-500 border border-gray-300 hover:bg-gray-100 hover:text-gray-700 ${
                            currentPage === index + 1
                              ? "text-primary bg-gray-200"
                              : "text-gray-300 bg-white"
                          }`}
                        >
                          {index + 1}
                        </button>
                      </li>
                    ))}

                    <li>
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`flex items-center justify-center px-4 h-10 leading-tight text-gray-500 bg-white border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-700 ${
                          currentPage === totalPages ? "cursor-not-allowed" : ""
                        }`}
                      >
                        <span className="sr-only">Next</span>
                        <svg
                          className="w-3 h-3 rtl:rotate-180"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 6 10"
                        >
                          <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="m1 9 4-4-4-4"
                          />
                        </svg>
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {creditSummaries.length === 0 && (
              <div className="bg-white p-8 rounded-xl shadow-md">
                <p className="text-gray-600">
                  No hay resúmenes de créditos disponibles.
                </p>
              </div>
            )}

            {creditMovements.length === 0 && (
              <div className="bg-white p-8 rounded-xl shadow-md">
                <p className="text-gray-600">
                  No hay movimientos de créditos disponibles.
                </p>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default CreditChecker;
