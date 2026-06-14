const User = require('../models/User');

exports.updateProfile = async (req, res) => {
  const { name, phone, profileImage } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: { name, phone, profileImage } },
    { new: true }
  );
  res.json({ user });
};

exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.matchPassword(currentPassword))) {
    return res.status(400).json({ message: 'Current password is incorrect' });
  }
  user.password = newPassword;
  await user.save();
  res.json({ message: 'Password changed' });
};

exports.listAddresses = async (req, res) => {
  res.json({ addresses: req.user.addresses });
};

exports.addAddress = async (req, res) => {
  const user = await User.findById(req.user._id);
  user.addresses.push(req.body);
  await user.save();
  res.status(201).json({ addresses: user.addresses });
};

exports.deleteAddress = async (req, res) => {
  const user = await User.findById(req.user._id);
  user.addresses.id(req.params.id)?.deleteOne();
  await user.save();
  res.json({ addresses: user.addresses });
};
