const db = require('../config/database');

class Aviso {
  static async findAll(filters = {}) {
    let query = `
      SELECT a.*, u.nome as criado_por_nome 
      FROM avisos a 
      LEFT JOIN users u ON a.created_by = u.id 
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (filters.ativo !== undefined) {
      query += ` AND a.ativo = $${paramIndex}`;
      params.push(filters.ativo);
      paramIndex++;
    }

    query += ' ORDER BY a.created_at DESC';

    if (filters.limit) {
      query += ` LIMIT $${paramIndex}`;
      params.push(filters.limit);
    }

    const result = await db.query(query, params);
    return result.rows;
  }

  static async findById(id) {
    const result = await db.query(
      `SELECT a.*, u.nome as criado_por_nome 
       FROM avisos a 
       LEFT JOIN users u ON a.created_by = u.id 
       WHERE a.id = $1`,
      [id]
    );
    return result.rows[0];
  }

  static async create(avisoData) {
    const { titulo, mensagem, tipo = 'info', ativo = true, created_by } = avisoData;
    const result = await db.query(
      `INSERT INTO avisos (titulo, mensagem, tipo, ativo, created_by) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [titulo, mensagem, tipo, ativo, created_by]
    );
    return result.rows[0];
  }

  static async update(id, avisoData) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    const allowedFields = ['titulo', 'mensagem', 'tipo', 'ativo'];
    
    for (const field of allowedFields) {
      if (avisoData[field] !== undefined) {
        fields.push(`${field} = $${paramIndex}`);
        values.push(avisoData[field]);
        paramIndex++;
      }
    }

    if (fields.length === 0) return null;

    values.push(id);

    const result = await db.query(
      `UPDATE avisos SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    return result.rows[0];
  }

  static async delete(id) {
    const result = await db.query('DELETE FROM avisos WHERE id = $1 RETURNING id', [id]);
    return result.rows[0];
  }

  static async getAtivos() {
    return this.findAll({ ativo: true, limit: 10 });
  }
}

module.exports = Aviso;
