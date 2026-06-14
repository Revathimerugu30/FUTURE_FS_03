export type DeliveryAddress = {
  name?: string;
  phone?: string;
  line1?: string;
  line2?: string;
  house?: string;
  flat?: string;
  street?: string;
  area?: string;
  locality?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  location?: {
    lat: number;
    lng: number;
  };
  displayName?: string;
};

export type OrderItem = {
  product: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
};

export type Order = {
  _id: string;
  user?: {
    name?: string;
    email?: string;
  };
  items: OrderItem[];
  amount: number;
  shippingFee: number | null;
  deliveryDistanceKm: number | null;
  discount?: number;
  couponCode?: string;
  address: DeliveryAddress;
  paymentMethod?: "COD" | "ONLINE";
  status?: string;
  shippingDate?: string | null;
  expectedDeliveryDate?: string | null;
  isApproved?: boolean;
};
