export interface Courier {
  id: string;
  code: string;
  name: string;
  deliveryTypeId: string;
}

export const COURIERS: { [key: string]: Courier } = {
  STARKEN: {
    id: "9febff16-42b9-41fb-9d5f-c50d0ca009f8",
    code: "HOME_DELIVERY_WITH_COURIER",
    name: "Starken",
    deliveryTypeId: "8d08598a-7b5e-454a-a1de-db190d89a400",
  },
  // Aquí se pueden agregar más couriers en el futuro
  // CHILEXPRESS: {
  //   id: "id-chilexpress",
  //   code: "HOME_DELIVERY_WITH_COURIER",
  //   name: "Chilexpress"
  // },
};

export const DELIVERY_TYPES = {
  WITHDRAWAL: "WITHDRAWAL_FROM_STORE",
  DELIVERY: "HOME_DELIVERY_WITHOUT_COURIER",
  COURIER: "HOME_DELIVERY_WITH_COURIER",
} as const;
