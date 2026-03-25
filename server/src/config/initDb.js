const { Pool } = require('pg');
require('dotenv').config();

const initDb = async () => {
  const adminPool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: 'postgres',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });

  try {
    const dbExists = await adminPool.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [process.env.DB_NAME]
    );

    if (dbExists.rows.length === 0) {
      await adminPool.query(`CREATE DATABASE ${process.env.DB_NAME}`);
      console.log(`Database ${process.env.DB_NAME} created successfully`);
    } else {
      console.log(`Database ${process.env.DB_NAME} already exists`);
    }
  } catch (error) {
    console.error('Error creating database:', error);
  } finally {
    await adminPool.end();
  }

  const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });

  const schema = `
    -- Tabela de usuários
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      nome VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      whatsapp VARCHAR(20),
      senha VARCHAR(255) NOT NULL,
      foto_perfil VARCHAR(500),
      tipo VARCHAR(20) DEFAULT 'user' CHECK (tipo IN ('user', 'admin', 'superadmin')),
      status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'ativa', 'inativa', 'bloqueada')),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Tabela de tarefas
    CREATE TABLE IF NOT EXISTS tarefas (
      id SERIAL PRIMARY KEY,
      tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('curtir', 'comentar', 'seguir')),
      descricao TEXT NOT NULL,
      pontos INTEGER DEFAULT 1,
      ativa BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Tabela de posts do dia
    CREATE TABLE IF NOT EXISTS posts (
      id SERIAL PRIMARY KEY,
      link VARCHAR(500) NOT NULL,
      instagram_id VARCHAR(255),
      caption TEXT,
      data_post DATE DEFAULT CURRENT_DATE,
      created_by INTEGER REFERENCES users(id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Tabela de conclusões de tarefas
    CREATE TABLE IF NOT EXISTS conclusoes (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      tarefa_id INTEGER REFERENCES tarefas(id) ON DELETE CASCADE,
      post_id INTEGER REFERENCES posts(id) ON DELETE SET NULL,
      tipo VARCHAR(50) NOT NULL,
      evidencia TEXT,
      status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'concluida', 'rejeitada')),
      data_conclusao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, tarefa_id, post_id)
    );

    -- Tabela de avisos/notificações
    CREATE TABLE IF NOT EXISTS avisos (
      id SERIAL PRIMARY KEY,
      titulo VARCHAR(255) NOT NULL,
      mensagem TEXT NOT NULL,
      tipo VARCHAR(20) DEFAULT 'info' CHECK (tipo IN ('info', 'warning', 'success', 'error')),
      ativo BOOLEAN DEFAULT true,
      created_by INTEGER REFERENCES users(id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Tabela de histórico de atividades
    CREATE TABLE IF NOT EXISTS historico (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      acao VARCHAR(100) NOT NULL,
      descricao TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Tabela de penalidades
    CREATE TABLE IF NOT EXISTS penalidades (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      tipo VARCHAR(50) NOT NULL,
      motivo TEXT,
      pontos INTEGER DEFAULT 0,
      aplicado_por INTEGER REFERENCES users(id),
      ativo BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Tabela de status diário (penalidades)
    CREATE TABLE IF NOT EXISTS daily_status (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      data DATE NOT NULL,
      pendencias INTEGER DEFAULT 0,
      verificado_em TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, data)
    );

    -- Índices para performance
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_tipo ON users(tipo);
    CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
    CREATE INDEX IF NOT EXISTS idx_conclusoes_user ON conclusoes(user_id);
    CREATE INDEX IF NOT EXISTS idx_conclusoes_data ON conclusoes(data_conclusao);
    CREATE INDEX IF NOT EXISTS idx_posts_data ON posts(data_post);
    CREATE INDEX IF NOT EXISTS idx_daily_status_user ON daily_status(user_id);
    CREATE INDEX IF NOT EXISTS idx_daily_status_data ON daily_status(data);
  `;

  try {
    await pool.query(schema);
    console.log('Schema created successfully');

    // Criar Super Admin padrão se não existir
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const superAdminExists = await pool.query(
      "SELECT id FROM users WHERE tipo = 'superadmin' LIMIT 1"
    );

    if (superAdminExists.rows.length === 0) {
      await pool.query(
        `INSERT INTO users (nome, email, senha, tipo, status) 
         VALUES ($1, $2, $3, $4, $5)`,
        ['Administradora', 'admin@divas.com', hashedPassword, 'superadmin', 'ativa']
      );
      console.log('Super Admin created: admin@divas.com / admin123');
    }

    // Criar tarefas padrão se não existirem
    const tarefasExist = await pool.query("SELECT id FROM tarefas LIMIT 1");
    if (tarefasExist.rows.length === 0) {
      await pool.query(`
        INSERT INTO tarefas (tipo, descricao, pontos) VALUES
        ('curtir', 'Curtir o post no Instagram', 1),
        ('comentar', 'Comentar no post do Instagram', 2),
        ('seguir', 'Seguir a conta no Instagram', 1)
      `);
      console.log('Default tasks created');
    }

    console.log('Database initialization completed!');
  } catch (error) {
    console.error('Error initializing schema:', error);
  } finally {
    await pool.end();
  }
};

initDb();
