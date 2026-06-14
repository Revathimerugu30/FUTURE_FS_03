const router = require('express').Router();
const c = require('../controllers/admin.controller');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect, adminOnly);
router.get('/dashboard', c.dashboard);
router.get('/customers', c.listCustomers);
router.delete('/customers/:id', c.deleteCustomer);
router.put('/location', c.setLocation);

module.exports = router;
