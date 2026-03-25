const Conclusao = require('../models/Conclusao');
const Tarefa = require('../models/Tarefa');
const Historico = require('../models/Historico');

class ConclusaoController {
  static async index(req, res) {
    try {
      const { user_id, post_id, status, data_inicio, data_fim, limit } = req.query;
      const filters = {};

      if (req.user.tipo === 'user') {
        filters.user_id = req.user.id;
      } else if (user_id) {
        filters.user_id = parseInt(user_id);
      }

      if (post_id) filters.post_id = parseInt(post_id);
      if (status) filters.status = status;
      if (data_inicio) filters.data_inicio = data_inicio;
      if (data_fim) filters.data_fim = data_fim;
      if (limit) filters.limit = parseInt(limit);

      const conclusoes = await Conclusao.findAll(filters);
      res.json(conclusoes);
    } catch (error) {
      console.error('Erro ao listar conclusoes:', error);
      res.status(500).json({ error: 'Erro ao listar conclusões' });
    }
  }

  static async completarTarefa(req, res) {
    try {
      const { tarefa_id, post_id, tipo, evidencia } = req.body;
      const userId = req.user.id;

      if (!tarefa_id || !post_id || !tipo) {
        return res.status(400).json({ error: 'Tarefa, post e tipo são obrigatórios' });
      }

      const tarefa = await Tarefa.findById(tarefa_id);
      if (!tarefa) {
        return res.status(404).json({ error: 'Tarefa não encontrada' });
      }

      if (!tarefa.ativa) {
        return res.status(400).json({ error: 'Esta tarefa não está mais ativa' });
      }

      const exists = await Conclusao.checkExists(userId, tarefa_id, post_id);
      if (exists) {
        return res.status(400).json({ error: 'Você já completou esta tarefa para este post' });
      }

      const conclusao = await Conclusao.create({
        user_id: userId,
        tarefa_id,
        post_id,
        tipo,
        evidencia,
        status: 'concluida'
      });

      await Historico.create(
        userId, 
        'completar_tarefa', 
        `Completou tarefa: ${tarefa.descricao}`
      );

      res.status(201).json(conclusao);
    } catch (error) {
      console.error('Erro ao completar tarefa:', error);
      res.status(500).json({ error: 'Erro ao completar tarefa' });
    }
  }

  static async minhasTarefas(req, res) {
    try {
      const data = req.query.data || new Date().toISOString().split('T')[0];
      const conclusoes = await Conclusao.findAll({
        user_id: req.user.id,
        data_inicio: data,
        data_fim: data + ' 23:59:59'
      });
      res.json(conclusoes);
    } catch (error) {
      console.error('Erro ao buscar minhas tarefas:', error);
      res.status(500).json({ error: 'Erro ao buscar tarefas' });
    }
  }

  static async progressoDoDia(req, res) {
    try {
      const userId = req.params.userId || req.user.id;

      if (req.user.tipo === 'user' && req.user.id !== parseInt(userId)) {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      const progresso = await Conclusao.getProgressoDoDia(userId);
      res.json(progresso);
    } catch (error) {
      console.error('Erro ao buscar progresso:', error);
      res.status(500).json({ error: 'Erro ao buscar progresso' });
    }
  }

  static async estatisticasUsuario(req, res) {
    try {
      const userId = req.params.userId || req.user.id;

      if (req.user.tipo === 'user' && req.user.id !== parseInt(userId)) {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      const estatisticas = await Conclusao.getEstatisticasUsuario(userId);
      res.json(estatisticas);
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      res.status(500).json({ error: 'Erro ao buscar estatísticas' });
    }
  }

  static async validarTarefa(req, res) {
    try {
      if (req.user.tipo === 'user') {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      const { id } = req.params;
      const { status, evidencia } = req.body;

      if (!['concluida', 'rejeitada'].includes(status)) {
        return res.status(400).json({ error: 'Status inválido' });
      }

      const conclusao = await Conclusao.updateStatus(id, status, evidencia);

      if (!conclusao) {
        return res.status(404).json({ error: 'Conclusão não encontrada' });
      }

      await Historico.create(
        req.user.id,
        'validar_tarefa',
        `${status === 'concluida' ? 'Aprovou' : 'Rejeitou'} tarefa`
      );

      res.json(conclusao);
    } catch (error) {
      console.error('Erro ao validar tarefa:', error);
      res.status(500).json({ error: 'Erro ao validar tarefa' });
    }
  }

  static async rankingParticipantes(req, res) {
    try {
      if (req.user.tipo === 'user') {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      const { data_inicio, data_fim } = req.query;
      const filters = {};

      if (data_inicio) filters.data_inicio = data_inicio;
      if (data_fim) filters.data_fim = data_fim + ' 23:59:59';

      const ranking = await Conclusao.getConclusoesPorUsuario(filters);
      res.json(ranking);
    } catch (error) {
      console.error('Erro ao buscar ranking:', error);
      res.status(500).json({ error: 'Erro ao buscar ranking' });
    }
  }
}

module.exports = ConclusaoController;
