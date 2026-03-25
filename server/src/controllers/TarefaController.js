const Tarefa = require('../models/Tarefa');
const Historico = require('../models/Historico');

class TarefaController {
  static async index(req, res) {
    try {
      const { ativa, tipo } = req.query;
      const filters = {};

      if (ativa !== undefined) filters.ativa = ativa === 'true';
      if (tipo) filters.tipo = tipo;

      const tarefas = await Tarefa.findAll(filters);
      res.json(tarefas);
    } catch (error) {
      console.error('Erro ao listar tarefas:', error);
      res.status(500).json({ error: 'Erro ao listar tarefas' });
    }
  }

  static async show(req, res) {
    try {
      const { id } = req.params;
      const tarefa = await Tarefa.findById(id);

      if (!tarefa) {
        return res.status(404).json({ error: 'Tarefa não encontrada' });
      }

      res.json(tarefa);
    } catch (error) {
      console.error('Erro ao buscar tarefa:', error);
      res.status(500).json({ error: 'Erro ao buscar tarefa' });
    }
  }

  static async create(req, res) {
    try {
      if (req.user.tipo === 'user') {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      const { tipo, descricao, pontos } = req.body;

      if (!tipo || !descricao) {
        return res.status(400).json({ error: 'Tipo e descrição são obrigatórios' });
      }

      if (!['curtir', 'comentar', 'seguir'].includes(tipo)) {
        return res.status(400).json({ error: 'Tipo inválido' });
      }

      const tarefa = await Tarefa.create({ tipo, descricao, pontos });

      await Historico.create(req.user.id, 'criar_tarefa', `Criou tarefa: ${descricao}`);

      res.status(201).json(tarefa);
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
      res.status(500).json({ error: 'Erro ao criar tarefa' });
    }
  }

  static async update(req, res) {
    try {
      if (req.user.tipo === 'user') {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      const { id } = req.params;
      const { tipo, descricao, pontos, ativa } = req.body;

      const tarefa = await Tarefa.findById(id);
      if (!tarefa) {
        return res.status(404).json({ error: 'Tarefa não encontrada' });
      }

      const updatedTarefa = await Tarefa.update(id, { tipo, descricao, pontos, ativa });

      await Historico.create(req.user.id, 'editar_tarefa', `Editou tarefa: ${descricao}`);

      res.json(updatedTarefa);
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
      res.status(500).json({ error: 'Erro ao atualizar tarefa' });
    }
  }

  static async delete(req, res) {
    try {
      if (req.user.tipo === 'user') {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      const { id } = req.params;
      const tarefa = await Tarefa.findById(id);

      if (!tarefa) {
        return res.status(404).json({ error: 'Tarefa não encontrada' });
      }

      await Tarefa.delete(id);

      await Historico.create(req.user.id, 'excluir_tarefa', `Excluiu tarefa: ${tarefa.descricao}`);

      res.json({ message: 'Tarefa excluída com sucesso' });
    } catch (error) {
      console.error('Erro ao excluir tarefa:', error);
      res.status(500).json({ error: 'Erro ao excluir tarefa' });
    }
  }
}

module.exports = TarefaController;
