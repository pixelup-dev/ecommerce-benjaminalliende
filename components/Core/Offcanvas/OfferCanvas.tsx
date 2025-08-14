"use client";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import OfferForm from "./form/OfferForm";

type Offer = {
  id: string;
  unitPrice: number;
  startDate: any;
  endDate: any;
};

type OfferCanvasProps = {
  itemId: string;
  skuId: string;
  fetchVariations: any;
  offerToEdit?: any;
  onSave: any;
  isOpen: boolean;
  fetchOffersForProduct: any;
  onClose: () => void;
  setSelectedRow: any;
};

function OfferCanvas({
  itemId,
  skuId,
  fetchVariations,
  offerToEdit,
  onSave,
  isOpen,
  onClose,
  setSelectedRow,
  fetchOffersForProduct,
}: OfferCanvasProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(isOpen);
  const offcanvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscKey);

    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [onClose]);

  useEffect(() => {
    if (!offcanvasRef.current) return;

    if (isOpen) {
      offcanvasRef.current.classList.add("translate-x-0");
      setIsMenuOpen(true);
    } else {
      offcanvasRef.current.classList.remove("translate-x-0");
      offcanvasRef.current.classList.add("translate-x-full");
      setIsMenuOpen(false);
    }
  }, [isOpen]);

  const handleMenuOpen = () => {
    setIsMenuOpen(true);
  };

  const [unitPrice, setUnitPrice] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currencyCodeId, setCurrencyCodeId] = useState("");

  const handleMenuOpenCreate = () => {
    setIsMenuOpen(true);
    setUnitPrice("");
    setStartDate("");
    setEndDate("");
    fetchOffersForProduct(itemId, skuId);
    setSelectedRow(skuId);
    setCurrencyCodeId("8ccc1abd-b35b-45ff-b814-b7c78fff3594"); // Default currencyCodeId
  };

  const handleMenuClose = () => {
    setIsMenuOpen(false);
    onClose();
  };

  return (
    <div>
      <button
        onClick={(e) => {
          e.preventDefault(); // Para evitar el comportamiento por defecto del enlace
          handleMenuOpenCreate();
        }}
        className="menu-open-btn ease-in-up rounded-sm bg-green-700 px-8 py-3 text-base font-medium text-white shadow-btn transition duration-300 hover:bg-secondary hover:text-primary hover:shadow-btn-hover md:block md:px-9 lg:px-6 xl:px-9"
      >
        Crear Oferta
      </button>

      <div
        ref={offcanvasRef}
        className={`offcanvas-menu fixed z-50 bg-black h-screen dark:border-strokedark dark:bg-form-strokedark top-20 right-0 p-6 w-2/3 md:w-[500px] ease-in-out duration-1000 shadow-md flex items-center ${
          isMenuOpen ? "" : "translate-x-full"
        }`}
      >
        <Link
          href="#"
          onClick={handleMenuClose}
          className="menu-close-btn absolute top-6 left-6"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="white"
            className="w-8 h-8"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18 18 6M6 6l12 12"
            />
          </svg>
        </Link>
        <div className="flex items-center flex-col w-full">
          <h1 className="text-white dark:text-bodydark text-2xl font-bold uppercase mb-10">
            {offerToEdit ? "Editar Oferta" : "Crear Oferta"}
          </h1>

          <OfferForm
            id={itemId}
            skuId={skuId}
            fetchVariations={fetchVariations}
            handleMenuClose={handleMenuClose}
            offerToEdit={offerToEdit}
            onSave={onSave}
            unitPrice={unitPrice}
            setUnitPrice={setUnitPrice}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            currencyCodeId={currencyCodeId}
            setCurrencyCodeId={setCurrencyCodeId}
            fetchOffersForProduct={fetchOffersForProduct}
          />
        </div>
      </div>
    </div>
  );
}

export default OfferCanvas;
