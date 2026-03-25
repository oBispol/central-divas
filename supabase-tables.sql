-- Tabela de Usuários
CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  senha VARCHAR(255) NOT NULL,
  whatsapp VARCHAR(20),
  foto_perfil TEXT,
  tipo VARCHAR(20) DEFAULT 'usuario',
  status VARCHAR(20) DEFAULT 'ativo',
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Tarefas
CREATE TABLE IF NOT EXISTS tarefas (
  id SERIAL PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  dia_semana INTEGER,
  hora_limite TIME,
  pontos INTEGER DEFAULT 1,
  obrigatoria BOOLEAN DEFAULT true,
  status VARCHAR(20) DEFAULT 'ativa',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Conclusões
CREATE TABLE IF NOT EXISTS conclusoes (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER REFERENCES usuarios(id),
  tarefa_id INTEGER REFERENCES tarefas(id),
  data_conclusao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  observacoes TEXT
);

-- Tabela de Posts
CREATE TABLE IF NOT EXISTS posts (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER REFERENCES usuarios(id),
  conteudo TEXT,
  imagem TEXT,
  data_postagem TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Avisos
CREATE TABLE IF NOT EXISTS avisos (
  id SERIAL PRIMARY KEY,
  titulo VARCHAR(255),
  conteudo TEXT,
  prioridade VARCHAR(20) DEFAULT 'normal',
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Histórico
CREATE TABLE IF NOT EXISTS historico (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER REFERENCES usuarios(id),
  acao VARCHAR(100),
  descricao TEXT,
  data_acao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Daily Status
CREATE TABLE IF NOT EXISTS daily_status (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER REFERENCES usuarios(id),
  data DATE DEFAULT CURRENT_DATE,
  tarefas_concluidas INTEGER DEFAULT 0,
  tarefas_total INTEGER DEFAULT 0,
  pontuacao_dia INTEGER DEFAULT 0,
  penalty_aplicada BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(usuario_id, data)
);

-- Insert tarefas padrão
INSERT INTO tarefas (titulo, descricao, dia_semana, hora_limite, pontos, obrigatoria) VALUES
('Postagem no feed', 'Fazer postagem no feed do dia', 1, '14:00', 1, true),
('Postagem no feed', 'Fazer postagem no feed do dia', 2, '14:00', 1, true),
('Postagem no feed', 'Fazer postagem no feed do dia', 3, '14:00', 1, true),
('Postagem no feed', 'Fazer postagem no feed do dia', 4, '14:00', 1, true),
('Postagem no feed', 'Fazer postagem no feed do dia', 5, '14:00', 1, true)
ON CONFLICT DO NOTHING;

-- Insert aviso inicial
INSERT INTO avisos (titulo, conteudo, prioridade) VALUES
('Bem-vinda ao Central Divas 2.0!', 'Sistema funcionando com sucesso!', 'alta')
ON CONFLICT DO NOTHING;

SELECT 'Tabelas criadas com sucesso!' as resultado;
