-- 🆕 Adicionar colunas Level, Tier e Charge à tabela feed_runs

-- Adicionar coluna level
ALTER TABLE feed_runs ADD COLUMN level TEXT DEFAULT 'I';

-- Adicionar coluna tier  
ALTER TABLE feed_runs ADD COLUMN tier TEXT DEFAULT 'I';

-- Adicionar coluna charge
ALTER TABLE feed_runs ADD COLUMN charge INTEGER DEFAULT 0;

-- Verificar estrutura da tabela
.schema feed_runs