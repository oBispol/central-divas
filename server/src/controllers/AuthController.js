const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Historico = require('../models/Historico');

class AuthController {
  static async register(req, res) {
    try {
      const { nome, email, whatsapp, senha } = req.body;

      if (!nome || !email || !senha) {
        return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
      }

      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'Email já cadastrado' });
      }

      const hashedPassword = await bcrypt.hash(senha, 10);

      const user = await User.create({
        nome,
        email,
        whatsapp,
        senha: hashedPassword,
        foto_perfil: req.file ? `/uploads/${req.file.filename}` : null,
        tipo: 'user',
        status: 'pendente'
      });

      await Historico.create(user.id, 'cadastro', 'Nova usuária cadastrada no sistema');

      res.status(201).json({
        message: 'Cadastro realizado com sucesso! Aguarde aprovação da administradora.',
        user: {
          id: user.id,
          nome: user.nome,
          email: user.email,
          tipo: user.tipo,
          status: user.status
        }
      });
    } catch (error) {
      console.error('Erro no registro:', error);
      res.status(500).json({ error: 'Erro ao processar cadastro' });
    }
  }

  static async login(req, res) {
    try {
      const { email, senha } = req.body;

      if (!email || !senha) {
        return res.status(400).json({ error: 'Email e senha são obrigatórios' });
      }

      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      const isPasswordValid = await bcrypt.compare(senha, user.senha);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      if (user.status === 'pendente') {
        return res.status(403).json({ error: 'Sua conta ainda está aguardando aprovação' });
      }

      if (user.status === 'bloqueada') {
        return res.status(403).json({ error: 'Sua conta foi bloqueada. Entre em contato com a administradora.' });
      }

      if (user.status === 'inativa') {
        return res.status(403).json({ error: 'Sua conta está inativa. Entre em contato com a administradora.' });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, tipo: user.tipo },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      await Historico.create(user.id, 'login', 'Usuária fez login no sistema');

      res.json({
        token,
        user: {
          id: user.id,
          nome: user.nome,
          email: user.email,
          whatsapp: user.whatsapp,
          foto_perfil: user.foto_perfil,
          tipo: user.tipo,
          status: user.status
        }
      });
    } catch (error) {
      console.error('Erro no login:', error);
      res.status(500).json({ error: 'Erro ao processar login' });
    }
  }

  static async getMe(req, res) {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }
      res.json(user);
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      res.status(500).json({ error: 'Erro ao buscar dados do usuário' });
    }
  }

  static async changePassword(req, res) {
    try {
      const { senhaAtual, novaSenha } = req.body;
      const userId = req.user.id;

      if (!senhaAtual || !novaSenha) {
        return res.status(400).json({ error: 'Senha atual e nova senha são obrigatórias' });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      const isPasswordValid = await bcrypt.compare(senhaAtual, user.senha);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Senha atual incorreta' });
      }

      const hashedPassword = await bcrypt.hash(novaSenha, 10);
      await User.updatePassword(userId, hashedPassword);

      await Historico.create(userId, 'alterar_senha', 'Usuária alterou sua senha');

      res.json({ message: 'Senha alterada com sucesso' });
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      res.status(500).json({ error: 'Erro ao alterar senha' });
    }
  }
}

module.exports = AuthController;
