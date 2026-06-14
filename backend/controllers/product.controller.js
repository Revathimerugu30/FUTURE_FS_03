const Product = require('../models/Product');

exports.list = async (req, res) => {
  const { q, category, sort = '-createdAt', page = 1, limit = 24, featured } = req.query;
  const filter = { isActive: true };
  if (category) filter.category = category;
  if (featured) filter.isFeatured = featured === 'true';
  if (q) filter.$or = [
    { name: new RegExp(q, 'i') },
    { description: new RegExp(q, 'i') },
  ];

  const skip = (Number(page) - 1) * Number(limit);
  const [items, total] = await Promise.all([
    Product.find(filter).sort(sort).skip(skip).limit(Number(limit)),
    Product.countDocuments(filter),
  ]);
  res.json({ items, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
};

exports.get = async (req, res) => {
  const product = await Product.findOne({
    $or: [{ slug: req.params.idOrSlug }, ...(req.params.idOrSlug.match(/^[a-f\d]{24}$/i) ? [{ _id: req.params.idOrSlug }] : [])],
  });
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json({ product });
};

exports.create = async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json({ product });
};

exports.update = async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json({ product });
};

exports.remove = async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
};

exports.categories = async (_req, res) => {
  res.json({ categories: Product.PRODUCT_CATEGORIES });
};
