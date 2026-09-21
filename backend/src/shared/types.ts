export type OrderItem = {
  productId: string;
  qty: number;
  unitPrice?: number;
};

export type OrderPayload = {
  store: 'dpark' | 'apm';
  pickupDate: string; // YYYY-MM-DD
  pickupWindow: 'morning' | 'afternoon' | 'evening';
  customer: {
    name: string;
    phone: string;
    email: string;
    note?: string;
  };
  items: OrderItem[];
  locale?: string;
};
