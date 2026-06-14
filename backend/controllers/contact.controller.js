const Contact = require('../models/Contact');
const { notifyAdmins } = require('../services/notification.service');

exports.create = async (req, res) => {
  const { name, email, phone, message } = req.body;
  if (!name || !email || !message)
    return res.status(400).json({ message: 'name, email, message required' });
  const doc = await Contact.create({ name, email, phone, message });
  await notifyAdmins({
    title: 'New contact message',
    message: `${name} (${email}) sent an enquiry.`,
    type: 'system',
  });
  res.status(201).json({ contact: doc });
};

exports.list = async (_req, res) => {
  const items = await Contact.find().sort('-createdAt');
  res.json({ contacts: items });
};
