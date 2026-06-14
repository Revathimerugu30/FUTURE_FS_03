const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');

exports.dashboard = async (_req, res) => {
  const [customers, orders, products, pending, revenueAgg, recentOrders, growth] =
    await Promise.all([
      User.countDocuments({ role: 'customer' }),
      Order.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments({ status: 'Pending' }),
      Order.aggregate([
        { $match: { status: { $ne: 'Cancelled' } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Order.find().populate('user', 'name email').sort('-createdAt').limit(8),
      User.aggregate([
        { $match: { role: 'customer' } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
        { $limit: 12 },
      ]),
    ]);
  const revenueByMonth = await Order.aggregate([
    { $match: { status: { $ne: 'Cancelled' } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
        revenue: { $sum: '$amount' },
        orders: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    { $limit: 12 },
  ]);

  res.json({
    stats: {
      customers,
      orders,
      products,
      pending,
      revenue: revenueAgg[0]?.total || 0,
    },
    revenueByMonth,
    customerGrowth: growth,
    recentOrders,
  });
};

exports.listCustomers = async (req, res) => {
  const { q } = req.query;
  const filter = { role: 'customer' };
  if (q) filter.$or = [{ name: new RegExp(q, 'i') }, { email: new RegExp(q, 'i') }];
  const customers = await User.find(filter).sort('-createdAt');
  res.json({ customers });
};

exports.deleteCustomer = async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: 'Customer deleted' });
};

exports.setLocation = async (req, res) => {
  const { lat, lng } = req.body;
  if (lat == null || lng == null) return res.status(400).json({ message: 'lat and lng required' });
  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  user.adminLocation = { lat: Number(lat), lng: Number(lng), updatedAt: new Date() };
  await user.save();
  res.json({ adminLocation: user.adminLocation });
};
