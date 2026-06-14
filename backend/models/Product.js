const mongoose = require('mongoose');

const PRODUCT_CATEGORIES = [
  'Avakaya Pickle',
  'Gongura Pickle',
  'Lemon Pickle',
  'Garlic Pickle',
  'Mango Pickle',
  'Chicken Pickle',
  'Mutton Pickle',
  'Fish Pickle',
  'Prawn Pickle',
  'kakarkaya Pickle',
];

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, index: 'text' },
    slug: { type: String, unique: true, index: true },
    category: { type: String, enum: PRODUCT_CATEGORIES, required: true, index: true },
    price: { type: Number, required: true, min: 0 },
    mrp: { type: Number, default: 0 },
    description: { type: String, required: true },
    ingredients: [{ type: String }],
    weight: { type: String, default: '250g' },
    image: { type: String, default: '' },
    images: [{ type: String }],
    stock: { type: Number, default: 0, min: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    numReviews: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

productSchema.pre('save', function (next) {
  if (!this.slug && this.name) {
    this.slug =
      this.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') +
      '-' +
      Math.random().toString(36).slice(2, 6);
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);
module.exports.PRODUCT_CATEGORIES = PRODUCT_CATEGORIES;
