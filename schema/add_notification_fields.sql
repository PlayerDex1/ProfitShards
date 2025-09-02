-- Adicionar campos de notificação na tabela giveaway_participants
-- Esta migração adiciona os campos necessários para o sistema de envio de emails

-- Adicionar colunas de notificação
ALTER TABLE giveaway_participants ADD COLUMN notified BOOLEAN DEFAULT FALSE;
ALTER TABLE giveaway_participants ADD COLUMN notification_method TEXT;
ALTER TABLE giveaway_participants ADD COLUMN notified_by TEXT;
ALTER TABLE giveaway_participants ADD COLUMN notified_at TEXT;

-- Adicionar colunas de status de reivindicação
ALTER TABLE giveaway_participants ADD COLUMN claimed BOOLEAN DEFAULT FALSE;
ALTER TABLE giveaway_participants ADD COLUMN claimed_at TEXT;
ALTER TABLE giveaway_participants ADD COLUMN claimed_by TEXT;

-- Adicionar colunas de envio
ALTER TABLE giveaway_participants ADD COLUMN shipping_status TEXT DEFAULT 'pending';
ALTER TABLE giveaway_participants ADD COLUMN tracking_code TEXT;
ALTER TABLE giveaway_participants ADD COLUMN shipped_at TEXT;
ALTER TABLE giveaway_participants ADD COLUMN shipped_by TEXT;

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_participants_notified ON giveaway_participants(notified);
CREATE INDEX IF NOT EXISTS idx_participants_claimed ON giveaway_participants(claimed);
CREATE INDEX IF NOT EXISTS idx_participants_shipping_status ON giveaway_participants(shipping_status);

-- Atualizar registros existentes (opcional)
-- UPDATE giveaway_participants SET notified = FALSE WHERE notified IS NULL;
-- UPDATE giveaway_participants SET claimed = FALSE WHERE claimed IS NULL;
-- UPDATE giveaway_participants SET shipping_status = 'pending' WHERE shipping_status IS NULL;