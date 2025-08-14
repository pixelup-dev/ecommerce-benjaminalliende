import { Metadata } from "next";
import Validate from "@/components/Core/Checkout/Validate";
import { Suspense } from "react";
import Loader from "@/components/common/Loader";
export const metadata: Metadata = {
  title: "Validando Pago",
  description: "validando pago pixelup.xl",
  // other metadata
};

const Validando = () => {
  return (
    <div className=" pb-16 pt-8">
      <Validate />
    </div>
  );
};

const OkWithSuspense = () => {
  return (
    <Suspense fallback={<Loader />}>
      <Validando />
    </Suspense>
  );
};

export default OkWithSuspense;
