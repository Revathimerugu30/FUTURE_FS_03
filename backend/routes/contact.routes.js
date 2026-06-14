const router = require('express').Router();
const c = require('../controllers/contact.controller');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/', c.create);
router.get('/', protect, adminOnly, c.list);

module.exports = router;
