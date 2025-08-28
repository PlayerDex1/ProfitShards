-- Tabela para armazenar giveaways
CREATE TABLE IF NOT EXISTS giveaways (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  prize TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft', 'active', 'ended', 'upcoming')),
  max_participants INTEGER,
  current_participants INTEGER DEFAULT 0,
  rules TEXT, -- JSON array
  requirements TEXT, -- JSON array
  winner_announcement TEXT,
  image_url TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_giveaways_status ON giveaways(status);
CREATE INDEX IF NOT EXISTS idx_giveaways_created_at ON giveaways(created_at);
CREATE INDEX IF NOT EXISTS idx_giveaways_end_date ON giveaways(end_date);

-- Tabela para armazenar progresso de missões dos usuários
CREATE TABLE IF NOT EXISTS user_mission_progress (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  giveaway_id TEXT NOT NULL,
  requirement_id TEXT NOT NULL,
  completed_at TEXT NOT NULL,
  verification_method TEXT NOT NULL,
  verification_data TEXT, -- JSON
  points_earned INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  FOREIGN KEY (giveaway_id) REFERENCES giveaways(id) ON DELETE CASCADE,
  UNIQUE(user_id, giveaway_id, requirement_id)
);

-- Índices para progresso de missões
CREATE INDEX IF NOT EXISTS idx_user_mission_user_giveaway ON user_mission_progress(user_id, giveaway_id);
CREATE INDEX IF NOT EXISTS idx_user_mission_giveaway ON user_mission_progress(giveaway_id);
CREATE INDEX IF NOT EXISTS idx_user_mission_completed_at ON user_mission_progress(completed_at);