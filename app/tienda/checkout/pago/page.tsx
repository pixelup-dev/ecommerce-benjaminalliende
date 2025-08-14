import { Metadata } from "next";
import CheckoutPago from "@/components/Core/Checkout/CheckoutPago";
import { Suspense } from "react";
import Loader from "@/components/common/Loader";

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_NOMBRE_TIENDA + " - Pago",
  description: "Checkout Pago",
  // other metadata
};

const Pago = () => {
  return (
    <div className="pb-16 pt-8">
      <CheckoutPago />
    </div>
  );
};

const OkWithSuspense = () => {
  return (
    <Suspense fallback={<Loader />}>
      <Pago />
    </Suspense>
  );
};

export default OkWithSuspense;
