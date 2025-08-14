/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useState } from "react";
import Breadcrumb from "@/components/Core/Breadcrumbs/Breadcrumb";
import { getCookie } from "cookies-next";
import Link from "next/link";
import axios from "axios";
import toast from "react-hot-toast";
import { obtenerProductosBO } from "@/app/utils/obtenerProductosBO";
import Cuotas from "@/components/Core/Cuotas/Cuotas";
import Popup from "@/components/Core/Popup/Popup";
import PopupVisual from "@/components/Core/Popup/Popupvisual";

interface Product {
  id: number;
  name: string;
  previewImageUrl: string;
  mainImageUrl: string;
  productTypes: { id: number; name: string }[];
}

interface Sku {
  id: number;
  name: string;
}

function Ofertas() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(6);
  const [totalProducts, setTotalProducts] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [productosConOFerta, setProductosConOFerta] = useState<Product[]>([]);
  const [productosConOfertaIds, setProductosConOfertaIds] = useState<number[]>(
    []
  );
  const [displayedOffers, setDisplayedOffers] = useState<Product[]>([]);
  const [currentOffersPage, setCurrentOffersPage] = useState(1);
  const [searchOffersText, setSearchOffersText] = useState("");
  const [hasProPlan, setHasProPlan] = useState(false);
  const [hasIniciaPlan, setHasIniciaPlan] = useState(false);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);

  useEffect(() => {
    fetchProductos();
    fetchProductosEnOferta();
    checkSubscriptionPlan();
  }, []);

  const checkSubscriptionPlan = async () => {
    try {
      const token = getCookie("AdminTokenAuth");
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/subscriptions?pageNumber=1&pageSize=50&siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Buscar suscripciones activas
      const activeSubscriptions = response.data.subscriptions.filter(
        (sub: any) => sub.statusCode === "ACTIVE" || sub.statusCode === "EXPIRED"
      );

      // Verificar si tiene plan PRO
      const hasPro = activeSubscriptions.some((sub: any) =>
        sub.name.toLowerCase().includes("pro")
      );

      // Verificar si tiene plan INICIA
      const hasInicia = activeSubscriptions.some((sub: any) =>
        sub.name.toLowerCase().includes("inicia")
      );

      setHasProPlan(hasPro);
      setHasIniciaPlan(hasInicia);
    } catch (error) {
      console.error("Error verificando plan de suscripción:", error);
      setHasProPlan(false);
      setHasIniciaPlan(false);
    } finally {
      setSubscriptionLoading(false);
    }
  };

  useEffect(() => {
    if (allProducts.length > 0) {
      updateDisplayedProducts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, allProducts]);

  useEffect(() => {
    updateDisplayedOffers();
  }, [currentOffersPage, searchOffersText, productosConOFerta]);

  const fetchProductos = async () => {
    try {
      const token = getCookie("AdminTokenAuth");
      const allData: Product[] = [];
      let pageNumber = 1;
      let data;

      do {
        data = await obtenerProductosBO(pageNumber, 50, token);
        allData.push(...data.products);
        pageNumber += 1;
      } while (data.products.length > 0);

      setAllProducts(allData);
      setTotalProducts(allData.length);
    } catch (error) {
      toast.error("Error al cargar todos los productos");
    }
  };

  const fetchProductosEnOferta = async () => {
    try {
      const siteId = process.env.NEXT_PUBLIC_API_URL_SITEID || null;
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/products?siteId=${siteId}&pageNumber=1&pageSize=50&hasValidOffers=true`
      );
      const data = await response.json();
      setProductosConOFerta(data.products);

      const productosConOfertaIds = data.products.map(
        (product: Product) => product.id
      );
      setProductosConOfertaIds(productosConOfertaIds);
    } catch (error) {
      console.error("Error al obtener el skuOffers de la variación:", error);
    }
  };

  const updateDisplayedProducts = () => {
    const filteredProducts = allProducts.filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !productosConOfertaIds.includes(product.id)
    );

    setTotalProducts(filteredProducts.length);

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    setProducts(filteredProducts.slice(startIndex, endIndex));
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  useEffect(() => {
    updateDisplayedProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const totalPages = Math.ceil(totalProducts / pageSize);

  const updateDisplayedOffers = () => {
    const filteredOffers = productosConOFerta.filter((product) =>
      product.name.toLowerCase().includes(searchOffersText.toLowerCase())
    );

    const startIndex = (currentOffersPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    setDisplayedOffers(filteredOffers.slice(startIndex, endIndex));
  };

  const handleOffersSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchOffersText(event.target.value);
    setCurrentOffersPage(1);
  };

  const handleOffersPageChange = (page: number) => {
    setCurrentOffersPage(page);
  };

  const totalOffersPages = Math.ceil(productosConOFerta.length / pageSize);

  return (
    <section className="mx-10 py-10">
      <Breadcrumb pageName="Ofertas" />
      
      {/* Mensaje de restricción para Configuración de Cuotas (solo PRO) */}
      {!subscriptionLoading && !hasProPlan && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <div className=" text-sm text-red-700">
                <p>La función de visualización de Cuotas Sin Interés es exclusiva del Plan Pro. Puedes actualizar tu plan en la sección <a href="/dashboard/suscripciones/estado" rel="noopener noreferrer" className="underline"> Suscripción.</a> </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={`flex flex-col gap-10 ${!hasProPlan ? 'opacity-50 pointer-events-none' : ''}`}>
        <Cuotas/>
      </div>

      {/* Mensaje de restricción para Configuración de Popup (solo PRO) */}
      {!subscriptionLoading && !hasProPlan && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6 mt-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <div className=" text-sm text-red-700">
                <p>La función Popup es exclusiva del Plan Pro. Puedes actualizar tu plan en la sección <a href="/dashboard/suscripciones/estado" rel="noopener noreferrer" className="underline"> Suscripción.</a> </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={`flex flex-col gap-10 mt-4 ${!hasProPlan ? 'opacity-50 pointer-events-none' : ''}`}>
        <Popup/>
      </div>
      <div className="rounded-lg p-4 bg-white my-6 overflow-x-auto">
        <div className="text-sm flex gap-2 font-medium border-b pb-2 mb-6">
          <div>Ofertas Activas</div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-4 p-4">
          <div className="w-full md:w-1/2">
            <form className="flex items-center">
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg
                    aria-hidden="true"
                    className="w-5 h-5 text-gray-500 dark:text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 p-2"
                  placeholder="Buscar ofertas activas"
                  value={searchOffersText}
                  onChange={handleOffersSearch}
                />
              </div>
            </form>
          </div>
        </div>

        {productosConOFerta.length > 0 ? (
          <>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categorías
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Editar
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {displayedOffers.map((offerProduct: any) => (
                  <tr key={offerProduct.id}>
                    <td className="px-2 py-3 flex items-center justify-center align-middle w-fit ml-2">
                      <img
                        src={offerProduct.mainImageUrl}
                        alt="User"
                        className="rounded-full h-9 w-9 object-cover"
                      />
                    </td>
                    <td className="px-6 py-4 md:whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {offerProduct.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 md:whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="flex justify-left flex-wrap gap-2 max-w-sm mx-auto text-sm">
                          {offerProduct.productTypes.map((category: any) => (
                            <button
                              key={category.id}
                              className="px-2 py-1 rounded bg-gray-200/50 text-gray-700 hover:bg-gray-300"
                            >
                              {category.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <Link href={`/dashboard/ofertas/${offerProduct.id}`}>
                        <div className="bg-primary hover:bg-secondary text-secondary text-center hover:text-primary py-2 px-4 rounded">
                          Ver / Editar Ofertas
                        </div>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="my-6 flex justify-center pt-8">
              <ul className="flex items-center -space-x-px h-10 text-base">
                <li>
                  <button
                    onClick={() => handleOffersPageChange(currentOffersPage - 1)}
                    disabled={currentOffersPage === 1}
                    className={`flex items-center justify-center px-4 h-10 leading-tight text-gray-500 bg-white border border-e-0 border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700 ${
                      currentOffersPage === 1 ? "cursor-not-allowed opacity-50" : ""
                    }`}
                  >
                    <span className="sr-only">Anterior</span>
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
                {(() => {
                  const delta = 1;
                  const range = [];
                  const rangeWithDots = [];
                  let l;

                  for (let i = 1; i <= totalOffersPages; i++) {
                    if (
                      i === 1 || 
                      i === totalOffersPages || 
                      i === currentOffersPage || 
                      (i >= currentOffersPage - delta && i <= currentOffersPage + delta)
                    ) {
                      range.push(i);
                    }
                  }

                  for (let i of range) {
                    if (l) {
                      if (i - l === 2) {
                        rangeWithDots.push(l + 1);
                      } else if (i - l !== 1) {
                        rangeWithDots.push('...');
                      }
                    }
                    rangeWithDots.push(i);
                    l = i;
                  }

                  return rangeWithDots.map((pageNum, index) => (
                    <li key={index}>
                      <button
                        onClick={() => typeof pageNum === 'number' ? handleOffersPageChange(pageNum) : undefined}
                        disabled={pageNum === '...'}
                        className={`flex items-center justify-center px-4 h-10 leading-tight border border-gray-300 ${
                          pageNum === currentOffersPage
                            ? "text-white bg-primary border-primary z-10"
                            : pageNum === '...'
                            ? "text-gray-500 bg-white cursor-default"
                            : "text-gray-500 bg-white hover:bg-gray-100 hover:text-gray-700"
                        }`}
                      >
                        {pageNum}
                      </button>
                    </li>
                  ));
                })()}
                <li>
                  <button
                    onClick={() => handleOffersPageChange(currentOffersPage + 1)}
                    disabled={currentOffersPage === totalOffersPages}
                    className={`flex items-center justify-center px-4 h-10 leading-tight text-gray-500 bg-white border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-700 ${
                      currentOffersPage === totalOffersPages ? "cursor-not-allowed opacity-50" : ""
                    }`}
                  >
                    <span className="sr-only">Siguiente</span>
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
          </>
        ) : (
          <div className="text-center text-lg text-gray-600">
            No hay productos en oferta
          </div>
        )}
      </div>
      {/* Mensaje de restricción para Crear Ofertas (no disponible para plan Inicia) */}
      {!subscriptionLoading && hasIniciaPlan && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <div className=" text-sm text-red-700">
                <p>La función Creación de Ofertas es exclusiva del Plan Avanzado y Plan Pro. Puedes actualizar tu plan en la sección <a href="/dashboard/suscripciones/estado" rel="noopener noreferrer" className="underline"> Suscripción.</a> </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <section className={`rounded-lg p-4 bg-white my-6 overflow-x-auto ${
        hasIniciaPlan ? 'opacity-50 pointer-events-none' : ''
      }`}>
        <div className="p-3 sm:p-5 relative">
          <div className="text-sm flex gap-2 font-medium border-b pb-2 mb-6">
            <div>Todos los productos</div>
          </div>
          <div className="mx-auto w-full px-2">
            <div>
              <div className="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-4 p-4">
                <div className="w-full md:w-1/2">
                  <form className="flex items-center">
                    <label
                      htmlFor="simple-search"
                      className="sr-only"
                    >
                      Search
                    </label>
                    <div className="relative w-full">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <svg
                          aria-hidden="true"
                          className="w-5 h-5 text-gray-500 dark:text-gray-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <input
                        type="text"
                        id="simple-search"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                        placeholder="Search"
                        required
                        value={searchTerm}
                        onChange={handleSearch}
                      />
                    </div>
                  </form>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                      <th
                        scope="col"
                        className="px-2 py-3 w-fit"
                      ></th>
                      <th
                        scope="col"
                        className="px-2 py-3"
                      >
                        Nombre
                      </th>
                      <th
                        scope="col"
                        className="px-2 py-3"
                      >
                        Categorías
                      </th>
                      <th
                        scope="col"
                        className="px-2 py-3 w-40"
                      >
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product, index) => (
                      <tr
                        key={index}
                        className="border-b dark:border-gray-700"
                      >
                        <td className="px-2 py-3 flex items-center justify-center align-middle w-fit ml-2">
                          <img
                            src={product.mainImageUrl}
                            alt="User"
                            className="rounded-full h-9 w-9 object-cover"
                          />
                        </td>
                        <td className="px-2 py-3 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                          {product.name}
                        </td>
                        <td className="px-2 py-3">
                          <div className="flex justify-left flex-wrap gap-2 max-w-sm mx-auto text-sm">
                            {product.productTypes.map((category) => (
                              <button
                                key={category.id}
                                className="px-2 py-1 rounded bg-gray-200/50 text-gray-700 hover:bg-gray-300"
                              >
                                {category.name}
                              </button>
                            ))}
                          </div>
                        </td>
                        <td className="px-2 py-3 flex items-center justify-end space-x-2">
                          {hasIniciaPlan ? (
                            <div className="bg-gray-400 text-gray-600 py-2 px-4 rounded cursor-not-allowed">
                              Crear Oferta
                            </div>
                          ) : (
                            <Link href={`/dashboard/ofertas/${product.id}`}>
                              <div className="bg-primary hover:bg-secondary text-secondary text-center hover:text-primary py-2 px-4 rounded">
                                Crear Oferta
                              </div>
                            </Link>
                          )}
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
                        currentPage === 1 ? "cursor-not-allowed opacity-50" : ""
                      }`}
                    >
                      <span className="sr-only">Anterior</span>
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
                  {(() => {
                    const delta = 1;
                    const range = [];
                    const rangeWithDots = [];
                    let l;

                    for (let i = 1; i <= totalPages; i++) {
                      if (
                        i === 1 || 
                        i === totalPages || 
                        i === currentPage || 
                        (i >= currentPage - delta && i <= currentPage + delta)
                      ) {
                        range.push(i);
                      }
                    }

                    for (let i of range) {
                      if (l) {
                        if (i - l === 2) {
                          rangeWithDots.push(l + 1);
                        } else if (i - l !== 1) {
                          rangeWithDots.push('...');
                        }
                      }
                      rangeWithDots.push(i);
                      l = i;
                    }

                    return rangeWithDots.map((pageNum, index) => (
                      <li key={index}>
                        <button
                          onClick={() => typeof pageNum === 'number' ? handlePageChange(pageNum) : undefined}
                          disabled={pageNum === '...'}
                          className={`flex items-center justify-center px-4 h-10 leading-tight border border-gray-300 ${
                            pageNum === currentPage
                              ? "text-white bg-primary border-primary z-10"
                              : pageNum === '...'
                              ? "text-gray-500 bg-white cursor-default"
                              : "text-gray-500 bg-white hover:bg-gray-100 hover:text-gray-700"
                          }`}
                        >
                          {pageNum}
                        </button>
                      </li>
                    ));
                  })()}
                  <li>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`flex items-center justify-center px-4 h-10 leading-tight text-gray-500 bg-white border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-700 ${
                        currentPage === totalPages ? "cursor-not-allowed opacity-50" : ""
                      }`}
                    >
                      <span className="sr-only">Siguiente</span>
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
          </div>
        </div>
      </section>
    </section>
  );
}

export default Ofertas;
