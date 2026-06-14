const router = require('express').Router();
const c = require('../controllers/wishlist.controller');
const { protect } = require('../middleware/auth');
router.use(protect);
router.get('/', c.list);
router.post('/:productId', c.toggle);
module.exports = router;
