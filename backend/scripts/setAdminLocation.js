require('dotenv').config();
const connectDB = require('../config/db');
const User = require('../models/User');

(async () => {
  await connectDB();
  const admin = await User.findOne({ role: 'admin' });
  if (!admin) return console.error('No admin user found');
  admin.adminLocation = { lat: 12.9716, lng: 77.5946, updatedAt: new Date() }; // Bangalore example
  await admin.save();
  console.log('Set adminLocation on', admin.email, admin.adminLocation);
  process.exit(0);
})();
