const db = require('../config/database');

class Conclusao {
  static async findAll(filters = {}) {
    let query = `
      SELECT c.*, 
             u.nome as usuario_nome, u.foto_perfil as usuario_foto,
             t.tipo as tarefa_tipo, t.descricao as tarefa_descricao, t.pontos,
             p.link as post_link, p.caption as post_caption
      FROM conclusoes c 
      LEFT JOIN users u ON c.user_id = u.id 
      LEFT JOIN tarefas t ON c.tarefa_id = t.id 
      LEFT JOIN posts p ON c.post_id = p.id 
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (filters.user_id) {
      query += ` AND c.user_id = $${paramIndex}`;
      params.push(filters.user_id);
      paramIndex++;
    }

    if (filters.tarefa_id) {
      query += ` AND c.tarefa_id = $${paramIndex}`;
      params.push(filters.tarefa_id);
      paramIndex++;
    }

    if (filters.post_id) {
      query += ` AND c.post_id = $${paramIndex}`;
      params.push(filters.post_id);
      paramIndex++;
    }

    if (filters.status) {
      query += ` AND c.status = $${paramIndex}`;
      params.push(filters.status);
      paramIndex++;
    }

    if (filters.data_inicio && filters.data_fim) {
      query += ` AND c.data_conclusao BETWEEN $${paramIndex} AND $${paramIndex + 1}`;
      params.push(filters.data_inicio, filters.data_fim);
      paramIndex += 2;
    }

    query += ' ORDER BY c.data_conclusao DESC';

    if (filters.limit) {
      query += ` LIMIT $${paramIndex}`;
      params.push(filters.limit);
    }

    const result = await db.query(query, params);
    return result.rows;
  }

  static async findById(id) {
    const result = await db.query(
      `SELECT c.*, u.nome as usuario_nome, t.tipo as tarefa_tipo, t.descricao as tarefa_descricao
       FROM conclusoes c 
       LEFT JOIN users u ON c.user_id = u.id 
       LEFT JOIN tarefas t ON c.tarefa_id = t.id 
       WHERE c.id = $1`,
      [id]
    );
    return result.rows[0];
  }

  static async create(conclusaoData) {
    const { user_id, tarefa_id, post_id, tipo, evidencia, status = 'pendente' } = conclusaoData;
    const result = await db.query(
      `INSERT INTO conclusoes (user_id, tarefa_id, post_id, tipo, evidencia, status) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [user_id, tarefa_id, post_id, tipo, evidencia, status]
    );
    return result.rows[0];
  }

  static async updateStatus(id, status, evidencia = null) {
    const query = evidencia 
      ? 'UPDATE conclusoes SET status = $1, evidencia = $2 WHERE id = $3 RETURNING *'
      : 'UPDATE conclusoes SET status = $1 WHERE id = $2 RETURNING *';
    const params = evidencia ? [status, evidencia, id] : [status, id];
    
    const result = await db.query(query, params);
    return result.rows[0];
  }

  static async delete(id) {
    const result = await db.query('DELETE FROM conclusoes WHERE id = $1 RETURNING id', [id]);
    return result.rows[0];
  }

  static async checkExists(user_id, tarefa_id, post_id) {
    const result = await db.query(
      'SELECT id FROM conclusoes WHERE user_id = $1 AND tarefa_id = $2 AND post_id = $3',
      [user_id, tarefa_id, post_id]
    );
    return result.rows[0];
  }

  static async getProgressoDoDia(user_id, data = null) {
    const dataFiltro = data || new Date().toISOString().split('T')[0];
    const result = await db.query(`
      SELECT 
        COUNT(*) as total_tarefas,
        COUNT(*) FILTER (WHERE c.status = 'concluida') as tarefas_concluidas
      FROM conclusoes c
      JOIN posts p ON c.post_id = p.id
      WHERE c.user_id = $1 AND p.data_post = $2
    `, [user_id, dataFiltro]);
    return result.rows[0];
  }

  static async getEstatisticasUsuario(user_id) {
    const result = await db.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'concluida') as concluidas,
        COUNT(*) FILTER (WHERE status = 'rejeitada') as rejeitadas,
        COUNT(*) FILTER (WHERE status = 'pendente') as pendentes
      FROM conclusoes
      WHERE user_id = $1
    `, [user_id]);
    return result.rows[0];
  }

  static async getConclusoesPorUsuario(filters = {}) {
    let query = `
      SELECT 
        u.id, 
        u.nome, 
        u.foto_perfil, 
        u.status,
        u.tipo,
        u.created_at,
        COALESCE(COUNT(c.id) FILTER (WHERE c.status = 'concluida'), 0) as conclusoes_feitas,
        COALESCE(COUNT(c.id), 0) as total_conclusoes
      FROM users u
      LEFT JOIN conclusoes c ON u.id = c.user_id
      WHERE u.tipo IN ('user', 'admin')
    `;
    const params = [];
    let paramIndex = 1;

    if (filters.data_inicio && filters.data_fim) {
      query += ` AND (c.data_conclusao BETWEEN $${paramIndex} AND $${paramIndex + 1} OR c.data_conclusao IS NULL)`;
      params.push(filters.data_inicio, filters.data_fim);
      paramIndex += 2;
    }

    query += ` GROUP BY u.id, u.nome, u.foto_perfil, u.status, u.tipo, u.created_at ORDER BY conclusoes_feitas DESC, u.nome ASC`;

    const result = await db.query(query, params);
    return result.rows;
  }
}

module.exports = Conclusao;
