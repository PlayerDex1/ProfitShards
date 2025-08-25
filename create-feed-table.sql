-- 📊 TABELA ESPECÍFICA PARA O FEED DE ATIVIDADE
-- Estrutura simples e dedicada apenas para exibir runs no feed

CREATE TABLE IF NOT EXISTS feed_runs (
  id TEXT PRIMARY KEY,
  user_email TEXT,
  map_name TEXT NOT NULL,
  luck INTEGER DEFAULT 0,
  tokens INTEGER NOT NULL,
  efficiency REAL DEFAULT 0,
  created_at INTEGER NOT NULL
);

-- Índice para ordenação por data (mais recente primeiro)
CREATE INDEX IF NOT EXISTS idx_feed_runs_created_at ON feed_runs(created_at DESC);

-- Índice para limpeza de dados antigos
CREATE INDEX IF NOT EXISTS idx_feed_runs_cleanup ON feed_runs(created_at);

-- Inserir alguns dados de exemplo para teste
INSERT OR IGNORE INTO feed_runs (id, user_email, map_name, luck, tokens, efficiency, created_at) VALUES
('demo_1', 'demo@example.com', 'Medium Map', 1250, 185, 0.148, strftime('%s', 'now', '-3 minutes') * 1000),
('demo_2', 'demo@example.com', 'Large Map', 2100, 420, 0.200, strftime('%s', 'now', '-8 minutes') * 1000),
('demo_3', 'demo@example.com', 'XLarge Map', 3800, 750, 0.197, strftime('%s', 'now', '-15 minutes') * 1000);