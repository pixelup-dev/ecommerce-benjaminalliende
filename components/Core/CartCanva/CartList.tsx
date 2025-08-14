/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect, useCallback } from "react";

const noop = () => {};

function CartList({
  cartItems,
  decrementQuantity,
  incrementQuantity,
  removeItem,
  setItemAvailability = noop,
}: any) {
  const [productDetails, setProductDetails] = useState<any>({});

  const fetchProductDetails = useCallback(
    async (productId: string, itemId: string) => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/products/${productId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`
        );

        const data = await response.json();

        const { enabledForDelivery, enabledForWithdrawal } = data.product;

        setProductDetails((prevDetails: any) => ({
          ...prevDetails,
          [itemId]: {
            enabledForDelivery,
            enabledForWithdrawal,
          },
        }));
        setItemAvailability(itemId, enabledForDelivery, enabledForWithdrawal);
      } catch (error) {
        console.error("Error fetching product details:", error);
      }
    },
    [setItemAvailability]
  );

  useEffect(() => {
    cartItems.forEach((item: any) => {
      const productId = item.sku.product.id;
      if (!productDetails[item.id]) {
        fetchProductDetails(productId, item.id);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartItems, fetchProductDetails]);

  const sortedCartItems = [...cartItems].sort((a, b) => b.id.localeCompare(a.id));
  return (
    <>
      {sortedCartItems.map((item: any) => (
        <div
          data-ignore-outside-click
          key={item.id}
          className="flex flex-col gap-5 py-6 border-b border-gray-200 group relative"
        >
          <div>
            <h6 className="font-semibold text-base leading-7 text-black">
              {item.sku.product.name}
            </h6>
          </div>
          <div className="flex items-center gap-4">
            <button
              data-ignore-outside-click
              onClick={() => removeItem(item.id)}
              className="w-6 h-6 top-4 right-0 flex items-center absolute justify-center text-dark hover:text-red-600 "
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-6 h-6"
              >
                <path
                  fillRule="evenodd"
                  d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-.355 5.945a.75.75 0 1 0-1.5.058l.347 9a.75.75 0 1 0 1.499-.058l-.346-9Zm5.48.058a.75.75 0 1 0-1.498-.058l-.347 9a.75.75 0 0 0 1.5.058l.345-9Z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <div className="w-full max-w-24">
              <img
                src={item.sku.mainImageUrl}
                alt={item.sku.product.name}
                className="mx-auto shadow-md max-h-24 w-full object-cover"
                style={{ borderRadius: "var(--radius)" }}
              />
            </div>

            <div className="flex w-full justify-between ">
              <div className="col-span-1 min-w-24 self-center">
                <div className="flex flex-col  items-center">
                  <h6 className="font-medium  text-xl leading-7 text-primary transition-all duration-300 ">
                    ${item.totalPrice.toLocaleString("es-CL")}
                  </h6>
                </div>
                {item.attributes && item.attributes.length > 0 && (
                  <div className="item-attributes">
                    <ul>
                      {item.attributes
                        .slice(0, 2)
                        .map((attribute: any, index: number) => (
                          <li key={index}>
                            <small>{attribute.label}:</small>{" "}
                            <small className="font-bold">
                              {attribute.value}
                            </small>
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-center">
                <div className="flex items-center w-fit  justify-center h-full ">
                  <div className="flex items-center h-full">
                    <button
                      data-ignore-outside-click
                      onClick={() => decrementQuantity(item.id)}
                      className="group rounded-l-xl px-2 py-[8px] flex items-center justify-center shadow-sm shadow-transparent transition-all duration-500 "
                    >
                      <svg
                        className="stroke-gray-900 transition-all duration-500 group-hover:stroke-red-800"
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 22 22"
                        fill="none"
                      >
                        <path
                          d="M16.5 11H5.5"
                          stroke=""
                          strokeWidth="1.6"
                          strokeLinecap="round"
                        />
                        <path
                          d="M16.5 11H5.5"
                          strokeOpacity="0.2"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                        />
                        <path
                          d="M16.5 11H5.5"
                          strokeOpacity="0.2"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                        />
                      </svg>
                    </button>
                    <span
                      className="border border-gray-200 outline-none  h-10 w-10 flex items-center justify-center text-gray-900 font-semibold text-lg bg-transparent"
                      style={{ borderRadius: "var(--radius)" }}
                    >
                      {item.quantity}
                    </span>

                    <button
                      data-ignore-outside-click
                      onClick={() => incrementQuantity(item.id)}
                      className="group rounded-l-xl px-2 py-[8px] flex items-center justify-center shadow-sm shadow-transparent transition-all duration-500 "
                    >
                      <svg
                        className="stroke-gray-900 transition-all duration-500 group-hover:stroke-green-800"
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 22 22"
                        fill="none"
                      >
                        <path
                          d="M11 5.5V16.5M16.5 11H5.5"
                          stroke=""
                          strokeWidth="1.6"
                          strokeLinecap="round"
                        />
                        <path
                          d="M11 5.5V16.5M16.5 11H5.5"
                          strokeOpacity="0.2"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                        />
                        <path
                          d="M11 5.5V16.5M16.5 11H5.5"
                          strokeOpacity="0.2"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap">
            <p>
              {productDetails[item.id]?.enabledForDelivery ? (
                <div className="flex">
                  <span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="size-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"
                      />
                    </svg>
                  </span>
                  <small className="px-2 text-black self-center">
                    Disponible para Delivery
                  </small>
                </div>
              ) : (
                <div className="flex">
                  <span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="size-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"
                      />
                    </svg>
                  </span>

                  <small className="px-2 text-red-800 self-center">
                    Delivery No Disponible
                  </small>
                </div>
              )}
            </p>
            <p>
              {productDetails[item.id]?.enabledForWithdrawal ? (
                <div className="flex">
                  <span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="size-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z"
                      />
                    </svg>
                  </span>
                  <small className="px-2 text-black self-center">
                    Disponible para Retiro
                  </small>
                </div>
              ) : (
                <div className="flex">
                  <span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="size-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z"
                      />
                    </svg>
                  </span>

                  <small className="px-2 text-red-800 self-center">
                    Retiro No Disponible
                  </small>
                </div>
              )}
            </p>
          </div>
        </div>
      ))}
    </>
  );
}

export default CartList;
