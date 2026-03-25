const express = require('express');
const router = express.Router();
const AvisoController = require('../controllers/AvisoController');
const { auth, isAdmin } = require('../middleware/auth');

router.get('/', auth, AvisoController.index);
router.get('/ativos', auth, AvisoController.ativos);
router.get('/:id', auth, AvisoController.show);
router.post('/', auth, isAdmin, AvisoController.create);
router.put('/:id', auth, isAdmin, AvisoController.update);
router.delete('/:id', auth, isAdmin, AvisoController.delete);

module.exports = router;
