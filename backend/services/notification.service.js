const Notification = require('../models/Notification');

exports.notifyUser = async (userId, payload) => {
  return Notification.create({ user: userId, ...payload });
};

exports.notifyAdmins = async (payload) => {
  return Notification.create({ forAdmin: true, ...payload });
};
