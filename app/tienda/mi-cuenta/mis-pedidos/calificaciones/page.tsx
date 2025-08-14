/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { getCookie } from "cookies-next";
import { jwtDecode } from "jwt-decode";
import Modal from "./Modal"; // Asegúrate de que la ruta sea correcta

interface Producto {
  id: string;
  nombre: string;
  imagen: string;
  fechaCompra: string;
  score?: number;
  comments?: string;
}

interface DecodedToken {
  sub: string;
  [key: string]: any;
}

const OpinionesPendientes: React.FC = () => {
  const [productosPendientes, setProductosPendientes] = useState<Producto[]>(
    []
  );
  const [productosValorados, setProductosValorados] = useState<Producto[]>([]);
  const [calificaciones, setCalificaciones] = useState<{
    [key: string]: number;
  }>({});
  const [hover, setHover] = useState<{ [key: string]: number }>({});
  const [comentarios, setComentarios] = useState<{ [key: string]: string }>({});
  const [mostrarComentario, setMostrarComentario] = useState<{
    [key: string]: boolean;
  }>({});
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [modalMensaje, setModalMensaje] = useState<string>("");
  const [pagePendientes, setPagePendientes] = useState<number>(1);
  const [pageValorados, setPageValorados] = useState<number>(1);
  const [pageSize] = useState<number>(5);
  const [filterScore, setFilterScore] = useState<number | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    const fetchProductos = async () => {
      const token = getCookie("ClientTokenAuth") as string;
      const decodeToken = token ? jwtDecode<DecodedToken>(token) : null;
      const id = decodeToken?.sub;
      const siteId = process.env.NEXT_PUBLIC_API_URL_SITEID || "";

      if (id && token) {
        try {
          const responsePendientes = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/customers/${id}/products?pageNumber=${pagePendientes}&pageSize=${pageSize}&siteId=${siteId}&hasValorations=false`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const responseValorados = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/customers/${id}/products?pageNumber=${pageValorados}&pageSize=${pageSize}&siteId=${siteId}&hasValorations=true`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (responsePendientes.data.code === 0) {
            const fetchedPendientes =
              responsePendientes.data.purchasedProducts.map((item: any) => ({
                id: item.product.id,
                nombre: item.product.name,
                imagen: item.product.mainImageUrl,
              }));
            setProductosPendientes(fetchedPendientes);
          } else {
            console.error(
              "Failed to fetch pending products. Please try again."
            );
          }

          if (responseValorados.data.code === 0) {
            const fetchedValorados =
              responseValorados.data.purchasedProducts.map((item: any) => ({
                id: item.product.id,
                nombre: item.product.name,
                imagen: item.product.mainImageUrl,

                score: item.score,
                comments: item.comments,
              }));
            setProductosValorados(fetchedValorados);
          } else {
            console.error("Failed to fetch rated products. Please try again.");
          }
        } catch (err) {
          console.error("An error occurred. Please try again.", err);
        }
      }
    };

    fetchProductos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagePendientes, pageValorados]);

  const handleMouseEnter = (productoId: string, estrella: number) => {
    setHover((prev) => ({
      ...prev,
      [productoId]: estrella,
    }));
  };

  const handleMouseLeave = (productoId: string) => {
    setHover((prev) => ({
      ...prev,
      [productoId]: 0,
    }));
  };

  const handleClick = (productoId: string, estrella: number) => {
    setCalificaciones((prev) => ({
      ...prev,
      [productoId]: estrella,
    }));
    setMostrarComentario((prev) => ({
      ...prev,
      [productoId]: true,
    }));
  };

  const handleComentarioChange = (productoId: string, comentario: string) => {
    setComentarios((prev) => ({
      ...prev,
      [productoId]: comentario,
    }));
  };

  const handleCalificar = async (productoId: string) => {
    const token = getCookie("ClientTokenAuth") as string;
    const decodeToken = token ? jwtDecode<DecodedToken>(token) : null;
    const id = decodeToken?.sub;

    const calificacion = calificaciones[productoId];
    const comentario = comentarios[productoId] || "";

    if (id && token) {
      try {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/customers/${id}/product-reviews?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
          {
            productId: productoId,
            score: calificacion,
            comments: comentario,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log(response.data);

        setModalMensaje(
          `Gracias por tu calificación de ${calificacion} estrellas y tu comentario.`
        );
        setModalVisible(true);
        setMostrarComentario((prev) => ({
          ...prev,
          [productoId]: false,
        }));
        setComentarios((prev) => ({
          ...prev,
          [productoId]: "",
        }));
      } catch (err) {
        console.error(
          "An error occurred while submitting your review. Please try again.",
          err
        );
      }
    }
  };

  const handleSort = (order: "asc" | "desc") => {
    setSortOrder(order);
    setProductosValorados((prev) =>
      [...prev].sort((a, b) =>
        order === "asc" ? a.score! - b.score! : b.score! - a.score!
      )
    );
  };

  const handleFilter = (score: number | null) => {
    setFilterScore(score);
  };

  const filteredProductosValorados =
    filterScore !== null
      ? productosValorados.filter((producto) => producto.score === filterScore)
      : productosValorados;

  return (
    <div className="py-20 bg-gray-100">
      <div
        className="shadow bg-white max-w-6xl mx-auto p-4"
        style={{ borderRadius: "var(--radius)" }}
      >
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => window.history.back()}
            className="mt-2 top-4 left-4 flex items-center px-4 py-2 bg-secondary text-primary hover:text-secondary hover:bg-primary"
            style={{ borderRadius: "var(--radius)" }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              className="w-6 h-6 mr-2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Volver
          </button>
          <h2 className="text-lg font-semibold">
            Opina y ayuda a más personas
          </h2>
          <p className="text-m text-gray-700">{`1 - ${productosPendientes.length} de ${productosPendientes.length} opiniones pendientes`}</p>
        </div>

        <h3 className="text-lg font-semibold mb-4">Valoraciones Pendientes</h3>
        <div
          className="bg-white border p-4 shadow-md"
          style={{ borderRadius: "var(--radius)" }}
        >
          {productosPendientes.map((producto) => (
            <div
              key={producto.id}
              className="flex flex-col items-start border-b border-gray-200 py-4 last:border-0"
            >
              <div className="flex items-center w-full justify-between">
                <div className="flex items-center">
                  <img
                    src={producto.imagen}
                    alt={producto.nombre}
                    className="w-16 h-16 object-cover rounded-md mr-4"
                  />
                  <div>
                    <h3 className="text-md font-medium">{producto.nombre}</h3>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="flex items-center mr-4">
                    {[...Array(5)].map((_, index) => {
                      const estrella = index + 1;
                      return (
                        <svg
                          key={index}
                          onMouseEnter={() =>
                            handleMouseEnter(producto.id, estrella)
                          }
                          onMouseLeave={() => handleMouseLeave(producto.id)}
                          onClick={() => handleClick(producto.id, estrella)}
                          className={`w-7 h-7 cursor-pointer ${
                            (hover[producto.id] ||
                              calificaciones[producto.id]) >= estrella
                              ? "text-yellow-500"
                              : "text-gray-300"
                          }`}
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
                          />
                        </svg>
                      );
                    })}
                  </div>
                </div>
              </div>
              {mostrarComentario[producto.id] && (
                <div className="mt-4 w-full">
                  <textarea
                    className="w-full p-2 border border-gray-300 rounded-md mb-2"
                    placeholder="Escribe un comentario..."
                    value={comentarios[producto.id] || ""}
                    onChange={(e) =>
                      handleComentarioChange(producto.id, e.target.value)
                    }
                  />
                  <button
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300"
                    onClick={() => handleCalificar(producto.id)}
                  >
                    Calificar
                  </button>
                </div>
              )}
            </div>
          ))}
          <div className="flex justify-between mt-4">
            <button
              onClick={() => setPagePendientes((prev) => Math.max(prev - 1, 1))}
              disabled={pagePendientes === 1}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
            >
              Anterior
            </button>
            <button
              onClick={() => setPagePendientes((prev) => prev + 1)}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
            >
              Siguiente
            </button>
          </div>
        </div>

        <h3 className="text-lg font-semibold mb-4 mt-8">
          Valoraciones Realizadas
        </h3>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <label
              htmlFor="filterScore"
              className="mr-2"
            >
              Filtrar por nota:
            </label>
            <select
              id="filterScore"
              value={filterScore || ""}
              onChange={(e) =>
                handleFilter(e.target.value ? parseInt(e.target.value) : null)
              }
              className="border p-1 rounded-md"
            >
              <option value="">Todas</option>
              {[...Array(5)].map((_, index) => (
                <option
                  key={index}
                  value={index + 1}
                >
                  {index + 1} estrellas
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center">
            <label
              htmlFor="sortOrder"
              className="mr-2"
            >
              Ordenar por nota:
            </label>
            <select
              id="sortOrder"
              value={sortOrder}
              onChange={(e) => handleSort(e.target.value as "asc" | "desc")}
              className="border p-1 rounded-md"
            >
              <option value="asc">Ascendente</option>
              <option value="desc">Descendente</option>
            </select>
          </div>
        </div>
        <div
          className="bg-white border p-4 shadow-md"
          style={{ borderRadius: "var(--radius)" }}
        >
          {filteredProductosValorados.map((producto) => (
            <div
              key={producto.id}
              className="flex flex-col items-start border-b border-gray-200 py-4 last:border-0"
            >
              <div className="flex items-center w-full justify-between">
                <div className="flex items-center">
                  <img
                    src={producto.imagen}
                    alt={producto.nombre}
                    className="w-16 h-16 object-cover rounded-md mr-4"
                  />
                  <div>
                    <h3 className="text-md font-medium">{producto.nombre}</h3>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="flex items-center mr-4">
                    {[...Array(5)].map((_, index) => {
                      const estrella = index + 1;
                      return (
                        <svg
                          key={index}
                          className={`w-7 h-7 cursor-pointer ${
                            producto.score! >= estrella
                              ? "text-yellow-500"
                              : "text-gray-300"
                          }`}
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
                          />
                        </svg>
                      );
                    })}
                  </div>
                </div>
              </div>
              <p className="mt-2 text-gray-700">{producto.comments}</p>
            </div>
          ))}
          <div className="flex justify-between mt-4">
            <button
              onClick={() => setPageValorados((prev) => Math.max(prev - 1, 1))}
              disabled={pageValorados === 1}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
            >
              Anterior
            </button>
            <button
              onClick={() => setPageValorados((prev) => prev + 1)}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
      {modalVisible && (
        <Modal
          mensaje={modalMensaje}
          onClose={() => setModalVisible(false)}
        />
      )}
    </div>
  );
};

export default OpinionesPendientes;
