const router = require('express').Router();
const c = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth');

router.post('/register', c.register);
router.post('/login', c.login);
router.post('/admin/login', c.adminLogin);
router.post('/forgot-password', c.forgotPassword);
router.post('/reset-password', c.resetPassword);
router.get('/me', protect, c.me);

module.exports = router;
