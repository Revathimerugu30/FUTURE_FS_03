function calculateDeliveryCharge(distanceKm, subtotal = 0, isInternational = false) {
  if (distanceKm == null || Number.isNaN(distanceKm)) return NaN;

  if (!isInternational && subtotal > 999) return 0;

  const distance = Math.max(0, distanceKm);
  let charge = 0;

  if (distance <= 5) charge = 0;
  else if (distance <= 10) charge = 19;
  else if (distance <= 20) charge = 39;
  else if (distance <= 50) charge = 79;
  else if (distance <= 100) charge = 149;
  else if (distance <= 300) charge = 299;
  else if (distance <= 500) charge = 499;
  else if (distance <= 1000) charge = 799;
  else if (distance <= 2000) charge = 1499;
  else if (distance <= 5000) charge = 2499;
  else charge = 4999;

  if (isInternational) {
    return Math.max(2999, charge);
  }

  return charge;
}

function isInternationalShipping(customerCountry, adminCountry = 'India') {
  if (!customerCountry) return false;
  return customerCountry.trim().toLowerCase() !== adminCountry.trim().toLowerCase();
}

module.exports = { calculateDeliveryCharge, isInternationalShipping };
