const Notification = require('../models/Notification');

exports.mine = async (req, res) => {
  const q = req.user.role === 'admin' ? { forAdmin: true } : { user: req.user._id };
  const items = await Notification.find(q).sort('-createdAt').limit(100);
  res.json({ notifications: items });
};

exports.markRead = async (req, res) => {
  await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
  res.json({ message: 'ok' });
};

exports.markAllRead = async (req, res) => {
  const q = req.user.role === 'admin' ? { forAdmin: true } : { user: req.user._id };
  await Notification.updateMany(q, { isRead: true });
  res.json({ message: 'ok' });
};
