const db = require('../config/database');

class Tarefa {
  static async findAll(filters = {}) {
    let query = 'SELECT * FROM tarefas WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (filters.ativa !== undefined) {
      query += ` AND ativa = $${paramIndex}`;
      params.push(filters.ativa);
      paramIndex++;
    }

    if (filters.tipo) {
      query += ` AND tipo = $${paramIndex}`;
      params.push(filters.tipo);
      paramIndex++;
    }

    query += ' ORDER BY created_at DESC';

    const result = await db.query(query, params);
    return result.rows;
  }

  static async findById(id) {
    const result = await db.query('SELECT * FROM tarefas WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async create(tarefaData) {
    const { tipo, descricao, pontos = 1, ativa = true } = tarefaData;
    const result = await db.query(
      `INSERT INTO tarefas (tipo, descricao, pontos, ativa) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [tipo, descricao, pontos, ativa]
    );
    return result.rows[0];
  }

  static async update(id, tarefaData) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    const allowedFields = ['tipo', 'descricao', 'pontos', 'ativa'];
    
    for (const field of allowedFields) {
      if (tarefaData[field] !== undefined) {
        fields.push(`${field} = $${paramIndex}`);
        values.push(tarefaData[field]);
        paramIndex++;
      }
    }

    if (fields.length === 0) return null;

    values.push(id);

    const result = await db.query(
      `UPDATE tarefas SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    return result.rows[0];
  }

  static async delete(id) {
    const result = await db.query('DELETE FROM tarefas WHERE id = $1 RETURNING id', [id]);
    return result.rows[0];
  }
}

module.exports = Tarefa;
