const User = require('../models/User');
const { signToken } = require('../middleware/auth');
const { notifyAdmins } = require('../services/notification.service');

const sendAuth = (res, user) => {
  const token = signToken(user);
  res.json({
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      profileImage: user.profileImage,
    },
  });
};

exports.register = async (req, res) => {
  const { name, email, phone, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ message: 'Name, email and password are required' });

  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) return res.status(409).json({ message: 'Email already registered' });

  const user = await User.create({ name, email, phone, password });
  await notifyAdmins({
    title: 'New customer registered',
    message: `${user.name} (${user.email}) just created an account.`,
    type: 'account',
  });
  sendAuth(res, user);
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email?.toLowerCase() }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }
  sendAuth(res, user);
};

exports.adminLogin = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email?.toLowerCase(), role: 'admin' }).select(
    '+password'
  );
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: 'Invalid admin credentials' });
  }
  sendAuth(res, user);
};

exports.me = async (req, res) => {
  res.json({ user: req.user });
};

exports.forgotPassword = async (req, res) => {
  // Placeholder — integrate email service (SendGrid/Nodemailer) in production
  const user = await User.findOne({ email: req.body.email?.toLowerCase() });
  if (!user) return res.json({ message: 'If the email exists, a reset link will be sent.' });
  const resetToken = Math.random().toString(36).slice(2) + Date.now().toString(36);
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpire = Date.now() + 30 * 60 * 1000;
  await user.save();
  res.json({ message: 'Reset token generated', resetToken });
};

exports.resetPassword = async (req, res) => {
  const { token, password } = req.body;
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpire: { $gt: Date.now() },
  }).select('+password');
  if (!user) return res.status(400).json({ message: 'Invalid or expired token' });
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();
  res.json({ message: 'Password reset successful' });
};
