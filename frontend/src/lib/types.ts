export type OrderItem = {
  productId: string;
  qty: number;
  unitPrice: number;
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

export type OrderResponse = {
  ok: boolean;
  code: string;
  order: {
    id: number;
    status: 'pending' | 'ready' | 'picked_up' | 'cancelled';
    total: number;
  };
};

export type ProductRecord = {
  id: string;
  nameZh: string;
  nameEn: string;
  priceHkd: number;
  stock: number;
  active: 0 | 1;
};
