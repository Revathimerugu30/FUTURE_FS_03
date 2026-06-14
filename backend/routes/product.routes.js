const router = require('express').Router();
const c = require('../controllers/product.controller');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', c.list);
router.get('/categories', c.categories);
router.get('/:idOrSlug', c.get);
router.post('/', protect, adminOnly, c.create);
router.put('/:id', protect, adminOnly, c.update);
router.delete('/:id', protect, adminOnly, c.remove);

module.exports = router;
