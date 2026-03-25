const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const { auth } = require('../middleware/auth');
const upload = require('../config/upload');

router.post('/register', upload.single('foto_perfil'), AuthController.register);
router.post('/login', AuthController.login);
router.get('/me', auth, AuthController.getMe);
router.post('/change-password', auth, AuthController.changePassword);

module.exports = router;
