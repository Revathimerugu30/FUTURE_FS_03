const Order = require('../models/Order');
const Product = require('../models/Product');
const { notifyUser, notifyAdmins } = require('../services/notification.service');
const { getDistanceKm } = require('../utils/distance');
const { calculateDeliveryCharge, isInternationalShipping } = require('../utils/deliveryCharge');
const { geocodeAddress, buildAddressString } = require('../utils/geocode');

function calculateDeliveryMetrics(address, subtotal) {
  return { deliveryDistanceKm: null, shippingFee: null };
}

exports.create = async (req, res) => {
  const { items, address, paymentMethod = 'COD', couponCode } = req.body;
  if (!items?.length) return res.status(400).json({ message: 'Cart is empty' });

  const ids = items.map((i) => i.product);
  const products = await Product.find({ _id: { $in: ids } });
  const map = new Map(products.map((p) => [String(p._id), p]));

  const lineItems = items.map((i) => {
    const p = map.get(String(i.product));
    if (!p) throw new Error('Invalid product in cart');
    return {
      product: p._id,
      name: p.name,
      image: p.image,
      price: p.price,
      quantity: i.quantity || 1,
    };
  });
  const subtotal = lineItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const discount = couponCode === 'WELCOME10' ? Math.round(subtotal * 0.1) : 0;

  const fullAddress = buildAddressString(address);
  if (!fullAddress) return res.status(400).json({ message: 'Please provide a complete delivery address.' });

  let locationData = null;
  let displayName = undefined;
  try {
    console.log('Order geocode request:', fullAddress);
    const geocode = await geocodeAddress(address);
    locationData = { lat: geocode.lat, lng: geocode.lng };
    displayName = geocode.displayName;
    console.log('Geocoded user coordinates:', locationData, 'displayName:', displayName);
  } catch (err) {
    console.warn('Geocoding failed for order address; distance and shipping will remain null:', err.message || err);
  }

  const addressData = {
    ...address,
    ...(locationData ? { location: locationData } : {}),
    ...(displayName ? { displayName } : {}),
  };

  const { deliveryDistanceKm, shippingFee } = calculateDeliveryMetrics(addressData, subtotal);
  const amount = subtotal + (shippingFee ?? 0) - discount;

  const order = await Order.create({
    user: req.user._id,
    items: lineItems,
    amount,
    shippingFee: shippingFee ?? null,
    deliveryDistanceKm: deliveryDistanceKm ?? null,
    discount,
    couponCode,
    address: addressData,
    paymentMethod,
    statusHistory: [{ status: 'Pending', note: 'Order placed' }],
  });

  await Promise.all([
    notifyUser(req.user._id, {
      title: 'Order placed',
      message: `Your order #${order._id.toString().slice(-6).toUpperCase()} has been received.`,
      type: 'order',
      link: `/dashboard/orders/${order._id}`,
    }),
    notifyAdmins({
      title: 'New order received',
      message: `${req.user.name} placed an order worth ₹${amount}.`,
      type: 'order',
      link: `/admin/orders/${order._id}`,
    }),
  ]);

  res.status(201).json({ order: sanitizeOrder(order) });
};

function sanitizeOrder(order, isAdmin = false) {
  if (!order) return order;
  const sanitized = order.toObject ? order.toObject() : { ...order };
  if (!isAdmin && sanitized.address?.location) {
    delete sanitized.address.location;
  }
  return sanitized;
}

exports.myOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort('-createdAt');
  res.json({ orders: orders.map((order) => sanitizeOrder(order)) });
};

exports.getOne = async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  if (String(order.user) !== String(req.user._id) && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden' });
  }
  const isAdmin = req.user.role === 'admin';
  res.json({ order: sanitizeOrder(order, isAdmin) });
};

exports.listAll = async (_req, res) => {
  const orders = await Order.find().populate('user', 'name email').sort('-createdAt');
  res.json({ orders: orders.map((order) => sanitizeOrder(order, true)) });
};

exports.updateStatus = async (req, res) => {
  const { status, note, expectedDeliveryDate, shippingDate, isApproved, approvalNote, adminLocation } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });

  const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const hasOrderLocation = order.address?.location?.lat != null && order.address.location.lng != null;
  const hasAdminLocation = adminLocation?.lat != null && adminLocation?.lng != null;
  const deliveryDistanceKm = hasAdminLocation && hasOrderLocation
    ? getDistanceKm(adminLocation, order.address.location)
    : null;
  const shippingFee = deliveryDistanceKm != null
    ? calculateDeliveryCharge(deliveryDistanceKm, subtotal, isInternationalShipping(order.address?.country, 'India'))
    : null;

  if (hasAdminLocation && hasOrderLocation) {
    console.log('Admin coordinates:', adminLocation);
    console.log('User coordinates:', order.address.location);
    console.log('Calculated admin->user distance:', deliveryDistanceKm, 'km');
  } else if (hasOrderLocation) {
    console.log('User geocoded location available but admin location missing. Distance remains null.');
  } else {
    console.log('User location unavailable; distance and shipping fee are null.');
  }

  if (status) order.status = status;
  if (typeof isApproved === 'boolean') order.isApproved = isApproved;
  if (approvalNote !== undefined) order.approvalNote = approvalNote;
  order.shippingFee = shippingFee ?? null;
  order.deliveryDistanceKm = deliveryDistanceKm ?? null;
  order.amount = subtotal + (shippingFee ?? 0) - order.discount;
  if (shippingDate) order.shippingDate = new Date(shippingDate);
  if (expectedDeliveryDate) order.expectedDeliveryDate = new Date(expectedDeliveryDate);
  order.statusHistory.push({ status: order.status, note: note || approvalNote || 'Updated by admin' });

  await order.save();
  await notifyUser(order.user, {
    title: `Order ${order.status}`,
    message: `Your order #${order._id.toString().slice(-6).toUpperCase()} is now ${order.status}.`,
    type: 'order',
    link: `/dashboard/orders/${order._id}`,
  });
  res.json({ order });
};

exports.estimate = async (req, res) => {
  const { address } = req.body;
  if (!address) return res.status(400).json({ message: 'address required' });

  // geocode address
  let geocoded = null;
  try {
    const g = await geocodeAddress(address);
    geocoded = { lat: g.lat, lng: g.lng };
  } catch (err) {
    return res.json({ deliveryDistanceKm: null, shippingFee: null, message: 'Unable to determine exact location' });
  }

  // find latest admin with location
  const User = require('../models/User');
  const admin = await User.findOne({ role: 'admin', 'adminLocation.lat': { $exists: true } }).sort({ 'adminLocation.updatedAt': -1 }).select('adminLocation');
  if (!admin || !admin.adminLocation || admin.adminLocation.lat == null) {
    return res.json({ deliveryDistanceKm: null, shippingFee: null, message: 'Admin location unavailable' });
  }

  const adminLoc = { lat: admin.adminLocation.lat, lng: admin.adminLocation.lng };
  const distanceKm = getDistanceKm(adminLoc, geocoded);
  const subtotal = (req.body.subtotal && Number(req.body.subtotal)) || 0;
  const shippingFee = calculateDeliveryCharge(distanceKm, subtotal, isInternationalShipping(address?.country, 'India'));

  res.json({ deliveryDistanceKm: Number(distanceKm.toFixed(3)), shippingFee, message: 'OK' });
};
