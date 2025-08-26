-- 🗑️ LIMPEZA COMPLETA DO FEED
-- Remove todos os dados antigos para começar com base limpa

-- Verificar quantidade atual
SELECT COUNT(*) as total_records_before FROM feed_runs;

-- Deletar todos os registros
DELETE FROM feed_runs;

-- Verificar se foi limpo
SELECT COUNT(*) as total_records_after FROM feed_runs;

-- Resetar o auto-increment (opcional)
-- VACUUM; -- Remove espaço vazio da database