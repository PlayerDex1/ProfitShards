-- Criar tabela para giveaways compartilhados
CREATE TABLE IF NOT EXISTS giveaways (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  prize TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('draft', 'active', 'ended', 'upcoming')),
  max_participants INTEGER,
  current_participants INTEGER DEFAULT 0,
  rules TEXT, -- JSON array
  requirements TEXT, -- JSON array
  winner_announcement TEXT,
  image_url TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_giveaways_status ON giveaways(status);
CREATE INDEX IF NOT EXISTS idx_giveaways_dates ON giveaways(start_date, end_date);

-- Inserir giveaway padrão
INSERT OR REPLACE INTO giveaways (
  id, title, description, prize, start_date, end_date, status, 
  max_participants, current_participants, rules, requirements,
  winner_announcement, image_url, created_at, updated_at
) VALUES (
  'giveaway_main_2025_01',
  '🎁 Primeiro Giveaway Oficial',
  'Participe do nosso primeiro giveaway oficial e concorra a prêmios incríveis!',
  '1x Game Box + Bonus Items',
  '2025-01-01T00:00:00Z',
  '2025-03-31T23:59:59Z',
  'active',
  1000,
  0,
  '["Apenas uma entrada por pessoa", "Deve ter 18+ anos para participar", "Vencedor será anunciado no Discord", "Prêmio deve ser reclamado em 7 dias"]',
  '[{"id":"daily_login","type":"daily_login","description":"Fazer login diário no site","points":1,"isRequired":true,"url":""},{"id":"calculator_use","type":"calculator_use","description":"Usar a calculadora de lucros","points":2,"isRequired":false,"url":""},{"id":"planner_use","type":"planner_use","description":"Usar o planejador de mapas","points":3,"isRequired":false,"url":""},{"id":"twitter_follow","type":"twitter_follow","description":"Seguir @playerhold no Twitter/X","points":5,"isRequired":true,"url":"https://x.com/playerhold"},{"id":"discord_join","type":"discord_join","description":"Entrar no Discord oficial","points":5,"isRequired":false,"url":"https://discord.gg/VzYJCRke"},{"id":"social_share","type":"social_share","description":"Compartilhar o giveaway nas redes sociais","points":3,"isRequired":false,"url":""}]',
  '2025-02-16T12:00:00Z',
  '',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);