const express = require('express');
const router = express.Router();
const PostController = require('../controllers/PostController');
const { auth, isAdmin } = require('../middleware/auth');

router.get('/', auth, PostController.index);
router.get('/feed-do-dia', auth, PostController.feedDoDia);
router.get('/stats', auth, isAdmin, PostController.stats);
router.get('/:id', auth, PostController.show);
router.post('/', auth, isAdmin, PostController.create);
router.put('/:id', auth, isAdmin, PostController.update);
router.delete('/:id', auth, isAdmin, PostController.delete);

module.exports = router;
