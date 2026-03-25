const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const { auth, isAdmin } = require('../middleware/auth');
const upload = require('../config/upload');

router.get('/', auth, isAdmin, UserController.index);
router.get('/stats', auth, isAdmin, UserController.stats);
router.get('/minhas-pendencias', auth, UserController.getMyPendencies);
router.get('/usuarios-pendencias', auth, isAdmin, UserController.getUsersWithPendencies);
router.get('/:id', auth, UserController.show);
router.put('/:id', auth, upload.single('foto_perfil'), UserController.update);
router.patch('/:id/status', auth, isAdmin, UserController.atualizarStatus);
router.post('/verificar-pendencias', auth, isAdmin, UserController.verificarPendencia);
router.post('/', auth, isAdmin, UserController.criarAdmin);
router.delete('/:id', auth, UserController.deletar);

module.exports = router;
