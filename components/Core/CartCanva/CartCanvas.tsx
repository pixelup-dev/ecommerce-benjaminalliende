/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
"use client";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { getCookie } from "cookies-next";
import { useAPI } from "@/app/Context/ProductTypeContext";
import CartList from "./CartList";
import toast from "react-hot-toast";
import { ResponseCookies } from "next/dist/compiled/@edge-runtime/cookies";
function CartCanvas() {
  const offcanvasRef = useRef<HTMLDivElement>(null);
  const {
    cartItems,
    setCartItems,
    fetchCartData,
    cartData,
    handleMenuOpen,
    handleMenuClose,
    isMenuOpen,
    setIsMenuOpen,
    totalItems,
  } = useAPI();
  const totalAmount = cartData?.totals?.totalAmount ?? 0;
  const subtotalAmount = cartData?.totals?.subtotalAmount ?? 0;
  const discountAmount = cartData?.totals?.discountAmount ?? 0;
  const [freeShippingAmount, setFreeShippingAmount] = useState<number | null>(null);
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscKey);

    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        offcanvasRef.current &&
        !offcanvasRef.current.contains(event.target as Node) &&
        !(event.target as HTMLElement).closest("[data-ignore-outside-click]")
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!offcanvasRef.current) {
      return;
    }

    if (isMenuOpen) {
      offcanvasRef.current.classList.add("translate-x-0");
    } else {
      offcanvasRef.current.classList.remove("translate-x-0");
      offcanvasRef.current.classList.add("translate-x-full");
    }
  }, [isMenuOpen]);

  useEffect(() => {
    fetchCartData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    const fetchFreeShippingAmount = async () => {
      try {
        const contentBlockId = process.env.NEXT_PUBLIC_MONTOENVIOGRATIS_CONTENTBLOCK;
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/content-blocks/${contentBlockId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`
        );
        const value = response.data.contentBlock.contentText;
        console.log(response.data.contentBlock, "response.data.contentBlock");
        setFreeShippingAmount(Number(value));
      } catch (error) {
        setFreeShippingAmount(null);
      }
    };
    fetchFreeShippingAmount();
  }, []);

  const incrementQuantity = async (itemId: string) => {
    try {
      const itemIndex = cartItems.findIndex((item: any) => item.id === itemId);
      if (itemIndex !== -1) {
        const newQuantity = cartItems[itemIndex].quantity + 1;

        // Actualizar la cantidad en la API primero
        const cartId = getCookie("cartId");
        const SiteId = process.env.NEXT_PUBLIC_API_URL_SITEID || "";
        await axios.put(
          `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/carts/${cartId}/items/${itemId}?siteId=${SiteId}`,
          { quantity: newQuantity }
        );

        // Si la API se actualizó con éxito, actualizar el estado
        const updatedCartItems = [...cartItems];
        updatedCartItems[itemIndex] = {
          ...updatedCartItems[itemIndex],
          quantity: newQuantity,
        };
        setCartItems(updatedCartItems);

        // Opcionalmente, puedes volver a obtener los datos del carrito
        fetchCartData();
      }
    } catch (error: any) {
      console.error("Error incrementing quantity:", error);

      // Mostrar el mensaje de error si está disponible
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Error incrementing quantity. Please try again.");
      }
    }
  };

  const decrementQuantity = async (itemId: string) => {
    try {
      const itemIndex = cartItems.findIndex((item: any) => item.id === itemId);
      if (itemIndex !== -1 && cartItems[itemIndex].quantity > 1) {
        const updatedCartItems = [...cartItems];
        updatedCartItems[itemIndex] = {
          ...updatedCartItems[itemIndex],
          quantity: updatedCartItems[itemIndex].quantity - 1,
        };
        setCartItems(updatedCartItems);

        // Actualizar la cantidad en la API
        const cartId = getCookie("cartId");
        const SiteId = process.env.NEXT_PUBLIC_API_URL_SITEID || "";
        await axios.put(
          `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/carts/${cartId}/items/${itemId}?siteId=${SiteId}`,
          { quantity: updatedCartItems[itemIndex].quantity }
        );
        fetchCartData();
      }
    } catch (error) {
      console.error("Error decrementing quantity:", error);
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      const SiteId = process.env.NEXT_PUBLIC_API_URL_SITEID || "";
      const cartId = getCookie("cartId");
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/carts/${cartId}/items/${itemId}?siteId=${SiteId}`
      );
      // Si la solicitud se completa con éxito, actualiza el estado del carrito eliminando el elemento correspondiente
      setCartItems((prevItems: any) =>
        prevItems.filter((item: any) => item.id !== itemId)
      );
      fetchCartData();
    } catch (error) {
      console.error("Error removing item from cart:", error);
    }
  };

  return (
    <div
      className="z-50"
      data-ignore-outside-click
    >
      <Link
        href="#"
        onClick={handleMenuOpen}
        className="menu-open-btn ease-in-up   rounded-sm   py-3 text-base font-medium text-white shadow-btn transition duration-300 hover:bg-opacity-90 hover:shadow-btn-hover md:block "
      >
        {/* Contenido del botón de apertura del carrito */}
        <span className="relative ">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22px"
            height="22px"
            className="cursor-pointer fill-primary hover:fill-primary inline"
            viewBox="0 0 512 512"
          >
            <path
              d="M164.96 300.004h.024c.02 0 .04-.004.059-.004H437a15.003 15.003 0 0 0 14.422-10.879l60-210a15.003 15.003 0 0 0-2.445-13.152A15.006 15.006 0 0 0 497 60H130.367l-10.722-48.254A15.003 15.003 0 0 0 105 0H15C6.715 0 0 6.715 0 15s6.715 15 15 15h77.969c1.898 8.55 51.312 230.918 54.156 243.71C131.184 280.64 120 296.536 120 315c0 24.812 20.188 45 45 45h272c8.285 0 15-6.715 15-15s-6.715-15-15-15H165c-8.27 0-15-6.73-15-15 0-8.258 6.707-14.977 14.96-14.996zM477.114 90l-51.43 180H177.032l-40-180zM150 405c0 24.813 20.188 45 45 45s45-20.188 45-45-20.188-45-45-45-45 20.188-45 45zm45-15c8.27 0 15 6.73 15 15s-6.73 15-15 15-15-6.73-15-15 6.73-15 15-15zm167 15c0 24.813 20.188 45 45 45s45-20.188 45-45-20.188-45-45-45-45 20.188-45 45zm45-15c8.27 0 15 6.73 15 15s-6.73 15-15 15-15-6.73-15-15 6.73-15 15-15zm0 0"
              data-original="#000000"
            />
          </svg>
          <span className="absolute left-auto -ml-1 top-0 rounded-full bg-primary px-1 py-0 text-xs text-white">
            {totalItems}
          </span>
        </span>
      </Link>
      <div
        ref={offcanvasRef}
        id="menu-cart"
        className={`offcanvas-menu w-full md:w-1/3 fixed z-50 min-w-[300px] bg-slate-100 h-screen dark:border-strokedark dark:bg-form-strokedark top-0 right-0 p-6 ease-in-out duration-1000 shadow-md flex pt-32  ${
          isMenuOpen ? "" : "translate-x-full"
        }`}
      >
        {/* Contenido del carrito */}
        <div className="fixed top-0 left-0 w-full h-full z-[1000] before:fixed   before:w-full before:h-full before:bg-[rgba(0,0,0,0.5)] font-[sans-serif]">
          <div className="w-full  bg-white shadow-lg relative ml-auto h-screen z-50">
            <div className="overflow-auto p-4 h-[calc(100vh-200px)] md:h-[calc(100vh-130px)] min-w-[240px]">
              <div className="flex justify-between">
                <Link
                  href="#"
                  onClick={handleMenuClose}
                  className="menu-open-btn ease-in-up   rounded-sm   py-3 text-base font-medium text-white shadow-btn transition duration-300 hover:bg-opacity-90 hover:shadow-btn-hover md:block "
                >
                  {/* Contenido del botón de apertura del carrito */}
                  <span className="relative ">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-8 h-8 hover:text-secondary text-primary"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-1.72 6.97a.75.75 0 1 0-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06L12 13.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L13.06 12l1.72-1.72a.75.75 0 1 0-1.06-1.06L12 10.94l-1.72-1.72Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                </Link>
                <h2 className="mb-4 text-center text-2xl font-bold text-dark  lg:text-3xl uppercase">
                  Tu Carrito
                </h2>
              </div>
              <h3 className="text-right uppercase text-xs  mb-4">
                Total Productos:{" "}
                <span className="font-bold text-lg">{totalItems}</span>
              </h3>
              <div className="grid grid-cols-12 mt-8 max-md:hidden pb-6 border-b border-gray-200">
                <div className="col-span-12 md:col-span-7">
                  <p className="font-normal text-lg leading-8 text-gray-400">
                    Producto
                  </p>
                </div>
                <div className="col-span-12 md:col-span-5">
                  <div className="grid grid-cols-5">
                    <div className="col-span-5">
                      <p className="font-normal text-lg leading-8 text-gray-400 text-end">
                        Cantidad
                      </p>
                    </div>
                    {/*                                 <div className="col-span-2">
                                    <p className="font-normal text-lg leading-8 text-gray-400 text-center">Total</p>
                                </div> */}
                  </div>
                </div>
              </div>
              {/* Map para mostrar los productos en el carrito */}
              <CartList
                cartItems={cartItems}
                incrementQuantity={incrementQuantity}
                decrementQuantity={decrementQuantity}
                removeItem={removeItem}
              />
            </div>
            <div className="p-6 absolute bottom-20 md:bottom-0 w-full border-t bg-white">
                          {/* Mensaje de cuánto falta para envío gratis */}
        {/*                   {freeShippingAmount && (
                <div className="flex items-center gap-4 mb-4 text-md font-bold text-primary">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="size-10"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"
                      />
                    </svg>
                  {subtotalAmount >= freeShippingAmount ? (
                    "¡Envío gratis!"
                  ) : (
                    `Añade ${new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(freeShippingAmount - subtotalAmount)} más a tu carrito para envío gratis`
                  )}
                </div>
              )} */}
              <ul className="text-[#333] divide-y">
                {/* Subtotal del carrito */}
                <li className="flex flex-wrap gap-4 text-2xl font-bold">
                  Subtotal{" "}
                  <span className="ml-auto">
                    {new Intl.NumberFormat("es-CL", {
                      style: "currency",
                      currency: "CLP",
                    }).format(subtotalAmount)}
                  </span>
                  {/* .toLocaleString('es-CL') */}
                </li>
                {/*                 <li className="flex flex-wrap gap-4 text-md font-bold">
                  Descuento <span className="ml-auto">${discountAmount}</span>
                </li>
                <li className="flex flex-wrap gap-4 text-md font-bold">
                  Total <span className="ml-auto">${totalAmount}</span>
                </li> */}
              </ul>
              {/* Botón de checkout */}
              <Link href="/tienda/checkout">
                <button
                  type="button"
                  onClick={() => {
                    setTimeout(() => {
                      setIsMenuOpen(false);
                      // Aquí puedes llamar a la función que deseas ejecutar después de 4 segundos
                    }, 1000); // 4000 milisegundos = 4 segundos
                  }}
                  className="shadow menu-open-btn ease-in-up mt-6 text-md px-6 py-2.5 w-full bg-primary md:hover:scale-105 duration-300  text-secondary "
                  style={{ borderRadius: "var(--radius)" }}
                >
                  Comprar ahora
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CartCanvas;
