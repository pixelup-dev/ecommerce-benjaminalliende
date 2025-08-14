import Breadcrumb from "@/components/Core/Breadcrumbs/Breadcrumb";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_NOMBRE_TIENDA + "Pago Fail",
  description: "Checkout Pago Fail",
  // other metadata
};

const Fail = () => {
  return (
    <>
      <div className="bg-gray-100 shadow-2xl text-center  flex flex-col items-center justify-center">
        <div className="w-full h-[70vh] p-8   flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-dark mb-2">
            Pago Rechazado
          </h1>
          <p className="text-dark m-4">
            Se rechazó la transacción. Elige otra forma de pago o comunícate con
            la entidad emisora de la tarjeta.
          </p>
        </div>
      </div>
    </>
  );
};

export default Fail;
