const Review = require('../models/Review');
const Product = require('../models/Product');

const recompute = async (productId) => {
  const stats = await Review.aggregate([
    { $match: { product: productId } },
    { $group: { _id: '$product', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  const { avg = 0, count = 0 } = stats[0] || {};
  await Product.findByIdAndUpdate(productId, { rating: avg, numReviews: count });
};

exports.listForProduct = async (req, res) => {
  const reviews = await Review.find({ product: req.params.productId })
    .populate('user', 'name profileImage')
    .sort('-createdAt');
  res.json({ reviews });
};

exports.upsert = async (req, res) => {
  const { productId } = req.params;
  const { rating, review, images } = req.body;
  const doc = await Review.findOneAndUpdate(
    { user: req.user._id, product: productId },
    { rating, review, images, user: req.user._id, product: productId },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  await recompute(doc.product);
  res.status(201).json({ review: doc });
};

exports.remove = async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) return res.status(404).json({ message: 'Not found' });
  if (String(review.user) !== String(req.user._id) && req.user.role !== 'admin')
    return res.status(403).json({ message: 'Forbidden' });
  const productId = review.product;
  await review.deleteOne();
  await recompute(productId);
  res.json({ message: 'Deleted' });
};
