const router = require('express').Router();
const c = require('../controllers/notification.controller');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', c.mine);
router.put('/:id/read', c.markRead);
router.put('/read-all', c.markAllRead);

module.exports = router;
