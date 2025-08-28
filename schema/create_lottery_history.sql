-- Tabela de histórico de sorteios
CREATE TABLE IF NOT EXISTS lottery_history (
  id TEXT PRIMARY KEY,
  giveaway_id TEXT NOT NULL,
  giveaway_title TEXT NOT NULL,
  total_participants INTEGER NOT NULL,
  winners_count INTEGER NOT NULL,
  winners_data TEXT NOT NULL, -- JSON com dados dos ganhadores
  drawn_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  drawn_by TEXT, -- ID do admin que fez o sorteio
  notes TEXT, -- Notas opcionais sobre o sorteio
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  -- Referência ao giveaway
  FOREIGN KEY (giveaway_id) REFERENCES giveaways(id) ON DELETE CASCADE
);