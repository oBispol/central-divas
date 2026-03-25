const db = require('../config/database');

class User {
  static async findAll(filters = {}) {
    let query = 'SELECT id, nome, email, whatsapp, foto_perfil, tipo, status, created_at FROM users WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (filters.tipo) {
      query += ` AND tipo = $${paramIndex}`;
      params.push(filters.tipo);
      paramIndex++;
    }

    if (filters.status) {
      query += ` AND status = $${paramIndex}`;
      params.push(filters.status);
      paramIndex++;
    }

    if (filters.search) {
      query += ` AND (nome ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`;
      params.push(`%${filters.search}%`);
      paramIndex++;
    }

    query += ' ORDER BY created_at DESC';

    if (filters.limit) {
      query += ` LIMIT $${paramIndex}`;
      params.push(filters.limit);
    }

    const result = await db.query(query, params);
    return result.rows;
  }

  static async findById(id) {
    const result = await db.query(
      'SELECT id, nome, email, whatsapp, foto_perfil, tipo, status, created_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  static async findByEmail(email) {
    const result = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0];
  }

  static async create(userData) {
    const { nome, email, whatsapp, senha, foto_perfil, tipo = 'user', status = 'pendente' } = userData;
    const result = await db.query(
      `INSERT INTO users (nome, email, whatsapp, senha, foto_perfil, tipo, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING id, nome, email, whatsapp, foto_perfil, tipo, status, created_at`,
      [nome, email, whatsapp, senha, foto_perfil, tipo, status]
    );
    return result.rows[0];
  }

  static async update(id, userData) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    const allowedFields = ['nome', 'whatsapp', 'foto_perfil', 'status', 'tipo'];
    
    for (const field of allowedFields) {
      if (userData[field] !== undefined) {
        fields.push(`${field} = $${paramIndex}`);
        values.push(userData[field]);
        paramIndex++;
      }
    }

    if (fields.length === 0) return null;

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await db.query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramIndex} 
       RETURNING id, nome, email, whatsapp, foto_perfil, tipo, status, created_at`,
      values
    );
    return result.rows[0];
  }

  static async updatePassword(id, newPassword) {
    const result = await db.query(
      'UPDATE users SET senha = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id',
      [newPassword, id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    const result = await db.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
    return result.rows[0];
  }

  static async count(filters = {}) {
    let query = 'SELECT COUNT(*) FROM users WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (filters.tipo) {
      query += ` AND tipo = $${paramIndex}`;
      params.push(filters.tipo);
      paramIndex++;
    }

    if (filters.status) {
      query += ` AND status = $${paramIndex}`;
      params.push(filters.status);
      paramIndex++;
    }

    const result = await db.query(query, params);
    return parseInt(result.rows[0].count);
  }

  static async getStats() {
    const result = await db.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'ativa') as ativas,
        COUNT(*) FILTER (WHERE status = 'pendente') as pendentes,
        COUNT(*) FILTER (WHERE tipo = 'admin') as admins,
        COUNT(*) FILTER (WHERE tipo = 'user') as usuarias
      FROM users
    `);
    return result.rows[0];
  }
}

module.exports = User;
