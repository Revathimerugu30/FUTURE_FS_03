const router = require('express').Router();
const c = require('../controllers/review.controller');
const { protect } = require('../middleware/auth');

router.get('/product/:productId', c.listForProduct);
router.post('/product/:productId', protect, c.upsert);
router.delete('/:id', protect, c.remove);

module.exports = router;
