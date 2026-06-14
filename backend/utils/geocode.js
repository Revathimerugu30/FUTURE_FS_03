const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org/search';
const PHOTON_BASE_URL = 'https://photon.komoot.io/api';

// A mock database of Indian postal codes with their approximate lat/lng
// This is used as a fallback when geocoding services are unavailable
const PINCODE_COORDINATES = {
  '560001': { lat: 12.9716, lng: 77.5946, name: 'Bengaluru' },
  '560002': { lat: 12.9716, lng: 77.5946, name: 'Bengaluru' },
  '560034': { lat: 12.9716, lng: 77.5946, name: 'Bengaluru' },
  '110001': { lat: 28.6139, lng: 77.2090, name: 'Delhi' },
  '400001': { lat: 18.9220, lng: 72.8347, name: 'Mumbai' },
  '700001': { lat: 22.5726, lng: 88.3639, name: 'Kolkata' },
  '600001': { lat: 13.0827, lng: 80.2707, name: 'Chennai' },
  '500001': { lat: 17.3850, lng: 78.4867, name: 'Hyderabad' },
  // Add more pincodes as needed
};

function buildAddressString(address = {}) {
  const parts = [
    address.house || address.flat || address.line1,
    address.street || address.line2,
    address.area || address.locality || address.neighborhood,
    address.city,
    address.state,
    address.pincode,
    address.country,
  ].filter((part) => Boolean(part));

  return parts.join(', ');
}

async function geocodeAddress(address = {}) {
  const fullAddress = buildAddressString(address);
  if (!fullAddress) {
    throw new Error('Address is required for geocoding.');
  }

  if (typeof fetch !== 'function') {
    throw new Error('Fetch is not available in this Node environment.');
  }

  // Try Nominatim first
  try {
    const params = new URLSearchParams({
      q: fullAddress,
      format: 'json',
      addressdetails: '1',
      limit: '1',
    });

    const response = await fetch(`${NOMINATIM_BASE_URL}?${params.toString()}`, {
      headers: { 'User-Agent': 'Vasista-Pickles-App/1.0' },
      method: 'GET',
      timeout: 5000,
    });

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        const result = data[0];
        return {
          lat: Number(result.lat),
          lng: Number(result.lon),
          displayName: result.display_name,
        };
      }
    }
  } catch (err) {
    console.warn('Nominatim fallback:', err.message);
  }

  // Try Photon as secondary fallback
  try {
    const params = new URLSearchParams({
      q: address.city || fullAddress,
      limit: '1',
    });

    const response = await fetch(`${PHOTON_BASE_URL}?${params.toString()}`, {
      headers: { 'User-Agent': 'Vasista-Pickles-App/1.0' },
      method: 'GET',
      timeout: 5000,
    });

    if (response.ok) {
      const data = await response.json();
      if (data.features && data.features.length > 0) {
        const coords = data.features[0].geometry.coordinates;
        return {
          lat: coords[1],
          lng: coords[0],
          displayName: data.features[0].properties.name || address.city,
        };
      }
    }
  } catch (err) {
    console.warn('Photon fallback:', err.message);
  }

  // Try pincode-based lookup as last fallback
  if (address.pincode && PINCODE_COORDINATES[address.pincode]) {
    const pincodeData = PINCODE_COORDINATES[address.pincode];
    return {
      lat: pincodeData.lat,
      lng: pincodeData.lng,
      displayName: `${pincodeData.name} (${address.pincode})`,
    };
  }

  throw new Error('Unable to locate the provided address.');
}

module.exports = { geocodeAddress, buildAddressString };
