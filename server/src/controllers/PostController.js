const Post = require('../models/Post');
const Historico = require('../models/Historico');

class PostController {
  static async index(req, res) {
    try {
      const { data, data_inicio, data_fim, limit } = req.query;
      const filters = {};

      if (data) filters.data = data;
      if (data_inicio) filters.data_inicio = data_inicio;
      if (data_fim) filters.data_fim = data_fim;
      if (limit) filters.limit = parseInt(limit);

      const posts = await Post.findAll(filters);
      res.json(posts);
    } catch (error) {
      console.error('Erro ao listar posts:', error);
      res.status(500).json({ error: 'Erro ao listar posts' });
    }
  }

  static async feedDoDia(req, res) {
    try {
      const data = req.query.data || new Date().toISOString().split('T')[0];
      const posts = await Post.getPostsDoDia(data);
      res.json(posts);
    } catch (error) {
      console.error('Erro ao buscar feed do dia:', error);
      res.status(500).json({ error: 'Erro ao buscar feed do dia' });
    }
  }

  static async show(req, res) {
    try {
      const { id } = req.params;
      const post = await Post.findById(id);

      if (!post) {
        return res.status(404).json({ error: 'Post não encontrado' });
      }

      res.json(post);
    } catch (error) {
      console.error('Erro ao buscar post:', error);
      res.status(500).json({ error: 'Erro ao buscar post' });
    }
  }

  static async create(req, res) {
    try {
      if (req.user.tipo === 'user') {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      const { link, instagram_id, caption, data_post } = req.body;

      if (!link) {
        return res.status(400).json({ error: 'Link do post é obrigatório' });
      }

      const post = await Post.create({
        link,
        instagram_id,
        caption,
        data_post,
        created_by: req.user.id
      });

      await Historico.create(req.user.id, 'criar_post', `Adicionou post ao feed: ${link}`);

      res.status(201).json(post);
    } catch (error) {
      console.error('Erro ao criar post:', error);
      res.status(500).json({ error: 'Erro ao criar post' });
    }
  }

  static async update(req, res) {
    try {
      if (req.user.tipo === 'user') {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      const { id } = req.params;
      const { link, instagram_id, caption, data_post } = req.body;

      const post = await Post.findById(id);
      if (!post) {
        return res.status(404).json({ error: 'Post não encontrado' });
      }

      const updatedPost = await Post.update(id, { link, instagram_id, caption, data_post });

      await Historico.create(req.user.id, 'editar_post', `Editou post: ${link}`);

      res.json(updatedPost);
    } catch (error) {
      console.error('Erro ao atualizar post:', error);
      res.status(500).json({ error: 'Erro ao atualizar post' });
    }
  }

  static async delete(req, res) {
    try {
      if (req.user.tipo === 'user') {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      const { id } = req.params;
      const post = await Post.findById(id);

      if (!post) {
        return res.status(404).json({ error: 'Post não encontrado' });
      }

      await Post.delete(id);

      await Historico.create(req.user.id, 'excluir_post', `Removeu post: ${post.link}`);

      res.json({ message: 'Post excluído com sucesso' });
    } catch (error) {
      console.error('Erro ao excluir post:', error);
      res.status(500).json({ error: 'Erro ao excluir post' });
    }
  }

  static async stats(req, res) {
    try {
      if (req.user.tipo === 'user') {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      const hoje = new Date().toISOString().split('T')[0];
      const totalPosts = await Post.count();
      const postsHoje = await Post.count({ data: hoje });

      res.json({ total: totalPosts, hoje: postsHoje });
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      res.status(500).json({ error: 'Erro ao buscar estatísticas' });
    }
  }
}

module.exports = PostController;
