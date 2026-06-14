const router = require('express').Router();
const c = require('../controllers/user.controller');
const { protect } = require('../middleware/auth');

router.use(protect);
router.put('/me', c.updateProfile);
router.put('/me/password', c.changePassword);
router.get('/me/addresses', c.listAddresses);
router.post('/me/addresses', c.addAddress);
router.delete('/me/addresses/:id', c.deleteAddress);

module.exports = router;
