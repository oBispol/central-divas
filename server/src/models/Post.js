const db = require('../config/database');

class Post {
  static async findAll(filters = {}) {
    let query = `
      SELECT p.*, u.nome as criado_por_nome 
      FROM posts p 
      LEFT JOIN users u ON p.created_by = u.id 
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (filters.data) {
      query += ` AND p.data_post = $${paramIndex}`;
      params.push(filters.data);
      paramIndex++;
    }

    if (filters.data_inicio && filters.data_fim) {
      query += ` AND p.data_post BETWEEN $${paramIndex} AND $${paramIndex + 1}`;
      params.push(filters.data_inicio, filters.data_fim);
      paramIndex += 2;
    }

    query += ' ORDER BY p.created_at DESC';

    if (filters.limit) {
      query += ` LIMIT $${paramIndex}`;
      params.push(filters.limit);
    }

    const result = await db.query(query, params);
    return result.rows;
  }

  static async findById(id) {
    const result = await db.query(
      `SELECT p.*, u.nome as criado_por_nome 
       FROM posts p 
       LEFT JOIN users u ON p.created_by = u.id 
       WHERE p.id = $1`,
      [id]
    );
    return result.rows[0];
  }

  static async create(postData) {
    const { link, instagram_id, caption, data_post, created_by } = postData;
    const result = await db.query(
      `INSERT INTO posts (link, instagram_id, caption, data_post, created_by) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [link, instagram_id, caption, data_post || new Date(), created_by]
    );
    return result.rows[0];
  }

  static async update(id, postData) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    const allowedFields = ['link', 'instagram_id', 'caption', 'data_post'];
    
    for (const field of allowedFields) {
      if (postData[field] !== undefined) {
        fields.push(`${field} = $${paramIndex}`);
        values.push(postData[field]);
        paramIndex++;
      }
    }

    if (fields.length === 0) return null;

    values.push(id);

    const result = await db.query(
      `UPDATE posts SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    return result.rows[0];
  }

  static async delete(id) {
    const result = await db.query('DELETE FROM posts WHERE id = $1 RETURNING id', [id]);
    return result.rows[0];
  }

  static async count(filters = {}) {
    let query = 'SELECT COUNT(*) FROM posts WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (filters.data) {
      query += ` AND data_post = $${paramIndex}`;
      params.push(filters.data);
      paramIndex++;
    }

    const result = await db.query(query, params);
    return parseInt(result.rows[0].count);
  }

  static async getPostsDoDia(data = null) {
    const dataFiltro = data || new Date().toISOString().split('T')[0];
    return this.findAll({ data: dataFiltro });
  }
}

module.exports = Post;
