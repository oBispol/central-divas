const User = require('../models/User');
const Historico = require('../models/Historico');
const DailyStatus = require('../models/DailyStatus');

class UserController {
  static async index(req, res) {
    try {
      const { tipo, status, search, limit } = req.query;
      const filters = {};

      if (req.user.tipo === 'admin') {
        filters.tipo = 'user';
      } else if (req.user.tipo === 'user') {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      if (tipo && req.user.tipo === 'superadmin') filters.tipo = tipo;
      if (status) filters.status = status;
      if (search) filters.search = search;
      if (limit) filters.limit = parseInt(limit);

      const users = await User.findAll(filters);
      const total = await User.count(filters);

      res.json({ users, total });
    } catch (error) {
      console.error('Erro ao listar usuários:', error);
      res.status(500).json({ error: 'Erro ao listar usuários' });
    }
  }

  static async show(req, res) {
    try {
      const { id } = req.params;

      if (req.user.tipo === 'user' && req.user.id !== parseInt(id)) {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      res.json(user);
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      res.status(500).json({ error: 'Erro ao buscar usuário' });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const { nome, whatsapp, foto_perfil } = req.body;

      if (req.user.tipo === 'user' && req.user.id !== parseInt(id)) {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      const updatedUser = await User.update(id, {
        nome,
        whatsapp,
        foto_perfil: req.file ? `/uploads/${req.file.filename}` : foto_perfil
      });

      await Historico.create(req.user.id, 'editar_usuario', `Editou dados da usuária ${updatedUser.nome}`);

      res.json(updatedUser);
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      res.status(500).json({ error: 'Erro ao atualizar usuário' });
    }
  }

  static async atualizarStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!['ativa', 'inativa', 'bloqueada'].includes(status)) {
        return res.status(400).json({ error: 'Status inválido' });
      }

      if (req.user.tipo === 'user') {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      if (req.user.tipo === 'admin' && status === 'bloqueada') {
        return res.status(403).json({ error: 'Apenas Super Admin pode bloquear usuários' });
      }

      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      if (user.tipo === 'superadmin') {
        return res.status(403).json({ error: 'Não é possível alterar status do Super Admin' });
      }

      const updatedUser = await User.update(id, { status });

      await Historico.create(
        req.user.id, 
        'alterar_status', 
        `Alterou status de ${user.nome} para ${status}`
      );

      res.json(updatedUser);
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      res.status(500).json({ error: 'Erro ao atualizar status' });
    }
  }

  static async criarAdmin(req, res) {
    try {
      if (req.user.tipo !== 'superadmin') {
        return res.status(403).json({ error: 'Apenas Super Admin pode criar administradores' });
      }

      const { nome, email, whatsapp, senha } = req.body;

      if (!nome || !email || !senha) {
        return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
      }

      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash(senha, 10);

      const user = await User.create({
        nome,
        email,
        whatsapp,
        senha: hashedPassword,
        tipo: 'admin',
        status: 'ativa'
      });

      await Historico.create(req.user.id, 'criar_admin', `Criou administrador ${nome}`);

      res.status(201).json(user);
    } catch (error) {
      console.error('Erro ao criar admin:', error);
      res.status(500).json({ error: 'Erro ao criar administrador' });
    }
  }

  static async deletar(req, res) {
    try {
      const { id } = req.params;

      if (req.user.tipo !== 'superadmin') {
        return res.status(403).json({ error: 'Apenas Super Admin pode excluir usuários' });
      }

      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      if (user.tipo === 'superadmin') {
        return res.status(403).json({ error: 'Não é possível excluir o Super Admin' });
      }

      await User.delete(id);

      await Historico.create(req.user.id, 'excluir_usuario', `Excluiu usuária ${user.nome}`);

      res.json({ message: 'Usuário excluído com sucesso' });
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      res.status(500).json({ error: 'Erro ao excluir usuário' });
    }
  }

  static async stats(req, res) {
    try {
      if (req.user.tipo === 'user') {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      const stats = await User.getStats();
      res.json(stats);
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      res.status(500).json({ error: 'Erro ao buscar estatísticas' });
    }
  }

  static async getMyPendencies(req, res) {
    try {
      const today = new Date().toISOString().split('T')[0];
      const status = await DailyStatus.getTodayStatus(req.user.id);
      const historico = await DailyStatus.findByUser(req.user.id, 7);
      const totalPendencias = await DailyStatus.getTotalPendencias(req.user.id);
      
      res.json({
        hoje: status ? { pendencias: status.pendencias, verificado_em: status.verificado_em } : null,
        historico: historico,
        total_pendencias: totalPendencias
      });
    } catch (error) {
      console.error('Erro ao buscar pendências:', error);
      res.status(500).json({ error: 'Erro ao buscar pendências' });
    }
  }

  static async getUsersWithPendencies(req, res) {
    try {
      if (req.user.tipo === 'user') {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      const today = new Date().toISOString().split('T')[0];
      const usuariosComPendencia = await DailyStatus.findByDate(today);
      
      res.json({
        data: today,
        usuarios: usuariosComPendencia,
        total: usuariosComPendencia.length
      });
    } catch (error) {
      console.error('Erro ao buscar usuários com pendências:', error);
      res.status(500).json({ error: 'Erro ao buscar usuários com pendências' });
    }
  }

  static async verificarPendencia(req, res) {
    try {
      if (req.user.tipo === 'user') {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      const resultados = await DailyStatus.verificarUsuariosInativos();
      res.json({
        message: 'Verificação concluída',
        usuarios_afetados: resultados.length,
        detalhes: resultados
      });
    } catch (error) {
      console.error('Erro ao verificar pendências:', error);
      res.status(500).json({ error: 'Erro ao verificar pendências' });
    }
  }
}

module.exports = UserController;
