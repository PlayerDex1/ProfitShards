-- Tabela de participantes dos giveaways
CREATE TABLE IF NOT EXISTS giveaway_participants (
  id TEXT PRIMARY KEY,
  giveaway_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  user_email TEXT,
  participated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  total_points INTEGER DEFAULT 0,
  completed_requirements TEXT DEFAULT '[]',
  is_winner BOOLEAN DEFAULT FALSE,
  winner_position INTEGER,
  winner_announced_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  -- Evitar participação duplicada
  UNIQUE(giveaway_id, user_id),
  
  -- Referência ao giveaway (opcional, sem FK rígida)
  FOREIGN KEY (giveaway_id) REFERENCES giveaways(id) ON DELETE CASCADE
);