const db = require('../config/database');

class DailyStatus {
  static async findByUserAndDate(userId, data) {
    const result = await db.query(
      'SELECT * FROM daily_status WHERE user_id = $1 AND data = $2',
      [userId, data]
    );
    return result.rows[0];
  }

  static async findByDate(data) {
    const result = await db.query(
      `SELECT ds.*, u.nome, u.foto_perfil, u.status as user_status, u.tipo
       FROM daily_status ds
       JOIN users u ON ds.user_id = u.id
       WHERE ds.data = $1 AND ds.pendencias > 0
       ORDER BY ds.pendencias DESC, u.nome ASC`,
      [data]
    );
    return result.rows;
  }

  static async findByUser(userId, limit = 30) {
    const result = await db.query(
      'SELECT * FROM daily_status WHERE user_id = $1 ORDER BY data DESC LIMIT $2',
      [userId, limit]
    );
    return result.rows;
  }

  static async upsert(userId, data, pendencias = 0) {
    const result = await db.query(
      `INSERT INTO daily_status (user_id, data, pendencias, verificado_em)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
       ON CONFLICT (user_id, data) 
       DO UPDATE SET pendencias = $3, verificado_em = CURRENT_TIMESTAMP
       RETURNING *`,
      [userId, data, pendencias]
    );
    return result.rows[0];
  }

  static async getTotalPendencias(userId) {
    const result = await db.query(
      `SELECT COALESCE(SUM(pendencias), 0) as total 
       FROM daily_status 
       WHERE user_id = $1 AND pendencias > 0`,
      [userId]
    );
    return parseInt(result.rows[0].total);
  }

  static async getTodayStatus(userId) {
    const today = new Date().toISOString().split('T')[0];
    return this.findByUserAndDate(userId, today);
  }

  static async verificarUsuariosInativos() {
    const today = new Date().toISOString().split('T')[0];
    
    const users = await db.query(
      `SELECT u.id, u.nome, u.tipo, u.status,
              (SELECT COUNT(*) FROM posts WHERE data_post = $1) as total_posts,
              (SELECT COUNT(*) FROM conclusoes c 
               JOIN posts p ON c.post_id = p.id 
               WHERE p.data_post = $1 AND c.user_id = u.id AND c.status = 'concluida') as conclusoes_feitas
       FROM users u
       WHERE u.tipo IN ('user') AND u.status = 'ativa'`,
      [today]
    );
    
    const resultados = [];
    
    for (const user of users.rows) {
      const tarefasEsperadas = parseInt(user.total_posts) * 3;
      
      if (tarefasEsperadas > 0 && parseInt(user.conclusoes_feitas) < tarefasEsperadas) {
        await this.upsert(user.id, today, 1);
        resultados.push({ user_id: user.id, nome: user.nome, pendencias: 1 });
      } else {
        await this.upsert(user.id, today, 0);
      }
    }
    
    return resultados;
  }

  static async limparDiasAnteriores(dias = 60) {
    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() - dias);
    const dataLimiteStr = dataLimite.toISOString().split('T')[0];
    
    const result = await db.query(
      'DELETE FROM daily_status WHERE data < $1',
      [dataLimiteStr]
    );
    return result.rowCount;
  }
}

module.exports = DailyStatus;
