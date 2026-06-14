const mongoose = require('mongoose');
const dns = require('dns');

module.exports = async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not set');

  if (uri.startsWith('mongodb+srv://')) {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  }

  mongoose.set('strictQuery', true);
  await mongoose.connect(uri);
  console.log('🍃 MongoDB connected');
};
