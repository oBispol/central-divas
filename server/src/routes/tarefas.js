const express = require('express');
const router = express.Router();
const TarefaController = require('../controllers/TarefaController');
const { auth, isAdmin } = require('../middleware/auth');

router.get('/', auth, TarefaController.index);
router.get('/:id', auth, TarefaController.show);
router.post('/', auth, isAdmin, TarefaController.create);
router.put('/:id', auth, isAdmin, TarefaController.update);
router.delete('/:id', auth, isAdmin, TarefaController.delete);

module.exports = router;
