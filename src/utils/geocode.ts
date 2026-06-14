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
};

export function buildAddressString(address: DeliveryAddress) {
  const parts = [
    address.house || address.flat || address.line1,
    address.street || address.line2,
    address.area || address.locality || address.neighborhood,
    address.city,
    address.state,
    address.pincode,
    address.country,
  ].filter((part) => Boolean(part)) as string[];

  return parts.join(', ');
}
