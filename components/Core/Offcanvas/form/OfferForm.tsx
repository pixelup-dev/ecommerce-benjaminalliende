/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import axios from "axios";
import { getCookie } from "cookies-next";
import toast from "react-hot-toast";
import { useRevalidation } from "@/app/Context/RevalidationContext";

type Offer = {
  unitPrice: any;
  startDate: any;
  endDate: any;
  currencyCodeId: any;
};

type OfferFormProps = {
  id: string;
  skuId: string;
  fetchVariations: any;
  handleMenuClose: any;
  offerToEdit: any;
  onSave: any;
  unitPrice: string;
  startDate: string;
  endDate: string;
  currencyCodeId: string;
  setUnitPrice: any;
  setStartDate: any;
  setEndDate: any;
  setCurrencyCodeId: any;
  fetchOffersForProduct: any;
};

function OfferForm({
  id,
  skuId,
  fetchVariations,
  handleMenuClose,
  offerToEdit,
  onSave,
  unitPrice,
  startDate,
  endDate,
  currencyCodeId,
  setEndDate,
  setUnitPrice,
  setCurrencyCodeId,
  setStartDate,
  fetchOffersForProduct,
}: OfferFormProps) {
  const { triggerRevalidation } = useRevalidation();

  useEffect(() => {
    const fetchCurrencyCode = async () => {
      try {
        const token = getCookie("AdminTokenAuth");
        const currencyResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/currency-codes?pageNumber=1&pageSize=50&statusCode=ACTIVE`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        setCurrencyCodeId(currencyResponse.data.currencyCodes[0].id);
      } catch (error) {
        console.error("Error fetching currency code:", error);
      }
    };

    fetchCurrencyCode();
  }, []);

  useEffect(() => {
    if (offerToEdit) {
      setUnitPrice(offerToEdit.unitPrice.toString());
      setStartDate(offerToEdit.startDate); // Formatear fecha a "YYYY-MM-DD"
      setEndDate(offerToEdit.endDate); // Formatear fecha a "YYYY-MM-DD"
    } else {
      setUnitPrice("");
      setStartDate("");
      setEndDate("");
    }
  }, [offerToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validación de fechas
    if (new Date(startDate) >= new Date(endDate)) {
      toast.error("La fecha de inicio debe ser menor que la fecha de fin");
      return;
    }

    const updatedOffer: Offer = {
      unitPrice: parseFloat(unitPrice),
      startDate,
      endDate,
      currencyCodeId,
    };

    try {
      const token = String(getCookie("AdminTokenAuth"));
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };

      let response;
      if (offerToEdit && offerToEdit.id) {
        // Actualizar oferta existente
        response = await axios.put(
          `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/products/${id}/skus/${offerToEdit.skuId}/offers/${offerToEdit.id}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
          updatedOffer,
          config
        );
        console.log("Oferta actualizada con éxito:", response.data);
        toast.success("Oferta actualizada con éxito");
      } else {
        // Crear nueva oferta
        response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/products/${id}/skus/${skuId}/offers?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
          updatedOffer,
          config
        );
        console.log("Oferta creada con éxito:", response.data);
        toast.success("Oferta creada con éxito");
      }

      // Actualizar datos en la interfaz
      fetchVariations();
      fetchOffersForProduct(id, skuId);
      onSave(updatedOffer);
      
      // Agregar revalidación de caché
      await triggerRevalidation([
        'products',
        'collections',
        `product-${id}`,
        'offers'
      ]);
      
      handleMenuClose();
    } catch (error: any) {
      // Manejar errores específicos
      if (
        error.response &&
        error.response.data &&
        error.response.data.code === 3
      ) {
        const mensajeError =
          "Error: Hay 1 oferta en conflicto con la información actual.";
        toast.error(mensajeError); // O utiliza otra forma de mostrar el mensaje al usuario
      } else {
        // Manejo de otros errores
        const mensajedeError =
          "Ocurrió un error al guardar la oferta. Por favor, inténtalo de nuevo.";
        toast.error(mensajedeError); // O utiliza otra forma de mostrar el mensaje al usuario
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md"
    >
      <div className="mb-4">
        <label className="block text-white text-sm font-bold mb-2">
          Precio Oferta
        </label>
        <input
          type="number"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          value={unitPrice}
          onChange={(e) => setUnitPrice(e.target.value)}
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-white text-sm font-bold mb-2">
          Fecha de Inicio
        </label>
        <input
          type="date"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-white text-sm font-bold mb-2">
          Fecha de Fin
        </label>
        <input
          type="date"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          required
        />
      </div>
      <div className="flex items-center justify-between">
        <button
          type="submit"
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          {offerToEdit ? "Actualizar Oferta" : "Crear Oferta"}
        </button>
      </div>
    </form>
  );
}

export default OfferForm;
