const router = require('express').Router();
const c = require('../controllers/order.controller');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect);
router.post('/estimate', c.estimate);
router.post('/', c.create);
router.get('/mine', c.myOrders);
router.get('/all', adminOnly, c.listAll);
router.get('/:id', c.getOne);
router.put('/:id/status', adminOnly, c.updateStatus);

module.exports = router;
