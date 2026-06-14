export type Coordinates = {
  lat: number;
  lng: number;
};

export function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

export function getDistanceKm(origin: Coordinates, destination: Coordinates) {
  if (!origin || !destination) return NaN;

  const earthRadiusKm = 6371;
  const dLat = toRadians(destination.lat - origin.lat);
  const dLng = toRadians(destination.lng - origin.lng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(origin.lat)) *
      Math.cos(toRadians(destination.lat)) *
      Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c;
}
