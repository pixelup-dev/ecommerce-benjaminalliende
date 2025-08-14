// types.ts

export interface ItemAvailability {
  enabledForDelivery: boolean;
  enabledForWithdrawal: boolean;
}

export interface CustomerDetails {
  firstname?: string;
  lastname?: string;
  phoneNumber?: string;
  email?: string;
  addressLine1?: string;
  addressLine2?: string;
  communeId?: string;
  communeName?: string;
  regionName?: string;
}

export interface Customer {
  cartId: string;
  deliveryTypeId: string;
  useDifferentShippingAddress: boolean;
  customer: CustomerDetails | null;
}
