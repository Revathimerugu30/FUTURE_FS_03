const User = require('../models/User');
const Product = require('../models/Product');

exports.toggle = async (req, res) => {
  const { productId } = req.params;
  const user = await User.findById(req.user._id);
  const idx = user.wishlist.findIndex((p) => String(p) === productId);
  if (idx >= 0) user.wishlist.splice(idx, 1);
  else user.wishlist.push(productId);
  await user.save();
  res.json({ wishlist: user.wishlist });
};

exports.list = async (req, res) => {
  const user = await User.findById(req.user._id).populate('wishlist');
  res.json({ items: user.wishlist });
};
