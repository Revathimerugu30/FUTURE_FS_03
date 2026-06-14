const mongoose = require('mongoose');

const ORDER_STATUSES = [
  'Pending',
  'Confirmed',
  'Processing',
  'Packed',
  'Shipped',
  'Delivered',
  'Cancelled',
];

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: String,
    image: String,
    price: Number,
    quantity: { type: Number, default: 1, min: 1 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    items: [orderItemSchema],
    amount: { type: Number, required: true },
    shippingFee: { type: Number, default: null },
    discount: { type: Number, default: 0 },
    couponCode: { type: String },
    deliveryDistanceKm: { type: Number, default: null },
    expectedDeliveryDate: Date,
    shippingDate: Date,
    isApproved: { type: Boolean, default: false },
    approvalNote: String,
    address: {
      name: String,
      phone: String,
      line1: String,
      line2: String,
      city: String,
      state: String,
      pincode: String,
      country: { type: String, default: 'India' },
      location: {
        lat: Number,
        lng: Number,
      },
      displayName: String,
    },
    paymentMethod: { type: String, enum: ['COD', 'ONLINE'], default: 'COD' },
    paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Failed'], default: 'Pending' },
    status: { type: String, enum: ORDER_STATUSES, default: 'Pending', index: true },
    statusHistory: [
      { status: String, at: { type: Date, default: Date.now }, note: String },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
module.exports.ORDER_STATUSES = ORDER_STATUSES;
