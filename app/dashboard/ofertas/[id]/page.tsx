/* eslint-disable @next/next/no-img-element */
"use client";
import { useEffect, useState } from "react";
import { getCookie } from "cookies-next";
import { useParams } from "next/navigation";
import Breadcrumb from "@/components/Core/Breadcrumbs/Breadcrumb";
import axios from "axios";
import OfferCanvas from "@/components/Core/Offcanvas/OfferCanvas";
import Link from "next/link";
import toast from "react-hot-toast";
import BulkOfferModal from "@/components/Core/Modals/BulkOfferModal";
import { useRevalidation } from "@/app/Context/RevalidationContext";

type Offer = {
  id: any;
  currencyCodeId: any;
  unitPrice: any;
  startDate: any;
  endDate: any;
  productId: any;
  skuId: any;
};

function DetalleOferta() {
  const { id } = useParams();
  const [expiredOffers, setExpiredOffers] = useState<Offer[]>([]);
  const { triggerRevalidation } = useRevalidation();
  const [sku, setSku] = useState<any[]>([]);
  const [product, setProduct] = useState<any>(null);
  const [currentAttributes, setCurrentAttributes] = useState<
    Record<string, any[]>
  >({});
  const [currentPrices, setCurrentPrices] = useState<
    Record<string, number | null>
  >({});
  const [variationsWithOffers, setVariationsWithOffers] = useState<any>({});
  const [selectedVariation, setSelectedVariation] = useState<any>(null);
  const [selectedRow, setSelectedRow] = useState<string | null>(null);

  const [offers, setOffers] = useState<Offer[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [offerToDelete, setOfferToDelete] = useState<string | null>(null);
  const [isOffcanvasOpen, setIsOffcanvasOpen] = useState(false);
  const [offerToEdit, setOfferToEdit] = useState<Offer | any>({
    id: "",
    currencyCodeId: "",
    unitPrice: 0,
    startDate: undefined,
    endDate: undefined,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);

  const handleVariationSelect = async (variation: any) => {
    console.log("Variación seleccionada:", variation);
    setSelectedVariation(variation);
    setSelectedRow(variation.id); // Aquí se establece la fila seleccionada
    await fetchOffersForProduct(id as string, variation.id);
  };
  const handleEditOffer = (offerId: string) => {
    const activeOffer = offers.find((o) => o.id === offerId);
    const expiredOffer = expiredOffers.find((o) => o.id === offerId);

    const offer = activeOffer || expiredOffer;

    if (offer) {
      console.log("Editando oferta:", offer);
      setOfferToEdit(offer);
      setIsOffcanvasOpen(true);
    } else {
      console.log("No se encontró ninguna oferta con el ID proporcionado.");
    }
  };

  const handleDeleteOffer = (offerId: string) => {
    setOfferToDelete(offerId); // Guarda el ID de la oferta
    setShowModal(true);
  };

  const handleModalConfirm = async () => {
    // Si el producto es variable, usamos el selectedVariation.id
    // Si no es variable, usamos product.skuId directamente
    const skuId = selectedVariation ? selectedVariation.id : product?.skuId;

    if (offerToDelete && skuId) {
      try {
        const token = String(getCookie("AdminTokenAuth"));
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        };

        const url = `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/products/${id}/skus/${skuId}/offers/${offerToDelete}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`;

        await axios.delete(url, config);
        await triggerRevalidation();

        console.log("Oferta eliminada exitosamente");

        // Recargar la página después de eliminar la oferta
        window.location.reload();
      } catch (error) {
        console.log("Error al eliminar la oferta:", error);
      }
    } else {
      console.log("Faltan datos para eliminar la oferta");
    }
  };

  const handleModalCancel = () => {
    setShowModal(false);
  };

  const handleSaveOffer = async (updatedOffer: Offer) => {
    try {
      const token = String(getCookie("AdminTokenAuth"));
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };

      const formattedOffer = {
        ...updatedOffer,
        currencyCodeId: "8ccc1abd-b35b-45ff-b814-b7c78fff3594",
        startDate: updatedOffer?.startDate?.[0],
        endDate: updatedOffer?.endDate?.[0],
      };

      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/products/${updatedOffer.productId}/skus/${updatedOffer.skuId}/offers/${updatedOffer.id}`,
        formattedOffer,
        config
      );

      await triggerRevalidation();
      console.log("Oferta actualizada con éxito:", response.data);
      toast.success("Oferta actualizada exitosamente");

      fetchOffersForProduct(updatedOffer.productId, updatedOffer.skuId);
      setIsOffcanvasOpen(false);
    } catch (error) {
      console.log("Error al actualizar la oferta:", error);
    }
  };

  const fetchPriceForProduct = async (productId: string, skuId: string) => {
    try {
      const token = getCookie("AdminTokenAuth");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/products/${productId}/skus/${skuId}/pricings?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      if (data.code === 0 && data.skuPricings.length > 0) {
        return data.skuPricings[0].unitPrice;
      } else {
        console.error("Error al obtener el precio del producto:", data.message);
        return null;
      }
    } catch (error) {
      console.error("Error al obtener el precio del producto:", error);
      return null;
    }
  };

  const fetchVariations = async () => {
    try {
      const token = getCookie("AdminTokenAuth");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/products/${id}/skus?statusCode=ACTIVE&siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const responseVariations = await response.json();

      if (responseVariations.code === 0) {
        const filteredVariations = responseVariations.skus.filter(
          (variation: any) => !variation.isBaseSku
        );
        const attributesByVariation: Record<string, any[]> = {};
        const pricesByVariation: Record<string, number | null> = {};
        const offersByVariation: Record<string, boolean> = {};

        const fetchTasks = filteredVariations.map(async (variation: any) => {
          const [attributes, price, hasOffer] = await Promise.all([
            fetchAttributesForVariation(id as string, variation.id),
            fetchPriceForVariation(id as string, variation.id),
            fetchHasOfferForVariation(id as string, variation.id),
          ]);
          attributesByVariation[variation.id] = attributes;
          pricesByVariation[variation.id] = price;
          offersByVariation[variation.id] = hasOffer;
        });

        await Promise.all(fetchTasks);
        setCurrentAttributes(attributesByVariation);
        setCurrentPrices(pricesByVariation);
        setVariationsWithOffers(offersByVariation);

        setSku(filteredVariations);
      } else {
        console.error("Error fetching variations:", responseVariations.message);
      }
    } catch (error) {
      console.error("Error fetching variations:", error);
    }
  };

  const fetchProductDetails = async () => {
    try {
      const token = getCookie("AdminTokenAuth");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/products/${id}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      if (data.code === 0) {
        const fetchedProduct = data.product;
        setProduct(fetchedProduct);

        if (!fetchedProduct.hasVariations) {
          const productPrice = await fetchPriceForProduct(
            id as string,
            fetchedProduct.skuId
          );
          setCurrentPrices((prevPrices) => ({
            ...prevPrices,
            [fetchedProduct.skuId]: productPrice,
          }));
        }
      } else {
        console.error("Error fetching product details:", data.message);
      }
    } catch (error) {
      console.error("Error fetching product details:", error);
    }
  };

  useEffect(() => {
    fetchProductDetails();
    fetchVariations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (product) {
      if (!product.hasVariations) {
        // Para productos simples
        fetchHasOfferForVariation(id as string, product.skuId).then(hasOffer => {
          setVariationsWithOffers((prev: Record<string, boolean>) => ({
            ...prev,
            [product.skuId]: hasOffer
          }));
        });
      }
      fetchOffersForProduct(id as string, product.skuId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product]);

  const fetchOffersForProduct = async (productId: string, skuId?: string) => {
    try {
      const token = getCookie("AdminTokenAuth");
      const url = skuId
        ? `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/products/${productId}/skus/${skuId}/offers?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`
        : `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/products/${productId}/offers?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      if (data.code === 0) {
        const currentOffers = data.skuOffers || data.offers;

        // Obtener la fecha y hora actual en Santiago de Chile
        const now = new Date(
          new Date().toLocaleString("en-US", { timeZone: "America/Santiago" })
        );

        const expired = currentOffers.filter((offer: Offer) => {
          // Convertir la fecha de fin a zona horaria de Chile y establecer a 23:59:59
          const endDate = new Date(offer.endDate);
          const endDateChile = new Date(
            endDate.toLocaleString("en-US", {
              timeZone: "America/Santiago",
            })
          );
          endDateChile.setHours(23, 59, 59, 999);

          return endDateChile < now;
        });

        const activeOffers = currentOffers.filter((offer: Offer) => {
          // Convertir la fecha de fin a zona horaria de Chile y establecer a 23:59:59
          const endDate = new Date(offer.endDate);
          const endDateChile = new Date(
            endDate.toLocaleString("en-US", {
              timeZone: "America/Santiago",
            })
          );
          endDateChile.setHours(23, 59, 59, 999);

          return endDateChile >= now;
        });

        console.log("Fecha actual (Santiago):", now);
        console.log("Ofertas activas:", activeOffers);
        console.log("Ofertas expiradas:", expired);

        setOffers(activeOffers);
        setExpiredOffers(expired);
      } else {
        console.error("Error al obtener las ofertas:", data.message);
        setOffers([]);
        setExpiredOffers([]);
      }
    } catch (error) {
      console.error("Error al obtener las ofertas:", error);
      setOffers([]);
      setExpiredOffers([]);
    }
  };

  const fetchHasOfferForVariation = async (
    productId: string,
    skuId: string
  ): Promise<boolean> => {
    try {
      const token = getCookie("AdminTokenAuth");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/products/${productId}/skus/${skuId}/offers?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      return data.skuOffers && data.skuOffers.length > 0;
    } catch (error) {
      console.error("Error al obtener el skuOffers de la variación:", error);
      return false;
    }
  };

  const fetchPriceForVariation = async (productId: string, skuId: string) => {
    try {
      const token = getCookie("AdminTokenAuth");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/products/${productId}/skus/${skuId}/pricings?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      if (data.code === 0) {
        return data.skuPricings.length > 0
          ? data.skuPricings[0].unitPrice
          : null;
      } else {
        console.error(
          "Error al obtener el precio de la variación:",
          data.message
        );
        return null;
      }
    } catch (error) {
      console.error("Error al obtener el precio de la variación:", error);
      return null;
    }
  };

  const fetchAttributesForVariation = async (
    productId: string,
    skuId: string
  ) => {
    try {
      const token = getCookie("AdminTokenAuth");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/products/${productId}/skus/${skuId}/attributes?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const responseData = await response.json();
      if (responseData.code === 0) {
        return responseData.skuAttributes.map((skuAttribute: any) => ({
          value: skuAttribute.value,
          label: skuAttribute.attribute.name,
        }));
      } else {
        console.error(
          "Error al obtener los atributos de la variación:",
          responseData.message
        );
        return [];
      }
    } catch (error) {
      console.error("Error al obtener los atributos de la variación:", error);
      return [];
    }
  };

  const formatDateToChileanTime = (isoDateString: string) => {
    const date = new Date(isoDateString);

    // Ajustar la hora a la zona horaria de Chile (GMT-4)
    const timezoneOffset = -4 * 60; // -4 horas en minutos
    const adjustedDate = new Date(date.getTime() + timezoneOffset * 60 * 1000);

    const day = adjustedDate.getDate().toString().padStart(2, "0");
    const month = (adjustedDate.getMonth() + 1).toString().padStart(2, "0"); // Los meses son 0-indexados
    const year = adjustedDate.getFullYear();
    const hours = adjustedDate.getHours().toString().padStart(2, "0");
    const minutes = adjustedDate.getMinutes().toString().padStart(2, "0");

    return `${day}-${month}-${year}`;
  };

  const handleCreateBulkOffer = async () => {
    if (!product?.hasVariations) {
      return;
    }

    setIsModalOpen(true);
  };

  const handleModalSubmit = async (formData: {
    unitPrice: string;
    startDate: string;
    endDate: string;
  }) => {
    try {
      const token = String(getCookie("AdminTokenAuth"));
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };

      const variations = sku;

      // Validar fechas
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);

      if (startDate >= endDate) {
        toast.error("La fecha de inicio debe ser menor que la fecha de fin");
        return;
      }

      const offerData = {
        ...formData,
        currencyCodeId: "8ccc1abd-b35b-45ff-b814-b7c78fff3594",
      };

      const promises = variations.map(async (variation) => {
        try {
          await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/products/${id}/skus/${variation.id}/offers?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
            {
              ...offerData,
              unitPrice: parseFloat(offerData.unitPrice),
            },
            config
          );
          return true;
        } catch (error) {
          console.error(
            `Error al crear oferta para variación ${variation.id}:`,
            error
          );
          return false;
        }
      });

      const results = await Promise.all(promises);
      const successCount = results.filter((result) => result).length;

      if (successCount === variations.length) {
        toast.success(
          `Se crearon ofertas para todas las variaciones (${successCount}/${variations.length})`
        );
        await triggerRevalidation();
      } else {
        toast.error(
          `Se crearon ${successCount} de ${variations.length} ofertas`
        );
      }

      setIsModalOpen(false);

      // Actualizar la vista
      fetchVariations();
      if (product) {
        fetchOffersForProduct(id as string, product.skuId);
      }
    } catch (error) {
      console.error("Error al crear ofertas en masa:", error);
      toast.error("Error al crear las ofertas en masa");
    }
  };

  const handleBulkDeleteOffers = () => {
    setShowBulkDeleteModal(true);
  };

  const handleBulkDeleteConfirm = async () => {
    try {
      const token = String(getCookie("AdminTokenAuth"));
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };

      let successCount = 0;

      // Obtener la fecha actual en la zona horaria de Chile
      const now = new Date(
        new Date().toLocaleString("en-US", { timeZone: "America/Santiago" })
      );

      if (product.hasVariations) {
        // Lógica para productos variables
        const variations = sku;
        const promises = variations.map(async (variation) => {
          try {
            const response = await axios.get(
              `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/products/${id}/skus/${variation.id}/offers?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
              config
            );

            const allOffers = response.data.skuOffers || [];

            // Filtrar solo las ofertas activas
            const activeOffers = allOffers.filter((offer: any) => {
              const endDate = new Date(offer.endDate);
              const endDateChile = new Date(
                endDate.toLocaleString("en-US", {
                  timeZone: "America/Santiago",
                })
              );
              endDateChile.setHours(23, 59, 59, 999);

              return endDateChile >= now;
            });

            const deletePromises = activeOffers.map(async (offer: any) => {
              await axios.delete(
                `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/products/${id}/skus/${variation.id}/offers/${offer.id}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
                config
              );
            });

            await Promise.all(deletePromises);
            successCount += activeOffers.length;
            await triggerRevalidation();
            return true;
          } catch (error) {
            console.error(
              `Error al eliminar ofertas para variación ${variation.id}:`,
              error
            );
            return false;
          }
        });

        await Promise.all(promises);
      } else {
        // Lógica para productos no variables
        try {
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/products/${id}/skus/${product.skuId}/offers?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
            config
          );

          const allOffers = response.data.skuOffers || [];

          // Filtrar solo las ofertas activas
          const activeOffers = allOffers.filter((offer: any) => {
            const endDate = new Date(offer.endDate);
            const endDateChile = new Date(
              endDate.toLocaleString("en-US", {
                timeZone: "America/Santiago",
              })
            );
            endDateChile.setHours(23, 59, 59, 999);

            return endDateChile >= now;
          });

          const deletePromises = activeOffers.map(async (offer: any) => {
            await axios.delete(
              `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/products/${id}/skus/${product.skuId}/offers/${offer.id}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
              config
            );
          });

          await Promise.all(deletePromises);
          successCount = activeOffers.length;
          await triggerRevalidation();
        } catch (error) {
          console.error("Error al eliminar ofertas:", error);
        }
      }

      if (successCount > 0) {
        toast.success(
          `Se eliminaron ${successCount} ofertas activas exitosamente`
        );
      } else {
        toast.success("No se encontraron ofertas activas para eliminar");
      }

      // Actualizar la vista
      if (product.hasVariations) {
        fetchVariations();
      }
      fetchOffersForProduct(id as string, product.skuId);
    } catch (error) {
      console.error("Error al eliminar ofertas en masa:", error);
      toast.error("Error al eliminar las ofertas");
    } finally {
      setShowBulkDeleteModal(false);
    }
  };

  return (
    <section className="p-10">
      <Breadcrumb pageName="Administrar Oferta" />
      <div className="flex justify-between w-full mx-4 mb-6">
        <Link
          href="/dashboard/ofertas"
          className="px-4 py-2 bg-primary text-white rounded-md mt-4"
        >
          Volver
        </Link>
      </div>
      <div className="bg-white border dark:bg-gray-800 relative shadow-md sm:rounded-lg overflow-hidden mx-auto py-6">
        <div className="flex flex-col md:flex-row items-center justify-center p-4">
          <div className="w-full md:w-2/3 flex flex-col items-center">
            <div className="flex flex-col items-center justify-center text-center text-4xl mb-4">
              {product && <h3>{product.name}</h3>}
            </div>
          </div>
        </div>
        <div className="mx-12 mb-4 flex items-center justify-between gap-4">
          <div
            className="flex-1 shadow rounded flex items-center p-4 text-sm text-blue-800 border border-blue-300 bg-blue-50 dark:bg-gray-800 dark:text-blue-400 dark:border-blue-800"
            role="alert"
          >
            <svg
              className="flex-shrink-0 inline w-4 h-4 me-3"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
            </svg>
            <span className="sr-only">Info</span>
            <div>
              Presiona el botón <span className="font-bold">Crear Oferta </span>
              en cualquier producto y luego elige la variación que quieres
              editar.
            </div>
          </div>

          <div className="flex items-center gap-2">
            {product?.hasVariations && (
              <button
                onClick={handleCreateBulkOffer}
                className="px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors whitespace-nowrap"
              >
                Crear Oferta Masiva
              </button>
            )}
            <button
              onClick={handleBulkDeleteOffers}
              className="px-4 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors whitespace-nowrap"
            >
              Eliminar Ofertas Activas
            </button>
          </div>
        </div>

        {product && (
          <div className="overflow-x-auto max-w-[1500px] mx-auto">
            <table className="min-w-full text-sm text-gray-500 dark:text-gray-400 text-center border-collapse">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th className="px-2 py-2">Imagen</th>
                  <th className="px-2 py-2">Precio Normal</th>
                  <th className="px-2 py-2">Atributos</th>
                  <th className="px-2 py-2">Oferta</th>
                  <th className="px-2 py-2">Crear/Editar</th>
                </tr>
              </thead>
              <tbody>
                {product.hasVariations ? (
                  sku.map((item) => (
                    <tr
                      key={item.id}
                      className={`dark:border-gray-700 ${
                        selectedRow === item.id ? "bg-gray-100" : ""
                      }`}
                    >
                      <td className="px-2 py-2 border border-gray-300">
                        <img
                          className="w-14 h-14 object-cover mx-auto"
                          alt={item.name}
                          src={item.mainImageUrl}
                        />
                      </td>
                      <td className="px-2 py-2 border border-gray-300">
                        {currentPrices[item.id]?.toLocaleString("es-CL")
                          ? `$${currentPrices[item.id]?.toLocaleString(
                              "es-CL"
                            )}`
                          : "N/A"}
                      </td>
                      <td className="px-2 py-2 border border-gray-300 text-center">
                        <div className="current-attributes">
                          {currentAttributes[item.id]?.length ? (
                            currentAttributes[item.id].map(
                              (attribute, attrIndex) => (
                                <div
                                  key={attrIndex}
                                  className="mt-1 flex flex-wrap justify-center uppercase"
                                >
                                  <div className="bg-primary text-secondary px-1 py-0.5 rounded text-xs">
                                    {attribute.label}:{" "}
                                    <span className="font-bold">
                                      {attribute.value}
                                    </span>
                                  </div>
                                </div>
                              )
                            )
                          ) : (
                            <span>No hay atributos disponibles</span>
                          )}
                        </div>
                      </td>
                      <td className="px-2 py-2 border border-gray-300">
                        {variationsWithOffers[item.id] ? "Sí" : "No"}
                      </td>
                      <td className="px-2 py-2 border border-gray-300">
                        <div className="flex flex-wrap justify-center gap-4">
                          {variationsWithOffers[item.id] ? (
                            <button
                              onClick={() => handleVariationSelect(item)}
                              className="bg-primary hover:bg-secondary text-secondary text-center hover:text-primary py-2 px-4 rounded-sm"
                            >
                              Ofertas Creadas
                            </button>
                          ) : null}

                          <OfferCanvas
                            itemId={product.id}
                            skuId={item.id}
                            setSelectedRow={setSelectedRow}
                            fetchVariations={fetchVariations}
                            offerToEdit={offerToEdit}
                            onSave={handleSaveOffer}
                            isOpen={isOffcanvasOpen}
                            onClose={() => setIsOffcanvasOpen(false)}
                            fetchOffersForProduct={fetchOffersForProduct}
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr
                    className={`dark:border-gray-700 ${
                      selectedRow === product.skuId ? "bg-gray-100" : ""
                    }`}
                  >
                    <td className="px-2 py-2 border border-gray-300">
                      <img
                        className="w-14 h-14 object-cover mx-auto"
                        alt={product.name}
                        src={product.mainImageUrl}
                      />
                    </td>
                    <td className="px-2 py-2 border border-gray-300">
                      {currentPrices[product.skuId] != null
                        ? `$${currentPrices[product.skuId]?.toLocaleString(
                            "es-CL"
                          )}`
                        : "N/A"}
                    </td>
                    <td className="px-2 py-2 border border-gray-300 text-center">
                      <span>No hay atributos disponibles</span>
                    </td>
                    <td className="px-2 py-2 border border-gray-300">
                      {variationsWithOffers[product.skuId] ? "Sí" : "No"}
                    </td>
                    <td className="px-2 py-2 border border-gray-300">
                      <div className="flex flex-wrap justify-center gap-4">
                        {variationsWithOffers[product.skuId] ? (
                          <button
                            onClick={() =>
                              fetchOffersForProduct(id as string, product.skuId)
                            }
                            className="bg-primary text-white px-1 py-0.5 rounded hover:underline"
                          >
                            Ver Ofertas
                          </button>
                        ) : null}

                        <OfferCanvas
                          itemId={product.id}
                          setSelectedRow={setSelectedRow}
                          skuId={product.skuId}
                          fetchVariations={fetchVariations}
                          offerToEdit={offerToEdit}
                          onSave={handleSaveOffer}
                          isOpen={isOffcanvasOpen}
                          onClose={() => setIsOffcanvasOpen(false)}
                          fetchOffersForProduct={fetchOffersForProduct}
                        />
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="w-full">
          {(selectedVariation || (product && !product.hasVariations)) && (
            <div className="pb-6">
              <h2 className="text-center font-semibold uppercase py-6">
                Ofertas Activas
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-gray-500 dark:text-gray-400 text-center border-collapse">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                      <th className="px-2 py-2">Precio Oferta</th>
                      <th className="px-2 py-2">Fecha de Inicio</th>
                      <th className="px-2 py-2">Fecha de Fin</th>
                      <th className="px-2 py-2">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {offers.length ? (
                      offers.map((offer) => (
                        <tr
                          key={offer.id}
                          className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                        >
                          <td className="px-2 py-2">
                            ${offer.unitPrice.toLocaleString("es-CL")}
                          </td>
                          <td className="px-2 py-2">
                            {" "}
                            {offer.startDate.split("-").reverse().join("/")}
                          </td>
                          <td className="px-2 py-2">
                            {offer.endDate.split("-").reverse().join("/")}
                          </td>
                          <td className="px-2 py-2 flex justify-center gap-2">
                            <button
                              onClick={() => handleEditOffer(offer.id)}
                              className="bg-dark text-white px-2 py-1 rounded hover:bg-secondary hover:text-dark"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDeleteOffer(offer.id)}
                              className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-700"
                            >
                              Eliminar
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-2 py-2"
                        >
                          No hay ofertas disponibles
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
        <div className="w-full">
          {(selectedVariation || (product && !product.hasVariations)) && (
            <div className="pb-6">
              <h2 className="text-center font-semibold uppercase py-6">
                Ofertas Expiradas
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-gray-500 dark:text-gray-400 text-center border-collapse">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                      <th className="px-2 py-2">Precio Oferta</th>
                      <th className="px-2 py-2">Fecha de Inicio</th>
                      <th className="px-2 py-2">Fecha de Fin</th>
                      <th className="px-2 py-2">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expiredOffers.length ? (
                      expiredOffers.map((offer) => (
                        <tr
                          key={offer.id}
                          className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                        >
                          <td className="px-2 py-2">
                            ${offer.unitPrice.toLocaleString("es-CL")}
                          </td>
                          <td className="px-2 py-2">
                            {" "}
                            {offer.startDate.split("-").reverse().join("/")}
                          </td>
                          <td className="px-2 py-2">
                            {offer.endDate.split("-").reverse().join("/")}
                          </td>
                          <td className="px-2 py-2 flex justify-center gap-2">
                            <button
                              onClick={() => handleEditOffer(offer.id)}
                              className="bg-dark text-white px-2 py-1 rounded hover:bg-secondary hover:text-dark"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDeleteOffer(offer.id)}
                              className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-700"
                            >
                              Eliminar
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-2 py-2"
                        >
                          No hay ofertas expiradas disponibles
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Modal de confirmación */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Confirmar Eliminación
              </h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  ¿Está seguro de que desea eliminar esta oferta? Una vez eliminada, no podrá recuperarla.
                </p>
              </div>
            </div>
            <div className="mt-5 flex justify-center gap-4">
              <button
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                onClick={handleModalConfirm}
              >
                Eliminar
              </button>
              <button
                className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
                onClick={handleModalCancel}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
      <BulkOfferModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
      />
      {/* Modal de confirmación para eliminación masiva */}
      {showBulkDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Confirmar Eliminación Masiva
              </h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  ¿Estás seguro de que deseas eliminar todas las ofertas
                  activas? Esta acción eliminará todas las ofertas vigentes para
                  todas las variaciones del producto y no se puede deshacer.
                </p>
              </div>
            </div>
            <div className="mt-5 flex justify-center gap-4">
              <button
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                onClick={handleBulkDeleteConfirm}
              >
                Eliminar Todas
              </button>
              <button
                className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
                onClick={() => setShowBulkDeleteModal(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default DetalleOferta;
