-- 🔍 VERIFICAÇÃO E CORREÇÃO DA ESTRUTURA DO BANCO DE DADOS
-- Execute este script no seu banco D1 ou SQLite para verificar a estrutura

-- 1. VERIFICAR ESTRUTURA ATUAL DA TABELA giveaway_participants
PRAGMA table_info(giveaway_participants);

-- 2. VERIFICAR ESTRUTURA ATUAL DA TABELA giveaways
PRAGMA table_info(giveaways);

-- 3. VERIFICAR SE EXISTEM DADOS NAS TABELAS
SELECT COUNT(*) as total_participants FROM giveaway_participants;
SELECT COUNT(*) as total_giveaways FROM giveaways;
SELECT COUNT(*) as total_winners FROM giveaway_participants WHERE is_winner = 1;

-- 4. VERIFICAR GANHADORES COM STATUS DE NOTIFICAÇÃO
SELECT 
  p.id,
  p.user_email,
  p.is_winner,
  p.winner_position,
  p.notified,
  p.notification_method,
  p.notified_at,
  p.claimed,
  p.claimed_at,
  p.shipping_status,
  g.title as giveaway_title
FROM giveaway_participants p
LEFT JOIN giveaways g ON p.giveaway_id = g.id
WHERE p.is_winner = 1
ORDER BY p.winner_announced_at DESC
LIMIT 10;

-- 5. VERIFICAR SE OS CAMPOS DE NOTIFICAÇÃO EXISTEM
SELECT 
  CASE WHEN COUNT(*) > 0 THEN '✅ Campo notified existe' ELSE '❌ Campo notified não existe' END as notified_status,
  CASE WHEN COUNT(*) > 0 THEN '✅ Campo notification_method existe' ELSE '❌ Campo notification_method não existe' END as notification_method_status,
  CASE WHEN COUNT(*) > 0 THEN '✅ Campo notified_at existe' ELSE '❌ Campo notified_at não existe' END as notified_at_status,
  CASE WHEN COUNT(*) > 0 THEN '✅ Campo claimed existe' ELSE '❌ Campo claimed não existe' END as claimed_status,
  CASE WHEN COUNT(*) > 0 THEN '✅ Campo shipping_status existe' ELSE '❌ Campo shipping_status não existe' END as shipping_status_status
FROM (
  SELECT 'notified' as field_name FROM pragma_table_info('giveaway_participants') WHERE name = 'notified'
  UNION ALL
  SELECT 'notification_method' FROM pragma_table_info('giveaway_participants') WHERE name = 'notification_method'
  UNION ALL
  SELECT 'notified_at' FROM pragma_table_info('giveaway_participants') WHERE name = 'notified_at'
  UNION ALL
  SELECT 'claimed' FROM pragma_table_info('giveaway_participants') WHERE name = 'claimed'
  UNION ALL
  SELECT 'shipping_status' FROM pragma_table_info('giveaway_participants') WHERE name = 'shipping_status'
);

-- 6. VERIFICAR ÍNDICES EXISTENTES
SELECT name, sql FROM sqlite_master WHERE type = 'index' AND tbl_name = 'giveaway_participants';

-- 7. VERIFICAR CONSTRAINTS E FOREIGN KEYS
SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'giveaway_participants';

-- 8. VERIFICAR DADOS DE EXEMPLO (se existirem)
SELECT 
  'Dados de exemplo' as info,
  COUNT(*) as total_records,
  COUNT(CASE WHEN is_winner = 1 THEN 1 END) as winners,
  COUNT(CASE WHEN notified = 1 THEN 1 END) as notified_winners,
  COUNT(CASE WHEN claimed = 1 THEN 1 END) as claimed_winners
FROM giveaway_participants;

-- 9. VERIFICAR INTEGRIDADE DOS DADOS
SELECT 
  'Verificação de integridade' as check_type,
  COUNT(*) as total_winners,
  COUNT(CASE WHEN p.giveaway_id IS NULL THEN 1 END) as winners_without_giveaway,
  COUNT(CASE WHEN g.id IS NULL THEN 1 END) as orphaned_winners
FROM giveaway_participants p
LEFT JOIN giveaways g ON p.giveaway_id = g.id
WHERE p.is_winner = 1;

-- 10. RESUMO DA VERIFICAÇÃO
SELECT 
  'RESUMO DA VERIFICAÇÃO' as summary,
  (SELECT COUNT(*) FROM giveaway_participants WHERE is_winner = 1) as total_winners,
  (SELECT COUNT(*) FROM giveaway_participants WHERE is_winner = 1 AND notified = 1) as notified_winners,
  (SELECT COUNT(*) FROM giveaway_participants WHERE is_winner = 1 AND claimed = 1) as claimed_winners,
  (SELECT COUNT(*) FROM giveaway_participants WHERE is_winner = 1 AND shipping_status = 'delivered') as delivered_winners;