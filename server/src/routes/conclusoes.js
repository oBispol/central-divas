const express = require('express');
const router = express.Router();
const ConclusaoController = require('../controllers/ConclusaoController');
const { auth, isAdmin } = require('../middleware/auth');

router.get('/', auth, ConclusaoController.index);
router.get('/minhas-tarefas', auth, ConclusaoController.minhasTarefas);
router.get('/progresso/:userId?', auth, ConclusaoController.progressoDoDia);
router.get('/estatisticas/:userId?', auth, ConclusaoController.estatisticasUsuario);
router.get('/ranking', auth, isAdmin, ConclusaoController.rankingParticipantes);
router.post('/', auth, ConclusaoController.completarTarefa);
router.patch('/:id/validar', auth, isAdmin, ConclusaoController.validarTarefa);

module.exports = router;
