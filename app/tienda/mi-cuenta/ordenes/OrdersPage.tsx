import React from "react";
import OrdersList from "./page";

const OrdersPage = () => {
  const customerId = "7211f43f-460d-41c0-86ab-10a7501c23ef"; // Reemplaza esto con el ID del cliente

  return (
    <div className=" mx-auto p-4">
      <OrdersList customerId={customerId} />
    </div>
  );
};

export default OrdersPage;
