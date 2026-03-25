const db = require('../config/database');

class Historico {
  static async create(userId, acao, descricao) {
    const result = await db.query(
      `INSERT INTO historico (user_id, acao, descricao) VALUES ($1, $2, $3) RETURNING *`,
      [userId, acao, descricao]
    );
    return result.rows[0];
  }

  static async findByUser(userId, limit = 50) {
    const result = await db.query(
      `SELECT * FROM historico WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2`,
      [userId, limit]
    );
    return result.rows;
  }

  static async findAll(filters = {}) {
    let query = `
      SELECT h.*, u.nome as usuario_nome, u.foto_perfil as usuario_foto
      FROM historico h
      LEFT JOIN users u ON h.user_id = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (filters.user_id) {
      query += ` AND h.user_id = $${paramIndex}`;
      params.push(filters.user_id);
      paramIndex++;
    }

    if (filters.data_inicio && filters.data_fim) {
      query += ` AND h.created_at BETWEEN $${paramIndex} AND $${paramIndex + 1}`;
      params.push(filters.data_inicio, filters.data_fim);
      paramIndex += 2;
    }

    query += ' ORDER BY h.created_at DESC';

    if (filters.limit) {
      query += ` LIMIT $${paramIndex}`;
      params.push(filters.limit);
    }

    const result = await db.query(query, params);
    return result.rows;
  }
}

module.exports = Historico;
