const db = require('../config/database');

class Penalidade {
  static async findAll(filters = {}) {
    let query = `
      SELECT p.*, 
             u.nome as usuario_nome, u.foto_perfil as usuario_foto,
             a.nome as aplicado_por_nome
      FROM penalidades p 
      LEFT JOIN users u ON p.user_id = u.id 
      LEFT JOIN users a ON p.aplicado_por = a.id 
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (filters.user_id) {
      query += ` AND p.user_id = $${paramIndex}`;
      params.push(filters.user_id);
      paramIndex++;
    }

    if (filters.ativo !== undefined) {
      query += ` AND p.ativo = $${paramIndex}`;
      params.push(filters.ativo);
      paramIndex++;
    }

    query += ' ORDER BY p.created_at DESC';

    if (filters.limit) {
      query += ` LIMIT $${paramIndex}`;
      params.push(filters.limit);
    }

    const result = await db.query(query, params);
    return result.rows;
  }

  static async create(penalidadeData) {
    const { user_id, tipo, motivo, pontos = 0, aplicado_por, ativo = true } = penalidadeData;
    const result = await db.query(
      `INSERT INTO penalidades (user_id, tipo, motivo, pontos, aplicado_por, ativo) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [user_id, tipo, motivo, pontos, aplicado_por, ativo]
    );
    return result.rows[0];
  }

  static async updateStatus(id, ativo) {
    const result = await db.query(
      'UPDATE penalidades SET ativo = $1 WHERE id = $2 RETURNING *',
      [ativo, id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    const result = await db.query('DELETE FROM penalidades WHERE id = $1 RETURNING id', [id]);
    return result.rows[0];
  }

  static async getTotalPontos(userId) {
    const result = await db.query(
      `SELECT COALESCE(SUM(pontos), 0) as total 
       FROM penalidades 
       WHERE user_id = $1 AND ativo = true`,
      [userId]
    );
    return parseInt(result.rows[0].total);
  }
}

module.exports = Penalidade;
