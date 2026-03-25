const Aviso = require('../models/Aviso');
const Historico = require('../models/Historico');

class AvisoController {
  static async index(req, res) {
    try {
      const { ativo, limit } = req.query;
      const filters = {};

      if (req.user.tipo === 'user') {
        filters.ativo = true;
      } else if (ativo !== undefined) {
        filters.ativo = ativo === 'true';
      }

      if (limit) filters.limit = parseInt(limit);

      const avisos = await Aviso.findAll(filters);
      res.json(avisos);
    } catch (error) {
      console.error('Erro ao listar avisos:', error);
      res.status(500).json({ error: 'Erro ao listar avisos' });
    }
  }

  static async show(req, res) {
    try {
      const { id } = req.params;
      const aviso = await Aviso.findById(id);

      if (!aviso) {
        return res.status(404).json({ error: 'Aviso não encontrado' });
      }

      res.json(aviso);
    } catch (error) {
      console.error('Erro ao buscar aviso:', error);
      res.status(500).json({ error: 'Erro ao buscar aviso' });
    }
  }

  static async create(req, res) {
    try {
      if (req.user.tipo === 'user') {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      const { titulo, mensagem, tipo, ativo } = req.body;

      if (!titulo || !mensagem) {
        return res.status(400).json({ error: 'Título e mensagem são obrigatórios' });
      }

      const aviso = await Aviso.create({
        titulo,
        mensagem,
        tipo,
        ativo,
        created_by: req.user.id
      });

      await Historico.create(req.user.id, 'criar_aviso', `Criou aviso: ${titulo}`);

      res.status(201).json(aviso);
    } catch (error) {
      console.error('Erro ao criar aviso:', error);
      res.status(500).json({ error: 'Erro ao criar aviso' });
    }
  }

  static async update(req, res) {
    try {
      if (req.user.tipo === 'user') {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      const { id } = req.params;
      const { titulo, mensagem, tipo, ativo } = req.body;

      const aviso = await Aviso.findById(id);
      if (!aviso) {
        return res.status(404).json({ error: 'Aviso não encontrado' });
      }

      const updatedAviso = await Aviso.update(id, { titulo, mensagem, tipo, ativo });

      await Historico.create(req.user.id, 'editar_aviso', `Editou aviso: ${titulo}`);

      res.json(updatedAviso);
    } catch (error) {
      console.error('Erro ao atualizar aviso:', error);
      res.status(500).json({ error: 'Erro ao atualizar aviso' });
    }
  }

  static async delete(req, res) {
    try {
      if (req.user.tipo === 'user') {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      const { id } = req.params;
      const aviso = await Aviso.findById(id);

      if (!aviso) {
        return res.status(404).json({ error: 'Aviso não encontrado' });
      }

      await Aviso.delete(id);

      await Historico.create(req.user.id, 'excluir_aviso', `Removeu aviso: ${aviso.titulo}`);

      res.json({ message: 'Aviso excluído com sucesso' });
    } catch (error) {
      console.error('Erro ao excluir aviso:', error);
      res.status(500).json({ error: 'Erro ao excluir aviso' });
    }
  }

  static async ativos(req, res) {
    try {
      const avisos = await Aviso.getAtivos();
      res.json(avisos);
    } catch (error) {
      console.error('Erro ao buscar avisos ativos:', error);
      res.status(500).json({ error: 'Erro ao buscar avisos' });
    }
  }
}

module.exports = AvisoController;
